import { cachedImagePath } from './imageCache';

// Velimir's Magic: The Gathering pool (public.mtg_collection) and the Scryfall
// catalog (public.mtg_catalog). Pure helpers only; queries live in the pages.

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';
/** Where the card text comes from: Scryfall, or read from a photo (fully, partly, not yet). */
export type ReadStatus = 'scryfall' | 'photo' | 'partial' | 'verify';

/** One row of public.mtg_collection. */
export type PoolCard = {
  id: string;
  oracle_id: string | null;
  name: string;
  name_de: string | null;
  owned_qty: number;
  copies_de: number;
  colors: ManaColor[];
  type_line: string;
  mana_cost: string | null;
  mana_value: number | null;
  power_toughness: string | null;
  oracle_text: string;
  short: string | null;
  status: ReadStatus;
  note: string | null;
  image_url: string | null;
  scryfall_uri: string | null;
};

/** One row of public.mtg_catalog — every paper card Scryfall knows. */
export type CatalogCard = {
  oracle_id: string;
  name: string;
  mana_cost: string | null;
  mana_value: number;
  type_line: string;
  oracle_text: string;
  colors: ManaColor[];
  power_toughness: string | null;
  loyalty: string | null;
  rarity: string | null;
  set_code: string | null;
  set_name: string | null;
  released_at: string | null;
  image_url: string | null;
  scryfall_uri: string | null;
};

export const POOL_COLUMNS =
  'id, oracle_id, name, name_de, owned_qty, copies_de, colors, type_line, mana_cost, mana_value, power_toughness, oracle_text, short, status, note, image_url, scryfall_uri';
export const CATALOG_COLUMNS =
  'oracle_id, name, mana_cost, mana_value, type_line, oracle_text, colors, power_toughness, loyalty, rarity, set_code, set_name, released_at, image_url, scryfall_uri';

export const COLOR_NAMES: Record<ManaColor, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

/** Filter value for the color chips: one color, multicolor, or colorless. */
export type ColorFilter = ManaColor | 'multi' | 'colorless' | 'all';

export const TYPE_GROUPS = ['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Planeswalker', 'Land'] as const;
export type TypeGroup = (typeof TYPE_GROUPS)[number];

/**
 * The single bucket a card is listed under. Order matters: an artifact
 * creature counts as a creature, and every kind of land as a land.
 */
export function typeGroup(type: string): TypeGroup {
  if (/land/i.test(type)) return 'Land';
  if (/creature/i.test(type)) return 'Creature';
  return TYPE_GROUPS.find((g) => type.includes(g)) ?? 'Artifact';
}

export function matchesColor(card: Pick<PoolCard, 'colors'>, filter: ColorFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'multi') return card.colors.length > 1;
  if (filter === 'colorless') return card.colors.length === 0;
  return card.colors.includes(filter);
}

/** Case-insensitive search over both names and the card text. */
export function matchesQuery(card: PoolCard, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [card.name, card.name_de, card.type_line, card.oracle_text, card.short, card.note].some((field) =>
    field?.toLowerCase().includes(q)
  );
}

/** Lands last, then by mana value, then by name — the way a deck list reads. */
export function compareCards(a: PoolCard, b: PoolCard): number {
  const landA = typeGroup(a.type_line) === 'Land' ? 1 : 0;
  const landB = typeGroup(b.type_line) === 'Land' ? 1 : 0;
  if (landA !== landB) return landA - landB;
  const mvA = a.mana_value ?? Number.MAX_SAFE_INTEGER;
  const mvB = b.mana_value ?? Number.MAX_SAFE_INTEGER;
  if (mvA !== mvB) return mvA - mvB;
  return a.name.localeCompare(b.name);
}

export function filterCards(
  cards: PoolCard[],
  { query, color, type }: { query: string; color: ColorFilter; type: TypeGroup | 'all' }
): PoolCard[] {
  return cards
    .filter(
      (c) => matchesColor(c, color) && matchesQuery(c, query) && (type === 'all' || typeGroup(c.type_line) === type)
    )
    .sort(compareCards);
}

export function collectionStats(cards: PoolCard[]) {
  return {
    unique: cards.length,
    copies: cards.reduce((n, c) => n + c.owned_qty, 0),
    german: cards.reduce((n, c) => n + c.copies_de, 0),
    toVerify: cards.filter((c) => c.status !== 'scryfall').length,
  };
}

/** "{2}{W/U}" -> ["2", "W/U"], for rendering one pip per symbol. */
export function manaSymbols(cost: string | null): string[] {
  return cost ? Array.from(cost.matchAll(/\{([^}]+)\}/g), (m) => m[1]) : [];
}

/**
 * Where the page loads a card image from: our cached route, never Scryfall
 * directly. "small" (146×204) keeps a 200-card grid light.
 */
export function cardImage(url: string | null, size: 'small' | 'normal' | 'large' = 'normal'): string | null {
  return cachedImagePath(url, size);
}

/** Copies per card name across the pool (basic and full-art Islands add up). */
export function ownedByName(pool: Pick<PoolCard, 'name' | 'owned_qty'>[]): Map<string, number> {
  const owned = new Map<string, number>();
  for (const c of pool) owned.set(c.name, (owned.get(c.name) ?? 0) + c.owned_qty);
  return owned;
}

/**
 * Turns a catalog search into an ilike pattern. %, _ and \ in the input are
 * matched literally, so "50%" does not turn into a wildcard.
 */
export function namePattern(query: string): string {
  return `%${query.trim().replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

/** Exact name first, then names that start with the query, then the rest. */
export function rankSearch<T extends { name: string }>(rows: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  const rank = (name: string) => {
    const n = name.toLowerCase();
    if (n === q) return 0;
    if (n.startsWith(q)) return 1;
    return n.split(/[\s,/-]+/).some((w) => w.startsWith(q)) ? 2 : 3;
  };
  return [...rows].sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}
