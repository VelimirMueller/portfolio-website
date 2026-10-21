import Link from 'next/link';
import { requireAdmin } from '@/app/admin/_lib/auth';
import { loadDeckOwnership, loadDecks } from '@/app/admin/_lib/magic/queries';
import { deckOwnership } from '@/app/admin/_lib/magic/deck';
import { DeckList } from '@/app/admin/_components/magic/DeckList';
import { LoadError } from '@/app/admin/_components/magic/LoadError';

export default async function AdminMagicDecksPage() {
  const { supabase } = await requireAdmin();
  const [decks, owned] = await Promise.all([loadDecks(supabase), loadDeckOwnership(supabase)]);
  if (decks.error || owned.error) return <LoadError what="the decks" />;
  return (
    <div className="space-y-4">
      <Link
        href="/admin/magic/decks/new"
        className="inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400"
      >
        Import deck
      </Link>
      <DeckList decks={decks.data.map((deck) => ({ deck, analysis: deckOwnership(deck.cards, owned.data) }))} />
    </div>
  );
}
