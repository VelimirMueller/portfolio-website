import { CheckCircle2, Search, Star } from 'lucide-react';
import { Badge, Card } from '../ui';
import { CardImage } from './CardImage';
import { CardHeader, CardRules } from './CardText';
import type { CatalogCard } from '../../_lib/magic/types';

/**
 * Search over the Scryfall catalog (every paper card) and one add form per
 * result. A plain GET form drives the search, so it works without client JS.
 * Each form has two submit buttons: "Own it" adds to the pool, "Want it" to
 * the wishlist (the clicked button's name=intent goes with the form).
 */
export function AddCardSearch({
  query,
  results,
  more = false,
  owned,
  wished,
  added,
  wishedName,
  formError,
  error,
  catalogSize,
  action,
}: {
  query: string;
  results: CatalogCard[];
  /** More cards matched than are shown. */
  more?: boolean;
  /** Copies already in the pool, per oracle_id. */
  owned: Map<string, number>;
  /** Copies already on the wishlist, per oracle_id. */
  wished: Map<string, number>;
  added?: string;
  /** Name of the card just put on the wishlist. */
  wishedName?: string;
  /** Why the last add was refused (from the server action). */
  formError?: string;
  error?: boolean;
  catalogSize: number | null;
  action: (formData: FormData) => Promise<void>;
}) {
  const input =
    'bg-[#0b0b0b] border border-[#222] rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500';
  return (
    <div className="space-y-6">
      <form method="get" className="flex flex-wrap items-center gap-3" role="search">
        <label className="relative block flex-1 min-w-56 max-w-xl">
          <span className="sr-only">Search all cards</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            minLength={2}
            autoFocus
            placeholder="Card name, e.g. Cyclonic Rift"
            className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-500"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          Search
        </button>
        <p className="w-full text-xs text-gray-500">
          {catalogSize
            ? `${catalogSize.toLocaleString('en-US')} cards from Scryfall, every paper card ever printed.`
            : 'The catalog is empty. Load it with scripts/mtg (see README).'}
        </p>
      </form>

      {added && (
        <p role="status" className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 size={16} aria-hidden="true" /> {added} is in your pool.
        </p>
      )}
      {wishedName && (
        <p role="status" className="flex items-center gap-2 text-sm text-amber-400">
          <Star size={16} aria-hidden="true" /> {wishedName} is on your wishlist.
        </p>
      )}
      {formError && (
        <p role="alert" className="text-sm text-red-400">
          Not added: {formError}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          Could not load the search or your pool and wishlist counts. Try again.
        </p>
      )}

      {query.length >= 2 && !error && (
        <p className="text-xs text-gray-500" aria-live="polite">
          {!results.length
            ? `No card matches “${query}”.`
            : more
              ? `First ${results.length} matches for “${query}” — type more to narrow it down`
              : `${results.length} matches for “${query}”`}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {results.map((card) => {
          const have = owned.get(card.oracle_id) ?? 0;
          const want = wished.get(card.oracle_id) ?? 0;
          return (
            <Card key={card.oracle_id} flush className="overflow-hidden">
              <div className="p-4 flex gap-4">
                <CardImage card={card} className="w-28" />
                <div className="min-w-0 flex-1 flex flex-col gap-2">
                  <CardHeader card={card} />
                  <CardRules card={card} />
                  {(have > 0 || want > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {have > 0 && <Badge color="green">in pool ×{have}</Badge>}
                      {want > 0 && <Badge color="amber">wished ×{want}</Badge>}
                    </div>
                  )}

                  <form action={action} className="mt-auto pt-2 flex flex-wrap items-end gap-2">
                    <input type="hidden" name="oracle_id" value={card.oracle_id} />
                    <input type="hidden" name="q" value={query} />
                    <label className="text-[10px] text-gray-500">
                      Copies
                      <input name="owned_qty" type="number" min={1} max={99} defaultValue={1} required className={`${input} block w-16`} />
                    </label>
                    <label className="text-[10px] text-gray-500">
                      German
                      <input name="copies_de" type="number" min={0} max={99} defaultValue={0} className={`${input} block w-16`} />
                    </label>
                    <label className="text-[10px] text-gray-500 flex-1 min-w-28">
                      Note
                      <input name="note" maxLength={500} className={`${input} block w-full`} />
                    </label>
                    <button
                      type="submit"
                      name="intent"
                      value="pool"
                      aria-label={`Add ${card.name} to the pool`}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                    >
                      Own it
                    </button>
                    <button
                      type="submit"
                      name="intent"
                      value="wish"
                      aria-label={`Add ${card.name} to the wishlist`}
                      className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-amber-400 text-sm hover:bg-amber-500/10 hover:border-amber-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      Want it
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
