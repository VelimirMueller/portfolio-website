// 15 · Admin — sidebar, header, inbox row, message pane, KPI card, login card, card tile, deck card, stepper, kbd.
// Admin forces dark mode in code; the Light variants exist so the library stays complete for the rebuild.
const ADMIN_NAV = [['Inbox', 'inbox', '3'], ['KPIs', 'bar-chart', null], ['Magic', 'layers', null]];
K.adminLogo = async (mode, word) => { const r = K.row(10, 'Admin logo'); const t = h.box(32, 32, [h.grad([[0, '#6366F1'], [1, '#8B5CF6']], 45)], 10, 'Tile');
  h.add(r, t, await K.t('Velimir' + (word || 'Admin'), 'heading/h5', K.v(mode, 'text'), { name: 'Wordmark' })); return r; };
K.sidebar = async (active, mode) => { const f = K.col(8, 'Admin Sidebar'); K.pad(f, 16, 24); K.f(f, K.v(mode, 'bg')); K.s(f, K.v(mode, 'border')); K.fix(f, 256, 800);
  const lg = await K.adminLogo(mode); lg.paddingLeft = 8; lg.paddingBottom = 24; h.add(f, lg);
  for (const [n, ic, count] of ADMIN_NAV) { const on = n === active; const r = K.row(14, n); K.pad(r, 16, 12); r.cornerRadius = 12;
    r.fills = on ? [K.c(K.v(mode, 'accent'), 0.1)] : []; const c = K.v(mode, on ? 'accent-text' : 'faint');
    const t = await K.t(n, 'body/sm-strong', c, { name: 'Label' }); h.add(r, await K.icon(ic, c, 18), t); t.layoutGrow = 1;
    if (count) { const b = K.row(0, 'Count'); K.pad(b, 6, 2); b.cornerRadius = 4; K.f(b, 'brand/fill-strong'); h.add(b, await K.t(count, 'label/sm', K.v(mode, 'on-accent'))); h.add(r, b); }
    h.add(f, r); h.fillW(r); }
  const sp = K.spacer(); h.add(f, sp); sp.layoutGrow = 1;
  for (const [n, ic] of [['View site', 'external-link'], ['Sign out', 'log-out']]) { const r = K.row(14, n); K.pad(r, 16, 10); h.add(r, await K.icon(ic, K.v(mode, 'faint'), 18), await K.t(n, 'body/sm', K.v(mode, 'faint'))); h.add(f, r); }
  const v = K.row(0, 'Version'); K.pad(v, 8, 3); v.cornerRadius = 6; K.s(v, K.v(mode, 'border')); h.add(v, await K.t('v2.3.0', 'label/sm', K.v(mode, 'faint'))); v.paddingLeft = 8; h.add(f, v); return f; };
K.adminHeader = async (mode, title) => { const f = K.row(16, 'Admin Header'); K.pad(f, 32, 0); K.fix(f, 1184, 80); K.f(f, K.v(mode, 'bg')); K.s(f, K.v(mode, 'border'));
  const t = await K.t(title || 'Inbox', 'heading/h5', K.v(mode, 'text'), { name: 'Title' }); h.add(f, t); t.layoutGrow = 1;
  h.add(f, await K.search('Default', mode));
  const who = K.row(12, 'User'); const av = await K.av('md', 'Initials', mode); const st = K.col(2, 'Who');
  h.add(st, await K.t('Velimir M.', 'body/sm-strong', K.v(mode, 'text')), await K.t('admin@velimir-mueller.de', 'mono/caption', K.v(mode, 'faint')));
  const avw = K.row(0, 'Avatar + status'); h.add(avw, av); const dot = K.dot(10, K.v(mode, 'success'), 'Online'); h.absAt(avw, dot, 30, 30); K.s(dot, K.v(mode, 'bg'), 2);
  h.add(who, avw, st); h.add(f, who); return f; };
