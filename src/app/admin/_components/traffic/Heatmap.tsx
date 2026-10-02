'use client';

import { useState } from 'react';
import { WEEKDAYS } from '../../_lib/kpis';
import { VIZ } from './Panel';

/** Sequential ramp, one hue: empty cell → full cyan, mixed in OKLab so steps look even. */
export function cellColor(value: number, max: number): string {
  if (!value || !max) return VIZ.cell;
  const t = 0.18 + 0.82 * (value / max);
  return `color-mix(in oklab, ${VIZ.visitors} ${Math.round(t * 100)}%, ${VIZ.cell})`;
}

const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`;

/**
 * Weekday × hour grid of distinct visitors (Berlin time): "when are people
 * on the site". One tab stop for the whole grid; arrow keys move a roving
 * cell, the readout follows, and hover shows the same tooltip.
 */
export function Heatmap({ grid }: { grid: number[][] }) {
  const [active, setActive] = useState<[number, number] | null>(null);
  const [focused, setFocused] = useState(false);
  const max = Math.max(...grid.flat(), 0);
  let peak: [number, number] = [0, 0];
  grid.forEach((row, d) => row.forEach((v, h) => v > grid[peak[0]][peak[1]] && (peak = [d, h])));

  const onKeyDown = (e: React.KeyboardEvent) => {
    const [d, h] = active ?? peak;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [d, Math.max(0, h - 1)],
      ArrowRight: [d, Math.min(23, h + 1)],
      ArrowUp: [Math.max(0, d - 1), h],
      ArrowDown: [Math.min(6, d + 1), h],
      Home: [d, 0],
      End: [d, 23],
    };
    const next = moves[e.key];
    if (!next) return;
    e.preventDefault();
    setActive(next);
  };

  const shown = active ?? (focused ? peak : null);
  const readout = shown
    ? `${WEEKDAYS[shown[0]]} ${hourLabel(shown[1])}–${hourLabel((shown[1] + 1) % 24)}: ${grid[shown[0]][shown[1]]} visitors`
    : max
      ? `Busiest: ${WEEKDAYS[peak[0]]} ${hourLabel(peak[1])} · ${max} visitors`
      : 'No visits in this range yet';

  return (
    <div>
      <div
        role="grid"
        aria-label="Visitors by weekday and hour, Berlin time. Arrow keys move between cells."
        aria-readonly="true"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setActive(null);
        }}
        onPointerLeave={() => setActive(null)}
        className="overflow-x-auto rounded-xl p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <div className="grid min-w-[560px] gap-[3px]" style={{ gridTemplateColumns: '2.5rem repeat(24, minmax(0, 1fr))' }}>
          {grid.map((row, d) => (
            <div role="row" key={WEEKDAYS[d]} className="contents">
              <div role="rowheader" className="flex items-center font-mono text-[10px] text-gray-400">
                {WEEKDAYS[d]}
              </div>
              {row.map((v, h) => {
                const isActive = shown?.[0] === d && shown?.[1] === h;
                return (
                  <div
                    role="gridcell"
                    key={h}
                    aria-label={`${WEEKDAYS[d]} ${hourLabel(h)}: ${v} visitors`}
                    aria-selected={isActive}
                    onPointerEnter={() => setActive([d, h])}
                    className={`aspect-square rounded-[4px] transition-transform duration-150 motion-reduce:transition-none ${
                      isActive ? 'scale-125 ring-2 ring-white/80 z-10' : ''
                    }`}
                    style={{ background: cellColor(v, max) }}
                  />
                );
              })}
            </div>
          ))}
          <div aria-hidden="true" />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} aria-hidden="true" className="text-center font-mono text-[9px] text-[#7c808b]">
              {h % 3 === 0 ? String(h).padStart(2, '0') : ''}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="font-mono text-xs text-gray-300">
          {readout}
        </p>
        <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400" aria-hidden="true">
          fewer
          <span
            className="h-2 w-24 rounded-full"
            style={{ background: `linear-gradient(90deg, ${VIZ.cell}, ${cellColor(1, 1)})` }}
          />
          more
        </div>
      </div>
    </div>
  );
}
