import type { Deck, DeckCard, ManaColor } from './types';

// Deck analysis against the pool. Pure functions; ownership is by oracle_id.

export type DeckLine = DeckCard & { owned: number; missing: number };

/**
 * Splits a deck into sections and attaches ownership. [ownedByLine] comes from
 * the database view mtg_deck_ownership (keyed by deck line id), which fills a
 * main-deck slot before a sideboard slot. Upgrades are plans, not counted.
 */
export function deckOwnership(cards: DeckCard[], ownedByLine: Map<string, number>) {
  const line = (c: DeckCard): DeckLine => {
    const owned = Math.min(c.qty, ownedByLine.get(c.id) ?? 0);
    return { ...c, owned, missing: c.qty - owned };
  };
  const bySection = (section: DeckCard['section']) =>
    cards.filter((c) => c.section === section).sort((a, b) => a.position - b.position);

  const main = bySection('main').map(line);
  const sideboard = bySection('sideboard').map(line);
  const upgrades = bySection('upgrade');
  const sum = (lines: DeckLine[], key: 'qty' | 'owned' | 'missing') => lines.reduce((n, l) => n + l[key], 0);
  return {
    main,
    sideboard,
    upgrades,
    totals: {
      main: sum(main, 'qty'),
      sideboard: sum(sideboard, 'qty'),
      owned: sum(main, 'owned') + sum(sideboard, 'owned'),
      missing: sum(main, 'missing') + sum(sideboard, 'missing'),
    },
  };
}

export type DeckAnalysis = ReturnType<typeof deckOwnership>;

/** Copies still to buy per card, with the planned cost (missing × price per copy). */
export function shoppingList(analysis: DeckAnalysis) {
  const items = new Map<string, { name: string; qty: number; eur: number | null }>();
  for (const line of [...analysis.main, ...analysis.sideboard]) {
    if (!line.missing) continue;
    const item = items.get(line.card.oracle_id) ?? { name: line.card.name, qty: 0, eur: 0 };
    item.qty += line.missing;
    item.eur = line.price_eur == null || item.eur == null ? null : item.eur + line.missing * line.price_eur;
    items.set(line.card.oracle_id, item);
  }
  return Array.from(items.values());
}

/** Card names whose colors fall outside the deck's colors (a black card in a mono-blue deck). */
export function offColor(cards: DeckCard[], deckColors: ManaColor[]): string[] {
  const names = cards
    .filter((c) => c.section !== 'upgrade' && c.card.colors.some((color) => !deckColors.includes(color)))
    .map((c) => c.card.name);
  return Array.from(new Set(names));
}

/** Plan problems worth a warning on the deck page. */
export function deckWarnings(deck: Deck, analysis: DeckAnalysis): string[] {
  const { totals } = analysis;
  const off = offColor(deck.cards, deck.colors);
  const cards = (n: number) => `${n} card${n === 1 ? '' : 's'}`;
  return [
    totals.main !== deck.main_size && `Main deck has ${cards(totals.main)}, the plan says ${deck.main_size}.`,
    totals.sideboard !== deck.sideboard_size &&
      `Sideboard has ${cards(totals.sideboard)}, the plan says ${deck.sideboard_size}.`,
    off.length > 0 && `Outside the deck colors: ${off.join(', ')}.`,
  ].filter((w): w is string => Boolean(w));
}
