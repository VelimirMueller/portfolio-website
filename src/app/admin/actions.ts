'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { SITE_URL } from '@/config/site';
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
    const origin = await loginOrigin();
    const supabase = createClient(await cookies());
    const { error } = await supabase.auth.signInWithOtp({
      email: email.data,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin}/admin/auth/callback`,
      },
    });
    // Server log only (Vercel); the visitor still gets the neutral reply.
    if (error) console.error('[admin] magic link not sent:', error.status, error.message);
  }
  redirect('/admin/login?sent=1');
}

/**
 * Production links always point at SITE_URL, never at a request header.
 * Outside production the request origin is used so localhost works; Supabase
 * still rejects any redirect URL that is not on its allow-list.
 */
async function loginOrigin() {
  if (process.env.NODE_ENV === 'production') return SITE_URL;
  const h = headers();
  return `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`;
}

export async function signOut() {
  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  redirect('/admin/login');
}

const idsSchema = z.array(messageIdSchema).min(1).max(200);

/** Sets one status on one or many messages (list quick actions, bulk bar, keyboard). */
export async function updateStatuses(ids: string[], status: string) {
  const { supabase } = await requireAdmin();
  const validIds = idsSchema.parse(ids);
  const validStatus = statusSchema.parse(status);
  const { error } = await supabase
    .from('contact_messages')
    .update({ status: validStatus })
    .in('id', validIds);
  if (error) throw new Error('Could not update the messages');
  revalidatePath('/admin', 'layout');
}

/** Hard delete. RLS turns a forbidden delete into "0 rows", not an error — count them. */
export async function deleteMessages(ids: string[]) {
  const { supabase } = await requireAdmin();
  const validIds = idsSchema.parse(ids);
  const { error, count } = await supabase
    .from('contact_messages')
    .delete({ count: 'exact' })
    .in('id', validIds);
  if (error || count !== validIds.length) throw new Error('Could not delete the messages');
  revalidatePath('/admin', 'layout');
}
