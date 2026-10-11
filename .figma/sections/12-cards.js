// 12 · Cards — content: bento, project, build, service, quote, stat, badge, tag, avatar, timeline, terminal chip, section header.
// Accent tones of ExpandableProjectCard: [fill var, dark text var, light text var]
const ACCENT = { Emerald: ['emerald/500', 'emerald/400', 'emerald/700'], Blue: ['blue/500', 'blue/400', 'blue/500'], Amber: ['amber/500', 'amber/400', 'amber/700'] };
const accTxt = (a, mode) => ACCENT[a][K.m(mode) === 'light' ? 2 : 1];

K.chip = async (label, mode) => { const c = K.row(0, 'Chip'); K.pad(c, 8, 3); c.cornerRadius = 4; K.f(c, K.v(mode, 'hover')); h.add(c, await K.t(label, 'label/sm', K.v(mode, 'sub'), { name: 'Label' })); return c; };
K.bento = async (backdrop, state, mode) => { const H = state === 'Hover'; let c;
  if (backdrop === 'Art') c = await K.panel(K.art('mcp', mode), 400, 380, { name: 'Bento Card', pad: 28, gap: 12, mode });
  else { c = K.card(mode, 400, 'Bento Card', 12, 28); c.primaryAxisAlignItems = 'MIN'; }
  if (backdrop !== 'Art') { const ib = K.row(0, 'Icon box'); K.fix(ib, 40, 40); ib.cornerRadius = 8; ib.primaryAxisAlignItems = 'CENTER'; ib.counterAxisAlignItems = 'CENTER';
    K.f(ib, K.v(mode, 'bg')); K.s(ib, K.v(mode, H ? 'accent' : 'border')); h.add(ib, await K.icon('code', K.v(mode, H ? 'accent-text' : 'text'), 20)); h.add(c, ib); }
  h.add(c, await K.t(backdrop === 'Art' ? 'OPEN SOURCE' : 'ENGINEERING DNA', 'label/eyebrow', K.v(mode, 'accent-text'), { name: 'Eyebrow' }),
    await K.t(backdrop === 'Art' ? 'MCP server for AI coding agents.' : 'End-to-End', 'heading/h3', K.v(mode, 'text'), { w: 344, name: 'Title' }),
    await K.t(backdrop === 'Art' ? '81 tools. About 40 % fewer tokens on a 9-task benchmark.' : 'Requirements → UX/UI → shipped product. The stack fits the job.', 'body/sm', K.v(mode, 'sub'), { w: 344, name: 'Body' }),
    await K.link('Arrow', H ? 'Hover' : 'Default', mode, backdrop === 'Art' ? 'View on GitHub' : 'All Services'));
  K.s(c, K.v(mode, H ? 'border-strong' : 'border'));
  await K.fx(c, H ? (K.m(mode) === 'light' ? 'shadow/card-light' : 'glow/card-dark') : (K.m(mode) === 'light' ? 'shadow/sm' : 'glow/card-dark'));
  if (!H && K.m(mode) === 'dark') c.effects = [];
  return c; };
