'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { KPI_VIEWS, useKpiView, type KpiView } from './views';
import { Hyperspace, type HyperspaceHandle } from './Hyperspace';

/**
 * The KPI page's section switcher: a radio group of glowing pills over a
 * starfield. Choosing a section fires a light-speed jump from that pill and
 * the section drops in. Arrow keys / Home / End move the selection (roving
 * focus, as for any radio group); the view is kept in ?view=.
 */
export function SectionSwitcher({ counts = {} }: { counts?: Partial<Record<KpiView, number>> }) {
  const { view, setView } = useKpiView();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const barRef = useRef<HTMLDivElement>(null);
  const hyperspace = useRef<HyperspaceHandle>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[view];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [view]);

  const choose = (next: KpiView, focus = false) => {
    const el = refs.current[next];
    if (focus) el?.focus();
    el?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    if (next === view) return;
    const bar = barRef.current?.getBoundingClientRect();
    const pill = el?.getBoundingClientRect();
    if (bar && pill) hyperspace.current?.jump(pill.left - bar.left + pill.width / 2);
    setView(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const ids = KPI_VIEWS.map((v) => v.id);
    const i = ids.indexOf(view);
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? ids[(i + 1) % ids.length] :
      e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? ids[(i - 1 + ids.length) % ids.length] :
      e.key === 'Home' ? ids[0] :
      e.key === 'End' ? ids[ids.length - 1] : null;
    if (!next) return;
    e.preventDefault();
    choose(next, true);
  };

  return (
    <div
      ref={barRef}
      className="sticky top-0 z-30 -mx-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#030308]/90 shadow-[0_0_40px_rgba(14,165,198,0.08)] backdrop-blur-md"
    >
      <Hyperspace ref={hyperspace} />
      {/* Scanline + edge glow: atmosphere at a few percent. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0 1px, transparent 1px 3px)' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/50 to-transparent" />

      <div
        role="radiogroup"
        aria-label="KPI section"
        onKeyDown={onKeyDown}
        className="relative flex gap-1 overflow-x-auto p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-lg:[mask-image:linear-gradient(90deg,transparent,black_20px,black_calc(100%-28px),transparent)]"
      >
        {indicator && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-fuchsia-500/20 ring-1 ring-cyan-300/40 shadow-[0_0_24px_rgba(14,165,198,0.35),inset_0_0_12px_rgba(217,70,239,0.15)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
        {KPI_VIEWS.map((v) => {
          const selected = v.id === view;
          const count = counts[v.id];
          return (
            <button
              key={v.id}
              ref={(el) => {
                refs.current[v.id] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              title={v.hint}
              onClick={() => choose(v.id)}
              className={`group relative z-10 flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                selected ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {/* The radio itself: a ring, and when selected a glowing core with a ping. */}
              <span
                aria-hidden="true"
                className={`relative flex h-3.5 w-3.5 items-center justify-center rounded-full border transition-colors ${
                  selected ? 'border-cyan-300' : 'border-gray-500 group-hover:border-gray-300'
                }`}
              >
                {selected && (
                  <>
                    <span className="absolute h-3.5 w-3.5 rounded-full bg-cyan-300/40 motion-safe:animate-ping" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_2px_rgba(103,232,249,0.8)]" />
                  </>
                )}
              </span>
              <span className="font-medium">{v.label}</span>
              {count !== undefined && (
                <span
                  className={`rounded-md px-1.5 py-px font-mono text-[10px] tabular-nums ${
                    selected ? 'bg-cyan-300/15 text-cyan-100' : 'bg-white/[0.05] text-gray-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
