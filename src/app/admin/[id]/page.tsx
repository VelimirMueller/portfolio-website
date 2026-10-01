import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '../_lib/auth';
import {
  messageIdSchema,
  statusAfterOpening,
  type ContactMessage,
  type MessageStatus,
} from '../_lib/messages';
import { setStatus } from '../actions';
import { AdminHeader } from '../_components/AdminHeader';
import { DeleteButton } from '../_components/DeleteButton';

const ACTIONS: { status: MessageStatus; label: string }[] = [
  { status: 'new', label: 'Mark unread' },
  { status: 'read', label: 'Mark read' },
  { status: 'archived', label: 'Archive' },
  { status: 'spam', label: 'Spam' },
];

export default async function AdminMessagePage({ params }: { params: { id: string } }) {
  const id = messageIdSchema.safeParse(params.id);
  if (!id.success) notFound();

  const supabase = await requireAdmin();
  const { data } = await supabase
    .from('contact_messages')
    .select('id, name, email, message, status, created_at')
    .eq('id', id.data)
    .maybeSingle();
  if (!data) notFound();
  const message = data as ContactMessage;

  const next = statusAfterOpening(message.status);
  if (next && next !== message.status) {
    await supabase.from('contact_messages').update({ status: next }).eq('id', message.id);
    message.status = next;
  }

  return (
    <>
      <AdminHeader />
      <Link href="/admin" className="mb-6 inline-block text-sm text-light-sub dark:text-dark-sub">
        ← Back
      </Link>

      <article className="rounded-xl border border-light-border bg-light-card p-6 dark:border-dark-border dark:bg-dark-card">
        <header className="mb-4">
          <h1 className="text-lg font-semibold">{message.name}</h1>
          <a href={`mailto:${message.email}`} className="text-sm text-brand-500 hover:underline">
            {message.email}
          </a>
          <p className="mt-1 font-mono text-xs text-light-sub dark:text-dark-sub">
            {message.created_at ? new Date(message.created_at).toLocaleString('de-DE') : '—'} ·{' '}
            {message.status}
          </p>
        </header>
        <p className="whitespace-pre-wrap">{message.message}</p>
      </article>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {ACTIONS.filter((a) => a.status !== message.status).map((a) => (
          <form key={a.status} action={setStatus}>
            <input type="hidden" name="id" value={message.id} />
            <input type="hidden" name="status" value={a.status} />
            <button
              type="submit"
              className="rounded-full border border-light-border px-4 py-2 text-sm dark:border-dark-border"
            >
              {a.label}
            </button>
          </form>
        ))}
        <DeleteButton id={message.id} />
      </div>
    </>
  );
}
