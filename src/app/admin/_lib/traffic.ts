import { KPI_TIME_ZONE } from './kpis';

/**
 * Traffic KPIs from the first-party analytics events (supabase migration
 * 20261002120000). Everything is computed here, in one pass over the raw
 * events, so the server page stays a loader and every number is unit-tested.
 *
 * Model:
 * - A visitor is a daily hash (it rotates every UTC day by design): the same
 *   person has a different hash each day. Counting distinct hashes over a
 *   window therefore gives daily-unique visitors summed over its days — no
 *   (visitor, day) pairing is needed, the hash already is one.
 * - A session is a visitor's run of events without a gap of 30 minutes.
 * - Filters select sessions (by source, country, device, browser, or "saw
 *   this page"), and every figure below is computed from the same selection,
 *   so the tiles, charts and lists always agree.
 */

export const RANGES = {
  '24h': { label: '24 hours', short: '24h', bucket: 'hour', count: 24 },
  '7d': { label: '7 days', short: '7d', bucket: 'day', count: 7 },
  '30d': { label: '30 days', short: '30d', bucket: 'day', count: 30 },
  '90d': { label: '90 days', short: '90d', bucket: 'day', count: 90 },
} as const;
export type RangeKey = keyof typeof RANGES;
export const RANGE_KEYS = Object.keys(RANGES) as RangeKey[];
export const DEFAULT_RANGE: RangeKey = '7d';

/** Raw events are kept this long (migration retention); older comparisons are incomplete. */
export const RETENTION_DAYS = 90;
export const SESSION_GAP_MS = 30 * 60 * 1000;
export const LIVE_WINDOW_MS = 5 * 60 * 1000;
/** Label for sessions without a referrer. */
export const DIRECT = '(direct)';

export const METRICS = ['visitors', 'pageviews', 'clicks'] as const;
export type Metric = (typeof METRICS)[number];

export const FILTER_KEYS = ['page', 'source', 'country', 'device', 'browser'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];

export interface TrafficEvent {
  created_at: string;
  type: 'pageview' | 'click';
  visitor: string;
  path: string;
  prev_path: string | null;
  referrer: string | null;
  target: string | null;
  country: string | null;
  device: string | null;
  browser: string | null;
}

export type TrafficFilters = { range: RangeKey } & Partial<Record<FilterKey, string>>;

export interface TrafficParams {
  filters: TrafficFilters;
  metric: Metric;
  /** Page the flow explorer is centred on; defaults to the top page. */
  focus: string | null;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** URL search params → validated dashboard state. Unknown values fall back to defaults. */
export function parseTrafficParams(sp: SearchParams): TrafficParams {
  const range = first(sp.range);
  const metric = first(sp.metric);
  const filters: TrafficFilters = {
    range: range && range in RANGES ? (range as RangeKey) : DEFAULT_RANGE,
  };
  for (const key of FILTER_KEYS) {
    const value = first(sp[key])?.trim();
    if (value) filters[key] = value.slice(0, 300);
  }
  const focus = first(sp.focus)?.trim();
  return {
    filters,
    metric: METRICS.includes(metric as Metric) ? (metric as Metric) : 'visitors',
    focus: focus?.startsWith('/') ? focus.slice(0, 300) : null,
  };
}

// ---------------------------------------------------------------- time

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const WEEKDAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

const berlinParts = new Intl.DateTimeFormat('en-CA', {
  timeZone: KPI_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  weekday: 'short',
});

type Clock = { day: number; hour: number; weekday: number };
const clockCache = new Map<number, Clock>();

/**
 * Berlin calendar day (as a UTC-midnight timestamp), hour and weekday
 * (0 = Monday) of an instant. Berlin's offset is a whole number of hours, so
 * the answer is constant per UTC hour and cached by it — formatToParts is the
 * expensive part when this runs for tens of thousands of events.
 */
export function berlinClock(ms: number): Clock {
  const key = Math.floor(ms / HOUR_MS);
  const cached = clockCache.get(key);
  if (cached) return cached;
  const p = Object.fromEntries(berlinParts.formatToParts(new Date(key * HOUR_MS)).map((x) => [x.type, x.value]));
  const clock = {
    day: Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day)),
    hour: Number(p.hour) % 24,
    weekday: WEEKDAY_INDEX[p.weekday],
  };
  if (clockCache.size > 5000) clockCache.clear();
  clockCache.set(key, clock);
  return clock;
}

