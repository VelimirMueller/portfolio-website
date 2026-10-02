import { requireAdmin } from '@/app/admin/_lib/auth';
import { computeMessageKpis } from '@/app/admin/_lib/kpis';
import type { ContactMessage } from '@/app/admin/_lib/messages';
import { computeTraffic, parseTrafficParams, trafficWindow } from '@/app/admin/_lib/traffic';
import { loadTrafficEvents } from '@/app/admin/_lib/trafficQuery';
import { KpisView } from '@/app/admin/_components/KpisView';
import { TrafficDashboard } from '@/app/admin/_components/traffic/TrafficDashboard';

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

  return (
    <KpisView
      messages={computeMessageKpis((messages.data ?? []) as ContactMessage[])}
      error={Boolean(messages.error)}
      traffic={
        <TrafficDashboard
          data={computeTraffic(traffic.events, params, now)}
          params={params}
          loadError={traffic.error}
          capped={traffic.capped}
          generatedAt={now.toISOString()}
        />
      }
    />
  );
}
