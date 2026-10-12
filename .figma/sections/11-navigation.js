// 11 · Navigation — header (desktop pill, mobile bar, mobile menu, services dropdown), footer, breadcrumbs, tabs, pagination.
const NAV = { items: ['Home', 'Services', 'Projects', 'About'],
  services: [['Requirements Engineering', 'search'], ['UX/UI & Branding', 'sparkles'], ['Full-Stack Development', 'code'], ['Project Planning & Delivery', 'calendar'], ['Modern Stack', 'layers']],
  mobile: [['Home', 'Home & Overview'], ['Services', 'Product Engineering'], ['Projects', 'Case Studies'], ['About', 'Bio & Experience'], ['Contact', 'Get in touch']] };
const ModeOf = (m) => K.m(m) === 'light' ? 'Light' : 'Dark';

K.toggle = async (kind, mode) => { const n = K.row(0, kind === 'Theme' ? 'Theme toggle' : 'Language toggle'); K.fix(n, 36, 36); n.cornerRadius = 9999;
  n.primaryAxisAlignItems = 'CENTER'; n.counterAxisAlignItems = 'CENTER'; n.fills = [];
  h.add(n, kind === 'Theme' ? await K.icon(K.m(mode) === 'light' ? 'moon' : 'sun', K.v(mode, 'sub'), 18) : await K.t('EN', 'label/nav', K.v(mode, 'sub'), { name: 'Locale' })); return n; };
K.navItem = async (label, active, mode) => { const n = K.row(6, label); K.pad(n, 20, 10); n.cornerRadius = 9999;
  n.fills = active ? [K.c(K.v(mode, 'cta-bg'))] : [];
  const c = K.v(mode, active ? 'cta-text' : 'sub');
  h.add(n, await K.t(label, active ? 'label/nav-active' : 'label/nav', c, { name: 'Label' }));
  if (label === 'Services') h.add(n, await K.icon('chevron-down', c, 12)); return n; };
K.navBar = async (active, mode) => { const n = K.row(4, 'Nav Bar'); K.pad(n, 6); n.cornerRadius = 9999; K.f(n, K.v(mode, 'card'), 0.9); K.s(n, K.v(mode, 'border'));
  await K.fx(n, 'shadow/nav'); const lg = await K.logo(mode); K.pad(lg, 10, 2, 2); lg.paddingRight = 20; h.add(n, lg);
  const items = K.row(2, 'Items'); for (const it of NAV.items) h.add(items, await K.navItem(it, it === active, mode)); h.add(n, items);
  const right = K.row(4, 'Actions'); right.paddingLeft = 16; h.add(right, await K.toggle('Language', mode), await K.toggle('Theme', mode), await K.btn('Brand', 'sm', mode, 'Contact', { noIcon: true })); h.add(n, right); return n; };
K.mobileHeader = async (mode) => { const n = K.row(0, 'Mobile Header'); K.pad(n, 8, 6); n.cornerRadius = 9999; K.f(n, K.v(mode, 'card'), 0.9); K.s(n, K.v(mode, 'border'));
  await K.fx(n, 'shadow/nav'); K.fixW(n, 358); n.primaryAxisAlignItems = 'SPACE_BETWEEN'; const lg = await K.logo(mode); lg.paddingLeft = 4; h.add(n, lg);
  const r = K.row(4, 'Actions'); h.add(r, await K.toggle('Theme', mode), await K.ibtn('Ghost', 'sm', mode, 'menu')); h.add(n, r); return n; };
