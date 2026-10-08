import { requireAdmin } from '@/app/admin/_lib/auth';
import {
  IMAGE_KEY,
  IMAGE_ORIGIN,
  MAX_IMAGE_BYTES,
  fromByteaHex,
  toByteaHex,
} from '@/app/admin/_lib/magic/imageCache';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png']);

/** Scryfall image paths are versioned by card id; the bytes never change. */
const image = (bytes: Uint8Array, contentType: string, cache: 'HIT' | 'MISS') =>
  // Exact-size copy: a Buffer is often a view into Node's shared 8 KB pool,
  // and Buffer#slice() does not copy, so `.buffer` would send the whole pool.
  new Response(new Uint8Array(bytes).buffer as ArrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Image-Cache': cache,
    },
  });

/**
 * Card image, first from public.mtg_image_cache; on a miss fetched once from
 * Scryfall's CDN and stored. Admin-only like every /admin route (and RLS).
 */
export async function GET(_request: Request, { params }: { params: { key: string[] } }) {
  const { supabase } = await requireAdmin();
  const key = params.key.join('/');
  if (!IMAGE_KEY.test(key)) return new Response('Not found', { status: 404 });

  const cached = await supabase.from('mtg_image_cache').select('content_type, bytes').eq('key', key).maybeSingle();
  if (cached.data) return image(fromByteaHex(cached.data.bytes), cached.data.content_type, 'HIT');

  // Only this fixed host and a validated path: no open proxy.
  const upstream = await fetch(`${IMAGE_ORIGIN}/${key}.jpg`, {
    headers: { 'User-Agent': 'velimir-portfolio/1.0 (admin magic)' },
    cache: 'no-store',
  }).catch(() => null);
  const contentType = upstream?.headers.get('content-type')?.split(';')[0] ?? '';
  if (!upstream?.ok || !ALLOWED_TYPES.has(contentType)) {
    return new Response('Image unavailable', { status: 502 });
  }
  const bytes = new Uint8Array(await upstream.arrayBuffer());
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) {
    return new Response('Image unavailable', { status: 502 });
  }

  // A failed store only costs a refetch next time; the image is still served.
  // ignoreDuplicates: two first views at once both store, the second is a no-op.
  const stored = await supabase
    .from('mtg_image_cache')
    .upsert({ key, content_type: contentType, bytes: toByteaHex(bytes) }, { onConflict: 'key', ignoreDuplicates: true });
  if (stored.error) console.error('[admin] card image not cached:', key, stored.error.code);

  return image(bytes, contentType, 'MISS');
}
