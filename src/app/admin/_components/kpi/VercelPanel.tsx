import { Rocket } from 'lucide-react';
import type { VercelStats, VercelDeployment } from '../../_lib/vercelStats';
import { formatBerlinTime } from '../../_lib/format';
import { Badge, Card, type BadgeColor } from '../ui';
import { KpiCard } from './KpiCard';

/** Deployment states: done and green, failed and red, in flight and amber, dropped and gray. */
const STATE_BADGE_COLOR: Record<string, BadgeColor> = {
  READY: 'green',
  ERROR: 'red',
  BUILDING: 'amber',
  QUEUED: 'amber',
  INITIALIZING: 'amber',
  CANCELED: 'gray',
};

const stateBadgeColor = (state: string): BadgeColor => STATE_BADGE_COLOR[state] ?? 'gray';
const stateLabel = (state: string): string => state || 'UNKNOWN';
const targetLabel = (d: VercelDeployment): string => (d.target === 'production' ? 'Production' : 'Preview');
const deploymentHref = (url: string): string => (url.startsWith('http') ? url : `https://${url}`);

/** "95 s", "1 m 52 s" — or an em dash when the time is unknown. */
function formatBuildSeconds(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) return `${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest > 0 ? `${minutes} m ${rest} s` : `${minutes} m`;
}

function UnconfiguredCard() {
  return (
    <Card className="max-w-2xl">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400 shrink-0">
          <Rocket size={18} aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">Vercel</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            This tab lists the project&apos;s deployments with their build status, so a release can be checked next
            to the site KPIs. It needs a read-only Vercel token first: set{' '}
            <code className="font-mono text-xs text-brand-400">VERCEL_API_TOKEN</code> in the Vercel project,
            Production environment. Until then no Vercel API is called.
          </p>
        </div>
      </div>
    </Card>
  );
}

function DeploymentRowCells({ d }: { d: VercelDeployment }) {
  return (
    <>
      <td className="py-2.5 pr-4">
        <Badge color={stateBadgeColor(d.state)}>{stateLabel(d.state)}</Badge>
      </td>
      <td className="py-2.5 px-4 text-xs text-gray-400">{targetLabel(d)}</td>
      <td className="py-2.5 px-4 font-mono text-xs text-gray-300">{d.branch || '—'}</td>
      <td className="py-2.5 px-4">
        <div className="text-xs text-gray-300">{d.commitMessage || '—'}</div>
        {d.commitSha && <div className="font-mono text-[10px] text-gray-500">{d.commitSha}</div>}
      </td>
      <td className="py-2.5 px-4 text-xs text-gray-400">{formatBerlinTime(d.createdAt)}</td>
      <td className="py-2.5 pl-4 text-right font-mono text-xs text-white">{formatBuildSeconds(d.buildSeconds)}</td>
    </>
  );
}

/**
 * The "Vercel" KPI tab: success rate and build times as cards, the current
 * production deployment, and the latest 20 deployments. Unconfigured (no
 * token) and error states render as calm inline cards, never a crash.
 */
export function VercelPanel({ stats }: { stats: VercelStats }) {
  if (stats.status === 'unconfigured') return <UnconfiguredCard />;

  if (stats.status === 'error') {
    return (
      <p
        role="status"
        className="max-w-2xl rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-gray-400"
      >
        {stats.message}
      </p>
    );
  }

  const { project, deployments, summary } = stats;
  const current = summary.currentProduction;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white">Vercel</h2>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
          Deployments &amp; build status · project {project.name}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Success rate"
          display={summary.successRate === null ? '—' : `${summary.successRate}%`}
          icon="activity"
          color="green"
          index={0}
        />
        <KpiCard
          label="Avg production build"
          display={formatBuildSeconds(summary.averageBuildSeconds)}
          icon="clock"
          color="blue"
          index={1}
        />
        <KpiCard
          label="Last production build"
          display={formatBuildSeconds(summary.lastProductionBuildSeconds)}
          icon="history"
          color="purple"
          index={2}
        />
        <KpiCard label="Deployments · last 20" value={deployments.length} icon="boxes" color="indigo" index={3} />
      </div>

      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Current production</h3>
        {current ? (
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs text-gray-500 mb-1">Deployment</dt>
              <dd className="text-sm truncate">
                <a
                  href={deploymentHref(current.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-brand-400 hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  {current.url}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 mb-1">Branch</dt>
              <dd className="font-mono text-sm text-white">{current.branch || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 mb-1">Commit</dt>
              <dd className="font-mono text-sm text-white">{current.commitSha || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500 mb-1">Created</dt>
              <dd className="font-mono text-sm text-white">{formatBerlinTime(current.createdAt)}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-500">No production deployment yet.</p>
        )}
      </Card>

      {deployments.length === 0 ? (
        <Card>
          <h3 className="text-lg font-bold text-white mb-1">Deployments</h3>
          <p className="text-sm text-gray-500">No deployments found for this project.</p>
        </Card>
      ) : (
        <>
          <Card className="hidden sm:block">
            <h3 className="text-lg font-bold text-white mb-4">Deployments</h3>
            <table className="w-full text-sm">
              <caption className="sr-only">Latest deployments, newest first</caption>
              <thead>
                <tr className="border-b border-[#222] text-left text-[10px] font-mono uppercase tracking-wider text-gray-500">
                  <th scope="col" className="py-2 pr-4">State</th>
                  <th scope="col" className="py-2 px-4">Target</th>
                  <th scope="col" className="py-2 px-4">Branch</th>
                  <th scope="col" className="py-2 px-4">Commit</th>
                  <th scope="col" className="py-2 px-4">Created</th>
                  <th scope="col" className="py-2 pl-4 text-right">Build</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {deployments.map((d) => (
                  <tr key={d.id}>
                    <DeploymentRowCells d={d} />
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="sm:hidden space-y-3">
            {deployments.map((d) => (
              <div key={d.id} className="rounded-2xl border border-[#222] bg-[#111111] p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge color={stateBadgeColor(d.state)}>{stateLabel(d.state)}</Badge>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{targetLabel(d)}</span>
                </div>
                <p className="text-sm text-gray-300">{d.commitMessage || '—'}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-gray-500">
                  <span>{d.branch || '—'}</span>
                  {d.commitSha && <span>{d.commitSha}</span>}
                  <span>{formatBerlinTime(d.createdAt)}</span>
                  <span>{formatBuildSeconds(d.buildSeconds)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
