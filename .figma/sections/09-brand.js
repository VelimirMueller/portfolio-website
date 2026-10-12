// 08 · Brand — the VM. mark v2 and the favicon as component sets (portfolio-website#121, vm-brand B-50 + B-51).
// The SVGs in art/brand/ are copies of vm-brand: the logo from .figma/art/_brand/, the favicon from assets/favicon/
// (built by vm-brand scripts/make-favicon.py, PR #32). Rebuild them there, copy them here; never edit them in Figma.
// Logo:    Mode=Dark|Light.
// Favicon: Size=16|32|48|180|512 × Mode=Dark|Light. Dark = the shipped favicon (dark tile in both browser themes).
//          Light = the light tile, for docs only. 16/32/48 are the pixel-hinted sources; 180 is the full-bleed Apple icon.

// Literal paths, so `vfb check` verifies that every file exists.
const BRAND_ART = {
  logo: { Dark: 'website/brand/vm-logo-v2-dark.svg', Light: 'website/brand/vm-logo-v2-light.svg' },
  favicon: {
    16: { Dark: 'website/brand/vm-favicon-16.svg', Light: 'website/brand/vm-favicon-16-light.svg' },
    32: { Dark: 'website/brand/vm-favicon-32.svg', Light: 'website/brand/vm-favicon-32-light.svg' },
    48: { Dark: 'website/brand/vm-favicon-48.svg', Light: 'website/brand/vm-favicon-48-light.svg' },
    180: { Dark: 'website/brand/vm-favicon-apple.svg', Light: 'website/brand/vm-favicon-apple-light.svg' },
    512: { Dark: 'website/brand/vm-favicon-512.svg', Light: 'website/brand/vm-favicon-512-light.svg' },
  },
};
const FAVICON_SIZES = ['16', '32', '48', '180', '512'];

// Binds every imported SOLID fill and stroke to the token variable with the nearest value (RGB distance <= 12), and
// keeps its opacity. Gradients stay as imported: the brand gradients have no token.
K.bindSolids = (root) => {
  const rgb = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16));
  const near = (c) => { let best = null, d = 13;
    for (const [n, x] of Object.entries(K.hex)) { const [r, g, b] = rgb(x);
      const e = Math.hypot(r - c.r * 255, g - c.g * 255, b - c.b * 255); if (e < d) { d = e; best = n; } }
    return best; };
  const fix = (arr) => (arr || []).map((p) => { if (!p || p.type !== 'SOLID') return p; const n = near(p.color);
    return n ? K.c(n, p.opacity == null ? 1 : p.opacity) : p; });
  for (const n of [root, ...(root.findAll ? root.findAll(() => true) : [])]) {
    if ('fills' in n && Array.isArray(n.fills) && n.fills.length) n.fills = fix(n.fills);
    if ('strokes' in n && Array.isArray(n.strokes) && n.strokes.length) n.strokes = fix(n.strokes);
    try { n.constraints = { horizontal: 'SCALE', vertical: 'SCALE' }; } catch (e) {} }
  return root; };

// An imported brand SVG as a frame at `size` px (instances scale cleanly: every layer has SCALE constraints).
K.brandSvg = async (path, size, name) => { const f = figma.createNodeFromSvg(await h.getText(path));
  f.name = name; f.clipsContent = true; K.bindSolids(f);
  if (size && Math.abs(f.width - size) > 0.01) { if (f.rescale) f.rescale(size / f.width); else f.resize(size, size); }
  return f; };

section({ name: '08 · Brand', page: PG.F, run: async () => {
  await K.init(); const s = h.section('08 · Brand'); const b = K.board('Brand', 2400);
  h.add(b, await K.head('08 · Foundations', 'Brand', 'The VM. mark v2 and the favicon from vm-brand (B-50, B-51). The dark tile is the favicon in both browser themes. The light tile is for docs only. Never redraw the mark: rebuild it in vm-brand and copy the SVGs into .figma/art/brand/.'));

  await K.set(b, 'Logo', 'VM. mark v2, 256 px (source 512). Chrome V, indigo M, square full stop, crop marks, grid and indigo bottom bar. Mode = tile colour. Scale instances; keep the proportions.',
    [], async (p) => K.brandSvg(BRAND_ART.logo[p.Mode], 256, 'Logo'), { colAxis: null });

  await K.set(b, 'Favicon', 'Favicon at its real pixel size. 16/32/48 are hinted for the pixel grid: do not scale them. 180 = Apple touch icon (full bleed, iOS rounds it). 512 = manifest icon. Use Mode=Dark on the site in both themes.',
    [['Size', FAVICON_SIZES]], async (p) => K.brandSvg(BRAND_ART.favicon[p.Size][p.Mode], Number(p.Size), 'Favicon ' + p.Size), { gap: 40 });

  // Usage: the shipped favicon (Mode=Dark) on a dark and a light background, as browser tabs show it.
  const usage = K.row(32, 'Usage'); usage.counterAxisAlignItems = 'MIN';
  for (const mode of ['dark', 'light']) {
    const c = K.card(mode, 1104, 'On ' + mode, 24, 40);
    h.add(c, await K.slash('On a ' + mode + ' background', mode), await K.t(mode === 'dark' ? 'Dark tab, dark page, dark dock.' : 'Light tab, bookmarks bar, light dock. The dark tile stays.', 'body/sm', K.v(mode, 'sub')));
    const r = K.row(28, 'Sizes'); r.counterAxisAlignItems = 'MAX';
    for (const sz of FAVICON_SIZES) { const col = K.col(10, 'size ' + sz); col.counterAxisAlignItems = 'CENTER';
      const i = await K.inst('Favicon', { Size: sz, Mode: 'Dark' });
      if (i) { if (sz === '512') i.resize(256, 256); h.add(col, i); }
      h.add(col, await K.t(sz === '512' ? '512 (at 50 %)' : sz + ' px', 'mono/caption', K.v(mode, 'sub'))); h.add(r, col); }
    h.add(c, r); h.add(usage, c); }
  h.add(b, usage);

  const rules = K.row(24, 'Rules'); rules.counterAxisAlignItems = 'MIN';
  for (const [t, d, c] of [['ONE TILE', 'The favicon is the dark tile in light and dark browser themes. Do not swap it per theme.', 'dark/accent-text'],
    ['NO SCALING BELOW 48', '16, 32 and 48 px are hinted versions with their own geometry. Use the matching size, never a scaled 512.', 'dark/text'],
    ['SOURCE OF TRUTH', 'vm-brand scripts/make-favicon.py writes the set. Edit the script there, not the vectors here.', 'dark/sub']]) {
    const k = K.card('dark', 720, t, 10, 28); h.add(k, await K.t(t, 'label/eyebrow', c), await K.t(d, 'body/md', 'dark/sub', { w: 640 })); h.add(rules, k); }
  h.add(b, rules);
  return h.place(s, b); } });
