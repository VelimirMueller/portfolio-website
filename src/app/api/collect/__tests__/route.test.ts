/** @jest-environment node */
import { NextRequest } from 'next/server';

const abortSignal = jest.fn();
const rpc = jest.fn((..._args: unknown[]) => ({ abortSignal }));
const createClient = jest.fn((..._args: unknown[]) => ({ rpc }));
jest.mock('@supabase/supabase-js', () => ({ createClient: (...args: unknown[]) => createClient(...args) }));

import { POST } from '../route';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
let ipCounter = 0;

function beacon(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('https://www.velimir-mueller.de/api/collect', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'content-type': 'text/plain',
      'user-agent': UA,
      'x-forwarded-for': `10.0.0.${++ipCounter}, 10.1.1.1`,
      'x-vercel-ip-country': 'de',
      ...headers,
    },
  });
}

describe('POST /api/collect', () => {
  const env = process.env;

  beforeEach(() => {
    abortSignal.mockReset().mockResolvedValue({ error: null });
    rpc.mockClear();
    createClient.mockClear();
    process.env = {
      ...env,
      NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: 'pk',
      ANALYTICS_INGEST_SECRET: 'ingest-secret',
    };
  });

  afterAll(() => {
    process.env = env;
  });

  it('records a page view through the ingest function', async () => {
    const res = await POST(beacon({ t: 'pageview', p: '/de/about?x=1', v: '/de', r: 'https://www.linkedin.com/feed' }));
    expect(res.status).toBe(204);
    expect(rpc).toHaveBeenCalledWith('record_analytics_event', {
      p_secret: 'ingest-secret',
      p_ip: `10.0.0.${ipCounter}`,
      p_user_agent: UA,
      p_type: 'pageview',
      p_path: '/de/about',
      p_prev_path: '/de',
      p_referrer: 'linkedin.com',
      p_target: null,
      p_country: 'DE',
      p_device: 'desktop',
      p_browser: 'Chrome',
    });
  });

  it('records a click', async () => {
    await POST(beacon({ t: 'click', p: '/de', e: 'hero:contact' }));
    expect(rpc).toHaveBeenCalledWith('record_analytics_event', expect.objectContaining({ p_type: 'click', p_target: 'hero:contact' }));
  });

  it.each([
    ['bots', beacon({ t: 'pageview', p: '/de' }, { 'user-agent': 'Googlebot/2.1' })],
    ['Do Not Track', beacon({ t: 'pageview', p: '/de' }, { dnt: '1' })],
    ['Global Privacy Control', beacon({ t: 'pageview', p: '/de' }, { 'sec-gpc': '1' })],
    ['the signed-in admin', beacon({ t: 'pageview', p: '/de' }, { cookie: 'sb-zkvp-auth-token=abc' })],
    ['malformed JSON', beacon('{nope')],
    ['invalid beacons', beacon({ t: 'pageview', p: 'https://evil.test' })],
    ['requests without an IP', beacon({ t: 'pageview', p: '/de' }, { 'x-forwarded-for': '' })],
  ])('skips %s with a 204', async (_name, request) => {
    const res = await POST(request);
    expect(res.status).toBe(204);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('does nothing when the ingest secret is not configured', async () => {
    delete process.env.ANALYTICS_INGEST_SECRET;
    const res = await POST(beacon({ t: 'pageview', p: '/de' }));
    expect(res.status).toBe(204);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('reuses one client and bounds the database call with a timeout', async () => {
    await POST(beacon({ t: 'pageview', p: '/de' }));
    await POST(beacon({ t: 'pageview', p: '/de' }));
    expect(createClient.mock.calls.length).toBeLessThanOrEqual(1);
    expect(abortSignal).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it('rate-limits a single IP', async () => {
    const headers = { 'x-forwarded-for': '10.9.9.9' };
    for (let i = 0; i < 120; i++) await POST(beacon({ t: 'pageview', p: '/de' }, headers));
    rpc.mockClear();
    await POST(beacon({ t: 'pageview', p: '/de' }, headers));
    expect(rpc).not.toHaveBeenCalled();
  });

  it('logs and still answers 204 when the database refuses', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    abortSignal.mockResolvedValue({ error: { code: '42501', message: 'forbidden' } });
    const res = await POST(beacon({ t: 'pageview', p: '/de' }));
    expect(res.status).toBe(204);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('analytics'), '42501');
    spy.mockRestore();
  });
});
