// 21 · About — /about (AboutContent.tsx): profile header, then two stages (glass over art): 01 profile (summary, stats,
// skills.json) and 02 experience log.
section({ name: '21 · About', page: PG.T, run: async () => T.board('21 · About', async (w, mode) => {
  const D = T.D(w), CW = T.CW(w), M = T.MODE(mode); const f = T.frame('About · ' + w, w, mode);
  h.add(f, await T.top(w, mode, 'about', 'About', 'Velimir Müller', 'PROFILE.'));
  const body = T.body(w, D ? 112 : 80, D ? 16 : 8); h.add(f, body);
  const st1 = T.stage(w, 16, 'Section · profile'); h.add(body, st1); h.add(st1, await T.divider(w, mode, '01', '02', 'Profile', 'Role, scope and focus', 'strip-flagship-1'));
  const r = K.wrap(CW, 16, 'Row · summary'); h.add(st1, r);
  const sw = T.span(w, 8); const sum = await T.card(w, mode, sw, 'Summary', 20);
  h.add(sum, await K.t('THE SHORT VERSION', 'label/eyebrow', K.v(mode, 'accent-text')),
    await K.t('Senior Product Engineer. I work the full stretch from stakeholder interview to production deployment: requirements, UX/UI, frontend, backend and infrastructure. Shipped four products; currently at GALVANY.', 'body/md', K.v(mode, 'sub'), { w: sw - 64 }));
  const stats = K.row(D ? 48 : 20, 'Stats'); for (const [v, l] of [['4', 'SHIPPED PRODUCTS'], ['E2E', 'REQ → DEPLOYMENT'], ['UX', 'UI & BRANDING']])
    h.add(stats, await T.use('Stat', { Size: 'md', Mode: M }, { Value: v, Label: l }, async () => { const x = await K.stat('md', mode); await K.texts(x, { Value: v, Label: l }); return x; }));
  h.add(sum, K.line(sw - 64, K.v(mode, 'border')), stats); h.add(r, sum);
  const kw = T.span(w, 4); const sk = await T.card(w, mode, kw, 'skills.json', 6); K.f(sk, K.v(mode, 'inset'));
  const bar = K.row(8, 'Title bar'); for (const t of ['danger', 'warning', 'success']) h.add(bar, K.dot(8, K.v(mode, t))); h.add(bar, await K.t('skills.json', 'mono/caption', K.v(mode, 'faint'))); h.add(sk, bar);
  for (const [k, v] of [['"role"', '"Product Engineer"'], ['"frontend"', '["Next.js", "React", "Vue"]'], ['"backend"', '["Supabase", "Node", "Postgres"]'], ['"infra"', '["Vercel", "Azure", "Docker"]'], ['"ai"', '["MCP", "agents", "RAG"]'], ['"design"', '["Figma", "design systems"]']]) {
    const l = K.row(8, k); h.add(l, await K.t(k + ':', 'mono/md', K.v(mode, 'group-lab-text')), await K.t(v, 'mono/md', K.v(mode, 'success-text'), { w: kw - 170 })); l.counterAxisAlignItems = 'MIN'; h.add(sk, l); }
  h.add(r, sk);
  await T.backdrop(st1, w, mode, 'site-svc-requirements', 'right');
  const st2 = T.stage(w, 16, 'Section · experience'); h.add(body, st2); h.add(st2, await T.divider(w, mode, '02', '02', 'Experience', 'Experience log', 'strip-flagship-2'));
  const log = await T.glass(w, mode, CW, 'Experience log', 24); h.add(log, await K.slash('Experience log', mode));
  const items = [['Current', 'Senior Software Engineer — Full-Stack / Product', 'GALVANY', 'Feb 2025 – Present', 'Lead-matching engine and seller import. 3–4× faster assignment.'],
    ['Past', 'Software Engineer — Frontend', 'DEMOS plan GmbH', 'Oct 2021 – Jan 2025', 'Participation platform for public planning. Enterprise SaaS.'],
    ['Past', 'Frontend Engineer / Product Engineer', 'Housy GmbH', 'Mar 2021 – Oct 2021', 'Startup product from zero to first customers.'],
    ['Past', 'Specialist', 'Zalando SE', 'Apr 2017 – Mar 2019', 'E-commerce operations at scale.']];
  for (const [st, t, c, d, b] of D ? items : items.slice(0, 3)) { const i = await T.use('Timeline Item', { State: st, Mode: M }, { Title: t, Company: c, Date: d, Body: b }, async () => { const x = await K.timeline(st, mode); await K.texts(x, { Title: t, Company: c, Date: d, Body: b }); return x; });
    h.add(log, i); if (!D) T.size(i, T.inner(w)); }
  h.add(st2, log); await T.backdrop(st2, w, mode, 'site-svc-delivery', 'left');
  h.add(f, await T.footer(w, mode)); return f; }, { route: '/about' }) });
