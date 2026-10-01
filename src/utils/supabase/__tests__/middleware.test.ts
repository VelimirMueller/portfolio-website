/** @jest-environment node */
import { NextRequest } from 'next/server';
import { updateSession } from '../middleware';

const request = () => new NextRequest('https://example.test/admin');

describe('updateSession', () => {
  const env = process.env;
  afterEach(() => {
    process.env = env;
  });

  it('counts a missing Supabase config as signed out instead of throwing', async () => {
    process.env = { ...env };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    const { user, response } = await updateSession(request());
    expect(user).toBeNull();
    expect(response.status).toBe(200);
  });

  it('returns no user when there is no session cookie', async () => {
    process.env = {
      ...env,
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'dummy',
    };
    const { user } = await updateSession(request());
    expect(user).toBeNull();
  });
});
