import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { name, email, message, hCaptchaToken } = await request.json();

    if (!name || !email || !message || !hCaptchaToken) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify hCaptcha token server-side
    const secret = process.env.HCAPTCHA_SECRET;
    if (!secret || secret === 'YOUR_HCAPTCHA_SECRET') {
      return NextResponse.json(
        { error: 'hCaptcha not configured' },
        { status: 500 }
      );
    }

    const verifyResponse = await fetch('https://api.hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `response=${hCaptchaToken}&secret=${secret}`,
    });

    const verifyResult = await verifyResponse.json();

    if (!verifyResult.success) {
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
