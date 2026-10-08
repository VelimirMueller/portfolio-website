import {
  COLLECTION,
  collectionStats,
  compareCards,
  filterCards,
  manaSymbols,
  matchesColor,
  matchesQuery,
  typeGroup,
  type MagicCard,
} from '../collection';

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
  effect: 'Flying.',
  short: 'A flier.',
  status: 'photo',
  note: null,
  ...over,
});

describe('magic collection', () => {
  it('loads every card from the JSON with a name and text', () => {
    expect(COLLECTION.cards.length).toBeGreaterThan(0);
    for (const c of COLLECTION.cards) {
      expect(c.name).toBeTruthy();
      expect(c.effect).toBeTruthy();
      expect(c.owned_qty).toBeGreaterThan(0);
    }
  });

  it('has unique names, since the grid keys on them', () => {
    const names = COLLECTION.cards.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('groups artifact creatures as creatures and every land as land', () => {
    expect(typeGroup('Artifact Creature')).toBe('Creature');
    expect(typeGroup('Land - Island')).toBe('Land');
    expect(typeGroup('Basic Land')).toBe('Land');
    expect(typeGroup('Enchantment - Aura')).toBe('Enchantment');
    expect(typeGroup('Legendary Artifact')).toBe('Artifact');
    expect(typeGroup('Planeswalker')).toBe('Planeswalker');
  });

  it('filters by single color, multicolor and colorless', () => {
    const mono = card({ colors: ['W'] });
    const multi = card({ colors: ['W', 'U'] });
    const none = card({ colors: [] });
    expect(matchesColor(mono, 'W')).toBe(true);
    expect(matchesColor(multi, 'W')).toBe(true);
    expect(matchesColor(mono, 'multi')).toBe(false);
    expect(matchesColor(multi, 'multi')).toBe(true);
    expect(matchesColor(none, 'colorless')).toBe(true);
    expect(matchesColor(mono, 'all')).toBe(true);
  });

  it('searches names, German names and text case-insensitively', () => {
    const c = card({ name: 'Theorist\'s Proxy', name_de: 'Stellvertreter des Theoretikers', effect: 'Empower Jace 3.' });
    expect(matchesQuery(c, 'proxy')).toBe(true);
    expect(matchesQuery(c, 'STELLVERTRETER')).toBe(true);
    expect(matchesQuery(c, 'jace')).toBe(true);
    expect(matchesQuery(c, '  ')).toBe(true);
    expect(matchesQuery(c, 'krenko')).toBe(false);
  });

  it('sorts spells by mana value, unknown cost after, lands last', () => {
    const land = card({ name: 'A Land', type: 'Land', mana_value: 0 });
    const two = card({ name: 'Two', mana_value: 2 });
    const one = card({ name: 'One', mana_value: 1 });
    const unknown = card({ name: 'Unknown', mana_value: null });
    expect([land, unknown, two, one].sort(compareCards).map((c) => c.name)).toEqual(['One', 'Two', 'Unknown', 'A Land']);
  });

  it('combines query, color and type filters', () => {
    const cards = [card({ name: 'Blue Bird' }), card({ name: 'White Bird', colors: ['W'] }), card({ name: 'Blue Bolt', type: 'Instant' })];
    expect(filterCards(cards, { query: 'bird', color: 'U', type: 'Creature' }).map((c) => c.name)).toEqual(['Blue Bird']);
  });

  it('sums copies, German copies and cards still to check', () => {
    const stats = collectionStats([
      card({ owned_qty: 3, copies_de: 1 }),
      card({ owned_qty: 1, status: 'partial' }),
      card({ owned_qty: 4, status: 'verify' }),
    ]);
    expect(stats).toEqual({ unique: 3, copies: 8, german: 1, toVerify: 2 });
  });

  it('splits a mana cost into symbols', () => {
    expect(manaSymbols('{2}{W/U}{U}')).toEqual(['2', 'W/U', 'U']);
    expect(manaSymbols(null)).toEqual([]);
  });
});