export interface TrafficWindow {
  /** Bucket index for an instant: 0..count-1 in the current window, -count..-1 in the previous one, null outside. */
  bucketOf: (ms: number) => number | null;
  /** Label for bucket i of the current window. */
  labelOf: (i: number) => string;
  /** ISO start of bucket i, for the table view and tooltips. */
  startOf: (i: number) => string;
  /** Earliest instant needed (start of the previous window), for the database query. */
  since: Date;
  /** True when the previous window reaches past the retention period. */
  previousIncomplete: boolean;
}

export function trafficWindow(range: RangeKey, now: Date): TrafficWindow {
  const { bucket, count } = RANGES[range];
  const nowMs = now.getTime();

  if (bucket === 'hour') {
    // The current hour is the last bucket; Berlin is a whole-hour offset, so UTC hour starts are Berlin hour starts.
    const lastStart = Math.floor(nowMs / HOUR_MS) * HOUR_MS;
    const firstStart = lastStart - (count - 1) * HOUR_MS;
    return {
      bucketOf: (ms) => {
        const i = Math.floor((ms - firstStart) / HOUR_MS);
        return i >= -count && i < count ? i : null;
      },
      labelOf: (i) => `${String(berlinClock(firstStart + i * HOUR_MS).hour).padStart(2, '0')}:00`,
      startOf: (i) => new Date(firstStart + i * HOUR_MS).toISOString(),
      since: new Date(firstStart - count * HOUR_MS),
      previousIncomplete: false,
    };
  }

  const today = berlinClock(nowMs).day;
  const firstDay = today - (count - 1) * DAY_MS;
  return {
    bucketOf: (ms) => {
      const i = Math.round((berlinClock(ms).day - firstDay) / DAY_MS);
      return i >= -count && i < count ? i : null;
    },
    labelOf: (i) => {
      const d = new Date(firstDay + i * DAY_MS);
      return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.`;
    },
    startOf: (i) => new Date(firstDay + i * DAY_MS).toISOString().slice(0, 10),
    // Berlin is at most UTC+2: two extra days back cover the previous window's first local day.
    since: new Date(firstDay - count * DAY_MS - 2 * DAY_MS),
    previousIncomplete: 2 * count > RETENTION_DAYS,
  };
}

// ---------------------------------------------------------------- sessions

export interface Session {
  visitor: string;
  start: number;
  end: number;
  /** Page views in order. */
  views: TrafficEvent[];
  clicks: TrafficEvent[];
  source: string;
  country: string | null;
  device: string | null;
  browser: string | null;
}

const ms = (e: TrafficEvent) => Date.parse(e.created_at);

/** Groups events into sessions: per visitor, split where the gap exceeds SESSION_GAP_MS. */
export function buildSessions(events: TrafficEvent[]): Session[] {
  const byVisitor = new Map<string, TrafficEvent[]>();
  for (const e of events) {
    const list = byVisitor.get(e.visitor);
    if (list) list.push(e);
    else byVisitor.set(e.visitor, [e]);
  }

  const sessions: Session[] = [];
  for (const [visitor, list] of byVisitor) {
    list.sort((a, b) => ms(a) - ms(b));
    let current: Session | null = null;
    for (const e of list) {
      const t = ms(e);
      if (!current || t - current.end > SESSION_GAP_MS) {
        current = { visitor, start: t, end: t, views: [], clicks: [], source: DIRECT, country: e.country, device: e.device, browser: e.browser };
        sessions.push(current);
      }
      current.end = t;
      if (e.type === 'pageview') {
        if (current.views.length === 0) current.source = e.referrer ?? DIRECT;
        current.views.push(e);
      } else {
        current.clicks.push(e);
      }
    }
  }
  return sessions.sort((a, b) => a.start - b.start);
}

export function matchesFilters(s: Session, f: TrafficFilters): boolean {
  if (f.source && s.source !== f.source) return false;
  if (f.country && s.country !== f.country) return false;
  if (f.device && s.device !== f.device) return false;
  if (f.browser && s.browser !== f.browser) return false;
  if (f.page && !s.views.some((v) => v.path === f.page)) return false;
  return true;
}

// ---------------------------------------------------------------- KPIs

export interface Totals {
  visitors: number;
  pageviews: number;
  sessions: number;
  clicks: number;
  /** Share of sessions with one page view and no click, 0–100, one decimal. */
  bounceRate: number;
  /** Mean session length in seconds (first to last event). */
  avgDuration: number;
}

export interface Ranked {
  key: string;
  visitors: number;
  /** Page views, for pages; equals visitors elsewhere. */
  count: number;
}

export interface FlowNode {
  key: string;
  kind: 'page' | 'source' | 'exit' | 'other';
  count: number;
}

export interface Flow {
  focus: string;
  views: number;
  inbound: FlowNode[];
  outbound: FlowNode[];
}

export interface ClickRow {
  target: string;
  count: number;
  visitors: number;
  /** Page with the most clicks on this target. */
  topPage: string;
}

export interface FeedItem {
  at: string;
  type: 'pageview' | 'click';
  path: string;
  detail: string | null;
  country: string | null;
  device: string | null;
}

export interface SeriesPoint {
  label: string;
  start: string;
  visitors: number;
  pageviews: number;
  clicks: number;
}

export interface TrafficData {
  range: RangeKey;
  live: number;
  totals: Totals;
  previous: Totals;
  /** Percent change vs the previous window per metric; null without a fair comparison. */
  trends: Record<keyof Totals, number | null>;
  series: SeriesPoint[];
  previousSeries: SeriesPoint[];
  /** Distinct visitors per weekday (0 = Monday) × hour, Berlin time. */
  heatmap: number[][];
  pages: Ranked[];
  sources: Ranked[];
  countries: Ranked[];
  devices: Ranked[];
  browsers: Ranked[];
  flow: Flow | null;
  clicks: ClickRow[];
  feed: FeedItem[];
  /** Raw events in the current window before filters — 0 means nothing was ever collected. */
  rawEvents: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

function totalsOf(sessions: Session[]): Totals {
  const visitors = new Set<string>();
  let pageviews = 0;
  let clicks = 0;
  let bounces = 0;
  let duration = 0;
  for (const s of sessions) {
    visitors.add(s.visitor);
    pageviews += s.views.length;
    clicks += s.clicks.length;
    if (s.views.length <= 1 && s.clicks.length === 0) bounces += 1;
    duration += s.end - s.start;
  }
  const n = sessions.length;
  return {
    visitors: visitors.size,
    pageviews,
    sessions: n,
    clicks,
    bounceRate: n ? round1((bounces / n) * 100) : 0,
    avgDuration: n ? Math.round(duration / n / 1000) : 0,
  };
}

function trend(current: number, previous: number, fair: boolean): number | null {
  if (!fair || previous === 0) return null;
  return round1(((current - previous) / previous) * 100);
}

/** Counts distinct visitors per key, sorted desc, top `limit`. */
function rank(pairs: Iterable<[string, string]>, limit: number, counts?: Map<string, number>): Ranked[] {
  const visitors = new Map<string, Set<string>>();
  for (const [key, visitor] of pairs) {
    const set = visitors.get(key);
    if (set) set.add(visitor);
    else visitors.set(key, new Set([visitor]));
  }
  return [...visitors]
    .map(([key, set]) => ({ key, visitors: set.size, count: counts?.get(key) ?? set.size }))
    .sort((a, b) => b.visitors - a.visitors || b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit);
}

const FLOW_LIMIT = 6;

/** Keeps the top FLOW_LIMIT-1 nodes and folds the rest into one "other" node. */
function foldNodes(counts: Map<string, FlowNode>): FlowNode[] {
  const nodes = [...counts.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
  if (nodes.length <= FLOW_LIMIT) return nodes;
  const kept = nodes.slice(0, FLOW_LIMIT - 1);
  const rest = nodes.slice(FLOW_LIMIT - 1).reduce((sum, n) => sum + n.count, 0);
  return [...kept, { key: 'other', kind: 'other', count: rest }];
}

export function computeFlow(sessions: Session[], focus: string): Flow | null {
  const inbound = new Map<string, FlowNode>();
  const outbound = new Map<string, FlowNode>();
  let views = 0;
  const bump = (map: Map<string, FlowNode>, key: string, kind: FlowNode['kind']) => {
    const id = `${kind}:${key}`;
    const node = map.get(id);
    if (node) node.count += 1;
    else map.set(id, { key, kind, count: 1 });
  };

  for (const s of sessions) {
    s.views.forEach((v, i) => {
      if (v.path !== focus) return;
      views += 1;
      if (i === 0) bump(inbound, s.source, 'source');
      else bump(inbound, s.views[i - 1].path, 'page');
      const next = s.views[i + 1];
      if (next) bump(outbound, next.path, 'page');
      else bump(outbound, 'exit', 'exit');
    });
  }
  if (!views) return null;
  return { focus, views, inbound: foldNodes(inbound), outbound: foldNodes(outbound) };
}

export function computeTraffic(
  events: TrafficEvent[],
  params: Pick<TrafficParams, 'filters' | 'focus'>,
  now: Date = new Date()
): TrafficData {
  const { filters, focus } = params;
  const { count } = RANGES[filters.range];
  const win = trafficWindow(filters.range, now);
  const nowMs = now.getTime();

  // Live: unfiltered, anyone active in the last few minutes.
  const live = new Set(events.filter((e) => nowMs - ms(e) <= LIVE_WINDOW_MS && ms(e) <= nowMs).map((e) => e.visitor)).size;

  const current: TrafficEvent[] = [];
  const previous: TrafficEvent[] = [];
  for (const e of events) {
    const i = win.bucketOf(ms(e));
    if (i === null) continue;
    (i >= 0 ? current : previous).push(e);
  }

  const sessions = buildSessions(current).filter((s) => matchesFilters(s, filters));
  const prevSessions = buildSessions(previous).filter((s) => matchesFilters(s, filters));
  const totals = totalsOf(sessions);
  const prevTotals = totalsOf(prevSessions);
  const fair = !win.previousIncomplete;
  const trends = Object.fromEntries(
    (Object.keys(totals) as (keyof Totals)[]).map((k) => [k, trend(totals[k], prevTotals[k], fair)])
  ) as Record<keyof Totals, number | null>;

  // Series (current and previous window, aligned by bucket index).
  const emptySeries = (offset: number): SeriesPoint[] =>
    Array.from({ length: count }, (_, i) => ({ label: win.labelOf(i + offset), start: win.startOf(i + offset), visitors: 0, pageviews: 0, clicks: 0 }));
  const series = emptySeries(0);
  const previousSeries = emptySeries(-count);
  const fill = (list: Session[], target: SeriesPoint[], offset: number) => {
    const seen = target.map(() => new Set<string>());
    for (const s of list) {
      for (const e of [...s.views, ...s.clicks]) {
        const i = (win.bucketOf(ms(e)) ?? NaN) + offset;
        if (!(i >= 0 && i < count)) continue;
        if (e.type === 'pageview') {
          target[i].pageviews += 1;
          seen[i].add(s.visitor);
        } else {
          target[i].clicks += 1;
        }
      }
    }
    seen.forEach((set, i) => (target[i].visitors = set.size));
  };
  fill(sessions, series, 0);
  fill(prevSessions, previousSeries, count);

  // Heatmap: distinct visitors per weekday × hour.
  const cells = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => new Set<string>()));
  const views = sessions.flatMap((s) => s.views);
  for (const v of views) {
    const { weekday, hour } = berlinClock(ms(v));
    cells[weekday][hour].add(v.visitor);
  }

  const pageCounts = new Map<string, number>();
  for (const v of views) pageCounts.set(v.path, (pageCounts.get(v.path) ?? 0) + 1);
  const pages = rank(views.map((v) => [v.path, v.visitor]), 10, pageCounts);

  const bySession = (pick: (s: Session) => string | null) =>
    rank(sessions.flatMap((s) => (pick(s) ? [[pick(s) as string, s.visitor] as [string, string]] : [])), 8);

  // Clicks.
  const clickMap = new Map<string, { count: number; visitors: Set<string>; pages: Map<string, number> }>();
  for (const s of sessions) {
    for (const c of s.clicks) {
      if (!c.target) continue;
      const row = clickMap.get(c.target) ?? { count: 0, visitors: new Set<string>(), pages: new Map<string, number>() };
      row.count += 1;
      row.visitors.add(s.visitor);
      row.pages.set(c.path, (row.pages.get(c.path) ?? 0) + 1);
      clickMap.set(c.target, row);
    }
  }
  const clicks = [...clickMap]
    .map(([target, r]) => ({
      target,
      count: r.count,
      visitors: r.visitors.size,
      topPage: [...r.pages].sort((a, b) => b[1] - a[1])[0][0],
    }))
    .sort((a, b) => b.count - a.count || a.target.localeCompare(b.target))
    .slice(0, 12);

  const feed = sessions
    .flatMap((s) => [...s.views, ...s.clicks].map((e) => ({ e, s })))
    .sort((a, b) => ms(b.e) - ms(a.e))
    .slice(0, 15)
    .map(({ e, s }) => ({
      at: e.created_at,
      type: e.type,
      path: e.path,
      detail: e.type === 'click' ? e.target : s.views[0] === e ? s.source : null,
      country: e.country,
      device: e.device,
    }));

  const focusPage = focus ?? filters.page ?? pages[0]?.key ?? null;

  return {
    range: filters.range,
    live,
    totals,
    previous: prevTotals,
    trends,
    series,
    previousSeries,
    heatmap: cells.map((row) => row.map((set) => set.size)),
    pages,
    sources: bySession((s) => s.source),
    countries: bySession((s) => s.country),
    devices: bySession((s) => s.device),
    browsers: bySession((s) => s.browser),
    flow: focusPage ? computeFlow(sessions, focusPage) : null,
    clicks,
    feed,
    rawEvents: current.length,
  };
}
