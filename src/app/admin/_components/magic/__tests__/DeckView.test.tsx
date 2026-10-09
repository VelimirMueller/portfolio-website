import { render, screen, within } from '@testing-library/react';
import { DeckView } from '../DeckView';
import { deckOwnership } from '../../../_lib/magic/deck';
import { catalogCard, deck, deckCard } from '../../../_lib/magic/testFixtures';

const opt = catalogCard({ name: 'Opt' });
const unsummon = catalogCard({ name: 'Unsummon' });
const icy = catalogCard({ name: 'Icy Reception' });
const lastGasp = catalogCard({ name: 'Last Gasp', colors: ['B'] });
const drain = catalogCard({ name: 'Mana Drain' });

const d = deck([
  deckCard(opt, { position: 1, qty: 4, note: 'Dig.', price_eur: 0.38 }),
  deckCard(unsummon, { position: 2, qty: 3, note: 'Bounce.', price_eur: 0.25 }),
  deckCard(icy, { position: 3, qty: 1, note: 'Counter.' }),
  deckCard(lastGasp, { section: 'sideboard', position: 1, note: 'Big creature', swap_out: '1 Opt', price_eur: 0.1 }),
  deckCard(drain, { section: 'upgrade', position: 1, note: 'Better.', swap_out: '1 Countersculpt' }),
]);
// Owned copies per deck line, as the view mtg_deck_ownership returns them.
const owned = new Map([
  [d.cards[1].id, 1], // Unsummon: 1 of 3
  [d.cards[2].id, 1], // Icy Reception: 1 of 1
]);
const view = () => render(<DeckView deck={d} analysis={deckOwnership(d.cards, owned)} />);
const row = (name: string) => screen.getAllByText(name)[0].closest('tr')!;

describe('DeckView', () => {
  it('marks per card what you own and what to buy', () => {
    view();
    expect(within(row('Opt')).getAllByText('buy 4')).toHaveLength(2); // table cell + phone layout
    expect(within(row('Unsummon')).getAllByText('1/3 · buy 2')).toHaveLength(2);
    expect(within(row('Icy Reception')).getAllByText('owned 1/1')).toHaveLength(2);
  });

  it('lists what is still to buy, priced, with shipping', () => {
    view();
    const toBuy = screen.getByRole('heading', { name: 'Still to buy' }).closest('section')!;
    // toLocaleString puts a no-break space before the euro sign.
    expect(within(toBuy).getAllByRole('listitem').map((li) => li.textContent?.replace(/\u00a0/g, ' '))).toEqual([
      'Opt×41,52 €',
      'Unsummon×20,50 €',
      'Last Gasp×10,10 €',
    ]);
    expect(within(toBuy).getByText(/About 10,12 € incl. 8,00 € shipping/)).toBeInTheDocument();
  });

  it('warns when the plan is off', () => {
    view();
    expect(screen.getByText('Main deck has 8 cards, the plan says 60.')).toBeInTheDocument();
    expect(screen.getByText('Outside the deck colors: Last Gasp.')).toBeInTheDocument();
  });

  it('shows the sideboard swap and the upgrade path', () => {
    view();
    expect(screen.getAllByText('Big creature · out: 1 Opt')[0]).toBeInTheDocument();
    expect(within(row('Mana Drain')).getByText('1 Countersculpt')).toBeInTheDocument();
  });

  it('says so when you own the whole deck', () => {
    const all = new Map(d.cards.map((c) => [c.id, c.qty]));
    render(<DeckView deck={d} analysis={deckOwnership(d.cards, all)} />);
    expect(screen.getByText('You own every card of the deck.')).toBeInTheDocument();
  });
});
