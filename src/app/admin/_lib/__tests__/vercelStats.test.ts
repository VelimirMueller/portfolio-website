import { loadVercelStats } from '../vercelStats';

const TOKEN = 'vercel-secret-read-only-token';

const env = (over: Record<string, string> = {}) => ({ VERCEL_API_TOKEN: TOKEN, ...over });

const jsonResponse = (body: unknown, status = 200): Response =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;

const projectBody = { id: 'prj_portfolio', name: 'portfolio-website' };

type RawDeployment = Record<string, unknown>;

const rawDeployment = (over: RawDeployment = {}): RawDeployment => ({
  uid: 'dpl_1',
  url: 'portfolio-website-git-main.vercel.app',
  state: 'READY',
  target: 'production',
  created: 1_760_000_000_000,
  buildingAt: 1_760_000_000_000,
  ready: 1_760_000_122_000, // 122 s build
  meta: {
    githubCommitRef: 'main',
    githubCommitMessage: 'Fix the login flow\n\nA much longer body line that must not surface.',
    githubCommitSha: 'abcdef1234567890',
  },
  ...over,
});

/** A two-call fetch (project, then deployments) routing by URL. */
function vercelFetch(deploymentsBody: { deployments: RawDeployment[] } = { deployments: [] }) {
  return jest.fn((url: string, _init?: RequestInit) => {
    if (url.includes('/v9/projects/')) return Promise.resolve(jsonResponse(projectBody));
    if (url.includes('/v6/deployments')) return Promise.resolve(jsonResponse(deploymentsBody));
    return Promise.resolve(jsonResponse({ error: 'unexpected url' }, 404));
  });
}

describe('loadVercelStats', () => {
  it('is unconfigured without a token and calls nothing', async () => {
    const fetchImpl = jest.fn();
    const result = await loadVercelStats(fetchImpl, {});
    expect(result).toEqual({ status: 'unconfigured' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns a generic error with only the HTTP status on a 401', async () => {
    const fetchImpl = jest.fn(() => Promise.resolve(jsonResponse({ error: 'unauthorized' }, 401)));
    const result = await loadVercelStats(fetchImpl, env());
    expect(result).toEqual({ status: 'error', message: expect.stringContaining('HTTP 401') });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('maps deployments and summarizes them', async () => {
    const longMessage = `${'x'.repeat(100)}\nsecond line`;
    const fetchImpl = vercelFetch({
      deployments: [
        rawDeployment({
          uid: 'dpl_prod_2',
          created: 1_760_100_000_000,
          buildingAt: 1_760_100_000_000,
          ready: 1_760_100_062_000, // 62 s
          meta: { githubCommitRef: 'main', githubCommitMessage: longMessage, githubCommitSha: '1234567890abcdef' },
        }),
        rawDeployment(),
        rawDeployment({ uid: 'dpl_err', state: 'ERROR', target: null, ready: 0 }),
        rawDeployment({ uid: 'dpl_cancel', state: 'CANCELED', target: null, ready: 0 }),
        rawDeployment({ uid: 'dpl_bld', state: 'BUILDING', target: null, ready: 0 }),
      ],
    });

    const result = await loadVercelStats(fetchImpl, env());

    expect(result).toMatchObject({ status: 'ok', project: { id: 'prj_portfolio', name: 'portfolio-website' } });
    if (result.status !== 'ok') throw new Error('expected ok');

    // Mapping: first line only (max 80 chars), 7-char sha, ISO date, seconds.
    const first = result.deployments[0];
    expect(first.commitMessage).toBe('x'.repeat(80));
    expect(first.commitSha).toBe('1234567');
    expect(first.createdAt).toBe(new Date(1_760_100_000_000).toISOString());
    expect(first.buildSeconds).toBe(62);
    expect(result.deployments[1]).toMatchObject({
      id: 'dpl_1',
      url: 'portfolio-website-git-main.vercel.app',
      state: 'READY',
      target: 'production',
      branch: 'main',
      commitMessage: 'Fix the login flow',
      commitSha: 'abcdef1',
      buildSeconds: 122,
    });
    expect(result.deployments[2].buildSeconds).toBeNull(); // ready missing → null

    // Summary: finished = READY×2, ERROR, CANCELED (BUILDING does not count).
    expect(result.summary.countByState).toEqual({ READY: 2, ERROR: 1, CANCELED: 1, BUILDING: 1 });
    expect(result.summary.successRate).toBe(50); // 2 READY of 4 finished
    expect(result.summary.averageBuildSeconds).toBe(92); // (62 + 122) / 2
    expect(result.summary.lastProductionBuildSeconds).toBe(62); // newest prod READY
    expect(result.summary.currentProduction?.id).toBe('dpl_prod_2');
  });

  it('sends the Bearer token, the project name and the revalidate option', async () => {
    const fetchImpl = vercelFetch();
    await loadVercelStats(fetchImpl, env());
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.vercel.com/v9/projects/portfolio-website');
    expect(init?.headers).toEqual({ Authorization: `Bearer ${TOKEN}` });
    expect(init?.next).toEqual({ revalidate: 60 });
    expect(fetchImpl.mock.calls[1][0]).toBe('https://api.vercel.com/v6/deployments?projectId=prj_portfolio&limit=20');
  });

  it('honours VERCEL_PROJECT and appends teamId to both requests', async () => {
    const fetchImpl = vercelFetch();
    await loadVercelStats(fetchImpl, env({ VERCEL_PROJECT: 'my-vercel-id', VERCEL_TEAM_ID: 'team_42' }));
    const urls = fetchImpl.mock.calls.map(([url]) => new URL(url as string));
    expect(urls[0].pathname).toBe('/v9/projects/my-vercel-id');
    expect(urls.map((u) => u.searchParams.get('teamId'))).toEqual(['team_42', 'team_42']);
    expect(urls[1].searchParams.get('projectId')).toBe('prj_portfolio');
    expect(urls[1].searchParams.get('limit')).toBe('20');
  });

  it('returns an error when the network fails', async () => {
    const fetchImpl = jest.fn(() => Promise.reject(new TypeError('fetch failed')));
    const result = await loadVercelStats(fetchImpl, env());
    expect(result.status).toBe('error');
    if (result.status !== 'error') throw new Error('expected error');
    expect(result.message).not.toContain(TOKEN);
  });

  it('aborts and errors after the 8 s timeout', async () => {
    jest.useFakeTimers();
    try {
      const fetchImpl = jest.fn(
        (_url: string, init?: { signal: AbortSignal }) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      );
      const pending = loadVercelStats(fetchImpl as unknown as typeof fetch, env());
      await jest.advanceTimersByTimeAsync(8_000);
      await expect(pending).resolves.toMatchObject({ status: 'error' });
    } finally {
      jest.useRealTimers();
    }
  });

  it('never includes the token in the returned object', async () => {
    const fetchImpl = vercelFetch({ deployments: [rawDeployment()] });
    const result = await loadVercelStats(fetchImpl, env());
    expect(JSON.stringify(result)).not.toContain(TOKEN);
    expect(fetchImpl.mock.calls[0][1]?.headers).toEqual({ Authorization: `Bearer ${TOKEN}` });
  });
});
