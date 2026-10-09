import { requireAdmin } from '@/app/admin/_lib/auth';
import { loadWishlist } from '@/app/admin/_lib/magic/queries';
import { WishlistView } from '@/app/admin/_components/magic/WishlistView';
import { LoadError } from '@/app/admin/_components/magic/LoadError';
import { changeWishQty, wishToPool } from '../actions';

export default async function AdminMagicWishlistPage() {
  const { supabase } = await requireAdmin();
  const wishlist = await loadWishlist(supabase);
  if (wishlist.error) return <LoadError what="the wishlist" />;
  return <WishlistView entries={wishlist.data} changeQty={changeWishQty} wishToPool={wishToPool} />;
}
