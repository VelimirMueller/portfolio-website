import data from './collection.json';

// Velimir's Magic: The Gathering collection. The JSON is the owner's list as
// read from card photos; edit it there, not here.

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';
/** How the card text was captured: from a photo, partly unreadable, or not read yet. */
export type ReadStatus = 'photo' | 'partial' | 'verify';

export type MagicCard = {
  name: string;
  name_de: string | null;
  copies_de: number;
  owned_qty: number;
  colors: ManaColor[];
  type: string;
  mana_cost: string | null;
  mana_value: number | null;
  power_toughness: string | null;
  effect: string;
  short: string;
  status: ReadStatus;
  note: string | null;
};

export type CollectionMeta = { owner_note: string; set: string; colors_key: string };

export const COLLECTION = data as { meta: CollectionMeta; cards: MagicCard[] };

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

export function matchesColor(card: MagicCard, filter: ColorFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'multi') return card.colors.length > 1;
  if (filter === 'colorless') return card.colors.length === 0;
  return card.colors.includes(filter);
}

/** Case-insensitive search over both names and the card text. */
export function matchesQuery(card: MagicCard, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [card.name, card.name_de, card.type, card.effect, card.short, card.note]
    .some((field) => field?.toLowerCase().includes(q));
}

/** Lands last, then by mana value, then by name — the way a deck list reads. */
export function compareCards(a: MagicCard, b: MagicCard): number {
  const landA = typeGroup(a.type) === 'Land' ? 1 : 0;
  const landB = typeGroup(b.type) === 'Land' ? 1 : 0;
  if (landA !== landB) return landA - landB;
  const mvA = a.mana_value ?? Number.MAX_SAFE_INTEGER;
  const mvB = b.mana_value ?? Number.MAX_SAFE_INTEGER;
  if (mvA !== mvB) return mvA - mvB;
  return a.name.localeCompare(b.name);
}

export function filterCards(
  cards: MagicCard[],
  { query, color, type }: { query: string; color: ColorFilter; type: TypeGroup | 'all' },
): MagicCard[] {
  return cards
    .filter((c) => matchesColor(c, color) && matchesQuery(c, query) && (type === 'all' || typeGroup(c.type) === type))
    .sort(compareCards);
}

export function collectionStats(cards: MagicCard[]) {
  return {
    unique: cards.length,
    copies: cards.reduce((n, c) => n + c.owned_qty, 0),
    german: cards.reduce((n, c) => n + c.copies_de, 0),
    toVerify: cards.filter((c) => c.status !== 'photo').length,
  };
}

/** "{2}{W/U}" -> ["2", "W/U"], for rendering one pip per symbol. */
export function manaSymbols(cost: string | null): string[] {
  return cost ? Array.from(cost.matchAll(/\{([^}]+)\}/g), (m) => m[1]) : [];
}
