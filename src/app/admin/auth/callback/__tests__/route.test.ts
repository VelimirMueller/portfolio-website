/** @jest-environment node */
import { NextRequest } from 'next/server';

jest.mock('next/headers', () => ({ cookies: jest.fn(async () => ({})) }));
const exchangeCodeForSession = jest.fn();
jest.mock('@/utils/supabase/server', () => ({
  createClient: () => ({ auth: { exchangeCodeForSession } }),
}));

import { GET } from '../route';

const call = (qs: string) => GET(new NextRequest(`https://example.test/admin/auth/callback${qs}`));

describe('GET /admin/auth/callback', () => {
  it('sends the admin to the inbox after a valid code', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });
    const res = await call('?code=abc');
    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
    expect(res.headers.get('location')).toBe('https://example.test/admin');
  });

  it('returns to login with an error for a rejected code', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error('expired') });
    const res = await call('?code=old');
    expect(res.headers.get('location')).toBe('https://example.test/admin/login?error=1');
  });

  it('returns to login with an error when the code is missing', async () => {
    const res = await call('');
    expect(res.headers.get('location')).toBe('https://example.test/admin/login?error=1');
  });
});
