// velimir-mueller.de design system (portfolio-website#83). Shared helpers for every section file.
// All files of this pack run in one scope, in file-name order. `h` is the vfb helper object, `pack` is pack.json.
// Rules for this pack:
// - Every solid colour comes from a variable: K.c('<var>', opacity). Fallback hex values come from tokens.json.
// - Every text uses a text style from tokens.json: K.t(str, '<style>', '<colour var>', opts). No font/size overrides.
// - Every component is a component set with Mode=Dark|Light: K.set(...).

const PG = { F: '00 · Foundations', C: '10 · Components', T: '20 · Templates' };
const K = { hex: {}, ready: false, idx: {}, MODES: ['Dark', 'Light'] };

// ---- tokens -----------------------------------------------------------------
// Reads tokens.json once (served by `vfb up` as <pack>/__tokens.json) so fallbacks match the token values.
K.load = (tok) => { const raw = {};
  for (const entries of Object.values(tok.collections || {})) for (const [n, d] of Object.entries(entries)) raw[n] = d && typeof d === 'object' ? d.value : d;
  const res = (n, depth) => { const v = raw[n]; if (depth > 8) return null;
    if (typeof v === 'string' && /^\{.+\}$/.test(v)) return res(v.slice(1, -1), depth + 1);
    return typeof v === 'string' && v[0] === '#' ? v.slice(0, 7) : null; };
  for (const n of Object.keys(raw)) { const x = res(n, 0); if (x) K.hex[n] = x; }
  K.text = tok.text || {}; };
K.init = async () => { if (K.ready) return;
  try { K.load(JSON.parse(await h.getText(pack.id + '/__tokens.json'))); } catch (e) { h.log('kit: tokens.json not readable (' + e.message + ')'); }
  K.ready = true; };

// m = 'dark' | 'light' | 'Dark' | 'Light'
K.m = (m) => String(m || 'dark').toLowerCase() === 'light' ? 'light' : 'dark';
K.v = (m, role) => K.m(m) + '/' + role;                       // semantic variable name for a mode
K.c = (name, op) => h.paint(name, op, K.hex[name] || '#ff00ff');  // bound paint
K.f = (n, name, op) => { n.fills = [K.c(name, op)]; return n; };
K.s = (n, name, w, op) => { n.strokes = [K.c(name, op)]; n.strokeWeight = w || 1; n.strokeAlign = 'INSIDE'; return n; };
K.fx = async (n, style) => h.effect(n, style);

// ---- text -------------------------------------------------------------------
// K.t(str, style, colourVar, {w, align, name, op})
K.t = async (str, style, color, o) => h.text(str, Object.assign({ style, color, fb: K.hex[color] }, o || {}));

