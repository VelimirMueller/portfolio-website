// 20 · Home — / (HomeContent.tsx, site rework): hero and "At a glance", then five numbered sections. Each section is a
// stage: a section divider and liquid-glass panels over a large brand render (vm-brand B-48). Copy = src/locales/en.json "home".
const HOME = {
  stats: [['3–4×', 'Faster lead assignment at GALVANY'], ['81', 'Tools in code-context-mcp'], ['~40%', 'Median token reduction, 9-task benchmark'], ['2', 'Independent reviews per change']],
  sections: [['practice', '01', 'Practice', 'Three areas, one owner', 'strip-flagship-1', 'site-svc-requirements', 'right'],
    ['experience', '02', 'Experience', 'End to end, across roles', 'strip-flagship-2', 'site-svc-delivery', 'left'],
    ['flagships', '03', 'Flagships', 'Products I ship in public', 'strip-flagship-3', 'site-svc-ux', 'right'],
    ['system', '04', 'Delivery system', 'How changes reach production', 'strip-flagship-4', 'site-svc-stack', 'left'],
    ['capabilities', '05', 'Capabilities', 'Stack in production', 'strip-flagship-5', 'site-svc-frontend', 'right']],
  practice: [['Product engineering', 'Requirements, UX and UI, full-stack code, tests and rollout. One owner from ticket to release.', 'Next.js · Laravel · Vue'],
    ['AI tooling', 'Agent pipelines with gated reviews, MCP servers and local models. Models propose, rules decide.', 'MCP · Claude Code · MLX'],
    ['Platform', 'Vercel, Supabase, AWS and Azure on Terraform. CI that blocks a bad merge before review.', 'Terraform · Docker · CI']],
  own: [['Plan', 'Requirements, architecture and UX for whole applications. A business problem becomes a scoped plan.'], ['Build', 'Features across frontend and backend, covered by unit, E2E and visual regression tests.'],
    ['Run', 'Infrastructure on AWS and Azure with Terraform. CI/CD, monitoring and releases.'], ['Improve', 'Rollout with the team, then measure in production and iterate.']],
  roles: [['GALVANY', 'Senior Software Engineer, Full-Stack / Product', '2025 – now', true], ['DEMOS plan GmbH', 'Software Engineer, Frontend', '2021 – 2025'],
    ['Housy GmbH · bewerbermappe.com', 'Frontend / Product Engineer', '2021'], ['Zalando SE', 'Specialist, e-commerce', '2017 – 2019']],
  flagships: [['synthwerk', 'SYNTHWERK.', 'In development · M0', 'Modular AI services', 'AI services you run yourself: chat, image labels and a page builder, one repository per role.', 'The map on GitHub'],
    ['code-context-mcp', 'CODE CONTEXT.', 'Released · npm v2.11', 'MCP server for AI coding agents', 'Indexes a codebase into structured context for agents. 81 tools, persistent sprint and retro memory.', 'View on GitHub'],
    ['claude-skills', 'CLAUDE SKILLS.', 'Maintained', 'Skills for frontend projects', 'Audit-aware Claude Code skills with conventions, a contribution guide and release notes.', 'View on GitHub']],
  pipeline: [['Ticket', 'Scope and acceptance. Owner: me.'], ['Spec', 'A model drafts, I approve.'], ['Build', 'Models implement in an isolated worktree.'], ['Review', 'Two independent models. Both must approve.', true], ['Ship', 'PR, release check, merge. Owner: me.']],
  controls: [['Gated reviews', 'A missing review vote blocks the pull request.'], ['Rule-based releases', 'Fixed rules give GO or HOLD. A model writes notes, never the verdict.'],
    ['Persistent memory', 'Decisions, pitfalls and dependencies outlive every session.'], ['One versioned setup', 'The tooling is pinned, logged and health-checked with one command.']],
  stack: [['Frontend', 'Next.js · React · Vue 3 · Nuxt · TypeScript · Tailwind'], ['Backend', 'Node.js · Go · FastAPI · Laravel · Quarkus'], ['Platform', 'Vercel · Supabase · AWS · Azure · Terraform · Docker'],
    ['Quality', 'Vitest · Jest · Playwright · Pytest · visual regression'], ['AI', 'Claude Code · MCP · LangGraph · ONNX · MLX']],
};

