// 32 · Admin message — /admin/[id]: redirects to /admin?status=all&id=…, so this is the inbox with one message open and the delete confirm. Dark only.
section({ name: '32 · Admin message', page: PG.T, run: async () => T.board('32 · Admin message', async (w, mode) => T.adminFrame(w, mode, 'Inbox', 'Inbox', 'Message from Anna Schmidt · status: all', async (main, iw) => {
  const D = T.D(w); const M = T.MODE(mode);
  const confirm = K.col(14, 'Delete confirm'); K.pad(confirm, 20); confirm.cornerRadius = 16; confirm.fills = [K.c(K.v(mode, 'danger'), 0.05)]; K.s(confirm, K.v(mode, 'danger-border'), 1, 0.3); K.fixW(confirm, D ? iw - 436 : iw);
  h.add(confirm, await K.t('Delete this message for good?', 'body/sm-strong', K.v(mode, 'text')), await K.t('This cannot be undone.', 'body/sm', K.v(mode, 'sub')));
  const act = K.row(12, 'Actions'); h.add(act, await K.btn('Destructive', 'sm', mode, 'Yes, delete', { noIcon: true }), await K.btn('Secondary', 'sm', mode, 'Cancel', { noIcon: true })); h.add(confirm, act);
  const pane = await T.use('Message Pane', { Mode: M }, null, () => K.messagePane(mode, D ? iw - 436 : iw));
  if (!D) { h.add(main, await K.link('Arrow', 'Default', mode, 'Back to inbox'), pane, confirm); T.size(pane, iw); return; }
  h.add(main, await T.tabs('Segmented', mode, 0));
  const split = K.row(16, 'Split'); split.counterAxisAlignItems = 'MIN'; h.add(main, split); h.add(split, await T.inboxList(mode, 420, 4));
  const right = K.col(16, 'Detail'); h.add(right, pane, confirm); T.size(pane, iw - 436); h.add(split, right); }), { route: '/admin/[id]', light: false }) });
