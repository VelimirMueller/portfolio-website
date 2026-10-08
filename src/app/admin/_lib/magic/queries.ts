import type { SupabaseClient } from '@supabase/supabase-js';
import type { CatalogCard, Deck, PoolEntry } from './types';

// Every Magic read in one place. The client is untyped (no generated DB
// types), so the casts to our row types live here and nowhere else.
// Each function returns { data, error } so pages decide how to show failures.

type Result<T> = { data: T; error: boolean };

export const CATALOG_COLUMNS =
  'oracle_id, name, mana_cost, mana_value, type_line, oracle_text, colors, power_toughness, loyalty, rarity, set_code, set_name, released_at, image_url, scryfall_uri';
const POOL_SELECT = `id, owned_qty, copies_de, name_de, note, card:mtg_catalog(${CATALOG_COLUMNS})`;
const DECK_CARD_SELECT = `id, section, position, qty, note, swap_out, price_eur, card:mtg_catalog(${CATALOG_COLUMNS})`;

export const SEARCH_LIMIT = 24;

export async function loadPool(supabase: SupabaseClient): Promise<Result<PoolEntry[]>> {
  const { data, error } = await supabase.from('mtg_collection').select(POOL_SELECT);
  return { data: (data ?? []) as unknown as PoolEntry[], error: Boolean(error) };
}

/** Copies owned per card, for deck ownership without loading the whole catalog row. */
export async function loadOwned(supabase: SupabaseClient): Promise<Result<Map<string, number>>> {
  const { data, error } = await supabase.from('mtg_collection').select('oracle_id, owned_qty');
  const rows = (data ?? []) as { oracle_id: string; owned_qty: number }[];
  return { data: new Map(rows.map((r) => [r.oracle_id, r.owned_qty])), error: Boolean(error) };
}

export async function loadDecks(supabase: SupabaseClient): Promise<Result<Deck[]>> {
  const { data, error } = await supabase
    .from('mtg_deck')
    .select(`id, slug, name, summary, colors, main_size, sideboard_size, shipping_eur, cards:mtg_deck_card(${DECK_CARD_SELECT})`)
    .order('name');
  return { data: (data ?? []) as unknown as Deck[], error: Boolean(error) };
}

export async function loadDeck(supabase: SupabaseClient, slug: string): Promise<Result<Deck | null>> {
  const { data, error } = await supabase
    .from('mtg_deck')
    .select(`id, slug, name, summary, colors, main_size, sideboard_size, shipping_eur, cards:mtg_deck_card(${DECK_CARD_SELECT})`)
    .eq('slug', slug)
    .maybeSingle();
  return { data: (data ?? null) as unknown as Deck | null, error: Boolean(error) };
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
  return { data: { cards: rows.slice(0, SEARCH_LIMIT), more: rows.length > SEARCH_LIMIT }, error: Boolean(error) };
}

export async function catalogSize(supabase: SupabaseClient): Promise<number | null> {
  const { count } = await supabase.from('mtg_catalog').select('oracle_id', { count: 'exact', head: true });
  return count ?? null;
}
