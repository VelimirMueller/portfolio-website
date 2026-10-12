// 18 · Glass — the liquid-glass layer of the site rework (vm-brand B-48): section divider, numbered card, status row,
// glass stat and pipeline step. Glass needs art behind it: the templates put these on a T.stage.
// Art: website/v2/* are the vm-brand v2 renders; v2/light/* are the light-mode results of the site's CSS filter.
K.ART2_LIGHT = { 'site-svc-requirements': 1, 'site-svc-delivery': 1, 'site-svc-ux': 1, 'site-svc-stack': 1, 'site-svc-frontend': 1, 'site-contact': 1, 'flagship-base': 1 };
K.art2 = (name, mode) => (K.m(mode) === 'light' && K.ART2_LIGHT[name]) ? 'website/v2/light/' + name + '-light.png' : 'website/v2/' + name + '.png';

// Section divider (SectionDivider in HomeContent.tsx): an art strip, always on the dark plate, "NN / TITLE", tick, caption,
// counter pill and the 3 px accent line at the bottom. Text and art are overridable per instance (layer "Art").
K.divider = async (viewport, mode, o) => { o = o || {}; const D = viewport !== 'Mobile', W = o.w || (D ? 1280 : 358), H = D ? 200 : 160;
  const f = K.col(12, 'Section Divider'); K.fix(f, W, H); f.primaryAxisAlignItems = 'CENTER'; f.paddingLeft = f.paddingRight = D ? 40 : 24;
  f.cornerRadius = 24; f.clipsContent = true; K.f(f, 'legacy/0a0a0a'); K.s(f, K.m(mode) === 'light' ? 'light/border' : 'dark/border');
  const art = h.rect(W, H, [K.c('legacy/0a0a0a')]); art.name = 'Art'; h.absAt(f, art, 0, 0);
  await h.imgFill(art, 'website/v2/' + (o.art || 'strip-flagship-1') + '.png', { over: K.DIVIDER_OVER() });
  const bar = h.rect(W, 3, [K.c('brand/500', 0.85)]); bar.name = 'Accent line'; h.absAt(f, bar, 0, H - 3);
  const pill = K.row(0, 'Counter'); K.pad(pill, 12, 4); pill.cornerRadius = 9999; K.f(pill, 'legacy/0a0a0a', 0.8); K.s(pill, 'dark/border');
  h.add(pill, await K.t(o.counter || 'SECTION 01 / 05', 'label/sm', 'dark/sub', { name: 'Counter' })); h.absAt(f, pill, W - (D ? 32 : 20) - pill.width, D ? 24 : 18);
  const head = K.row(D ? 16 : 10, 'Heading'); head.counterAxisAlignItems = 'MAX';
  h.add(head, await K.t(o.index || '01', D ? 'heading/h1' : 'heading/h2', 'dark/accent-text', { name: 'Index' }), await K.t('/', D ? 'heading/h2' : 'heading/h3', 'dark/faint', { name: 'Slash' }),
    await K.t(o.title || 'PRACTICE', D ? 'heading/h1' : 'heading/h3', 'dark/text', { name: 'Title' }));
  const cap = K.row(16, 'Caption row'); h.add(cap, K.tick(44), await K.t(o.caption || 'THREE AREAS, ONE OWNER', 'label/eyebrow', 'dark/sub', { name: 'Caption' }));
  h.add(f, head, cap); return f; };

// Numbered card (CardGrid): tick + index, title, text, optional tags line. Glass inner surface.
K.numCard = async (mode, o) => { o = o || {}; const c = await K.glassCard(mode, o.w || 400, 'Numbered Card', 8, 28);
  const top = K.row(0, 'Top'); top.counterAxisAlignItems = 'MIN'; h.add(c, top); h.fillW(top);
  const sp = K.spacer(); h.add(top, K.tick(24)); h.add(top, sp); sp.layoutGrow = 1; h.add(top, await K.t(o.index || '01', 'mono/caption', K.v(mode, 'faint'), { name: 'Index' }));
  const gap = K.spacer(); gap.resize(1, 16); h.add(c, gap);
  const ttl = await K.t(o.title || 'Product engineering', 'heading/h4', K.v(mode, 'text'), { w: (o.w || 400) - 56, name: 'Title' });
  const body = await K.t(o.text || 'Requirements, UX and UI, full-stack code, tests and rollout. One owner from ticket to release.', 'body/sm', K.v(mode, 'sub'), { w: (o.w || 400) - 56, name: 'Body' });
  h.add(c, ttl, body); h.fillW(ttl, body);
  if (o.tags !== false) { const tg = await K.t(o.tags || 'NEXT.JS · LARAVEL · VUE', 'label/sm', K.v(mode, 'faint'), { w: (o.w || 400) - 56, name: 'Tags' }); const g2 = K.spacer(); g2.resize(1, 16); h.add(c, g2, tg); h.fillW(tg); }
  return c; };

