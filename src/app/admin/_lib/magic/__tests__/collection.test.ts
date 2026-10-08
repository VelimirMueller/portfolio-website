import {
  cardImage,
  collectionStats,
  compareCards,
  filterCards,
  manaSymbols,
  matchesColor,
  matchesQuery,
  namePattern,
  ownedByName,
  rankSearch,
  typeGroup,
} from '../collection';
import { poolCard as card } from '../testFixtures';

describe('magic collection helpers', () => {
  it('groups artifact creatures as creatures and every land as land', () => {
    expect(typeGroup('Artifact Creature — Gargoyle')).toBe('Creature');
    expect(typeGroup('Land — Island')).toBe('Land');
    expect(typeGroup('Basic Land — Island')).toBe('Land');
    expect(typeGroup('Enchantment — Aura')).toBe('Enchantment');
    expect(typeGroup('Legendary Artifact')).toBe('Artifact');
    expect(typeGroup('Legendary Planeswalker — Chandra')).toBe('Planeswalker');
  });

  it('filters by single color, multicolor and colorless', () => {
    expect(matchesColor({ colors: ['W'] }, 'W')).toBe(true);
    expect(matchesColor({ colors: ['W', 'U'] }, 'W')).toBe(true);
    expect(matchesColor({ colors: ['W'] }, 'multi')).toBe(false);
    expect(matchesColor({ colors: ['W', 'U'] }, 'multi')).toBe(true);
    expect(matchesColor({ colors: [] }, 'colorless')).toBe(true);
    expect(matchesColor({ colors: ['W'] }, 'all')).toBe(true);
  });

  it('searches names, German names and text case-insensitively', () => {
    const c = card({ name: "Theorist's Proxy", name_de: 'Stellvertreter des Theoretikers', oracle_text: 'Empower Jace 3.' });
    expect(matchesQuery(c, 'proxy')).toBe(true);
    expect(matchesQuery(c, 'STELLVERTRETER')).toBe(true);
    expect(matchesQuery(c, 'jace')).toBe(true);
    expect(matchesQuery(c, '  ')).toBe(true);
    expect(matchesQuery(c, 'krenko')).toBe(false);
  });

  it('sorts spells by mana value, unknown cost after, lands last', () => {
    const land = card({ name: 'A Land', type_line: 'Land', mana_value: 0 });
    const two = card({ name: 'Two', mana_value: 2 });
    const one = card({ name: 'One', mana_value: 1 });
    const unknown = card({ name: 'Unknown', mana_value: null });
    expect([land, unknown, two, one].sort(compareCards).map((c) => c.name)).toEqual(['One', 'Two', 'Unknown', 'A Land']);
  });

  it('combines query, color and type filters', () => {
    const cards = [
      card({ name: 'Blue Bird' }),
      card({ name: 'White Bird', colors: ['W'] }),
      card({ name: 'Blue Bolt', type_line: 'Instant' }),
    ];
    expect(filterCards(cards, { query: 'bird', color: 'U', type: 'Creature' }).map((c) => c.name)).toEqual(['Blue Bird']);
  });

  it('counts copies, German copies and cards whose text came from photos', () => {
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

  it('points images at the cached same-origin route, in the wanted size', () => {
    const url = 'https://cards.scryfall.io/normal/front/1/4/145b928d-a7ff-4fe5-ae4d-bbae7b1d955b.jpg?123';
    expect(cardImage(url, 'small')).toBe('/admin/magic/img/small/front/1/4/145b928d-a7ff-4fe5-ae4d-bbae7b1d955b');
    expect(cardImage(url)).toBe('/admin/magic/img/normal/front/1/4/145b928d-a7ff-4fe5-ae4d-bbae7b1d955b');
    expect(cardImage(null)).toBeNull();
    expect(cardImage('https://evil.example.com/normal/front/1/4/145b928d-a7ff-4fe5-ae4d-bbae7b1d955b.jpg')).toBeNull();
  });

  it('adds up copies per name, e.g. basic and full-art Islands', () => {
    const owned = ownedByName([
      { name: 'Island', owned_qty: 8 },
      { name: 'Island', owned_qty: 3 },
      { name: 'Opt', owned_qty: 1 },
    ]);
    expect(owned.get('Island')).toBe(11);
    expect(owned.get('Opt')).toBe(1);
  });

  it('escapes ilike wildcards in a search', () => {
    expect(namePattern(' rift ')).toBe('%rift%');
    expect(namePattern('50%_a\\b')).toBe('%50\\%\\_a\\\\b%');
  });

  it('ranks exact, then prefix, then word-start, then substring matches', () => {
    const rows = ['Adopt', 'Optimistic Scavenger', 'Opt', 'Last Option'].map((name) => ({ name }));
    expect(rankSearch(rows, 'opt').map((r) => r.name)).toEqual(['Opt', 'Optimistic Scavenger', 'Last Option', 'Adopt']);
  });
});
