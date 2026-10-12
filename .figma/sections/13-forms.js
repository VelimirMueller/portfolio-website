// 13 · Forms — input, textarea, select, search, field (label + control + help / error), contact form.
const FIELD = { Name: ['Your Name', 'Velimir', 'Please enter at least 2 characters'], Email: ['your@email.com', 'hello@velimir-mueller.de', 'Please enter a valid email address'],
  Service: ['Pick a service', 'UX/UI & Branding', 'Please pick a service'],
  Message: ["Let's talk...", 'We are looking for a product engineer for a 6-month build.', 'Please enter at least 10 characters'] };
// box: input-like frame. state: Default | Hover | Focus | Filled | Error | Valid | Disabled
K.inputBox = async (state, mode, o) => { o = o || {}; const f = K.row(10, o.name || 'Input'); K.pad(f, 16, 14); f.cornerRadius = o.r == null ? 8 : o.r;
  const D = state === 'Disabled'; K.f(f, K.v(mode, D ? 'disabled-bg' : 'input-bg'));
  const sc = { Hover: 'border-strong', Focus: 'text', Error: 'danger-border', Valid: 'success' }[state] || 'border'; K.s(f, K.v(mode, sc));
  if (state === 'Focus') await K.fx(f, 'focus/ring-' + K.m(mode));
  if (o.icon) h.add(f, await K.icon(o.icon, K.v(mode, 'faint'), 16));
  const filled = ['Focus', 'Filled', 'Error', 'Valid'].includes(state) && o.value;
  const t = await K.t(filled ? o.value : (o.placeholder || 'Your Name'), 'mono/md', K.v(mode, D ? 'disabled-text' : filled ? 'text' : 'placeholder'), { name: 'Value', w: o.area ? (o.w || 360) - 32 : null });
  h.add(f, t); if (!o.area) t.layoutGrow = 1;
  if (o.trail) h.add(f, o.trail);
  if (state === 'Valid' && !o.trail) h.add(f, await K.icon('check', K.v(mode, 'success-text'), 16));
  if (state === 'Error' && !o.trail) h.add(f, await K.icon('x-circle', K.v(mode, 'danger-text'), 16));
  K.fixW(f, o.w || 360); if (o.area) { f.counterAxisAlignItems = 'MIN'; f.resize(f.width, 160); f.counterAxisSizingMode = 'FIXED'; }
  return f; };
K.select = async (state, mode) => { const c = K.col(8, 'Select'); const D = state === 'Disabled';
  const box = await K.inputBox(state === 'Open' ? 'Focus' : state === 'Focus' ? 'Focus' : D ? 'Disabled' : 'Filled', mode, { value: 'UX/UI & Branding', trail: await K.icon(state === 'Open' ? 'chevron-down' : 'chevron-down', K.v(mode, D ? 'disabled-text' : 'sub'), 16), name: 'Control' });
  if (state !== 'Focus' && state !== 'Open') box.effects = [];
  h.add(c, box);
  if (state === 'Open') { const menu = K.col(2, 'Menu'); K.pad(menu, 6); menu.cornerRadius = 12; K.f(menu, K.v(mode, 'card')); K.s(menu, K.v(mode, 'border')); await K.fx(menu, 'shadow/popover');
    for (const [o, i] of [['Requirements Engineering', 0], ['UX/UI & Branding', 1], ['Full-Stack Development', 2], ['Project Planning & Delivery', 3]]) {
      const r = K.row(10, o); K.pad(r, 12, 10); r.cornerRadius = 8; r.fills = i === 1 ? [K.c(K.v(mode, 'hover'))] : [];
      const t = await K.t(o, 'body/sm', K.v(mode, i === 1 ? 'text' : 'sub')); h.add(r, t); t.layoutGrow = 1; if (i === 1) h.add(r, await K.icon('check', K.v(mode, 'accent-text'), 16)); h.add(menu, r); h.fillW(r); }
    h.add(c, menu); h.fillW(menu); }
  K.fixW(c, 360); return c; };
K.search = async (state, mode) => { const kbd = await K.kbd('/', mode);
  const f = await K.inputBox(state === 'Focus' ? 'Focus' : 'Default', mode, { placeholder: 'Search…', value: 'krenko', icon: 'search', trail: kbd, r: 9999, w: 320, name: 'Search' });
  if (state !== 'Focus') f.effects = []; return f; };
