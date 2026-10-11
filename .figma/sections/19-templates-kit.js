// Template helpers (no section). Templates live on 20 · Templates, one section per live route under src/app.
// Each board shows Desktop 1440 and Mobile 390, dark first, then light for public routes. Pages are built from instances.
const T = {};
T.MODE = (m) => K.m(m) === 'light' ? 'Light' : 'Dark';
T.D = (w) => w > 600;
T.CW = (w) => T.D(w) ? 1280 : w - 32;          // content width (max-w-7xl / px-4)
T.PAD = (w) => T.D(w) ? 80 : 16;
// use(set, props, texts, fallback): an instance with text overrides, or the fallback builder when the set is missing.
T.use = async (set, props, texts, fb) => { const i = await K.inst(set, props); if (i) { if (texts) await K.texts(i, texts); i.name = set; return i; } return fb ? fb() : null; };
T.frame = (name, w, mode) => { const f = K.col(0, name); K.f(f, K.v(mode, 'bg')); K.fixW(f, w); f.clipsContent = true; return f; };
T.body = (w, gap, top, bottom) => { const c = K.col(gap == null ? (T.D(w) ? 64 : 40) : gap, 'Content'); c.paddingLeft = c.paddingRight = T.PAD(w);
  c.paddingTop = top == null ? (T.D(w) ? 64 : 40) : top; c.paddingBottom = bottom == null ? (T.D(w) ? 96 : 64) : bottom; K.fixW(c, w); return c; };
T.nav = async (w, mode, active) => { const wrap = K.col(0, 'Nav slot'); wrap.counterAxisAlignItems = 'CENTER'; wrap.paddingTop = 24; wrap.paddingBottom = 8; K.fixW(wrap, w);
  const M = T.MODE(mode); const i = T.D(w) ? await T.use('Nav Bar', { Active: active || 'None', Mode: M }, null, () => K.navBar(active || 'None', mode))
    : await T.use('Mobile Header', { Mode: M }, null, () => K.mobileHeader(mode));
  h.add(wrap, i); return wrap; };
T.footer = async (w, mode) => T.use('Footer', { Viewport: T.D(w) ? 'Desktop' : 'Mobile', Mode: T.MODE(mode) }, null, () => K.footer(T.D(w) ? 'Desktop' : 'Mobile', mode));
T.header = async (w, mode, eyebrow, title) => T.use('Section Header', { Variant: 'Proposed', Viewport: T.D(w) ? 'Desktop' : 'Mobile', Mode: T.MODE(mode) }, { Eyebrow: eyebrow.toUpperCase(), Title: title },
  async () => { const x = await K.sectionHeader('Proposed', T.D(w) ? 'Desktop' : 'Mobile', mode); await K.texts(x, { Eyebrow: eyebrow.toUpperCase(), Title: title }); return x; });
// Page top: art panel behind the nav and the section header (ArtBackdrop on SectionHeader).
T.top = async (w, mode, art, active, eyebrow, title, extra) => { const D = T.D(w);
  const p = await K.panel(K.art(art, mode), w, D ? 520 : 400, { name: 'Page top', pad: 0, gap: 0, r: 0, stroke: false, align: 'MIN', mode });
  h.add(p, await T.nav(w, mode, active)); const inner = K.col(24, 'Header'); inner.paddingLeft = inner.paddingRight = T.PAD(w); inner.paddingTop = D ? 120 : 72; K.fixW(inner, w);
  h.add(inner, await T.header(w, mode, eyebrow, title)); if (extra) h.add(inner, extra); h.add(p, inner); return p; };
// Grid row of n equal columns inside the content width (gap 16 = gap-4).
T.grid = (w, n, gap) => { const g = K.wrap(T.CW(w), gap == null ? 16 : gap, 'Grid'); return { g, cw: K.cell(T.CW(w), 0, T.D(w) ? n : 1, gap == null ? 16 : gap) }; };
T.span = (w, of12) => T.D(w) ? Math.round((T.CW(w) - 16 * 11) / 12 * of12 + 16 * (of12 - 1)) : T.CW(w);
T.size = (inst, w) => { if (!inst) return inst; try { inst.resize(w, inst.height); } catch (e) {} return inst; };
T.h2 = async (w, mode, text, eyebrow) => { const c = K.col(8, 'Title'); if (eyebrow) h.add(c, await K.t(eyebrow.toUpperCase(), 'label/eyebrow', K.v(mode, 'accent-text')));
  h.add(c, await K.t(text, 'heading/h2-sans', K.v(mode, 'text'), { w: T.CW(w) })); return c; };
