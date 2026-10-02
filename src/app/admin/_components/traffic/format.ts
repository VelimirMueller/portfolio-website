import { DIRECT } from '../../_lib/traffic';

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat('en');

/** 1234 → "1,234", 12345 → "12.3K". */
export function formatCount(n: number): string {
  return Math.abs(n) >= 10_000 ? compact.format(n) : plain.format(Math.round(n));
}

/** 75 → "1m 15s", 3700 → "1h 1m". */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

/** Short relative time for the live feed: "now", "42s", "5m", "3h", "2d". */
export function formatAgo(iso: string, now: number = Date.now()): string {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (s < 10) return 'now';
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86_400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86_400)}d`;
}

/** ISO country code → flag emoji ("DE" → 🇩🇪); empty for unknown. */
export function flagOf(country: string | null): string {
  if (!country || !/^[A-Z]{2}$/.test(country)) return '';
  return String.fromCodePoint(...[...country].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

export function countryName(code: string): string {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

export function sourceLabel(source: string): string {
  return source === DIRECT ? 'Direct / none' : source;
}

/**
 * Click targets come as "hero:contact", "link:/de/about", "button:Send".
 * Split into a kind and a readable name for the leaderboard.
 */
export function splitTarget(target: string): { kind: string; name: string } {
  const i = target.indexOf(':');
  if (i <= 0) return { kind: 'element', name: target };
  return { kind: target.slice(0, i), name: target.slice(i + 1) };
}

export function trendText(trend: number | null): string {
  if (trend === null) return '—';
  return `${trend > 0 ? '+' : ''}${trend}%`;
}
