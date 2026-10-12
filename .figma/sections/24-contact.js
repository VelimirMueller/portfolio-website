// 24 · Contact — /contact (ContactContent.tsx): full-page art, narrow column (max-w-3xl), form card, three glass contact tiles.
section({ name: '24 · Contact', page: PG.T, run: async () => T.board('24 · Contact', async (w, mode) => {
  const D = T.D(w), M = T.MODE(mode); const f = T.frame('Contact · ' + w, w, mode);
  const bg = await K.panel(K.art('contact', mode), w, D ? 1480 : 1700, { name: 'Backdrop', pad: 0, gap: 0, r: 0, stroke: false, align: 'MIN', mode,
    over: [h.grad([[0, K.m(mode) === 'light' ? '#FAFAFA' : '#09090B', 0.2], [1, K.m(mode) === 'light' ? '#FAFAFA' : '#09090B', 0.85]], 90)] });
  h.add(f, bg); h.add(bg, await T.nav(w, mode, 'None'));
  const NW = D ? 768 : w - 32; const col = K.col(D ? 40 : 28, 'Column'); col.paddingTop = D ? 96 : 48; col.paddingLeft = col.paddingRight = (w - NW) / 2; K.fixW(col, w); h.add(bg, col);
  h.add(col, await T.header(w, mode, 'Get In Touch', 'CONTACT.'),
    await K.t('Open for product-engineering roles where the brief runs from requirements through UX, frontend and backend to cloud deployment. Contract or full-time.', 'body/lg', K.v(mode, 'sub'), { w: NW }));
  const form = await T.use('Contact Form', { State: 'Default', Mode: M }, null, () => K.contactForm('Default', mode, NW)); h.add(col, form); T.size(form, NW);
  const tiles = h.AL(D ? 'HORIZONTAL' : 'VERTICAL', { name: 'Contact tiles', itemSpacing: 12 }); const tw = D ? Math.floor((NW - 24) / 3) : NW;
  for (const [ic, l, v] of [['mail', 'EMAIL', 'Get in touch'], ['linkedin', 'LINKEDIN', 'Connect'], ['github', 'GITHUB', 'View code']]) {
    const t = K.row(12, l); K.pad(t, 16); t.cornerRadius = 12; await K.glassSkin(t, mode, 'inner'); K.fixW(t, tw);
    const x = K.col(2, 'Text'); h.add(x, await K.t(l, 'label/sm', K.v(mode, 'faint')), await K.link('Arrow', 'Default', mode, v)); h.add(t, await T.iconBox(mode, ic), x); h.add(tiles, t); }
  h.add(col, tiles);
  h.add(f, await T.footer(w, mode)); return f; }, { route: '/contact' }) });