K.projectCard = async (state, accent, mode) => { const X = state === 'Expanded', H = state === 'Hover'; const c = K.col(0, 'Project Card'); c.cornerRadius = 16; c.clipsContent = true;
  K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, H || X ? 'border-strong' : 'border')); K.fixW(c, 640);
  const head = K.row(20, 'Header'); K.pad(head, 24); head.counterAxisAlignItems = 'MIN'; h.add(c, head); h.fillW(head);
  const left = K.col(10, 'Text'); const fill = ACCENT[accent][0], tc = accTxt(accent, mode);
  const badge = K.row(6, 'Badge'); K.pad(badge, 8, 2); badge.cornerRadius = 9999; badge.fills = [K.c(fill, 0.1)]; K.s(badge, fill, 1, 0.3);
  h.add(badge, await K.t(accent === 'Emerald' ? 'LIVE UI DEMO' : accent === 'Blue' ? 'DASHBOARD' : 'GAME', 'label/sm', tc, { name: 'Label' }));
  const chips = K.row(6, 'Tech'); for (const t of ['Next.js', 'TypeScript', 'Supabase']) h.add(chips, await K.chip(t, mode));
  h.add(left, badge, await K.t(accent === 'Emerald' ? 'Code Context MCP — Interactive Demo' : accent === 'Blue' ? 'CRM Dashboard Interface' : 'Cyberpunk Arcade Shooter', 'heading/h4', K.v(mode, 'text'), { w: 440, name: 'Title' }),
    await K.t('MCP server that gives AI coding agents structured access to codebases.', 'body/sm', K.v(mode, 'sub'), { w: 440, name: 'Body' }), chips);
  K.grow(head, left);
  const right = K.col(8, 'Metric'); right.counterAxisAlignItems = 'MAX'; const chev = K.row(0, 'Chevron'); K.fix(chev, 32, 32); chev.cornerRadius = 9999; chev.primaryAxisAlignItems = 'CENTER'; chev.counterAxisAlignItems = 'CENTER';
  K.s(chev, K.v(mode, 'border')); h.add(chev, await K.icon(X ? 'chevron-down' : 'chevron-right', K.v(mode, 'sub'), 16));
  h.add(right, chev, await K.t('-40%', 'metric/lg', tc, { name: 'Metric' }), await K.t('TOKENS', 'label/sm', K.v(mode, 'faint'))); h.add(head, right);
  if (X) { const body = K.col(16, 'Details'); K.pad(body, 24); K.f(body, K.v(mode, 'bg')); h.add(c, K.line(10, K.v(mode, 'border')), body); h.fillW(c.children[1]); h.fillW(body);
    for (const [k, v] of [['CHALLENGE', 'Agents re-read whole repos and burn tokens.'], ['SOLUTION', 'A local index with 81 tools: symbols, files, decisions and sprints.']]) {
      const x = K.col(4, k); h.add(x, await K.t(k, 'label/sm', K.v(mode, 'faint')), await K.t(v, 'body/sm', K.v(mode, 'sub'), { w: 560 })); h.add(body, x); }
    const g = K.row(12, 'Impact'); for (const [v, l] of [['81', 'Tools'], ['~40%', 'Fewer tokens'], ['9', 'Benchmark tasks']]) { const t = K.col(2, l); K.pad(t, 12); t.cornerRadius = 8; K.f(t, K.v(mode, 'card')); K.s(t, K.v(mode, 'border'));
      h.add(t, await K.t(v, 'metric/lg', tc), await K.t(l.toUpperCase(), 'label/sm', K.v(mode, 'faint'))); K.grow(g, t); }
    h.add(body, g); h.fillW(g); }
  return c; };
const GROUP = { Flagship: ['flagship', 'build-synthwerk', 'SYNTHWERK.', 'AI services you run yourself.'], Lab: ['lab', 'build-debater', 'lab-debater', 'Two agents argue, a judge decides.'],
  Ops: ['ops', 'build-rig', 'ops-rig', 'The local AI rig behind every repo.'], Venture: ['venture', 'build-mtg', 'ORBFALL', 'A print-first trading card game.'] };
K.buildCard = async (group, mode) => { const [g, art, title, desc] = GROUP[group]; const c = K.col(0, 'Build Card'); c.cornerRadius = 24; c.clipsContent = true;
  K.f(c, K.v(mode, 'card')); K.s(c, K.v(mode, 'border')); K.fixW(c, 400);
  const im = await h.img('website/' + art + '-v1.png', 400, 166, { name: 'Art' }); h.add(c, im);
  const body = K.col(12, 'Body'); K.pad(body, 24); h.add(c, body); h.fillW(body);
  const bar = h.rect(40, 2, [K.c('group/' + g)]); bar.name = 'Accent';
  h.add(body, bar, await K.pill(group, mode, g, { dot: false }), await K.t(title, 'heading/h3', K.v(mode, 'text'), { name: 'Title' }), await K.t(desc, 'body/sm', K.v(mode, 'sub'), { w: 352, name: 'Body' }),
    await K.link('External', 'Default', mode, group === 'Ops' ? 'Private repo' : 'On GitHub')); return c; };
K.serviceCard = async (state, mode) => { const H = state === 'Hover'; const c = await K.panel(K.art('svc-ux', mode), 300, 360, { name: 'Service Card', pad: 24, gap: 10, mode });
  h.add(c, await K.t('02', 'metric/lg', K.v(mode, 'accent-text'), { name: 'Index' }), await K.t('UX/UI & Branding', 'heading/h4', K.v(mode, 'text'), { name: 'Title' }),
    await K.t('Design as brand message.', 'body/sm', K.v(mode, 'sub'), { w: 252, name: 'Body' }), await K.link('Arrow', H ? 'Hover' : 'Default', mode, H ? 'Discuss UX/UI project' : 'More'));
  if (H) { K.s(c, K.v(mode, 'accent'), 1); await K.fx(c, K.m(mode) === 'light' ? 'shadow/card-light' : 'glow/card-dark'); } return c; };
