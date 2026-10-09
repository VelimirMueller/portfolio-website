import { compareEntries, filterPool, matchesColor, matchesQuery, ownedById, poolStats } from '../pool';
import { poolEntry } from '../testFixtures';

describe('pool helpers', () => {
  it('filters by single color, multicolor and colorless', () => {
    expect(matchesColor(['W'], 'W')).toBe(true);
    expect(matchesColor(['W', 'U'], 'W')).toBe(true);
    expect(matchesColor(['W'], 'multi')).toBe(false);
    expect(matchesColor(['W', 'U'], 'multi')).toBe(true);
    expect(matchesColor([], 'colorless')).toBe(true);
    expect(matchesColor(['W'], 'all')).toBe(true);
  });

  it('searches English and German name, text and note, case-insensitively', () => {
    const e = poolEntry(
      { name: "Theorist's Proxy", oracle_text: 'Empower Jace 3.' },
      { name_de: 'Stellvertreter des Theoretikers', note: 'One copy is foil.' }
    );
    expect(matchesQuery(e, 'proxy')).toBe(true);
    expect(matchesQuery(e, 'STELLVERTRETER')).toBe(true);
    expect(matchesQuery(e, 'jace')).toBe(true);
    expect(matchesQuery(e, 'foil')).toBe(true);
    expect(matchesQuery(e, '  ')).toBe(true);
    expect(matchesQuery(e, 'krenko')).toBe(false);
  });

  it('searches the printed names in every language, ignoring accents', () => {
    const e = poolEntry({
      name: "Bull's Strength",
      names: [
        { lang: 'de', printed_name: 'Stärke des Stiers' },
        { lang: 'fr', printed_name: 'Force du taureau' },
      ],
    });
    expect(matchesQuery(e, 'Stärke des')).toBe(true);
    expect(matchesQuery(e, 'starke des stiers')).toBe(true);
    expect(matchesQuery(e, 'FORCE DU')).toBe(true);
    expect(matchesQuery(e, 'insel')).toBe(false);
    const island = poolEntry({ name: 'Island', names: [{ lang: 'fr', printed_name: 'Île' }] });
    expect(matchesQuery(island, 'ile')).toBe(true);
    expect(matchesQuery(island, 'Île')).toBe(true);
    expect(matchesQuery(poolEntry({}, { name_de: 'Großer Zorn' }), 'grosser')).toBe(true);
    expect(matchesQuery(poolEntry({ names: undefined }), 'rift')).toBe(true);
  });

  it('sorts spells by mana value and name, lands last', () => {
    const entries = [
      poolEntry({ name: 'Island', type_line: 'Basic Land — Island', mana_value: 0 }),
      poolEntry({ name: 'Two', mana_value: 2 }),
      poolEntry({ name: 'One B', mana_value: 1 }),
      poolEntry({ name: 'One A', mana_value: 1 }),
    ];
    expect([...entries].sort(compareEntries).map((e) => e.card.name)).toEqual(['One A', 'One B', 'Two', 'Island']);
  });

  it('combines query, color and type filters', () => {
    const entries = [
      poolEntry({ name: 'Blue Bird', type_line: 'Creature — Bird' }),
      poolEntry({ name: 'White Bird', type_line: 'Creature — Bird', colors: ['W'] }),
      poolEntry({ name: 'Blue Bolt', type_line: 'Instant' }),
    ];
    expect(filterPool(entries, { query: 'bird', color: 'U', type: 'Creature' }).map((e) => e.card.name)).toEqual([
      'Blue Bird',
    ]);
  });

  it('counts cards, copies, German copies and rares', () => {
    const stats = poolStats([
      poolEntry({ rarity: 'mythic' }, { owned_qty: 3, copies_de: 1 }),
      poolEntry({ rarity: 'rare' }, { owned_qty: 1 }),
      poolEntry({ rarity: 'common' }, { owned_qty: 4 }),
    ]);
    expect(stats).toEqual({ unique: 3, copies: 8, german: 1, rares: 2 });
  });

  it('maps copies by card id', () => {
    const e = poolEntry({}, { owned_qty: 11 });
    expect(ownedById([e]).get(e.card.oracle_id)).toBe(11);
  });
});
