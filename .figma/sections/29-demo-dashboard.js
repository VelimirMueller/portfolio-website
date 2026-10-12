// 29 · Demo dashboard — /projects/dashboard-demo: "CRMPro" demo shell. Dark only. Its blue accent stays inside the demo (05 · Code issues, off-palette).
// Glass sidebar and panels over a faded render with a blue and a violet light (the demo's own colours).
section({ name: '29 · Demo dashboard', page: PG.T, run: async () => T.board('29 · Demo dashboard', async (w, mode) => { const D = T.D(w), M = T.MODE(mode);
  const f = T.frame('Dashboard demo · ' + w, w, mode); const shell = h.AL(D ? 'HORIZONTAL' : 'VERTICAL', { name: 'Shell', itemSpacing: 0 }); h.add(f, shell); h.fillW(shell);
  const logo = K.row(10, 'Logo'); h.add(logo, h.box(32, 32, [h.grad([[0, '#3B82F6'], [1, '#A855F7']], 45)], 10, 'Tile'), await K.t('CRMPro', 'heading/h5', K.v(mode, 'text')));
  if (D) { const sb = K.col(6, 'Sidebar'); K.pad(sb, 16, 24); K.fix(sb, 256, 1100); await K.glassSkin(sb, mode, 'panel'); sb.cornerRadius = 0; logo.paddingBottom = 24; h.add(sb, logo);
    for (const [n, ic] of [['Dashboard', 'bar-chart'], ['Pipeline', 'layers'], ['Workflows', 'sparkles'], ['Analytics', 'eye'], ['Settings', 'settings']]) { const on = n === 'Dashboard';
      const r = K.row(14, n); K.pad(r, 16, 12); r.cornerRadius = 12; r.fills = on ? [K.c('blue/500', 0.1)] : []; const c = on ? 'blue/400' : K.v(mode, 'faint');
      h.add(r, await K.icon(ic, c, 18), await K.t(n, 'body/sm-strong', c)); h.add(sb, r); h.fillW(r); }
    h.add(shell, sb); }
  const main = K.col(24, 'Main'); K.pad(main, D ? 32 : 16, D ? 24 : 16, 48); K.fixW(main, D ? w - 256 : w); h.add(shell, main);
  const hd = K.row(12, 'Header'); if (!D) h.add(hd, logo); const ttl = await K.t('Dashboard', 'heading/h3', K.v(mode, 'text')); if (D) { h.add(hd, ttl); ttl.layoutGrow = 1; } else { const sp = K.spacer(); h.add(hd, sp); sp.layoutGrow = 1; }
  if (D) h.add(hd, await T.use('Search', { State: 'Default', Mode: M }, null, () => K.search('Default', mode))); h.add(hd, await K.pill('Live', mode, 'success')); h.add(main, hd); h.fillW(hd);
  const iw = (D ? w - 256 : w) - (D ? 64 : 32); const n = D ? 4 : 1; const kw = Math.floor((iw - 16 * (n - 1)) / n);
  const kg = K.wrap(iw, 16, 'KPIs'); for (const [l, v, t, ic] of [['MRR', '€48.2k', 'Up', 'bar-chart'], ['ACTIVE PIPELINE', '€312k', 'Up', 'layers'], ['WIN RATE', '24 %', 'Flat', 'check-circle'], ['CAC', '€1,120', 'Down', 'user']].slice(0, D ? 4 : 2)) {
    const i = await T.use('KPI Card', { Trend: t, Mode: M }, { Label: l, Value: v }, () => K.kpiCard(t, mode, { label: l, value: v, icon: ic })); h.add(kg, i); T.size(i, kw); }
  h.add(main, kg);
  const ch = await K.glass(mode, iw, 'Revenue growth', 16, 24); ch.cornerRadius = 32; const ct = K.row(8, 'Top'); const tt = await K.t('Revenue Growth', 'heading/h5', K.v(mode, 'text')); h.add(ct, tt); tt.layoutGrow = 1; h.add(ct, await T.tabs('Segmented', mode, 0, ['12M', '6M', '30D', '7D'])); h.add(ch, ct); h.fillW(ct);
  const cw = iw - 48; const pts = [150, 140, 145, 120, 128, 100, 96, 80, 70, 74, 52, 40]; const d = pts.map((y, i) => (i ? 'L' : 'M') + Math.round(i * cw / 11) + ' ' + y).join(' ');
  h.add(ch, K.svg('<path d="' + d + '"/>', 'blue/400', cw, 180, 3, 'Revenue line'));
  const bars = K.row(Math.max(4, Math.floor(cw / 48) - 24), 'Monthly'); bars.counterAxisAlignItems = 'MAX'; for (const v of [40, 52, 48, 66, 60, 74, 80, 72, 90, 96, 104, 120]) { const r = h.rect(24, v, [K.c('violet/500', 0.7)], 4); r.name = 'Bar'; h.add(bars, r); }
  h.add(ch, bars); h.add(main, ch);
  const tp = await K.glass(mode, iw, 'Pipeline table', 0, D ? 8 : 4); h.add(main, tp);
  const tbl = await T.use('Table', { Mode: M }, null, () => K.table(mode)); h.add(tp, tbl); T.size(tbl, iw - (D ? 16 : 8));
  await T.backdrop(main, w, mode, 'site-svc-stack', 'right', { left: D ? 256 + 32 : 16 });
  for (const [c, x, y] of [['#3B82F6', 0.1, 0.05], ['#A855F7', 0.55, 0.45]]) { const g = figma.createEllipse(); g.name = 'Demo light'; g.resize(Math.round(w * 0.4), 520); g.fills = [h.radial(c, 0.28)];
    main.insertChild(2, g); g.layoutPositioning = 'ABSOLUTE'; g.x = Math.round((D ? w - 256 : w) * x); g.y = Math.round(main.height * y); }
  return f; }, { route: '/projects/dashboard-demo', light: false }) });
