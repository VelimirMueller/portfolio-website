import { test, expect, Page } from '@playwright/test';

/**
 * Issue #208: the glass pages must paint at once and keep their blur.
 * - Content is server-rendered visible: it must show without JavaScript.
 * - No ancestor of a `.glass` panel may become a backdrop root (opacity < 1, filter, mask, clip-path, blend mode, or
 *   will-change of one), not at rest and not during a page transition. Each would make the panel blur only its
 *   wrapper, so it renders flat and snaps to blurred when the animation ends.
 */

const PAGES = ['/de', '/de/services', '/de/about', '/de/projects', '/de/contact'];

/** Runs in the page: every glass panel whose ancestors break its backdrop, with the reason. */
function collectBackdropRootViolations(): string[] {
  const reasons: string[] = [];
  for (const glass of document.querySelectorAll('.glass, .glass-inner, .glass-demo')) {
    for (let el = glass.parentElement; el && el !== document.documentElement; el = el.parentElement) {
      const s = getComputedStyle(el);
      const why = [
        Number(s.opacity) < 1 && `opacity ${s.opacity}`,
        s.filter !== 'none' && `filter ${s.filter}`,
        s.maskImage && s.maskImage !== 'none' && 'mask',
        s.clipPath !== 'none' && 'clip-path',
        s.mixBlendMode !== 'normal' && `mix-blend-mode ${s.mixBlendMode}`,
        /opacity|filter/.test(s.willChange) && `will-change ${s.willChange}`,
      ].filter(Boolean);
      if (why.length) reasons.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}: ${why.join(', ')}`);
    }
  }
  return [...new Set(reasons)];
}

async function isMobile(page: Page) {
  return (page.viewportSize()?.width ?? 1280) < 768;
}

test.describe('Glass pages paint without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const path of PAGES) {
    test(`${path} shows its content with JavaScript off`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('main h1').first()).toBeVisible();
      const hidden = await page.locator('main [style*="opacity"]').count();
      expect(hidden, 'no server-rendered block may start hidden').toBe(0);
    });
  }
});

test.describe('Glass panels keep their blur', () => {
  for (const path of PAGES) {
    test(`${path} has no backdrop root above a glass panel`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      expect(await page.locator('.glass').count()).toBeGreaterThan(0);
      expect(await page.evaluate(collectBackdropRootViolations)).toEqual([]);
    });
  }

  test('a client-side navigation keeps the blur on every frame', async ({ page }) => {
    test.skip(await isMobile(page), 'the desktop nav links are hidden behind the menu on mobile');
    // The CSP blocks eval in the page, so the checker goes in as an init script (outside the CSP).
    await page.addInitScript(`window.__collectBackdropRootViolations = ${collectBackdropRootViolations.toString()}`);
    await page.goto('/de');
    await page.waitForLoadState('networkidle');

    // Sample every animation frame from the click until the next page has settled.
    await page.evaluate(() => {
      const w = window as unknown as { __violations: string[]; __sampling: boolean; __collectBackdropRootViolations: () => string[] };
      const fn = w.__collectBackdropRootViolations;
      w.__violations = [];
      w.__sampling = true;
      const tick = () => {
        w.__violations.push(...fn());
        if (w.__sampling) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    await page.locator('nav a[href$="/services"]').first().click();
    await expect(page).toHaveURL(/\/de\/services$/);
    await expect(page.locator('main h1').first()).toBeVisible();
    await page.waitForTimeout(1000);

    const violations = await page.evaluate(() => {
      const w = window as unknown as { __violations: string[]; __sampling: boolean };
      w.__sampling = false;
      return [...new Set(w.__violations)];
    });
    expect(violations).toEqual([]);
  });
});
