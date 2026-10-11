// 23 · Projects — /projects (ProjectsContent.tsx): interactive demos, studio builds, real-world work.
const BUILDS = [['Flagship', 'build-synthwerk', 'SYNTHWERK.', 'AI services you run yourself.'], ['Ops', 'build-rig', 'ops-rig', 'The local AI rig behind every repo.'], ['Lab', 'build-bench', 'lab-bench', 'Model benchmarks on real tasks.'],
  ['Venture', 'build-mtg', 'MTG Scanner', 'Card scanner for the collection.'], ['Lab', 'build-debater', 'lab-debater', 'Two agents argue, a judge decides.'], ['Flagship', 'build-skills', 'claude skills', 'Development skills for agents.']];
section({ name: '23 · Projects', page: PG.T, run: async () => T.board('23 · Projects', async (w, mode) => {
  const D = T.D(w), CW = T.CW(w), M = T.MODE(mode); const f = T.frame('Projects · ' + w, w, mode);
  h.add(f, await T.top(w, mode, 'projects', 'Projects', 'Example Demo Projects', 'DEMOS.'));
  const body = T.body(w, D ? 72 : 48, D ? 16 : 8); h.add(f, body);
  const demos = K.col(16, 'Interactive demos'); h.add(demos, await T.h2(w, mode, 'Interactive Demos', '01 · Try it'));
  const dg = T.grid(w, 2); h.add(demos, dg.g);
  for (const [st, acc, t] of [['Expanded', 'Emerald', 'Code Context MCP — Interactive Demo'], ['Collapsed', 'Blue', 'CRM Dashboard Interface'], ['Collapsed', 'Amber', 'Cyberpunk Arcade Shooter']].slice(0, D ? 3 : 2)) {
    const i = await T.use('Project Card', { Accent: acc, State: st, Mode: M }, { Title: t }, () => K.projectCard(st, acc, mode)); h.add(dg.g, i); T.size(i, dg.cw); }
  h.add(body, demos);
  const builds = K.col(16, 'Studio builds'); const bg = T.grid(w, 3); h.add(builds, await T.h2(w, mode, 'Studio Builds', '02 · VM. studio'), bg.g);
  for (const [g, art, t, d] of D ? BUILDS : BUILDS.slice(0, 2)) { const i = await T.use('Build Card', { Group: g, Mode: M }, { Title: t, Body: d }, () => K.buildCard(g, mode));
    const a = i.findOne ? i.findOne(x => x.name === 'Art') : null; if (a) await h.imgFill(a, 'website/' + art + '-v1.png'); h.add(bg.g, i); T.size(i, bg.cw); }
  h.add(body, builds);
  const work = K.col(16, 'Real-world work'); h.add(work, await T.h2(w, mode, 'Real-World Work', '03 · Case studies'));
  const cases = [['ML-Driven Lead Matching', 'GALVANY', '500%', 'FASTER LEAD ASSIGNMENT', 'A matching engine that routes sellers to the right partner in seconds instead of hours.', ['Python', 'Azure', 'Postgres'], 'warning', 'site-svc-requirements'],
    ['Enterprise Workflow Automation', 'DEMOS plan', '−60%', 'MANUAL STEPS', 'Participation workflows for public planning, rebuilt as a guided product.', ['React', 'TypeScript', 'Symfony'], 'lab', 'site-svc-delivery']];
  for (let k = 0; k < cases.length; k++) { const [t, c, v, l, d, tech, tone, art] = cases[k]; const cs = h.AL(D ? 'HORIZONTAL' : 'VERTICAL', { name: t, itemSpacing: D ? 40 : 20 });
    K.pad(cs, D ? 32 : 24); cs.cornerRadius = 24; K.f(cs, K.v(mode, 'card')); K.s(cs, K.v(mode, 'border')); K.fixW(cs, CW); cs.counterAxisAlignItems = 'MIN';
    const im = await h.img('website/' + art + '.png', D ? 520 : CW - 48, D ? 320 : 180, { r: 16, name: 'Art' }); if (K.m(mode) === 'light') im.opacity = 0.85;
    const x = K.col(14, 'Text'); const tags = K.row(8, 'Tags'); h.add(tags, await K.pill(c, mode, tone, { dot: false }), await K.pill('Case study', mode, 'neutral', { dot: false }));
    const chips = K.row(6, 'Tech'); for (const tc of tech) h.add(chips, await K.chip(tc, mode));
    h.add(x, tags, await K.t(t, 'heading/h3', K.v(mode, 'text'), { w: D ? 640 : CW - 48 }), await K.t(d, 'body/md', K.v(mode, 'sub'), { w: D ? 640 : CW - 48 }),
      await T.use('Stat', { Size: 'xl', Mode: M }, { Value: v, Label: l }, async () => { const s = await K.stat('xl', mode); await K.texts(s, { Value: v, Label: l }); return s; }), chips,
      await K.btn('Outline', 'sm', mode, 'Read the case'));
    if (D && k % 2) h.add(cs, x, im); else h.add(cs, im, x); h.add(work, cs); }
  h.add(body, work);
  h.add(f, await T.footer(w, mode)); return f; }, { route: '/projects' }) });
