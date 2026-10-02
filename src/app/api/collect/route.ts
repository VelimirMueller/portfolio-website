import { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/config/site';
import { createRateLimiter } from '../contact/rateLimit';
import { browserOf, countryOf, deviceOf, isAdminSession, isBot, optedOut, parseBeacon } from './parse';

/** A busy reader clicks a lot; a script hammering the endpoint does not get far. */
const checkCollectRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 120, maxKeys: 2000 });

const OWN_HOST = new URL(SITE_URL).hostname;

/**
 * Always 204: the beacon is fire-and-forget, and the answer must not tell a
 * caller whether an event was stored, skipped or rejected.
 */
const done = () => new Response(null, { status: 204 });

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  const secret = process.env.ANALYTICS_INGEST_SECRET;
  if (!url || !key || !secret) return done();

  const userAgent = request.headers.get('user-agent') ?? '';
  if (isBot(userAgent) || optedOut(request.headers)) return done();
  if (isAdminSession(request.cookies.getAll().map((c) => c.name))) return done();

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '';
  if (!ip || !checkCollectRateLimit(ip)) return done();

  let body: unknown;
  try {
    // sendBeacon posts text/plain, so parse the text rather than trust the content type.
    body = JSON.parse(await request.text());
  } catch {
    return done();
  }
  const event = parseBeacon(body, OWN_HOST);
  if (!event) return done();

  const supabase = createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.rpc('record_analytics_event', {
    p_secret: secret,
    p_ip: ip,
    p_user_agent: userAgent,
    p_type: event.type,
    p_path: event.path,
    p_prev_path: event.prevPath,
    p_referrer: event.referrer,
    p_target: event.target,
    p_country: countryOf(request.headers.get('x-vercel-ip-country')),
    p_device: deviceOf(userAgent),
    p_browser: browserOf(userAgent),
  });
  if (error) console.error('analytics: record_analytics_event failed:', error.message);

  return done();
}