K.mobileMenu = async (mode) => { const f = K.col(32, 'Mobile Menu'); K.pad(f, 24, 24, 40); K.f(f, K.v(mode, 'bg')); K.fix(f, 390, 844);
  const top = K.row(0, 'Top'); top.primaryAxisAlignItems = 'SPACE_BETWEEN'; h.add(top, await K.logo(mode), await K.ibtn('Outline', 'sm', mode, 'x')); h.add(f, top); h.fillW(top);
  const list = K.col(24, 'Items'); h.add(f, list);
  for (const [it, d] of NAV.mobile) { const c = K.col(4, it); h.add(c, await K.t('// ' + it, 'heading/h2', K.v(mode, it === 'Home' ? 'text' : 'sub'), { name: 'Label' }), await K.t(d, 'mono/caption', K.v(mode, 'faint'), { name: 'Description' }));
    if (it === 'Services') { const sub = K.col(10, 'Children'); sub.paddingLeft = 4; sub.paddingTop = 8;
      for (const [sv] of NAV.services.slice(0, 3)) { const r = K.row(10, sv); h.add(r, K.dot(4, K.v(mode, 'accent')), await K.t(sv, 'body/sm', K.v(mode, 'sub'))); h.add(sub, r); } h.add(c, sub); }
    h.add(list, c); }
  const sp = K.spacer(); h.add(f, sp); sp.layoutGrow = 1;
  const foot = K.row(12, 'Bottom'); h.add(foot, await K.toggle('Language', mode), await K.toggle('Theme', mode)); const cta = await K.btn('Brand', 'lg', mode, 'Contact'); K.grow(foot, cta); h.add(f, foot); h.fillW(foot); return f; };
K.dropdown = async (mode) => { const f = K.col(2, 'Nav Dropdown'); K.pad(f, 8); f.cornerRadius = 12; K.f(f, K.v(mode, K.m(mode) === 'light' ? 'card' : 'hover')); K.s(f, K.v(mode, 'border'));
  await K.fx(f, 'shadow/popover'); K.fixW(f, 264);
  let i = 0; for (const [sv, ic] of NAV.services) { const r = K.row(12, sv); K.pad(r, 12, 10); r.cornerRadius = 8; r.fills = i === 1 ? [K.c(K.v(mode, K.m(mode) === 'light' ? 'hover' : 'card'))] : [];
    const c = K.v(mode, i === 1 ? 'text' : 'sub'); h.add(r, await K.icon(ic, i === 1 ? K.v(mode, 'accent-text') : c, 16), await K.t(sv, 'body/sm', c)); h.add(f, r); h.fillW(r); i++; } return f; };
K.footer = async (viewport, mode) => { const D = viewport === 'Desktop'; const W = D ? 1440 : 390, P = D ? 80 : 16;
  const f = K.col(D ? 48 : 36, 'Footer'); K.pad(f, P, D ? 64 : 48, 32); K.f(f, K.v(mode, 'bg')); K.fixW(f, W);
  const line = K.line(10, K.v(mode, 'border'), 'Top border'); const grid = h.AL(D ? 'HORIZONTAL' : 'VERTICAL', { name: 'Columns', itemSpacing: D ? 48 : 32 });
  const brand = K.col(12, 'Brand'); h.add(brand, await K.logo(mode, false), await K.t('Velimir Müller', 'heading/h3', K.v(mode, 'text')),
    await K.t('Senior Product Engineer.\nFull-Stack · Infrastructure · Agent Tooling.', 'body/sm', K.v(mode, 'sub'), { w: D ? 520 : 358 }),
    await K.t('From business needs to deployment — full lifecycle ownership.', 'body/sm', K.v(mode, 'faint'), { w: D ? 520 : 358 }));
  if (D) K.fixW(brand, 620); h.add(grid, brand);
  const site = K.col(14, 'Sitemap'); h.add(site, await K.t('SITEMAP', 'label/eyebrow', K.v(mode, 'faint')));
  for (const l of ['Services', 'Projects', 'About']) h.add(site, await K.link('Muted', 'Default', mode, l));
  const con = K.col(14, 'Connect'); h.add(con, await K.t('CONNECT', 'label/eyebrow', K.v(mode, 'faint'))); const icons = K.row(12, 'Social');
  for (const ic of ['linkedin', 'github', 'mail']) h.add(icons, await K.ibtn('Outline', 'sm', mode, ic)); h.add(con, icons);
  if (D) { K.fixW(site, 240); K.fixW(con, 240); } h.add(grid, site, con);
  const bottom = h.AL(D ? 'HORIZONTAL' : 'VERTICAL', { name: 'Bottom bar', itemSpacing: 16 }); if (D) { bottom.primaryAxisAlignItems = 'SPACE_BETWEEN'; bottom.counterAxisAlignItems = 'CENTER'; }
  const legal = K.row(20, 'Legal'); for (const l of ['Imprint', 'Privacy', 'Privacy settings']) h.add(legal, await K.link('Muted', 'Default', mode, l));
  h.add(bottom, legal, await K.t('Built with Next.js, Supabase & Vercel.', 'mono/caption', K.v(mode, 'faint')));
  h.add(f, line, grid, K.line(10, K.v(mode, 'border'), 'Divider'), bottom); for (const n of [line, grid, f.children[2], bottom]) h.fillW(n); return f; };
