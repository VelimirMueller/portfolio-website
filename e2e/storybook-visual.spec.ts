import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Storybook Components
 *
 * Navigates to each story via the iframe URL and captures screenshots.
 * Run with: npm run test:visual
 * Generate baselines: npm run test:visual -- --update-snapshots
 */

const storyUrl = (id: string) =>
  `/iframe.html?id=${id}&viewMode=story`;

// ─── Atoms ──────────────────────────────────────────────────

test.describe('Atoms/Button', () => {
  test('primary variant', async ({ page }) => {
    await page.goto(storyUrl('atoms-button--primary'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-primary.png');
  });

  test('all variants gallery', async ({ page }) => {
    await page.goto(storyUrl('atoms-button--all-variants'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-all-variants.png');
  });

  test('disabled state', async ({ page }) => {
    await page.goto(storyUrl('atoms-button--disabled'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('button-disabled.png');
  });
});

test.describe('Atoms/CodeBlock', () => {
  test('with filename', async ({ page }) => {
    await page.goto(storyUrl('atoms-codeblock--with-file-name'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('codeblock-filename.png');
  });

  test('default (no filename)', async ({ page }) => {
    await page.goto(storyUrl('atoms-codeblock--default'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('codeblock-default.png');
  });

  test('multiline code', async ({ page }) => {
    await page.goto(storyUrl('atoms-codeblock--multiline-code'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('codeblock-multiline.png');
  });
});

test.describe('Atoms/LanguageToggle', () => {
  test('default state', async ({ page }) => {
    await page.goto(storyUrl('atoms-languagetoggle--default'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('language-toggle-default.png');
  });
});

// ─── Molecules ──────────────────────────────────────────────

test.describe('Molecules/BentoCard', () => {
  test('with title and icon', async ({ page }) => {
    await page.goto(storyUrl('molecules-bentocard--with-title-and-subtitle'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('bentocard-titled.png');
  });

  test('no padding variant', async ({ page }) => {
    await page.goto(storyUrl('molecules-bentocard--no-padding'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('bentocard-nopadding.png');
  });

  test('default (children only)', async ({ page }) => {
    await page.goto(storyUrl('molecules-bentocard--default'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('bentocard-default.png');
  });
});

test.describe('Molecules/SectionHeader', () => {
  test('default', async ({ page }) => {
    await page.goto(storyUrl('molecules-sectionheader--default'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('sectionheader-default.png');
  });

  test('long title', async ({ page }) => {
    await page.goto(storyUrl('molecules-sectionheader--long-title'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('sectionheader-long.png');
  });
});

// ─── Organisms ──────────────────────────────────────────────

test.describe('Organisms/Navigation', () => {
  test('desktop default', async ({ page }) => {
    await page.goto(storyUrl('organisms-navigation--default'));
    await page.waitForLoadState('networkidle');
    // Navigation uses position:fixed so #storybook-root has no height — screenshot the page
    await expect(page).toHaveScreenshot('navigation-desktop.png');
  });

  test('services page active', async ({ page }) => {
    await page.goto(storyUrl('organisms-navigation--on-services-page'));
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('navigation-services-active.png');
  });
});

test.describe('Organisms/Footer', () => {
  test('desktop default', async ({ page }) => {
    await page.goto(storyUrl('organisms-footer--default'));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#storybook-root')).toHaveScreenshot('footer-desktop.png');
  });
});
