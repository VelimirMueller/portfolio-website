import { cachedImagePath } from './imageCache';
import type { ManaColor } from './types';

// Card-level helpers shared by the pool, the decks and the catalog search.

export const COLOR_NAMES: Record<ManaColor, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

export const TYPE_GROUPS = ['Creature', 'Instant', 'Sorcery', 'Enchantment', 'Artifact', 'Planeswalker', 'Land'] as const;
export type TypeGroup = (typeof TYPE_GROUPS)[number];

/**
 * The single bucket a card is listed under. Order matters: an artifact
 * creature counts as a creature, and every kind of land as a land.
 */
export function typeGroup(typeLine: string): TypeGroup {
  if (/land/i.test(typeLine)) return 'Land';
  if (/creature/i.test(typeLine)) return 'Creature';
  return TYPE_GROUPS.find((g) => typeLine.includes(g)) ?? 'Artifact';
}

/** "{2}{W/U}" -> ["2", "W/U"], for rendering one pip per symbol. */
export function manaSymbols(cost: string | null): string[] {
  return cost ? Array.from(cost.matchAll(/\{([^}]+)\}/g), (m) => m[1]) : [];
}

/**
 * Where the page loads a card image from: our cached same-origin route, never
 * Scryfall directly. "small" (146×204) keeps a big grid light.
 */
export function cardImage(url: string | null, size: 'small' | 'normal' | 'large' = 'normal'): string | null {
  return cachedImagePath(url, size);
}
