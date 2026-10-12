// 33 · Admin KPIs — /admin/kpis (KpiDashboard): underline tabs, KPI grid, "When visitors come" and "Top pages". Dark only.
section({ name: '33 · Admin KPIs', page: PG.T, run: async () => T.board('33 · Admin KPIs', async (w, mode) => T.adminFrame(w, mode, 'KPIs', 'KPIs', 'First-party · cookieless', async (main, iw) => {
  const D = T.D(w), M = T.MODE(mode); h.add(main, await T.tabs('Underline', mode, 0));
  const n = D ? 4 : 2; const kw = Math.floor((iw - 16 * (n - 1)) / n); const g = K.wrap(iw, 16, 'KPIs');
  for (const [l, v, t, ic] of [['VISITORS · 30 D', '1,284', 'Up', 'eye'], ['PAGE VIEWS', '4,910', 'Up', 'layers'], ['BOUNCE RATE', '38 %', 'Down', 'arrow-up-right'], ['AVG. SESSION', '2m 14s', 'Flat', 'calendar']])
    { const i = await T.use('KPI Card', { Trend: t, Mode: M }, { Label: l, Value: v }, () => K.kpiCard(t, mode, { label: l, value: v, icon: ic, w: kw })); h.add(g, i); T.size(i, kw); }
  h.add(main, g);
  const row = h.AL(D ? 'HORIZONTAL' : 'VERTICAL', { name: 'Panels', itemSpacing: 16 }); h.add(main, row); const pw = D ? Math.floor((iw - 16) / 2) : iw;
  const heat = T.panel(mode, pw, 'When visitors come', 14); h.add(heat, await K.t('WHEN VISITORS COME', 'label/sm', K.v(mode, 'faint')), await K.t('Weekdays, 9–11 and 14–16', 'heading/h5', K.v(mode, 'text')));
  const cells = K.col(4, 'Heatmap'); const cell = Math.floor((pw - 48 - 23 * 3) / 24);
  for (let d = 0; d < 7; d++) { const r = K.row(3, 'Day ' + d); for (let hr = 0; hr < 24; hr++) { const v = Math.max(0.06, Math.min(1, (d < 5 ? 1 : 0.4) * (Math.exp(-Math.pow(hr - 10, 2) / 6) + 0.8 * Math.exp(-Math.pow(hr - 15, 2) / 5))));
      const q = h.rect(cell, cell, [K.c(K.v(mode, 'accent'), Math.round(v * 100) / 100)], 2); q.name = 'h' + hr; h.add(r, q); } h.add(cells, r); }
  h.add(heat, cells); h.add(row, heat);
  const top = T.panel(mode, pw, 'Top pages', 10); h.add(top, await K.t('TOP PAGES', 'label/sm', K.v(mode, 'faint')));
  for (const [p, v, pct] of [['/', '1,902', 1], ['/projects', '1,140', 0.6], ['/services', '880', 0.46], ['/about', '611', 0.32], ['/contact', '377', 0.2]]) {
    const r = K.col(6, p); const t = K.row(8, 'Line'); const pt = await K.t(p, 'mono/md', K.v(mode, 'text')); h.add(t, pt); pt.layoutGrow = 1; h.add(t, await K.t(v, 'mono/caption', K.v(mode, 'sub')));
    const bar = h.rect(Math.max(4, Math.round((pw - 48) * pct)), 4, [K.c(K.v(mode, 'accent'))], 2); bar.name = 'Share'; h.add(r, t, bar); h.add(top, r); h.fillW(r); h.fillW(t); }
  h.add(row, top); }), { route: '/admin/kpis', light: false }) });
