// 30 · Demo MCP — /projects/mcp-demo: full-screen iframe of /demos/mcp-demo.html with a floating "Back to Projects" glass pill
// and a glass caption. Dark only.
section({ name: '30 · Demo MCP', page: PG.T, run: async () => T.board('30 · Demo MCP', async (w, mode) => { const D = T.D(w);
  const f = T.frame('MCP demo · ' + w, w, mode);
  const frame = await K.panel('website/code-context-mcp.png', w, D ? 900 : 760, { name: 'iframe · /demos/mcp-demo.html', pad: D ? 24 : 16, gap: 16, r: 0, stroke: false, align: 'MIN', mode,
    over: [h.grad([[0, '#0A0A0B', 0.55], [0.3, '#0A0A0B', 0.1], [1, '#0A0A0B', 0.4]], 90)] });
  const pill = K.row(8, 'Back to Projects'); K.pad(pill, 16, 10); pill.cornerRadius = 9999; await K.glassSkin(pill, mode, 'panel');
  h.add(pill, await K.icon('arrow-left', K.v(mode, 'text'), 16), await K.t('Back to Projects', 'label/button-sm', K.v(mode, 'text'))); h.add(frame, pill);
  const sp = K.spacer(); h.add(frame, sp); sp.layoutGrow = 1;
  const cap = K.row(10, 'Caption'); K.pad(cap, 16, 10); cap.cornerRadius = 12; await K.glassSkin(cap, mode, 'panel');
  h.add(cap, await K.pill('Live UI demo', mode, 'success'), await K.t('Static HTML demo of code-context MCP. The page only frames it.', 'body/xs', K.v(mode, 'sub'), { w: D ? 420 : w - 200 })); h.add(frame, cap);
  h.add(f, frame); return f; }, { route: '/projects/mcp-demo', light: false }) });
