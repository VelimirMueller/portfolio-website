import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { parseContactPayload } from './validation';
import { checkContactRateLimit } from './rateLimit';

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkContactRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const parsed = parseContactPayload(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { name, email, message, hCaptchaToken } = parsed.data;

    // Verify hCaptcha token server-side
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret || secret === 'YOUR_HCAPTCHA_SECRET') {
      return NextResponse.json(
        { error: 'hCaptcha not configured' },
        { status: 500 }
      );
    }

    const sitekey = process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY;
    const verifyResponse = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        response: hCaptchaToken,
        secret,
        ...(sitekey ? { sitekey } : {}),
      }).toString(),
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
      console.error('hCaptcha verification failed:', verifyResult['error-codes']);
      return NextResponse.json(
        { error: 'Captcha verification failed' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.from('contact_messages').insert([
      { name, email, message },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
