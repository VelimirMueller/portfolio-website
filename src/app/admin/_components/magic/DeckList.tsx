import Link from 'next/link';
import { Card } from '../ui';
import { ManaCost } from './ManaCost';
import type { DeckAnalysis } from '../../_lib/magic/deck';
import type { Deck } from '../../_lib/magic/types';

/** All decks with how much of each the pool already covers. */
export function DeckList({ decks }: { decks: { deck: Deck; analysis: DeckAnalysis }[] }) {
  if (!decks.length) return <p className="text-sm text-gray-500">No decks yet.</p>;
  return (
    <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {decks.map(({ deck, analysis: { totals } }) => {
        const size = totals.main + totals.sideboard;
        const pct = size ? Math.round((totals.owned / size) * 100) : 0;
        return (
          <li key={deck.id}>
            <Link
              href={`/admin/magic/decks/${deck.slug}`}
              className="block rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Card className="h-full space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-bold text-white">{deck.name}</h2>
                  <ManaCost cost={deck.colors.map((c) => `{${c}}`).join('')} />
                </div>
                {deck.summary && <p className="text-sm text-gray-400 line-clamp-3">{deck.summary}</p>}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>
                      {totals.main} + {totals.sideboard} cards
                    </span>
                    <span>
                      owned {totals.owned}/{size} · buy {totals.missing}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden" aria-hidden="true">
                    <div className="h-full bg-blue-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
