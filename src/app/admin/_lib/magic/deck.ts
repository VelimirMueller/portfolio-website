import { ownedByName, type ManaColor, type PoolCard } from './collection';

// The planned deck "Stapelbruch" (stapelbruch_deck.pdf, 2026-10-08). Card
// names are Scryfall's English names, so they match pool and catalog rows;
// `label` is the name on Velimir's German copy where it differs.

export type DeckEntry = { qty: number; name: string; label?: string; role: string };
export type SideboardEntry = { qty: number; name: string; against: string; swapOut: string };
export type BuyEntry = { qty: number; name: string; role: string; eur: number };
export type UpgradeEntry = { stage: number; name: string; replaces: string; why: string };

export type DeckPlan = {
  name: string;
  summary: string;
  colors: ManaColor[];
  mainSize: number;
  sideboardSize: number;
  main: DeckEntry[];
  sideboard: SideboardEntry[];
  /** Shopping list as planned, with the PDF's price estimate per row (EUR, Oct 2026). */
  buy: BuyEntry[];
  /** One order instead of ten: the plan's shipping buffer in EUR. */
  shippingEur: number;
  upgrades: UpgradeEntry[];
};

export const STAPELBRUCH: DeckPlan = {
  name: 'Stapelbruch',
  summary:
    'Mono-blue kitchen-table deck against 2013 Goblins and artifact decks. Keep two mana open, counter Krenko and the haste card on the stack, bounce the rest when it attacks.',
  colors: ['U'],
  mainSize: 60,
  sideboardSize: 15,
  main: [
    { qty: 4, name: 'Countersculpt', role: 'Counters any spell. Krenko dies on the stack. Jace +1.' },
    { qty: 4, name: 'Essence Scatter', role: 'Creatures only. The cheap second counter.' },
    { qty: 1, name: 'Icy Reception', label: 'Eisiger Empfang', role: 'Creature or legendary spell unless they pay {3}, or −5/−0.' },
    { qty: 4, name: 'Aetherize', role: 'All attackers back to hand. The answer to the token swarm.' },
    { qty: 3, name: 'Unsummon', role: 'One creature back before it attacks or taps.' },
    { qty: 2, name: 'Into the Roil', role: 'Bounce; kicked for {1}{U} more, also draw a card.' },
    { qty: 4, name: 'Opt', role: 'Finds counters and lands. Keeps the deck running.' },
    { qty: 1, name: 'Cyclonic Rift', role: 'One permanent back. Overload {6}{U}: everything of theirs.' },
    { qty: 1, name: 'Infinite Coursework', label: 'Endlose Kursarbeit', role: 'Taps, removes all abilities, never untaps. Krenko or an artifact.' },
    { qty: 1, name: 'Plan for All Outcomes', role: 'One permanent into the library. Jace every turn.' },
    { qty: 3, name: "Theorist's Proxy", role: '0/3 flash blocker. Sacrifice: next spell can’t be countered.' },
    { qty: 2, name: 'Traxos, Academy Guardian', role: '1/5 flier. Costs 2 less after a noncreature spell.' },
    { qty: 1, name: 'Divining Duelist', role: 'Flash. Taps a creature when it enters.' },
    { qty: 1, name: 'Surveillance Phantasm', role: '2/3 flier, defender.' },
    { qty: 1, name: 'Cryotheory Adept', role: 'From the graveyard: tap and stun.' },
    { qty: 1, name: 'Chandra, Chill of Compliance', role: '−X taps and stuns. Card draw later.' },
    { qty: 1, name: 'Way of the Cryomancer', role: 'Jace 5. Planeswalkers copy your next spell.' },
    { qty: 1, name: "Protege's Awakening", role: 'Jace 6, one card.' },
    { qty: 1, name: "Sphinx's Approach", role: 'Two cards.' },
    { qty: 24, name: 'Island', role: 'Only Islands. No splash, no bad mana.' },
  ],
  sideboard: [
    { qty: 4, name: 'Annul', against: 'Artifacts and enchantments', swapOut: '2 Essence Scatter, 2 Aetherize' },
    { qty: 2, name: "Hurkyl's Recall", against: 'A full artifact board', swapOut: "2 Theorist's Proxy" },
    { qty: 3, name: 'Negate', against: 'Slow decks, big spells from 4 mana', swapOut: '3 Essence Scatter' },
    { qty: 2, name: 'Disperse', against: 'One strong permanent', swapOut: '1 Unsummon, 1 Opt' },
    { qty: 1, name: 'Multiply by Zero', against: 'One big creature that did not die on the stack', swapOut: '1 Surveillance Phantasm' },
    { qty: 1, name: 'Extended Absence', against: 'A creature or planeswalker that must go, not just bounce', swapOut: '1 Cryotheory Adept' },
  ],
  buy: [
    { qty: 4, name: 'Essence Scatter', role: 'Counter for creature spells, 2 mana', eur: 1.5 },
    { qty: 4, name: 'Opt', role: 'Look at the top card, keep it or bottom it', eur: 1.5 },
    { qty: 2, name: 'Unsummon', role: 'On top of your one copy', eur: 0.5 },
    { qty: 1, name: 'Cyclonic Rift', role: 'The finisher. Overload bounces all opposing permanents', eur: 22 },
    { qty: 4, name: 'Annul', role: 'Sideboard: counter for artifact or enchantment, 1 mana', eur: 2 },
    { qty: 3, name: 'Negate', role: 'Sideboard: counter for noncreature spells', eur: 1.5 },
    { qty: 2, name: 'Disperse', role: 'Sideboard: one nonland permanent back', eur: 1 },
    { qty: 2, name: 'Into the Roil', role: 'Bounce, optionally draw a card', eur: 1.5 },
    { qty: 2, name: "Hurkyl's Recall", role: 'Sideboard: all artifacts of one player to hand', eur: 6 },
    { qty: 12, name: 'Island', role: 'Brings the deck to 24 lands', eur: 2 },
  ],
  shippingEur: 8,
  upgrades: [
    { stage: 1, name: 'Otawara, Soaring City', replaces: '1 Island', why: 'An Island that bounces a creature late. No color problem.' },
    { stage: 2, name: 'Cyclonic Rift', replaces: '1 Aetherize', why: 'Overload is the best play of the deck. A second copy finds it more often.' },
    { stage: 3, name: 'Mana Drain', replaces: '1 Countersculpt', why: 'Counter, and the mana stays for your turn. Expensive, the biggest single upgrade.' },
    { stage: 4, name: 'Rhystic Study', replaces: "1 Sphinx's Approach", why: 'Draws every turn against slow decks. Weaker against Goblins.' },
    { stage: 5, name: 'Force of Will', replaces: '1 Essence Scatter', why: 'A counter without mana, for the one turn you are tapped out.' },
    { stage: 6, name: 'Consecrated Sphinx', replaces: '1 Traxos', why: 'The finisher against slow decks. Draws two when they draw.' },
    { stage: 7, name: 'Teferi, Hero of Dominaria', replaces: 'Chandra, Chill of Compliance', why: 'Draws, untaps lands, and the emblem clears the board.' },
  ],
};

