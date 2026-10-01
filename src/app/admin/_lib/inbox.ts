import type { ContactMessage, MessageStatus } from './messages';

/** Status filter plus a case-insensitive search over name, email and message. */
export function filterMessages(
  messages: ContactMessage[],
  status: MessageStatus | 'all',
  query: string
): ContactMessage[] {
  const q = query.trim().toLowerCase();
  return messages.filter((m) => {
    if (status !== 'all' && m.status !== status) return false;
    if (!q) return true;
    return [m.name, m.email, m.message].some((field) => field.toLowerCase().includes(q));
  });
}

/** "Jane Doe" → "JD", "jane" → "J". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const letters = parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0];
  return letters.toUpperCase();
}

/** Short relative time like the demo's activity feed: "2m ago", "3h ago", "4d ago", then a date. */
export function timeAgo(iso: string | null, now: Date = new Date()): string {
  if (!iso) return '—';
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('de-DE');
}

/**
 * The message to open after `ids` leave the list (archive, spam, delete):
 * the first remaining one below the current, else the nearest above, else none.
 */
export function nextAfter(list: { id: string }[], currentId: string | null, removed: string[]): string | null {
  const gone = new Set(removed);
  const start = currentId ? list.findIndex((m) => m.id === currentId) : -1;
  if (start === -1) return null;
  for (let i = start + 1; i < list.length; i++) if (!gone.has(list[i].id)) return list[i].id;
  for (let i = start - 1; i >= 0; i--) if (!gone.has(list[i].id)) return list[i].id;
  return null;
}

/** Previous/next message for j/k navigation; stays put at the ends. */
export function step(list: { id: string }[], currentId: string | null, delta: 1 | -1): string | null {
  if (list.length === 0) return null;
  const i = currentId ? list.findIndex((m) => m.id === currentId) : -1;
  if (i === -1) return list[delta === 1 ? 0 : list.length - 1].id;
  return list[Math.min(Math.max(i + delta, 0), list.length - 1)].id;
}

/**
 * The visible list for the inbox: status filter + search, but the open
 * message stays in place even after it stops matching (e.g. it was just
 * marked read while the "new" tab is shown) — like a mail client.
 */
export function visibleMessages(
  all: ContactMessage[],
  status: MessageStatus | 'all',
  query: string,
  openId: string | null
): ContactMessage[] {
  const matching = new Set(filterMessages(all, status, query).map((m) => m.id));
  return all.filter((m) => matching.has(m.id) || m.id === openId);
}

export function countByStatus(all: ContactMessage[]): Record<MessageStatus | 'all', number> {
  const counts = { new: 0, read: 0, archived: 0, spam: 0, all: all.length };
  for (const m of all) counts[m.status] += 1;
  return counts;
}
