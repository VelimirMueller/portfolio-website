// 26 · Service detail — /services/[serviceId] (ServiceDetailContent.tsx). Shown for ux-ui-branding; the other four swap art and copy.
// The content is one stage: glass cards over the service render.
section({ name: '26 · Service detail', page: PG.T, run: async () => T.board('26 · Service detail', async (w, mode) => {
  const D = T.D(w), CW = T.CW(w), M = T.MODE(mode); const f = T.frame('Service detail · ' + w, w, mode);
  const crumbs = await T.use('Breadcrumbs', { Depth: '3', Mode: M }, null, () => K.crumbs('3', mode));
  h.add(f, await T.top(w, mode, 'svc-ux', 'Services', 'Design as Brand Message', D ? 'UX/UI & BRANDING.' : 'UX/UI.', crumbs));
  const body = T.body(w, 16, D ? 16 : 8); h.add(f, body); const st = T.stage(w, 16, 'Section · detail'); h.add(body, st);
  const intro = await T.card(w, mode, CW, 'Intro', 16, D ? 40 : 24); const ih = K.row(16, 'Head'); h.add(ih, await T.iconBox(mode, 'sparkles'), await K.t('Design that says what the product is', 'heading/h3', K.v(mode, 'text'), { w: CW - 140 }));
  h.add(intro, ih, await K.t('Brand, UX and UI from one hand: research, flows, a design system in Figma and the code that matches it token for token.', 'body/md', K.v(mode, 'sub'), { w: CW - (D ? 80 : 48) }));
  h.add(st, intro);
  const r = K.wrap(CW, 16, 'Row'); h.add(st, r); const half = T.span(w, 6);
  const ch = await T.card(w, mode, half, 'Challenges', 14); h.add(ch, await K.t('CHALLENGES', 'label/eyebrow', K.v(mode, 'danger-text')));
  for (const t of ['The brand says one thing, the product another.', 'Every screen is designed again from scratch.', 'Design and code drift apart after launch.']) {
    const l = K.row(12, t); l.counterAxisAlignItems = 'MIN'; h.add(l, K.dot(6, K.v(mode, 'danger-border')), await K.t(t, 'body/sm', K.v(mode, 'sub'), { w: half - 90 })); h.add(ch, l); }
  const ap = await T.card(w, mode, half, 'Approach', 14); h.add(ap, await K.t('APPROACH', 'label/eyebrow', K.v(mode, 'accent-text')));
  let n = 1; for (const t of ['Workshops on audience and message', 'Flows and wireframes, tested early', 'A token-based design system', 'Components shipped in code']) {
    const l = K.row(14, t); h.add(l, await K.t('0' + n++, 'mono/md', K.v(mode, 'accent-text')), await K.t(t, 'body/sm', K.v(mode, 'text'), { w: half - 110 })); h.add(ap, l); }
  h.add(r, ch, ap);
  const r2 = K.wrap(CW, 16, 'Row 2'); h.add(st, r2);
  const ts = await T.card(w, mode, half, 'Tech stack', 14); h.add(ts, await K.t('TECH STACK', 'label/eyebrow', K.v(mode, 'faint')));
  const chips = K.wrap(half - 64, 8, 'Chips'); for (const t of ['Figma', 'Design tokens', 'Tailwind', 'React', 'Storybook', 'Accessibility'])
    h.add(chips, await T.use('Tag', { State: 'Default', Mode: M }, { Label: t }, () => K.tag('Default', mode, t))); h.add(ts, chips);
  const cta = await T.card(w, mode, half, 'Interested', 14); cta.fills = cta.fills.concat([K.c(K.v(mode, 'accent'), 0.06)]); K.s(cta, K.v(mode, 'accent'), 1, 0.2);
  h.add(cta, await K.t('Interested?', 'heading/h3', K.v(mode, 'text')), await K.t('Let’s talk about how this service fits your product.', 'body/sm', K.v(mode, 'sub'), { w: half - 64 }), await K.btn('Brand', 'md', mode, 'Discuss UX/UI Project'));
  h.add(r2, ts, cta); await T.backdrop(st, w, mode, 'site-svc-ux', 'right');
  h.add(f, await T.footer(w, mode)); return f; }, { route: '/services/[serviceId]' }) });
