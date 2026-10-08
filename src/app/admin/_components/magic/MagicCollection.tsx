'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { ExternalLink, Minus, Plus, Search, Trash2 } from 'lucide-react';
import { Badge, Card, type BadgeColor } from '../ui';
import { CardImage, ManaCost } from './parts';
import {
  COLOR_NAMES,
  TYPE_GROUPS,
  collectionStats,
  filterCards,
  typeGroup,
  type ColorFilter,
  type ManaColor,
  type PoolCard,
  type TypeGroup,
} from '../../_lib/magic/collection';

const COLOR_CHIPS: { value: ColorFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  ...(Object.keys(COLOR_NAMES) as ManaColor[]).map((c) => ({ value: c, label: COLOR_NAMES[c] })),
  { value: 'multi', label: 'Multicolor' },
  { value: 'colorless', label: 'Colorless' },
];

const STATUS_BADGE: Record<PoolCard['status'], { label: string; color: BadgeColor } | null> = {
  scryfall: null,
  photo: { label: 'photo text', color: 'cyan' },
  partial: { label: 'partly read', color: 'orange' },
  verify: { label: 'verify', color: 'red' },
};

export type PoolActions = {
  changeQty: (id: string, delta: 1 | -1) => Promise<void>;
};

function QtyControls({ card, actions }: { card: PoolCard; actions?: PoolActions }) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  if (!actions) return <Badge color="blue">×{card.owned_qty}</Badge>;
  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      setFailed(false);
      try {
        await fn();
      } catch {
        setFailed(true);
      }
    });
  const btn =
    'w-7 h-7 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:border-[#555] flex items-center justify-center disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  return (
    <div className="flex items-center gap-1.5" aria-busy={pending}>
      <button
        type="button"
        className={btn}
        disabled={pending}
        aria-label={card.owned_qty === 1 ? `Remove ${card.name}` : `One copy less of ${card.name}`}
        onClick={() => {
          if (card.owned_qty === 1 && !window.confirm(`Remove ${card.name} from the pool?`)) return;
          run(() => actions.changeQty(card.id, -1));
        }}
      >
        {card.owned_qty === 1 ? <Trash2 size={13} aria-hidden="true" /> : <Minus size={13} aria-hidden="true" />}
      </button>
      <span className="min-w-8 text-center font-mono text-sm text-white" aria-label={`${card.owned_qty} copies`}>
        ×{card.owned_qty}
      </span>
      <button
        type="button"
        className={btn}
        disabled={pending}
        aria-label={`One copy more of ${card.name}`}
        onClick={() => run(() => actions.changeQty(card.id, 1))}
      >
        <Plus size={13} aria-hidden="true" />
      </button>
      {failed && (
        <span role="alert" className="text-[11px] text-red-400">
          Not saved. Reload and try again.
        </span>
      )}
    </div>
  );
}

function CardTile({ card, actions }: { card: PoolCard; actions?: PoolActions }) {
  const status = STATUS_BADGE[card.status];
  return (
    <Card flush className="overflow-hidden">
      <div className="p-4 flex gap-4">
        <CardImage name={card.name} url={card.image_url} colors={card.colors} className="w-24 sm:w-28" />
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-white leading-tight">{card.name}</h3>
              {card.name_de && <p className="text-xs text-gray-500 italic">{card.name_de}</p>}
            </div>
            <ManaCost cost={card.mana_cost} />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
            <span>{card.type_line}</span>
            {card.power_toughness && (
              <span className="px-1.5 py-0.5 rounded-md bg-[#1a1a1a] border border-[#333] font-mono text-gray-300">
                {card.power_toughness}
              </span>
            )}
          </div>

          {card.short && <p className="text-sm text-gray-300">{card.short}</p>}

          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer text-blue-400 hover:text-blue-300 select-none">Full text</summary>
            <p className="mt-2 leading-relaxed whitespace-pre-line">{card.oracle_text}</p>
            {card.scryfall_uri && (
              <a
                href={card.scryfall_uri}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
              >
                Scryfall <ExternalLink size={11} aria-hidden="true" />
              </a>
            )}
          </details>

          {card.note && <p className="text-xs text-amber-300/80 border-l-2 border-amber-500/40 pl-2">{card.note}</p>}

          <div className="mt-auto pt-1 flex flex-wrap items-center gap-2">
            <QtyControls card={card} actions={actions} />
            {card.copies_de > 0 && <Badge color="purple">{card.copies_de} DE</Badge>}
            {status && <Badge color={status.color}>{status.label}</Badge>}
          </div>
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

export function MagicCollection({ cards, actions }: { cards: PoolCard[]; actions?: PoolActions }) {
  const [query, setQuery] = useState('');
  const [color, setColor] = useState<ColorFilter>('all');
  const [type, setType] = useState<TypeGroup | 'all'>('all');

  const stats = useMemo(() => collectionStats(cards), [cards]);
  const shown = useMemo(() => filterCards(cards, { query, color, type }), [cards, query, color, type]);
  const typeCounts = useMemo(() => {
    const counts = new Map<TypeGroup, number>();
    cards.forEach((c) => counts.set(typeGroup(c.type_line), (counts.get(typeGroup(c.type_line)) ?? 0) + 1));
    return counts;
  }, [cards]);

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Unique cards', stats.unique],
          ['Copies', stats.copies],
          ['German copies', stats.german],
          ['Text from photos', stats.toVerify],
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
              className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
            />
          </label>
          <Link
            href="/admin/magic/add"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Plus size={16} aria-hidden="true" /> Add card
          </Link>
        </div>
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
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((card) => (
            <CardTile key={card.id} card={card} actions={actions} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">{cards.length ? 'No card matches these filters.' : 'The pool is empty.'}</p>
      )}
    </div>
  );
}
