// 16 · Feedback — alert, toast, modal, tooltip, skeleton, empty state, progress.
K.toast = async (tone, mode) => { const [f, t, ic] = TONE_ALERT[tone]; const a = K.row(12, 'Toast'); a.counterAxisAlignItems = 'MIN'; K.pad(a, 16); a.cornerRadius = 12;
  K.f(a, K.v(mode, 'card')); K.s(a, K.v(mode, 'border')); await K.fx(a, 'shadow/popover'); K.fixW(a, 380);
  h.add(a, await K.icon(ic, K.v(mode, t), 20)); const x = K.col(4, 'Text');
  const copy = { Success: ['Message archived', 'Undo within 10 seconds.'], Danger: ['Delete failed', 'The message is still in the inbox.'], Info: ['Deck imported', '64 cards, 41 owned.'] }[tone];
  h.add(x, await K.t(copy[0], 'body/sm-strong', K.v(mode, 'text'), { name: 'Title' }), await K.t(copy[1], 'body/sm', K.v(mode, 'sub'), { w: 268, name: 'Body' })); K.grow(a, x);
  h.add(a, await K.icon('x', K.v(mode, 'faint'), 16)); return a; };
K.modal = async (kind, mode) => { const d = kind === 'Destructive'; const c = K.col(16, 'Modal'); K.pad(c, 32); c.cornerRadius = 24; K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, 'border'));
  await K.fx(c, 'shadow/modal'); K.fixW(c, 480);
  const top = K.row(12, 'Title row'); const t = await K.t(d ? 'Delete this message?' : 'Import deck', 'heading/h3', K.v(mode, 'text'), { name: 'Title' }); h.add(top, t); t.layoutGrow = 1;
  h.add(top, await K.icon('x', K.v(mode, 'faint'), 20)); h.add(c, top); h.fillW(top);
  h.add(c, await K.t(d ? 'The message from Anna Schmidt goes away for good. You cannot undo this.' : 'Paste a decklist. One card per line, with the count first.', 'body/md', K.v(mode, 'sub'), { w: 416, name: 'Body' }));
  const act = K.row(12, 'Actions'); act.primaryAxisAlignItems = 'MAX'; h.add(act, await K.btn('Secondary', 'md', mode, 'Cancel', { noIcon: true }), await K.btn(d ? 'Destructive' : 'Brand', 'md', mode, d ? 'Yes, delete' : 'Import', { noIcon: true }));
  h.add(c, act); h.fillW(act); return c; };
K.tooltip = async (placement, mode) => { const c = K.col(0, 'Tooltip'); c.counterAxisAlignItems = 'CENTER';
  const bub = K.row(0, 'Bubble'); K.pad(bub, 10, 6); bub.cornerRadius = 8; K.f(bub, K.v(mode, 'cta-bg')); await K.fx(bub, 'shadow/popover');
  h.add(bub, await K.t('Copy install command', 'body/xs', K.v(mode, 'cta-text'), { name: 'Label' }));
  const tip = K.svg(placement === 'Top' ? '<path d="M0 0 L12 0 L6 6 Z" fill="#000000" stroke="none"/>' : '<path d="M0 6 L12 6 L6 0 Z" fill="#000000" stroke="none"/>', K.v(mode, 'cta-bg'), 12, 6, 0, 'Arrow');
  if (placement === 'Top') h.add(c, bub, tip); else h.add(c, tip, bub); return c; };
K.skeleton = async (kind, mode) => { const sk = (w, hh, r) => { const x = h.rect(w, hh, [K.c(K.v(mode, 'skeleton')), h.grad([[0, '#FFFFFF', 0], [0.5, '#FFFFFF', 0.06], [1, '#FFFFFF', 0]], 0)], r == null ? 6 : r); x.name = 'Block'; return x; };
  if (kind === 'Text') { const c = K.col(10, 'Skeleton'); h.add(c, sk(320, 14), sk(280, 14), sk(200, 14)); return c; }
  if (kind === 'Row') { const r = K.row(12, 'Skeleton'); K.pad(r, 20, 14); K.fixW(r, 420); const x = K.col(8, 'Lines'); h.add(x, sk(180, 12), sk(300, 10)); h.add(r, sk(28, 28, 8), x); return r; }
  const c = K.card(mode, 400, 'Skeleton', 14, 28); h.add(c, sk(40, 40, 8), sk(120, 12), sk(280, 22), sk(340, 12), sk(300, 12)); return c; };
