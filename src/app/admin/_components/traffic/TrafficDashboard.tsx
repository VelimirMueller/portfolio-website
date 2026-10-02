'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Command, Pause, Play, RefreshCw } from 'lucide-react';
import {
  FILTER_KEYS,
  METRICS,
  RANGES,
  RANGE_KEYS,
  type FilterKey,
  type Metric,
  type TrafficData,
  type TrafficParams,
} from '../../_lib/traffic';
import { RangeControl, FilterChips, filterValueLabel } from './Controls';
import { StatTiles } from './StatTiles';
import { TrafficChart } from './TrafficChart';
import { Heatmap } from './Heatmap';
import { BarList, Tabs } from './BarList';
import { FlowExplorer } from './FlowExplorer';
import { ClickBoard } from './ClickBoard';
import { LiveFeed } from './LiveFeed';
import { CommandPalette, type PaletteAction } from './CommandPalette';
import { Panel } from './Panel';
import { isTyping, useNow, useTrafficNav } from './hooks';
import { countryName, flagOf, formatAgo, sourceLabel } from './format';
import { KPI_VIEWS, KpiSection, isVisible, useKpiView } from '../kpi/views';

const REFRESH_MS = 30_000;
const METRIC_KEYS: Record<string, Metric> = { v: 'visitors', p: 'pageviews', c: 'clicks' };
const METRIC_LABEL: Record<Metric, string> = { visitors: 'Visitors', pageviews: 'Page views', clicks: 'Clicks' };
type AudienceTab = 'country' | 'device' | 'browser';


