import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_USER_ID } from '@/config/admin';
import { createClient } from '@/utils/supabase/server';

/**
 * Every admin page and server action calls this first. Middleware already
 * redirects, but server actions are plain POST endpoints and must check on
 * their own. RLS (public.is_admin()) stays the final gate.
 */
export async function requireAdmin() {
  const supabase = createClient(await cookies());
  const { data } = await supabase.auth.getUser();
  if (data.user?.id !== ADMIN_USER_ID) {
    redirect('/admin/login');
  }
  return supabase;
}
