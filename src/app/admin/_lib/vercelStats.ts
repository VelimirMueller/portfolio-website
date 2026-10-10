// Server-only by convention (the 'server-only' package is not a dependency
// of this repo): the KPI page reads the Vercel REST API here, with the
// read-only token staying in the request headers only.

const API_BASE = 'https://api.vercel.com';
const DEPLOYMENTS_LIMIT = 20;
const REQUEST_TIMEOUT_MS = 8_000;
const DEFAULT_PROJECT = 'portfolio-website';

/** States Vercel reports today; anything unknown keeps its raw string. */
export const DEPLOYMENT_STATES = ['READY', 'ERROR', 'BUILDING', 'QUEUED', 'CANCELED', 'INITIALIZING'] as const;

/** One mapped deployment row; `createdAt` is ISO, times are seconds. */
export interface VercelDeployment {
  id: string;
  url: string;
  state: string;
  target: 'production' | null;
  branch: string;
  commitMessage: string;
  commitSha: string;
  createdAt: string;
  buildSeconds: number | null;
}

export interface VercelSummary {
  /** Percent of finished (READY/ERROR/CANCELED) deployments that are READY. */
  successRate: number | null;
  /** Mean build seconds over production READY builds; null when there is none. */
  averageBuildSeconds: number | null;
  /** Build seconds of the newest production READY deployment, null if unknown. */
  lastProductionBuildSeconds: number | null;
  /** The newest READY deployment with target "production". */
  currentProduction: VercelDeployment | null;
  /** How many of the fetched deployments sit in each state. */
  countByState: Record<string, number>;
}

export type VercelStats =
  | { status: 'unconfigured' }
  | { status: 'error'; message: string }
  | {
      status: 'ok';
      project: { id: string; name: string };
      deployments: VercelDeployment[];
      summary: VercelSummary;
    };

/** fetch init including Next.js' data-cache option (not in lib.dom types). */
type VercelFetchInit = RequestInit & { next?: { revalidate?: number } };

class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
  }
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asPositiveMs(value: unknown): number | null {
  return typeof value === 'number' && value > 0 ? value : null;
}

function mapDeployment(raw: Record<string, unknown>): VercelDeployment {
  const meta = (raw.meta && typeof raw.meta === 'object' ? raw.meta : {}) as Record<string, unknown>;
  const created = asPositiveMs(raw.created);
  const buildingAt = asPositiveMs(raw.buildingAt);
  const ready = asPositiveMs(raw.ready);
  const firstLine = asString(meta.githubCommitMessage).split('\n')[0].trim();
  return {
    id: asString(raw.uid),
    url: asString(raw.url),
    state: asString(raw.state),
    target: raw.target === 'production' ? 'production' : null,
    branch: asString(meta.githubCommitRef),
    commitMessage: firstLine.slice(0, 80),
    commitSha: asString(meta.githubCommitSha).slice(0, 7),
    createdAt: created !== null ? new Date(created).toISOString() : '',
    buildSeconds:
      ready !== null && buildingAt !== null && ready > buildingAt ? Math.round((ready - buildingAt) / 1000) : null,
  };
}

/** Aggregates over the fetched deployments (the summary's only input). */
export function summarizeDeployments(deployments: VercelDeployment[]): VercelSummary {
  const countByState: Record<string, number> = {};
  for (const d of deployments) countByState[d.state] = (countByState[d.state] ?? 0) + 1;

  const finished = deployments.filter((d) => d.state === 'READY' || d.state === 'ERROR' || d.state === 'CANCELED');
  const readyCount = finished.filter((d) => d.state === 'READY').length;

  const productionReady = deployments
    .filter((d) => d.target === 'production' && d.state === 'READY')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const currentProduction = productionReady[0] ?? null;
  const buildTimes = productionReady
    .map((d) => d.buildSeconds)
    .filter((s): s is number => s !== null);

  return {
    successRate: finished.length > 0 ? Math.round((readyCount / finished.length) * 100) : null,
    averageBuildSeconds:
      buildTimes.length > 0 ? Math.round(buildTimes.reduce((sum, s) => sum + s, 0) / buildTimes.length) : null,
    lastProductionBuildSeconds: currentProduction?.buildSeconds ?? null,
    currentProduction,
    countByState,
  };
}

/**
 * Reads the project and its latest deployments from the Vercel REST API.
 * Never throws and never exposes the token: without VERCEL_API_TOKEN the
 * result is `{ status: 'unconfigured' }`; on any HTTP, network or timeout
 * error (8 s AbortController) it is a generic `{ status: 'error' }`.
 */
export async function loadVercelStats(
  // globalThis.fetch (property access): stays undefined-safe in jsdom tests,
  // where the token check returns "unconfigured" before any request happens.
  fetchImpl: (url: string, init?: VercelFetchInit) => Promise<Response> = globalThis.fetch,
  env: Record<string, string | undefined> = process.env,
): Promise<VercelStats> {
  const token = env.VERCEL_API_TOKEN ?? '';
  if (!token) return { status: 'unconfigured' };

  const projectOrId = env.VERCEL_PROJECT || DEFAULT_PROJECT;
  const teamId = env.VERCEL_TEAM_ID || '';

  const request = async (url: URL): Promise<Record<string, unknown>> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const init: VercelFetchInit = {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
        next: { revalidate: 60 },
      };
      const res = await fetchImpl(url.toString(), init);
      if (!res.ok) throw new HttpError(res.status);
      return (await res.json()) as Record<string, unknown>;
    } finally {
      clearTimeout(timer);
    }
  };

  const withTeam = (url: URL): URL => {
    if (teamId) url.searchParams.set('teamId', teamId);
    return url;
  };

  try {
    const projectRaw = await request(withTeam(new URL(`${API_BASE}/v9/projects/${encodeURIComponent(projectOrId)}`)));
    const projectId = asString(projectRaw.id);
    if (!projectId) return { status: 'error', message: 'Vercel API returned no project' };

    const deploymentsUrl = new URL(`${API_BASE}/v6/deployments`);
    deploymentsUrl.searchParams.set('projectId', projectId);
    deploymentsUrl.searchParams.set('limit', String(DEPLOYMENTS_LIMIT));
    const deploymentsRaw = await request(withTeam(deploymentsUrl));

    const list = Array.isArray(deploymentsRaw.deployments) ? deploymentsRaw.deployments : [];
    const deployments = list.map((d) => mapDeployment(d as Record<string, unknown>));

    return {
      status: 'ok',
      project: { id: projectId, name: asString(projectRaw.name) || projectOrId },
      deployments,
      summary: summarizeDeployments(deployments),
    };
  } catch (err) {
    // Generic on purpose: the HTTP status at most, never the URL or token.
    const message =
      err instanceof HttpError
        ? `Vercel stats are unavailable right now — the Vercel API responded with HTTP ${err.status}.`
        : 'Vercel stats are unavailable right now — the Vercel API request failed.';
    return { status: 'error', message };
  }
}
