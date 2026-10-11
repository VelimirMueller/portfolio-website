// 00 · Cover — what this file is, how it is built, the rules in three lines.
section({ name: '00 · Cover', page: PG.F, renamePage: 'Page 1', run: async () => {
  await K.init(); const s = h.section('00 · Cover'); const b = K.board('Cover', 1600);
  const hero = await K.panel('website/hero-v1.png', 1440, 720, { name: 'Hero', pad: 72, gap: 24 });
  await K.fx(hero, 'glow/card-dark');
  const pills = K.row(12, 'Pills');
  h.add(pills, await K.pill('Design system · v1.0', 'dark', 'brand'), await K.pill('Mirrors main · 2026-10-11', 'dark', 'success'), await K.pill('Figma = mirror of code', 'dark', 'neutral', { dot: false }));
  h.add(hero, pills,
    await K.t('// VELIMIR-MUELLER.DE', 'label/eyebrow', 'dark/accent-text'),
    await K.t('Design System.', 'display/xl', 'dark/text', { w: 1200 }),
    await K.t('Senior Product Engineer · Full-Stack · Infrastructure · Agent Tooling', 'heading/h4', 'dark/accent-text', { w: 1200 }),
    await K.t('Tokens, components and page templates for velimir-mueller.de in one file. Values come from tailwind.config.ts and src/ on main. It is the base for the full UI rebuild.', 'body/lg', 'dark/sub', { w: 860 }));
  h.add(b, hero);

  const meta = K.row(0, 'Meta'); meta.cornerRadius = 20; K.s(meta, 'dark/border'); K.f(meta, 'dark/card'); meta.clipsContent = true; h.add(b, meta); K.fixW(meta, 1440);
  for (const [k, v] of [['Status', 'v1.0 · rebuild base'], ['Source', 'portfolio-website · main'], ['Issue', 'portfolio-website#83'], ['Plan', 'Starter · 1 mode'], ['Tokens', '.figma/tokens.json']]) {
    const c = await K.meta(k, v, 'dark'); K.pad(c, 28, 24); h.add(meta, c); c.layoutGrow = 1; }

  h.add(b, await K.head('Pages', 'Three pages, one system', 'Foundations hold the tokens. Components hold every part as a variant set. Templates rebuild every live route from instances.'));
  const how = K.row(24, 'Pages'); how.counterAxisAlignItems = 'MIN';
  for (const [n, t, d] of [['00', 'Foundations', 'Colour, type, space, radius, grid, effects, art, icons, motion and the drift found in code.'],
    ['10', 'Components', 'Actions, navigation, content, forms, controls, feedback, data and admin. Every set has Mode=Dark|Light.'],
    ['20', 'Templates', 'One template per live route. Desktop 1440 and mobile 390. Dark first, light where the route has light mode.']]) {
    const c = K.card('dark', 464, t, 12, 32); await K.fx(c, 'glow/card-dark');
    h.add(c, await K.t(n, 'metric/xl', 'dark/accent-text'), await K.t(t, 'heading/h3', 'dark/text'), await K.t(d, 'body/sm', 'dark/sub', { w: 400 })); h.add(how, c); }
  h.add(b, how);

  h.add(b, await K.head('Studio', 'One studio, three flagships', 'The site is the shop window of VM. studio. Each project keeps its group accent. The site keeps indigo.'));
  const pr = K.row(24, 'Projects'); pr.counterAxisAlignItems = 'MIN';
  for (const [art, name, tag, desc, tone, chip] of [
    ['website/synthwerk.png', 'SYNTHWERK.', 'Flagship · indigo', 'AI services you run yourself. Chat, vision and a page builder, each in its own repo.', 'flagship', 'Open source'],
    ['website/orbfall.png', 'ORBFALL', 'Venture · amber', 'A trading card game for print first. Six colours, seven rarities.', 'venture', 'Private · M0'],
    ['website/code-context-mcp.png', 'code-context MCP', 'Flagship · on npm', 'MCP server for AI coding agents. 81 tools. About 40 % fewer tokens in the benchmark.', 'flagship', 'Live · npm']]) {
    const p = await K.panel(art, 464, 560, { name, pad: 32, gap: 12 });
    const bar = h.rect(48, 4, [K.c('group/' + tone)], 2); bar.name = 'Accent';
    h.add(p, await K.pill(chip, 'dark', tone), bar, await K.t(name, 'heading/h2', 'dark/text'), await K.t(tag.toUpperCase(), 'label/eyebrow', 'dark/group-' + tone + '-text'), await K.t(desc, 'body/sm', 'dark/sub', { w: 400 }));
    h.add(pr, p); }
  h.add(b, pr);

  const rules = K.row(24, 'Rules'); rules.counterAxisAlignItems = 'MIN';
  for (const [t, d, c] of [['ONE ACCENT', 'Indigo is the accent. Use one accent per surface. Group colours only mark projects.', 'dark/accent-text'],
    ['GREEN IS STATUS', 'Emerald means live, valid or done. Never use it as decoration or for eyebrows.', 'dark/success-text'],
    ['DARK AND LIGHT', 'Every public surface has both modes. Text passes 4.5:1. Admin is dark only.', 'dark/text']]) {
    const k = K.card('dark', 464, t, 10, 28); h.add(k, await K.t(t, 'label/eyebrow', c), await K.t(d, 'body/md', 'dark/sub', { w: 400 })); h.add(rules, k); }
  h.add(b, rules);
  return h.place(s, b); } });
