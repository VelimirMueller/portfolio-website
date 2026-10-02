'use client';

import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { Metric, SeriesPoint, Totals, TrafficData } from '../../_lib/traffic';
import { useCountUp } from './hooks';
import { formatCount, formatDuration, trendText } from './format';
import { VIZ } from './Panel';

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const w = 72;
  const h = 22;
  const pts = values.map((v, i) => `${(i / Math.max(values.length - 1, 1)) * w},${h - 2 - (v / max) * (h - 4)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

function Trend({ value, lowerIsBetter = false }: { value: number | null; lowerIsBetter?: boolean }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#7c808b]" title="No comparable previous period">
        <Minus size={10} aria-hidden="true" />
        <span className="sr-only">no comparison</span>
      </span>
    );
  }
  const good = lowerIsBetter ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] ${good ? 'text-emerald-400' : 'text-rose-400'}`}
      title="Change vs the previous period of the same length"
    >
      <Icon size={10} aria-hidden="true" />
      {trendText(value)}
    </span>
  );
}

interface TileSpec {
  key: keyof Totals;
  label: string;
  hint: string;
  metric?: Metric;
  format: (n: number) => string;
  lowerIsBetter?: boolean;
}

const TILES: TileSpec[] = [
  { key: 'visitors', label: 'Visitors', hint: 'Daily-unique', metric: 'visitors', format: formatCount },
  { key: 'pageviews', label: 'Page views', hint: 'All views', metric: 'pageviews', format: formatCount },
  { key: 'clicks', label: 'Clicks', hint: 'Links & buttons', metric: 'clicks', format: formatCount },
  { key: 'bounceRate', label: 'Bounce rate', hint: 'One page, no click', format: (n) => `${n.toFixed(1)}%`, lowerIsBetter: true },
  { key: 'avgDuration', label: 'Avg. session', hint: 'First → last event', format: formatDuration },
];

function Tile({
  spec,
  data,
  selected,
  onSelect,
  index,
  wide = false,
}: {
  wide?: boolean;
  spec: TileSpec;
  data: TrafficData;
  selected: boolean;
  onSelect?: () => void;
  index: number;
}) {
  const shown = useCountUp(data.totals[spec.key]);
  const color = spec.metric ? VIZ[spec.metric] : null;
  const spark = spec.metric ? data.series.map((p: SeriesPoint) => p[spec.metric as Metric]) : null;

  const body = (
    <>
      {color && (
        <span
          aria-hidden="true"
          className={`absolute inset-x-5 bottom-0 h-0.5 rounded-full transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        />
      )}
      <div className="flex h-[22px] items-start justify-between gap-2">
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">{spec.label}</span>
        {spark && color && <Sparkline values={spark} color={color} />}
      </div>
      <div className="mt-3 font-mono text-2xl font-bold tabular-nums text-white">{spec.format(shown)}</div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-gray-400">{spec.hint}</span>
        <Trend value={data.trends[spec.key]} lowerIsBetter={spec.lowerIsBetter} />
      </div>
    </>
  );

  const base = `group relative overflow-hidden rounded-[1.5rem] border p-5 ${wide ? 'col-span-2 lg:col-span-1' : ''} text-left transition-all motion-safe:animate-fade-in-up ${
    selected ? 'border-white/20 bg-white/[0.04]' : 'border-white/[0.07] bg-[#0b0b10]/90 hover:border-white/[0.14]'
  }`;

  if (!onSelect) {
    return (
      <div className={base} style={{ animationDelay: `${index * 60}ms` }}>
        {body}
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      title={`Chart ${spec.label.toLowerCase()} (${spec.label[0].toLowerCase()})`}
      className={`${base} hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 motion-reduce:hover:translate-y-0`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {body}
    </button>
  );
}

/** The headline numbers. Metric tiles are toggles: they choose what the main chart plots. */
export function StatTiles({ data, metric, onMetric }: { data: TrafficData; metric: Metric; onMetric: (m: Metric) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {TILES.map((spec, i) => (
        <Tile
          key={spec.key}
          wide={i === TILES.length - 1}
          spec={spec}
          data={data}
          index={i}
          selected={spec.metric === metric}
          onSelect={spec.metric ? () => onMetric(spec.metric as Metric) : undefined}
        />
      ))}
    </div>
  );
}
