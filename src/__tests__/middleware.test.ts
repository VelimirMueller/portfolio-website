/** @jest-environment node */
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_USER_ID } from '@/config/admin';

const intl = jest.fn((_req: unknown) => NextResponse.next());
jest.mock('next-intl/middleware', () => () => (req: unknown) => intl(req));
jest.mock('../i18n/routing', () => ({ routing: {} }));

let user: { id: string } | null = null;
const passThrough = NextResponse.next();
jest.mock('../utils/supabase/middleware', () => ({
  updateSession: jest.fn(async () => ({ response: passThrough, user })),
}));

import middleware from '../middleware';

const run = (path: string) => middleware(new NextRequest(new URL(path, 'https://example.test')));

beforeEach(() => {
  user = null;
  intl.mockClear();
});

describe('middleware', () => {
  it('redirects a signed-out visitor from /admin to the login page', async () => {
    const res = await run('/admin');
    expect(res.headers.get('location')).toBe('https://example.test/admin/login');
  });

  it('redirects a signed-in user who is not the admin', async () => {
    user = { id: 'someone-else' };
    const res = await run('/admin/11111111-1111-4111-8111-111111111111');
    expect(res.headers.get('location')).toBe('https://example.test/admin/login');
  });

  it('lets the admin through', async () => {
    user = { id: ADMIN_USER_ID };
    expect(await run('/admin')).toBe(passThrough);
  });

  it.each(['/admin/login', '/admin/auth/callback'])('keeps %s public', async (path) => {
    expect(await run(path)).toBe(passThrough);
  });

  it('does not make lookalikes of the public paths public', async () => {
    const res = await run('/admin/login-anything');
    expect(res.headers.get('location')).toBe('https://example.test/admin/login');
  });

  it('does not treat lookalike paths as admin', async () => {
    await run('/administrator');
    expect(intl).toHaveBeenCalled();
  });

  it('hands every other path to next-intl', async () => {
    await run('/de/about');
    expect(intl).toHaveBeenCalled();
  });
});
