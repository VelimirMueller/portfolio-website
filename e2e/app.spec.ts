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
    await page.getByRole('button', { name: /navigationsmenü öffnen|open navigation menu/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  }
}

// ─── Page Load & SEO ────────────────────────────────────────

test.describe('Page rendering', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/de');
    await expect(page).toHaveTitle(/Velimir Müller/i);
  });

  test('html lang reflects the German locale', async ({ page }) => {
    await page.goto('/de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('html lang reflects the English locale', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('German pages share German Open Graph and Twitter metadata', async ({ page }) => {
    const pages = [
      { path: '/de', title: /^Velimir Müller \| /, description: /Produkte/ },
      { path: '/de/contact', title: /^Kontakt — Velimir Müller$/, description: /Kontaktieren Sie mich/ },
    ];
    for (const { path, title, description } of pages) {
      await page.goto(path);
      const meta = (selector: string) =>
        page.locator(`head meta[${selector}]`).first().getAttribute('content');
      expect(await meta('property="og:locale"')).toBe('de_DE');
      expect(await meta('property="og:locale:alternate"')).toBe('en_US');
      expect(await meta('property="og:title"')).toMatch(title);
      expect(await meta('property="og:description"')).toMatch(description);
      expect(await meta('name="twitter:title"')).toBe(await meta('property="og:title"'));
      expect(await meta('property="og:image:alt"')).toContain('Leitsatz');
      await expect(page.locator('head link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
    }
  });

  test('English pages keep og:locale en_US', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('head meta[property="og:locale"]')).toHaveAttribute('content', 'en_US');
    await expect(page.locator('head meta[property="og:locale:alternate"]')).toHaveAttribute('content', 'de_DE');
  });

  test('homepage displays hero content', async ({ page }) => {
    await page.goto('/de');
    await expect(page.locator('h1')).toContainText('VELIMIR');
    await expect(page.locator('h1')).toContainText('MÜLLER');
  });

  test('services page loads', async ({ page }) => {
    await page.goto('/de/services');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('projects page loads', async ({ page }) => {
    await page.goto('/de/projects');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/de/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('contact page loads', async ({ page }) => {
    await page.goto('/de/contact');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('imprint page loads', async ({ page }) => {
    await page.goto('/de/imprint');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('privacy page loads', async ({ page }) => {
    await page.goto('/de/privacy');
    await expect(page.locator('h1')).toBeVisible();
  });
});

// ─── Navigation ─────────────────────────────────────────────

test.describe('Navigation', () => {
  test('navbar is visible on homepage', async ({ page }) => {
    await page.goto('/de');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('can navigate to services via nav link', async ({ page }) => {
    await page.goto('/de');
    if (isMobile(page)) {
      await openMobileMenuIfNeeded(page);
      await page.getByRole('dialog').getByRole('link', { name: /services|Leistungen/i }).first().click();
    } else {
      await page.locator('nav').getByRole('link', { name: /services|Leistungen/i }).first().click();
    }
    await expect(page).toHaveURL(/\/de\/services/);
  });

  test('can navigate to about via nav link', async ({ page }) => {
    await page.goto('/de');
    if (isMobile(page)) {
      await openMobileMenuIfNeeded(page);
      await page.getByRole('dialog').getByRole('link', { name: /about|Über/i }).first().click();
    } else {
      await page.locator('nav').getByRole('link', { name: /about|Über/i }).first().click();
    }
    await expect(page).toHaveURL(/\/de\/about/);
  });

  test('can navigate to contact via CTA button', async ({ page }) => {
    await page.goto('/de');
    if (isMobile(page)) {
      await openMobileMenuIfNeeded(page);
      await page.getByRole('dialog').getByRole('link', { name: /contact|Kontakt/i }).first().click();
    } else {
      await page.locator('nav').getByRole('link', { name: /contact|Kontakt/i }).first().click();
    }
    await expect(page).toHaveURL(/\/de\/contact/);
  });

  test('services submenu is reachable by keyboard', async ({ page }) => {
    test.skip(isMobile(page), 'the hover dropdown only exists on desktop');
    await page.goto('/de');
    const servicesLink = page
      .locator('nav')
      .getByRole('link', { name: /services|Leistungen/i })
      .first();
    await servicesLink.focus();
    // focus-within must reveal the submenu — hover-only menus lock
    // keyboard users out.
    await expect(
      page.getByRole('link', { name: 'Requirements Engineering' }).first()
    ).toBeVisible();
  });

  test('footer links to imprint and privacy', async ({ page }) => {
    await page.goto('/de');
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
      await page.goto(`/de/services/${serviceId}`);
      await expect(page.locator('h1')).toBeVisible();
    });
  }
});

// ─── Interactive Demos ──────────────────────────────────────

test.describe('Project demos', () => {
  test('dashboard demo loads', async ({ page }) => {
    await page.goto('/projects/dashboard-demo');
    await expect(page).toHaveTitle(/Velimir Müller/i);
  });

});

// ─── Theme Toggle ───────────────────────────────────────────

test.describe('Theme', () => {
  test('dark mode is active for system dark preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/de');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
  });

  test('light mode is honored for system light preference on first visit', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/de');
    const html = page.locator('html');
    await expect(html).toHaveClass(/light/);
  });

  // Note: browsers removed 'no-preference' from prefers-color-scheme — the
  // dark fallback for that case is covered by the ThemeProvider unit tests.

  test('theme toggle switches from dark to light and persists', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/de');
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);
    // Desktop and mobile toggles share the same translated aria-label;
    // only the visible one is exposed to the accessibility tree.
    await page.getByRole('button', { name: /theme umschalten|toggle theme/i }).click();
    await expect(html).toHaveClass(/light/);
    // The explicit choice must survive a reload (persisted to localStorage)
    await page.reload();
    await expect(html).toHaveClass(/light/);
  });
});

// ─── Language Toggle ────────────────────────────────────────

test.describe('Language', () => {
  test('language toggle switches locale', async ({ page }) => {
    // Force start in German
    await page.goto('/de');
    await page.waitForLoadState('networkidle');
    // Button text is "EN" and aria-label is "Switch to English"
    if (isMobile(page)) {
      await page.getByRole('button', { name: /switch to english/i }).last().click();
    } else {
      await page.getByRole('button', { name: /switch to english/i }).first().click();
    }
    // After switch, URL should contain /en
    await expect(page).toHaveURL(/\/en/);
  });
});

// ─── Locale redirects (open redirect, GHSA-8f24-v5vv-gm5j) ──

test.describe('Locale redirects', () => {
  // Paths the URL parser could read as another host. Joined to the origin by
  // hand: passed to `request.get` as-is, `//evil.example` would be a
  // scheme-relative URL and the request would never reach the app.
  const craftedPaths = [
    '//evil.example',
    '//evil.example/de',
    '/%2F%2Fevil.example',
    '/%5C%5Cevil.example',
    '/%09/evil.example',
    '/de//evil.example',
  ];

  test('the locale redirect for / stays on this host', async ({ request, baseURL }) => {
    const res = await request.get('/', { maxRedirects: 0 });
    expect(res.status()).toBeGreaterThanOrEqual(300);
    expect(res.status()).toBeLessThan(400);
    const target = new URL(res.headers()['location'], baseURL);
    expect(target.origin).toBe(new URL(baseURL!).origin);
    expect(target.pathname).toBe('/de');
  });

  for (const path of craftedPaths) {
    test(`${path} does not redirect off-site`, async ({ request, baseURL }) => {
      const origin = new URL(baseURL!).origin;
      const res = await request.get(`${origin}${path}`, { maxRedirects: 0 });
      const location = res.headers()['location'];
      if (location) {
        expect(new URL(location, origin).origin).toBe(origin);
      }
    });
  }
});

// ─── Contact Form ───────────────────────────────────────────

test.describe('Contact form', () => {
  test('form fields are present', async ({ page }) => {
    await page.goto('/de/contact');
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
    const response = await page.goto('/de/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
