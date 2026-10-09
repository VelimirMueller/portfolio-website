'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { PackageCheck } from 'lucide-react';
import { Card } from '../ui';
import { CardImage } from './CardImage';
import { CardHeader, CardRules } from './CardText';
import { QtyControls, type ChangeQty } from './PoolCardTile';
import type { WishEntry } from '../../_lib/magic/types';

export type WishToPool = (id: string) => Promise<void>;

/** "Got it": moves every wanted copy into the pool. */
function GotIt({ entry, wishToPool }: { entry: WishEntry; wishToPool: WishToPool }) {
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  const move = () =>
    startTransition(async () => {
      setFailed(false);
      try {
        await wishToPool(entry.id);
      } catch {
        setFailed(true);
      }
    });

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-busy={pending}
        aria-label={`Got it: move ${entry.card.name} to the pool`}
        onClick={move}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <PackageCheck size={14} aria-hidden="true" /> Got it
      </button>
      {failed && (
        <span role="alert" className="text-[11px] text-red-400">
          Not moved. Reload and try again.
        </span>
      )}
    </>
  );
}

function WishTile({ entry, changeQty, wishToPool }: { entry: WishEntry; changeQty: ChangeQty; wishToPool: WishToPool }) {
  return (
    <Card flush className="overflow-hidden">
      <div className="p-4 flex gap-4">
        <CardImage card={entry.card} className="w-24 sm:w-28" />
        <div className="min-w-0 flex-1 flex flex-col gap-2">
          <CardHeader card={entry.card} />
          <CardRules card={entry.card} />
          {entry.note && <p className="text-xs text-amber-300/80 border-l-2 border-amber-500/40 pl-2">{entry.note}</p>}
          <div className="mt-auto pt-1 flex flex-wrap items-center gap-2">
            <QtyControls
              id={entry.id}
              qty={entry.qty}
              name={entry.card.name}
              changeQty={changeQty}
              removeConfirm={`Remove ${entry.card.name} from the wishlist?`}
            />
            <GotIt entry={entry} wishToPool={wishToPool} />
          </div>
        </div>
      </div>
    </Card>
  );
}

/** Cards Velimir wants but does not own yet, oldest wish first. */
export function WishlistView({
  entries,
  changeQty,
  wishToPool,
}: {
  entries: WishEntry[];
  changeQty: ChangeQty;
  wishToPool: WishToPool;
}) {
  if (!entries.length) {
    return (
      <p className="text-sm text-gray-500">
        Nothing on the wishlist. Use{' '}
        <Link href="/admin/magic/add" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
          Add card
        </Link>{' '}
        → Want it.
      </p>
    );
  }
  const copies = entries.reduce((sum, e) => sum + e.qty, 0);
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">
        {plural(entries.length, 'card')} · {copies === 1 ? '1 copy' : `${copies} copies`} wanted
      </p>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {entries.map((entry) => (
          <WishTile key={entry.id} entry={entry} changeQty={changeQty} wishToPool={wishToPool} />
        ))}
      </div>
    </div>
  );
}
