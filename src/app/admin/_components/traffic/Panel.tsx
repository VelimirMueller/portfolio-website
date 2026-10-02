'use client';

import { useRef, type ReactNode } from 'react';

/** Series colours, validated for the dark admin surface (dataviz validator, 2026-10-02). */
export const VIZ = {
  visitors: '#0ea5c6',
  pageviews: '#d946ef',
  clicks: '#d97706',
  surface: '#0b0b10',
  cell: '#15151d',
  grid: 'rgba(255,255,255,0.06)',
  previous: '#6b7280',
} as const;

/**
 * Card with a pointer-following spotlight and a neon hairline on hover.
 * The spotlight is two CSS variables written on pointermove — no re-render.
 */
export function Panel({
  id,
  kicker,
  title,
  actions,
  children,
  className = '',
}: {
  id: string;
  kicker?: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const onPointerMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      onPointerMove={onPointerMove}
      className={`group relative scroll-mt-24 overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-[#0b0b10]/90 p-5 md:p-6 transition-colors hover:border-white/[0.12] ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgba(14,165,198,0.07), transparent 60%)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {kicker && <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">{kicker}</p>}
            <h3 id={`${id}-title`} className="text-base font-bold text-white">
              {title}
            </h3>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
