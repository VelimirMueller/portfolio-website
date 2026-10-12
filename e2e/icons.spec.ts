import { test, expect, type Page } from '@playwright/test';

/**
 * Favicon and app icons (issue #105). A first page view must not log a 404,
 * and every icon the page links, plus the fixed paths browsers and crawlers
 * request without reading the <link> tags, must return 200.
 *
 * Vercel Speed Insights lives under /_vercel/ and exists only on Vercel; the
 * local production server 404s it, so it is the one path left out here.
 */
const VERCEL_ONLY = '/_vercel/';

/** Fixed paths requested without a <link> tag, with the expected content type. */
const FIXED_PATHS = [
  ['/favicon.ico', 'image/x-icon'],
  ['/apple-touch-icon.png', 'image/png'],
  ['/manifest.webmanifest', 'application/manifest+json'],
] as const;

const isVercelOnly = (url: string) => new URL(url).pathname.startsWith(VERCEL_ONLY);

/** Every href of an icon or manifest <link> in the document head. */
async function iconLinks(page: Page) {
  return page.$$eval('head link[rel~="icon"], head link[rel="apple-touch-icon"], head link[rel="manifest"]', (links) =>
    links.map((l) => (l as HTMLLinkElement).href)
  );
}

test.describe('Icons', () => {
  test('a first page view logs no 404', async ({ page }) => {
    const notFound: string[] = [];
    page.on('response', (r) => r.status() === 404 && !isVercelOnly(r.url()) && notFound.push(r.url()));
    page.on('console', (msg) => {
      const url = msg.location().url;
      if (msg.type() === 'error' && msg.text().includes('404') && !(url && isVercelOnly(url))) {
        notFound.push(`${msg.text()} ${url}`);
      }
    });

    const response = await page.goto('/de');
    expect(response?.ok()).toBe(true);
    await page.waitForLoadState('networkidle');
    expect(notFound).toEqual([]);
  });

  test('the page links a favicon, an SVG icon, an Apple touch icon and the manifest', async ({ page }) => {
    await page.goto('/de');
    const rels = await page.$$eval('head link[rel~="icon"], head link[rel="apple-touch-icon"], head link[rel="manifest"]', (links) =>
      links.map((l) => `${l.getAttribute('rel')} ${(l as HTMLLinkElement).type}`.trim())
    );
    expect(rels).toEqual(
      expect.arrayContaining(['icon image/x-icon', 'icon image/svg+xml', 'apple-touch-icon image/png', 'manifest'])
    );
  });

  test('every linked icon and manifest icon returns 200', async ({ page, request }) => {
    await page.goto('/de');
    const links = await iconLinks(page);
    expect(links.length).toBeGreaterThan(0);

    const urls = new Set(links);
    const manifestHref = links.find((l) => new URL(l).pathname === '/manifest.webmanifest');
    expect(manifestHref).toBeDefined();
    const manifest = await (await request.get(manifestHref!)).json();
    for (const icon of manifest.icons as { src: string }[]) urls.add(new URL(icon.src, manifestHref).href);

    for (const url of urls) {
      const res = await request.get(url);
      expect(res.status(), url).toBe(200);
      expect(res.headers()['content-type'], url).toMatch(/^(image\/|application\/manifest\+json)/);
    }
  });

  for (const [path, type] of FIXED_PATHS) {
    test(`${path} returns 200 as ${type}`, async ({ request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain(type);
    });
  }
});
