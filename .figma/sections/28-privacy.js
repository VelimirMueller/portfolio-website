// 28 · Privacy — /privacy: legal card plus the AnalyticsToggle switch.
section({ name: '28 · Privacy', page: PG.T, run: async () => T.board('28 · Privacy', async (w, mode) => T.legal(w, mode, 'Privacy Policy', 'PRIVACY.', [
  ['1. Controller', ['Controller within the meaning of the General Data Protection Regulation (GDPR): Velimir Müller (address as on /imprint).']],
  ['2. General Information', ['The protection of your personal data is important to me. Personal data is only processed on this website to the extent necessary and in accordance with the GDPR.']],
  ['3. Contact form', ['Name, email and message are used only to answer your inquiry, then deleted.']],
  ['4. Analytics', ['First-party, cookieless page statistics. No profiling. You can switch them off here.']]],
  async (iw) => { const box = K.col(12, 'Analytics setting'); K.pad(box, 20); box.cornerRadius = 16; K.f(box, K.v(mode, 'inset')); K.s(box, K.v(mode, 'border')); K.fixW(box, iw);
    h.add(box, await T.use('Switch', { Checked: 'On', State: 'Default', Mode: T.MODE(mode) }, null, () => K.switchC('On', 'Default', mode))); return box; }), { route: '/privacy' }) });