K.inboxRow = async (state, mode, o) => { o = o || {}; const sel = state === 'Selected', un = state === 'Unread', H = state === 'Hover';
  const r = K.row(12, 'Inbox Row'); K.pad(r, 20, 14); r.counterAxisAlignItems = 'MIN'; K.fixW(r, o.w || 420);
  r.fills = sel ? [K.c(K.v(mode, 'accent'), 0.1)] : H ? [K.c(K.v(mode, 'hover'))] : []; r.strokes = [K.c(K.v(mode, 'border'))]; r.strokeBottomWeight = 1; r.strokeTopWeight = 0; r.strokeLeftWeight = 0; r.strokeRightWeight = 0;
  if (sel) { const bar = h.rect(2, 10, [K.c(K.v(mode, 'accent'))]); bar.name = 'Selected bar'; h.absAt(r, bar, 0, 0); bar.resize(2, 72); }
  h.add(r, await K.check('Checkbox', sel ? 'On' : 'Off', 'Default', mode, ''));
  r.children[r.children.length - 1].children[1].remove();
  h.add(r, await K.av('sm', 'Initials', mode));
  const x = K.col(4, 'Text'); const top = K.row(8, 'Top');
  const nm = await K.t(o.name || 'Anna Schmidt', un || sel ? 'body/sm-strong' : 'body/sm', K.v(mode, un || sel ? 'text' : 'sub'), { name: 'Name' }); h.add(top, nm); nm.layoutGrow = 1;
  if (un) h.add(top, K.dot(6, K.v(mode, 'accent'), 'Unread'));
  h.add(top, await K.t(o.time || '09:41', 'mono/caption', K.v(mode, 'faint'), { name: 'Time' }));
  h.add(x, top, await K.t(o.subject || 'Project inquiry', 'body/sm', K.v(mode, un ? 'text' : 'sub'), { name: 'Subject' }),
    await K.t(o.preview || 'Hi Velimir, we are looking for a product engineer for…', 'body/xs', K.v(mode, 'faint'), { name: 'Preview', w: (o.w || 420) - 132 }));
  h.add(r, x); x.layoutGrow = 1; h.fillW(top);
  if (H) { const act = K.row(2, 'Actions'); K.pad(act, 4); act.cornerRadius = 10; K.f(act, K.v(mode, 'card')); K.s(act, K.v(mode, 'border-strong'));
    for (const ic of ['inbox', 'trash']) { const b = K.row(0, ic); K.pad(b, 6); b.cornerRadius = 8; h.add(b, await K.icon(ic, K.v(mode, ic === 'trash' ? 'danger-text' : 'sub'), 16)); h.add(act, b); }
    h.absAt(r, act, (o.w || 420) - 96, 14); }
  return r; };
K.kpiCard = async (trend, mode, o) => { o = o || {}; const c = K.col(12, 'KPI Card'); K.pad(c, 24); c.cornerRadius = 32; K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, 'border')); K.fixW(c, o.w || 280);
  const top = K.row(12, 'Top'); const chip = K.row(0, 'Icon chip'); K.pad(chip, 10); chip.cornerRadius = 12; K.f(chip, K.v(mode, 'accent'), 0.1); h.add(chip, await K.icon(o.icon || 'eye', K.v(mode, 'accent-text'), 18));
  h.add(top, chip, await K.t(o.label || 'VISITORS · 30 D', 'label/sm', K.v(mode, 'faint'), { name: 'Label' })); h.add(c, top);
  const tc = K.v(mode, trend === 'Up' ? 'success-text' : trend === 'Down' ? 'danger-text' : 'faint');
  h.add(c, await K.t(o.value || (trend === 'Down' ? '312' : '1,284'), 'metric/lg', K.v(mode, 'text'), { name: 'Value' }));
  const d = K.row(6, 'Delta'); h.add(d, await K.icon(trend === 'Up' ? 'arrow-up-right' : trend === 'Down' ? 'chevron-down' : 'minus', tc, 14),
    await K.t(trend === 'Up' ? '+18 %' : trend === 'Down' ? '−9 %' : '0 %', 'label/nav-active', tc, { name: 'Delta' }), await K.t('vs. last 30 d', 'body/xs', K.v(mode, 'faint'))); h.add(c, d);
  const path = trend === 'Up' ? 'M2 38 L40 30 L78 34 L116 20 L154 24 L192 10 L230 4' : trend === 'Down' ? 'M2 6 L40 12 L78 10 L116 22 L154 18 L192 30 L230 36' : 'M2 22 L40 20 L78 24 L116 21 L154 23 L192 20 L230 22';
  h.add(c, K.svg('<path d="' + path + '"/>', trend === 'Down' ? K.v(mode, 'danger-text') : K.v(mode, 'accent'), 232, 42, 2, 'Sparkline')); return c; };
