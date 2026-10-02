'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { FILTER_KEYS, RANGES, RANGE_KEYS, type FilterKey, type RangeKey, type TrafficFilters } from '../../_lib/traffic';
import { countryName, flagOf, sourceLabel } from './format';

/**
 * Segmented range control with a sliding indicator. A radiogroup: arrow
 * keys move the selection, the number keys 1–4 work page-wide.
 */
export function RangeControl({ value, onChange }: { value: RangeKey; onChange: (range: RangeKey) => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = refs.current[value];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = RANGE_KEYS.indexOf(value);
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = RANGE_KEYS[(i + delta + RANGE_KEYS.length) % RANGE_KEYS.length];
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Time range"
      onKeyDown={onKeyDown}
      className="relative flex rounded-full border border-white/[0.08] bg-black/40 p-1"
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-cyan-500/25 to-fuchsia-500/25 ring-1 ring-cyan-400/40 shadow-[0_0_18px_rgba(14,165,198,0.25)] transition-all duration-300 ease-out motion-reduce:transition-none"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {RANGE_KEYS.map((key, i) => {
        const active = key === value;
        return (
          <button
            key={key}
            ref={(el) => {
              refs.current[key] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            title={`${RANGES[key].label} (${i + 1})`}
            onClick={() => onChange(key)}
            className={`relative z-10 rounded-full px-3.5 py-1.5 font-mono text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
              active ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {RANGES[key].short}
          </button>
        );
      })}
    </div>
  );
}

const FILTER_LABEL: Record<FilterKey, string> = {
  page: 'Page',
  source: 'Source',
  country: 'Country',
  device: 'Device',
  browser: 'Browser',
};

export function filterValueLabel(key: FilterKey, value: string): string {
  if (key === 'source') return sourceLabel(value);
  if (key === 'country') return `${flagOf(value)} ${countryName(value)}`.trim();
  return value;
}

/** Active filters as removable chips; nothing renders when no filter is set. */
export function FilterChips({
  filters,
  onRemove,
  onClear,
}: {
  filters: TrafficFilters;
  onRemove: (key: FilterKey) => void;
  onClear: () => void;
}) {
  const active = FILTER_KEYS.filter((k) => filters[k]);
  if (!active.length) return null;
  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
      {active.map((key) => (
        <li key={key} className="motion-safe:animate-scale-in">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/[0.08] py-1 pl-3 pr-1 text-xs text-cyan-100">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-300/70">{FILTER_LABEL[key]}</span>
            <span className="max-w-[16rem] truncate font-medium" title={filters[key]}>
              {filterValueLabel(key, filters[key] as string)}
            </span>
            <button
              type="button"
              onClick={() => onRemove(key)}
              aria-label={`Remove ${FILTER_LABEL[key].toLowerCase()} filter`}
              className="rounded-full p-1 text-cyan-200/70 hover:bg-cyan-400/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </span>
        </li>
      ))}
      {active.length > 1 && (
        <li>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-2 py-1 text-xs text-gray-400 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            Clear all
          </button>
        </li>
      )}
    </ul>
  );
}