// ---- shared page blocks (also used by about, services, projects) --------------------------
// Glass panel with a `// LABEL` and a grid of Numbered Card instances. items: [title, text, tags?]
T.cardGrid = async (w, mode, label, items, cols, o) => { o = o || {}; const M = T.MODE(mode); const p = await T.glass(w, mode, o.cw, label, 20); h.add(p, await K.slash(label, mode));
  const g = T.cols(w, T.inner(w, o.cw), cols, 16, o.mobileCols); h.add(p, g.g);
  for (let k = 0; k < items.length; k++) { const [title, text, tags] = items[k]; const idx = String(k + 1).padStart(2, '0');
    const i = await T.use('Numbered Card', { Mode: M }, { Index: idx, Title: title, Body: text, Tags: (tags || '').toUpperCase() }, () => K.numCard(mode, { index: idx, title, text, tags: tags ? tags.toUpperCase() : false, w: g.cw }));
    if (!tags && i.findOne) { const t = i.findOne(x => x.name === 'Tags'); if (t) t.visible = false; }
    h.add(g.g, i); T.size(i, g.cw); }
  return p; };
// Status Row instance list inside a glass panel. rows: [label, value, meta, kind]
T.rows = async (w, mode, label, rows, o) => { o = o || {}; const M = T.MODE(mode), V = T.D(w) ? 'Desktop' : 'Mobile'; const p = await T.glass(w, mode, o.cw, label, 10); h.add(p, await K.slash(label, mode));
  for (const [l, v, meta, kind] of rows) { const tx = { Label: l, Value: kind === 'Stack' ? v.toUpperCase() : v }; if (meta) tx.Meta = meta;
    const i = await T.use('Status Row', { Kind: kind, Viewport: V, Mode: M }, tx, () => K.statusRow(kind, V, mode, { label: l, value: tx.Value, meta, w: T.inner(w, o.cw) }));
    h.add(p, i); T.size(i, T.inner(w, o.cw)); }
  return p; };
T.textLink = async (mode, label) => K.link('Arrow', 'Default', mode, label);

