import { requireAdmin } from '@/app/admin/_lib/auth';
import { computeMessageKpis } from '@/app/admin/_lib/kpis';
import type { ContactMessage } from '@/app/admin/_lib/messages';
import { computeTraffic, parseTrafficParams, trafficWindow } from '@/app/admin/_lib/traffic';
import { loadTrafficEvents } from '@/app/admin/_lib/trafficQuery';
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

  const [messages, traffic] = await Promise.all([
    supabase.from('contact_messages').select('id, name, email, message, status, created_at'),
    loadTrafficEvents(supabase, trafficWindow(params.filters.range, now).since),
  ]);

  const data = computeTraffic(traffic.events, params, now);
  const view = parseView(Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view);

  return (
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
        />
      }
    />
  );
}
