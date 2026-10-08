import { requireAdmin } from '@/app/admin/_lib/auth';
import { catalogSize, loadOwned, searchCatalog } from '@/app/admin/_lib/magic/queries';
import { AddCardSearch } from '@/app/admin/_components/magic/AddCardSearch';
import { addToPool } from '../actions';

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function AdminMagicAddPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { supabase } = await requireAdmin();
  const query = first(searchParams.q).trim().slice(0, 100);

  const [size, search, owned] = await Promise.all([
    catalogSize(supabase),
    searchCatalog(supabase, query),
    loadOwned(supabase),
  ]);

  return (
    <AddCardSearch
      query={query}
      results={search.data.cards}
      more={search.data.more}
      owned={owned.data}
      added={first(searchParams.added).slice(0, 200) || undefined}
      formError={first(searchParams.error).slice(0, 200) || undefined}
      error={search.error || owned.error}
      catalogSize={size}
      action={addToPool}
    />
  );
}