// ---- layout -----------------------------------------------------------------
K.col = (gap, name) => h.AL('VERTICAL', { itemSpacing: gap == null ? 16 : gap, name: name || 'Column' });
K.row = (gap, name) => h.AL('HORIZONTAL', { itemSpacing: gap == null ? 16 : gap, name: name || 'Row', counterAxisAlignItems: 'CENTER' });
K.pad = (f, x, y, b) => { f.paddingLeft = f.paddingRight = x; f.paddingTop = y == null ? x : y; f.paddingBottom = b == null ? (y == null ? x : y) : b; return f; };
K.fixW = (f, w) => { f.resize(w, Math.max(1, f.height));
  if (f.layoutMode === 'VERTICAL') { f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; }
  else if (f.layoutMode === 'HORIZONTAL') { f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO'; } return f; };
K.fix = (f, w, hh) => { f.resize(w, hh); if (f.layoutMode && f.layoutMode !== 'NONE') { f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'FIXED'; } return f; };
K.wrap = (w, gap, name) => { const r = h.AL('HORIZONTAL', { itemSpacing: gap, counterAxisSpacing: gap, name: name || 'Grid' });
  r.layoutWrap = 'WRAP'; r.resize(w, 10); r.primaryAxisSizingMode = 'FIXED'; r.counterAxisSizingMode = 'AUTO'; return r; };
K.spacer = () => { const g = h.AL('HORIZONTAL', { name: 'Spacer' }); g.resize(1, 1); return g; };
K.grow = (parent, n) => { h.add(parent, n); n.layoutGrow = 1; return n; };
K.line = (w, color, name) => { const r = h.rect(w, 1, [K.c(color)]); r.name = name || 'Divider'; return r; };
K.dot = (size, color, name) => { const e = figma.createEllipse(); e.resize(size, size); e.fills = [K.c(color)]; e.name = name || 'Dot'; return e; };
K.cell = (w, pad, cols, gap) => Math.floor((w - 2 * pad - (gap == null ? 24 : gap) * (cols - 1)) / cols);

// ---- boards (one per section) ------------------------------------------------
K.board = (name, w, mode) => { const b = h.AL('VERTICAL', { name, itemSpacing: 72 }); K.pad(b, 80, 80, 104);
  K.f(b, K.v(mode, 'bg')); K.fixW(b, w || 1600); return b; };
K.head = async (code, title, sub, mode) => { mode = mode || 'dark'; const x = K.col(14, 'Header');
  h.add(x, await K.t(code.toUpperCase(), 'label/eyebrow', K.v(mode, 'accent-text')), await K.t(title, 'heading/h1', K.v(mode, 'text')));
  if (sub) h.add(x, await K.t(sub, 'body/lg', K.v(mode, 'sub'), { w: 960 }));
  const r = h.rect(120, 2, [h.grad([[0, '#6366F1'], [1, '#A5B4FC', 0]], 0)]); r.name = 'Rule'; h.add(x, r); return x; };
K.sub = async (title, note, mode) => { const x = K.col(8, title); mode = mode || 'dark';
  h.add(x, await K.t(title, 'heading/h3', K.v(mode, 'text')));
  if (note) h.add(x, await K.t(note, 'body/sm', K.v(mode, 'sub'), { w: 1200 })); return x; };
K.card = (mode, w, name, gap, pad) => { const c = K.col(gap == null ? 16 : gap, name || 'Card'); K.pad(c, pad == null ? 24 : pad);
  K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, 'border')); c.cornerRadius = 24; c.clipsContent = true; if (w) K.fixW(c, w); return c; };
K.mkSection = (name) => h.section(name);
K.done = (s, b) => h.place(s, b);

// ---- art --------------------------------------------------------------------
K.LIGHT = { about: 1, 'build-synthwerk': 1, contact: 1, hero: 1, mcp: 1, projects: 1, services: 1, 'svc-ux': 1, synthwerk: 1 };
// Art paths are '<pack id>/<file>'. vfb serve maps 'website/' to .figma/art/ and finds the file under any image
// extension (hero-v1.png -> hero-v1.jpg). `vfb test --strict` fails on a path with no file.
K.art = (name, mode) => (K.m(mode) === 'light' && K.LIGHT[name]) ? 'website/light/' + name + '-light.png' : 'website/' + name + '-v1.png';
// Art panel: image fill over the mode background, with a fade so text on top stays readable.
K.panel = async (path, w, hh, o) => { o = o || {}; const mode = K.m(o.mode); const pad = o.pad == null ? 40 : o.pad;
  const f = h.AL(o.dir || 'VERTICAL', { name: o.name || 'Art panel', itemSpacing: o.gap == null ? 16 : o.gap }); K.pad(f, pad); K.fix(f, w, hh);
  f.primaryAxisAlignItems = o.align || 'MAX'; f.cornerRadius = o.r == null ? 24 : o.r; f.clipsContent = true;
  const base = mode === 'light' ? '#FAFAFA' : '#09090B';
  const over = o.over || [h.grad([[0, base, 0.05], [0.45, base, 0.35], [1, base, 0.94]], 90)];
  // light mode without a *-light render: the site inverts the art; here it sits faint on the light background.
  const op = o.op != null ? o.op : (mode === 'light' && path.indexOf('/light/') < 0 ? 0.18 : 1);
  await h.imgFill(f, path, { under: [K.c(K.v(mode, 'bg'))], over, op });
  if (o.stroke !== false) K.s(f, K.v(mode, 'border')); return f; };

// ---- liquid glass (vm-brand B-48: glass is the website surface; READMEs and banners stay flat) ----
// Matches .glass / .glass-inner in globals.css: a translucent bound fill, a faint white edge, a specular edge from
// white (top left) to indigo (bottom right), and an effect style with the backdrop blur and the shadows.
// Glass only reads as glass over art: put it on a T.stage (templates) or over an art panel.
K.GLASS = { dark: { panel: ['dark/bg', 0.42], inner: ['base/white', 0.035], edge: [0.07, 0.07], spec: 0.22, tint: '#818CF8' },
  light: { panel: ['base/white', 0.58], inner: ['base/white', 0.5], edge: [0.7, 0.75], spec: 0.75, tint: '#6366F1' } };
