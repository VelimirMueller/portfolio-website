'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card } from '../ui';
import { FilterChip } from './FilterChip';
import { PoolCardTile, type ChangeQty } from './PoolCardTile';
import { COLOR_NAMES, TYPE_GROUPS, typeGroup, type TypeGroup } from '../../_lib/magic/cards';
import { filterPool, poolStats, type ColorFilter } from '../../_lib/magic/pool';
import type { ManaColor, PoolEntry } from '../../_lib/magic/types';

const COLOR_CHIPS: { value: ColorFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.keys(COLOR_NAMES) as ManaColor[]).map((c) => ({ value: c, label: COLOR_NAMES[c] })),
  { value: 'multi', label: 'Multicolor' },
  { value: 'colorless', label: 'Colorless' },
];

export function PoolView({ entries, changeQty }: { entries: PoolEntry[]; changeQty?: ChangeQty }) {
  const [query, setQuery] = useState('');
  const [color, setColor] = useState<ColorFilter>('all');
  const [type, setType] = useState<TypeGroup | 'all'>('all');

  const stats = useMemo(() => poolStats(entries), [entries]);
  const shown = useMemo(() => filterPool(entries, { query, color, type }), [entries, query, color, type]);
  const typeCounts = useMemo(() => {
    const counts = new Map<TypeGroup, number>();
    for (const e of entries) {
      const group = typeGroup(e.card.type_line);
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
    return counts;
  }, [entries]);

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Unique cards', stats.unique],
          ['Copies', stats.copies],
          ['German copies', stats.german],
          ['Rares & mythics', stats.rares],
        ].map(([label, value]) => (
          <Card key={label}>
            <dt className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{label}</dt>
            <dd className="text-2xl font-bold text-white mt-1">{value}</dd>
          </Card>
        ))}
      </dl>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative block flex-1 min-w-56 max-w-md">
            <span className="sr-only">Search cards</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or text…"
              className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-500"
            />
          </label>
          <Link
            href="/admin/magic/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <Plus size={16} aria-hidden="true" /> Add card
          </Link>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by color">
          {COLOR_CHIPS.map((c) => (
            <FilterChip key={c.value} active={color === c.value} onClick={() => setColor(c.value)}>
              {c.label}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          <FilterChip active={type === 'all'} onClick={() => setType('all')}>
            All types
          </FilterChip>
          {TYPE_GROUPS.filter((t) => typeCounts.has(t)).map((t) => (
            <FilterChip key={t} active={type === t} onClick={() => setType(t)}>
              {t} <span className="text-gray-600">{typeCounts.get(t)}</span>
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500" aria-live="polite">
        {shown.length} of {entries.length} cards
      </p>

      {shown.length ? (
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((entry) => (
            <PoolCardTile key={entry.id} entry={entry} changeQty={changeQty} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">{entries.length ? 'No card matches these filters.' : 'The pool is empty.'}</p>
      )}
    </div>
  );
}
