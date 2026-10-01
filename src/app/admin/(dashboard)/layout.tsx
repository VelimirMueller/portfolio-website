import { version } from '../../../../package.json';
import { requireAdmin } from '@/app/admin/_lib/auth';
import { AdminShell } from '@/app/admin/_components/AdminShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  const { count } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  return (
    <AdminShell unread={count ?? 0} email={user.email ?? ''} version={version}>
      {children}
    </AdminShell>
  );
}
