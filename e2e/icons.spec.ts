import { test, expect, type Page } from '@playwright/test';

/**
 * Favicon, app icons and web manifest (issue #105).
 *
 * Each test runs in a fresh browser context, so every page load is a first
 * visit with an empty cache. The test fails on any 404 response or console
 * 404 during that visit, and on any icon or manifest URL that does not
 * return 200.
 */

const LOCALES = ['/en', '/de'];

/**
 * Paths that browsers and crawlers request directly, without a <link> tag:
 * /favicon.ico (all browsers), the Apple touch icons (Safari, crawlers).
 */
const WELL_KNOWN_ICON_PATHS = [
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png',
];

/** Icon and manifest link relations that Next.js renders into <head>. */
const ICON_LINK_SELECTOR = 'head link[rel="icon"], head link[rel="apple-touch-icon"], head link[rel="manifest"]';

/**
 * Records every 404 response and every console error about a 404.
 * The /_vercel/* endpoints (Speed Insights) exist only on Vercel; outside it
 * they 404, so they are stubbed here, as in demos.spec.ts.
 */
async function collectNotFound(page: Page): Promise<string[]> {
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
  const failures: string[] = [];
  page.on('response', (response) => {
    if (response.status() === 404) failures.push(`404 response: ${response.url()}`);
  });
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('404')) {
      failures.push(`console: ${message.text()} (${message.location().url})`);
    }
  });
  return failures;
}

async function expectOk(page: Page, url: string) {
  const response = await page.request.get(url);
  expect(response.status(), url).toBe(200);
  expect((await response.body()).byteLength, `${url} is empty`).toBeGreaterThan(0);
}

for (const path of LOCALES) {
  test.describe(`Icons on ${path}`, () => {
    test('a first visit has no 404 response and no console 404', async ({ page }) => {
      const failures = await collectNotFound(page);

      const response = await page.goto(path);
      expect(response?.ok(), path).toBe(true);
      await page.waitForLoadState('networkidle');

      expect(failures).toEqual([]);
    });

    test('every icon and manifest link in <head> returns 200', async ({ page }) => {
      await page.goto(path);

      const hrefs = await page
        .locator(ICON_LINK_SELECTOR)
        .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));

      // Next.js renders the favicon, the SVG icon, the Apple icon and the manifest.
      const rels = await page
        .locator(ICON_LINK_SELECTOR)
        .evaluateAll((links) => links.map((link) => link.getAttribute('rel')));
      expect(rels).toEqual(expect.arrayContaining(['icon', 'apple-touch-icon', 'manifest']));

      for (const href of hrefs) await expectOk(page, href);
    });
  });
}

test.describe('Icon files', () => {
  test('well-known icon paths return 200', async ({ page }) => {
    for (const path of WELL_KNOWN_ICON_PATHS) await expectOk(page, path);
  });

  test('every icon in the web manifest returns 200', async ({ page }) => {
    const response = await page.request.get('/manifest.webmanifest');
    expect(response.status()).toBe(200);
    const manifest = (await response.json()) as { icons?: { src: string }[] };

    expect(manifest.icons?.length ?? 0).toBeGreaterThan(0);
    for (const icon of manifest.icons ?? []) await expectOk(page, icon.src);
  });
});
