import { test, expect, Page } from '@playwright/test';

/**
 * End-to-end tests for the Next.js portfolio app.
 * Run with: npm run test:e2e
 */

/** Returns true when the viewport is narrower than Tailwind's `md` (768px). */
function isMobile(page: Page): boolean {
  const width = page.viewportSize()?.width ?? 1280;
  return width < 768;
}

/** On mobile, opens the hamburger menu so that nav links become visible. */
async function openMobileMenuIfNeeded(page: Page) {
  if (isMobile(page)) {
    await page.getByRole('button', { name: /menü öffnen|open menu/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  }
}

// ─── Page Load & SEO ────────────────────────────────────────

test.describe('Page rendering', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Velimir Müller/);
  });

  test('homepage displays hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('VELIMIR');
    await expect(page.locator('h1')).toContainText('MÜLLER');
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/services');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('projects page loads', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('imprint page loads', async ({ page }) => {
    await page.goto('/imprint');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toBeVisible();
  });
});

// ─── Navigation ─────────────────────────────────────────────

test.describe('Navigation', () => {
  test('navbar is visible on homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('can navigate to services via nav link', async ({ page }) => {
    await page.goto('/');
    if (isMobile(page)) {
      await openMobileMenuIfNeeded(page);
      await page.getByRole('dialog').getByRole('link', { name: /Leistungen/i }).first().click();
    } else {
      await page.locator('nav').getByRole('link', { name: /services|Leistungen/i }).first().click();
    }
    await expect(page).toHaveURL(/\/services/);
  });

  test('can navigate to about via nav link', async ({ page }) => {
    await page.goto('/');
    if (isMobile(page)) {
      await openMobileMenuIfNeeded(page);
      await page.getByRole('dialog').getByRole('link', { name: /Über/i }).click();
    } else {
      await page.locator('nav').getByRole('link', { name: /about|Über/i }).first().click();
    }
    await expect(page).toHaveURL(/\/about/);
  });

  test('can navigate to contact via CTA button', async ({ page }) => {
    await page.goto('/');
    if (isMobile(page)) {
      await openMobileMenuIfNeeded(page);
      await page.getByRole('dialog').getByRole('link', { name: /Kontakt/i }).click();
    } else {
      await page.locator('nav').getByRole('link', { name: /contact|Kontakt/i }).first().click();
    }
    await expect(page).toHaveURL(/\/contact/);
  });

  test('footer links to imprint and privacy', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.getByRole('link', { name: /imprint|Impressum/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /privacy|Datenschutz/i })).toBeVisible();
  });
});

// ─── Service Detail Pages ───────────────────────────────────

test.describe('Service detail pages', () => {
  const services = [
    'requirements-engineering',
    'ux-ui-branding',
    'frontend-development',
    'project-delivery',
    'modern-stack',
  ];

  for (const serviceId of services) {
    test(`${serviceId} page loads`, async ({ page }) => {
      await page.goto(`/services/${serviceId}`);
      await expect(page.locator('h1')).toBeVisible();
    });
  }
});

// ─── Interactive Demos ──────────────────────────────────────

test.describe('Project demos', () => {
  test('dashboard demo loads', async ({ page }) => {
    await page.goto('/projects/dashboard-demo');
    await expect(page).toHaveTitle(/Velimir Müller/);
  });

  test('project planner loads', async ({ page }) => {
    await page.goto('/projects/project-planner');
    await expect(page).toHaveTitle(/Velimir Müller/);
  });

  test('supabase admin loads', async ({ page }) => {
    await page.goto('/projects/supabase-admin');
    await expect(page).toHaveTitle(/Velimir Müller/);
  });
});

// ─── Theme Toggle ───────────────────────────────────────────

test.describe('Theme', () => {
  test('dark mode is active by default', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('theme toggle switches to light mode', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    if (isMobile(page)) {
      // Mobile has its own visible theme toggle with hardcoded aria-label
      await page.getByRole('button', { name: /switch to light mode/i }).click();
    } else {
      // Desktop uses translated aria-label
      await page.getByRole('button', { name: /theme umschalten|toggle theme/i }).first().click();
    }
    await expect(html).toHaveClass(/light/);
  });
});

// ─── Language Toggle ────────────────────────────────────────

test.describe('Language', () => {
  test('language toggle switches to English', async ({ page }) => {
    await page.goto('/');
    // On mobile the desktop toggle is hidden, so pick the last visible one
    // Both viewports render LanguageToggle — mobile section comes after desktop in DOM
    if (isMobile(page)) {
      await page.getByRole('button', { name: /english|deutsch/i }).last().click();
    } else {
      await page.getByRole('button', { name: /english|deutsch/i }).first().click();
    }
    // After switch, html lang should be "en"
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

// ─── Contact Form ───────────────────────────────────────────

test.describe('Contact form', () => {
  test('form fields are present', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('form');
    await expect(form.getByLabel(/name/i)).toBeVisible();
    await expect(form.getByLabel(/email/i)).toBeVisible();
    await expect(form.getByLabel(/message|nachricht/i)).toBeVisible();
    await expect(form.getByRole('button', { name: /send|senden/i })).toBeVisible();
  });
});

// ─── 404 ────────────────────────────────────────────────────

test.describe('404', () => {
  test('non-existent page shows 404', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
