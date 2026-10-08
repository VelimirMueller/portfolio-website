import { cardImage, manaSymbols, typeGroup } from '../cards';

describe('card helpers', () => {
  it('puts each card in one type group: artifact creatures are creatures, every land a land', () => {
    expect(typeGroup('Artifact Creature — Gargoyle')).toBe('Creature');
    expect(typeGroup('Land — Island')).toBe('Land');
    expect(typeGroup('Basic Land — Island')).toBe('Land');
    expect(typeGroup('Enchantment — Aura')).toBe('Enchantment');
    expect(typeGroup('Legendary Artifact')).toBe('Artifact');
    expect(typeGroup('Legendary Planeswalker — Chandra')).toBe('Planeswalker');
    expect(typeGroup('Creature — Elemental Sorcerer // Sorcery')).toBe('Creature');
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
});
