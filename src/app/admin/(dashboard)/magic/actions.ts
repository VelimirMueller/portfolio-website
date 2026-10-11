'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireAdmin } from '@/app/admin/_lib/auth';
import { deckSlug, parseDecklist } from '@/app/admin/_lib/magic/decklist';

const idSchema = z.string().uuid();
const optionalText = z
  .string()
  .trim()
  .max(500)
  .transform((s) => s || null)
  .nullable()
  .optional();

const addSchema = z
  .object({
    oracle_id: idSchema,
    owned_qty: z.coerce.number().int().min(1).max(99),
    copies_de: z.coerce.number().int().min(0).max(99),
    name_de: optionalText,
    note: optionalText,
    q: z.string().max(100).optional(),
    intent: z.enum(['pool', 'wish']),
  })
  // German copies only count for the pool; a wish ignores them.
  .refine((v) => v.intent === 'wish' || v.copies_de <= v.owned_qty, { message: 'More German copies than copies.' });

/**
 * Adds copies of a catalog card to the pool, or with intent=wish to the
 * wishlist (German copies and name do not apply there). One SQL upsert each
 * (one row per card), so a double submit only adds copies, never a second row.
 */
export async function addToPool(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = addSchema.safeParse({
    oracle_id: formData.get('oracle_id'),
    owned_qty: formData.get('owned_qty'),
    copies_de: formData.get('copies_de') || 0,
    name_de: formData.get('name_de'),
    note: formData.get('note'),
    q: formData.get('q') ?? undefined,
    intent: formData.get('intent') || 'pool',
  });
  if (!parsed.success) {
    // Back to the form with the reason, instead of a generic error page.
    const params = new URLSearchParams({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    const q = formData.get('q');
    if (typeof q === 'string' && q) params.set('q', q.slice(0, 100));
    redirect(`/admin/magic/add?${params}`);
  }
  const input = parsed.data;
  const wish = input.intent === 'wish';

  const { data: rowId, error } = wish
    ? await supabase.rpc('mtg_add_to_wishlist', {
        p_oracle_id: input.oracle_id,
        p_qty: input.owned_qty,
        p_note: input.note ?? null,
      })
    : await supabase.rpc('mtg_add_to_pool', {
        p_oracle_id: input.oracle_id,
        p_qty: input.owned_qty,
        p_copies_de: input.copies_de,
        p_name_de: input.name_de ?? null,
        p_note: input.note ?? null,
      });
  // No id: RLS let nothing through. A card missing from the catalog fails the foreign key.
  if (error || !rowId) throw new Error('Could not add the card');

  const { data: card } = await supabase.from('mtg_catalog').select('name').eq('oracle_id', input.oracle_id).single();

  revalidatePath('/admin/magic', 'layout');
  const params = new URLSearchParams({ [wish ? 'wished' : 'added']: card?.name ?? 'The card' });
  if (input.q) params.set('q', input.q);
  redirect(`/admin/magic/add?${params}`);
}

/** One copy more or less; the last copy removes the card. Atomic in SQL. */
export async function changeQty(id: string, delta: 1 | -1) {
  const { supabase } = await requireAdmin();
  const validId = idSchema.parse(id);
  const validDelta = z.union([z.literal(1), z.literal(-1)]).parse(delta);

  const { data: newQty, error } = await supabase.rpc('mtg_change_qty', { p_id: validId, p_delta: validDelta });
  // null: no such row, or RLS hid it.
  if (error || newQty === null) throw new Error('Could not change the count');
  revalidatePath('/admin/magic', 'layout');
}

/** One wanted copy more or less; the last one removes the wish. Atomic in SQL. */
export async function changeWishQty(id: string, delta: 1 | -1) {
  const { supabase } = await requireAdmin();
  const validId = idSchema.parse(id);
  const validDelta = z.union([z.literal(1), z.literal(-1)]).parse(delta);

  const { data: newQty, error } = await supabase.rpc('mtg_change_wish_qty', { p_id: validId, p_delta: validDelta });
  // null: no such row, or RLS hid it.
  if (error || newQty === null) throw new Error('Could not change the count');
  revalidatePath('/admin/magic', 'layout');
}

/** "Got it": moves every wanted copy of a card into the pool, in one SQL transaction. */
export async function wishToPool(id: string) {
  const { supabase } = await requireAdmin();
  const validId = idSchema.parse(id);

  const { data: poolId, error } = await supabase.rpc('mtg_wish_to_pool', { p_id: validId, p_copies_de: 0 });
  // null: no such wish, or RLS hid it.
  if (error || !poolId) throw new Error('Could not move the card');
  revalidatePath('/admin/magic', 'layout');
}

export type ImportDeckState = {
  /** Parse problems or a general failure, shown above the form. */
  errors: string[];
  /** Names the catalog could not resolve, with up to 3 suggestions each. */
  unresolved: { name: string; candidates: string[] }[];
};

const importSchema = z.object({
  name: z.string().trim().min(1, 'The deck needs a name.').max(80, 'At most 80 characters for the name.'),
  summary: z.string().trim().max(500, 'At most 500 characters for the summary.'),
  list: z.string().max(20000, 'The list is too long.'),
});

const unresolvedSchema = z.array(
  z.object({ name: z.string(), candidates: z.array(z.string()) })
);

/**
 * Creates a deck from a pasted decklist (useFormState action). Every name must
 * resolve to one catalog card; otherwise nothing is created and the state lists
 * the names to fix. On success it goes to the new deck.
 */
export async function importDeck(_prev: ImportDeckState, formData: FormData): Promise<ImportDeckState> {
  const { supabase } = await requireAdmin();
  const parsed = importSchema.safeParse({
    name: formData.get('name') ?? '',
    summary: formData.get('summary') ?? '',
    list: formData.get('list') ?? '',
  });
  if (!parsed.success) return { errors: [parsed.error.issues[0]?.message ?? 'Invalid input'], unresolved: [] };

  const slug = deckSlug(parsed.data.name);
  if (!slug) return { errors: ['The deck name needs at least one letter or digit.'], unresolved: [] };
  // /admin/magic/decks/new is the import page itself.
  if (slug === 'new') return { errors: ['"New" is reserved. Choose another name.'], unresolved: [] };
  const list = parseDecklist(parsed.data.list);
  if (list.errors.length) return { errors: list.errors, unresolved: [] };

  const { data, error } = await supabase.rpc('mtg_import_deck', {
    p_name: parsed.data.name,
    p_slug: slug,
    p_summary: parsed.data.summary,
    p_lines: list.lines,
  });
  if (error || !data) {
    console.error('[admin] magic: import deck failed:', error?.code ?? '', error?.message ?? '');
    return { errors: ['Could not import the deck.'], unresolved: [] };
  }

  const result = data as { status: string; names?: unknown };
  if (result.status === 'exists') {
    return { errors: [`A deck with the address "${slug}" already exists. Choose another name.`], unresolved: [] };
  }
  if (result.status === 'unresolved') {
    const names = unresolvedSchema.safeParse(result.names);
    if (names.success && names.data.length) return { errors: [], unresolved: names.data };
    return { errors: ['Some names did not resolve.'], unresolved: [] };
  }

  revalidatePath('/admin/magic', 'layout');
  redirect(`/admin/magic/decks/${slug}`);
}
