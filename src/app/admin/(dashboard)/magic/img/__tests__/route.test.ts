/**
 * @jest-environment node
 */
let cachedRow: { content_type: string; bytes: string } | null = null;
let storeError: unknown = null;
const upsert = jest.fn(async (..._a: unknown[]) => ({ error: storeError }));
const query = {
  select: () => query,
  eq: () => query,
  maybeSingle: async () => ({ data: cachedRow, error: null }),
  upsert,
};
jest.mock('@/app/admin/_lib/auth', () => ({
  requireAdmin: async () => ({ supabase: { from: () => query }, user: { id: 'admin' } }),
}));

import { GET } from '../[...key]/route';

const KEY = 'small/front/1/4/145b928d-a7ff-4fe5-ae4d-bbae7b1d955b';
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const call = (key: string) => GET(new Request(`http://x/admin/magic/img/${key}`), { params: { key: key.split('/') } });
const upstream = (body: Uint8Array, init: { status?: number; type?: string } = {}) =>
  new Response(body.slice().buffer as ArrayBuffer, { status: init.status ?? 200, headers: { 'content-type': init.type ?? 'image/jpeg' } });

let fetchMock: jest.SpyInstance;
beforeEach(() => {
  cachedRow = null;
  storeError = null;
  upsert.mockClear();
  fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(upstream(JPEG));
});
afterEach(() => fetchMock.mockRestore());

describe('card image route', () => {
  it('serves a cached image without asking Scryfall', async () => {
    cachedRow = { content_type: 'image/jpeg', bytes: '\\xffd8ffe0010203' };
    const res = await call(KEY);
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Image-Cache')).toBe('HIT');
    expect(res.headers.get('Cache-Control')).toContain('immutable');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(JPEG);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fetches a new image once from Scryfall and stores it', async () => {
    const res = await call(KEY);
    expect(res.headers.get('X-Image-Cache')).toBe('MISS');
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(JPEG);
    expect(fetchMock).toHaveBeenCalledWith(`https://cards.scryfall.io/${KEY}.jpg`, expect.objectContaining({ cache: 'no-store' }));
    expect(upsert).toHaveBeenCalledWith(
      { key: KEY, content_type: 'image/jpeg', bytes: '\\xffd8ffe0010203' },
      { onConflict: 'key', ignoreDuplicates: true }
    );
  });

  it('still serves the image when storing it fails', async () => {
    storeError = { code: '42501' };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await call(KEY);
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it.each([
    'small/front/1/4/../../etc/passwd',
    'huge/front/1/4/145b928d-a7ff-4fe5-ae4d-bbae7b1d955b',
    'small/front/1/4/145b928d.jpg',
    'evil.example.com/x',
  ])('refuses a path that is not a Scryfall image key: %s', async (key) => {
    const res = await call(key);
    expect(res.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('answers 502 and stores nothing when Scryfall fails or sends no image', async () => {
    fetchMock.mockResolvedValueOnce(upstream(JPEG, { status: 404 }));
    expect((await call(KEY)).status).toBe(502);
    fetchMock.mockResolvedValueOnce(upstream(JPEG, { type: 'text/html' }));
    expect((await call(KEY)).status).toBe(502);
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    expect((await call(KEY)).status).toBe(502);
    fetchMock.mockResolvedValueOnce(upstream(new Uint8Array(2_000_001)));
    expect((await call(KEY)).status).toBe(502);
    expect(upsert).not.toHaveBeenCalled();
  });
});