// ---- hero ---------------------------------------------------------------------
T.homeHero = async (w, mode) => { const D = T.D(w), CW = T.CW(w), M = T.MODE(mode), dark = K.m(mode) === 'dark'; const HH = D ? 560 : 700, hp = D ? 56 : 28, tw = D ? 600 : CW - 2 * hp;
  const hero = K.col(0, 'Hero'); K.fix(hero, CW, HH); K.pad(hero, hp); hero.primaryAxisAlignItems = 'SPACE_BETWEEN'; hero.cornerRadius = 24; hero.clipsContent = true; K.s(hero, K.v(mode, 'border'));
  // Dark: full-bleed art faded out under the text column. Light: the art sits in an inset window (vm-brand B-6).
  if (dark) await h.imgFill(hero, 'website/v2/flagship-base.png', { under: [K.c('legacy/0a0a0a')],
    over: [h.grad(D ? [[0, '#0A0A0B', 0.96], [0.4, '#0A0A0B', 0.82], [0.62, '#0A0A0B', 0]] : [[0, '#0A0A0B', 0.55], [0.5, '#0A0A0B', 0.92], [1, '#0A0A0B', 0.96]], D ? 0 : 90)] });
  else { K.f(hero, 'light/card'); if (D) { const win = await h.img('website/v2/flagship-base.png', Math.round(CW * 0.46), HH - 48, { r: 16, name: 'Art window' }); K.s(win, 'light/border'); h.absAt(hero, win, CW - 24 - win.width, 24); } }
  const glow = figma.createEllipse(); glow.name = 'Glow'; glow.resize(Math.round(CW * 0.3), HH / 2); glow.fills = [h.radial('#6366F1', 0.2)]; h.absAt(hero, glow, Math.round(CW * 0.5), HH / 2);
  const top = K.col(0, 'Text');
  const gap = (n) => { const s = K.spacer(); s.resize(1, n); return s; };
  const tag = K.row(16, 'Tagline'); tag.counterAxisAlignItems = 'MIN'; const tk = K.tick(44); const tl = K.col(6, 'Lines');
  h.add(tl, await K.t('Product, platform and AI tooling. End to end.', 'body/lg', K.v(mode, 'text'), { w: tw - 60, name: 'Tagline' }), await K.t('FULL-STACK · PLATFORM · AI TOOLING', 'label/eyebrow', K.v(mode, 'accent-text'), { name: 'Sub' }));
  const tkw = K.col(0, 'Tick slot'); tkw.paddingTop = 12; h.add(tkw, tk); h.add(tag, tkw, tl);
  const desc = K.row(0, 'Description'); desc.paddingLeft = 16; desc.strokes = [K.c(K.v(mode, 'border-strong'))]; desc.strokeLeftWeight = 2; desc.strokeTopWeight = desc.strokeRightWeight = desc.strokeBottomWeight = 0;
  h.add(desc, await K.t('Requirements, UX, code and cloud infrastructure, owned by one engineer. Shipped at GALVANY (lead matching, 3–4× faster assignment), DEMOS (civic-tech platform) and bewerbermappe.com (press: BILD, Die Zeit, n-tv).', 'body/md', K.v(mode, 'sub'), { w: tw - 18 }));
  h.add(top, await T.use('Badge', { Tone: 'Success', Mode: M }, { Label: 'AVAILABLE FOR PROJECTS' }, () => K.pill('Available for projects', mode, 'success')), gap(36),
    await K.t('VM. / PRODUCT ENGINEER · BERLIN', 'label/eyebrow', K.v(mode, 'faint'), { name: 'Eyebrow' }), gap(12),
    await K.t('VELIMIR\nMÜLLER.', D ? 'display/xl' : 'display/sm', K.v(mode, 'text'), { w: tw, name: 'H1' }), gap(28), tag, gap(28), desc);
  const ctas = K.row(12, 'CTAs'); h.add(ctas, await K.btn(dark ? 'Primary' : 'Brand', 'md', mode, 'View projects'), await K.btn('Outline', 'md', mode, 'Contact', { noIcon: true }));
  h.add(hero, top, ctas);
  const stats = await T.glass(w, mode, CW, 'At a glance', 20); h.add(stats, await K.slash('At a glance', mode));
  const g = T.cols(w, T.inner(w), 4, D ? 20 : 12, 2); h.add(stats, g.g);
  for (const [v, l] of HOME.stats) { const i = await T.use('Glass Stat', { Mode: M }, { Value: v, Label: l.toUpperCase() }, () => K.glassStat(mode, { value: v, label: l.toUpperCase(), w: g.cw })); h.add(g.g, i); T.size(i, g.cw); }
  const c = K.col(16, 'Hero block'); h.add(c, hero, stats); return c; };

