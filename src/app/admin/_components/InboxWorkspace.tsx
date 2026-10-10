'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Inbox,
  Keyboard,
  Mail,
  MailOpen,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { nextAfter, step, timeAgo } from '../_lib/inbox';
import { MESSAGE_STATUSES, type ContactMessage, type MessageStatus } from '../_lib/messages';
import { deleteMessages, updateStatuses } from '../actions';
import { Avatar, StatusBadge } from './ui';

const TAB_LABEL: Record<MessageStatus | 'all', string> = {
  new: 'Unread',
  read: 'Read',
  archived: 'Archived',
  spam: 'Spam',
  all: 'All',
};

export interface InboxWorkspaceProps {
  messages: ContactMessage[];
  counts: Record<MessageStatus | 'all', number>;
  filter: MessageStatus | 'all';
  query: string;
  selectedId: string | null;
  error: boolean;
  now?: Date;
}

/**
 * Mail-client style inbox: list and reading pane side by side, quick actions
 * per row, multi-select with a bulk bar, auto-advance after archive/spam/
 * delete, and keyboard shortcuts (j/k, e, s, u, r, x, Esc, /).
 * The URL (?status, ?q, ?id) is the source of truth, so every state is a link.
 */
export function InboxWorkspace({ messages, counts, filter, query, selectedId, error, now }: InboxWorkspaceProps) {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => messages.find((m) => m.id === selectedId) ?? null, [messages, selectedId]);

  const href = useCallback(
    (id: string | null) => {
      const p = new URLSearchParams();
      if (filter !== 'new') p.set('status', filter);
      if (query) p.set('q', query);
      if (id) p.set('id', id);
      const s = p.toString();
      return s ? `/admin?${s}` : '/admin';
    },
    [filter, query]
  );

  const open = useCallback((id: string | null) => router.push(href(id), { scroll: false }), [router, href]);

  // Drop selections that are no longer in the list (after an action or filter change).
  useEffect(() => {
    setChecked((prev) => {
      const visible = new Set(messages.map((m) => m.id));
      const next = new Set(Array.from(prev).filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [messages]);

  const run = useCallback(
    (ids: string[], action: MessageStatus | 'delete') => {
      setFailed(null);
      // Leaving the current view? Then open the next message, like a mail client.
      const leaves = action === 'delete' || action === 'archived' || action === 'spam' || (filter !== 'all' && action !== filter);
      const advanceTo = selectedId && ids.includes(selectedId) && leaves ? nextAfter(messages, selectedId, ids) : undefined;
      startTransition(async () => {
        try {
          if (action === 'delete') await deleteMessages(ids);
          else await updateStatuses(ids, action);
          setChecked(new Set());
          setConfirmDelete(null);
          if (advanceTo !== undefined) router.replace(href(advanceTo), { scroll: false });
          router.refresh();
        } catch {
          setFailed(action === 'delete' ? 'Could not delete.' : 'Could not update.');
        }
      });
    },
    [filter, messages, selectedId, router, href]
  );

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allChecked = messages.length > 0 && checked.size === messages.length;
  // Deleting just the open message asks in the reading pane; anything else asks in the list.
  const confirmingOpen = Boolean(selected && confirmDelete?.length === 1 && confirmDelete[0] === selected.id);
  const checkedIds = Array.from(checked);

  // Keyboard shortcuts; ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'j' || k === 'ArrowDown') open(step(messages, selectedId, 1));
      else if (k === 'k' || k === 'ArrowUp') open(step(messages, selectedId, -1));
      else if (k === 'Escape') {
        if (confirmDelete) setConfirmDelete(null);
        else if (checked.size) setChecked(new Set());
        else if (selectedId) open(null);
      } else if (k === '/') searchRef.current?.focus();
      else if (selected && k === 'e') run([selected.id], 'archived');
      else if (selected && k === 's') run([selected.id], 'spam');
      else if (selected && k === 'u') run([selected.id], selected.status === 'new' ? 'read' : 'new');
      else if (selected && k === 'x') toggle(selected.id);
      else if (selected && k === 'r') window.location.href = replyHref(selected);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [messages, selectedId, selected, checked.size, confirmDelete, open, run]);

  // Keep the open row in view while stepping with j/k.
  useEffect(() => {
    if (selectedId) document.getElementById(`row-${selectedId}`)?.scrollIntoView?.({ block: 'nearest' });
  }, [selectedId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Inbox</h1>
          <p className="text-gray-500 text-sm">Messages from the contact form</p>
        </div>
        <span className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-gray-600">
          <Keyboard size={12} aria-hidden="true" /> j/k move · e archive · s spam · u unread · r reply · x select
        </span>
      </div>

      {/* Status tabs (segmented control, as in the demo's chart toggles) */}
      <nav aria-label="Filter by status" className="flex bg-[#0a0a0a] p-1 rounded-xl border border-[#222] overflow-x-auto">
        {[...MESSAGE_STATUSES, 'all' as const].map((s) => (
          <Link
            key={s}
            href={s === 'new' ? '/admin' : `/admin?status=${s}`}
            aria-current={s === filter ? 'page' : undefined}
            className={`flex-1 min-w-max flex items-center justify-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${
              s === filter ? 'bg-[#222] text-white shadow' : 'text-gray-500 hover:text-white'
            }`}
          >
            {TAB_LABEL[s]}
            <span className={`font-mono text-[10px] ${s === filter ? 'text-blue-400' : 'text-gray-600'}`}>{counts[s]}</span>
          </Link>
        ))}
      </nav>

      {failed && (
        <p role="alert" className="text-xs text-red-300 p-3 rounded-xl border border-red-500/20 bg-red-500/5">
          {failed}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(320px,420px)_1fr] gap-4 lg:h-[calc(100vh-15rem)] lg:min-h-[480px]">
        {/* ---------- List ---------- */}
        <section
          aria-label="Messages"
          className={`${selected ? 'hidden lg:flex' : 'flex'} flex-col bg-[#111111] rounded-[2rem] border border-[#222] overflow-hidden`}
        >
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[#222]">
            <input
              type="checkbox"
              aria-label="Select all"
              checked={allChecked}
              onChange={() => setChecked(allChecked ? new Set() : new Set(messages.map((m) => m.id)))}
              className="accent-brand-600"
            />
            {checked.size > 0 ? (
              <div className="flex items-center gap-1 flex-1 min-w-0" role="toolbar" aria-label="Bulk actions">
                <span className="text-[11px] font-mono text-brand-400 mr-2">{checked.size} selected</span>
                <IconButton label="Mark read" onClick={() => run(checkedIds, 'read')} disabled={pending}>
                  <MailOpen size={14} />
                </IconButton>
                <IconButton label="Mark unread" onClick={() => run(checkedIds, 'new')} disabled={pending}>
                  <Mail size={14} />
                </IconButton>
                <IconButton label="Archive" onClick={() => run(checkedIds, 'archived')} disabled={pending}>
                  <Archive size={14} />
                </IconButton>
                <IconButton label="Mark as spam" onClick={() => run(checkedIds, 'spam')} disabled={pending}>
                  <ShieldAlert size={14} />
                </IconButton>
                <IconButton label="Delete" tone="danger" onClick={() => setConfirmDelete(checkedIds)} disabled={pending}>
                  <Trash2 size={14} />
                </IconButton>
                <IconButton label="Clear selection" onClick={() => setChecked(new Set())}>
                  <X size={14} />
                </IconButton>
              </div>
            ) : (
              <form action="/admin" method="get" role="search" className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} aria-hidden="true" />
                {filter !== 'new' && <input type="hidden" name="status" value={filter} />}
                <input
                  ref={searchRef}
                  key={query}
                  type="search"
                  name="q"
                  defaultValue={query}
                  aria-label="Search messages"
                  placeholder="Search…  ( / )"
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-full py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </form>
            )}
          </div>

          {confirmDelete && !confirmingOpen && (
            <DeleteConfirm
              count={confirmDelete.length}
              pending={pending}
              onConfirm={() => run(confirmDelete, 'delete')}
              onCancel={() => setConfirmDelete(null)}
            />
          )}

          {error && <p role="alert" className="px-5 py-8 text-sm text-red-400">Could not load messages.</p>}
          {!error && messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
              <CheckCircle2 size={24} className="text-green-400" aria-hidden="true" />
              <p className="text-sm text-white font-bold">{query ? 'No matches' : 'All caught up'}</p>
              <p className="text-xs text-gray-500">{query ? `Nothing matches “${query}”.` : `No ${TAB_LABEL[filter].toLowerCase()} messages.`}</p>
            </div>
          )}

          <ul className="flex-1 overflow-y-auto divide-y divide-[#1a1a1a]">
            {messages.map((m) => {
              const isOpen = m.id === selectedId;
              return (
                <li
                  key={m.id}
                  id={`row-${m.id}`}
                  className={`group relative flex items-start gap-3 px-5 py-3 transition-colors ${
                    isOpen ? 'bg-brand-500/10' : checked.has(m.id) ? 'bg-[#1a1a1a]' : 'hover:bg-[#1a1a1a]'
                  }`}
                >
                  {isOpen && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-500" aria-hidden="true" />}
                  <input
                    type="checkbox"
                    aria-label={`Select message from ${m.name}`}
                    checked={checked.has(m.id)}
                    onChange={() => toggle(m.id)}
                    className="relative z-10 mt-2 accent-brand-600"
                  />
                  <Avatar name={m.name} />
                  <div className="flex-1 min-w-0 lg:group-hover:pr-20">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        href={href(m.id)}
                        scroll={false}
                        aria-current={isOpen ? 'true' : undefined}
                        className={`text-xs truncate after:absolute after:inset-0 focus-visible:outline-none ${
                          m.status === 'new' ? 'font-bold text-white' : 'text-gray-300'
                        }`}
                      >
                        {m.name}
                      </Link>
                      <span className="text-[9px] text-gray-600 font-mono whitespace-nowrap group-hover:invisible">
                        {timeAgo(m.created_at, now)}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate ${m.status === 'new' ? 'text-gray-300' : 'text-gray-500'}`}>{m.message}</p>
                    {filter === 'all' && (
                      <div className="mt-1.5">
                        <StatusBadge status={m.status} />
                      </div>
                    )}
                  </div>
                  {m.status === 'new' && !isOpen && (
                    <span className="absolute right-3 bottom-4 w-1.5 h-1.5 rounded-full bg-brand-500" aria-label="Unread" />
                  )}
                  {/* Hover quick actions */}
                  <div className="absolute right-3 top-2 z-10 hidden group-hover:flex group-focus-within:flex items-center gap-0.5 bg-[#1a1a1a] rounded-lg border border-[#333] p-0.5">
                    <IconButton
                      label={m.status === 'new' ? 'Mark read' : 'Mark unread'}
                      onClick={() => run([m.id], m.status === 'new' ? 'read' : 'new')}
                      disabled={pending}
                    >
                      {m.status === 'new' ? <MailOpen size={13} /> : <Mail size={13} />}
                    </IconButton>
                    {m.status !== 'archived' && (
                      <IconButton label="Archive" onClick={() => run([m.id], 'archived')} disabled={pending}>
                        <Archive size={13} />
                      </IconButton>
                    )}
                    {m.status !== 'spam' && (
                      <IconButton label="Mark as spam" onClick={() => run([m.id], 'spam')} disabled={pending}>
                        <ShieldAlert size={13} />
                      </IconButton>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="px-5 py-2.5 border-t border-[#222] bg-[#0a0a0a] flex justify-between text-[11px]">
            <span className="text-gray-500">{pending ? 'Saving…' : 'Showing'}</span>
            <span className="font-mono font-bold text-white">
              {messages.length} / {counts.all}
            </span>
          </div>
        </section>

        {/* ---------- Reading pane ---------- */}
        <section
          aria-label="Message"
          className={`${selected ? 'flex' : 'hidden lg:flex'} flex-col bg-[#111111] rounded-[2rem] border border-[#222] overflow-hidden`}
        >
          {selected ? (
            <ReadingPane
              message={selected}
              now={now}
              pending={pending}
              position={messages.findIndex((m) => m.id === selected.id) + 1}
              total={messages.length}
              onClose={() => open(null)}
              onStep={(d) => open(step(messages, selected.id, d))}
              onStatus={(s) => run([selected.id], s)}
              onDelete={() => setConfirmDelete([selected.id])}
              confirming={confirmingOpen}
              onConfirmDelete={() => run([selected.id], 'delete')}
              onCancelDelete={() => setConfirmDelete(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center">
              <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400">
                <Inbox size={22} aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-white">Select a message</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Press <Kbd>j</Kbd> to open the first one, then <Kbd>e</Kbd> to archive and move on.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function replyHref(m: ContactMessage) {
  const firstName = m.name.trim().split(/\s+/)[0];
  return `mailto:${m.email}?subject=${encodeURIComponent('Re: Your message on velimir-mueller.de')}&body=${encodeURIComponent(
    `Hi ${firstName},\n\n`
  )}`;
}

function ReadingPane({
  message,
  now,
  pending,
  position,
  total,
  onClose,
  onStep,
  onStatus,
  onDelete,
  confirming,
  onConfirmDelete,
  onCancelDelete,
}: {
  message: ContactMessage;
  now?: Date;
  pending: boolean;
  position: number;
  total: number;
  onClose: () => void;
  onStep: (d: 1 | -1) => void;
  onStatus: (s: MessageStatus) => void;
  onDelete: () => void;
  confirming: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-1 px-4 py-3 border-b border-[#222]" role="toolbar" aria-label="Message actions">
        <IconButton label="Close" onClick={onClose}>
          <ArrowLeft size={15} />
        </IconButton>
        <span className="w-px h-5 bg-[#222] mx-1" aria-hidden="true" />
        <IconButton label={message.status === 'new' ? 'Mark read' : 'Mark unread'} onClick={() => onStatus(message.status === 'new' ? 'read' : 'new')} disabled={pending}>
          {message.status === 'new' ? <MailOpen size={15} /> : <Mail size={15} />}
        </IconButton>
        {message.status !== 'archived' && (
          <IconButton label="Archive" onClick={() => onStatus('archived')} disabled={pending}>
            <Archive size={15} />
          </IconButton>
        )}
        {message.status !== 'spam' && (
          <IconButton label="Mark as spam" onClick={() => onStatus('spam')} disabled={pending}>
            <ShieldAlert size={15} />
          </IconButton>
        )}
        <IconButton label="Delete" tone="danger" onClick={onDelete} disabled={pending}>
          <Trash2 size={15} />
        </IconButton>
        <span className="ml-auto text-[10px] font-mono text-gray-600 mr-1">
          {position} / {total}
        </span>
        <IconButton label="Previous message" onClick={() => onStep(-1)} disabled={position <= 1}>
          <ChevronUp size={15} />
        </IconButton>
        <IconButton label="Next message" onClick={() => onStep(1)} disabled={position >= total}>
          <ChevronDown size={15} />
        </IconButton>
      </div>

      {confirming && <DeleteConfirm count={1} pending={pending} onConfirm={onConfirmDelete} onCancel={onCancelDelete} />}

      <article className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in-up" key={message.id}>
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar name={message.name} size="lg" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white truncate">{message.name}</h2>
              <a href={`mailto:${message.email}`} className="text-xs text-brand-400 hover:text-brand-300 break-all">
                {message.email}
              </a>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge status={message.status} />
                <span className="text-[10px] font-mono text-gray-500">
                  {message.created_at ? new Date(message.created_at).toLocaleString('de-DE') : '—'} · {timeAgo(message.created_at, now)}
                </span>
              </div>
            </div>
          </div>
          <a
            href={replyHref(message)}
            className="self-start flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-500 shadow-lg shadow-brand-900/20"
          >
            <Mail size={14} aria-hidden="true" /> Reply
          </a>
        </header>
        <div className="rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] p-5">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap break-words">{message.message}</p>
        </div>
      </article>
    </>
  );
}

function DeleteConfirm({
  count,
  pending,
  onConfirm,
  onCancel,
}: {
  count: number;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div role="alertdialog" aria-label="Confirm delete" className="m-4 p-3 rounded-xl border border-red-500/30 bg-red-500/5 animate-pulse-glow space-y-3">
      <p className="text-xs text-red-300">
        Delete {count === 1 ? 'this message' : `${count} messages`} for good? This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={pending}
          className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg disabled:opacity-60"
        >
          {pending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 bg-[#1a1a1a] border border-[#333] text-white text-xs font-bold rounded-lg hover:bg-[#222]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  tone = 'default',
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
        tone === 'danger' ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-[#222]'
      }`}
    >
      {children}
    </button>
  );
}

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="px-1.5 py-0.5 rounded border border-[#333] bg-[#1a1a1a] font-mono text-[10px] text-gray-300">{children}</kbd>
);
