// 37 · Magic deck — /admin/magic/decks/[slug] (DeckView): deck header, warning, card tables. Dark only.
section({ name: '37 · Magic deck', page: PG.T, run: async () => T.board('37 · Magic deck', async (w, mode) => T.magic(w, mode, 1, null, async (m, iw) => { const D = T.D(w), M = T.MODE(mode);
  h.add(m, await K.link('Arrow', 'Default', mode, 'All decks'));
  const hd = T.panel(mode, iw, 'Deck header', 12); const top = K.row(12, 'Top'); const nm = await K.t('Krenko Goblins', 'heading/h3', K.v(mode, 'text')); h.add(top, nm); nm.layoutGrow = 1;
  h.add(top, await K.pill('Commander', mode, 'neutral', { dot: false })); h.add(hd, top); h.fillW(top);
  h.add(hd, await T.use('Progress', { Value: '60', Mode: M }, null, () => K.progress('60', mode)));
  h.add(m, hd);
  const warn = await T.use('Alert', { Tone: 'Warning', Mode: M }, { Title: '3 cards missing', Body: 'Krenko Goblins needs 3 more cards for the main deck.' }, () => K.alert('Warning', mode, iw, '3 cards missing', 'Krenko Goblins needs 3 more cards for the main deck.'));
  h.add(m, warn); T.size(warn, iw);
  for (const t of D ? ['Main deck', 'Still to buy'] : ['Main deck']) { const tb = await T.use('Table', { Mode: M }, { Title: t }, () => K.table(mode)); h.add(m, tb); T.size(tb, iw); }
  }), { route: '/admin/magic/decks/[slug]', light: false }) });
