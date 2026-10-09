import type { SupabaseClient } from '@supabase/supabase-js';
import type { CatalogCard, Deck, PoolEntry, WishEntry } from './types';

// Every Magic read in one place. The client is untyped (no generated DB
// types), so the casts to our row types live here and nowhere else.
// Each function returns { data, error } so pages decide how to show failures.

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
  'oracle_id, name, mana_cost, mana_value, type_line, oracle_text, colors, power_toughness, loyalty, rarity, set_code, set_name, released_at, image_url, scryfall_uri';
const POOL_SELECT = `id, owned_qty, copies_de, name_de, note, card:mtg_catalog(${CATALOG_COLUMNS})`;
const WISH_SELECT = `id, qty, note, created_at, card:mtg_catalog(${CATALOG_COLUMNS})`;
const DECK_CARD_SELECT = `id, section, position, qty, note, swap_out, price_eur, card:mtg_catalog(${CATALOG_COLUMNS})`;

export const SEARCH_LIMIT = 24;

export async function loadPool(supabase: SupabaseClient): Promise<Result<PoolEntry[]>> {
  const { data, error } = await supabase.from('mtg_collection').select(POOL_SELECT);
  return { data: (data ?? []) as unknown as PoolEntry[], error: failed('load pool', error) };
}

/** Copies owned per card, for deck ownership without loading the whole catalog row. */
export async function loadOwned(supabase: SupabaseClient): Promise<Result<Map<string, number>>> {
  const { data, error } = await supabase.from('mtg_collection').select('oracle_id, owned_qty');
  const rows = (data ?? []) as { oracle_id: string; owned_qty: number }[];
  return { data: new Map(rows.map((r) => [r.oracle_id, r.owned_qty])), error: failed('load owned copies', error) };
}

/** The wishlist, oldest wish first. */
export async function loadWishlist(supabase: SupabaseClient): Promise<Result<WishEntry[]>> {
  const { data, error } = await supabase.from('mtg_wishlist').select(WISH_SELECT).order('created_at');
  return { data: (data ?? []) as unknown as WishEntry[], error: failed('load wishlist', error) };
}

/** Wanted copies per card, for the add form's badges. */
export async function loadWished(supabase: SupabaseClient): Promise<Result<Map<string, number>>> {
  const { data, error } = await supabase.from('mtg_wishlist').select('oracle_id, qty');
  const rows = (data ?? []) as { oracle_id: string; qty: number }[];
  return { data: new Map(rows.map((r) => [r.oracle_id, r.qty])), error: failed('load wished copies', error) };
}

/**
 * Owned copies per deck line, computed by the database view mtg_deck_ownership
 * (main deck before sideboard; the app reads the same view). Keyed by line id.
 */
export async function loadDeckOwnership(
  supabase: SupabaseClient,
  deckId?: string
): Promise<Result<Map<string, number>>> {
  const query = supabase.from('mtg_deck_ownership').select('id, owned');
  const { data, error } = await (deckId ? query.eq('deck_id', deckId) : query);
  const rows = (data ?? []) as { id: string; owned: number }[];
  return { data: new Map(rows.map((r) => [r.id, r.owned])), error: failed('load deck ownership', error) };
}

export async function loadDecks(supabase: SupabaseClient): Promise<Result<Deck[]>> {
  const { data, error } = await supabase
    .from('mtg_deck')
    .select(`id, slug, name, summary, colors, main_size, sideboard_size, shipping_eur, cards:mtg_deck_card(${DECK_CARD_SELECT})`)
    .order('name');
  return { data: (data ?? []) as unknown as Deck[], error: failed('load decks', error) };
}

export async function loadDeck(supabase: SupabaseClient, slug: string): Promise<Result<Deck | null>> {
  const { data, error } = await supabase
    .from('mtg_deck')
    .select(`id, slug, name, summary, colors, main_size, sideboard_size, shipping_eur, cards:mtg_deck_card(${DECK_CARD_SELECT})`)
    .eq('slug', slug)
    .maybeSingle();
  return { data: (data ?? null) as unknown as Deck | null, error: failed('load deck', error) };
}

/**
 * Ranked name search over the catalog (SQL function mtg_search_catalog).
 * `more` is true when more cards matched than are returned.
 */
export async function searchCatalog(
  supabase: SupabaseClient,
  query: string
): Promise<Result<{ cards: CatalogCard[]; more: boolean }>> {
  if (query.trim().length < 2) return { data: { cards: [], more: false }, error: false };
  const { data, error } = await supabase.rpc('mtg_search_catalog', { p_query: query, p_limit: SEARCH_LIMIT });
  const rows = (data ?? []) as CatalogCard[];
  return {
    data: { cards: rows.slice(0, SEARCH_LIMIT), more: rows.length > SEARCH_LIMIT },
    error: failed('catalog search', error),
  };
}

export async function catalogSize(supabase: SupabaseClient): Promise<number | null> {
  const { count, error } = await supabase.from('mtg_catalog').select('oracle_id', { count: 'exact', head: true });
  failed('count catalog', error);
  return count ?? null;
}
