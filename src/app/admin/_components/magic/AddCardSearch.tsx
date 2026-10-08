import { CheckCircle2, ExternalLink, Search } from 'lucide-react';
import { Badge, Card } from '../ui';
import { CardImage, ManaCost } from './parts';
import type { CatalogCard } from '../../_lib/magic/collection';

/**
 * Search over the Scryfall catalog (every paper card) and one add form per
 * result. A plain GET form drives the search, so it works without client JS.
 */
export function AddCardSearch({
  query,
  results,
  truncated = false,
  owned,
  added,
  formError,
  error,
  catalogSize,
  action,
}: {
  query: string;
  results: CatalogCard[];
  /** More cards matched than are shown. */
  truncated?: boolean;
  /** Copies already in the pool, per oracle_id. */
  owned: Map<string, number>;
  added?: string;
  /** Why the last add was refused (from the server action). */
  formError?: string;
  error?: boolean;
  catalogSize: number | null;
  action: (formData: FormData) => Promise<void>;
}) {
  const input =
    'bg-[#0b0b0b] border border-[#222] rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500';
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
            className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
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
      {formError && (
        <p role="alert" className="text-sm text-red-400">
          Not added: {formError}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          The search failed.
        </p>
      )}

      {query.length >= 2 && !error && (
        <p className="text-xs text-gray-500" aria-live="polite">
          {!results.length
            ? `No card matches “${query}”.`
            : truncated
              ? `First ${results.length} matches for “${query}” — type more to narrow it down`
              : `${results.length} matches for “${query}”`}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {results.map((card) => {
          const have = owned.get(card.oracle_id) ?? 0;
          return (
            <Card key={card.oracle_id} flush className="overflow-hidden">
              <div className="p-4 flex gap-4">
                <CardImage name={card.name} url={card.image_url} colors={card.colors} className="w-28" />
                <div className="min-w-0 flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white leading-tight">{card.name}</h3>
                    <ManaCost cost={card.mana_cost} />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {card.type_line}
                    {card.power_toughness && ` · ${card.power_toughness}`}
                    {card.loyalty && ` · Loyalty ${card.loyalty}`}
                  </p>
                  <details className="text-xs text-gray-400">
                    <summary className="cursor-pointer text-blue-400 hover:text-blue-300 select-none">Text</summary>
                    <p className="mt-2 leading-relaxed whitespace-pre-line">{card.oracle_text}</p>
                  </details>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                    {card.set_name && <span>{card.set_name}</span>}
                    {card.scryfall_uri && (
                      <a
                        href={card.scryfall_uri}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        Scryfall <ExternalLink size={11} aria-hidden="true" />
                      </a>
                    )}
                    {have > 0 && <Badge color="green">in pool ×{have}</Badge>}
                  </div>

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
                      aria-label={`Add ${card.name} to the pool`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      Add
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
