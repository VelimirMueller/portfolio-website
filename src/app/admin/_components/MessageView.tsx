import Link from 'next/link';
import { Archive, ArrowLeft, CheckCircle2, Inbox, Mail, ShieldAlert } from 'lucide-react';
import { timeAgo } from '../_lib/inbox';
import type { ContactMessage, MessageStatus } from '../_lib/messages';
import { setStatus } from '../actions';
import { DeleteButton } from './DeleteButton';
import { SubmitButton } from './SubmitButton';
import { Avatar, Card, StatusBadge } from './ui';

const ACTIONS: { status: MessageStatus; label: string; icon: typeof Inbox; tone: string }[] = [
  { status: 'new', label: 'Mark unread', icon: Inbox, tone: 'text-blue-400' },
  { status: 'read', label: 'Mark read', icon: CheckCircle2, tone: 'text-green-400' },
  { status: 'archived', label: 'Archive', icon: Archive, tone: 'text-purple-400' },
  { status: 'spam', label: 'Mark as spam', icon: ShieldAlert, tone: 'text-red-400' },
];

export function MessageView({ message, now }: { message: ContactMessage; now?: Date }) {
  const firstName = message.name.trim().split(/\s+/)[0];
  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent('Re: Your message on velimir-mueller.de')}&body=${encodeURIComponent(`Hi ${firstName},\n\n`)}`;

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white">
        <ArrowLeft size={14} aria-hidden="true" /> Back to inbox
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 self-start animate-fade-in-up">
          <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar name={message.name} size="lg" />
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-white truncate">{message.name}</h1>
                <a href={`mailto:${message.email}`} className="text-xs text-blue-400 hover:text-blue-300 break-all">
                  {message.email}
                </a>
              </div>
            </div>
            <a
              href={replyHref}
              className="self-start flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-900/20"
            >
              <Mail size={14} aria-hidden="true" /> Reply
            </a>
          </header>
          <div className="rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] p-5">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{message.message}</p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-sm font-bold text-white mb-4">Details</h2>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Status</dt>
                <dd><StatusBadge status={message.status} /></dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Received</dt>
                <dd className="font-mono text-gray-300 text-right">
                  {message.created_at ? new Date(message.created_at).toLocaleString('de-DE') : '—'}
                  <div className="text-[10px] text-gray-600">{timeAgo(message.created_at, now)}</div>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Length</dt>
                <dd className="font-mono text-gray-300">{message.message.length} chars</dd>
              </div>
            </dl>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-sm font-bold text-white mb-4">Actions</h2>
            <div className="space-y-2">
              {ACTIONS.filter((a) => a.status !== message.status).map((a) => (
                <form key={a.status} action={setStatus}>
                  <input type="hidden" name="id" value={message.id} />
                  <input type="hidden" name="status" value={a.status} />
                  <SubmitButton
                    pendingLabel={<span className="text-gray-500">Saving…</span>}
                    className="flex items-center gap-3 w-full p-2.5 rounded-lg border border-[#222] hover:border-[#333] hover:bg-[#1a1a1a] text-left text-xs text-gray-300 transition-colors"
                  >
                    <a.icon size={14} className={a.tone} aria-hidden="true" />
                    {a.label}
                  </SubmitButton>
                </form>
              ))}
              <div className="pt-2 mt-2 border-t border-[#222]">
                <DeleteButton id={message.id} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
