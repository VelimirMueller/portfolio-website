// 10 · Actions — Button, Icon Button, Link. Builders are shared: later sets nest instances and fall back to these.
const BTN = {
  SIZE: { sm: [16, 8, 'label/button-sm', 16], md: [24, 12, 'label/button', 16], lg: [32, 16, 'label/button-lg', 20] },
  // kind: [fill, hover fill, text, stroke]
  KIND: { Primary: ['cta-bg', 'cta-hover', 'cta-text', null], Brand: ['@brand/fill-strong', '@brand/fill-hover', 'on-accent', null],
    Secondary: ['secondary-bg', 'secondary-border', 'text', 'secondary-border'], Outline: [null, 'hover', 'text', 'border-strong'],
    Ghost: [null, 'hover', 'sub', null], Destructive: ['danger', 'danger', 'on-accent', null] } };
const btnRole = (m, r) => r == null ? null : r[0] === '@' ? r.slice(1) : K.v(m, r);

// K.button(kind, size, state, mode, label, icon) -> frame. icon: lucide name or null.
K.button = async (kind, size, state, mode, label, icon) => { const [px, py, style, isz] = BTN.SIZE[size || 'md']; const [fill, hov, txt, str] = BTN.KIND[kind];
  const n = K.row(8, 'Button'); K.pad(n, px, py); n.cornerRadius = 9999; n.primaryAxisAlignItems = 'CENTER';
  const H = state === 'Hover'; const fr = btnRole(mode, H ? hov : fill);
  n.fills = fr ? [K.c(fr, kind === 'Destructive' && H ? 0.85 : null)] : [];
  if (str) K.s(n, btnRole(mode, H && kind === 'Outline' ? 'text' : str));
  const tc = btnRole(mode, kind === 'Ghost' && H ? 'text' : txt);
  if (state === 'Loading') h.add(n, await K.icon('loader', tc, isz));
  h.add(n, await K.t(state === 'Loading' ? 'Sending…' : label, style, tc, { name: 'Label' }));
  if (icon && state !== 'Loading') h.add(n, await K.icon(icon, tc, isz));
  if (kind === 'Brand' && state !== 'Disabled') await K.fx(n, 'glow/cta');
  if (state === 'Focus') await K.fx(n, 'focus/ring-' + K.m(mode));
  if (state === 'Disabled' || state === 'Loading') n.opacity = state === 'Disabled' ? 0.5 : 0.8;
  return n; };