K.avatar = async (size, kind, mode) => { const d = { sm: 28, md: 40, lg: 48 }[size]; let a;
  if (kind === 'Art') { a = h.box(d, d, [K.c(K.v(mode, 'card'))], d / 2, 'Avatar'); await h.imgFill(a, 'website/about-v1.png', { under: [K.c(K.v(mode, 'card'))] }); K.s(a, K.v(mode, 'border')); }
  else { a = K.row(0, 'Avatar'); K.fix(a, d, d); a.cornerRadius = size === 'sm' ? 8 : d / 2; a.primaryAxisAlignItems = 'CENTER'; a.counterAxisAlignItems = 'CENTER';
    K.f(a, K.v(mode, 'accent'), 0.15); K.s(a, K.v(mode, 'accent'), 1, 0.3); h.add(a, await K.t('VM', size === 'sm' ? 'label/sm' : 'label/nav-active', K.v(mode, 'accent-text'), { name: 'Initials' })); }
  return a; };
K.av = async (size, kind, mode) => { const i = await K.inst('Avatar', { Size: size, Kind: kind, Mode: ModeOf(mode) }); return i || K.avatar(size, kind, mode); };
K.quote = async (mode) => { const c = K.card(mode, 480, 'Quote Card', 20, 32);
  h.add(c, await K.t('THE PERSON', 'label/eyebrow', K.v(mode, 'accent-text')), await K.icon('quote', K.v(mode, 'accent-text'), 32),
    await K.t('No silos, no translation losses. Products start with the business problem, not with code.', 'body/lg', K.v(mode, 'text'), { w: 416, name: 'Quote' }));
  const who = K.row(12, 'Author'); const nm = K.col(2, 'Name'); h.add(nm, await K.t('Velimir Müller', 'body/sm-strong', K.v(mode, 'text'), { name: 'Name' }), await K.t('Product Engineer', 'mono/caption', K.v(mode, 'faint'), { name: 'Role' }));
  h.add(who, await K.av('lg', 'Art', mode), nm); h.add(c, who); return c; };
K.stat = async (size, mode) => { const c = K.col(4, 'Stat'); h.add(c, await K.t(size === 'xl' ? '500%' : '4', size === 'xl' ? 'metric/xl' : 'metric/lg', K.v(mode, size === 'xl' ? 'accent-text' : 'text'), { name: 'Value' }),
  await K.t(size === 'xl' ? 'FASTER LEAD ASSIGNMENT' : 'SHIPPED PRODUCTS', 'label/sm', K.v(mode, 'faint'), { name: 'Label' })); return c; };
K.tag = async (state, mode, label) => { const on = state === 'Active', H = state === 'Hover'; const t = K.row(6, 'Tag'); K.pad(t, 12, 6); t.cornerRadius = 9999;
  t.fills = on ? [K.c(K.v(mode, 'accent'), 0.1)] : H ? [K.c(K.v(mode, 'hover'))] : []; K.s(t, K.v(mode, on ? 'accent' : H ? 'border-strong' : 'border'), 1, on ? 0.3 : null);
  h.add(t, await K.t(label || 'Next.js', 'label/nav', K.v(mode, on ? 'accent-text' : H ? 'text' : 'sub'), { name: 'Label' })); return t; };
K.timeline = async (state, mode) => { const cur = state === 'Current'; const r = K.row(20, 'Timeline Item'); r.counterAxisAlignItems = 'MIN';
  const node = K.row(0, 'Node'); K.fix(node, 40, 40); node.cornerRadius = 20; node.primaryAxisAlignItems = 'CENTER'; node.counterAxisAlignItems = 'CENTER'; K.f(node, K.v(mode, 'bg')); K.s(node, K.v(mode, 'border-strong'));
  const d = K.dot(10, K.v(mode, cur ? 'success' : 'faint')); h.add(node, d); if (cur) await K.fx(d, 'glow/success'); h.add(r, node);
  const card = K.col(8, 'Card'); K.pad(card, 24); card.cornerRadius = 12; K.f(card, K.v(mode, 'inset')); K.s(card, K.v(mode, 'border')); K.fixW(card, 560);
  const top = K.row(12, 'Top'); h.add(top, cur ? await K.pill('Current', mode, 'success') : await K.pill('Enterprise SaaS', mode, 'neutral', { dot: false }), await K.t(cur ? 'Feb 2025 – Present' : 'Oct 2021 – Jan 2025', 'mono/caption', K.v(mode, 'faint'), { name: 'Date' }));
  h.add(card, top, await K.t(cur ? 'Senior Software Engineer — Full-Stack / Product' : 'Software Engineer — Frontend', 'heading/h4', K.v(mode, 'text'), { w: 512, name: 'Title' }),
    await K.t(cur ? 'GALVANY' : 'DEMOS plan GmbH', 'mono/md', K.v(mode, 'accent-text'), { name: 'Company' }),
    await K.t(cur ? 'Lead-matching engine and seller import. 3–4× faster assignment.' : 'Participation platform for public planning. Vue to React migration.', 'body/sm', K.v(mode, 'sub'), { w: 512, name: 'Body' }));
  h.add(r, card); return r; };
