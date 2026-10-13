// 05 · Code issues — drift between the code on main and this token set. Verified against src/ on 2026-10-11.
section({ name: '05 · Code issues', page: PG.F, run: async () => {
  await K.init(); const s = h.section('05 · Code issues'); const b = K.board('Code issues', 1600);
  h.add(b, await K.head('05 · Foundations', 'Code issues found', 'Gaps between the code and the token set. Fix them in the rebuild, not in Figma. The tokens keep the as-built values where noted, so the file stays a true mirror.'));
  const W = [80, 400, 360, 440, 120];
  const rows = [['ID', 'FINDING', 'WHERE', 'PROPOSAL', 'SEVERITY'],
    ['F-1', 'Two CTAs use hover:bg-brand-700. tailwind.config.ts has no brand-700, so the class makes no CSS and the hover shows no colour.', 'Navigation.tsx:147 · HomeContent.tsx:142 · tailwind.config.ts', 'Fixed in #184: brand-700 #4338CA is in tailwind.config.ts.', 'fixed'],
    ['F-2', 'SectionHeader colours the eyebrow green (green-800 / green-500). Green means status only.', 'SectionHeader.tsx:15-17', 'Use accent-text: brand-600 (light) / brand-400 (dark), as BentoCard does. Token dark|light/eyebrow keeps the as-built value.', 'medium'],
    ['F-3', 'Surfaces drift from the config: [#222] ×67, [#050505] ×45, [#1a1a1a] ×41, [#111] ×37, [#0a0a0a] ×24, [#333] ×18.', 'Button.tsx:32 · ExpandableProjectCard.tsx:80 · Footer.tsx · admin/_components/ui.tsx', 'Map to dark/card #121214, dark/border #27272A, dark/hover #18181B, dark/input-bg #09090B, dark/border-strong #3F3F46.', 'low'],
    ['F-4', 'Button primary is black / white, not indigo. Nav and Home CTAs override it to bg-brand-600 in light mode only.', 'Button.tsx:28-35 · Navigation.tsx:147 · HomeContent.tsx:142', 'Decide one primary. The library keeps Kind=Primary (black / white) and adds Kind=Brand for the indigo CTA.', 'decision'],
    ['F-5', 'focus-visible:ring-offset-2 sets no offset colour, so the offset is white in dark mode.', 'Button.tsx:28 · AnalyticsToggle.tsx:60 · Footer.tsx:36/39/42', 'Add ring-offset-light-bg dark:ring-offset-dark-bg. Effect styles focus/ring-dark and focus/ring-light show the target.', 'low'],
    ['F-6', 'No toast, tooltip, skeleton, accordion, pagination or visual breadcrumbs exist in code. Tooltips use the native title.', 'src/components', 'Figma defines them as targets for the rebuild (10 · Components). Build them before the first use.', 'info']];
  const t = K.col(0, 'Findings'); t.cornerRadius = 20; t.clipsContent = true; K.s(t, 'dark/border'); h.add(b, t);
  let i = 0; for (const r of rows) { const head = i === 0; const row = K.row(0, r[0]); row.counterAxisAlignItems = 'MIN'; K.f(row, head ? 'dark/hover' : i % 2 ? 'dark/card' : 'dark/bg');
    for (let k = 0; k < r.length; k++) { const cell = K.col(0, 'Cell'); K.pad(cell, 20, 18);
      let col = head ? 'dark/faint' : k === 0 ? 'dark/accent-text' : k === 2 ? 'dark/sub' : 'dark/text';
      if (!head && k === 4) col = r[4] === 'medium' ? 'dark/warning-text' : r[4] === 'decision' ? 'dark/accent-text' : 'dark/sub';
      const style = head || k === 4 ? 'label/sm' : k === 0 ? 'label/nav-active' : k === 2 ? 'mono/caption' : 'body/sm';
      h.add(cell, await K.t(head || k === 4 ? r[k].toUpperCase() : r[k], style, col, { w: W[k] - 40 })); K.fixW(cell, W[k]); h.add(row, cell); }
    h.add(t, row); i++; }
  const note = K.card('dark', 1400, 'Off-palette areas', 10, 28);
  h.add(note, await K.t('OFF-PALETTE AREAS · KNOWN, NOT DRIFT', 'label/eyebrow', 'dark/sub'),
    await K.t('The admin traffic panels use a cyan / fuchsia "neon" sub-theme. The CRM dashboard demo uses blue / purple / orange accents on #050505. Both are self-contained demos and are not part of the site tokens.', 'body/sm', 'dark/sub', { w: 1320 }));
  h.add(b, note);
  return h.place(s, b); } });
