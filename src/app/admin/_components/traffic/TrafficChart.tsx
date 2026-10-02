'use client';

import { useMemo, useState } from 'react';
import type { Metric, SeriesPoint } from '../../_lib/traffic';
import { useElementWidth } from './hooks';
import { formatCount, trendText } from './format';
import { VIZ } from './Panel';

const HEIGHT = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 40 };
const METRIC_LABEL: Record<Metric, string> = { visitors: 'Visitors', pageviews: 'Page views', clicks: 'Clicks' };

/**
 * Axis scale: a 1/2/5 × 10ⁿ step that gives about four gridlines, and the
 * smallest multiple of it that fits the data — ticks read 0, 20, 40, 60.
 */
export function niceScale(value: number): { max: number; step: number } {
  const raw = Math.max(value, 4) / 4;
  const exp = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / exp;
  const step = Math.max(1, (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp);
  // Never below 4, so an empty or tiny series still gets a few gridlines.
  return { max: Math.ceil(Math.max(value, 4) / step) * step, step };
}

/**
 * Monotone cubic (Fritsch–Carlson) through every point: smooth, but it never
 * overshoots — a count curve must not dip below zero or above a peak.
 */
export function smoothPath(pts: [number, number][]): string {
  const n = pts.length;
  if (n === 0) return '';
  if (n < 3) return pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const dx = pts.slice(1).map((p, i) => p[0] - pts[i][0]);
  const slope = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / dx[i]);
  const m = pts.map((_, i) => {
    if (i === 0) return slope[0];
    if (i === n - 1) return slope[n - 2];
    return slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  });
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const h = dx[i] / 3;
    d += ` C${x0 + h},${y0 + m[i] * h} ${x1 - h},${y1 - m[i + 1] * h} ${x1},${y1}`;
  }
  return d;
}

/**
 * The main time series: the chosen metric as a glowing area, the previous
 * period as a dashed ghost line. A crosshair snaps to the nearest bucket on
 * hover; the same readout works from the keyboard (focus the chart, then
 * ←/→, Home/End). A data table carries every value without hovering.
 */
