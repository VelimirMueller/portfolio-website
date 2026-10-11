// 22 · Services — /services (ServicesContent.tsx): offer header, "From Idea to Go-Live" hero card, services in detail list.
const SERVICES = [['01', 'Requirements Engineering', 'Understanding Business', 'search', 'svc-requirements'], ['02', 'UX/UI & Branding', 'Design as Brand Message', 'sparkles', 'svc-ux'],
  ['03', 'Full-Stack Development', 'Modern Stack', 'code', 'svc-frontend'], ['04', 'Project Planning & Delivery', 'Start to Deployment', 'calendar', 'svc-delivery'], ['05', 'Modern Stack', 'Full-Stack Toolbox', 'layers', 'svc-stack']];
section({ name: '22 · Services', page: PG.T, run: async () => T.board('22 · Services', async (w, mode) => {
  const D = T.D(w), CW = T.CW(w), M = T.MODE(mode); const f = T.frame('Services · ' + w, w, mode);
  h.add(f, await T.top(w, mode, 'services', 'Services', 'End-to-End Engineering', 'OFFER.'));
  const body = T.body(w, 16, D ? 16 : 8); h.add(f, body);
  const r = K.wrap(CW, 16, 'Row'); h.add(body, r);
  const hw = T.span(w, 7); const hero = T.card(w, mode, hw, 'From Idea to Go-Live', 20, D ? 40 : 24); K.f(hero, K.v(mode, 'hover'));
  h.add(hero, await K.t('From Idea to Go-Live', 'heading/h2', K.v(mode, 'text'), { w: hw - 80 }),
    await K.t('Understanding business requirements, translated into UX/UI, built with a modern stack and shipped to production. One contact for the whole way.', 'body/md', K.v(mode, 'sub'), { w: hw - 80 }));
  const pl = K.col(10, 'Pipelines'); for (const [t, tone] of [['Requirements → UX/UI → Code', 'brand'], ['Planning → Development → Deployment', 'neutral']]) h.add(pl, await K.pill(t, mode, tone)); h.add(hero, pl);
  const va = K.col(12, 'Value add'); K.pad(va, 20); va.cornerRadius = 16; K.f(va, K.v(mode, 'card')); K.s(va, K.v(mode, 'border'));
  h.add(va, await K.t('VALUE ADD', 'label/eyebrow', K.v(mode, 'faint')));
  for (const t of ['No translation losses between business and tech', 'Design system and code from one hand', 'Production-ready: tests, CI, monitoring']) {
    const l = K.row(12, t); const d = K.row(0, 'Check'); K.fix(d, 20, 20); d.cornerRadius = 10; d.primaryAxisAlignItems = 'CENTER'; d.counterAxisAlignItems = 'CENTER'; K.f(d, K.v(mode, 'cta-bg'));
    h.add(d, await K.icon('check', K.v(mode, 'cta-text'), 12)); h.add(l, d, await K.t(t, 'body/sm', K.v(mode, 'text'), { w: hw - 160 })); h.add(va, l); }
  h.add(hero, va); h.fillW(va); const cta = await K.btn('Primary', 'lg', mode, 'Check Availability'); h.add(hero, cta); h.fillW(cta); h.add(r, hero);
  const lw = T.span(w, 5); const list = T.card(w, mode, lw, 'Services in detail', 8, 24);
  h.add(list, await K.t('SERVICES IN DETAIL', 'label/eyebrow', K.v(mode, 'accent-text')));
  for (const [n, t, sub, ic] of SERVICES) { const row = K.row(14, t); K.pad(row, 12); row.cornerRadius = 12; K.f(row, K.v(mode, n === '02' ? 'hover' : 'inset'));
    const x = K.col(2, 'Text'); h.add(x, await K.t(t, 'body/sm-strong', K.v(mode, 'text')), await K.t(n + ' · ' + sub, 'mono/caption', K.v(mode, 'faint')));
    h.add(row, await T.iconBox(mode, ic), x); x.layoutGrow = 1; h.add(row, await K.icon('arrow-right', K.v(mode, n === '02' ? 'accent-text' : 'faint'), 16)); h.add(list, row); h.fillW(row); }
  h.add(r, list);
  const g = T.grid(w, 5); h.add(body, await T.h2(w, mode, 'Five services, one lifecycle', 'Overview'), g.g);
  for (const [n, t, sub, ic, art] of D ? SERVICES : SERVICES.slice(0, 2)) { const i = await T.use('Service Card', { State: n === '02' ? 'Hover' : 'Default', Mode: M }, { Index: n, Title: t, Body: sub + '.' }, () => K.serviceCard('Default', mode));
    h.add(g.g, i); T.size(i, g.cw); }
  h.add(f, await T.footer(w, mode)); return f; }, { route: '/services' }) });
