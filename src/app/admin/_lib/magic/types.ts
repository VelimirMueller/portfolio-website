// Shapes of the Magic tables (supabase/migrations/*magic*.sql) as the pages
// read them. Queries that produce them live in ./queries.ts.

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G';

/** public.mtg_catalog — one paper card from Scryfall's Oracle Cards file. */
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

/** public.mtg_collection — copies Velimir owns of one card. */
export type PoolEntry = {
  id: string;
  owned_qty: number;
  copies_de: number;
  name_de: string | null;
  note: string | null;
  card: CatalogCard;
};

/** public.mtg_wishlist — copies Velimir wants but does not own yet. */
export type WishEntry = {
  id: string;
  qty: number;
  note: string | null;
  created_at?: string;
  card: CatalogCard;
};

export type DeckSection = 'main' | 'sideboard' | 'upgrade';

/**
 * public.mtg_deck_card. What `note` and `swap_out` mean depends on the section:
 * main — note = job; sideboard — note = against, swap_out = what leaves;
 * upgrade — note = why, swap_out = what it replaces, position = step.
 */
export type DeckCard = {
  id: string;
  section: DeckSection;
  position: number;
  qty: number;
  note: string;
  swap_out: string | null;
  /** Planned price per copy in EUR, for the shopping list. */
  price_eur: number | null;
  card: CatalogCard;
};

/** public.mtg_deck with its cards. */
export type Deck = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  colors: ManaColor[];
  main_size: number;
  sideboard_size: number;
  shipping_eur: number;
  cards: DeckCard[];
};
