// 17 · Data — table row, table, accordion.
const TCOLS = [['QTY', 64], ['CARD', 300], ['TYPE', 240], ['MANA', 120], ['OWNED', 156]];
const TROWS = [['4', 'Krenko, Mob Boss', 'Legendary Creature', '2R', '4 / 4'], ['1', 'Goblin Chieftain', 'Creature — Goblin', '1RR', '1 / 1'], ['2', 'Skirk Prospector', 'Creature — Goblin', 'R', '0 / 2'],
  ['1', 'Impact Tremors', 'Enchantment', '1R', '1 / 1'], ['1', 'Shared Animosity', 'Enchantment', '2R', '0 / 1']];
K.tableRow = async (kind, mode, cells) => { const head = kind === 'Header'; const r = K.row(0, head ? 'Table Header' : 'Table Row'); r.counterAxisAlignItems = 'CENTER';
  r.fills = kind === 'Hover' ? [K.c(K.v(mode, 'hover'))] : kind === 'Selected' ? [K.c(K.v(mode, 'accent'), 0.1)] : head ? [K.c(K.v(mode, 'card'))] : [];
  r.strokes = [K.c(K.v(mode, 'border'))]; r.strokeBottomWeight = 1; r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
  cells = cells || (head ? TCOLS.map(c => c[0]) : TROWS[0]);
  for (let i = 0; i < TCOLS.length; i++) { const c = K.row(6, 'Cell ' + (i + 1)); K.pad(c, 16, head ? 12 : 14); K.fixW(c, TCOLS[i][1]);
    const owned = i === 4 && !head; const full = owned && cells[4].split(' / ')[0] === cells[4].split(' / ')[1];
    const st = head ? 'label/sm' : i === 1 ? 'body/sm-strong' : i === 0 || i >= 3 ? 'mono/md' : 'body/sm';
    const col = head ? K.v(mode, 'faint') : owned ? K.v(mode, full ? 'success-text' : 'warning-text') : i === 1 ? K.v(mode, 'text') : K.v(mode, 'sub');
    if (owned) h.add(c, K.dot(6, K.v(mode, full ? 'success' : 'warning')));
    h.add(c, await K.t(cells[i], st, col, { name: TCOLS[i][0].toLowerCase() })); h.add(r, c); }
  return r; };
K.table = async (mode) => { const t = K.col(0, 'Table'); t.cornerRadius = 24; t.clipsContent = true; K.f(t, K.v(mode, 'card')); K.s(t, K.v(mode, 'border'));
  const cap = K.row(12, 'Caption'); K.pad(cap, 16, 16); const ct = await K.t('Main deck', 'heading/h5', K.v(mode, 'text'), { name: 'Title' }); h.add(cap, ct); ct.layoutGrow = 1;
  h.add(cap, await K.pill('64 cards', mode, 'neutral', { dot: false })); h.add(t, cap); h.fillW(cap);
  const add = async (kind, cells) => { const i = await K.inst('Table Row', { Kind: kind, Mode: ModeOf(mode) });
    if (i) { if (cells) for (let k = 0; k < TCOLS.length; k++) await K.setText(i, TCOLS[k][0].toLowerCase(), cells[k]); h.add(t, i); } else h.add(t, await K.tableRow(kind, mode, cells)); };
  await add('Header'); let n = 0; for (const row of TROWS) await add(n++ === 1 ? 'Hover' : 'Default', row); return t; };
K.accordion = async (state, mode, q, a) => { const X = state === 'Expanded'; const c = K.col(0, 'Accordion'); c.cornerRadius = 16; c.clipsContent = true;
  K.f(c, K.v(mode, X ? 'card' : state === 'Hover' ? 'hover' : 'card')); K.s(c, K.v(mode, X ? 'border-strong' : 'border')); K.fixW(c, 720);
  const head = K.row(16, 'Header'); K.pad(head, 24, 20); const t = await K.t(q || 'Do you work on contract or full-time?', 'heading/h4', K.v(mode, 'text'), { name: 'Question' }); h.add(head, t); t.layoutGrow = 1;
  h.add(head, await K.icon(X ? 'minus' : 'plus', K.v(mode, X ? 'accent-text' : 'sub'), 20)); h.add(c, head); h.fillW(head);
  if (X) { const body = K.col(0, 'Answer'); K.pad(body, 24, 0, 24); h.add(body, await K.t(a || 'Both. I take product-engineering roles where the brief runs from requirements through UX, frontend and backend to cloud deployment.', 'body/md', K.v(mode, 'sub'), { w: 640, name: 'Answer' })); h.add(c, body); h.fillW(body); }
  if (state === 'Focus') await K.fx(c, 'focus/ring-' + K.m(mode)); return c; };

section({ name: '17 · Data', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('17 · Data'); const b = K.board('Data', 1800);
  h.add(b, await K.head('17 · Components', 'Data', 'Tables for decks and lists (DeckView.tsx): mono numbers, 10 px uppercase headers, 1 px row dividers. Accordion for FAQ-style content; code has only the expandable project card (F-6).'));
  await K.set(b, 'Table Row', 'One row of a data table. Cell text layers: qty, card, type, mana, owned.', [['Kind', ['Header', 'Default', 'Hover', 'Selected']]], (p, m) => K.tableRow(p.Kind, m), { colAxis: null });
  await K.set(b, 'Table', 'Card table with caption. Built from Table Row instances.', [], (p, m) => K.table(m));
  await K.set(b, 'Accordion', 'Disclosure row. One open at a time inside a group.', [['State', ['Collapsed', 'Hover', 'Focus', 'Expanded']]], (p, m) => K.accordion(p.State, m), { colAxis: null });
  return h.place(s, b); } });
