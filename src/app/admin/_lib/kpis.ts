import { MESSAGE_STATUSES, type ContactMessage, type MessageStatus } from './messages';

const DAY_MS = 24 * 60 * 60 * 1000;
export const KPI_WINDOW_DAYS = 30;
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export interface DayPoint {
  /** ISO date (YYYY-MM-DD, UTC). */
  date: string;
  count: number;
}

export interface MessageKpis {
  total: number;
  unread: number;
  /** Received in the last KPI_WINDOW_DAYS days, and in the window before that. */
  current: number;
  previous: number;
  /** Percent change current vs previous; null when there is nothing to compare against. */
  trend: number | null;
  /** Share of all messages marked spam, 0–100, one decimal. */
  spamRate: number;
  daily: DayPoint[];
  byStatus: { status: MessageStatus; count: number; pct: number }[];
  /** Received per weekday (Mon–Sun) over all time. */
  byWeekday: number[];
}

const dayStart = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());

export function computeMessageKpis(messages: ContactMessage[], now: Date = new Date()): MessageKpis {
  const today = dayStart(now);
  const windowStart = today - (KPI_WINDOW_DAYS - 1) * DAY_MS;
  const previousStart = windowStart - KPI_WINDOW_DAYS * DAY_MS;

  const daily: DayPoint[] = Array.from({ length: KPI_WINDOW_DAYS }, (_, i) => ({
    date: new Date(windowStart + i * DAY_MS).toISOString().slice(0, 10),
    count: 0,
  }));
  const byWeekday = new Array<number>(7).fill(0);
  let current = 0;
  let previous = 0;

  for (const m of messages) {
    if (!m.created_at) continue;
    const t = new Date(m.created_at);
    const day = dayStart(t);
    if (day >= windowStart && day <= today) {
      current += 1;
      daily[Math.round((day - windowStart) / DAY_MS)].count += 1;
    } else if (day >= previousStart && day < windowStart) {
      previous += 1;
    }
    byWeekday[(t.getUTCDay() + 6) % 7] += 1; // getUTCDay: 0 = Sunday → index 6
  }

  const total = messages.length;
  const count = (s: MessageStatus) => messages.filter((m) => m.status === s).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);

  return {
    total,
    unread: count('new'),
    current,
    previous,
    trend: previous ? Math.round(((current - previous) / previous) * 1000) / 10 : null,
    spamRate: pct(count('spam')),
    daily,
    byStatus: MESSAGE_STATUSES.map((status) => ({ status, count: count(status), pct: pct(count(status)) })),
    byWeekday,
  };
}
