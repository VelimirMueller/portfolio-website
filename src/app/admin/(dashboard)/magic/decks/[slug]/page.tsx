import { notFound } from 'next/navigation';
import { requireAdmin } from '@/app/admin/_lib/auth';
import { loadDeck, loadDeckOwnership } from '@/app/admin/_lib/magic/queries';
import { deckOwnership } from '@/app/admin/_lib/magic/deck';
import { DeckView } from '@/app/admin/_components/magic/DeckView';
import { LoadError } from '@/app/admin/_components/magic/LoadError';

export default async function AdminMagicDeckPage({ params }: { params: { slug: string } }) {
  const { supabase } = await requireAdmin();
  const deck = await loadDeck(supabase, params.slug);
  if (deck.error) return <LoadError what="the deck" />;
  if (!deck.data) notFound();
  const owned = await loadDeckOwnership(supabase, deck.data.id);
  if (owned.error) return <LoadError what="the deck" />;
  return <DeckView deck={deck.data} analysis={deckOwnership(deck.data.cards, owned.data)} />;
}
