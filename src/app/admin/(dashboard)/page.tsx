import { requireAdmin } from '@/app/admin/_lib/auth';
import { parseStatusFilter, type ContactMessage } from '@/app/admin/_lib/messages';
import { InboxView } from '@/app/admin/_components/InboxView';

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const { supabase } = await requireAdmin();

  // One query: the inbox is small, and counts, sparklines, filter and search
  // all derive from the same rows.
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, message, status, created_at')
    .order('created_at', { ascending: false, nullsFirst: false });

  return (
    <InboxView
      all={(data ?? []) as ContactMessage[]}
      filter={parseStatusFilter(searchParams.status)}
      query={typeof searchParams.q === 'string' ? searchParams.q : ''}
      error={Boolean(error)}
    />
  );
}
