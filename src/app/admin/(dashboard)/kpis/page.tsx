import { requireAdmin } from '@/app/admin/_lib/auth';
import { computeMessageKpis } from '@/app/admin/_lib/kpis';
import type { ContactMessage } from '@/app/admin/_lib/messages';
import { KpisView } from '@/app/admin/_components/KpisView';

export default async function AdminKpisPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, message, status, created_at');

  return <KpisView messages={computeMessageKpis((data ?? []) as ContactMessage[])} error={Boolean(error)} />;
}
