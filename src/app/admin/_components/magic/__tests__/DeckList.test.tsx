import { render, screen } from '@testing-library/react';
import { DeckList } from '../DeckList';
import { deckOwnership } from '../../../_lib/magic/deck';
import { catalogCard, deck, deckCard } from '../../../_lib/magic/testFixtures';

describe('DeckList', () => {
  it('links each deck with its ownership', () => {
    const opt = catalogCard({ name: 'Opt' });
    const d = deck([deckCard(opt, { qty: 4 })], { slug: 'stapelbruch', name: 'Stapelbruch' });
    render(<DeckList decks={[{ deck: d, analysis: deckOwnership(d.cards, new Map([[d.cards[0].id, 1]])) }]} />);
    expect(screen.getByRole('link', { name: /Stapelbruch/ })).toHaveAttribute('href', '/admin/magic/decks/stapelbruch');
    expect(screen.getByText('owned 1/4 · buy 3')).toBeInTheDocument();
  });

  it('says when there are no decks', () => {
    render(<DeckList decks={[]} />);
    expect(screen.getByText('No decks yet.')).toBeInTheDocument();
  });
});
