// 06 · Iconography — the Icon component set (Name × Mode), vector strokes bound to dark/text and light/text.
// Built before the component pages, because buttons, nav and rows use Icon instances.
section({ name: '06 · Iconography', page: PG.F, run: async () => {
  await K.init(); const s = h.section('06 · Iconography'); const b = K.board('Iconography', 2400);
  h.add(b, await K.head('06 · Foundations', 'Iconography', 'Lucide-style line icons, as the site uses lucide-react. 24 px grid, 2 px stroke, round caps and joins. Use 16 px in buttons and rows, 20 px in nav and toolbars, 24 px in feature boxes. Recolour with semantic text roles only.'));
  await K.set(b, 'Icon', 'Vector icon. Name = the lucide-react name. Strokes bind to <mode>/text; override the stroke with another text role (sub, accent-text, success-text, danger-text).',
    [['Name', K.ICON_NAMES]], async (p, m) => { const f = K.iconNode(p.Name, K.v(m, 'text'), 24); return f; }, { gap: 28 });
  const demo = K.row(48, 'Sizes'); demo.counterAxisAlignItems = 'MAX';
  for (const [sz, use] of [[16, 'icon-sm · buttons, rows, chips'], [20, 'icon-md · nav, toolbars'], [24, 'icon-lg · feature boxes']]) {
    const c = K.col(12, 'size ' + sz); const r = K.row(16, 'Icons');
    for (const n of ['arrow-right', 'mail', 'github', 'check-circle', 'alert-triangle']) h.add(r, await K.icon(n, 'dark/text', sz));
    h.add(c, r, await K.t(sz + ' px · ' + use, 'mono/caption', 'dark/sub')); h.add(demo, c); }
  const colours = K.row(16, 'Colours');
  for (const c of ['dark/text', 'dark/sub', 'dark/accent-text', 'dark/success-text', 'dark/warning-text', 'dark/danger-text']) {
    const box = K.col(8, c); box.counterAxisAlignItems = 'CENTER'; K.pad(box, 16); box.cornerRadius = 12; K.f(box, 'dark/card'); K.s(box, 'dark/border');
    h.add(box, await K.icon('sparkles', c, 24), await K.t(c.split('/')[1], 'mono/caption', 'dark/sub')); h.add(colours, box); }
  const box = K.card('dark', 2240, 'Usage', 32, 32); const r = K.row(80, 'Usage row'); r.counterAxisAlignItems = 'MIN';
  h.add(r, demo, colours); h.add(box, await K.t('SIZES AND COLOURS', 'label/eyebrow', 'dark/accent-text'), r); h.add(b, box);
  return h.place(s, b); } });