K.glassSkin = async (n, mode, kind) => { const m = K.m(mode), g = K.GLASS[m], inner = kind === 'inner';
  const [fill, op] = g[inner ? 'inner' : 'panel']; n.fills = [K.c(fill, op)];
  n.strokes = [K.c('base/white', g.edge[inner ? 1 : 0]), h.grad([[0, '#FFFFFF', g.spec], [0.31, '#FFFFFF', 0], [0.63, '#FFFFFF', 0], [1, g.tint, 0.5]], 45)];
  n.strokeWeight = 1; n.strokeAlign = 'INSIDE'; await K.fx(n, 'glass/' + (inner ? 'inner' : 'panel') + '-' + m); return n; };
// Glass panel (.glass, 24 px round) with the kit's one soft indigo glow in the top right corner.
K.glass = async (mode, w, name, gap, pad) => { const c = K.col(gap == null ? 20 : gap, name || 'Glass panel'); K.pad(c, pad == null ? 40 : pad);
  c.cornerRadius = 24; c.clipsContent = true; await K.glassSkin(c, mode, 'panel');
  if (w) { K.fixW(c, w); const g = figma.createEllipse(); g.name = 'Glow'; g.resize(Math.round(w * 0.45), 320); g.fills = [h.radial('#6366F1', K.m(mode) === 'light' ? 0.1 : 0.16)];
    h.absAt(c, g, Math.round(w * 0.5), -160); } return c; };
// Glass card inside a panel (.glass-inner, 16 px round).
K.glassCard = async (mode, w, name, gap, pad) => { const c = K.col(gap == null ? 8 : gap, name || 'Glass card'); K.pad(c, pad == null ? 28 : pad);
  c.cornerRadius = 16; c.clipsContent = true; await K.glassSkin(c, mode, 'inner'); if (w) K.fixW(c, w); return c; };
// Signature marks (vm-brand §1a): the `// LABEL` eyebrow and the 44 × 2 accent tick.
K.slash = async (label, mode, name) => K.t('// ' + label.toUpperCase(), 'label/eyebrow', K.v(mode, 'accent-text'), { name: name || 'Eyebrow' });
K.tick = (w, name) => { const r = h.rect(w || 44, 2, [K.c('brand/500')]); r.name = name || 'Tick'; return r; };

// ---- icons (24 px, 2 px stroke, round caps: the lucide-react look of the site) ----
K.ICONS = {
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
  'arrow-up-right': '<path d="M7 17 17 7"/><path d="M7 7h10v10"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'menu': '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  'moon': '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  'mail': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'github': '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  'linkedin': '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  'external-link': '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  'alert-triangle': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  'x-circle': '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'minus': '<path d="M5 12h14"/>',
  'trash': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  'inbox': '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  'bar-chart': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'layers': '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  'code': '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
  'terminal': '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
  'user': '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  'filter': '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
  'copy': '<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'loader': '<path d="M21 12a9 9 0 1 1-6.22-8.56"/>',
  'star': '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
  'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  'map-pin': '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  'settings': '<circle cx="12" cy="12" r="3"/><path d="M12 1v4"/><path d="M12 19v4"/><path d="m4.22 4.22 2.83 2.83"/><path d="m16.95 16.95 2.83 2.83"/><path d="M1 12h4"/><path d="M19 12h4"/><path d="m4.22 19.78 2.83-2.83"/><path d="m16.95 7.05 2.83-2.83"/>',
  'sparkles': '<path d="M12 3l1.9 5.8L20 10.5l-6.1 1.7L12 18l-1.9-5.8L4 10.5l6.1-1.7L12 3z"/><path d="M5 3v4"/><path d="M3 5h4"/>',
  'quote': '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2H4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .01-1 1.03V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.76-2.02-2-2h-4c-1.25 0-2 .75-2 1.97V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
};
K.ICON_NAMES = Object.keys(K.ICONS);
// A bound vector icon (no instance). Used to build the Icon set and as fallback when the set is not built yet.
K.iconNode = (name, color, size) => { const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (K.ICONS[name] || K.ICONS.x) + '</svg>';
  const f = figma.createNodeFromSvg(svg); f.name = name; f.fills = []; f.clipsContent = false;
  for (const n of f.findAll ? f.findAll(() => true) : []) {
    if ('strokes' in n && n.strokes && n.strokes.length) n.strokes = [K.c(color)];
    if ('fills' in n && n.fills && n.fills.length) n.fills = [];
    try { n.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; } catch (e) {} }
  if (size && size !== 24) f.rescale ? f.rescale(size / 24) : f.resize(size, size);
  return f; };

