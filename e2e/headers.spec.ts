import { test, expect } from '@playwright/test';

/**
 * Security headers contract. The CSP must allow exactly what the app uses
 * (hCaptcha, Supabase, the wasm demos) and nothing else. Framing is denied
 * everywhere except /demos/mcp-demo.html, which the MCP demo page embeds
 * same-origin (issue #69). Analytics and Vercel Speed Insights are
 * same-origin, so no analytics host is allowed —
 * the console check below catches an over-tight policy breaking a page.
 */

test.describe('Security headers', () => {
  test('every core header is present on documents', async ({ page }) => {
    const response = await page.goto('/de');
    const headers = response!.headers();

    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['content-security-policy']).not.toContain("frame-ancestors 'self'");
    // Stale Vercel Web Analytics hosts (replaced in v2.1.0) stay out (issue #70).
    expect(headers['content-security-policy']).not.toContain('vercel-scripts.com');
    expect(headers['content-security-policy']).not.toContain('vercel-insights.com');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['strict-transport-security']).toContain('max-age=');
  });

  // Same-origin framing exists only for the MCP demo document (issue #69).
  test('only the MCP demo document allows same-origin framing', async ({ request }) => {
    const demo = await request.get('/demos/mcp-demo.html');
    const demoCsp = demo.headersArray().filter((h) => h.name.toLowerCase() === 'content-security-policy');
    expect(demoCsp).toHaveLength(1);
    expect(demoCsp[0].value).toContain("frame-ancestors 'self'");
    expect(demoCsp[0].value).not.toContain("frame-ancestors 'none'");
    expect(demo.headers()['x-frame-options']).toBe('SAMEORIGIN');

    for (const path of ['/de', '/projects/mcp-demo']) {
      const response = await request.get(path);
      const csp = response.headersArray().filter((h) => h.name.toLowerCase() === 'content-security-policy');
      expect(csp, path).toHaveLength(1);
      expect(csp[0].value, path).toContain("frame-ancestors 'none'");
      expect(response.headers()['x-frame-options'], path).toBe('DENY');
    }
  });

  // The privacy policy promises "no cookies on a visit" — banner-free depends on it.
  test('a visit sets no cookies', async ({ page, context }) => {
    for (const path of ['/', '/de', '/en/about', '/de/contact']) {
      const response = await page.goto(path);
      expect(response!.headers()['set-cookie'], path).toBeUndefined();
    }
    expect(await context.cookies()).toEqual([]);
  });

  for (const path of [
    '/de',
    '/de/contact',
    '/de/projects',
    '/projects/dashboard-demo',
    // Regression guard: this page is an iframe of /demos/mcp-demo.html and
    // silently rendered a blank box while framing was denied.
    '/projects/mcp-demo',
  ]) {
    test(`CSP does not break ${path} (no violation reports in console)`, async ({ page }) => {
      const cspErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.text().includes('Content Security Policy')) {
          cspErrors.push(msg.text());
        }
      });
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      // Allow lazy-loaded third-party scripts (hCaptcha, wasm) to attach
      await page.waitForTimeout(1500);
      expect(cspErrors).toEqual([]);
    });
  }
});