K.kbd = async (key, mode) => { const k = K.row(0, 'Kbd'); K.pad(k, 6, 2); k.cornerRadius = 6; K.f(k, K.v(mode, 'hover')); K.s(k, K.v(mode, 'border-strong'));
  h.add(k, await K.t(key, 'label/sm', K.v(mode, 'sub'), { name: 'Key' })); return k; };
// Field: label + control + help or message.
K.field = async (control, state, mode, key, o) => { o = o || {}; key = key || (control === 'Textarea' ? 'Message' : control === 'Select' ? 'Service' : 'Name'); const W = o.w || 360;
  const c = K.col(8, 'Field'); const D = state === 'Disabled';
  h.add(c, await K.t(key.toUpperCase() + (control === 'Select' ? '' : ' *'), 'label/field', K.v(mode, D ? 'disabled-text' : 'sub'), { name: 'Label' }));
  const cs = state === 'Default' ? 'Default' : state;
  let ctl = await K.inst(control, { State: control === 'Select' ? (D ? 'Disabled' : 'Default') : cs, Mode: ModeOf(mode) });
  if (ctl) { if (FIELD[key] && control !== 'Select') await K.setText(ctl, 'Value', ['Error', 'Valid'].includes(cs) ? (cs === 'Error' ? key === 'Email' ? 'velimir@' : 'V' : FIELD[key][1]) : FIELD[key][0]); h.add(c, ctl); try { ctl.resize(W, ctl.height); } catch (e) {} }
  else { const d = FIELD[key] || FIELD.Name; ctl = control === 'Select' ? await K.select(D ? 'Disabled' : 'Default', mode)
      : await K.inputBox(cs, mode, { placeholder: d[0], value: cs === 'Error' ? (key === 'Email' ? 'velimir@' : 'V') : d[1], area: control === 'Textarea', w: W, name: 'Control' }); h.add(c, ctl); }
  if (state === 'Error') { const r = K.row(6, 'Message'); h.add(r, await K.t('✗ ' + (FIELD[key] || FIELD.Name)[2], 'mono/caption', K.v(mode, 'danger-text'), { name: 'Error' })); h.add(c, r); }
  else if (state === 'Valid') { const r = K.row(6, 'Message'); h.add(r, await K.icon('check', K.v(mode, 'success-text'), 14), await K.t('Looks good', 'mono/caption', K.v(mode, 'success-text'), { name: 'Help' })); h.add(c, r); }
  else h.add(c, await K.t(control === 'Select' ? 'Pick the service you need.' : key === 'Email' ? 'Only used to answer you.' : 'Required.', 'body/xs', K.v(mode, D ? 'disabled-text' : 'faint'), { name: 'Help', w: W }));
  if (D) c.opacity = 0.8; K.fixW(c, W); return c; };
K.contactForm = async (state, mode, w) => { const W = w || 620; const c = K.col(28, 'Contact Form'); K.pad(c, W > 500 ? 48 : 24); c.cornerRadius = 24; K.f(c, K.v(mode, 'card'), 0.8); K.s(c, K.v(mode, 'border'));
  await K.fx(c, 'blur/backdrop'); K.fixW(c, W); const inner = W - (W > 500 ? 96 : 48);
  if (state === 'Success') { c.counterAxisAlignItems = 'CENTER'; const ok = K.row(0, 'Check'); K.fix(ok, 64, 64); ok.cornerRadius = 32; ok.primaryAxisAlignItems = 'CENTER'; ok.counterAxisAlignItems = 'CENTER';
    K.f(ok, K.v(mode, 'success'), 0.12); h.add(ok, await K.icon('check', K.v(mode, 'success-text'), 28));
    const track = h.rect(inner, 4, [K.c(K.v(mode, 'hover'))], 2); track.name = 'Countdown track'; const bar = h.rect(Math.round(inner * 0.6), 4, [h.grad([[0, '#10B981'], [1, '#6366F1']], 0)], 2); bar.name = 'Countdown';
    h.add(c, ok, await K.t('Message sent', 'heading/h3', K.v(mode, 'text')), await K.t('Thanks. I answer within two working days.', 'body/md', K.v(mode, 'sub')), track, bar, await K.t('Redirecting to home in 3s...', 'mono/caption', K.v(mode, 'faint')));
    return c; }
  const st = state === 'Error' ? 'Error' : 'Default';
  for (const [k, ctl, s2] of [['Name', 'Input', state === 'Error' ? 'Valid' : state === 'Sending' ? 'Filled' : 'Default'], ['Email', 'Input', st], ['Message', 'Textarea', state === 'Sending' ? 'Filled' : st]]) {
    const f = await K.field(ctl, s2 === 'Filled' ? 'Default' : s2, mode, k, { w: inner }); h.add(c, f); }
  if (state === 'Error') h.add(c, await K.alert('Danger', mode, inner, 'Message not sent', 'The server did not answer. Try again, or write to hello@velimir-mueller.de.'));
  const btn = await K.inst('Button', { Kind: 'Primary', Size: 'lg', State: state === 'Sending' ? 'Loading' : 'Default', Mode: ModeOf(mode) });
  if (btn) { await K.setText(btn, 'Label', state === 'Sending' ? 'Sending...' : 'Send Message'); h.add(c, btn); h.fillW(btn); } else { const bb = await K.button('Primary', 'lg', state === 'Sending' ? 'Loading' : 'Default', mode, 'Send Message', 'arrow-right'); h.add(c, bb); h.fillW(bb); }
  return c; };