// ---- component sets ---------------------------------------------------------------
const prod = (axes) => axes.reduce((acc, [k, vals]) => acc.flatMap(a => vals.map(v => Object.assign({}, a, { [k]: v }))), [{}]);
// K.set(parent, name, desc, axes, build, {colAxis, modes, gap})
// axes: [['Kind', [...]], ['State', [...]]]. Mode=Dark|Light is added. Columns = colAxis (default: last axis), rows = the other axes.
// Dark variants fill the top half, light variants the bottom half; the set background splits there.
K.set = async (parent, name, desc, axes, build, o) => { o = o || {}; const modes = o.modes || K.MODES; const gap = o.gap == null ? 24 : o.gap, PAD = 40, MG = 72;
  const colAxis = o.colAxis !== undefined ? o.colAxis : (axes.length ? axes[axes.length - 1][0] : null);
  const colVals = colAxis ? axes.find(a => a[0] === colAxis)[1] : [null];
  const rows = prod(axes.filter(a => a[0] !== colAxis));
  const wrap = K.col(16, name); h.add(parent, wrap);
  h.add(wrap, await K.t(name, 'heading/h3', 'dark/text'), await K.t(desc, 'body/sm', 'dark/sub', { w: 1200 }));
  const grid = [], comps = [];
  for (const m of modes) for (const rp of rows) { const line = [];
    for (const cv of colVals) { const props = Object.assign({}, rp); if (colAxis) props[colAxis] = cv; props.Mode = m;
      const node = await build(props, K.m(m)); h.add(wrap, node);
      const c = h.component(node, Object.entries(props).map(([k, v]) => k + '=' + v).join(', '));
      line.push(c); comps.push(c); }
    grid.push({ m, line }); }
  const set = figma.combineAsVariants(comps, wrap); set.name = name; if (desc) set.description = desc; set.layoutMode = 'NONE';
  const colW = colVals.map((_, j) => Math.max(...grid.map(r => r.line[j].width)));
  let y = PAD, split = 0, W = 0;
  grid.forEach((r, i) => { if (i > 0 && r.m !== grid[i - 1].m) { split = y - gap + MG / 2; y += MG - gap; }
    let x = PAD; const rh = Math.max(...r.line.map(c => c.height));
    r.line.forEach((c, j) => { c.x = x; c.y = y; x += colW[j] + gap; }); W = Math.max(W, x - gap + PAD); y += rh + gap; });
  const H = y - gap + PAD; set.resizeWithoutConstraints(Math.max(W, 200), H);
  set.fills = modes.length === 2 ? [h.grad([[0, '#09090B'], [split / H, '#09090B'], [split / H, '#FAFAFA'], [1, '#FAFAFA']], 90)] : [K.c(modes[0] === 'Light' ? 'light/bg' : 'dark/bg')];
  K.s(set, 'dark/border-strong'); set.dashPattern = [6, 4]; set.cornerRadius = 16;
  K.idx[name] = set; return set; };

// ---- instances --------------------------------------------------------------------
K.reindex = async () => { K.idx = {};
  for (const name of [PG.F, PG.C]) { const pg = figma.root.children.find(p => p.name === name); if (!pg) continue;
    if (typeof pg.loadAsync === 'function') await pg.loadAsync();
    for (const s of pg.findAllWithCriteria({ types: ['COMPONENT_SET'] })) K.idx[s.name] = s; } };
K.inst = async (name, props) => { let s = K.idx[name]; if (!s || s.removed) { await K.reindex(); s = K.idx[name]; } if (!s) return null;
  const want = Object.entries(props || {}).map(([k, v]) => k + '=' + v);
  const c = s.children.find(x => want.every(w => x.name.split(', ').includes(w))) || s.defaultVariant; return c.createInstance(); };
K.setText = async (node, layer, str) => { if (!node || !node.findOne) return; const t = node.findOne(x => x.type === 'TEXT' && x.name === layer); if (!t) return;
  if (t.fontName !== figma.mixed) await figma.loadFontAsync(t.fontName); t.characters = String(str); };
