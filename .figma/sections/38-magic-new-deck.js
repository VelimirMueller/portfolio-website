// 38 · Magic new deck — /admin/magic/decks/new (DeckImportForm): paste a decklist, import. Dark only.
section({ name: '38 · Magic new deck', page: PG.T, run: async () => T.board('38 · Magic new deck', async (w, mode) => T.magic(w, mode, 1, 'Import a deck', async (m, iw) => { const D = T.D(w), M = T.MODE(mode); const fw = D ? 720 : iw;
  const card = T.panel(mode, fw, 'Import form', 20);
  const name = await T.use('Field', { Control: 'Input', State: 'Default', Mode: M }, { Label: 'DECK NAME *', Value: 'Krenko Mob Boss', Help: 'Shown in the deck list.' }, () => K.field('Input', 'Default', mode, 'Name', { w: fw - 48 }));
  const list = await T.use('Field', { Control: 'Textarea', State: 'Default', Mode: M }, { Label: 'DECKLIST *', Value: '1 Krenko, Mob Boss\n4 Goblin Chieftain\n2 Skirk Prospector', Help: 'One card per line, count first.' }, () => K.field('Textarea', 'Default', mode, 'Message', { w: fw - 48 }));
  h.add(card, name, list); T.size(name, fw - 48); T.size(list, fw - 48);
  const act = K.row(12, 'Actions'); h.add(act, await K.btn('Brand', 'md', mode, 'Import deck'), await K.btn('Ghost', 'md', mode, 'Cancel', { noIcon: true })); h.add(card, act);
  h.add(m, card);
  h.add(m, await T.use('Alert', { Tone: 'Info', Mode: M }, { Title: 'Import runs on the server', Body: 'Large lists take up to 30 seconds. The page redirects when the import reports created.' }, () => K.alert('Info', mode, fw, 'Import runs on the server', 'Large lists take up to 30 seconds.')));
  }), { route: '/admin/magic/decks/new', light: false }) });
