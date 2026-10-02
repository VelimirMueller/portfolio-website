'use client';

import { Eye, Monitor, MousePointerClick, Smartphone, Tablet } from 'lucide-react';
import type { FeedItem } from '../../_lib/traffic';
import { useNow } from './hooks';
import { flagOf, formatAgo, sourceLabel, splitTarget } from './format';

const DEVICE_ICON = { desktop: Monitor, mobile: Smartphone, tablet: Tablet } as const;

/** The latest events in the selection, newest first; times re-render every 15 s. */
export function LiveFeed({ items }: { items: FeedItem[] }) {
  const now = useNow();
  if (!items.length) return <p className="py-6 text-center text-sm text-[#7c808b]">Waiting for the first visitor…</p>;

  return (
    <ol aria-label="Latest events" className="relative space-y-0.5 before:absolute before:inset-y-2 before:left-[13px] before:w-px before:bg-gradient-to-b before:from-cyan-400/40 before:to-transparent">
      {items.map((item, i) => {
        const Icon = item.type === 'click' ? MousePointerClick : Eye;
        const Device = DEVICE_ICON[item.device as keyof typeof DEVICE_ICON] ?? Monitor;
        const detail =
          item.type === 'click' && item.detail ? splitTarget(item.detail).name : item.detail ? `via ${sourceLabel(item.detail)}` : null;
        return (
          <li
            key={`${item.at}-${item.type}-${item.path}-${i}`}
            className="relative flex items-center gap-3 rounded-lg py-1.5 pl-0 pr-2 text-xs motion-safe:animate-fade-in-up hover:bg-white/[0.02]"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <span
              className={`relative z-10 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border bg-[#0b0b10] ${
                item.type === 'click' ? 'border-amber-500/40 text-amber-300' : 'border-cyan-400/40 text-cyan-300'
              }`}
            >
              <Icon size={12} aria-hidden="true" />
              <span className="sr-only">{item.type === 'click' ? 'Click' : 'Page view'}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-mono text-gray-200">{item.path}</span>
              {detail && <span className="block truncate text-[11px] text-gray-400">{detail}</span>}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-gray-400">
              {item.country && (
                <span title={item.country} aria-label={item.country}>
                  {flagOf(item.country)}
                </span>
              )}
              <Device size={12} aria-label={item.device ?? 'unknown device'} />
              <time dateTime={item.at} className="w-8 text-right font-mono text-[10px]">
                {formatAgo(item.at, now)}
              </time>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
