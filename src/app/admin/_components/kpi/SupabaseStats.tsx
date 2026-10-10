import { Badge, Card } from '../ui';
import type { AdminDashboardStats } from '../../_lib/dashboardStats';
import { formatBytes } from '../../_lib/format';
import { KpiCard } from './KpiCard';
import { StatsNotice } from './StatsNotice';

/**
 * The "Supabase" KPI tab: database size, connections, Postgres version and
 * table count as cards, then the public tables by size and the storage
 * buckets. Row counts are planner estimates, as delivered by the RPC.
 */
export function SupabaseStats({ stats, error = false }: { stats: AdminDashboardStats | null; error?: boolean }) {
  if (error || !stats?.supabase) return <StatsNotice />;
  const s = stats.supabase;
  const tables = [...s.tables].sort((a, b) => b.bytes - a.bytes);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-white">Supabase</h2>
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500">
          Database &amp; storage · row counts are estimates
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Database size" display={formatBytes(s.db_bytes)} icon="database" color="indigo" index={0} />
        <KpiCard label="Connections" value={s.connections} icon="activity" color="purple" index={1} />
        <KpiCard label="Postgres" display={s.postgres_version} icon="server" color="green" index={2} />
        <KpiCard label="Tables" value={tables.length} icon="table" color="blue" index={3} />
      </div>

      <Card>
        <h3 className="text-lg font-bold text-white mb-1">Tables by size</h3>
        <p className="text-xs text-gray-500 mb-4">Public schema · planner estimates, refreshed by autovacuum</p>
        <table className="w-full text-sm">
          <caption className="sr-only">Public tables, largest first</caption>
          <thead>
            <tr className="border-b border-[#222] text-left text-[10px] font-mono uppercase tracking-wider text-gray-500">
              <th scope="col" className="py-2 pr-4">Table</th>
              <th scope="col" className="py-2 px-4 text-right">Rows ≈</th>
              <th scope="col" className="py-2 pl-4 text-right">Size</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]">
            {tables.map((t) => (
              <tr key={t.name}>
                <th scope="row" className="py-2.5 pr-4 text-left font-mono text-xs font-normal text-gray-300">
                  {t.name}
                </th>
                <td className="py-2.5 px-4 text-right font-mono text-xs text-gray-400">
                  {t.rows.toLocaleString('en-US')}
                </td>
                <td className="py-2.5 pl-4 text-right font-mono text-xs text-white">{formatBytes(t.bytes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-white mb-4">Storage buckets</h3>
        {s.buckets.length === 0 ? (
          <p className="text-sm text-gray-500">No storage buckets.</p>
        ) : (
          <table className="w-full text-sm">
            <caption className="sr-only">Storage buckets</caption>
            <thead>
              <tr className="border-b border-[#222] text-left text-[10px] font-mono uppercase tracking-wider text-gray-500">
                <th scope="col" className="py-2 pr-4">Bucket</th>
                <th scope="col" className="py-2 px-4">Access</th>
                <th scope="col" className="py-2 px-4 text-right">Objects</th>
                <th scope="col" className="py-2 pl-4 text-right">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {s.buckets.map((b) => (
                <tr key={b.id}>
                  <th scope="row" className="py-2.5 pr-4 text-left font-mono text-xs font-normal text-gray-300">
                    {b.id}
                  </th>
                  <td className="py-2.5 px-4">
                    <Badge color={b.public ? 'green' : 'orange'}>{b.public ? 'Public' : 'Private'}</Badge>
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-xs text-gray-400">
                    {b.objects.toLocaleString('en-US')}
                  </td>
                  <td className="py-2.5 pl-4 text-right font-mono text-xs text-white">{formatBytes(b.bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