export type DeckLine = { name: string; qty: number; owned: number; missing: number };

/**
 * How much of the deck the pool already covers. Main deck first: a copy you
 * own fills a main-deck slot before a sideboard slot, so "missing" on the
 * sideboard means copies on top of what the main deck already uses.
 */
export function deckOwnership(plan: Pick<DeckPlan, 'main' | 'sideboard'>, pool: Pick<PoolCard, 'name' | 'owned_qty'>[]) {
  const left = ownedByName(pool);
  const take = ({ name, qty }: { name: string; qty: number }): DeckLine => {
    const owned = Math.min(qty, left.get(name) ?? 0);
    left.set(name, (left.get(name) ?? 0) - owned);
    return { name, qty, owned, missing: qty - owned };
  };
  const main = plan.main.map(take);
  const sideboard = plan.sideboard.map(take);
  const sum = (lines: DeckLine[], key: 'qty' | 'owned' | 'missing') => lines.reduce((n, l) => n + l[key], 0);
  return {
    main,
    sideboard,
    totals: {
      main: sum(main, 'qty'),
      sideboard: sum(sideboard, 'qty'),
      owned: sum(main, 'owned') + sum(sideboard, 'owned'),
      missing: sum(main, 'missing') + sum(sideboard, 'missing'),
    },
  };
}

/** Cards whose colors fall outside the deck's colors (a black card in a mono-blue deck). */
export function offColor(colorsByName: Map<string, ManaColor[]>, names: string[], deckColors: ManaColor[]): string[] {
  return names.filter((n) => (colorsByName.get(n) ?? []).some((c) => !deckColors.includes(c)));
}
