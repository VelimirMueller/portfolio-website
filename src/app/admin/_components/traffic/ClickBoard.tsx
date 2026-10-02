'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { ClickRow } from '../../_lib/traffic';
import { formatCount, splitTarget } from './format';

const KIND_STYLE: Record<string, string> = {
  hero: 'border-fuchsia-400/30 text-fuchsia-200',
  nav: 'border-cyan-400/30 text-cyan-200',
  link: 'border-sky-400/30 text-sky-200',
  button: 'border-amber-400/30 text-amber-200',
  project: 'border-emerald-400/30 text-emerald-200',
  contact: 'border-rose-400/30 text-rose-200',
};

/**
 * What people click, ranked. Labels come from data-track first, then link
 * targets and button names (see describeClickTarget). A quick filter narrows
 * the list as you type.
 */
export function ClickBoard({ rows, onPage }: { rows: ClickRow[]; onPage: (path: string) => void }) {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? rows.filter((r) => r.target.toLowerCase().includes(needle) || r.topPage.includes(needle)) : rows;
  }, [rows, q]);
  const max = Math.max(...rows.map((r) => r.count), 1);

  if (!rows.length) {
    return <p className="py-6 text-center text-sm text-[#7c808b]">No clicks recorded in this selection.</p>;
  }

  return (
    <div>
      <label className="mb-3 flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/40 px-3 py-1.5 focus-within:ring-2 focus-within:ring-cyan-400">
        <Search size={13} className="text-gray-400" aria-hidden="true" />
        <span className="sr-only">Filter clicked elements</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter elements…"
          className="w-full bg-transparent text-xs text-white placeholder:text-[#7c808b] focus:outline-none"
        />
      </label>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Clicked elements with clicks, visitors and the page with the most clicks</caption>
        <thead className="font-mono text-[10px] uppercase tracking-wider text-[#7c808b]">
          <tr>
            <th scope="col" className="pb-2 font-normal">Element</th>
            <th scope="col" className="hidden pb-2 font-normal sm:table-cell">Mostly on</th>
            <th scope="col" className="pb-2 text-right font-normal">Visitors</th>
            <th scope="col" className="pb-2 text-right font-normal">Clicks</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => {
            const { kind, name } = splitTarget(r.target);
            return (
              <tr key={r.target} className="group border-t border-white/[0.04]">
                <td className="relative py-2 pr-3">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-1.5 left-0 -z-0 rounded-md bg-amber-500/10 transition-colors group-hover:bg-amber-500/20"
                    style={{ width: `${(r.count / max) * 100}%` }}
                  />
                  <span className="relative flex min-w-0 items-center gap-2">
                    <span className={`shrink-0 rounded-full border px-1.5 py-px font-mono text-[9px] uppercase ${KIND_STYLE[kind] ?? 'border-white/20 text-gray-300'}`}>
                      {kind}
                    </span>
                    <span className="truncate text-gray-200" title={r.target}>
                      {name}
                    </span>
                  </span>
                </td>
                <td className="hidden py-2 pr-3 sm:table-cell">
                  <button
                    type="button"
                    onClick={() => onPage(r.topPage)}
                    title={`Filter to visitors of ${r.topPage}`}
                    className="max-w-[12rem] truncate rounded font-mono text-xs text-gray-400 hover:text-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    {r.topPage}
                  </button>
                </td>
                <td className="py-2 text-right font-mono text-xs text-gray-400">{formatCount(r.visitors)}</td>
                <td className="py-2 text-right font-mono text-xs font-bold text-white">{formatCount(r.count)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!shown.length && <p className="py-4 text-center text-xs text-[#7c808b]">No element matches “{q}”.</p>}
    </div>
  );
}