const EMPTY = { 'All caught up': ['check-circle', 'success', 'No unread messages. New ones land here.'], 'No matches': ['search', 'accent', 'Nothing fits this filter. Clear the search to see all.'],
  'Select a message': ['inbox', 'accent', 'Pick a message on the left to read it.'], 'No decks': ['layers', 'accent', 'No decks yet. Import a decklist to start.'] };
K.empty = async (kind, mode, w) => { const [ic, tone, body] = EMPTY[kind]; const c = K.col(14, 'Empty State'); c.counterAxisAlignItems = 'CENTER'; K.pad(c, 40); K.fixW(c, w || 420);
  const box = K.row(0, 'Icon box'); K.fix(box, 56, 56); box.cornerRadius = 16; box.primaryAxisAlignItems = 'CENTER'; box.counterAxisAlignItems = 'CENTER'; K.f(box, K.v(mode, tone), 0.1);
  h.add(box, await K.icon(ic, K.v(mode, tone === 'success' ? 'success-text' : 'accent-text'), 24));
  h.add(c, box, await K.t(kind, 'heading/h5', K.v(mode, 'text'), { name: 'Title' }), await K.t(body, 'body/sm', K.v(mode, 'sub'), { w: (w || 420) - 80, align: 'CENTER', name: 'Body' }));
  if (kind === 'No decks') h.add(c, await K.btn('Brand', 'sm', mode, 'Import deck'));
  return c; };
K.progress = async (value, mode) => { const c = K.col(8, 'Progress'); const W = 320; const top = K.row(8, 'Top');
  const l = await K.t('Ownership', 'label/sm', K.v(mode, 'faint')); h.add(top, l); l.layoutGrow = 1; h.add(top, await K.t(value + ' %', 'mono/caption', K.v(mode, +value === 100 ? 'success-text' : 'text'), { name: 'Value' }));
  const track = h.box(W, 6, [K.c(K.v(mode, 'hover'))], 3, 'Track'); const bar = h.rect(Math.max(2, W * value / 100), 6, [K.c(K.v(mode, +value === 100 ? 'success' : 'accent'))], 3); bar.name = 'Bar'; track.appendChild(bar);
  h.add(c, top, track); h.fillW(top); K.fixW(c, W); return c; };

section({ name: '16 · Feedback', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('16 · Feedback'); const b = K.board('Feedback', 1800);
  h.add(b, await K.head('16 · Components', 'Feedback', 'Status messages, overlays and loading. Tone colours stay soft: an 8 % tint, a 30 % border and the tone text. Toast, tooltip and skeleton are targets for the rebuild (F-6).'));
  await K.set(b, 'Alert', 'Inline alert. Danger = contact submit error and admin delete confirm. Info = login link sent.', [['Tone', ['Info', 'Success', 'Warning', 'Danger']]],
    (p, m) => K.alert(p.Tone, m, 480, { Info: 'Login link sent', Success: 'Message sent', Warning: '3 cards missing', Danger: 'Message not sent' }[p.Tone], { Info: 'If that address may sign in, a link is on its way.', Success: 'Redirecting to home in 3s.', Warning: 'Krenko Goblins needs 3 more cards for the main deck.', Danger: 'The server did not answer. Try again.' }[p.Tone]));
  await K.set(b, 'Toast', 'Short confirmation, bottom right, 5 s. One at a time.', [['Tone', ['Success', 'Danger', 'Info']]], (p, m) => K.toast(p.Tone, m));
  await K.set(b, 'Modal', 'Dialog on the overlay scrim (overlay at 60 %). Destructive = delete confirm.', [['Kind', ['Dialog', 'Destructive']]], (p, m) => K.modal(p.Kind, m));
  await K.set(b, 'Tooltip', 'Short hint on hover and focus. Inverted colours (cta-bg).', [['Placement', ['Top', 'Bottom']]], (p, m) => K.tooltip(p.Placement, m));
  await K.set(b, 'Skeleton', 'Loading placeholder with the shimmer gradient (animate-shimmer).', [['Kind', ['Card', 'Row', 'Text']]], (p, m) => K.skeleton(p.Kind, m));
  await K.set(b, 'Empty State', 'Inbox and Magic empty states.', [['Kind', ['All caught up', 'No matches', 'Select a message', 'No decks']]], (p, m) => K.empty(p.Kind, m));
  await K.set(b, 'Progress', 'Progress bar: deck ownership, contact redirect.', [['Value', ['25', '60', '100']]], (p, m) => K.progress(p.Value, m));
  return h.place(s, b); } });
