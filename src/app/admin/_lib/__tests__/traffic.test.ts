import {
  DIRECT,
  berlinClock,
  buildSessions,
  computeFlow,
  computeTraffic,
  parseTrafficParams,
  trafficWindow,
  type TrafficEvent,
} from '../traffic';

const NOW = new Date('2026-10-02T12:30:00Z'); // 14:30 in Berlin (CEST), a Friday

let seq = 0;
function ev(partial: Partial<TrafficEvent> & { at: string }): TrafficEvent {
  const { at, ...rest } = partial;
  seq += 1;
  return {
    created_at: at,
    type: 'pageview',
    visitor: 'v1',
    path: '/de',
    prev_path: null,
    referrer: null,
    target: null,
    country: 'DE',
    device: 'desktop',
    browser: 'Chrome',
    ...rest,
  };
}

describe('parseTrafficParams', () => {
  it('defaults to 7 days, visitors, no filters', () => {
    expect(parseTrafficParams({})).toEqual({ filters: { range: '7d' }, metric: 'visitors', focus: null });
  });

  it('reads range, metric, filters and focus, ignoring junk', () => {
    expect(
      parseTrafficParams({ range: '24h', metric: 'clicks', page: '/de', source: [' google.com '], focus: '/de/contact', bogus: 'x' })
    ).toEqual({ filters: { range: '24h', page: '/de', source: 'google.com' }, metric: 'clicks', focus: '/de/contact' });
    expect(parseTrafficParams({ range: '1y', metric: 'revenue', focus: 'evil' })).toEqual({
      filters: { range: '7d' },
      metric: 'visitors',
      focus: null,
    });
  });
});

describe('berlinClock', () => {
  it('uses Berlin wall time across DST', () => {
    expect(berlinClock(Date.parse('2026-10-02T22:30:00Z'))).toMatchObject({ hour: 0, weekday: 5 }); // Sat 00:30 CEST
    expect(berlinClock(Date.parse('2026-12-01T23:30:00Z'))).toMatchObject({ hour: 0, weekday: 2 }); // Wed 00:30 CET
  });
});

describe('trafficWindow', () => {
  it('buckets hours with the current hour last', () => {
    const w = trafficWindow('24h', NOW);
    expect(w.bucketOf(Date.parse('2026-10-02T12:05:00Z'))).toBe(23);
    expect(w.bucketOf(Date.parse('2026-10-01T13:00:00Z'))).toBe(0);
    expect(w.bucketOf(Date.parse('2026-10-01T12:59:00Z'))).toBe(-1);
    expect(w.bucketOf(Date.parse('2026-09-30T12:59:00Z'))).toBeNull();
    expect(w.labelOf(23)).toBe('14:00');
  });

  it('buckets Berlin days, today last', () => {
    const w = trafficWindow('7d', NOW);
    expect(w.bucketOf(Date.parse('2026-10-01T22:30:00Z'))).toBe(6); // already Oct 2 in Berlin
    expect(w.bucketOf(Date.parse('2026-09-26T00:00:00Z'))).toBe(0);
    expect(w.bucketOf(Date.parse('2026-09-25T12:00:00Z'))).toBe(-1);
    expect(w.labelOf(6)).toBe('02.10.');
    expect(w.startOf(6)).toBe('2026-10-02');
    expect(w.previousIncomplete).toBe(false);
  });

  it('flags comparisons past the retention period', () => {
    expect(trafficWindow('90d', NOW).previousIncomplete).toBe(true);
    expect(trafficWindow('30d', NOW).previousIncomplete).toBe(false);
  });
});

describe('buildSessions', () => {
  it('splits a visitor after 30 minutes of silence and takes the landing referrer', () => {
    const sessions = buildSessions([
      ev({ at: '2026-10-02T10:00:00Z', referrer: 'google.com' }),
      ev({ at: '2026-10-02T10:10:00Z', path: '/de/about', prev_path: '/de' }),
      ev({ at: '2026-10-02T10:12:00Z', type: 'click', target: 'hero:contact' }),
      ev({ at: '2026-10-02T11:00:00Z', path: '/de/contact' }),
      ev({ at: '2026-10-02T10:05:00Z', visitor: 'v2' }),
    ]);
    expect(sessions.map((s) => [s.visitor, s.views.length, s.clicks.length, s.source])).toEqual([
      ['v1', 2, 1, 'google.com'],
      ['v2', 1, 0, DIRECT],
      ['v1', 1, 0, DIRECT],
    ]);
  });
});

