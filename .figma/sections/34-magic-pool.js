// 34 · Magic pool — /admin/magic (PoolView): Magic tabs, 4 stats, search + filter chips, card tile grid. Dark only.
const CARDS = [['Krenko, Mob Boss', 'Legendary Creature — Goblin Warrior'], ['Goblin Chieftain', 'Creature — Goblin'], ['Skirk Prospector', 'Creature — Goblin'], ['Impact Tremors', 'Enchantment'],
  ['Shared Animosity', 'Enchantment'], ['Goblin Matron', 'Creature — Goblin']];
T.magic = async (w, mode, sel, sub, main) => T.adminFrame(w, mode, 'Magic', 'Magic', 'My cards, my decks, and every card ever printed', async (m, iw) => { h.add(m, await T.tabs('Pill', mode, sel)); if (sub) h.add(m, await K.t(sub, 'heading/h5', K.v(mode, 'text'))); await main(m, iw); });
T.tiles = async (mode, iw, n, cols, o) => { o = o || {}; const g = K.wrap(iw, 16, 'Tiles'); const tw = Math.floor((iw - 16 * (cols - 1)) / cols);
  for (const [nm, ty] of CARDS.slice(0, n)) { const i = await T.use('Card Tile', { Mode: T.MODE(mode) }, { Name: nm, Type: ty }, () => K.cardTile(mode, { name: nm, w: tw }));
    if (o.action) { const wrap = K.col(8, nm); h.add(wrap, i); T.size(i, tw); const b = await K.btn(o.action[0], 'sm', mode, o.action[1], { noIcon: true }); h.add(wrap, b); h.add(g, wrap); }
    else { h.add(g, i); T.size(i, tw); } }
  return g; };
section({ name: '34 · Magic pool', page: PG.T, run: async () => T.board('34 · Magic pool', async (w, mode) => T.magic(w, mode, 0, null, async (m, iw) => { const D = T.D(w), M = T.MODE(mode);
  const n = D ? 4 : 2, sw = Math.floor((iw - 16 * (n - 1)) / n); const st = K.wrap(iw, 16, 'Stats');
  for (const [l, v] of [['UNIQUE CARDS', '412'], ['COPIES', '1,036'], ['GERMAN COPIES', '288'], ['RARES & MYTHICS', '97']]) { const c = T.panel(mode, sw, l, 4);
    h.add(c, await T.use('Stat', { Size: 'md', Mode: M }, { Value: v, Label: l }, async () => { const x = await K.stat('md', mode); await K.texts(x, { Value: v, Label: l }); return x; })); h.add(st, c); }
  h.add(m, st);
  const fl = K.wrap(iw, 8, 'Filters'); h.add(fl, T.size(await T.use('Search', { State: 'Default', Mode: M }, null, () => K.search('Default', mode)), D ? 320 : iw));
  for (const [t, on] of [['All', true], ['White', false], ['Blue', false], ['Black', false], ['Red', false], ['Green', false], ['Multicolor', false], ['Colorless', false]].slice(0, D ? 8 : 4))
    h.add(fl, await T.use('Tag', { State: on ? 'Active' : 'Default', Mode: M }, { Label: t }, () => K.tag(on ? 'Active' : 'Default', mode, t)));
  h.add(m, fl, await T.tiles(mode, iw, D ? 6 : 3, D ? 3 : 1));
  h.add(m, await T.use('Pagination', { Page: 'First', Mode: M }, null, () => K.pager('First', mode))); }), { route: '/admin/magic', light: false }) });