K.crumbs = async (depth, mode) => { const r = K.row(8, 'Breadcrumbs'); const parts = depth === '3' ? ['Home', 'Services', 'UX/UI & Branding'] : ['Home', 'Projects'];
  for (let i = 0; i < parts.length; i++) { const last = i === parts.length - 1;
    h.add(r, await K.t(parts[i], last ? 'label/nav-active' : 'label/nav', K.v(mode, last ? 'text' : 'sub'), { name: last ? 'Current' : 'Crumb ' + (i + 1) }));
    if (!last) h.add(r, await K.icon('chevron-right', K.v(mode, 'faint'), 14)); } return r; };
K.tab = async (style, state, mode, label) => { const sel = state === 'Selected', H = state === 'Hover';
  const col = style === 'Pill' && sel ? K.v(mode, 'accent-text') : K.v(mode, sel || H ? 'text' : 'sub');
  if (style === 'Underline') { const c = K.col(0, 'Tab'); c.counterAxisAlignItems = 'CENTER'; const r = K.row(8, 'Body'); K.pad(r, 16, 10); h.add(r, await K.t(label, sel ? 'body/sm-strong' : 'body/sm', col, { name: 'Label' }));
    const bar = h.rect(10, 2, [K.c(K.v(mode, 'accent'), sel ? 1 : H ? 0.3 : 0)]); bar.name = 'Indicator'; h.add(c, r, bar); h.fillW(bar); if (sel) await K.fx(bar, 'glow/pulse');
    if (state === 'Focus') await K.fx(c, 'focus/ring-' + K.m(mode)); return c; }
  const n = K.row(8, 'Tab'); K.pad(n, style === 'Pill' ? 16 : 14, style === 'Pill' ? 8 : 6); n.cornerRadius = style === 'Pill' ? 12 : 8;
  n.fills = sel ? [K.c(style === 'Pill' ? K.v(mode, 'accent') : K.v(mode, K.m(mode) === 'light' ? 'card' : 'secondary-bg'), style === 'Pill' ? 0.1 : null)] : H ? [K.c(K.v(mode, 'hover'))] : [];
  h.add(n, await K.t(label, sel ? 'label/nav-active' : 'label/nav', col, { name: 'Label' }));
  if (style === 'Segmented') h.add(n, await K.t(label === 'New' ? '3' : '12', 'label/sm', K.v(mode, sel ? 'accent-text' : 'faint'), { name: 'Count' }));
  if (state === 'Focus') await K.fx(n, 'focus/ring-' + K.m(mode)); return n; };
const TABS = { Underline: ['Website', 'Supabase', 'Vercel', 'Magic'], Pill: ['Pool', 'Decks', 'Wishlist', 'Add card'], Segmented: ['All', 'New', 'Read', 'Archived'] };
K.tabBar = async (style, mode, sel) => { const r = K.row(style === 'Segmented' ? 2 : 4, 'Tab Bar'); sel = sel || 0;
  if (style === 'Segmented') { K.pad(r, 4); r.cornerRadius = 12; K.f(r, K.v(mode, 'input-bg')); K.s(r, K.v(mode, 'border')); }
  for (let i = 0; i < 4; i++) { const st = i === sel ? 'Selected' : 'Default'; const lab = TABS[style][i];
    const t = await K.inst('Tab', { Style: style, State: st, Mode: ModeOf(mode) }); if (t) { await K.setText(t, 'Label', lab); t.name = 'Tab · ' + lab; h.add(r, t); } else h.add(r, await K.tab(style, st, mode, lab)); }
  if (style === 'Underline') { const c = K.col(0, 'Tab Bar'); h.add(c, r); const l = K.line(10, K.v(mode, 'border'), 'Baseline'); h.add(c, l); h.fillW(l); return c; } return r; };