// Status row (roles list and technology list). Kind: Current / Past (roles) or Stack (green dot, value in mono status green).
K.statusRow = async (kind, viewport, mode, o) => { o = o || {}; const D = viewport !== 'Mobile', W = o.w || (D ? 1200 : 310), stack = kind === 'Stack', cur = kind === 'Current';
  const c = await K.glassCard(mode, null, 'Status Row', D ? 24 : 4, 0); c.layoutMode = D ? 'HORIZONTAL' : 'VERTICAL'; c.counterAxisAlignItems = D ? 'CENTER' : 'MIN';
  c.paddingLeft = c.paddingRight = 20; c.paddingTop = c.paddingBottom = 16; K.fixW(c, W);
  if (D) { const dot = K.dot(12, K.v(mode, stack || cur ? 'success' : 'bg'), 'Status'); if (!stack && !cur) K.s(dot, K.v(mode, 'border-strong'), 1.5); h.add(c, dot); }
  const label = await K.t(o.label || (stack ? 'Frontend' : cur ? 'GALVANY' : 'DEMOS plan GmbH'), 'body/sm-strong', K.v(mode, 'text'), { w: D ? (stack ? 160 : 288) : W - 40, name: 'Label' });
  const value = await K.t(o.value || (stack ? 'NEXT.JS · REACT · VUE 3 · NUXT · TYPESCRIPT' : cur ? 'Senior Software Engineer, Full-Stack / Product' : 'Software Engineer, Frontend'),
    stack ? 'label/sm' : 'body/sm', K.v(mode, stack ? 'success-text' : 'sub'), { w: D ? 400 : W - 40, name: 'Value', align: stack && D ? 'RIGHT' : 'LEFT' });
  h.add(c, label, value); if (D) value.layoutGrow = 1;
  if (!stack) h.add(c, await K.t(o.meta || (cur ? 'CURRENT · 2025 – NOW' : '2021 – 2025'), 'label/sm', K.v(mode, cur ? 'success-text' : 'faint'), { name: 'Meta' }));
  return c; };

// Glass stat (hero "At a glance"): value in the accent, mono label.
K.glassStat = async (mode, o) => { o = o || {}; const c = await K.glassCard(mode, o.w || 290, 'Glass Stat', 12, 28);
  const v = await K.t(o.value || '3–4×', 'metric/xl', K.v(mode, 'accent-text'), { name: 'Value' });
  const l = await K.t(o.label || 'FASTER LEAD ASSIGNMENT AT GALVANY', 'label/sm', K.v(mode, 'faint'), { w: (o.w || 290) - 56, name: 'Label' }); h.add(c, v, l); h.fillW(l); return c; };

// Pipeline step (delivery system). Hot = the review gate: accent border.
K.pipeStep = async (state, mode, o) => { o = o || {}; const c = await K.glassCard(mode, o.w || 220, 'Pipeline Step', 6, 20);
  h.add(c, K.tick(20)); const g = K.spacer(); g.resize(1, 10); h.add(c, g);
  const t = await K.t(o.title || (state === 'Hot' ? 'Review' : 'Spec'), 'mono/md', K.v(mode, 'text'), { name: 'Title' });
  const b = await K.t(o.text || (state === 'Hot' ? 'Two independent models. Both must approve.' : 'A model drafts, I approve.'), 'body/sm', K.v(mode, 'sub'), { w: (o.w || 220) - 40, name: 'Body' });
  h.add(c, t, b); h.fillW(b);
  if (state === 'Hot') { c.strokes = [K.c('brand/500')]; c.strokeWeight = 1.5; } return c; };

section({ name: '18 · Glass', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('18 · Glass'); const b = K.board('Glass', 2000);
  h.add(b, await K.head('18 · Components', 'Liquid glass', 'The website surface of a VM. product (vm-brand B-48). Translucent panels and cards over large dark renders, with a white-to-indigo edge and a backdrop blur. READMEs, banners and the components on the other boards stay flat. Glass needs art behind it: see 20 · Templates.'));
  // live sample: glass over the art, both modes
  const demo = K.row(24, 'Glass over art'); demo.counterAxisAlignItems = 'MIN';
  for (const m of ['dark', 'light']) { const st = await K.panel(K.art2('site-svc-delivery', m), 940, 420, { name: 'Stage · ' + m, pad: 48, gap: 16, mode: m, align: 'CENTER', op: 1, over: [] });
    const p = await K.glass(m, 844, 'Glass panel', 16, 32); h.add(p, await K.slash('At a glance', m));
    const row = K.row(16, 'Cards'); for (const [v, l] of [['3–4×', 'FASTER LEAD ASSIGNMENT'], ['81', 'TOOLS IN CODE-CONTEXT-MCP']]) h.add(row, await K.glassStat(m, { value: v, label: l, w: 382 }));
    h.add(p, row); h.add(st, p); h.add(demo, st); }
  h.add(b, demo);
  await K.set(b, 'Section Divider', 'SectionDivider: NN / TITLE on an art strip, always on the dark plate. Override Index, Title, Caption, Counter and the image fill of "Art" (strip-flagship-1…5).',
    [['Viewport', ['Desktop', 'Mobile']]], (p, m) => K.divider(p.Viewport, m));
  await K.set(b, 'Numbered Card', 'CardGrid card: tick, index, title, text, tags. Glass inner surface. Hide "Tags" when a card has none.', [], (p, m) => K.numCard(m));
  await K.set(b, 'Status Row', 'Roles list (Current, Past) and technology list (Stack). Mobile stacks the columns.', [['Kind', ['Current', 'Past', 'Stack']], ['Viewport', ['Desktop', 'Mobile']]],
    (p, m) => K.statusRow(p.Kind, p.Viewport, m), { colAxis: 'Kind' });
  await K.set(b, 'Glass Stat', 'Hero "At a glance" stat. Value in the accent, label in mono.', [], (p, m) => K.glassStat(m));
  await K.set(b, 'Pipeline Step', 'Delivery pipeline step. Hot marks the review gate.', [['State', ['Default', 'Hot']]], (p, m) => K.pipeStep(p.State, m));
  return h.place(s, b); } });
