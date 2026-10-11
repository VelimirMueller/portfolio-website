// 36 · Magic decks — /admin/magic/decks (DeckList): "Import deck" button and deck cards with ownership. Dark only.
section({ name: '36 · Magic decks', page: PG.T, run: async () => T.board('36 · Magic decks', async (w, mode) => T.magic(w, mode, 1, null, async (m, iw) => { const D = T.D(w), M = T.MODE(mode);
  const bar = K.row(12, 'Bar'); const t = await K.t('4 DECKS', 'label/sm', K.v(mode, 'faint')); h.add(bar, t); t.layoutGrow = 1; h.add(bar, await K.btn('Brand', 'sm', mode, 'Import deck')); h.add(m, bar); h.fillW(bar);
  const n = D ? 3 : 1, cw = Math.floor((iw - 16 * (n - 1)) / n); const g = K.wrap(iw, 16, 'Decks');
  for (const [nm, pct] of [['Krenko Goblins', 0.64], ['Atraxa Superfriends', 0.38], ['Mono-Blue Tempo', 0.92], ['Elves Budget', 1]].slice(0, D ? 4 : 2)) {
    const i = await T.use('Deck Card', { Mode: M }, { Name: nm, Meta: Math.round(pct * 100) + ' / 100 cards owned' }, () => K.deckCard(mode, { name: nm, pct, w: cw })); h.add(g, i); T.size(i, cw); }
  h.add(m, g);
  if (D) { const e = await T.use('Empty State', { Kind: 'No decks', Mode: M }, null, () => K.empty('No decks', mode)); const ec = T.panel(mode, iw, 'Empty state (no decks yet)'); ec.counterAxisAlignItems = 'CENTER'; h.add(ec, await K.t('EMPTY STATE', 'label/sm', K.v(mode, 'faint')), e); h.add(m, ec); }
  }), { route: '/admin/magic/decks', light: false }) });
