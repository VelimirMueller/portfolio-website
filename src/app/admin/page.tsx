import Link from 'next/link';
import { requireAdmin } from './_lib/auth';
import { MESSAGE_STATUSES, parseStatusFilter, type ContactMessage } from './_lib/messages';
import { AdminHeader } from './_components/AdminHeader';

const FILTERS = [...MESSAGE_STATUSES, 'all'] as const;

export default async function AdminInboxPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = await requireAdmin();
  const filter = parseStatusFilter(searchParams.status);

  let query = supabase
    .from('contact_messages')
    .select('id, name, email, message, status, created_at')
    .order('created_at', { ascending: false, nullsFirst: false });
  if (filter !== 'all') query = query.eq('status', filter);
  const { data, error } = await query;
  const messages = (data ?? []) as ContactMessage[];

  return (
    <>
      <AdminHeader />

      <nav aria-label="Filter by status" className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin?status=${f}`}
            aria-current={f === filter ? 'page' : undefined}
            className={`rounded-full border px-3 py-1 font-mono text-xs ${
              f === filter
                ? 'border-brand-500 text-brand-500'
                : 'border-light-border text-light-sub dark:border-dark-border dark:text-dark-sub'
            }`}
          >
            {f}
          </Link>
        ))}
      </nav>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          Could not load messages.
        </p>
      )}

      {!error && messages.length === 0 && (
        <p className="text-sm text-light-sub dark:text-dark-sub">No messages here.</p>
      )}

      <ul className="divide-y divide-light-border dark:divide-dark-border">
        {messages.map((m) => (
          <li key={m.id}>
            <Link href={`/admin/${m.id}`} className="block py-4 hover:opacity-80">
              <div className="flex items-baseline justify-between gap-4">
                <span className={m.status === 'new' ? 'font-semibold' : ''}>{m.name}</span>
                <time className="shrink-0 font-mono text-xs text-light-sub dark:text-dark-sub">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString('de-DE') : '—'}
                </time>
              </div>
              <p className="truncate text-sm text-light-sub dark:text-dark-sub">{m.message}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