K.terminal = async (mode) => { const t = K.row(12, 'Terminal Chip'); K.pad(t, 14, 10); t.cornerRadius = 10; K.f(t, K.v(mode, 'inset')); K.s(t, K.v(mode, 'border'));
  h.add(t, await K.t('$', 'mono/md', K.v(mode, 'accent-text')), await K.t('npm install vlm-code-context-mcp', 'mono/md', K.v(mode, 'text'), { name: 'Command' }), await K.icon('copy', K.v(mode, 'faint'), 16)); return t; };
K.sectionHeader = async (variant, viewport, mode) => { const c = K.col(16, 'Section Header'); const ec = K.v(mode, variant === 'As built' ? 'eyebrow' : 'accent-text');
  const r = K.row(10, 'Eyebrow'); const ln = h.rect(24, 1, [K.c(ec, 0.4)]); ln.name = 'Rule';
  h.add(r, await K.t('01', 'mono/caption', ec, { name: 'Index' }), ln, await K.t('END-TO-END ENGINEERING', 'label/eyebrow', ec, { name: 'Eyebrow' }));
  h.add(c, r, await K.t('OFFER.', viewport === 'Desktop' ? 'heading/h1' : 'display/sm', K.v(mode, 'text'), { name: 'Title' })); return c; };

section({ name: '12 · Cards', page: PG.C, run: async () => {
  await K.init(); await K.reindex(); const s = h.section('12 · Cards'); const b = K.board('Content', 2000);
  h.add(b, await K.head('12 · Components', 'Content', 'Cards and content atoms. Cards are 24 px round on card fill with a 1 px border. Hover lifts 2 px, strengthens the border and adds the glow (dark) or soft shadow (light).'));
  await K.set(b, 'Section Header', 'SectionHeader.tsx. As built = green eyebrow (F-2). Proposed = accent-text eyebrow; use it in the rebuild.', [['Variant', ['As built', 'Proposed']], ['Viewport', ['Desktop', 'Mobile']]], (p, m) => K.sectionHeader(p.Variant, p.Viewport, m));
  await K.set(b, 'Bento Card', 'BentoCard.tsx on the home bento grid. Plain = icon box + text. Art = ArtBackdrop behind the text.', [['Backdrop', ['Plain', 'Art']], ['State', ['Default', 'Hover']]], (p, m) => K.bento(p.Backdrop, p.State, m));
  await K.set(b, 'Project Card', 'ExpandableProjectCard.tsx. Accent per demo. Expanded shows Challenge, Solution and an impact grid.', [['Accent', ['Emerald', 'Blue', 'Amber']], ['State', ['Collapsed', 'Hover', 'Expanded']]], (p, m) => K.projectCard(p.State, p.Accent, m));
  await K.set(b, 'Build Card', 'BuildCard.tsx (Studio Builds). The vm-brand group sets the accent bar and the badge.', [['Group', ['Flagship', 'Lab', 'Ops', 'Venture']]], (p, m) => K.buildCard(p.Group, m));
  await K.set(b, 'Service Card', 'Service teaser with its art (svc-*-v1). Links to /services/[serviceId].', [['State', ['Default', 'Hover']]], (p, m) => K.serviceCard(p.State, m));
  await K.set(b, 'Quote Card', 'Testimonial / quote ("The Person" on home).', [], (p, m) => K.quote(m));
  await K.set(b, 'Stat', 'Stat value + label. md = about summary, xl = case-study metric.', [['Size', ['md', 'xl']]], (p, m) => K.stat(p.Size, m));
  await K.set(b, 'Badge', 'Pill badge. Tones: brand, status (success), neutral, warning, danger, and the four vm-brand groups. Status green once per view.',
    [['Tone', ['Brand', 'Success', 'Neutral', 'Warning', 'Danger', 'Flagship', 'Lab', 'Ops', 'Venture']]], (p, m) => K.pill(p.Tone === 'Success' ? 'Available for projects' : p.Tone === 'Danger' ? 'Spam' : p.Tone, m, p.Tone.toLowerCase()));
  await K.set(b, 'Tag', 'Tech chip and filter chip (FilterChip). Active = selected filter.', [['State', ['Default', 'Hover', 'Active']]], (p, m) => K.tag(p.State, m));
  await K.set(b, 'Avatar', 'Initials or art crop. sm = admin lists (rounded-lg), md = timeline, lg = quote.', [['Kind', ['Initials', 'Art']], ['Size', ['sm', 'md', 'lg']]], (p, m) => K.avatar(p.Size, p.Kind, m));
  await K.set(b, 'Timeline Item', 'About "Experience Log". Current has the live dot.', [['State', ['Current', 'Past']]], (p, m) => K.timeline(p.State, m));
  await K.set(b, 'Terminal Chip', 'Install command on the MCP highlight. Copies on click.', [], (p, m) => K.terminal(m));
  return h.place(s, b); } });