// board: frames for [w, mode] pairs, labelled, side by side.
T.board = async (name, build, o) => { o = o || {}; await K.init(); await K.reindex(); const s = h.section(name);
  const b = h.AL('HORIZONTAL', { name, itemSpacing: 120 }); K.pad(b, 96); b.counterAxisAlignItems = 'MIN'; K.f(b, 'dark/inset');
  const list = [[1440, 'dark'], [390, 'dark']]; if (o.light !== false) list.push([1440, 'light'], [390, 'light']);
  for (const [w, mode] of list) { const c = K.col(24, mode + ' ' + w); const lab = K.row(12, 'Label');
    h.add(lab, await K.pill(mode === 'dark' ? 'Dark' : 'Light', 'dark', mode === 'dark' ? 'brand' : 'neutral'), await K.t((w > 600 ? 'DESKTOP · ' : 'MOBILE · ') + w + (o.route ? ' · ' + o.route : ''), 'label/eyebrow', 'dark/sub'));
    const f = await build(w, mode); f.cornerRadius = w > 600 ? 16 : 40; await K.fx(f, mode === 'dark' ? 'glow/card-dark' : 'shadow/card-light');
    h.add(c, lab, f); h.add(b, c); }
  return h.place(s, b); };
// Card shell for template-only blocks (case studies, legal text, summary).
T.card = (w, mode, cw, name, gap, pad) => { const c = K.card(mode, cw, name, gap == null ? 16 : gap, pad == null ? (T.D(w) ? 32 : 24) : pad); return c; };
T.iconBox = async (mode, icon, tone) => { const b = K.row(0, 'Icon box'); K.fix(b, 44, 44); b.cornerRadius = 12; b.primaryAxisAlignItems = 'CENTER'; b.counterAxisAlignItems = 'CENTER';
  K.f(b, K.v(mode, tone || 'accent'), 0.1); h.add(b, await K.icon(icon, K.v(mode, (tone || 'accent') === 'accent' ? 'accent-text' : tone + '-text'), 20)); return b; };

// ---- admin shell ------------------------------------------------------------------
T.adminFrame = async (w, mode, active, title, sub, main) => { const D = T.D(w); const f = T.frame('Admin · ' + title, w, mode);
  const content = K.col(D ? 28 : 20, 'Main'); K.pad(content, D ? 32 : 16, D ? 32 : 20, D ? 48 : 32);
  const ttl = K.col(6, 'Title'); h.add(ttl, await K.t(title, 'heading/h3', K.v(mode, 'text')), await K.t(sub, 'body/sm', K.v(mode, 'sub'), { w: D ? 900 : w - 32 })); h.add(content, ttl);
  if (D) { const row = K.row(0, 'Shell'); row.counterAxisAlignItems = 'MIN'; h.add(f, row); h.fillW(row);
    h.add(row, await T.use('Admin Sidebar', { Active: active, Mode: T.MODE(mode) }, null, () => K.sidebar(active, mode)));
    const col = K.col(0, 'Column'); K.grow(row, col); h.add(col, await T.use('Admin Header', { Mode: T.MODE(mode) }, { Title: title }, () => K.adminHeader(mode, title)));
    h.add(col, content); K.fixW(content, w - 256); await main(content, w - 256 - 64); }
  else { const bar = K.row(0, 'Admin bar'); K.pad(bar, 16, 14); K.fixW(bar, w); bar.primaryAxisAlignItems = 'SPACE_BETWEEN'; K.s(bar, K.v(mode, 'border')); K.f(bar, K.v(mode, 'bg'));
    h.add(bar, await K.adminLogo(mode), await K.ibtn('Ghost', 'sm', mode, 'menu')); h.add(f, bar); h.add(f, content); K.fixW(content, w); await main(content, w - 32); }
  return f; };
T.magicTabs = async (mode, sel) => { const i = await T.use('Tab Bar', { Style: 'Pill', Mode: T.MODE(mode) }, null, () => K.tabBar('Pill', mode, sel)); return i; };
T.panel = (mode, w, name, gap) => { const c = K.col(gap == null ? 16 : gap, name || 'Panel'); K.pad(c, 24); c.cornerRadius = 32; K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, 'border')); K.fixW(c, w); return c; };
// Tab Bar instance with tab `sel` selected (swaps the nested Tab variants) and optional labels.
T.tabs = async (style, mode, sel, labels) => { const M = T.MODE(mode); const i = await K.inst('Tab Bar', { Style: style, Mode: M });
  if (!i) return K.tabBar(style, mode, sel);
  const tabs = i.findAll ? i.findAll(x => x.type === 'INSTANCE' && /^Tab · /.test(x.name)) : []; const set = K.idx.Tab;
  for (let k = 0; k < tabs.length; k++) { const want = set && set.children.find(c => c.name === 'Style=' + style + ', State=' + (k === sel ? 'Selected' : 'Default') + ', Mode=' + M);
    if (want) tabs[k].swapComponent(want); await K.setText(tabs[k], 'Label', (labels || TABS[style])[k]); }
  i.name = 'Tab Bar'; return i; };
