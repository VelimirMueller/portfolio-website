// 31 · Admin login — /admin/login: centred magic-link card. Dark only. Desktop shows Default, mobile shows Sent.
section({ name: '31 · Admin login', page: PG.T, run: async () => T.board('31 · Admin login', async (w, mode) => { const D = T.D(w);
  const f = T.frame('Admin login · ' + w, w, mode); f.counterAxisAlignItems = 'CENTER'; f.primaryAxisAlignItems = 'CENTER'; f.resize(w, D ? 900 : 760); f.primaryAxisSizingMode = 'FIXED';
  f.fills = [K.c(K.v(mode, 'bg')), h.radial('#6366F1', 0.18, 0.5, 0.35)];
  const st = D ? 'Default' : 'Sent'; const c = await T.use('Login Card', { State: st, Mode: T.MODE(mode) }, null, () => K.loginCard(st, mode)); h.add(f, c); if (!D) T.size(c, w - 32);
  const foot = K.row(8, 'Footer'); foot.paddingTop = 24; h.add(foot, await K.icon('arrow-left', K.v(mode, 'faint'), 14), await K.link('Muted', 'Default', mode, 'Back to velimir-mueller.de')); h.add(f, foot);
  return f; }, { route: '/admin/login', light: false }) });
