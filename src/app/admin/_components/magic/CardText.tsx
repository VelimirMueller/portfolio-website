import { ExternalLink } from 'lucide-react';
import type { CatalogCard } from '../../_lib/magic/types';
import { ManaCost } from './ManaCost';

/** Name, cost, type line and rules text of a card — shared by pool and search tiles. */
export function CardHeader({ card, subtitle }: { card: CatalogCard; subtitle?: string | null }) {
  const stats = card.power_toughness ?? (card.loyalty ? `Loyalty ${card.loyalty}` : null);
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-white leading-tight">{card.name}</h3>
          {subtitle && <p className="text-xs text-gray-500 italic">{subtitle}</p>}
        </div>
        <ManaCost cost={card.mana_cost} />
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
        <span>{card.type_line}</span>
        {stats && (
          <span className="px-1.5 py-0.5 rounded-md bg-[#1a1a1a] border border-[#333] font-mono text-gray-300">{stats}</span>
        )}
      </div>
    </>
  );
}

/** Rules text plus set and Scryfall link. */
export function CardRules({ card }: { card: CatalogCard }) {
  return (
    <div className="text-xs text-gray-400 space-y-1.5">
      <p className="leading-relaxed whitespace-pre-line">{card.oracle_text}</p>
      <p className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
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
      </p>
    </div>
  );
}
