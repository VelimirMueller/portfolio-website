// 03 · Space, Radius & Grid — spacing scale, radius, sizes and the layout grids.
section({ name: '03 · Space, Radius & Grid', page: PG.F, run: async () => {
  await K.init(); const s = h.section('03 · Space, Radius & Grid'); const b = K.board('Space', 1600);
  h.add(b, await K.head('03 · Foundations', 'Space, radius & grid', 'Tailwind 4 px steps. Cards use 24 px (rounded-[1.5rem]), admin panels 32 px, buttons and pills are full round. Content is max-w-7xl (1280).'));
  const sp = K.col(10, 'Spacing'); h.add(sp, await K.t('SPACING', 'label/eyebrow', 'dark/sub'));
  for (const [k, v] of [['0.5', 2], ['1', 4], ['2', 8], ['3', 12], ['4', 16], ['5', 20], ['6', 24], ['8', 32], ['10', 40], ['12', 48], ['16', 64], ['20', 80], ['24', 96], ['32', 128]]) {
    const r = K.row(20, 'space/' + k); const lab = await K.t('space/' + k, 'mono/md', 'dark/sub', { w: 120 });
    const bar = h.rect(Math.max(2, v * 4), 16, [K.c('brand/fill')], 4); bar.name = 'Bar'; h.add(r, lab, bar, await K.t(v + ' px', 'mono/caption', 'dark/faint')); h.add(sp, r); }
  const rad = K.col(20, 'Radius'); h.add(rad, await K.t('RADIUS', 'label/eyebrow', 'dark/sub')); const rr = K.wrap(640, 24, 'Radius samples'); h.add(rad, rr);
  for (const [n, v] of [['sm', 4], ['md', 6], ['lg', 8], ['xl', 12], ['2xl', 16], ['card', 24], ['panel', 32], ['full', 9999]]) { const c = K.col(10, n);
    const r = h.rect(132, 96, [K.c('dark/card')], Math.min(v, 48)); K.s(r, 'dark/border-strong'); r.name = 'radius/' + n;
    h.add(c, r, await K.t('radius/' + n, 'label/nav-active', 'dark/text'), await K.t(v === 9999 ? '9999 px' : v + ' px', 'mono/caption', 'dark/faint')); h.add(rr, c); }
  const sz = K.col(20, 'Sizes'); h.add(sz, await K.t('SIZES', 'label/eyebrow', 'dark/sub'));
  for (const [n, v] of [['icon-sm', 16], ['icon-md', 20], ['icon-lg', 24], ['avatar-sm', 28], ['control-sm', 36], ['avatar-md', 40], ['control-md', 44], ['avatar-lg', 48], ['control-lg', 52]]) {
    const r = K.row(16, n); const q = h.rect(v, v, [K.c('dark/accent', 0.2)], 6); K.s(q, 'dark/accent'); h.add(r, q, await K.t('size/' + n + ' · ' + v, 'mono/caption', 'dark/sub')); h.add(sz, r); }
  const top = K.row(80, 'Space + radius'); top.counterAxisAlignItems = 'MIN'; h.add(top, sp, rad, sz); h.add(b, top);

  h.add(b, await K.t('GRIDS', 'label/eyebrow', 'dark/sub'));
  const grids = K.row(40, 'Grids'); grids.counterAxisAlignItems = 'MAX';
  for (const [nm, w, cols, gut, mar, sc, note] of [['Desktop · 1440', 1440, 12, 16, 80, 0.5, '12 columns · gap 16 · content 1280 centred (margin 80)'],
    ['Tablet · 768', 768, 6, 16, 32, 0.5, '6 columns · gap 16 · margin 32'], ['Mobile · 390', 390, 4, 16, 16, 0.5, '4 columns · gap 16 · margin 16 (px-4)']]) {
    const c = K.col(12, nm); const f = h.box(Math.round(w * sc), Math.round(600 * sc), [K.c('dark/card')], 12, nm); K.s(f, 'dark/border');
    const inner = f.width - 2 * mar * sc, cw = (inner - (cols - 1) * gut * sc) / cols;
    for (let k = 0; k < cols; k++) { const col = h.rect(Math.max(1, cw), f.height, [K.c('dark/accent', 0.14)]); col.name = 'Column'; f.appendChild(col); col.x = mar * sc + k * (cw + gut * sc); col.y = 0; }
    h.add(c, f, await K.t(nm, 'label/nav-active', 'dark/text'), await K.t(note, 'mono/caption', 'dark/faint', { w: Math.max(190, f.width) })); h.add(grids, c); }
  h.add(b, grids);
  const rule = K.card('dark', 1440, 'Rhythm', 10, 32);
  h.add(rule, await K.t('RHYTHM', 'label/eyebrow', 'dark/accent-text'), await K.t('Pages start at pt-32 (128) under the floating nav and end at pb-20 (80). Bento cards sit in a 12-column grid with gap-4. Card padding is p-6 (24); forms and legal cards use p-8 / md:p-12. Section headers keep mb-10 / md:mb-16.', 'body/md', 'dark/sub', { w: 1360 }));
  h.add(b, rule);
  return h.place(s, b); } });
