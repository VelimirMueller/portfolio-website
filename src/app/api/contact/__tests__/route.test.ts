/** @jest-environment node */
import { NextRequest } from 'next/server';

const insert = jest.fn();
const createClient = jest.fn((..._args: unknown[]) => ({ from: () => ({ insert }) }));
jest.mock('@supabase/supabase-js', () => ({ createClient: (...args: unknown[]) => createClient(...args) }));

import { POST } from '../route';

let ip = 0;
const send = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new NextRequest('https://www.velimir-mueller.de/api/contact', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': `10.2.0.${++ip}`, ...headers },
    })
  );
const valid = { name: 'Jane Doe', email: 'jane@example.com', message: 'Hello, I would like to work with you.', hCaptchaToken: 'tok' };

describe('POST /api/contact', () => {
  const env = process.env;
  beforeEach(() => {
    insert.mockReset().mockResolvedValue({ error: null });
    createClient.mockClear();
    process.env = { ...env, HCAPTCHA_SECRET: 'secret', NEXT_PUBLIC_SUPABASE_URL: 'https://p.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'pk' };
    global.fetch = jest.fn(async () => ({ json: async () => ({ success: true }) })) as unknown as typeof fetch;
  });
  afterAll(() => {
    process.env = env;
  });

  it('inserts as an anonymous visitor even when the admin session cookie is present', async () => {
    const res = await send(valid, { cookie: 'sb-zkvp-auth-token=eyJhbGciOi' });
    expect(res.status).toBe(200);
    expect(createClient).toHaveBeenCalledWith('https://p.supabase.co', 'pk', expect.objectContaining({ auth: expect.objectContaining({ persistSession: false }) }));
    // A cookie-free client: the options carry no cookie adapter.
    expect(JSON.stringify(createClient.mock.calls[0][2])).not.toContain('cookies');
    expect(insert).toHaveBeenCalledWith([{ name: 'Jane Doe', email: 'jane@example.com', message: valid.message }]);
  });

  it('rejects a failed captcha without inserting', async () => {
    global.fetch = jest.fn(async () => ({ json: async () => ({ success: false, 'error-codes': ['invalid'] }) })) as unknown as typeof fetch;
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await send(valid);
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('answers 500 when the insert fails', async () => {
    insert.mockResolvedValue({ error: { code: '42501', message: 'new row violates row-level security policy' } });
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = await send(valid);
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});
