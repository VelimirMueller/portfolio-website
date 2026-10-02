'use client';

import { useRef, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import type { Ranked } from '../../_lib/traffic';
import { formatCount } from './format';

/**
 * Ranked rows with an inline bar. Each row is a toggle button: clicking
 * filters the whole dashboard to that value, clicking again removes it.
 */
export function BarList({
  rows,
  active,
  onSelect,
  label,
  render = (k) => k,
  secondary,
  empty = 'Nothing yet',
}: {
  rows: Ranked[];
  active?: string;
  onSelect: (key: string | null) => void;
  label: string;
  render?: (key: string) => ReactNode;
  /** Optional second number per row (e.g. page views next to visitors). */
  secondary?: { label: string; value: (r: Ranked) => number };
  empty?: string;
}) {
  const max = Math.max(...rows.map((r) => r.visitors), 1);
  if (!rows.length) return <p className="py-6 text-center text-sm text-[#7c808b]">{empty}</p>;

  return (
    <ul aria-label={label} className="space-y-1">
      <li aria-hidden="true" className="flex justify-end gap-4 px-3 pb-1 font-mono text-[10px] uppercase tracking-wider text-[#7c808b]">
        {secondary && <span className="w-14 text-right">{secondary.label}</span>}
        <span className="w-14 text-right">Visitors</span>
      </li>
      {rows.map((r, i) => {
        const selected = active === r.key;
        return (
          <li key={r.key}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(selected ? null : r.key)}
              title={selected ? 'Remove this filter' : 'Filter the dashboard to this'}
              className={`group relative flex w-full items-center gap-4 overflow-hidden rounded-xl px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                selected ? 'bg-cyan-400/[0.08] text-white' : 'text-gray-300 hover:bg-white/[0.03] hover:text-white'
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-1 left-1 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-500/5 transition-all duration-500 group-hover:from-cyan-500/30 motion-safe:animate-fade-in-up"
                style={{ width: `calc(${(r.visitors / max) * 100}% - 0.5rem)`, animationDelay: `${i * 40}ms` }}
              />
              <span className="relative flex min-w-0 flex-1 items-center gap-2">
                {selected && <Check size={14} className="shrink-0 text-cyan-300" aria-hidden="true" />}
                <span className="truncate">{render(r.key)}</span>
              </span>
              {secondary && <span className="relative w-14 text-right font-mono text-xs text-gray-400">{formatCount(secondary.value(r))}</span>}
              <span className="relative w-14 text-right font-mono text-xs font-bold text-white">{formatCount(r.visitors)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Accessible tabs (roving focus, arrow keys) for panels that switch between lists. */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { key: T; label: string }[];
  value: T;
  onChange: (key: T) => void;
  label: string;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.key === value);
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = tabs[(i + delta + tabs.length) % tabs.length].key;
    onChange(next);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex rounded-full border border-white/[0.08] bg-black/40 p-0.5">
      {tabs.map((t) => (
        <button
          key={t.key}
          ref={(el) => {
            refs.current[t.key] = el;
          }}
          role="tab"
          type="button"
          aria-selected={t.key === value}
          tabIndex={t.key === value ? 0 : -1}
          onClick={() => onChange(t.key)}
          className={`rounded-full px-3 py-1 font-mono text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            t.key === value ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
