// 07 · Motion — durations, easings and the named animations of tailwind.config.ts and globals.css.
section({ name: '07 · Motion', page: PG.F, run: async () => {
  await K.init(); const s = h.section('07 · Motion'); const b = K.board('Motion', 1600);
  h.add(b, await K.head('07 · Foundations', 'Motion', 'Short and quiet. Colour and border changes take 200 ms, hover lifts 300 ms, entrances 600 ms. prefers-reduced-motion turns every animation off; touch devices drop the infinite ones.'));
  const tok = K.row(24, 'Tokens'); tok.counterAxisAlignItems = 'MIN';
  for (const [n, v, use] of [['motion/duration/fast', 200, 'Buttons, toggles, colours'], ['motion/duration/base', 300, 'Card lift, border glow'], ['motion/duration/warp', 550, 'KPI section switch'], ['motion/duration/slow', 600, 'fade-in-up, card-shine']]) {
    const c = K.card('dark', 338, n, 14, 28); const track = h.rect(282, 6, [K.c('dark/hover')], 3); track.name = 'Track';
    const bar = h.rect(Math.round(282 * v / 600), 6, [K.c('brand/fill')], 3); bar.name = 'Bar';
    h.add(c, await K.t(v + ' ms', 'metric/lg', 'dark/text'), track, bar, await K.t(n, 'mono/caption', 'dark/accent-text'), await K.t(use, 'body/sm', 'dark/sub', { w: 282 })); h.add(tok, c); }
  h.add(b, tok);
  const eases = K.row(24, 'Easings'); eases.counterAxisAlignItems = 'MIN';
  for (const [n, path, val] of [['motion/ease/out', 'M0 160 C 0 160, 93 0, 160 0', 'ease-out'], ['motion/ease/warp', 'M0 160 C 26 160, 48 0, 160 0', 'cubic-bezier(0.16, 1, 0.3, 1)'], ['motion/ease/pulse', 'M0 160 C 64 160, 96 0, 160 0', 'cubic-bezier(0.4, 0, 0.6, 1)']]) {
    const c = K.card('dark', 464, n, 14, 28); const plot = h.box(180, 180, [K.c('dark/bg')], 12, 'Plot'); K.s(plot, 'dark/border');
    const curve = K.svg('<path d="' + path + '"/>', 'dark/accent', 160, 160, 3, 'Curve'); plot.appendChild(curve); curve.x = 10; curve.y = 10;
    h.add(c, plot, await K.t(n, 'label/nav-active', 'dark/text'), await K.t(val, 'mono/caption', 'dark/sub', { w: 400 })); h.add(eases, c); }
  h.add(b, eases);
  const t = K.col(0, 'Animations'); t.cornerRadius = 20; t.clipsContent = true; K.s(t, 'dark/border'); h.add(b, t);
  const rows = [['ANIMATION', 'TIMING', 'USE'], ['fade-in-up', '0.6s ease-out · from y 16, opacity 0', 'Section and card entrance'], ['warp-in', '0.55s warp easing · blur 8 → 0', 'KPI section switch'],
    ['scale-in', '0.5s ease-out · from scale 0.95', 'Dialogs, menus'], ['pulse-glow', '2s infinite · 0 → 20 px brand glow', 'Status pill, live dot'], ['card-shine', '0.6s on hover · light sweep', 'Bento card hover'],
    ['border-glow', '3s infinite · brand 15 % → 40 %', 'Highlighted cards'], ['fill-bar', '1.2s ease-out · width 0 → value', 'Skill bars, progress'], ['shimmer', '2s infinite · gradient sweep', 'Skeletons'],
    ['stripe-1 … 5', '18–28s infinite · blurred blobs', 'Home backdrop, md+ only'], ['hover · press', 'scale 1.02 · active 0.97', 'Buttons']];
  let i = 0; for (const r of rows) { const head = i === 0; const row = K.row(0, r[0]); K.f(row, head ? 'dark/hover' : i % 2 ? 'dark/card' : 'dark/bg');
    for (const [k, w] of [[0, 300], [1, 560], [2, 580]]) { const cell = K.col(0, 'Cell'); K.pad(cell, 20, 16);
      h.add(cell, await K.t(r[k], head ? 'label/sm' : k === 0 ? 'mono/md' : 'body/sm', head ? 'dark/faint' : k === 0 ? 'dark/accent-text' : 'dark/sub', { w: w - 40 })); K.fixW(cell, w); h.add(row, cell); }
    h.add(t, row); i++; }
  return h.place(s, b); } });
