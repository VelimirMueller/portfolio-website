import { requireAdmin } from '@/app/admin/_lib/auth';
import { countByStatus, visibleMessages } from '@/app/admin/_lib/inbox';
import {
  messageIdSchema,
  parseStatusFilter,
  statusAfterOpening,
  type ContactMessage,
} from '@/app/admin/_lib/messages';
import { InboxWorkspace } from '@/app/admin/_components/InboxWorkspace';

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; id?: string };
}) {
  const { supabase } = await requireAdmin();
  const filter = parseStatusFilter(searchParams.status);
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const parsedId = messageIdSchema.safeParse(searchParams.id);
  const openId = parsedId.success ? parsedId.data : null;

  // One query: the inbox is small, and counts, filter and search all derive from it.
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, name, email, message, status, created_at')
    .order('created_at', { ascending: false, nullsFirst: false });
  const all = (data ?? []) as ContactMessage[];

  // Opening a message applies statusAfterOpening (new → read). Runs on a real
  // visit only: the page is force-dynamic with no loading.tsx, so <Link>
  // prefetching never renders it. A failed write keeps the old status.
  const open = openId ? all.find((m) => m.id === openId) ?? null : null;
  if (open) {
    const next = statusAfterOpening(open.status);
    if (next && next !== open.status) {
      const { error: writeError } = await supabase
        .from('contact_messages')
        .update({ status: next })
        .eq('id', open.id);
      if (!writeError) open.status = next;
    }
  }

  return (
    <InboxWorkspace
      messages={visibleMessages(all, filter, query, open?.id ?? null)}
      counts={countByStatus(all)}
      filter={filter}
      query={query}
      selectedId={open?.id ?? null}
      error={Boolean(error)}
    />
  );
}
