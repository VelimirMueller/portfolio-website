// 35 · Magic add — /admin/magic/add (AddCardSearch): search every printed card, add copies to the pool. Dark only.
section({ name: '35 · Magic add', page: PG.T, run: async () => T.board('35 · Magic add', async (w, mode) => T.magic(w, mode, 3, null, async (m, iw) => { const D = T.D(w), M = T.MODE(mode);
  const s = await T.use('Field', { Control: 'Input', State: 'Default', Mode: M }, { Label: 'SEARCH ALL CARDS', Help: 'Name or rules text. Scryfall syntax works.' }, () => K.field('Input', 'Default', mode, 'Name', { w: iw }));
  h.add(m, s); T.size(s, D ? 640 : iw);
  h.add(m, await K.t('6 RESULTS FOR "GOBLIN"', 'label/sm', K.v(mode, 'faint')), await T.tiles(mode, iw, D ? 6 : 3, D ? 3 : 1, { action: ['Brand', 'Add to pool'] }));
  h.add(m, await T.use('Toast', { Tone: 'Success', Mode: M }, { Title: 'Added to pool', Body: 'Krenko, Mob Boss · 1 copy · DE' }, () => K.toast('Success', mode))); }), { route: '/admin/magic/add', light: false }) });