export function TrafficChart({
  series,
  previous,
  metric,
  compare,
  rangeLabel,
  total,
  previousTotal,
}: {
  /** Headline totals for the legend: distinct visitors are not the sum of per-bucket uniques. */
  total: number;
  previousTotal: number;
  series: SeriesPoint[];
  previous: SeriesPoint[];
  metric: Metric;
  compare: boolean;
  rangeLabel: string;
}) {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const color = VIZ[metric];

  const geo = useMemo(() => {
    const values = series.map((p) => p[metric]);
    const prevValues = previous.map((p) => p[metric]);
    const { max, step } = niceScale(Math.max(...values, ...(compare ? prevValues : []), 1));
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (series.length > 1 ? (i / (series.length - 1)) * innerW : innerW / 2);
    const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
    const pts = values.map((v, i) => [x(i), y(v)] as [number, number]);
    const prevPts = prevValues.map((v, i) => [x(i), y(v)] as [number, number]);
    const line = smoothPath(pts);
    const area = pts.length ? `${line} L${pts[pts.length - 1][0]},${y(0)} L${pts[0][0]},${y(0)} Z` : '';
    const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => ({ value: i * step, y: y(i * step) }));
    const labelEvery = Math.max(1, Math.ceil(series.length / Math.max(2, Math.floor(innerW / 64))));
    const last = series.length - 1;
    // Every n-th label plus the last one, minus any that would collide with the last.
    const showLabel = (i: number) => i === last || (i % labelEvery === 0 && last - i >= labelEvery * 0.75);
    return { values, prevValues, x, y, pts, line, area, prevLine: smoothPath(prevPts), ticks, showLabel, innerW };
  }, [series, previous, metric, compare, width]);

  const prevTotal = previousTotal;

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * width;
    const i = Math.round(((px - PAD.left) / geo.innerW) * (series.length - 1));
    setActive(Math.min(series.length - 1, Math.max(0, i)));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = series.length - 1;
    const cur = active ?? last;
    const next =
      e.key === 'ArrowRight' ? Math.min(last, cur + 1) :
      e.key === 'ArrowLeft' ? Math.max(0, cur - 1) :
      e.key === 'Home' ? 0 :
      e.key === 'End' ? last : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
  };

  const a = active === null ? null : { point: series[active], value: geo.values[active], prev: geo.prevValues[active] };
  const tipLeft = active === null ? 0 : Math.min(Math.max(geo.x(active), 90), width - 90);
  const gradientId = `area-${metric}`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-400">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
          {METRIC_LABEL[metric]} · {rangeLabel}
          <strong className="font-mono text-white">{formatCount(total)}</strong>
        </span>
        {compare && (
          <span className="inline-flex items-center gap-2">
            <svg width="16" height="4" aria-hidden="true">
              <line x1="0" y1="2" x2="16" y2="2" stroke={VIZ.previous} strokeWidth="2" strokeDasharray="3 3" />
            </svg>
            Previous period
            <strong className="font-mono text-gray-300">{formatCount(prevTotal)}</strong>
          </span>
        )}
      </div>

      <div ref={ref} className="relative">
        <svg
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="group"
          aria-roledescription="chart"
          aria-label={`${METRIC_LABEL[metric]} over ${rangeLabel}: ${formatCount(total)} in total. Focus and use the arrow keys to read each bucket, or open the data table below.`}
          tabIndex={0}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKeyDown}
          onFocus={() => setActive((i) => i ?? series.length - 1)}
          onBlur={() => setActive(null)}
          className="block touch-pan-y rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id="glow" x="-10%" y="-30%" width="120%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {geo.ticks.map((t) => (
            <g key={t.value}>
              <line x1={PAD.left} x2={width - PAD.right} y1={t.y} y2={t.y} stroke={VIZ.grid} />
              <text x={PAD.left - 8} y={t.y + 3} textAnchor="end" className="fill-[#7c808b] font-mono text-[10px]">
                {formatCount(t.value)}
              </text>
            </g>
          ))}
          {series.map((p, i) =>
            geo.showLabel(i) ? (
              <text
                key={p.start}
                x={geo.x(i)}
                y={HEIGHT - 8}
                textAnchor={i === 0 ? 'start' : i === series.length - 1 ? 'end' : 'middle'}
                className="fill-[#7c808b] font-mono text-[10px]">
                {p.label}
              </text>
            ) : null
          )}

          {compare && <path d={geo.prevLine} fill="none" stroke={VIZ.previous} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />}
          <path key={`a-${metric}`} d={geo.area} fill={`url(#${gradientId})`} className="motion-safe:animate-fade-in-up" />
          <path key={`l-${metric}`} d={geo.line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />

          {active !== null && (
            <g pointerEvents="none">
              <line x1={geo.x(active)} x2={geo.x(active)} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="rgba(255,255,255,0.25)" />
              {compare && <circle cx={geo.x(active)} cy={geo.y(geo.prevValues[active])} r="3.5" fill={VIZ.surface} stroke={VIZ.previous} strokeWidth="2" />}
              <circle cx={geo.x(active)} cy={geo.y(geo.values[active])} r="5" fill={VIZ.surface} stroke={color} strokeWidth="2.5" />
            </g>
          )}
        </svg>

        {a && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl border border-white/10 bg-black/85 px-3 py-2 text-xs shadow-xl backdrop-blur"
            style={{ left: tipLeft }}
          >
            <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-gray-400">{a.point.label}</div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="h-0.5 w-3 rounded" style={{ background: color }} />
              <strong className="font-mono text-sm text-white">{formatCount(a.value)}</strong>
              <span className="text-gray-400">{METRIC_LABEL[metric].toLowerCase()}</span>
            </div>
            {compare && (
              <div className="mt-0.5 flex items-center gap-2 text-gray-400">
                <span aria-hidden="true" className="h-0.5 w-3 rounded" style={{ background: VIZ.previous }} />
                <span className="font-mono text-gray-300">{formatCount(a.prev)}</span> before
                {a.prev > 0 && <span className="font-mono">({trendText(Math.round(((a.value - a.prev) / a.prev) * 1000) / 10)})</span>}
              </div>
            )}
          </div>
        )}
      </div>

      <details className="mt-3 text-xs text-gray-400">
        <summary className="cursor-pointer select-none hover:text-gray-300">Data table</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-white/[0.06]">
          <table className="w-full text-left font-mono">
            <thead className="sticky top-0 bg-[#0b0b10] text-gray-400">
              <tr>
                <th scope="col" className="px-3 py-1.5 font-normal">Bucket</th>
                <th scope="col" className="px-3 py-1.5 text-right font-normal">Visitors</th>
                <th scope="col" className="px-3 py-1.5 text-right font-normal">Page views</th>
                <th scope="col" className="px-3 py-1.5 text-right font-normal">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {series.map((p) => (
                <tr key={p.start} className="border-t border-white/[0.04] text-gray-300">
                  <td className="px-3 py-1">{p.label}</td>
                  <td className="px-3 py-1 text-right">{p.visitors}</td>
                  <td className="px-3 py-1 text-right">{p.pageviews}</td>
                  <td className="px-3 py-1 text-right">{p.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
