import { requireAdmin } from '@/app/admin/_lib/auth';
import { POOL_COLUMNS, type PoolCard } from '@/app/admin/_lib/magic/collection';
import { MagicCollection } from '@/app/admin/_components/magic/MagicCollection';
import { changeQty } from './actions';

export default async function AdminMagicPoolPage() {
  // Guard here too: a layout's check does not cover a page rendered on its own.
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from('mtg_collection').select(POOL_COLUMNS).order('name');

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-400">
        Could not load the pool.
      </p>
    );
  }
  return (
    <MagicCollection
      cards={(data ?? []) as unknown as PoolCard[]}
      actions={{ changeQty }}
    />
  );
}
