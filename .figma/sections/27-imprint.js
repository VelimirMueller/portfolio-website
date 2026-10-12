// 27 · Imprint — /imprint (ImprintContent.tsx): header and one glass legal card (max-w-3xl) over a faded render.
// Address lines come from the live page.
T.legal = async (w, mode, eyebrow, title, blocks, extra) => { const D = T.D(w); const f = T.frame(title + ' · ' + w, w, mode); h.add(f, await T.nav(w, mode, 'None'));
  const NW = D ? 768 : w - 32; const col = K.col(D ? 48 : 32, 'Column'); col.paddingTop = D ? 96 : 48; col.paddingBottom = D ? 96 : 64; col.paddingLeft = col.paddingRight = (w - NW) / 2; K.fixW(col, w); h.add(f, col);
  h.add(col, await T.header(w, mode, eyebrow, title)); const c = await T.card(w, mode, NW, 'Legal card', 32, D ? 48 : 24);
  for (const [ht, lines] of blocks) { const s = K.col(10, ht); h.add(s, await K.t(ht, 'heading/h5', K.v(mode, 'text')));
    for (const l of lines) h.add(s, await K.t(l, 'mono/md', K.v(mode, 'sub'), { w: NW - (D ? 96 : 48) })); h.add(c, s); }
  if (extra) h.add(c, await extra(NW - (D ? 96 : 48)));
  h.add(col, c); await T.backdrop(col, w, mode, 'site-svc-requirements', 'right', { left: 0 }); h.add(f, await T.footer(w, mode)); return f; };
section({ name: '27 · Imprint', page: PG.T, run: async () => T.board('27 · Imprint', async (w, mode) => T.legal(w, mode, 'Information pursuant to Section 5 DDG', 'IMPRINT.', [
  ['Postal Address', ['Velimir Müller', 'Street and number (as on /imprint)', 'Postcode and city (as on /imprint)']],
  ['Contact', ['Email: (as on /imprint)', 'Contact form: velimir-mueller.de/contact']],
  ['Consumer Dispute Resolution', ['I am neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.']]]), { route: '/imprint' }) });
