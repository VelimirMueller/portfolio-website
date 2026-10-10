import { requireAdmin } from '@/app/admin/_lib/auth';
import { loadDashboardStats, parseKpiTab } from '@/app/admin/_lib/dashboardStats';
import { computeMessageKpis } from '@/app/admin/_lib/kpis';
import type { ContactMessage } from '@/app/admin/_lib/messages';
import { computeTraffic, parseTrafficParams, trafficWindow } from '@/app/admin/_lib/traffic';
import { loadLastEventAt, loadTrafficEvents } from '@/app/admin/_lib/trafficQuery';
import { loadVercelStats } from '@/app/admin/_lib/vercelStats';
import { KpiDashboard } from '@/app/admin/_components/kpi/KpiDashboard';
import { MagicStats } from '@/app/admin/_components/kpi/MagicStats';
import { SupabaseStats } from '@/app/admin/_components/kpi/SupabaseStats';
import { VercelPanel } from '@/app/admin/_components/kpi/VercelPanel';
import { KpisView } from '@/app/admin/_components/KpisView';
import { TrafficDashboard } from '@/app/admin/_components/traffic/TrafficDashboard';
import { parseView } from '@/app/admin/_components/kpi/viewModel';

export default async function AdminKpisPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { supabase } = await requireAdmin();
  const params = parseTrafficParams(searchParams);
  const now = new Date();

  const [messages, traffic, lastEventAt, dashboard, vercel] = await Promise.all([
    supabase.from('contact_messages').select('id, name, email, message, status, created_at'),
    loadTrafficEvents(supabase, trafficWindow(params.filters.range, now).since),
    loadLastEventAt(supabase),
    loadDashboardStats((fn) => supabase.rpc(fn)),
    loadVercelStats(),
  ]);

  const data = computeTraffic(traffic.events, params, now);
  const view = parseView(Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view);
  const tab = parseKpiTab(Array.isArray(searchParams.tab) ? searchParams.tab[0] : searchParams.tab);

  return (
    <KpiDashboard
      initialTab={tab}
      panels={{
        website: (
          <KpisView
            messages={computeMessageKpis((messages.data ?? []) as ContactMessage[])}
            error={Boolean(messages.error)}
            view={view}
            counts={{ overview: data.totals.visitors, clicks: data.totals.clicks }}
            traffic={
              <TrafficDashboard
                data={data}
                params={params}
                loadError={traffic.error}
                capped={traffic.capped}
                generatedAt={now.toISOString()}
                lastEventAt={lastEventAt}
              />
            }
          />
        ),
        supabase: <SupabaseStats stats={dashboard.stats} error={dashboard.error} />,
        vercel: <VercelPanel stats={vercel} />,
        magic: <MagicStats stats={dashboard.stats} error={dashboard.error} />,
      }}
    />
  );
}
