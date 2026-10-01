import { MESSAGE_STATUSES, type ContactMessage, type MessageStatus } from './messages';

export const SPARKLINE_DAYS = 14;

export interface StatusSummary {
  status: MessageStatus;
  count: number;
  /** Messages received per day over the last SPARKLINE_DAYS days, oldest first. */
  daily: number[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Per-status counts plus a received-per-day series for the KPI sparklines. */
export function summarize(messages: ContactMessage[], now: Date = new Date()): StatusSummary[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const firstDay = today - (SPARKLINE_DAYS - 1) * DAY_MS;

  return MESSAGE_STATUSES.map((status) => {
    const ofStatus = messages.filter((m) => m.status === status);
    const daily = new Array<number>(SPARKLINE_DAYS).fill(0);
    for (const m of ofStatus) {
      if (!m.created_at) continue;
      const t = new Date(m.created_at).getTime();
      const index = Math.floor((t - firstDay) / DAY_MS);
      if (index >= 0 && index < SPARKLINE_DAYS) daily[index] += 1;
    }
    return { status, count: ofStatus.length, daily };
  });
}

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