// alert lives here because the contact form uses it; 16 · Feedback builds its set.
const TONE_ALERT = { Info: ['accent', 'accent-text', 'info'], Success: ['success', 'success-text', 'check-circle'], Warning: ['warning', 'warning-text', 'alert-triangle'], Danger: ['danger-border', 'danger-text', 'x-circle'] };
K.alert = async (tone, mode, w, title, body) => { const [f, t, ic] = TONE_ALERT[tone]; const a = K.row(12, 'Alert'); a.counterAxisAlignItems = 'MIN'; K.pad(a, 16); a.cornerRadius = 12;
  a.fills = [K.c(K.v(mode, f), 0.08)]; K.s(a, K.v(mode, f), 1, 0.3); h.add(a, await K.icon(ic, K.v(mode, t), 20));
  const x = K.col(4, 'Text'); h.add(x, await K.t(title, 'body/sm-strong', K.v(mode, 'text'), { name: 'Title' }), await K.t(body, 'body/sm', K.v(mode, 'sub'), { w: (w || 560) - 68, name: 'Body' }));
  h.add(a, x); K.fixW(a, w || 560); return a; };

section({ name: '13 · Forms', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('13 · Forms'); const b = K.board('Forms', 2000);
  h.add(b, await K.head('13 · Components', 'Forms', 'Mono input text on the input fill, 8 px round. Focus: text-colour border + brand ring. Error: red border and a "✗" message under the field. Valid: green border after touch (ContactContent.tsx).'));
  await K.set(b, 'Input', 'Text input. Value = placeholder or value text layer.', [['State', ['Default', 'Hover', 'Focus', 'Filled', 'Error', 'Valid', 'Disabled']]],
    (p, m) => K.inputBox(p.State, m, { placeholder: 'Your Name', value: p.State === 'Error' ? 'V' : 'Velimir', name: 'Input' }));
  await K.set(b, 'Textarea', 'Multi-line input, 160 px high (rows 5).', [['State', ['Default', 'Focus', 'Error', 'Disabled']]],
    (p, m) => K.inputBox(p.State, m, { placeholder: "Let's talk...", value: p.State === 'Error' ? 'Hi' : FIELD.Message[1], area: true, name: 'Textarea' }));
  await K.set(b, 'Select', 'Single select. Open shows the option menu (shadow/popover).', [['State', ['Default', 'Focus', 'Open', 'Disabled']]], (p, m) => K.select(p.State, m));
  await K.set(b, 'Search', 'Search pill with the "/" shortcut (inbox, card pool).', [['State', ['Default', 'Focus']]], (p, m) => K.search(p.State, m));
  await K.set(b, 'Field', 'Label (label/field) + control instance + help, error or valid message. Use it for every form row.', [['Control', ['Input', 'Textarea', 'Select']], ['State', ['Default', 'Error', 'Valid', 'Disabled']]],
    (p, m) => K.field(p.Control, p.State, m));
  await K.set(b, 'Contact Form', 'Contact page form. Error shows field errors and the submit alert. Success shows the redirect countdown.', [['State', ['Default', 'Error', 'Sending', 'Success']]], (p, m) => K.contactForm(p.State, m));
  return h.place(s, b); } });
