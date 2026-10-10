'use client';

import { useId, useRef, type ReactNode } from 'react';

export interface TabItem<T extends string> {
  key: T;
  label: string;
  content: ReactNode;
}

/**
 * Accessible tabs (WAI-ARIA authoring pattern): tablist/tab/tabpanel with
 * aria-selected, aria-controls, a roving tabindex and ArrowLeft / ArrowRight /
 * Home / End keys — selection follows focus. Panels stay mounted (hidden, not
 * unmounted) so their state survives a round trip through the other tabs.
 * The active tab carries the Flagship indigo indicator.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  id,
  className = '',
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (key: T) => void;
  /** Accessible name for the tablist. */
  label: string;
  /** Stable prefix for the tab/panel ids; defaults to useId(). */
  id?: string;
  className?: string;
}) {
  const auto = useId();
  const prefix = id ?? auto;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  if (!tabs.length) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.key === value);
    const next =
      e.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length].key :
      e.key === 'ArrowLeft' ? tabs[(i - 1 + tabs.length) % tabs.length].key :
      e.key === 'Home' ? tabs[0].key :
      e.key === 'End' ? tabs[tabs.length - 1].key : null;
    if (!next) return;
    e.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="flex gap-1 overflow-x-auto border-b border-white/[0.08] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((t) => {
          const selected = t.key === value;
          return (
            <button
              key={t.key}
              ref={(el) => {
                refs.current[t.key] = el;
              }}
              type="button"
              role="tab"
              id={`${prefix}-tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`${prefix}-panel-${t.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.key)}
              className={`relative shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                selected ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t.label}
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(99,102,241,0.7)]"
                />
              )}
            </button>
          );
        })}
      </div>
      {tabs.map((t) => (
        <div
          key={t.key}
          role="tabpanel"
          id={`${prefix}-panel-${t.key}`}
          aria-labelledby={`${prefix}-tab-${t.key}`}
          hidden={t.key !== value}
          className="pt-6"
        >
          {t.content}
        </div>
      ))}
    </div>
  );
}
