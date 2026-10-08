import { requireAdmin } from '@/app/admin/_lib/auth';
import type { CatalogCard } from '@/app/admin/_lib/magic/collection';
import { STAPELBRUCH, deckOwnership } from '@/app/admin/_lib/magic/deck';
import { DeckView } from '@/app/admin/_components/magic/DeckView';

type CardInfo = Pick<CatalogCard, 'name' | 'mana_cost' | 'type_line' | 'colors' | 'image_url'>;
const INFO_COLUMNS = 'name, mana_cost, type_line, colors, image_url';

export default async function AdminMagicDeckPage() {
  const { supabase } = await requireAdmin();
  const plan = STAPELBRUCH;
  const names = Array.from(new Set([...plan.main, ...plan.sideboard, ...plan.upgrades].map((e) => e.name)));

  const [pool, catalog] = await Promise.all([
    supabase.from('mtg_collection').select(`owned_qty, ${INFO_COLUMNS}`),
    supabase.from('mtg_catalog').select(INFO_COLUMNS).in('name', names),
  ]);

  if (pool.error || catalog.error) {
    return (
      <p role="alert" className="text-sm text-red-400">
        Could not load the {pool.error ? 'pool' : 'card catalog'}.
      </p>
    );
  }

  const poolRows = (pool.data ?? []) as unknown as (CardInfo & { owned_qty: number })[];
  // Catalog first; pool rows fill in when the catalog is not loaded yet.
  const cards = new Map<string, CardInfo>();
  for (const row of poolRows) if (names.includes(row.name) && !cards.has(row.name)) cards.set(row.name, row);
  for (const row of (catalog.data ?? []) as unknown as CardInfo[]) cards.set(row.name, row);

  return <DeckView plan={plan} ownership={deckOwnership(plan, poolRows)} cards={cards} />;
}
