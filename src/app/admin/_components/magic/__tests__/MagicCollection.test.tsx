import { fireEvent, render, screen } from '@testing-library/react';
import { MagicCollection } from '../MagicCollection';
import type { MagicCard } from '../../../_lib/magic/collection';

const card = (over: Partial<MagicCard>): MagicCard => ({
  name: 'Test Card',
  name_de: null,
  copies_de: 0,
  owned_qty: 1,
  colors: ['U'],
  type: 'Creature',
  mana_cost: '{1}{U}',
  mana_value: 2,
  power_toughness: '1/1',
  effect: 'Full rules text.',
  short: 'Short text.',
  status: 'photo',
  note: null,
  ...over,
});

const cards = [
  card({ name: 'Unsummon', type: 'Instant', mana_value: 1, effect: 'Return target creature to its owner\'s hand.', owned_qty: 2 }),
  card({ name: 'Memory Trap', colors: ['W'], type: 'Enchantment', note: 'Good removal.', copies_de: 1 }),
  card({ name: 'Countersculpt', type: 'Instant', status: 'verify', mana_cost: null, mana_value: null }),
];

describe('MagicCollection', () => {
  it('shows every card with its short text and the totals', () => {
    render(<MagicCollection cards={cards} set="Reality Fracture" />);
    expect(screen.getByRole('heading', { name: 'Magic' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    expect(screen.getByText('3 of 3 cards')).toBeInTheDocument();
    expect(screen.getByText('Good removal.')).toBeInTheDocument();
    expect(screen.getByText('verify')).toBeInTheDocument();
    // copies: 2 + 1 + 1
    expect(screen.getByText('Copies').nextSibling).toHaveTextContent('4');
  });

  it('keeps the full text behind a disclosure', () => {
    render(<MagicCollection cards={cards} set="x" />);
    expect(screen.getByText("Return target creature to its owner's hand.").closest('details')).not.toBeNull();
  });

  it('filters by search text', () => {
    render(<MagicCollection cards={cards} set="x" />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search cards' }), { target: { value: 'owner' } });
    expect(screen.getByText('1 of 3 cards')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Unsummon' })).toBeInTheDocument();
  });

  it('filters by color and type chips', () => {
    render(<MagicCollection cards={cards} set="x" />);
    fireEvent.click(screen.getByRole('button', { name: 'White' }));
    expect(screen.getByRole('button', { name: 'White' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('1 of 3 cards')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^Instant/ }));
    expect(screen.getByText('No card matches these filters.')).toBeInTheDocument();
  });
});