// ---- sections ---------------------------------------------------------------------
T.homeSection = async (w, mode, key) => { const D = T.D(w), CW = T.CW(w), M = T.MODE(mode), iw = T.inner(w); const [, idx, title, caption, strip, art, side] = HOME.sections.find(s => s[0] === key);
  const st = T.stage(w, 16, 'Section · ' + key); h.add(st, await T.divider(w, mode, idx, '05', title, caption, strip));
  if (key === 'practice') { h.add(st, await T.cardGrid(w, mode, 'Practice areas', HOME.practice, 3)); const l = K.col(0, 'Link slot'); l.paddingTop = 4; h.add(l, await T.textLink(mode, 'All services')); h.add(st, l); }
  if (key === 'experience') {
    h.add(st, await K.t('From frontend specialist to full-stack product engineer, across a corporate, a civic-tech SaaS and two startups. Today I plan, build and run whole applications, from the first requirement to production.', 'body/lg', K.v(mode, 'text'), { w: D ? 768 : CW, name: 'Intro' }));
    h.add(st, await T.cardGrid(w, mode, 'What I own', HOME.own, 4));
    const roles = await T.rows(w, mode, 'Roles', HOME.roles.map(([o, r, t, cur]) => [o, r, cur ? 'CURRENT · ' + t.toUpperCase() : t.toUpperCase(), cur ? 'Current' : 'Past']));
    const l = K.col(0, 'Link slot'); l.paddingTop = 14; h.add(l, await T.textLink(mode, 'Full experience log')); h.add(roles, l); h.add(st, roles); }
  if (key === 'flagships') for (let k = 0; k < HOME.flagships.length; k++) { const [art2, name, status, label, text, cta] = HOME.flagships[k];
    const p = await K.glass(mode, CW, name, 16, D ? 20 : 16); if (D) { p.layoutMode = 'HORIZONTAL'; K.fixW(p, CW); p.counterAxisAlignItems = 'MIN'; }
    const piw = CW - 2 * (D ? 20 : 16), aw = D ? Math.round((piw - 16) * 5 / 12) : piw, cw = D ? piw - 16 - aw : piw;
    const im = await h.img('website/v2/' + art2 + '.png', aw, D ? 300 : 190, { r: 16, name: 'Art' }); K.s(im, 'dark/border');
    const c = await K.glassCard(mode, cw, 'Body', 0, D ? 32 : 24); const ciw = cw - 2 * (D ? 32 : 24);
    const top = K.row(12, 'Top'); h.add(c, top); h.fillW(top); h.add(top, await T.use('Badge', { Tone: 'Success', Mode: M }, { Label: status.toUpperCase() }, () => K.pill(status, mode, 'success')));
    const sp = K.spacer(); h.add(top, sp); sp.layoutGrow = 1; h.add(top, await K.t(String(k + 1).padStart(2, '0') + ' / FLAGSHIP', 'label/sm', K.v(mode, 'faint')));
    const lab = K.row(16, 'Label'); h.add(lab, K.tick(44), await K.t(label.toUpperCase(), 'label/eyebrow', K.v(mode, 'sub')));
    const tx = K.row(0, 'Text'); tx.paddingLeft = 16; tx.strokes = [K.c(K.v(mode, 'border'))]; tx.strokeLeftWeight = 2; tx.strokeTopWeight = tx.strokeRightWeight = tx.strokeBottomWeight = 0;
    h.add(tx, await K.t(text, 'body/md', K.v(mode, 'sub'), { w: Math.min(560, ciw - 18) }));
    const g = (n) => { const s = K.spacer(); s.resize(1, n); return s; };
    h.add(c, g(24), await K.t(name, D ? 'heading/h1' : 'heading/h2', K.v(mode, 'text'), { name: 'Name' }), g(16), lab, g(20), tx, g(28), await K.link('External', 'Default', mode, cta));
    h.add(p, im, c); h.add(st, p); }
  if (key === 'system') {
    const pl = await T.glass(w, mode, CW, 'Delivery pipeline', 20); h.add(pl, await K.slash('Delivery pipeline', mode));
    const row = K.row(D ? 0 : 12, 'Steps'); row.counterAxisAlignItems = D ? 'CENTER' : 'MIN'; if (!D) row.layoutMode = 'VERTICAL';
    const sw = D ? Math.floor((iw - 4 * 32) / 5) : iw;
    for (let k = 0; k < HOME.pipeline.length; k++) { const [t, x, hot] = HOME.pipeline[k];
      const i = await T.use('Pipeline Step', { State: hot ? 'Hot' : 'Default', Mode: M }, { Title: t, Body: x }, () => K.pipeStep(hot ? 'Hot' : 'Default', mode, { title: t, text: x, w: sw }));
      h.add(row, i); T.size(i, sw);
      if (D && k < HOME.pipeline.length - 1) { const a = K.row(0, 'Arrow'); K.fix(a, 32, 32); a.primaryAxisAlignItems = 'CENTER'; a.counterAxisAlignItems = 'CENTER'; h.add(a, await K.icon('arrow-right', 'brand/500', 16)); h.add(row, a); } }
    h.add(pl, row, await K.t('No step merges, deploys or closes a ticket on its own.', 'body/sm', K.v(mode, 'faint'))); h.add(st, pl);
    h.add(st, await T.cardGrid(w, mode, 'Controls', HOME.controls, 4));
    const qp = await K.glass(mode, CW, 'Principle', 20, D ? 64 : 32); const q = K.col(20, 'Quote'); q.paddingLeft = D ? 32 : 24;
    q.strokes = [K.c('brand/500')]; q.strokeLeftWeight = 3; q.strokeTopWeight = q.strokeRightWeight = q.strokeBottomWeight = 0;
    h.add(q, await K.t('Models propose. Rules gate. I decide.', D ? 'heading/h2-sans' : 'heading/h3', K.v(mode, 'text'), { w: CW - (D ? 128 : 64) - 40, name: 'Quote' }), await K.t('— OPERATING PRINCIPLE', 'label/eyebrow', K.v(mode, 'accent-text')));
    h.add(qp, q); h.add(st, qp); }
  if (key === 'capabilities') h.add(st, await T.rows(w, mode, 'Technology', HOME.stack.map(([a, i]) => [a, i, null, 'Stack'])));
  return T.backdrop(st, w, mode, art, side); };

