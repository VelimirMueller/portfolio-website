import { typeGroup, type TypeGroup } from './cards';
import type { ManaColor, PoolEntry } from './types';

// Filtering, sorting and totals for the pool view. Pure functions.

/** Filter value for the color chips: one color, multicolor, or colorless. */
export type ColorFilter = ManaColor | 'multi' | 'colorless' | 'all';

export function matchesColor(colors: ManaColor[], filter: ColorFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'multi') return colors.length > 1;
  if (filter === 'colorless') return colors.length === 0;
  return colors.includes(filter);
}

/** Case-insensitive search over the English and German name, type, text and note. */
export function matchesQuery(entry: PoolEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const { card } = entry;
  return [card.name, entry.name_de, card.type_line, card.oracle_text, entry.note].some((field) =>
    field?.toLowerCase().includes(q)
  );
}

/** Lands last, then by mana value, then by name — the way a deck list reads. */
export function compareEntries(a: PoolEntry, b: PoolEntry): number {
  const landA = typeGroup(a.card.type_line) === 'Land' ? 1 : 0;
  const landB = typeGroup(b.card.type_line) === 'Land' ? 1 : 0;
  return landA - landB || a.card.mana_value - b.card.mana_value || a.card.name.localeCompare(b.card.name);
}

export function filterPool(
  entries: PoolEntry[],
  { query, color, type }: { query: string; color: ColorFilter; type: TypeGroup | 'all' }
): PoolEntry[] {
  return entries
    .filter(
      (e) =>
        matchesColor(e.card.colors, color) &&
        matchesQuery(e, query) &&
        (type === 'all' || typeGroup(e.card.type_line) === type)
    )
    .sort(compareEntries);
}

export function poolStats(entries: PoolEntry[]) {
  return {
    unique: entries.length,
    copies: entries.reduce((n, e) => n + e.owned_qty, 0),
    german: entries.reduce((n, e) => n + e.copies_de, 0),
    rares: entries.filter((e) => e.card.rarity === 'rare' || e.card.rarity === 'mythic').length,
  };
}

/** Copies owned per card, keyed by oracle_id. */
export function ownedById(entries: PoolEntry[]): Map<string, number> {
  return new Map(entries.map((e) => [e.card.oracle_id, e.owned_qty]));
}