K.messagePane = async (mode, w) => { const W = w || 720; const f = K.col(24, 'Message Pane'); K.pad(f, 32); f.cornerRadius = 32; K.f(f, K.v(mode, 'card')); K.s(f, K.v(mode, 'border')); K.fixW(f, W);
  const tb = K.row(8, 'Toolbar'); for (const ic of ['chevron-left', 'chevron-right']) h.add(tb, await K.ibtn('Ghost', 'sm', mode, ic));
  const sp = K.spacer(); h.add(tb, sp); sp.layoutGrow = 1; for (const ic of ['inbox', 'trash']) h.add(tb, await K.ibtn('Ghost', 'sm', mode, ic)); h.add(f, tb); h.fillW(tb);
  const who = K.row(16, 'From'); const t = K.col(4, 'Who');
  h.add(t, await K.t('Anna Schmidt', 'heading/h4', K.v(mode, 'text'), { name: 'Name' }), await K.link('Inline', 'Default', mode, 'anna.schmidt@studio.de'));
  h.add(who, await K.av('lg', 'Initials', mode), t); const sp2 = K.spacer(); h.add(who, sp2); sp2.layoutGrow = 1;
  h.add(who, await K.pill('New', mode, 'brand'), await K.t('Today · 09:41', 'mono/caption', K.v(mode, 'faint'))); h.add(f, who); h.fillW(who);
  const box = K.col(12, 'Message'); K.pad(box, 20); box.cornerRadius = 16; K.f(box, K.v(mode, 'bg')); K.s(box, K.v(mode, 'border'));
  h.add(box, await K.t('Project inquiry', 'body/sm-strong', K.v(mode, 'text')), await K.t('Hi Velimir,\n\nwe are looking for a product engineer for a 6-month build of our booking platform: Next.js, Supabase and a small design system. Do you have time from November?\n\nBest, Anna', 'body/md', K.v(mode, 'sub'), { w: W - 104, name: 'Body' }));
  h.add(f, box); h.fillW(box);
  const act = K.row(12, 'Actions'); h.add(act, await K.btn('Brand', 'md', mode, 'Reply'), await K.btn('Ghost', 'md', mode, 'Archive', { noIcon: true })); h.add(f, act); return f; };
K.loginCard = async (state, mode) => { const c = K.col(20, 'Login Card'); K.pad(c, 32); c.cornerRadius = 32; K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, 'border')); K.fixW(c, 384);
  await K.fx(c, K.m(mode) === 'light' ? 'shadow/card-light' : 'glow/card-dark');
  h.add(c, await K.adminLogo(mode), await K.t('Sign in with a one-time link.', 'body/sm', K.v(mode, 'sub')));
  if (state === 'Sent') { h.add(c, await K.alert('Info', mode, 320, 'Check your inbox', 'If that address may sign in, a login link is on its way. It works once, for 15 minutes.')); return c; }
  h.add(c, await K.field('Input', state === 'Error' ? 'Error' : 'Default', mode, 'Email', { w: 320 }));
  if (state === 'Error') h.add(c, await K.alert('Danger', mode, 320, 'Link not valid', 'That login link did not work. Request a new one.'));
  const bb = await K.btn('Brand', 'md', mode, 'Send login link'); h.add(c, bb); h.fillW(bb); return c; };
K.cardTile = async (mode, o) => { o = o || {}; const W = o.w || 440; const c = K.row(16, 'Card Tile'); K.pad(c, 16); c.counterAxisAlignItems = 'MIN'; c.cornerRadius = 32; K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, 'border')); K.fixW(c, W);
  h.add(c, await h.img('website/build-mtg-v1.png', 96, 134, { r: 5, name: 'Card art' }));
  const x = K.col(8, 'Info'); const top = K.row(8, 'Name');
  const nm = await K.t(o.name || 'Krenko, Mob Boss', 'heading/h5', K.v(mode, 'text'), { name: 'Name' }); h.add(top, nm); nm.layoutGrow = 1;
  const pips = K.row(3, 'Mana'); for (const p of ['red/500', 'red/500', 'zinc/500']) h.add(pips, K.dot(14, p, 'Pip')); h.add(top, pips);
  h.add(x, top, await K.t('Legendary Creature — Goblin Warrior', 'body/xs', K.v(mode, 'sub'), { name: 'Type' }));
  const tags = K.row(6, 'Tags'); h.add(tags, await K.pill('Rare', mode, 'warning', { dot: false }), await K.pill('DE', mode, 'neutral', { dot: false })); h.add(x, tags);
  const note = K.row(0, 'Note'); note.paddingLeft = 10; note.strokes = [K.c(K.v(mode, 'warning'), 0.4)]; note.strokeLeftWeight = 2; note.strokeTopWeight = 0; note.strokeRightWeight = 0; note.strokeBottomWeight = 0;
  h.add(note, await K.t('In Goblins deck · 1 more for the sideboard', 'body/xs', K.v(mode, 'warning-text'), { w: W - 180 })); h.add(x, note);
  h.add(x, await K.stepper(mode)); K.grow(c, x); h.fillW(top); return c; };
