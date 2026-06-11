/**
 * Single source of truth for the public site origin. Every absolute URL the
 * app emits (metadataBase, canonicals, sitemap, robots, JSON-LD) derives from
 * here — never hardcode a domain elsewhere.
 *
 * Set NEXT_PUBLIC_SITE_URL to override (e.g. on preview deployments).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.velimir-mueller.de'
).replace(/\/$/, '');

export function localeUrl(locale: string, path: string = ''): string {
  return `${SITE_URL}/${locale}${path}`;
}
