/** @jest-environment node */
import { NextRequest } from 'next/server';

// Drive the cookie adapter the way @supabase/ssr does when it refreshes a session.
type CookieAdapter = {
  getAll: () => { name: string; value: string }[];
  setAll: (c: { name: string; value: string; options?: Record<string, unknown> }[]) => void;
};
let onCreate: (cookies: CookieAdapter) => Promise<{ data: { user: unknown } }>;
jest.mock('@supabase/ssr', () => ({
  createServerClient: (_url: string, _key: string, { cookies }: { cookies: CookieAdapter }) => ({
    auth: { getUser: () => onCreate(cookies) },
  }),
}));

import { updateSession } from '../middleware';

describe('updateSession cookie refresh', () => {
  const env = process.env;
  beforeEach(() => {
    process.env = { ...env, NEXT_PUBLIC_SUPABASE_URL: 'https://p.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'pk' };
  });
  afterAll(() => {
    process.env = env;
  });

  it('reads the request cookies and writes refreshed ones to the request and the response', async () => {
    const request = new NextRequest('https://example.test/admin', { headers: { cookie: 'sb-old=1' } });
    let seen: { name: string; value: string }[] = [];
    onCreate = async (cookies) => {
      seen = cookies.getAll();
      cookies.setAll([{ name: 'sb-token', value: 'fresh', options: { httpOnly: true, path: '/' } }]);
      return { data: { user: { id: 'u1' } } };
    };

    const { response, user } = await updateSession(request);

    expect(seen).toEqual([{ name: 'sb-old', value: '1' }]);
    expect(user).toEqual({ id: 'u1' });
    expect(request.cookies.get('sb-token')?.value).toBe('fresh');
    const set = response.cookies.get('sb-token');
    expect(set?.value).toBe('fresh');
    expect(set?.httpOnly).toBe(true);
  });

  it('counts an auth error as signed out', async () => {
    onCreate = async () => {
      throw new Error('auth server down');
    };
    const { user } = await updateSession(new NextRequest('https://example.test/admin'));
    expect(user).toBeNull();
  });
});
