import { z } from 'zod';

/**
 * Wire format of one analytics beacon. Keys are short because the client
 * sends one per page view and per click.
 *   t = type · p = path · v = previous path · r = referrer · e = click target
 */
const beaconSchema = z.object({
  t: z.enum(['pageview', 'click']),
  p: z.string().min(1).max(2000),
  v: z.string().max(2000).optional(),
  r: z.string().max(2000).optional(),
  e: z.string().max(500).optional(),
});

export interface AnalyticsEvent {
  type: 'pageview' | 'click';
  path: string;
  prevPath: string | null;
  referrer: string | null;
  target: string | null;
}

/**
 * Path only, never the query or fragment: those can carry personal data
 * (search terms, tokens, prefilled emails) and are not needed for KPIs.
 */
export function normalizePath(raw: string): string | null {
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  const path = raw.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return path.slice(0, 300);
}

/**
 * Referrer as a bare host ("google.com"), or a campaign name ("newsletter")
 * when the client found a utm_source. Internal referrers are dropped: moving
 * between own pages is already recorded as prev_path.
 */
export function normalizeReferrer(raw: string | undefined, ownHost: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  let host: string;
  try {
    host = new URL(value).hostname;
  } catch {
    // Not a URL: a utm_source value. Keep it short and boring.
    const campaign = value.toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 60);
    return campaign || null;
  }
  host = host.toLowerCase().replace(/^www\./, '');
  if (!host) return null;
  if (ownHost && host === ownHost.toLowerCase().replace(/^www\./, '')) return null;
  return host.slice(0, 200);
}

/** Click labels are produced by describeClickTarget(); trim and cap them again on the server. */
function normalizeTarget(raw: string | undefined): string | null {
  const value = raw?.replace(/\s+/g, ' ').trim();
  return value ? value.slice(0, 120) : null;
}

export function parseBeacon(body: unknown, ownHost: string | null): AnalyticsEvent | null {
  const parsed = beaconSchema.safeParse(body);
  if (!parsed.success) return null;
  const { t, p, v, r, e } = parsed.data;

  const path = normalizePath(p);
  if (!path) return null;
  const prevPath = v ? normalizePath(v) : null;
  const target = t === 'click' ? normalizeTarget(e) : null;
  if (t === 'click' && !target) return null;

  return {
    type: t,
    path,
    prevPath,
    referrer: t === 'pageview' ? normalizeReferrer(r, ownHost) : null,
    target,
  };
}

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|curl|wget|python|axios|node-fetch|go-http|java\/|monitor|uptime|scan/i;

export function isBot(userAgent: string): boolean {
  return !userAgent || BOT_UA.test(userAgent);
}

export function deviceOf(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(userAgent)) return 'tablet';
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

/** Order matters: Edge and Opera also say "Chrome", Chrome also says "Safari". */
export function browserOf(userAgent: string): string {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/OPR\/|Opera/.test(userAgent)) return 'Opera';
  if (/SamsungBrowser/.test(userAgent)) return 'Samsung Internet';
  if (/Firefox\/|FxiOS/.test(userAgent)) return 'Firefox';
  if (/Chrome\/|CriOS/.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent)) return 'Safari';
  return 'Other';
}

/** Vercel's geo header is a two-letter country code; anything not shaped like one is ignored. */
export function countryOf(header: string | null): string | null {
  const code = header?.trim().toUpperCase();
  return code && /^[A-Z]{2}$/.test(code) ? code : null;
}

/**
 * Visitors who asked not to be tracked (Do Not Track, Global Privacy Control)
 * are not counted at all — the client skips them too; this is the backstop.
 */
export function optedOut(headers: Headers): boolean {
  return headers.get('dnt') === '1' || headers.get('sec-gpc') === '1';
}

/**
 * The site owner's own visits while signed in to /admin are not counted.
 * Only the cookie name is checked (no network call per beacon). A visitor who
 * fakes such a cookie only removes their own events — the same effect as
 * Do Not Track — so this is an accepted opt-out, not a hole.
 */
export function isAdminSession(cookieNames: string[]): boolean {
  return cookieNames.some((name) => name.startsWith('sb-') && name.includes('-auth-token'));
}
