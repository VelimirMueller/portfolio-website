import { requireAdmin } from '@/app/admin/_lib/auth';
import { loadPool } from '@/app/admin/_lib/magic/queries';
import { PoolView } from '@/app/admin/_components/magic/PoolView';
import { LoadError } from '@/app/admin/_components/magic/LoadError';
import { changeQty } from './actions';

export default async function AdminMagicPoolPage() {
  // Guard here too: a layout's check does not cover a page rendered on its own.
  const { supabase } = await requireAdmin();
  const pool = await loadPool(supabase);
  if (pool.error) return <LoadError what="the pool" />;
  return <PoolView entries={pool.data} changeQty={changeQty} />;
}