// Button instance with a label, or a built button when the set is missing.
K.btn = async (kind, size, mode, label, o) => { o = o || {}; const i = await K.inst('Button', { Kind: kind, Size: size, State: o.state || 'Default', Mode: K.m(mode) === 'light' ? 'Light' : 'Dark' });
  if (i) { await K.setText(i, 'Label', label); if (o.noIcon) { const ic = i.findOne ? i.findOne(x => /^Icon\//.test(x.name)) : null; if (ic) ic.visible = false; } i.name = 'Button · ' + label; return i; }
  return K.button(kind, size, o.state || 'Default', mode, label, o.noIcon ? null : 'arrow-right'); };

K.iconButton = async (kind, size, state, mode, icon) => { const d = size === 'sm' ? 36 : 44; const n = K.row(0, 'Icon Button'); K.fix(n, d, d);
  n.primaryAxisAlignItems = 'CENTER'; n.counterAxisAlignItems = 'CENTER'; n.cornerRadius = 9999; const H = state === 'Hover';
  if (kind === 'Solid') K.f(n, K.v(mode, H ? 'cta-hover' : 'cta-bg'));
  else if (kind === 'Outline') { K.f(n, K.v(mode, H ? 'hover' : 'card')); K.s(n, K.v(mode, H ? 'border-strong' : 'border')); }
  else n.fills = H ? [K.c(K.v(mode, 'hover'))] : [];
  const ic = kind === 'Solid' ? K.v(mode, 'cta-text') : K.v(mode, kind === 'Ghost' && !H ? 'sub' : 'text');
  h.add(n, await K.icon(icon || 'github', ic, size === 'sm' ? 16 : 20));
  if (state === 'Focus') await K.fx(n, 'focus/ring-' + K.m(mode)); if (state === 'Disabled') n.opacity = 0.5; return n; };
K.ibtn = async (kind, size, mode, icon) => { const i = await K.inst('Icon Button', { Kind: kind, Size: size, State: 'Default', Mode: K.m(mode) === 'light' ? 'Light' : 'Dark' });
  if (i) { const v = i.findOne ? i.findOne(x => x.type === 'INSTANCE' && /^Icon\//.test(x.name)) : null;
    if (v && icon) { const set = K.idx.Icon; const want = set && set.children.find(c => c.name === 'Name=' + icon + ', Mode=' + (K.m(mode) === 'light' ? 'Light' : 'Dark')); if (want) v.swapComponent(want); }
    i.name = 'Icon Button · ' + icon; return i; }
  return K.iconButton(kind, size, 'Default', mode, icon); };

K.link = async (kind, state, mode, label) => { const H = state === 'Hover'; const c = K.col(3, 'Link'); const r = K.row(6, 'Row'); h.add(c, r);
  const col = kind === 'Muted' ? K.v(mode, H ? 'text' : 'sub') : K.v(mode, H ? 'accent-hover' : 'accent-text');
  h.add(r, await K.t(label, kind === 'Muted' ? 'body/sm' : 'label/nav-active', col, { name: 'Label' }));
  if (kind === 'Arrow') h.add(r, await K.icon('arrow-right', col, 14));
  if (kind === 'External') h.add(r, await K.icon('arrow-up-right', col, 14));
  if (kind === 'Inline' || H) { const u = h.rect(10, 1, [K.c(col, kind === 'Inline' && !H ? 0.4 : 1)]); u.name = 'Underline'; h.add(c, u); h.fillW(u); }
  if (state === 'Focus') { c.cornerRadius = 4; await K.fx(c, 'focus/ring-' + K.m(mode)); } return c; };

section({ name: '10 · Actions', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('10 · Actions'); const b = K.board('Actions', 2000);
  h.add(b, await K.head('10 · Components', 'Actions', 'Mono, bold, full round. Hover shifts the fill, focus shows a 2 px ring with an offset in the page colour, disabled sits at 50 %, loading swaps the arrow for a spinner. One Primary or Brand button per view.'));
  await K.set(b, 'Button', 'Button.tsx. Kind: Primary (black / white, as built), Brand (indigo CTA, nav + hero), Secondary, Outline, Ghost, Destructive (admin delete). Size sm / md / lg. Label + arrow icon; hide the icon in the instance when not needed.',
    [['Kind', ['Primary', 'Brand', 'Secondary', 'Outline', 'Ghost', 'Destructive']], ['Size', ['sm', 'md', 'lg']], ['State', ['Default', 'Hover', 'Focus', 'Disabled', 'Loading']]],
    (p, m) => K.button(p.Kind, p.Size, p.State, m, p.Kind === 'Destructive' ? 'Yes, delete' : p.Kind === 'Brand' ? 'Contact' : p.Kind === 'Primary' ? 'View Projects' : 'All Services', 'arrow-right'), { gap: 32 });
  await K.set(b, 'Icon Button', 'Round icon-only button: footer social links, toolbars, theme and menu toggles. Give it an aria-label in code.',
    [['Kind', ['Solid', 'Outline', 'Ghost']], ['Size', ['sm', 'md']], ['State', ['Default', 'Hover', 'Focus', 'Disabled']]],
    (p, m) => K.iconButton(p.Kind, p.Size, p.State, m, 'github'));
  await K.set(b, 'Link', 'Text link. Inline (underlined, in prose), Arrow ("All Services →"), External (opens GitHub or a site), Muted (footer and legal).',
    [['Kind', ['Inline', 'Arrow', 'External', 'Muted']], ['State', ['Default', 'Hover', 'Focus']]],
    (p, m) => K.link(p.Kind, p.State, m, p.Kind === 'Muted' ? 'Imprint' : p.Kind === 'External' ? 'View on GitHub' : p.Kind === 'Arrow' ? 'All Services' : 'velimir-mueller.de'));
  return h.place(s, b); } });