// Contact band: always on the dark plate with the contact render (as the site).
T.contactBand = async (w, title, text, cta) => { const D = T.D(w), CW = T.CW(w);
  const b = K.col(0, 'Contact band'); K.fix(b, CW, D ? 320 : 380); b.primaryAxisAlignItems = 'CENTER'; K.pad(b, D ? 56 : 28); b.cornerRadius = 24; b.clipsContent = true; K.s(b, 'dark/border');
  await h.imgFill(b, 'website/v2/site-contact.png', { under: [K.c('legacy/0a0a0a')], over: [h.grad([[0, '#0A0A0B', 0.95], [0.45, '#0A0A0B', 0.75], [1, '#0A0A0B', 0.15]], 0)] });
  const bar = h.rect(CW, 3, [K.c('brand/500', 0.85)]); bar.name = 'Accent line'; h.absAt(b, bar, 0, (D ? 320 : 380) - 3);
  const c = K.col(16, 'Text'); h.add(c, await K.t(title, D ? 'heading/h2' : 'heading/h3', 'dark/text', { w: D ? 560 : CW - 56 }), await K.t(text, 'body/md', 'dark/sub', { w: D ? 520 : CW - 56 }));
  const s = K.spacer(); s.resize(1, 16); h.add(c, s, await K.btn('Primary', 'md', 'dark', cta, { noIcon: true })); h.add(b, c); return b; };

section({ name: '20 · Home', page: PG.T, run: async () => T.board('20 · Home', async (w, mode) => {
  const D = T.D(w); const f = T.frame('Home · ' + w, w, mode);
  h.add(f, await T.nav(w, mode, 'Home')); const body = T.body(w, D ? 112 : 80, D ? 72 : 32); h.add(f, body);
  h.add(body, await T.homeHero(w, mode));
  for (const [key] of HOME.sections) h.add(body, await T.homeSection(w, mode, key));
  h.add(body, await T.contactBand(w, 'Start with the business problem.', 'Send the problem, the users and the deadline. I reply with a scope and a first plan.', 'Contact'));
  h.add(f, await T.footer(w, mode)); return f; }, { route: '/' }) });