function LivePulse({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.08] px-3 py-1 font-mono text-xs text-emerald-200"
      title="Visitors active in the last 5 minutes"
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {count > 0 && <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${count > 0 ? 'bg-emerald-400' : 'bg-gray-600'}`} />
      </span>
      <strong className="tabular-nums">{count}</strong> live
    </span>
  );
}

/**
 * The traffic section of /admin/kpis. Server-computed TrafficData in, URL
 * state out: every control writes search params, the server recomputes, and
 * the transition keeps the old frame on screen (dimmed) meanwhile.
 *
 * Keyboard: 1–4 range · v/p/c metric · r refresh · ⌘K or / palette ·
 * Backspace clears the newest filter.
 */
export function TrafficDashboard({
  data,
  params,
  loadError,
  capped,
  generatedAt,
}: {
  data: TrafficData;
  params: TrafficParams;
  loadError: boolean;
  capped: boolean;
  generatedAt: string;
}) {
  const { set, refresh, pending } = useTrafficNav();
  const { filters, metric } = params;
  const [compare, setCompare] = useState(true);
  const [live, setLive] = useState(true);
  const [palette, setPalette] = useState(false);
  const [audience, setAudience] = useState<AudienceTab>('country');
  const now = useNow(5_000);
  const { view, setView } = useKpiView();
  const trafficShown = isVisible(view, 'traffic');

  const setFilter = useCallback((key: FilterKey, value: string | null) => set({ [key]: value, ...(key === 'page' ? { focus: null } : {}) }), [set]);
  const clearFilters = useCallback(() => set(Object.fromEntries([...FILTER_KEYS, 'focus'].map((k) => [k, null]))), [set]);
  const setRange = useCallback((range: string) => set({ range: range === '7d' ? null : range }), [set]);
  const setMetric = useCallback((m: Metric) => set({ metric: m === 'visitors' ? null : m }), [set]);

  // Auto-refresh while the tab is visible.
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [live, refresh]);

  // Page-wide shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((o) => !o);
        return;
      }
      // Traffic shortcuts only while traffic is on screen (not in the Messages view).
      if (palette || !trafficShown || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === '/') {
        e.preventDefault();
        setPalette(true);
      } else if (/^[1-4]$/.test(e.key)) {
        setRange(RANGE_KEYS[Number(e.key) - 1]);
      } else if (METRIC_KEYS[e.key]) {
        setMetric(METRIC_KEYS[e.key]);
      } else if (e.key === 'r') {
        refresh();
      } else if (e.key === 'Backspace') {
        const last = [...FILTER_KEYS].reverse().find((k) => filters[k]);
        if (last) setFilter(last, null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [palette, trafficShown, filters, setRange, setMetric, setFilter, refresh]);

  const actions = useMemo<PaletteAction[]>(() => {
    const list: PaletteAction[] = [
      ...RANGE_KEYS.map((r, i) => ({ id: `range-${r}`, group: 'Range', label: `Last ${RANGES[r].label}`, hint: String(i + 1), run: () => setRange(r) })),
      ...METRICS.map((m) => ({ id: `metric-${m}`, group: 'Chart', label: `Chart ${METRIC_LABEL[m].toLowerCase()}`, hint: m[0], run: () => setMetric(m) })),
      { id: 'compare', group: 'Chart', label: compare ? 'Hide previous period' : 'Compare with previous period', run: () => setCompare((c) => !c) },
      ...data.pages.map((p) => ({ id: `page-${p.key}`, group: 'Filter by page', label: p.key, run: () => setFilter('page', p.key) })),
      ...data.sources.map((s) => ({ id: `source-${s.key}`, group: 'Filter by source', label: sourceLabel(s.key), run: () => setFilter('source', s.key) })),
      ...data.pages.map((p) => ({ id: `focus-${p.key}`, group: 'Explore flow of', label: p.key, run: () => (set({ focus: p.key }), setView('flow')) })),
      ...KPI_VIEWS.map((v) => ({ id: `view-${v.id}`, group: 'Show section', label: `${v.label} — ${v.hint}`, run: () => setView(v.id) })),
      { id: 'refresh', group: 'Data', label: 'Refresh now', hint: 'r', run: refresh },
      { id: 'live', group: 'Data', label: live ? 'Pause auto-refresh' : 'Resume auto-refresh', run: () => setLive((l) => !l) },
    ];
    if (FILTER_KEYS.some((k) => filters[k])) list.unshift({ id: 'clear', group: 'Filters', label: 'Clear all filters', hint: '⌫', run: clearFilters });
    return list;
  }, [data.pages, data.sources, compare, live, filters, set, setRange, setMetric, setFilter, clearFilters, refresh, setView]);

  const hasFilters = FILTER_KEYS.some((k) => filters[k]);
  const empty = data.rawEvents === 0 && !hasFilters;
  const audienceRows = audience === 'country' ? data.countries : audience === 'device' ? data.devices : data.browsers;

  return (
    <>
    <KpiSection id="traffic">
    <section aria-labelledby="kpi-traffic" aria-describedby="traffic-shortcuts" className="relative space-y-4">
      <p id="traffic-shortcuts" className="sr-only">
        Keyboard shortcuts: 1 to 4 choose the time range, V, P and C choose the charted metric, R refreshes, Backspace removes the newest
        filter, Control or Command K opens the command palette.
      </p>
      {/* Grid backdrop at ~5% — atmosphere, never competing with data. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 -top-4 h-[420px] opacity-[0.05] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300/70">First-party · cookieless</p>
          <h2 id="kpi-traffic" className="bg-gradient-to-r from-white via-cyan-100 to-fuchsia-200 bg-clip-text text-2xl font-bold text-transparent">
            Traffic
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LivePulse count={data.live} />
          <span className="font-mono text-[10px] text-gray-400" aria-live="polite">
            {pending ? 'Updating…' : `Updated ${formatAgo(generatedAt, now)}${formatAgo(generatedAt, now) === 'now' ? '' : ' ago'}`}
          </span>
          <button
            type="button"
            onClick={() => setLive((l) => !l)}
            aria-pressed={live}
            title={live ? 'Pause auto-refresh (every 30 s)' : 'Resume auto-refresh'}
            className="rounded-full border border-white/[0.08] p-2 text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {live ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
            <span className="sr-only">Auto-refresh</span>
          </button>
          <button
            type="button"
            onClick={refresh}
            title="Refresh now (r)"
            className="rounded-full border border-white/[0.08] p-2 text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <RefreshCw size={13} aria-hidden="true" className={pending ? 'motion-safe:animate-spin' : ''} />
            <span className="sr-only">Refresh</span>
          </button>
        </div>
      </div>

      {/* One filter row above everything it scopes. */}
      <div className="sticky top-[4.25rem] z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#050505]/80 px-2 py-2 backdrop-blur-md">
        <RangeControl value={filters.range} onChange={setRange} />
        <FilterChips filters={filters} onRemove={(k) => setFilter(k, null)} onClear={clearFilters} />
        <button
          type="button"
          onClick={() => setPalette(true)}
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ml-auto"
        >
          <Command size={12} aria-hidden="true" />
          <span className="hidden sm:inline">Commands</span>
          <span className="sr-only sm:hidden">Commands</span>
          <kbd className="rounded border border-white/10 px-1 font-mono text-[10px] text-gray-400">⌘K</kbd>
        </button>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-300">
          Could not load analytics events. Is the analytics migration applied?
        </p>
      )}
      {capped && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
          Showing the newest 50,000 events — the earliest part of the comparison period is left out.
        </p>
      )}

      <div className={`relative space-y-4 transition-opacity duration-200 ${pending ? 'opacity-60' : 'opacity-100'}`} aria-busy={pending}>
        {empty ? (
          <Panel id="traffic-empty" kicker="Setup" title="No events collected yet">
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-gray-400">
              <li>
                Apply <code className="font-mono text-cyan-200">supabase/migrations/20261002120000_analytics_events.sql</code>.
              </li>
              <li>
                Store the hashed ingest secret in <code className="font-mono text-cyan-200">analytics_private.ingest_secret</code> and the
                plain value as <code className="font-mono text-cyan-200">ANALYTICS_INGEST_SECRET</code> in Vercel.
              </li>
              <li>Redeploy, then open the site in a normal browser window (headless browsers, Do Not Track and your admin session are not counted).</li>
            </ol>
          </Panel>
        ) : (
          <>
            <KpiSection id="overview" className="space-y-4">
            <StatTiles data={data} metric={metric} onMetric={setMetric} />
            <Panel
              id="traffic-trend"
              kicker={`Last ${RANGES[filters.range].label}`}
              title={`${METRIC_LABEL[metric]} over time`}
              actions={
                <button
                  type="button"
                  aria-pressed={compare}
                  onClick={() => setCompare((c) => !c)}
                  className={`rounded-full border px-3 py-1 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                    compare ? 'border-white/20 bg-white/[0.06] text-white' : 'border-white/[0.08] text-gray-400 hover:text-white'
                  }`}
                >
                  Compare
                </button>
              }
            >
              <TrafficChart
                series={data.series}
                previous={data.previousSeries}
                metric={metric}
                compare={compare}
                rangeLabel={RANGES[filters.range].label}
                total={data.totals[metric]}
                previousTotal={data.previous[metric]}
              />
            </Panel>
            </KpiSection>

            <KpiSection id="when">
            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
              <Panel id="traffic-heatmap" kicker="Berlin time" title="When visitors come" className="xl:col-span-2">
                <Heatmap grid={data.heatmap} />
              </Panel>
              <Panel id="traffic-feed" kicker="Newest first" title="Live feed">
                <div tabIndex={0} role="region" aria-label="Live feed, scrollable" className="max-h-[17.5rem] overflow-y-auto rounded-lg pr-1 [scrollbar-width:thin] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                  <LiveFeed items={data.feed} />
                </div>
              </Panel>
            </div>
            </KpiSection>

            <KpiSection id="audience">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Panel id="traffic-pages" kicker="Click to filter" title="Top pages">
                <BarList
                  label="Top pages"
                  rows={data.pages}
                  active={filters.page}
                  onSelect={(k) => setFilter('page', k)}
                  render={(k) => <span className="font-mono text-xs">{k}</span>}
                  secondary={{ label: 'Views', value: (r) => r.count }}
                />
              </Panel>
              <Panel id="traffic-sources" kicker="Where they came from" title="Sources">
                <BarList label="Sources" rows={data.sources} active={filters.source} onSelect={(k) => setFilter('source', k)} render={sourceLabel} />
              </Panel>
              <Panel
                id="traffic-audience"
                kicker="Who"
                title="Audience"
                actions={
                  <Tabs
                    label="Audience dimension"
                    value={audience}
                    onChange={setAudience}
                    tabs={[
                      { key: 'country', label: 'Country' },
                      { key: 'device', label: 'Device' },
                      { key: 'browser', label: 'Browser' },
                    ]}
                  />
                }
              >
                <div role="tabpanel" aria-label={`Visitors by ${audience}`}>
                  <BarList
                    label={`Visitors by ${audience}`}
                    rows={audienceRows}
                    active={filters[audience]}
                    onSelect={(k) => setFilter(audience, k)}
                    render={(k) => (audience === 'country' ? `${flagOf(k)} ${countryName(k)}` : <span className="capitalize">{k}</span>)}
                  />
                </div>
              </Panel>
            </div>
            </KpiSection>

            <KpiSection id="flow">
            <Panel id="traffic-flow" kicker="Navigation" title="Flow explorer">
              <FlowExplorer
                flow={data.flow}
                pages={data.pages}
                onFocus={(path) => set({ focus: path })}
                onSource={(source) => setFilter('source', source)}
              />
            </Panel>
            </KpiSection>

            <KpiSection id="clicks">
            <Panel id="traffic-clicks" kicker="Interaction" title="What people click">
              <ClickBoard rows={data.clicks} onPage={(path) => setFilter('page', path)} />
            </Panel>
            </KpiSection>
          </>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {FILTER_KEYS.filter((k) => filters[k])
          .map((k) => `${k}: ${filterValueLabel(k, filters[k] as string)}`)
          .join(', ')}
      </p>

    </section>
    </KpiSection>

    {/* Outside the traffic section: ⌘K works in every view, including Messages. */}
    <CommandPalette open={palette} onClose={() => setPalette(false)} actions={actions} />
    </>
  );
}
