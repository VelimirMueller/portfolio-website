// 39 · Magic wishlist — /admin/magic/wishlist (WishlistView): cards to buy, "Got it" moves them to the pool. Dark only.
section({ name: '39 · Magic wishlist', page: PG.T, run: async () => T.board('39 · Magic wishlist', async (w, mode) => T.magic(w, mode, 2, null, async (m, iw) => { const D = T.D(w);
  const bar = K.row(12, 'Bar'); const t = await K.t('5 CARDS · ~ €42 TO BUY', 'label/sm', K.v(mode, 'faint')); h.add(bar, t); t.layoutGrow = 1;
  h.add(bar, await T.use('Tag', { State: 'Active', Mode: T.MODE(mode) }, { Label: 'Krenko Goblins' }, () => K.tag('Active', mode, 'Krenko Goblins'))); h.add(m, bar); h.fillW(bar);
  h.add(m, await T.tiles(mode, iw, D ? 5 : 2, D ? 3 : 1, { action: ['Brand', 'Got it'] })); }), { route: '/admin/magic/wishlist', light: false }) });
