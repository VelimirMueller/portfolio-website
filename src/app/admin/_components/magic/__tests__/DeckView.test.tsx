import { render, screen, within } from '@testing-library/react';
import { DeckView } from '../DeckView';
import { deckOwnership, type DeckPlan } from '../../../_lib/magic/deck';

const plan: DeckPlan = {
  name: 'Testdeck',
  summary: 'A test.',
  colors: ['U'],
  mainSize: 60,
  sideboardSize: 15,
  main: [
    { qty: 4, name: 'Opt', role: 'Dig.' },
    { qty: 3, name: 'Unsummon', role: 'Bounce.' },
    { qty: 1, name: 'Icy Reception', label: 'Eisiger Empfang', role: 'Counter.' },
  ],
  sideboard: [{ qty: 1, name: 'Multiply by Zero', against: 'Big creature', swapOut: '1 Opt' }],
  buy: [{ qty: 4, name: 'Opt', role: 'Dig', eur: 1.5 }],
  shippingEur: 8,
  upgrades: [{ stage: 1, name: 'Mana Drain', replaces: '1 Opt', why: 'Better.' }],
};

const info = (name: string, colors: ('U' | 'B')[] = ['U']) =>
  [name, { name, colors, mana_cost: '{U}', type_line: 'Instant', image_url: null }] as const;
const cards = new Map([info('Opt'), info('Unsummon'), info('Icy Reception'), info('Multiply by Zero', ['B'])]);

describe('DeckView', () => {
  const pool = [
    { name: 'Unsummon', owned_qty: 1 },
    { name: 'Icy Reception', owned_qty: 1 },
  ];

  it('shows per card what you own and what to buy', () => {
    render(<DeckView plan={plan} ownership={deckOwnership(plan, pool)} cards={cards} />);
    const row = (name: string) => screen.getAllByText(name)[0].closest('tr')!;
    expect(within(row('Opt')).getAllByText('buy 4')).toHaveLength(2);
    expect(within(row('Unsummon')).getAllByText('1/3 · buy 2')).toHaveLength(2);
    expect(within(row('Icy Reception')).getAllByText('owned 1/1')).toHaveLength(2);
    expect(screen.getByText('Eisiger Empfang ·')).toBeInTheDocument();
    const toBuy = screen.getByRole('heading', { name: 'Still to buy' }).closest('section')!;
    expect(within(toBuy).getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Opt×4',
      'Unsummon×2',
      'Multiply by Zero×1',
    ]);
  });

  it('warns about deck size, off-color cards and missing catalog data', () => {
    render(<DeckView plan={plan} ownership={deckOwnership(plan, pool)} cards={new Map([...cards].filter(([n]) => n !== 'Opt'))} />);
    expect(screen.getByText('Main deck has 8 cards, the plan says 60.')).toBeInTheDocument();
    expect(screen.getByText('Sideboard has 1 cards, the plan says 15.')).toBeInTheDocument();
    expect(screen.getByText(/Not U: Multiply by Zero/)).toBeInTheDocument();
    expect(screen.getByText('No catalog data yet for: Opt.')).toBeInTheDocument();
  });

  it('adds the shipping buffer to the planned budget', () => {
    render(<DeckView plan={plan} ownership={deckOwnership(plan, pool)} cards={cards} />);
    expect(screen.getByText(/about 9,50/)).toBeInTheDocument();
  });
});
