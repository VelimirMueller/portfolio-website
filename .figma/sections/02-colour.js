// 01 · Colour — semantic roles per mode, the brand scale, status and group colours, primitives and drift.
section({ name: '01 · Colour', page: PG.F, run: async () => {
  await K.init(); const s = h.section('01 · Colour'); const b = K.board('Colour', 1600);
  h.add(b, await K.head('01 · Foundations', 'Colour', 'Each swatch is bound to its variable. The Starter plan has one mode, so dark/* and light/* are separate variables. Primitives are hidden from the pickers; use the semantic roles.'));

  const sw = async (name, w, mode, note) => { const c = K.col(8, name); const r = h.rect(w, 88, [K.c(name)], 14); r.name = 'Swatch';
    K.s(r, K.v(mode, 'border-strong')); const L = K.v(mode, 'text'), S = K.v(mode, 'sub');
    h.add(c, r, await K.t(name.split('/').slice(-1)[0], 'label/nav-active', L, { name: 'Role' }), await K.t((K.hex[name] || '—').toUpperCase(), 'mono/caption', S, { name: 'Hex' }),
      await K.t(name, 'mono/caption', K.v(mode, 'accent-text'), { name: 'Variable' }));
    if (note) h.add(c, await K.t(note, 'body/xs', S, { w, name: 'Note' })); return c; };

  const ROLES = ['bg', 'card', 'hover', 'inset', 'border', 'border-strong', 'text', 'sub', 'faint', 'accent', 'accent-hover', 'accent-text', 'on-accent', 'focus',
    'cta-bg', 'cta-text', 'cta-hover', 'secondary-bg', 'secondary-border', 'input-bg', 'placeholder', 'success', 'success-text', 'danger', 'danger-border', 'danger-text',
    'warning', 'warning-text', 'disabled-bg', 'disabled-text', 'skeleton', 'overlay', 'eyebrow'];
  const pair = K.row(0, 'Dark + Light'); pair.counterAxisAlignItems = 'MIN'; pair.cornerRadius = 24; pair.clipsContent = true; K.s(pair, 'dark/border');
  for (const mode of ['dark', 'light']) { const p = K.col(24, mode); K.pad(p, 40); K.f(p, K.v(mode, 'bg'));
    h.add(p, await K.t(mode.toUpperCase() + ' · SEMANTIC ROLES', 'label/eyebrow', K.v(mode, 'sub')));
    const g = K.wrap(640, 20, 'Swatches'); h.add(p, g);
    for (const r of ROLES) h.add(g, await sw(K.v(mode, r), 140, mode, r === 'eyebrow' ? 'As built (F-2). Use accent-text.' : null));
    K.fixW(p, 720); h.add(pair, p); }
  h.add(b, pair);

  const br = K.col(20, 'Brand'); h.add(br, await K.t('BRAND · INDIGO', 'label/eyebrow', 'dark/sub'));
  const scale = K.row(0, 'Scale'); scale.cornerRadius = 20; scale.clipsContent = true; h.add(br, scale);
  for (const [n, note] of [['300', 'Soft text on art'], ['400', 'Accent text on dark · 6.6:1'], ['500', 'Fill, lines, ring, glow'], ['600', 'Accent text and CTA on light · 6.3:1'], ['700', 'CTA hover on light'], ['900', 'Deep fills']]) {
    const c = K.col(6, 'brand-' + n); K.pad(c, 20, 24); K.fix(c, 240, 200); c.primaryAxisAlignItems = 'MAX'; K.f(c, 'brand/' + n);
    const on = +n >= 500 ? 'dark/text' : 'light/text';
    h.add(c, await K.t('brand-' + n, 'heading/h4', on), await K.t(K.hex['brand/' + n] || '—', 'mono/md', on), await K.t(note, 'body/xs', on, { w: 200, op: 0.85 })); h.add(scale, c); }
  h.add(b, br);

  const st = K.col(20, 'Status'); h.add(st, await K.t('STATUS · GROUPS · BRAND ROLES', 'label/eyebrow', 'dark/sub'));
  const g2 = K.wrap(1440, 20, 'Status swatches'); h.add(st, g2);
  for (const [n, note] of [['status/ok', 'Live, operational. One per view.'], ['status/ok-text-light', 'Emerald as text on white.'], ['brand/fill', 'Lines, bars, glows.'], ['brand/fill-strong', 'Nav CTA, admin Reply.'],
    ['brand/fill-hover', 'CTA hover on light.'], ['brand/ring', 'Focus ring.'], ['group/flagship', 'Flagship projects.'], ['group/lab', 'Lab projects.'], ['group/ops', 'Ops tools.'], ['group/venture', 'Ventures (Orbfall).']])
    h.add(g2, await sw(n, 124, 'dark', note));
  h.add(b, st);

  const pm = K.col(20, 'Primitives'); h.add(pm, await K.t('PRIMITIVES · HIDDEN FROM PICKERS', 'label/eyebrow', 'dark/sub'));
  const g3 = K.wrap(1440, 16, 'Primitive swatches'); h.add(pm, g3);
  for (const n of ['zinc/50', 'zinc/100', 'zinc/200', 'zinc/300', 'zinc/400', 'zinc/500', 'zinc/600', 'zinc/700', 'zinc/800', 'zinc/900', 'zinc/925', 'zinc/950', 'base/white', 'base/black',
    'emerald/400', 'emerald/500', 'emerald/700', 'red/300', 'red/400', 'red/500', 'red/600', 'red/700', 'amber/300', 'amber/400', 'amber/500', 'amber/700',
    'violet/400', 'violet/500', 'violet/600', 'blue/400', 'blue/500', 'ops/500', 'ops/700'])
    h.add(g3, await sw(n, 96, 'dark'));
  h.add(b, pm);

  const dr = K.card('dark', 1440, 'Drift', 20, 32); h.add(dr, await K.t('DRIFT · KEPT ONLY TO DOCUMENT THE CODE (SEE 05 · CODE ISSUES)', 'label/eyebrow', 'dark/warning-text'));
  const g4 = K.row(20, 'Drift swatches'); g4.counterAxisAlignItems = 'MIN'; h.add(dr, g4);
  for (const [n, note] of [['zinc/940', '[#111] → dark/card'], ['legacy/050505', '[#050505] → dark/input-bg'], ['legacy/0a0a0a', '[#0a0a0a] → dark/bg'], ['legacy/1a1a1a', '[#1a1a1a] → dark/hover'],
    ['legacy/222222', '[#222] → dark/border'], ['legacy/333333', '[#333] → dark/border-strong'], ['green/500', 'eyebrow → accent-text'], ['green/800', 'eyebrow → accent-text']])
    h.add(g4, await sw(n, 140, 'dark', note));
  h.add(b, dr);
  return h.place(s, b); } });