K.pager = async (page, mode) => { const r = K.row(6, 'Pagination'); const cur = page === 'First' ? 1 : page === 'Last' ? 8 : 3;
  const arrow = async (ic, dis) => { const b = await K.iconButton('Ghost', 'sm', dis ? 'Disabled' : 'Default', mode, ic); return b; };
  h.add(r, await arrow('chevron-left', cur === 1));
  for (const p of [1, 2, 3, '…', 8]) { const n = K.row(0, 'Page ' + p); K.fix(n, 36, 36); n.cornerRadius = 10; n.primaryAxisAlignItems = 'CENTER'; n.counterAxisAlignItems = 'CENTER';
    const on = p === cur; n.fills = on ? [K.c(K.v(mode, 'cta-bg'))] : [];
    h.add(n, await K.t(String(p), on ? 'label/nav-active' : 'label/nav', K.v(mode, on ? 'cta-text' : 'sub'))); h.add(r, n); }
  h.add(r, await arrow('chevron-right', cur === 8)); return r; };

section({ name: '11 · Navigation', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('11 · Navigation'); const b = K.board('Navigation', 1800);
  h.add(b, await K.head('11 · Components', 'Navigation', 'Floating pill nav with blur, 24 px from the top (Navigation.tsx). Under 768 px: a bar and a full-screen menu. Footer with sitemap and connect links. Breadcrumbs, tabs and pagination are targets for the rebuild (F-6).'));
  await K.set(b, 'Nav Bar', 'Desktop header. Active = the current route. Brand CTA Contact. Blur 24 behind (blur/backdrop), 90 % card fill, shadow/nav.', [['Active', ['Home', 'Services', 'Projects', 'About', 'None']]], (p, m) => K.navBar(p.Active, m), { colAxis: null });
  await K.set(b, 'Mobile Header', 'Header under 768 px. Menu opens the Mobile Menu.', [], (p, m) => K.mobileHeader(m));
  await K.set(b, 'Mobile Menu', 'Full-screen dialog (role="dialog"). Items in heading/h2 with "// " prefix and a description.', [['State', ['Open']]], (p, m) => K.mobileMenu(m));
  await K.set(b, 'Nav Dropdown', 'Services dropdown under the nav item (w-56, rounded-xl, shadow/popover).', [], (p, m) => K.dropdown(m));
  await K.set(b, 'Footer', 'Footer.tsx. Brand block, Sitemap, Connect (Icon Button Outline). Bottom bar: legal links and the stack line.', [['Viewport', ['Desktop', 'Mobile']]], (p, m) => K.footer(p.Viewport, m));
  await K.set(b, 'Breadcrumbs', 'Visual breadcrumbs for deep routes (service detail). Code has JSON-LD only (F-6).', [['Depth', ['2', '3']]], (p, m) => K.crumbs(p.Depth, m));
  await K.set(b, 'Tab', 'One tab. Underline = admin KPIs (Tabs.tsx). Pill = Magic tabs. Segmented = inbox status filter.', [['Style', ['Underline', 'Pill', 'Segmented']], ['State', ['Default', 'Hover', 'Selected', 'Focus']]],
    (p, m) => K.tab(p.Style, p.State, m, TABS[p.Style][1]));
  await K.set(b, 'Tab Bar', 'Four Tab instances. Override the labels per screen; swap the Selected tab with the State property.', [['Style', ['Underline', 'Pill', 'Segmented']]], (p, m) => K.tabBar(p.Style, m), { colAxis: null });
  await K.set(b, 'Pagination', 'Pagination for long lists (inbox, card pool). Target for the rebuild (F-6).', [['Page', ['First', 'Middle', 'Last']]], (p, m) => K.pager(p.Page, m));
  return h.place(s, b); } });
