import { deckOwnership, deckWarnings, offColor, shoppingList } from '../deck';
import { catalogCard, deck, deckCard } from '../testFixtures';

const unsummon = catalogCard({ name: 'Unsummon' });
const opt = catalogCard({ name: 'Opt' });
const island = catalogCard({ name: 'Island', colors: [], type_line: 'Basic Land — Island' });
const lastGasp = catalogCard({ name: 'Last Gasp', colors: ['B'] });

describe('deckOwnership', () => {
  it('fills main-deck slots before sideboard slots', () => {
    const cards = [
      deckCard(unsummon, { section: 'main', qty: 3 }),
      deckCard(unsummon, { section: 'sideboard', qty: 2 }),
    ];
    const r = deckOwnership(cards, new Map([[unsummon.oracle_id, 4]]));
    expect(r.main[0]).toMatchObject({ owned: 3, missing: 0 });
    expect(r.sideboard[0]).toMatchObject({ owned: 1, missing: 1 });
    expect(r.totals).toEqual({ main: 3, sideboard: 2, owned: 4, missing: 1 });
  });

  it('orders each section by position and leaves upgrades out of the counts', () => {
    const cards = [
      deckCard(opt, { position: 2, qty: 4 }),
      deckCard(island, { position: 1, qty: 23 }),
      deckCard(unsummon, { section: 'upgrade', position: 1 }),
    ];
    const r = deckOwnership(cards, new Map([[island.oracle_id, 11]]));
    expect(r.main.map((l) => l.card.name)).toEqual(['Island', 'Opt']);
    expect(r.main[0]).toMatchObject({ owned: 11, missing: 12 });
    expect(r.upgrades).toHaveLength(1);
    expect(r.totals.main).toBe(27);
  });

  it('never counts more than the deck needs', () => {
    const r = deckOwnership([deckCard(opt, { qty: 1 })], new Map([[opt.oracle_id, 9]]));
    expect(r.main[0]).toMatchObject({ owned: 1, missing: 0 });
  });
});

describe('shoppingList', () => {
  it('adds up missing copies per card with their planned cost', () => {
    const cards = [
      deckCard(unsummon, { section: 'main', qty: 3, price_eur: 0.25 }),
      deckCard(unsummon, { section: 'sideboard', qty: 1, price_eur: 0.25 }),
      deckCard(opt, { qty: 4, price_eur: null }),
    ];
    const list = shoppingList(deckOwnership(cards, new Map([[unsummon.oracle_id, 1]])));
    expect(list).toEqual([
      { name: 'Unsummon', qty: 3, eur: 0.75 },
      { name: 'Opt', qty: 4, eur: null },
    ]);
  });
});

describe('deck warnings', () => {
  it('finds cards outside the deck colors, ignoring upgrades and colorless lands', () => {
    const cards = [deckCard(island), deckCard(lastGasp, { section: 'sideboard' }), deckCard(lastGasp, { section: 'upgrade' })];
    expect(offColor(cards, ['U'])).toEqual(['Last Gasp']);
  });

  it('flags wrong card counts and off-color cards', () => {
    const d = deck([deckCard(opt, { qty: 4 }), deckCard(lastGasp, { section: 'sideboard', qty: 1 })]);
    expect(deckWarnings(d, deckOwnership(d.cards, new Map()))).toEqual([
      'Main deck has 4 cards, the plan says 60.',
      'Sideboard has 1 card, the plan says 15.',
      'Outside the deck colors: Last Gasp.',
    ]);
  });

  it('has nothing to say about a deck that matches its plan', () => {
    const d = deck([deckCard(island, { qty: 60 }), deckCard(opt, { section: 'sideboard', qty: 15 })]);
    expect(deckWarnings(d, deckOwnership(d.cards, new Map()))).toEqual([]);
  });
});