K.stepper = async (mode) => { const r = K.row(8, 'Quantity Stepper');
  for (const it of ['minus', 'qty', 'plus']) { if (it === 'qty') { h.add(r, await K.t('2', 'mono/md', K.v(mode, 'text'), { name: 'Quantity' })); continue; }
    const b = K.row(0, it); K.fix(b, 28, 28); b.cornerRadius = 8; b.primaryAxisAlignItems = 'CENTER'; b.counterAxisAlignItems = 'CENTER'; K.s(b, K.v(mode, 'border-strong'));
    h.add(b, await K.icon(it, K.v(mode, 'sub'), 14)); h.add(r, b); } return r; };
K.deckCard = async (mode, o) => { o = o || {}; const c = K.col(12, 'Deck Card'); K.pad(c, 24); c.cornerRadius = 32; K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, 'border')); K.fixW(c, o.w || 380);
  const top = K.row(8, 'Top'); const nm = await K.t(o.name || 'Krenko Goblins', 'heading/h5', K.v(mode, 'text'), { name: 'Name' }); h.add(top, nm); nm.layoutGrow = 1;
  h.add(top, await K.pill('Commander', mode, 'neutral', { dot: false })); h.add(c, top); h.fillW(top);
  const pct = o.pct == null ? 0.64 : o.pct; const tw = (o.w || 380) - 48; const track = h.box(tw, 6, [K.c(K.v(mode, 'hover'))], 3, 'Progress');
  const bar = h.rect(Math.max(2, Math.round(tw * pct)), 6, [K.c(K.v(mode, 'accent'))], 3); bar.name = 'Owned'; track.appendChild(bar);
  h.add(c, track, await K.t(Math.round(pct * 100) + ' / 100 cards owned · 36 to buy', 'mono/caption', K.v(mode, 'faint'), { name: 'Meta' })); return c; };

section({ name: '15 · Admin', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('15 · Admin'); const b = K.board('Admin', 2000);
  h.add(b, await K.head('15 · Components', 'Admin', 'AdminShell, inbox, KPIs and the Magic collection. Admin is dark only in code and uses drift greys (#050505, #111, #222); here they map to the semantic tokens (F-3).'));
  await K.set(b, 'Admin Sidebar', 'AdminShell.tsx sidebar. Active = current section. Unread count on Inbox.', [['Active', ['Inbox', 'KPIs', 'Magic']]], (p, m) => K.sidebar(p.Active, m));
  await K.set(b, 'Admin Header', 'AdminShell.tsx header (h-20): title, search, user with online dot.', [], (p, m) => K.adminHeader(m));
  await K.set(b, 'Inbox Row', 'InboxWorkspace.tsx row. Selected = open message (accent bar). Hover reveals archive / delete.', [['State', ['Default', 'Unread', 'Selected', 'Hover']]], (p, m) => K.inboxRow(p.State, m));
  await K.set(b, 'Message Pane', 'Inbox detail pane: toolbar, sender, message box, Reply.', [], (p, m) => K.messagePane(m));
  await K.set(b, 'KPI Card', 'KpiCard.tsx: icon chip, value, trend, sparkline.', [['Trend', ['Up', 'Down', 'Flat']]], (p, m) => K.kpiCard(p.Trend, m));
  await K.set(b, 'Login Card', 'admin/login: magic-link sign in. Sent and Error states.', [['State', ['Default', 'Sent', 'Error']]], (p, m) => K.loginCard(p.State, m));
  await K.set(b, 'Card Tile', 'PoolCardTile: card art, mana, tags, note, quantity stepper.', [], (p, m) => K.cardTile(m));
  await K.set(b, 'Deck Card', 'DeckList card with the ownership progress bar.', [], (p, m) => K.deckCard(m));
  await K.set(b, 'Quantity Stepper', 'Card count stepper.', [], (p, m) => K.stepper(m));
  await K.set(b, 'Kbd', 'Keyboard hint (<kbd>).', [], (p, m) => K.kbd('/', m));
  return h.place(s, b); } });
