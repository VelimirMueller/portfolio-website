import { MESSAGE_STATUSES, type ContactMessage, type MessageStatus } from './messages';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Days and weekdays are counted in the site owner's time zone, not UTC. */
export const KPI_TIME_ZONE = 'Europe/Berlin';
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
  /** Received per weekday (Mon–Sun, Berlin time) over all time. */
  byWeekday: number[];
}

const localParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: KPI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
});
const WEEKDAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

/** Calendar day in KPI_TIME_ZONE as a UTC-midnight timestamp, plus its weekday (0 = Monday). */
function localDay(d: Date): { day: number; weekday: number } {
  const parts = Object.fromEntries(localParts.formatToParts(d).map((p) => [p.type, p.value]));
  return {
    day: Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)),
    weekday: WEEKDAY_INDEX[parts.weekday],
  };
}

export function computeMessageKpis(messages: ContactMessage[], now: Date = new Date()): MessageKpis {
  const today = localDay(now).day;
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
    const { day, weekday } = localDay(new Date(m.created_at));
    if (day >= windowStart && day <= today) {
      current += 1;
      daily[Math.round((day - windowStart) / DAY_MS)].count += 1;
    } else if (day >= previousStart && day < windowStart) {
      previous += 1;
    }
    byWeekday[weekday] += 1;
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
