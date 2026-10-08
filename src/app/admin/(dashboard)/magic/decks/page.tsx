import { requireAdmin } from '@/app/admin/_lib/auth';
import { loadDecks, loadOwned } from '@/app/admin/_lib/magic/queries';
import { deckOwnership } from '@/app/admin/_lib/magic/deck';
import { DeckList } from '@/app/admin/_components/magic/DeckList';
import { LoadError } from '@/app/admin/_components/magic/LoadError';

export default async function AdminMagicDecksPage() {
  const { supabase } = await requireAdmin();
  const [decks, owned] = await Promise.all([loadDecks(supabase), loadOwned(supabase)]);
  if (decks.error || owned.error) return <LoadError what="the decks" />;
  return <DeckList decks={decks.data.map((deck) => ({ deck, analysis: deckOwnership(deck.cards, owned.data) }))} />;
}
