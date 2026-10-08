// Test data shared by the Magic tests. Not imported by app code.
import type { CatalogCard, PoolCard } from './collection';

export const poolCard = (over: Partial<PoolCard> = {}): PoolCard => ({
  id: '00000000-0000-4000-8000-000000000001',
  oracle_id: '10000000-0000-4000-8000-000000000001',
  name: 'Test Card',
  name_de: null,
  owned_qty: 1,
  copies_de: 0,
  colors: ['U'],
  type_line: 'Creature — Wizard',
  mana_cost: '{1}{U}',
  mana_value: 2,
  power_toughness: '1/1',
  oracle_text: 'Flying.',
  short: 'A flier.',
  status: 'scryfall',
  note: null,
  image_url: 'https://cards.scryfall.io/normal/front/a/b/ab.jpg?1',
  scryfall_uri: 'https://scryfall.com/card/fra/1/test',
  ...over,
});

export const catalogCard = (over: Partial<CatalogCard> = {}): CatalogCard => ({
  oracle_id: '20000000-0000-4000-8000-000000000001',
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
  image_url: 'https://cards.scryfall.io/normal/front/c/r/cr.jpg?1',
  scryfall_uri: 'https://scryfall.com/card/rtr/35/cyclonic-rift',
  ...over,
});
