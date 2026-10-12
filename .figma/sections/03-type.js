// 02 · Type — the two families and every text style, each sample set in its own style.
section({ name: '02 · Type', page: PG.F, run: async () => {
  await K.init(); const s = h.section('02 · Type'); const b = K.board('Type', 1600);
  h.add(b, await K.head('02 · Foundations', 'Type', 'Space Mono for display, headings, labels, buttons and numbers. Inter for running text, item titles and admin. Display is tight (leading 0.9, tracking -5 %).'));
  const fam = K.row(24, 'Families'); fam.counterAxisAlignItems = 'MIN';
  for (const [f, style, use, sample] of [['Space Mono', 'display/xl', 'Display · headings · labels · buttons · code · metrics', 'label/eyebrow'], ['Inter', 'heading/h2-sans', 'Body · item titles · forms · admin', 'body/lg']]) {
    const c = K.card('dark', 708, f, 14, 40); c.fills = [K.c('dark/card'), h.radial('#6366F1', 0.16, 0.9, 0.1)];
    h.add(c, await K.t('Aa', style, 'dark/text'), await K.t(f, 'heading/h3', 'dark/text'), await K.t(use, 'mono/md', 'dark/sub'),
      await K.t('ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 → · /', sample, 'dark/accent-text', { w: 620 })); h.add(fam, c); }
  h.add(b, fam);

  const list = K.col(0, 'Scale'); list.cornerRadius = 24; list.clipsContent = true; K.s(list, 'dark/border'); h.add(b, list); K.fixW(list, 1440);
  const rows = [['display/xl', 'VELIMIR MÜLLER.', 'Home hero H1'], ['display/sm', 'PROFILE.', 'Display and page H1 on mobile'], ['heading/h1', 'OFFER.', 'Page H1 (SectionHeader)'],
    ['heading/h2', 'Services in Detail', 'Section title'], ['heading/h2-sans', 'Real-World Work', 'Section title on projects'], ['heading/h3', 'MCP server for AI coding agents.', 'Card title'],
    ['heading/h4', 'CRM Dashboard Interface', 'Item title, project card'], ['heading/h5', 'When visitors come', 'Admin panel heading'],
    ['body/lg', 'Full lifecycle: requirements, UX, frontend, backend, infrastructure.', 'Lead text'], ['body/md', 'Good frontend does not start with code, but with understanding the business.', 'Body'],
    ['body/sm', 'Built with Next.js, Supabase & Vercel.', 'Card body'], ['body/sm-strong', 'Anna Schmidt', 'Names, admin nav'], ['body/xs', 'We only use your message to answer you.', 'Help text, fine print'],
    ['label/eyebrow', 'End-to-end engineering', 'Eyebrow'], ['label/sm', 'Available for projects', 'Pill, badge, admin label'], ['label/nav', 'Projects', 'Nav item, tab, chip'],
    ['label/nav-active', 'Home', 'Active nav item'], ['label/button-lg', 'Check Availability', 'Button lg'], ['label/button', 'View Projects', 'Button md'], ['label/button-sm', 'Contact', 'Button sm'],
    ['mono/md', '$ npm install vlm-code-context-mcp', 'Code, meta, input text'], ['mono/caption', '✗ Please enter a valid email address', 'Caption, validation'],
    ['metric/xl', '500%', 'Case-study metric'], ['metric/lg', '1,284', 'Stat, KPI value']];
  let i = 0; for (const [st, sample, use] of rows) { const r = K.row(40, st); K.pad(r, 36, 24); K.f(r, i++ % 2 ? 'dark/bg' : 'dark/card');
    const d = K.text[st] || {}; const spec = (d.family || '') + ' ' + (d.style || '') + ' · ' + (d.size || '') + (d.lineHeight ? ' / ' + d.lineHeight + ' %' : '') + (d.letterSpacing ? ' · ' + d.letterSpacing + ' %' : '');
    const meta = K.col(4, 'Meta'); h.add(meta, await K.t(st, 'label/nav-active', 'dark/accent-text'), await K.t(spec, 'mono/caption', 'dark/sub', { w: 320 }), await K.t(use, 'body/xs', 'dark/faint', { w: 320 }));
    K.fixW(meta, 340); h.add(r, meta, await K.t(sample, st, 'dark/text', { w: 980 })); h.add(list, r); h.fillW(r); }
  return h.place(s, b); } });