describe('computeTraffic', () => {
  const events: TrafficEvent[] = [
    // v1: google → /de → /de/contact, clicks the CTA. Today.
    ev({ at: '2026-10-02T09:00:00Z', referrer: 'google.com' }),
    ev({ at: '2026-10-02T09:00:30Z', type: 'click', target: 'hero:contact' }),
    ev({ at: '2026-10-02T09:01:00Z', path: '/de/contact', prev_path: '/de' }),
    // v2: direct, bounces on /de. Mobile, US. Yesterday.
    ev({ at: '2026-10-01T15:00:00Z', visitor: 'v2', device: 'mobile', country: 'US', browser: 'Safari' }),
    // v3: linkedin → /de/projects → /de → exit. Today.
    ev({ at: '2026-10-02T11:00:00Z', visitor: 'v3', path: '/de/projects', referrer: 'linkedin.com' }),
    ev({ at: '2026-10-02T11:02:00Z', visitor: 'v3', path: '/de', prev_path: '/de/projects' }),
    // live: v4 two minutes ago.
    ev({ at: '2026-10-02T12:28:00Z', visitor: 'v4', path: '/en' }),
    // previous window: two visitors.
    ev({ at: '2026-09-22T10:00:00Z', visitor: 'p1' }),
    ev({ at: '2026-09-23T10:00:00Z', visitor: 'p2' }),
  ];

  it('totals visitors, page views, sessions, clicks, bounce and duration', () => {
    const t = computeTraffic(events, { filters: { range: '7d' }, focus: null }, NOW);
    expect(t.totals).toEqual({ visitors: 4, pageviews: 6, sessions: 4, clicks: 1, bounceRate: 50, avgDuration: 45 });
    expect(t.previous.visitors).toBe(2);
    expect(t.trends.visitors).toBe(100);
    expect(t.trends.clicks).toBeNull(); // nothing to compare against
    expect(t.live).toBe(1);
    expect(t.rawEvents).toBe(7);
  });

  it('fills the daily series and the Berlin heatmap', () => {
    const t = computeTraffic(events, { filters: { range: '7d' }, focus: null }, NOW);
    expect(t.series).toHaveLength(7);
    expect(t.series[6]).toMatchObject({ label: '02.10.', visitors: 3, pageviews: 5, clicks: 1 });
    expect(t.series[5]).toMatchObject({ visitors: 1, pageviews: 1 });
    expect(t.previousSeries.reduce((n, p) => n + p.visitors, 0)).toBe(2);
    // v1 at 11:00 Berlin on Friday (weekday 4).
    expect(t.heatmap[4][11]).toBe(1);
    expect(t.heatmap.flat().reduce((a, b) => a + b, 0)).toBe(4);
  });

  it('ranks pages, sources and audiences', () => {
    const t = computeTraffic(events, { filters: { range: '7d' }, focus: null }, NOW);
    expect(t.pages[0]).toEqual({ key: '/de', visitors: 3, count: 3 });
    expect(t.sources.map((s) => s.key)).toEqual([DIRECT, 'google.com', 'linkedin.com']);
    expect(t.devices).toEqual([
      { key: 'desktop', visitors: 3, count: 3 },
      { key: 'mobile', visitors: 1, count: 1 },
    ]);
    expect(t.countries.map((c) => c.key)).toEqual(['DE', 'US']);
  });

  it('applies filters to every figure', () => {
    const t = computeTraffic(events, { filters: { range: '7d', source: 'google.com' }, focus: null }, NOW);
    expect(t.totals).toMatchObject({ visitors: 1, pageviews: 2, clicks: 1, bounceRate: 0 });
    expect(t.pages.map((p) => p.key)).toEqual(['/de', '/de/contact']);
    const mobile = computeTraffic(events, { filters: { range: '7d', device: 'mobile', country: 'US', browser: 'Safari' }, focus: null }, NOW);
    expect(mobile.totals.visitors).toBe(1);
    const page = computeTraffic(events, { filters: { range: '7d', page: '/de/projects' }, focus: null }, NOW);
    expect(page.totals.visitors).toBe(1);
    expect(page.flow?.focus).toBe('/de/projects');
  });

  it('builds the flow around the top page by default, or the focus', () => {
    const t = computeTraffic(events, { filters: { range: '7d' }, focus: null }, NOW);
    expect(t.flow).toEqual({
      focus: '/de',
      views: 3,
      inbound: expect.arrayContaining([
        { key: 'google.com', kind: 'source', count: 1 },
        { key: DIRECT, kind: 'source', count: 1 },
        { key: '/de/projects', kind: 'page', count: 1 },
      ]),
      outbound: [
        { key: 'exit', kind: 'exit', count: 2 },
        { key: '/de/contact', kind: 'page', count: 1 },
      ],
    });
    expect(computeTraffic(events, { filters: { range: '7d' }, focus: '/de/contact' }, NOW).flow?.views).toBe(1);
    expect(computeTraffic(events, { filters: { range: '7d' }, focus: '/nowhere' }, NOW).flow).toBeNull();
  });

  it('lists clicks and the live feed, newest first', () => {
    const t = computeTraffic(events, { filters: { range: '7d' }, focus: null }, NOW);
    expect(t.clicks).toEqual([{ target: 'hero:contact', count: 1, visitors: 1, topPage: '/de' }]);
    expect(t.feed[0]).toMatchObject({ path: '/en', type: 'pageview', detail: DIRECT });
    expect(t.feed.find((f) => f.type === 'click')?.detail).toBe('hero:contact');
  });

  it('handles an empty dataset', () => {
    const t = computeTraffic([], { filters: { range: '24h' }, focus: null }, NOW);
    expect(t.totals).toEqual({ visitors: 0, pageviews: 0, sessions: 0, clicks: 0, bounceRate: 0, avgDuration: 0 });
    expect(t.series).toHaveLength(24);
    expect(t.flow).toBeNull();
    expect(t.rawEvents).toBe(0);
  });

  it('suppresses trends when the previous window is past retention', () => {
    const t = computeTraffic(events, { filters: { range: '90d' }, focus: null }, NOW);
    expect(Object.values(t.trends).every((v) => v === null)).toBe(true);
  });

  it('stays fast at the 50k-event cap', () => {
    const many: TrafficEvent[] = Array.from({ length: 50_000 }, (_, i) =>
      ev({
        at: new Date(NOW.getTime() - (i % (30 * 24 * 60)) * 60_000).toISOString(),
        visitor: `v${i % 3000}`,
        path: ['/de', '/de/about', '/de/contact', '/en'][i % 4],
        type: i % 5 === 0 ? 'click' : 'pageview',
        target: i % 5 === 0 ? 'nav:contact' : null,
      })
    );
    const started = Date.now();
    computeTraffic(many, { filters: { range: '30d' }, focus: null }, NOW);
    expect(Date.now() - started).toBeLessThan(3000);
  });
});

describe('computeFlow', () => {
  it('folds a long tail into "other"', () => {
    const sessions = buildSessions(
      Array.from({ length: 9 }, (_, i) => [
        ev({ at: `2026-10-02T10:0${i}:00Z`, visitor: `x${i}`, path: `/p${i}` }),
        ev({ at: `2026-10-02T10:0${i}:30Z`, visitor: `x${i}`, path: '/hub' }),
      ]).flat()
    );
    const flow = computeFlow(sessions, '/hub');
    expect(flow?.inbound).toHaveLength(6);
    expect(flow?.inbound[5]).toEqual({ key: 'other', kind: 'other', count: 4 });
  });
});
