'use client';

import { useEffect, useState } from 'react';
import { OPT_OUT_EVENT, browserSignalsOptOut, isOptedOut, setOptedOut } from '@/utils/analytics/optOut';

export interface AnalyticsToggleLabels {
  title: string;
  on: string;
  off: string;
  browser: string;
  blocked: string;
}

/**
 * One-click objection to the cookieless statistics, and its undo. Labels come
 * from the (server-rendered) privacy page, so this client component adds no
 * message namespace to the client bundle.
 *
 * Renders the switch only after mount: the state lives in localStorage, and
 * guessing it on the server would flash the wrong position.
 */
export function AnalyticsToggle({ labels }: { labels: AnalyticsToggleLabels }) {
  const [state, setState] = useState<{ enabled: boolean; browser: boolean } | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const read = () => setState({ enabled: !isOptedOut(), browser: browserSignalsOptOut() });
    read();
    window.addEventListener(OPT_OUT_EVENT, read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener(OPT_OUT_EVENT, read);
      window.removeEventListener('storage', read);
    };
  }, []);

  if (!state) return <div className="h-16" aria-hidden="true" />;

  const active = state.enabled && !state.browser;
  const toggle = () => setBlocked(!setOptedOut(state.enabled));

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p id="analytics-toggle-label" className="text-sm font-bold text-black dark:text-white">
          {labels.title}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400" aria-live="polite">
          {state.browser ? labels.browser : active ? labels.on : labels.off}
        </p>
        {blocked && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{labels.blocked}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-labelledby="analytics-toggle-label"
        disabled={state.browser}
        onClick={toggle}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          active ? 'border-transparent bg-black dark:bg-white' : 'border-black/20 dark:border-white/20 bg-gray-200 dark:bg-[#222]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 rounded-full shadow transition-transform motion-reduce:transition-none ${
            active ? 'translate-x-6 bg-white dark:bg-black' : 'translate-x-1 bg-white dark:bg-gray-400'
          }`}
        />
      </button>
    </div>
  );
}
