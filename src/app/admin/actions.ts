'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { requireAdmin } from './_lib/auth';
import { messageIdSchema, statusSchema } from './_lib/messages';

/**
 * Always reports success, so the form never reveals whether an address
 * belongs to the admin. shouldCreateUser: false — sign-ups stay closed even
 * if the dashboard toggle is ever flipped back on.
 */
export async function sendMagicLink(formData: FormData) {
  const email = z.string().email().safeParse(formData.get('email'));
  if (email.success) {
    const h = headers();
    const origin = `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
    const supabase = createClient(await cookies());
    await supabase.auth.signInWithOtp({
      email: email.data,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin}/admin/auth/callback`,
      },
    });
  }
  redirect('/admin/login?sent=1');
}

export async function signOut() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect('/admin/login');
}

export async function setStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = messageIdSchema.parse(formData.get('id'));
  const status = statusSchema.parse(formData.get('status'));
  const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
  if (error) throw new Error('Could not update the message');
  revalidatePath('/admin');
  revalidatePath(`/admin/${id}`);
}

export async function deleteMessage(formData: FormData) {
  const supabase = await requireAdmin();
  const id = messageIdSchema.parse(formData.get('id'));
  // RLS turns a forbidden delete into "0 rows", not an error — count it.
  const { error, count } = await supabase
    .from('contact_messages')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error || count !== 1) throw new Error('Could not delete the message');
  revalidatePath('/admin');
  redirect('/admin');
}
