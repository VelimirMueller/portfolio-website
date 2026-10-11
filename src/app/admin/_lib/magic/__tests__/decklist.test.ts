import { deckSlug, MAX_IMPORT_LINES, parseDecklist } from '../decklist';

describe('parseDecklist', () => {
  it('reads Moxfield plain text with a SIDEBOARD: section', () => {
    const r = parseDecklist('4 Goblin Guide\n1 Krenko, Mob Boss\n\nSIDEBOARD:\n2 Smash to Smithereens\n');
    expect(r.errors).toEqual([]);
    expect(r.lines).toEqual([
      { section: 'main', qty: 4, name: 'Goblin Guide' },
      { section: 'main', qty: 1, name: 'Krenko, Mob Boss' },
      { section: 'sideboard', qty: 2, name: 'Smash to Smithereens' },
    ]);
  });

  it('strips set, collector number, foil marks and tags', () => {
    const r = parseDecklist('4 Krenko, Mob Boss (M13) 141 *F*\n2 Goblin Bushwhacker (ZEN) 125 #haste');
    expect(r.lines.map((l) => l.name)).toEqual(['Krenko, Mob Boss', 'Goblin Bushwhacker']);
  });

  it('reads MTG Arena headers and "4x" counts', () => {
    const r = parseDecklist('Deck\n4x Lightning Bolt\n\nSideboard\n3x Abrade');
    expect(r.lines).toEqual([
      { section: 'main', qty: 4, name: 'Lightning Bolt' },
      { section: 'sideboard', qty: 3, name: 'Abrade' },
    ]);
  });

  it('counts the commander as main deck and skips the maybeboard', () => {
    const r = parseDecklist('Commander\n1 Krenko, Mob Boss\nMaybeboard\n1 Goblin Lackey\nMainboard\n1 Mountain');
    expect(r.lines.map((l) => l.name)).toEqual(['Krenko, Mob Boss', 'Mountain']);
  });

  it('writes split cards with " // " whatever the export used', () => {
    expect(parseDecklist('1 Fire / Ice').lines[0].name).toBe('Fire // Ice');
    expect(parseDecklist('1 Fire // Ice').lines[0].name).toBe('Fire // Ice');
  });

  it('reports lines without a count, with the line number', () => {
    const r = parseDecklist('4 Goblin Guide\nGoblin Lackey');
    expect(r.errors).toEqual(['Line 2: "Goblin Lackey" is not "<count> <card name>".']);
  });

  it('rejects a list without a main deck, and lists that are too long', () => {
    expect(parseDecklist('SIDEBOARD:\n2 Abrade').errors).toEqual(['The main deck is empty.']);
    expect(parseDecklist('').errors).toEqual(['The main deck is empty.']);
    const long = Array.from({ length: MAX_IMPORT_LINES + 1 }, (_, i) => `1 Card ${i}`).join('\n');
    expect(parseDecklist(long).errors).toContain(`At most ${MAX_IMPORT_LINES} lines per deck.`);
  });

  it('rejects a count of 0', () => {
    expect(parseDecklist('0 Goblin Guide').errors).toHaveLength(1);
  });
});

describe('deckSlug', () => {
  it('lowercases, drops punctuation and accents', () => {
    expect(deckSlug('Krenko, Mob Boss!')).toBe('krenko-mob-boss');
    expect(deckSlug('  Stärke des Stiers  ')).toBe('starke-des-stiers');
    expect(deckSlug('Große Goblins')).toBe('grosse-goblins');
  });

  it('is empty when nothing usable is left, and at most 80 characters', () => {
    expect(deckSlug('!!!')).toBe('');
    const slug = deckSlug('a '.repeat(60));
    expect(slug.length).toBeLessThanOrEqual(80);
    expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});
