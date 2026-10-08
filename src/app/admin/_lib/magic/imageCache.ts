// Card images are served same-origin from /admin/magic/img/<key>, cached in
// public.mtg_image_cache on first view (see the route handler).

/** Scryfall image path without host, query and extension. */
export const IMAGE_KEY = /^(small|normal|large)\/(front|back)\/[0-9a-f]\/[0-9a-f]\/[0-9a-f-]{36}$/;
export const IMAGE_ROUTE = '/admin/magic/img';
export const IMAGE_ORIGIN = 'https://cards.scryfall.io';
export const MAX_IMAGE_BYTES = 2_000_000;

/**
 * Scryfall CDN URL -> our cached route, at the wanted size.
 * "https://cards.scryfall.io/normal/front/1/4/<id>.jpg?123" + "small"
 *   -> "/admin/magic/img/small/front/1/4/<id>"
 * The path has no dot, so the admin middleware still guards it. Scryfall's
 * small/normal/large images are always .jpg (only its "png" size is PNG).
 */
export function cachedImagePath(url: string | null, size: 'small' | 'normal' | 'large'): string | null {
  const m = url?.match(/^https:\/\/cards\.scryfall\.io\/[a-z_]+\/(front|back)\/([0-9a-f])\/([0-9a-f])\/([0-9a-f-]{36})\.jpg/);
  return m ? `${IMAGE_ROUTE}/${size}/${m[1]}/${m[2]}/${m[3]}/${m[4]}` : null;
}

/** bytea travels through PostgREST as hex text: "\x…". */
export const toByteaHex = (bytes: Uint8Array) => `\\x${Buffer.from(bytes).toString('hex')}`;
export const fromByteaHex = (hex: string) => Buffer.from(hex.replace(/^\\x/, ''), 'hex');
