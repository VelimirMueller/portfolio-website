import { NextRequest } from 'next/server';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/config/site';
import { createRateLimiter } from '../contact/rateLimit';
import { browserOf, countryOf, deviceOf, isAdminSession, isBot, optedOut, parseBeacon } from './parse';

/**
 * Generous for a busy reader. Per server instance (in memory), so it blunts
 * bursts from one client rather than enforcing a global quota.
 */
const checkCollectRateLimit = createRateLimiter({ windowMs: 60 * 1000, max: 120, maxKeys: 2000 });

const OWN_HOST = new URL(SITE_URL).hostname;

/** The database call is best-effort; never hold a beacon request longer than this. */
const RPC_TIMEOUT_MS = 3000;

let client: { key: string; supabase: SupabaseClient } | null = null;

/** One stateless client per instance, rebuilt only if the env changes. */
function getClient(url: string, key: string): SupabaseClient {
  const cacheKey = `${url}|${key}`;
  if (client?.key !== cacheKey) {
    client = {
      key: cacheKey,
      supabase: createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }),
    };
  }
  return client.supabase;
}

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

  // On Vercel, request.ip and these headers come from the platform edge, which
  // overwrites client-sent values — so neither the rate limit nor the visitor
  // hash can be steered by a forged header in production.
  const ip =
    request.ip ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
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

  const { error } = await getClient(url, key)
    .rpc('record_analytics_event', {
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
    })
    .abortSignal(AbortSignal.timeout(RPC_TIMEOUT_MS))
    // A timeout or network failure must not turn the beacon into a 500.
    .then(
      (result) => result,
      (thrown: unknown) => ({ error: { code: undefined, message: thrown instanceof Error ? thrown.name : 'rejected' } })
    );
  if (error) console.error('analytics: record_analytics_event failed:', error.code ?? error.message);

  return done();
}
