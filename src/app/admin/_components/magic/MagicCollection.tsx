'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Card, type BadgeColor } from '../ui';
import {
  COLOR_NAMES,
  TYPE_GROUPS,
  collectionStats,
  filterCards,
  manaSymbols,
  typeGroup,
  type ColorFilter,
  type MagicCard,
  type ManaColor,
  type TypeGroup,
} from '../../_lib/magic/collection';

// Pip colors follow the card frames; hybrid symbols ({W/U}) show a split pip.
const PIP: Record<ManaColor, string> = {
  W: '#F8F1D4',
  U: '#3B82F6',
  B: '#6B6B6B',
  R: '#EF4444',
  G: '#22C55E',
};

const COLOR_CHIPS: { value: ColorFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.keys(COLOR_NAMES) as ManaColor[]).map((c) => ({ value: c, label: COLOR_NAMES[c] })),
  { value: 'multi', label: 'Multicolor' },
  { value: 'colorless', label: 'Colorless' },
];

const STATUS_BADGE: Record<MagicCard['status'], { label: string; color: BadgeColor } | null> = {
  photo: null,
  partial: { label: 'partly read', color: 'orange' },
  verify: { label: 'verify', color: 'red' },
};

function isPipColor(s: string): s is ManaColor {
  return s in PIP;
}

function ManaPip({ symbol }: { symbol: string }) {
  const parts = symbol.split('/').filter(isPipColor);
  const base = 'inline-flex w-5 h-5 rounded-full items-center justify-center text-[10px] font-bold border border-black/40';
  if (parts.length === 2) {
    return (
      <span
        className={base}
        style={{ background: `linear-gradient(135deg, ${PIP[parts[0]]} 50%, ${PIP[parts[1]]} 50%)` }}
        title={symbol}
      />
    );
  }
  if (parts.length === 1) return <span className={base} style={{ background: PIP[parts[0]] }} title={symbol} />;
  return <span className={`${base} bg-gray-400 text-black`}>{symbol}</span>;
}

function ManaCost({ cost }: { cost: string | null }) {
  const symbols = manaSymbols(cost);
  if (!symbols.length) return null;
  return (
    <span className="flex gap-0.5 shrink-0" aria-label={`Mana cost ${cost}`}>
      {symbols.map((s, i) => (
        <ManaPip key={i} symbol={s} />
      ))}
    </span>
  );
}

/** Thin strip in the card's colors across the top, like a frame. */
function frameGradient(colors: ManaColor[]): string {
  if (!colors.length) return '#9CA3AF';
  if (colors.length === 1) return PIP[colors[0]];
  return `linear-gradient(90deg, ${colors.map((c) => PIP[c]).join(', ')})`;
}

function CardTile({ card }: { card: MagicCard }) {
  const status = STATUS_BADGE[card.status];
  return (
    <Card flush className="overflow-hidden flex flex-col">
      <div className="h-1.5" style={{ background: frameGradient(card.colors) }} aria-hidden="true" />
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-white leading-tight">{card.name}</h3>
            {card.name_de && card.name_de !== card.name && !card.name.startsWith(card.name_de) && (
              <p className="text-xs text-gray-500 italic">{card.name_de}</p>
            )}
          </div>
          <ManaCost cost={card.mana_cost} />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
          <span>{card.type}</span>
          {card.power_toughness && (
            <span className="px-1.5 py-0.5 rounded-md bg-[#1a1a1a] border border-[#333] font-mono text-gray-300">
              {card.power_toughness}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-300">{card.short}</p>

        <details className="text-xs text-gray-400 group">
          <summary className="cursor-pointer text-blue-400 hover:text-blue-300 select-none">Full text</summary>
          <p className="mt-2 leading-relaxed">{card.effect}</p>
        </details>

        {card.note && <p className="text-xs text-amber-300/80 border-l-2 border-amber-500/40 pl-2">{card.note}</p>}

        <div className="mt-auto pt-2 flex flex-wrap items-center gap-2">
          <Badge color="blue">×{card.owned_qty}</Badge>
          {card.copies_de > 0 && <Badge color="purple">{card.copies_de} DE</Badge>}
          {status && <Badge color={status.color}>{status.label}</Badge>}
        </div>
      </div>
    </Card>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        active
          ? 'bg-blue-600/10 text-blue-400 border-blue-500/30'
          : 'text-gray-500 border-[#222] hover:text-white hover:border-[#333]'
      }`}
    >
      {children}
    </button>
  );
}

export function MagicCollection({ cards, set }: { cards: MagicCard[]; set: string }) {
  const [query, setQuery] = useState('');
  const [color, setColor] = useState<ColorFilter>('all');
  const [type, setType] = useState<TypeGroup | 'all'>('all');

  const stats = useMemo(() => collectionStats(cards), [cards]);
  const shown = useMemo(() => filterCards(cards, { query, color, type }), [cards, query, color, type]);
  const typeCounts = useMemo(() => {
    const counts = new Map<TypeGroup, number>();
    cards.forEach((c) => counts.set(typeGroup(c.type), (counts.get(typeGroup(c.type)) ?? 0) + 1));
    return counts;
  }, [cards]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Magic</h1>
        <p className="text-gray-500 text-sm">My card collection · {set}</p>
      </div>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Unique cards', stats.unique],
          ['Copies', stats.copies],
          ['German copies', stats.german],
          ['To check', stats.toVerify],
        ].map(([label, value]) => (
          <Card key={label}>
            <dt className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{label}</dt>
            <dd className="text-2xl font-bold text-white mt-1">{value}</dd>
          </Card>
        ))}
      </dl>

      <div className="space-y-3">
        <label className="relative block max-w-md">
          <span className="sr-only">Search cards</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or text…"
            className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by color">
          {COLOR_CHIPS.map((c) => (
            <Chip key={c.value} active={color === c.value} onClick={() => setColor(c.value)}>
              {c.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          <Chip active={type === 'all'} onClick={() => setType('all')}>
            All types
          </Chip>
          {TYPE_GROUPS.filter((t) => typeCounts.has(t)).map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {t} <span className="text-gray-600">{typeCounts.get(t)}</span>
            </Chip>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-500" aria-live="polite">
        {shown.length} of {cards.length} cards
      </p>

      {shown.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((card) => (
            <CardTile key={card.name} card={card} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No card matches these filters.</p>
      )}
    </div>
  );
}
