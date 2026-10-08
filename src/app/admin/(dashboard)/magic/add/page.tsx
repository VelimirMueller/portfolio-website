import { requireAdmin } from '@/app/admin/_lib/auth';
import { CATALOG_COLUMNS, namePattern, rankSearch, type CatalogCard } from '@/app/admin/_lib/magic/collection';
import { AddCardSearch } from '@/app/admin/_components/magic/AddCardSearch';
import { addToPool } from '../actions';

const MAX_RESULTS = 24;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function AdminMagicAddPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { supabase } = await requireAdmin();
  const query = first(searchParams.q).trim().slice(0, 100);
  const added = first(searchParams.added).slice(0, 200) || undefined;
  const formError = first(searchParams.error).slice(0, 200) || undefined;

  const search = (pattern: string) =>
    query.length >= 2
      ? supabase.from('mtg_catalog').select(CATALOG_COLUMNS).ilike('name', pattern).order('name').limit(60)
      : Promise.resolve({ data: [], error: null });
  // Two queries: names starting with the query (so a short exact name like
  // "Opt" is never cut off by the limit), and names containing it anywhere.
  const [size, prefix, contains] = await Promise.all([
    supabase.from('mtg_catalog').select('oracle_id', { count: 'exact', head: true }),
    search(namePattern(query).slice(1)),
    search(namePattern(query)),
  ]);

  const merged = new Map<string, CatalogCard>();
  for (const row of [...(prefix.data ?? []), ...(contains.data ?? [])] as unknown as CatalogCard[]) {
    merged.set(row.oracle_id, row);
  }
  // Rank in JS: PostgREST cannot order by "exact match first".
  const ranked = rankSearch(Array.from(merged.values()), query);
  const results = ranked.slice(0, MAX_RESULTS);
  const ids = results.map((r) => r.oracle_id);
  const { data: pool } = ids.length
    ? await supabase.from('mtg_collection').select('oracle_id, owned_qty').in('oracle_id', ids)
    : { data: [] };
  const owned = new Map<string, number>();
  for (const row of (pool ?? []) as { oracle_id: string; owned_qty: number }[]) {
    owned.set(row.oracle_id, (owned.get(row.oracle_id) ?? 0) + row.owned_qty);
  }

  return (
    <AddCardSearch
      query={query}
      results={results}
      truncated={ranked.length > MAX_RESULTS}
      owned={owned}
      added={added}
      formError={formError}
      error={Boolean(prefix.error || contains.error)}
      catalogSize={size.count ?? null}
      action={addToPool}
    />
  );
}
