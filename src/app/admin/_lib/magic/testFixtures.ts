// Test data shared by the Magic tests. Not imported by app code.
import type { CatalogCard, Deck, DeckCard, PoolEntry, WishEntry } from './types';

let seq = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`;

export const catalogCard = (over: Partial<CatalogCard> = {}): CatalogCard => ({
  oracle_id: uuid(),
  name: 'Cyclonic Rift',
  mana_cost: '{1}{U}',
  mana_value: 2,
  type_line: 'Instant',
  oracle_text: "Return target nonland permanent you don't control to its owner's hand.\nOverload {6}{U}",
  colors: ['U'],
  power_toughness: null,
  loyalty: null,
  rarity: 'rare',
  set_code: 'rtr',
  set_name: 'Return to Ravnica',
  released_at: '2012-10-05',
  image_url: 'https://cards.scryfall.io/normal/front/c/0/c0000000-0000-4000-8000-000000000002.jpg?1',
  scryfall_uri: 'https://scryfall.com/card/rtr/35/cyclonic-rift',
  ...over,
});

export const poolEntry = (card: Partial<CatalogCard> = {}, over: Partial<Omit<PoolEntry, 'card'>> = {}): PoolEntry => ({
  id: uuid(),
  owned_qty: 1,
  copies_de: 0,
  name_de: null,
  note: null,
  card: catalogCard(card),
  ...over,
});

export const wishEntry = (card: Partial<CatalogCard> = {}, over: Partial<Omit<WishEntry, 'card'>> = {}): WishEntry => ({
  id: uuid(),
  qty: 1,
  note: null,
  card: catalogCard(card),
  ...over,
});

export const deckCard = (card: CatalogCard, over: Partial<Omit<DeckCard, 'card'>> = {}): DeckCard => ({
  id: uuid(),
  section: 'main',
  position: 1,
  qty: 1,
  note: '',
  swap_out: null,
  price_eur: null,
  card,
  ...over,
});

export const deck = (cards: DeckCard[], over: Partial<Omit<Deck, 'cards'>> = {}): Deck => ({
  id: uuid(),
  slug: 'testdeck',
  name: 'Testdeck',
  summary: 'A test.',
  colors: ['U'],
  main_size: 60,
  sideboard_size: 15,
  shipping_eur: 8,
  cards,
  ...over,
});
