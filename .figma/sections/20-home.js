// 20 · Home — / (HomeContent.tsx): 12-column bento grid. Hero 8 + MCP highlight 4, then stack / quote / services, then Synthwerk.
section({ name: '20 · Home', page: PG.T, run: async () => T.board('20 · Home', async (w, mode) => {
  const D = T.D(w), CW = T.CW(w), M = T.MODE(mode); const f = T.frame('Home · ' + w, w, mode);
  h.add(f, await T.nav(w, mode, 'Home')); const body = T.body(w, 16, D ? 72 : 32); h.add(f, body);
  const r1 = K.wrap(CW, 16, 'Row · hero'); h.add(body, r1);
  const hw = T.span(w, 8), pad = D ? 48 : 24;
  const hero = await K.panel(K.art('hero', mode), hw, D ? 640 : 640, { name: 'Hero card', pad, gap: 16, mode, align: 'MAX' });
  const rule = h.rect(48, 2, [K.c('brand/fill-strong')]); rule.name = 'Rule';
  const desc = K.row(0, 'Description'); desc.paddingLeft = 16; desc.strokes = [K.c(K.v(mode, 'border-strong'))]; desc.strokeLeftWeight = 2; desc.strokeTopWeight = desc.strokeRightWeight = desc.strokeBottomWeight = 0;
  h.add(desc, await K.t('Full lifecycle: requirements, UX, frontend, backend, infrastructure. Shipped at GALVANY: a lead-matching engine with 3–4× faster assignment.', 'body/md', K.v(mode, 'sub'), { w: Math.min(620, hw - 2 * pad - 18) }));
  const ctas = K.row(12, 'CTAs'); h.add(ctas, await K.btn('Brand', 'md', mode, 'View Projects'), await K.btn('Outline', 'md', mode, 'Contact', { noIcon: true }));
  h.add(hero, await T.use('Badge', { Tone: 'Success', Mode: M }, { Label: 'AVAILABLE FOR PROJECTS' }, () => K.pill('Available for projects', mode, 'success')),
    await K.t('VELIMIR\nMÜLLER.', D ? 'display/xl' : 'display/sm', K.v(mode, 'text'), { w: hw - 2 * pad, name: 'H1' }), rule,
    await K.t('Senior Product Engineer', 'heading/h4', K.v(mode, 'text')), await K.t('Full-Stack · Infrastructure · Agent Tooling', 'mono/caption', K.v(mode, 'accent-text')), desc, ctas);
  h.add(r1, hero);
  const side = K.col(16, 'Highlight'); const sw = T.span(w, 4);
  const hl = await T.use('Bento Card', { Backdrop: 'Art', State: 'Default', Mode: M }, { Eyebrow: 'OPEN SOURCE', Title: 'MCP server for AI coding agents.', Body: '81 tools. About 40 % fewer tokens on a 9-task benchmark.' }, () => K.bento('Art', 'Default', mode));
  h.add(side, hl); try { hl.resize(sw, D ? 564 : 380); } catch (e) {}
  h.add(side, await T.use('Terminal Chip', { Mode: M }, null, () => K.terminal(mode))); h.add(r1, side);

  const r2 = K.wrap(CW, 16, 'Row · cards'); h.add(body, r2); const cw = T.span(w, 4);
  const stack = T.card(w, mode, cw, 'Tech stack', 14, 24);
  h.add(stack, await K.t('ENGINEERING DNA', 'label/eyebrow', K.v(mode, 'accent-text')), await K.t('The stack fits the job.', 'heading/h3', K.v(mode, 'text'), { w: cw - 48 }));
  const tg = K.wrap(cw - 48, 8, 'Tiles'); const tw = Math.floor((cw - 48 - 8) / 2);
  for (const [cat, lab] of [['FRONTEND', 'Next.js · React'], ['LANGUAGE', 'TypeScript'], ['BACKEND', 'Supabase · Node'], ['DATA', 'Postgres'], ['INFRA', 'Vercel · Azure'], ['AI', 'MCP · Agents'], ['DESIGN', 'Figma'], ['QUALITY', 'Jest · Playwright']]) {
    const t = K.col(2, lab); K.pad(t, 12); t.cornerRadius = 8; K.f(t, K.v(mode, 'bg')); K.s(t, K.v(mode, 'border')); K.fixW(t, tw);
    h.add(t, await K.t(cat, 'label/sm', K.v(mode, 'faint')), await K.t(lab, 'body/sm-strong', K.v(mode, 'text'))); h.add(tg, t); }
  const stat = K.row(8, 'System status'); h.add(stat, await K.t('SYSTEM STATUS', 'label/sm', K.v(mode, 'faint')), K.dot(6, K.v(mode, 'success')), await K.t('Operational', 'mono/caption', K.v(mode, 'success-text')));
  h.add(stack, tg, stat); h.add(r2, stack);
  h.add(r2, T.size(await T.use('Quote Card', { Mode: M }, null, () => K.quote(mode)), cw));
  h.add(r2, T.size(await T.use('Bento Card', { Backdrop: 'Plain', State: 'Default', Mode: M }, { Eyebrow: 'SERVICES', Title: 'End-to-End', Body: 'Requirements → UX/UI → shipped product. One person, no translation losses.' }, () => K.bento('Plain', 'Default', mode)), cw));

  const sy = await K.panel(K.art('synthwerk', mode), CW, D ? 380 : 440, { name: 'Synthwerk', pad: D ? 48 : 24, gap: 14, mode });
  h.add(sy, await T.use('Badge', { Tone: 'Flagship', Mode: M }, { Label: 'OPEN SOURCE' }, () => K.pill('Open source', mode, 'flagship')),
    await K.t('SYNTHWERK.', D ? 'heading/h1' : 'display/sm', K.v(mode, 'text')), await K.t('AI services you run yourself. Chat, vision and a page builder, each in its own repo, one map.', 'body/md', K.v(mode, 'sub'), { w: Math.min(640, CW - 48) }),
    await K.link('External', 'Default', mode, 'The map on GitHub'));
  h.add(body, sy);
  h.add(f, await T.footer(w, mode)); return f; }, { route: '/' }) });
