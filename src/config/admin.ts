/**
 * The only admin user (Supabase Auth UUID). Must match public.is_admin() in
 * supabase/migrations/20260930160000_contact_messages_admin.sql — RLS is the
 * real gate; this copy only drives redirects in middleware and pages.
 */
export const ADMIN_USER_ID = 'bf3817e9-307a-490e-a3d4-5e63ed65da4a';

export function isAdminUser(user: { id: string } | null | undefined): boolean {
  return user?.id === ADMIN_USER_ID;
}
