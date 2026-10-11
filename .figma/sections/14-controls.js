// 14 · Controls — checkbox, radio, switch, toggle buttons.
K.check = async (kind, checked, state, mode, label) => { const r = K.row(10, kind); const on = checked !== 'Off'; const D = state === 'Disabled';
  const box = K.row(0, 'Box'); K.fix(box, 18, 18); box.cornerRadius = kind === 'Radio' ? 9 : 4; box.primaryAxisAlignItems = 'CENTER'; box.counterAxisAlignItems = 'CENTER';
  if (kind === 'Checkbox' && on) { K.f(box, D ? K.v(mode, 'disabled-text') : 'brand/fill-strong'); h.add(box, await K.icon(checked === 'Mixed' ? 'minus' : 'check', K.v(mode, 'on-accent'), 14)); }
  else { K.f(box, K.v(mode, D ? 'disabled-bg' : 'input-bg')); K.s(box, D ? K.v(mode, 'border') : on ? 'brand/fill-strong' : K.v(mode, 'border-strong'), on ? 2 : 1);
    if (kind === 'Radio' && on) h.add(box, K.dot(8, D ? K.v(mode, 'disabled-text') : 'brand/fill-strong', 'Inner')); }
  if (state === 'Focus') await K.fx(box, 'focus/ring-' + K.m(mode));
  h.add(r, box, await K.t(label || (kind === 'Radio' ? 'Contract' : 'Select all'), 'body/sm', K.v(mode, D ? 'disabled-text' : 'text'), { name: 'Label' })); return r; };
K.switchC = async (checked, state, mode) => { const on = checked === 'On'; const D = state === 'Disabled'; const r = K.row(14, 'Switch');
  const tr = K.row(0, 'Track'); K.fix(tr, 48, 28); tr.cornerRadius = 14; K.pad(tr, 3); tr.primaryAxisAlignItems = on ? 'MAX' : 'MIN'; tr.counterAxisAlignItems = 'CENTER';
  K.f(tr, K.v(mode, on ? 'cta-bg' : 'secondary-bg')); if (!on) K.s(tr, K.v(mode, 'border-strong'));
  const knob = K.dot(20, K.v(mode, on ? 'cta-text' : K.m(mode) === 'light' ? 'card' : 'sub'), 'Knob'); await K.fx(knob, 'shadow/sm'); h.add(tr, knob);
  if (state === 'Focus') await K.fx(tr, 'focus/ring-' + K.m(mode)); if (D) r.opacity = 0.5;
  const t = K.col(2, 'Text'); h.add(t, await K.t('Analytics', 'body/sm-strong', K.v(mode, 'text'), { name: 'Label' }), await K.t(on ? 'On · cookieless, first-party' : 'Off', 'body/xs', K.v(mode, 'faint'), { name: 'Help' }));
  h.add(r, tr, t); return r; };

section({ name: '14 · Controls', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('14 · Controls'); const b = K.board('Controls', 1800);
  h.add(b, await K.head('14 · Components', 'Controls', 'Selection controls. Checked uses brand-600 (admin accent-brand-600). The switch mirrors AnalyticsToggle.tsx: black / white track when on. Every control has a visible focus ring.'));
  await K.set(b, 'Checkbox', 'Checkbox with label. Mixed = some rows selected (inbox "Select all").', [['Checked', ['Off', 'On', 'Mixed']], ['State', ['Default', 'Focus', 'Disabled']]], (p, m) => K.check('Checkbox', p.Checked, p.State, m));
  await K.set(b, 'Radio', 'Radio with label. Use for 2–5 exclusive options.', [['Checked', ['Off', 'On']], ['State', ['Default', 'Focus', 'Disabled']]], (p, m) => K.check('Radio', p.Checked, p.State, m));
  await K.set(b, 'Switch', 'AnalyticsToggle.tsx (privacy page). 48 × 28 track, 20 px knob.', [['Checked', ['Off', 'On']], ['State', ['Default', 'Focus', 'Disabled']]], (p, m) => K.switchC(p.Checked, p.State, m));
  await K.set(b, 'Toggle Button', 'Header toggles: theme (sun in dark, moon in light) and locale (DE / EN).', [['Kind', ['Theme', 'Language']]], (p, m) => K.toggle(p.Kind, m));
  return h.place(s, b); } });
