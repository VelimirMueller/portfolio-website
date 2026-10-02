import { test, expect, type Page } from '@playwright/test';

/**
 * First-party analytics contract (client side). The server skips headless
 * browsers as bots, so these tests check what the page sends, not what is
 * stored — storage is covered by the route unit tests and the migration.
 *
 * Playwright does not expose sendBeacon's Blob body, so an init script wraps
 * sendBeacon and records each payload (the beacon is still sent).
 */
const RECORD_BEACONS = () => {
  const w = window as unknown as { __beacons: unknown[] };
  w.__beacons = [];
  const original = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (url, data) => {
    if (String(url).endsWith('/api/collect') && data instanceof Blob) {
      data.text().then((text) => w.__beacons.push(JSON.parse(text)));
    }
    return original(url, data);
  };
};

const beacons = (page: Page) => page.evaluate(() => (window as unknown as { __beacons: unknown[] }).__beacons);

test.describe('Analytics beacons', () => {
  test('page views carry the previous page, clicks carry their label', async ({ page, context }) => {
    await page.addInitScript(RECORD_BEACONS);
    await page.goto('/de');
    await expect.poll(() => beacons(page)).toEqual([{ t: 'pageview', p: '/de' }]);

    // Client-side navigation through a labelled CTA: one click beacon, one page view.
    await page.locator('[data-track="hero:contact"]').first().click();
    await page.waitForURL('**/de/contact');
    await expect
      .poll(() => beacons(page))
      .toEqual([
        { t: 'pageview', p: '/de' },
        { t: 'click', p: '/de', e: 'hero:contact' },
        { t: 'pageview', p: '/de/contact', v: '/de' },
      ]);

    // Still nothing on the device.
    expect(await context.cookies()).toEqual([]);
  });

  test('the collector answers 204 and never sets a cookie', async ({ request }) => {
    const response = await request.post('/api/collect', { data: JSON.stringify({ t: 'pageview', p: '/de' }) });
    expect(response.status()).toBe(204);
    expect(response.headers()['set-cookie']).toBeUndefined();
  });

  test('Do Not Track sends nothing', async ({ browser }) => {
    const context = await browser.newContext();
    await context.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' }));
    const page = await context.newPage();
    const collected: string[] = [];
    page.on('request', (r) => r.url().endsWith('/api/collect') && collected.push(r.url()));
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-track="hero:contact"]').first().click();
    await page.waitForURL('**/de/contact');
    expect(collected).toEqual([]);
    await context.close();
  });
});
