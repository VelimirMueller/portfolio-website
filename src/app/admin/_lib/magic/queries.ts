import type { TypedSupabaseClient } from '@/utils/supabase/env';
import type { CatalogCard, Deck, DeckCard, DeckSection, ManaColor, PoolEntry, WishEntry } from './types';

// Every Magic read in one place. The client is typed with src/types/supabase.ts
// (generated from supabase/migrations), so a renamed or dropped column fails the
// type check. Each function returns { data, error } so pages decide how to show failures.

type Result<T> = { data: T; error: boolean };
type DbError = { code?: string; message?: string } | null;

/**
 * Pages show "Could not load …" on a failed read; this puts the reason in the
 * server log (Vercel), e.g. PGRST205 for a missing table after a skipped
 * migration. Codes and messages only, never row data.
 */
function failed(what: string, error: DbError): boolean {
  if (error) console.error(`[admin] magic: ${what} failed:`, error.code ?? '', error.message ?? '');
  return Boolean(error);
}

export const CATALOG_COLUMNS =
  'oracle_id, name, mana_cost, mana_value, type_line, oracle_text, colors, power_toughness, loyalty, rarity, set_code, set_name, released_at, image_url, scryfall_uri' as const;
// The pool also embeds the printed names (mtg_card_name, FK oracle_id) so its search works in DE and FR.
const POOL_SELECT = `id, owned_qty, copies_de, name_de, note, card:mtg_catalog(${CATALOG_COLUMNS}, names:mtg_card_name(lang, printed_name))` as const;
const WISH_SELECT = `id, qty, note, created_at, card:mtg_catalog(${CATALOG_COLUMNS})` as const;
const DECK_CARD_SELECT = `id, section, position, qty, note, swap_out, price_eur, card:mtg_catalog(${CATALOG_COLUMNS})` as const;

export const SEARCH_LIMIT = 24;

// The schema stores colors and section as text with a check constraint, so the
// generated types say string. These convert a selected row to the app's types.
const MANA_COLORS: readonly string[] = ['W', 'U', 'B', 'R', 'G'] satisfies ManaColor[];
const DECK_SECTIONS: readonly string[] = ['main', 'sideboard', 'upgrade'] satisfies DeckSection[];
const isManaColor = (color: string): color is ManaColor => MANA_COLORS.includes(color);
const isDeckSection = (section: string): section is DeckSection => DECK_SECTIONS.includes(section);

type CardRow = Omit<CatalogCard, 'colors'> & { colors: string[] };
type DeckCardRow = Omit<DeckCard, 'section' | 'card'> & { section: string; card: CardRow };
type DeckRow = Omit<Deck, 'colors' | 'cards'> & { colors: string[]; cards: DeckCardRow[] };

function toCard(row: CardRow): CatalogCard {
  return { ...row, colors: row.colors.filter(isManaColor) };
}

function toDeck(row: DeckRow): Deck {
  const cards: DeckCard[] = [];
  for (const { section, card, ...line } of row.cards) {
    // The check constraint allows only these sections, so this skips nothing today.
    if (isDeckSection(section)) cards.push({ ...line, section, card: toCard(card) });
    else console.warn('[admin] magic: skipped a deck line with unknown section', section.slice(0, 20));
  }
  return { ...row, colors: row.colors.filter(isManaColor), cards };
}

export async function loadPool(supabase: TypedSupabaseClient): Promise<Result<PoolEntry[]>> {
  const { data, error } = await supabase.from('mtg_collection').select(POOL_SELECT);
  const pool: PoolEntry[] = (data ?? []).map((entry) => ({ ...entry, card: toCard(entry.card) }));
  return { data: pool, error: failed('load pool', error) };
}

/** Copies owned per card, for deck ownership without loading the whole catalog row. */
export async function loadOwned(supabase: TypedSupabaseClient): Promise<Result<Map<string, number>>> {
  const { data, error } = await supabase.from('mtg_collection').select('oracle_id, owned_qty');
  const rows = data ?? [];
  return { data: new Map(rows.map((r) => [r.oracle_id, r.owned_qty])), error: failed('load owned copies', error) };
}

/** The wishlist, oldest wish first. */
export async function loadWishlist(supabase: TypedSupabaseClient): Promise<Result<WishEntry[]>> {
  const { data, error } = await supabase.from('mtg_wishlist').select(WISH_SELECT).order('created_at');
  const wishes: WishEntry[] = (data ?? []).map((wish) => ({ ...wish, card: toCard(wish.card) }));
  return { data: wishes, error: failed('load wishlist', error) };
}

/** Wanted copies per card, for the add form's badges. */
export async function loadWished(supabase: TypedSupabaseClient): Promise<Result<Map<string, number>>> {
  const { data, error } = await supabase.from('mtg_wishlist').select('oracle_id, qty');
  const rows = data ?? [];
  return { data: new Map(rows.map((r) => [r.oracle_id, r.qty])), error: failed('load wished copies', error) };
}

/**
 * Owned copies per deck line, computed by the database view mtg_deck_ownership
 * (main deck before sideboard; the app reads the same view). Keyed by line id.
 */
export async function loadDeckOwnership(
  supabase: TypedSupabaseClient,
  deckId?: string
): Promise<Result<Map<string, number>>> {
  const query = supabase.from('mtg_deck_ownership').select('id, owned');
  const { data, error } = await (deckId ? query.eq('deck_id', deckId) : query);
  // View columns are nullable in the generated types; every line has an id and a count.
  const owned = new Map<string, number>();
  for (const row of data ?? []) if (row.id !== null) owned.set(row.id, row.owned ?? 0);
  return { data: owned, error: failed('load deck ownership', error) };
}

export async function loadDecks(supabase: TypedSupabaseClient): Promise<Result<Deck[]>> {
  const { data, error } = await supabase
    .from('mtg_deck')
    .select(`id, slug, name, summary, colors, main_size, sideboard_size, shipping_eur, cards:mtg_deck_card(${DECK_CARD_SELECT})`)
    .order('name');
  const decks: Deck[] = (data ?? []).map(toDeck);
  return { data: decks, error: failed('load decks', error) };
}

export async function loadDeck(supabase: TypedSupabaseClient, slug: string): Promise<Result<Deck | null>> {
  const { data, error } = await supabase
    .from('mtg_deck')
    .select(`id, slug, name, summary, colors, main_size, sideboard_size, shipping_eur, cards:mtg_deck_card(${DECK_CARD_SELECT})`)
    .eq('slug', slug)
    .maybeSingle();
  const deck: Deck | null = data ? toDeck(data) : null;
  return { data: deck, error: failed('load deck', error) };
}

/**
 * Ranked name search over the catalog (SQL function mtg_search_catalog).
 * `more` is true when more cards matched than are returned.
 */
export async function searchCatalog(
  supabase: TypedSupabaseClient,
  query: string
): Promise<Result<{ cards: CatalogCard[]; more: boolean }>> {
  if (query.trim().length < 2) return { data: { cards: [], more: false }, error: false };
  const { data, error } = await supabase.rpc('mtg_search_catalog', { p_query: query, p_limit: SEARCH_LIMIT });
  const rows = (data ?? []).map(toCard);
  return {
    data: { cards: rows.slice(0, SEARCH_LIMIT), more: rows.length > SEARCH_LIMIT },
    error: failed('catalog search', error),
  };
}

export async function catalogSize(supabase: TypedSupabaseClient): Promise<number | null> {
  const { count, error } = await supabase.from('mtg_catalog').select('oracle_id', { count: 'exact', head: true });
  failed('count catalog', error);
  return count ?? null;
}
