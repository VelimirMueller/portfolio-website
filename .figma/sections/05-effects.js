// 04 · Effects & Imagery — effect styles on samples, the art in dark and light, the light-mode rule.
section({ name: '04 · Effects & Imagery', page: PG.F, run: async () => {
  await K.init(); const s = h.section('04 · Effects & Imagery'); const b = K.board('Imagery', 1600);
  h.add(b, await K.head('04 · Foundations', 'Effects & imagery', 'Dark abstract art, a faint grid, one soft glow in the accent. No people and no text in images. The art is decorative (aria-hidden).'));
  const fx = K.wrap(1440, 24, 'Effects');
  for (const [n, mode, r] of [['glow/card-dark', 'dark', 24], ['shadow/card-light', 'light', 24], ['shadow/nav', 'light', 9999], ['glow/cta', 'dark', 9999], ['glow/pulse', 'dark', 9999], ['glow/success', 'dark', 9999],
    ['shadow/sm', 'light', 24], ['shadow/popover', 'light', 12], ['shadow/modal', 'dark', 24], ['focus/ring-dark', 'dark', 9999], ['focus/ring-light', 'light', 9999], ['blur/backdrop', 'dark', 9999]]) {
    const c = K.col(18, n); K.pad(c, 28); K.fix(c, 336, 230); c.cornerRadius = 24; c.counterAxisAlignItems = 'CENTER'; c.primaryAxisAlignItems = 'CENTER'; K.f(c, K.v(mode, 'bg'));
    const card = h.rect(170, 84, [K.c(n === 'blur/backdrop' ? K.v(mode, 'card') : n.indexOf('ring') > 0 || n.indexOf('cta') > 0 ? 'brand/fill-strong' : K.v(mode, 'card'), n === 'blur/backdrop' ? 0.9 : null)], Math.min(r, 42));
    card.name = 'Sample'; K.s(card, K.v(mode, 'border')); await K.fx(card, n);
    h.add(c, card, await K.t(n, 'label/nav-active', K.v(mode, 'text'))); h.add(fx, c); }
  h.add(b, fx);

  h.add(b, await K.t('DARK + LIGHT PAIRS', 'label/eyebrow', 'dark/sub'));
  const pairs = K.wrap(1440, 24, 'Pairs');
  for (const n of Object.keys(K.LIGHT)) { const c = K.col(10, n); const r = K.row(8, 'Pair');
    h.add(r, await h.img(K.art(n, 'dark'), 340, 150, { r: 12 }), await h.img(K.art(n, 'light'), 340, 150, { r: 12 }));
    h.add(c, r, await K.t(n + ' · dark / light', 'mono/caption', 'dark/sub')); h.add(pairs, c); }
  h.add(b, pairs);
  const rule = K.card('dark', 1440, 'Light rule', 10, 32); rule.fills = [K.c('dark/card'), h.grad([[0, '#6366F1', 0.12], [1, '#6366F1', 0]], 0)];
  h.add(rule, await K.t('LIGHT-MODE RULE', 'label/eyebrow', 'dark/accent-text'),
    await K.t('ArtBackdrop shows the same art in both modes. Light mode inverts it: invert · hue-rotate(180deg) · mix-blend-multiply · opacity 50 %. Dark mode: mix-blend-screen · opacity 90 %. Keep the art near-black, or the light version turns grey. The *-light files show the result.', 'body/md', 'dark/sub', { w: 1360 }));
  h.add(b, rule);
  h.add(b, await K.t('ALL ART · public/art (.webp) · vm-brand renders', 'label/eyebrow', 'dark/sub'));
  const all = K.wrap(1440, 16, 'Art grid');
  const names = ['hero', 'about', 'services', 'projects', 'contact', 'mcp', 'synthwerk', 'svc-requirements', 'svc-ux', 'svc-frontend', 'svc-delivery', 'svc-stack',
    'build-bench', 'build-debater', 'build-mtg', 'build-rig', 'build-skills', 'build-synthwerk'];
  const extra = ['site-contact', 'site-svc-delivery', 'site-svc-frontend', 'site-svc-requirements', 'site-svc-stack', 'site-svc-ux', 'portfolio-website', 'orbfall', 'synthwerk', 'code-context-mcp'];
  for (const [label, path] of names.map(x => [x + '-v1', 'website/' + x + '-v1.png']).concat(extra.map(x => [x, 'website/' + x + '.png']))) {
    const c = K.col(8, label); h.add(c, await h.img(path, 346, 150, { r: 12 }), await K.t(label, 'mono/caption', 'dark/faint')); h.add(all, c); }
  h.add(b, all);
  return h.place(s, b); } });
