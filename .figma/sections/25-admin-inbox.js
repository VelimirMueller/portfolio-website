// 25 · Admin inbox — /admin (InboxWorkspace.tsx): status filter, list + detail split view. Dark only, as in code.
const INBOX = [['Selected', 'Anna Schmidt', 'Project inquiry', 'Hi Velimir, we are looking for a product engineer for…', '09:41'], ['Unread', 'Jonas Weber', 'Design system audit', 'Could you look at our Figma library and the Tailwind setup?', '08:12'],
  ['Unread', 'Mara Klein', 'Speaking slot', 'We would love a talk about MCP servers at our meetup.', 'Yesterday'], ['Hover', 'Tom Becker', 'Freelance availability', 'Are you free for a 3-month contract from January?', 'Mon'],
  ['Default', 'Lea Hoffmann', 'Thanks!', 'The demo helped a lot. We will be in touch.', 'Sun'], ['Default', 'Recruiting Bot', 'Opportunity', 'Exciting role at a fast-growing startup…', 'Sat']];
T.inboxList = async (mode, lw, n) => { const list = K.col(0, 'List'); list.cornerRadius = 24; list.clipsContent = true; K.f(list, K.v(mode, 'card')); K.s(list, K.v(mode, 'border')); K.fixW(list, lw);
  const tb = K.row(12, 'Toolbar'); K.pad(tb, 20, 12); h.add(tb, await T.use('Checkbox', { Checked: 'Off', State: 'Default', Mode: T.MODE(mode) }, { Label: 'Select all' }, () => K.check('Checkbox', 'Off', 'Default', mode)));
  const sp = K.spacer(); h.add(tb, sp); sp.layoutGrow = 1; h.add(tb, T.size(await T.use('Search', { State: 'Default', Mode: T.MODE(mode) }, null, () => K.search('Default', mode)), Math.min(220, lw - 180)));
  h.add(list, tb); h.fillW(tb);
  for (const [st, nm, sub, pre, tm] of INBOX.slice(0, n || 6)) { const r = await T.use('Inbox Row', { State: st, Mode: T.MODE(mode) }, { Name: nm, Subject: sub, Preview: pre, Time: tm }, () => K.inboxRow(st, mode, { name: nm, subject: sub, preview: pre, time: tm, w: lw }));
    h.add(list, r); h.fillW(r); }
  return list; };
section({ name: '25 · Admin inbox', page: PG.T, run: async () => T.board('25 · Admin inbox', async (w, mode) => T.adminFrame(w, mode, 'Inbox', 'Inbox', 'Messages from the contact form', async (main, iw) => {
  const D = T.D(w); h.add(main, await T.tabs('Segmented', mode, 1));
  if (!D) { h.add(main, await T.inboxList(mode, iw, 5)); return; }
  const split = K.row(16, 'Split'); split.counterAxisAlignItems = 'MIN'; h.add(main, split);
  h.add(split, await T.inboxList(mode, 420)); const pane = await T.use('Message Pane', { Mode: T.MODE(mode) }, null, () => K.messagePane(mode, iw - 436)); h.add(split, pane); T.size(pane, iw - 436); }), { route: '/admin', light: false }) });
