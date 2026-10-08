import { catalogSize, loadDeck, loadDecks, loadOwned, loadPool, searchCatalog, SEARCH_LIMIT } from '../queries';
import { catalogCard } from '../testFixtures';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Records the query chain; the awaited result is `result`. */
function fakeSupabase(result: { data?: unknown; error?: unknown; count?: number | null }) {
  const calls: unknown[][] = [];
  const done = () => Promise.resolve({ data: null, error: null, count: null, ...result });
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'order']) q[m] = (...a: unknown[]) => (calls.push([m, ...a]), q);
  q.maybeSingle = () => (calls.push(['maybeSingle']), done());
  q.then = (res: (v: unknown) => unknown, rej: (e: unknown) => unknown) => done().then(res, rej);
  const client = {
    from: (t: string) => (calls.push(['from', t]), q),
    rpc: (fn: string, args: unknown) => (calls.push(['rpc', fn, args]), done()),
  };
  return { client: client as unknown as SupabaseClient, calls };
}

describe('magic queries', () => {
  it('loads the pool with each card embedded from the catalog', async () => {
    const { client, calls } = fakeSupabase({ data: [{ id: '1', card: catalogCard() }] });
    const pool = await loadPool(client);
    expect(pool.error).toBe(false);
    expect(pool.data).toHaveLength(1);
    expect(calls[0]).toEqual(['from', 'mtg_collection']);
    expect(String(calls[1][1])).toContain('card:mtg_catalog(');
  });

  it('reports a failed read as error with empty data', async () => {
    const { client } = fakeSupabase({ error: { message: 'boom' } });
    await expect(loadPool(client)).resolves.toEqual({ data: [], error: true });
    await expect(loadDecks(client)).resolves.toEqual({ data: [], error: true });
    await expect(loadDeck(client, 'x')).resolves.toEqual({ data: null, error: true });
  });

  it('maps owned copies by card id', async () => {
    const { client } = fakeSupabase({ data: [{ oracle_id: 'a', owned_qty: 11 }] });
    expect((await loadOwned(client)).data.get('a')).toBe(11);
  });

  it('loads one deck by slug with its cards', async () => {
    const { client, calls } = fakeSupabase({ data: { slug: 'stapelbruch', cards: [] } });
    const deck = await loadDeck(client, 'stapelbruch');
    expect(deck.data?.slug).toBe('stapelbruch');
    expect(calls).toContainEqual(['eq', 'slug', 'stapelbruch']);
    expect(String(calls[1][1])).toContain('cards:mtg_deck_card(');
  });

  it('searches through mtg_search_catalog and tells when more matched', async () => {
    const rows = Array.from({ length: SEARCH_LIMIT + 1 }, () => catalogCard());
    const { client, calls } = fakeSupabase({ data: rows });
    const result = await searchCatalog(client, 'rift');
    expect(calls[0]).toEqual(['rpc', 'mtg_search_catalog', { p_query: 'rift', p_limit: SEARCH_LIMIT }]);
    expect(result.data.cards).toHaveLength(SEARCH_LIMIT);
    expect(result.data.more).toBe(true);
  });

  it('does not search for fewer than two letters', async () => {
    const { client, calls } = fakeSupabase({});
    expect((await searchCatalog(client, ' o ')).data).toEqual({ cards: [], more: false });
    expect(calls).toEqual([]);
  });

  it('counts the catalog', async () => {
    expect(await catalogSize(fakeSupabase({ count: 32823 }).client)).toBe(32823);
    expect(await catalogSize(fakeSupabase({ count: null }).client)).toBeNull();
  });
});
