import { test, expect, type Page } from '@playwright/test';

/**
 * Functional coverage of the two standalone demos (issue #72): each one loads,
 * its key interactions work, and the page logs no error.
 *
 * Canonical demo paths. The arcade test pins the page and the two builds it
 * loads, and fails on any request to an old build folder, so stray build
 * artifacts (issue #80) can be removed or moved safely.
 */
const MCP_DEMO = '/projects/mcp-demo';
const MCP_DEMO_DOCUMENT = '/demos/mcp-demo.html';
const ARCADE = '/projects/cyberpunk-arcade/index.html';
// The page names these files (the mobile one with its build hash); a rebuild
// changes the page and this list together.
const ARCADE_BUILDS = {
  desktop: { dir: '/games/cyberpunk/', js: '/games/cyberpunk/game.js', wasm: '/games/cyberpunk/game_bg.wasm' },
  mobile: {
    dir: '/games/cyberpunk_mobile/',
    js: '/games/cyberpunk_mobile/cyberpunk_rpg-38d753a3bdc27ebc.js',
    wasm: '/games/cyberpunk_mobile/cyberpunk_rpg-38d753a3bdc27ebc_bg.wasm',
  },
};
const DEMO_LINKS = ['/projects/dashboard-demo', MCP_DEMO, ARCADE];

/**
 * Collects every console error, uncaught exception and failed response of a
 * page, its iframes included. Assert on the list at the end of a test.
 * The /_vercel/* endpoints (analytics, Speed Insights) exist only on Vercel;
 * outside it they 404, so they are stubbed here.
 */
async function collectErrors(page: Page): Promise<string[]> {
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`);
  });
  return errors;
}

test.describe('MCP demo', () => {
  test('the framed demo loads and its navigation and simulation work', async ({ page }) => {
    const errors = await collectErrors(page);
    const response = await page.goto(MCP_DEMO);
    expect(response?.ok()).toBe(true);

    // Framing works: the same-origin iframe renders the demo, not a blank box (issue #69).
    const iframe = page.locator(`iframe[src="${MCP_DEMO_DOCUMENT}"]`);
    await expect(iframe).toBeVisible();
    const demo = page.frameLocator(`iframe[src="${MCP_DEMO_DOCUMENT}"]`);
    await expect(demo.locator('.logo-text')).toHaveText(/Code Context\s*MCP/);
    await expect(demo.locator('#page-dashboard')).toBeVisible();
    await expect(demo.locator('#kanban')).not.toBeEmpty();

    // The top navigation switches pages.
    await demo.getByRole('button', { name: 'Planning', exact: true }).click();
    await expect(demo.locator('#page-planning')).toBeVisible();
    await expect(demo.locator('#page-dashboard')).toBeHidden();
    await expect(demo.locator('#bc-page')).toHaveText('Planning');

    // The sprint simulation starts and returns to the dashboard.
    const simulate = demo.getByRole('button', { name: /Simulate Sprint/ });
    await simulate.click();
    await expect(simulate).toBeDisabled();
    await expect(demo.locator('#sim-wrap')).toBeVisible();
    await expect(demo.locator('#page-dashboard')).toBeVisible();
    await expect(demo.locator('#sim-phase')).not.toBeEmpty();

    expect(errors).toEqual([]);
  });

  test('the back link leads to the projects page', async ({ page }) => {
    const errors = await collectErrors(page);
    await page.goto(MCP_DEMO);
    await page.getByRole('link', { name: 'Back to Projects' }).click();
    await expect(page).toHaveURL(/\/(de|en)\/projects$/);
    await expect(page.locator('h1')).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('Cyberpunk arcade', () => {

  test('the game loads its build, shows the canvas and takes input', async ({ page, hasTouch, viewport }) => {
    // The desktop build is a 36 MB wasm file; compiling it takes a while in CI.
    test.slow();
    // Same rule as the page: a touch device or a small screen gets the mobile build.
    const mobile = hasTouch || (viewport?.width ?? 1280) < 768;
    const build = mobile ? ARCADE_BUILDS.mobile : ARCADE_BUILDS.desktop;
    const errors = await collectErrors(page);
    const gamePaths: string[] = [];
    page.on('request', (request) => {
      const { pathname } = new URL(request.url());
      if (pathname.startsWith('/games/')) gamePaths.push(pathname);
    });

    const response = await page.goto(ARCADE);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('#version-label')).toHaveText(mobile ? 'Mobile' : 'Desktop');

    // The loading screen hides only after the wasm module initialized.
    await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 60_000 });
    await expect(page.locator('#error')).toBeHidden();
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box?.width).toBeGreaterThan(0);
    expect(box?.height).toBeGreaterThan(0);

    // Only the canonical build for this device loads, nothing from other build folders.
    expect(gamePaths).toContain(build.js);
    expect(gamePaths).toContain(build.wasm);
    for (const path of gamePaths) {
      expect(path.startsWith(build.dir), `${path} is outside ${build.dir}`).toBe(true);
    }

    if (hasTouch) {
      // Portrait phone: the rotate prompt shows; turning to landscape hides it.
      const rotate = page.locator('#rotate-prompt');
      await expect(rotate).toBeVisible();
      const { width, height } = viewport!;
      await page.setViewportSize({ width: height, height: width });
      await expect(rotate).toBeHidden();
      await expect(page.locator('#touch-controls')).toBeVisible();
      await page.locator('.touch-btn.start-btn').tap();
      await page.locator('.touch-btn.fire').tap();
    } else {
      await expect(page.locator('#touch-controls')).toBeHidden();
      await canvas.click();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');
      await page.keyboard.press('KeyD');
    }
    // Give the game loop a few frames to react to the input.
    await page.waitForTimeout(1000);
    await expect(page.locator('#error')).toBeHidden();

    expect(errors).toEqual([]);
  });
});

test.describe('Old arcade build URLs', () => {
  // public/games/dist/ was removed (issue #80); old external links redirect permanently to the arcade page.
  for (const path of ['/games/dist', '/games/dist/index.html', '/games/dist/cyberpunk_rpg-d4da93eb63bc5ffa.js']) {
    test(`${path} redirects permanently to the arcade page`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(308);
      expect(response.headers()['location']).toBe(ARCADE);
    });
  }

  test('the folder URL with a trailing slash ends on the working arcade page', async ({ request }) => {
    const response = await request.get('/games/dist/');
    expect(response.status()).toBe(200);
    expect(new URL(response.url()).pathname).toBe(ARCADE);
  });
});

test.describe('Projects page demo links', () => {
  test('every demo link returns 200', async ({ page, request }) => {
    await page.goto('/de/projects');
    // Demo links render only inside an expanded project card.
    const cards = page.locator('button[data-track^="project:"]');
    for (const card of await cards.all()) {
      await card.click();
      await expect(card).toHaveAttribute('aria-expanded', 'true');
    }
    const hrefs = await page
      .locator('a[href^="/projects/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect([...new Set(hrefs)].sort()).toEqual([...DEMO_LINKS].sort());

    for (const href of DEMO_LINKS) {
      const response = await request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });
});