K.texts = async (node, map) => { for (const [k, v] of Object.entries(map)) await K.setText(node, k, v); return node; };
// icon: an instance of the Icon set (Mode from the colour variable), recoloured when the colour is not the text role.
// Falls back to a bound vector when the set is not built yet.
K.icon = async (name, color, size) => { const mode = /^light\//.test(color) ? 'Light' : 'Dark';
  const i = await K.inst('Icon', { Name: name, Mode: mode });
  if (i) { if (size && size !== 24) i.resize(size, size); i.name = 'Icon/' + name;
    if (color !== K.v(mode, 'text')) for (const n of i.findAll ? i.findAll(x => 'strokes' in x && x.strokes && x.strokes.length) : []) n.strokes = [K.c(color)];
    return i; }
  const n = K.iconNode(name, color, size); n.name = 'Icon/' + name; return n; };
// Any line drawing as bound vectors (charts, easing curves, sparklines). inner = SVG elements with stroke.
K.svg = (inner, color, w, hh, sw, name) => { const f = figma.createNodeFromSvg('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + hh + '" viewBox="0 0 ' + w + ' ' + hh + '" fill="none" stroke="#000000" stroke-width="' + (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>');
  f.name = name || 'Drawing'; f.fills = [];
  for (const n of f.findAll ? f.findAll(() => true) : []) { if ('strokes' in n && n.strokes && n.strokes.length) n.strokes = [K.c(color)]; if ('fills' in n && n.fills && n.fills.length) n.fills = [K.c(color)]; }
  return f; };

// ---- shared atoms (used by foundations before the component sets exist) ----------------
// tones: [fill role, text role]. Group tones use the group/* fills and <mode>/group-*-text.
K.TONE = { brand: ['accent', 'accent-text'], success: ['success', 'success-text'], neutral: ['faint', 'sub'], warning: ['warning', 'warning-text'], danger: ['danger-border', 'danger-text'] };
K.toneVars = (mode, tone) => { if (K.TONE[tone]) return [K.v(mode, K.TONE[tone][0]), K.v(mode, K.TONE[tone][1])];
  return ['group/' + tone, K.v(mode, 'group-' + tone + '-text')]; };
K.pill = async (str, mode, tone, o) => { o = o || {}; const [fill, txt] = K.toneVars(mode, tone || 'brand');
  const p = K.row(8, o.name || 'Pill'); K.pad(p, 12, 6); p.cornerRadius = 9999;
  p.fills = [K.c(fill, 0.1)]; K.s(p, fill, 1, 0.25);
  if (o.dot !== false) h.add(p, K.dot(6, fill));
  h.add(p, await K.t(str.toUpperCase(), 'label/sm', txt, { name: 'Label' })); return p; };
K.logo = async (mode, withName) => { const r = K.row(12, 'Logo'); const m = K.row(0, 'VM');
  K.fix(m, 32, 32); m.primaryAxisAlignItems = 'CENTER'; m.counterAxisAlignItems = 'CENTER'; m.cornerRadius = 16; K.f(m, K.v(mode, 'text'));
  h.add(m, await K.t('VM', 'label/nav-active', K.v(mode, 'bg'), { name: 'Initials' })); h.add(r, m);
  if (withName !== false) h.add(r, await K.t('Velimir Müller', 'body/sm-strong', K.v(mode, 'text'), { name: 'Name' })); return r; };
K.meta = async (label, value, mode) => { const c = K.col(6, label);
  h.add(c, await K.t(label.toUpperCase(), 'label/sm', K.v(mode, 'faint')), await K.t(value, 'mono/md', K.v(mode, 'text'), { name: 'Value' })); return c; };

// put an instance into an auto-layout parent at a fixed width
K.put = (parent, inst, w) => { if (!inst) return null; h.add(parent, inst); if (w) { try { inst.resize(w, inst.height); } catch (e) {} } return inst; };
K.putFill = (parent, inst) => { if (!inst) return null; h.add(parent, inst); h.fillW(inst); return inst; };

// ---- page stacking ------------------------------------------------------------------
after(async () => {
  for (const name of [PG.F, PG.C, PG.T]) { const pg = figma.root.children.find(p => p.name === name); if (!pg) continue;
    if (typeof pg.loadAsync === 'function') await pg.loadAsync();
    const secs = pg.children.filter(n => n.type === 'SECTION' && /^\d\d · /.test(n.name)).sort((a, b) => a.name < b.name ? -1 : 1);
    h.stack(secs, 240); } });
