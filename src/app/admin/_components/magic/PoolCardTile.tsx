'use client';

import { useState, useTransition } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Badge, Card } from '../ui';
import { CardImage } from './CardImage';
import { CardHeader, CardRules } from './CardText';
import type { PoolEntry } from '../../_lib/magic/types';

export type ChangeQty = (id: string, delta: 1 | -1) => Promise<void>;

function QtyControls({ entry, changeQty }: { entry: PoolEntry; changeQty: ChangeQty }) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const { name } = entry.card;
  const last = entry.owned_qty === 1;

  const change = (delta: 1 | -1) => {
    if (delta === -1 && last && !window.confirm(`Remove ${name} from the pool?`)) return;
    startTransition(async () => {
      setFailed(false);
      try {
        await changeQty(entry.id, delta);
      } catch {
        setFailed(true);
      }
    });
  };

  const btn =
    'w-7 h-7 rounded-lg border border-[#333] text-gray-400 hover:text-white hover:border-[#555] flex items-center justify-center disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  return (
    <div className="flex items-center gap-1.5" aria-busy={pending}>
      <button
        type="button"
        className={btn}
        disabled={pending}
        aria-label={last ? `Remove ${name}` : `One copy less of ${name}`}
        onClick={() => change(-1)}
      >
        {last ? <Trash2 size={13} aria-hidden="true" /> : <Minus size={13} aria-hidden="true" />}
      </button>
      <span className="min-w-8 text-center font-mono text-sm text-white" aria-label={`${entry.owned_qty} copies`}>
        ×{entry.owned_qty}
      </span>
      <button type="button" className={btn} disabled={pending} aria-label={`One copy more of ${name}`} onClick={() => change(1)}>
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

export function PoolCardTile({ entry, changeQty }: { entry: PoolEntry; changeQty?: ChangeQty }) {
  return (
    <Card flush className="overflow-hidden">
      <div className="p-4 flex gap-4">
        <CardImage card={entry.card} className="w-24 sm:w-28" />
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <CardHeader card={entry.card} subtitle={entry.name_de} />
          <CardRules card={entry.card} />
          {entry.note && <p className="text-xs text-amber-300/80 border-l-2 border-amber-500/40 pl-2">{entry.note}</p>}
          <div className="mt-auto pt-1 flex flex-wrap items-center gap-2">
            {changeQty ? <QtyControls entry={entry} changeQty={changeQty} /> : <Badge color="blue">×{entry.owned_qty}</Badge>}
            {entry.copies_de > 0 && <Badge color="purple">{entry.copies_de} DE</Badge>}
          </div>
        </div>
      </div>
    </Card>
  );
}
