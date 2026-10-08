import { requireAdmin } from '@/app/admin/_lib/auth';
import { COLLECTION } from '@/app/admin/_lib/magic/collection';
import { MagicCollection } from '@/app/admin/_components/magic/MagicCollection';

export default async function AdminMagicPage() {
  // Guard here too: a layout's check does not cover a page rendered on its own.
  await requireAdmin();
  return <MagicCollection cards={COLLECTION.cards} set={COLLECTION.meta.set} />;
}
