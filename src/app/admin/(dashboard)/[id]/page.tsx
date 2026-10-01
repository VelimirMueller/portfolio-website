import { notFound } from 'next/navigation';
import { requireAdmin } from '@/app/admin/_lib/auth';
import { messageIdSchema, statusAfterOpening, type ContactMessage } from '@/app/admin/_lib/messages';
import { MessageView } from '@/app/admin/_components/MessageView';

export default async function AdminMessagePage({ params }: { params: { id: string } }) {
  const id = messageIdSchema.safeParse(params.id);
  if (!id.success) notFound();

  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from('contact_messages')
    .select('id, name, email, message, status, created_at')
    .eq('id', id.data)
    .maybeSingle();
  if (!data) notFound();
  const message = data as ContactMessage;

  // Runs on a real visit only: the page is force-dynamic with no loading.tsx,
  // so <Link> prefetching never renders it. A failed write keeps the old status.
  const next = statusAfterOpening(message.status);
  if (next && next !== message.status) {
    const { error } = await supabase
      .from('contact_messages')
      .update({ status: next })
      .eq('id', message.id);
    if (!error) message.status = next;
  }

  return <MessageView message={message} />;
}
