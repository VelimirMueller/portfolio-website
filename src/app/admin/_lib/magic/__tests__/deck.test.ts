import { STAPELBRUCH, deckOwnership, offColor } from '../deck';

describe('deck plan', () => {
  it('fills main-deck slots before sideboard slots', () => {
    const plan = {
      main: [{ qty: 3, name: 'Unsummon', role: '' }],
      sideboard: [{ qty: 2, name: 'Unsummon', against: '', swapOut: '' }],
    };
    const r = deckOwnership(plan, [{ name: 'Unsummon', owned_qty: 4 }]);
    expect(r.main[0]).toEqual({ name: 'Unsummon', qty: 3, owned: 3, missing: 0 });
    expect(r.sideboard[0]).toEqual({ name: 'Unsummon', qty: 2, owned: 1, missing: 1 });
    expect(r.totals).toEqual({ main: 3, sideboard: 2, owned: 4, missing: 1 });
  });

  it('counts copies spread over several pool rows', () => {
    const plan = { main: [{ qty: 24, name: 'Island', role: '' }], sideboard: [] };
    const r = deckOwnership(plan, [
      { name: 'Island', owned_qty: 8 },
      { name: 'Island', owned_qty: 3 },
    ]);
    expect(r.main[0]).toMatchObject({ owned: 11, missing: 13 });
  });

  it('never counts more than the deck needs', () => {
    const r = deckOwnership({ main: [{ qty: 1, name: 'Opt', role: '' }], sideboard: [] }, [{ name: 'Opt', owned_qty: 9 }]);
    expect(r.main[0]).toMatchObject({ owned: 1, missing: 0 });
  });

  it('finds cards outside the deck colors', () => {
    const colors = new Map([
      ['Annul', ['U' as const]],
      ['Multiply by Zero', ['B' as const]],
      ['Island', []],
    ]);
    expect(offColor(colors, ['Annul', 'Multiply by Zero', 'Island', 'Unknown'], ['U'])).toEqual(['Multiply by Zero']);
  });

  // Documents the PDF as written: the main deck lists 61 cards, the sideboard 13.
  it('keeps the Stapelbruch list as planned', () => {
    const r = deckOwnership(STAPELBRUCH, []);
    expect(r.totals.main).toBe(61);
    expect(r.totals.sideboard).toBe(13);
    expect(STAPELBRUCH.buy.reduce((n, b) => n + b.eur, STAPELBRUCH.shippingEur)).toBeCloseTo(47.5);
  });

  it('only plans to buy cards the deck uses', () => {
    const used = new Set([...STAPELBRUCH.main, ...STAPELBRUCH.sideboard].map((e) => e.name));
    for (const b of STAPELBRUCH.buy) expect(used).toContain(b.name);
  });
});
