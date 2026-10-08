import { notFound } from 'next/navigation';
import { requireAdmin } from '@/app/admin/_lib/auth';
import { loadDeck, loadOwned } from '@/app/admin/_lib/magic/queries';
import { deckOwnership } from '@/app/admin/_lib/magic/deck';
import { DeckView } from '@/app/admin/_components/magic/DeckView';
import { LoadError } from '@/app/admin/_components/magic/LoadError';

export default async function AdminMagicDeckPage({ params }: { params: { slug: string } }) {
  const { supabase } = await requireAdmin();
  const [deck, owned] = await Promise.all([loadDeck(supabase, params.slug), loadOwned(supabase)]);
  if (deck.error || owned.error) return <LoadError what="the deck" />;
  if (!deck.data) notFound();
  return <DeckView deck={deck.data} analysis={deckOwnership(deck.data.cards, owned.data)} />;
}
