import { test, expect } from '@playwright/test';

/**
 * Security headers contract. The CSP must allow exactly what the app uses
 * (hCaptcha, Supabase, Vercel insights, the wasm demos, same-origin
 * iframes for the MCP demo) and nothing else —
 * the console check below catches an over-tight policy breaking a page.
 */

test.describe('Security headers', () => {
  test('every core header is present on documents', async ({ page }) => {
    const response = await page.goto('/de');
    const headers = response!.headers();

    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['content-security-policy']).toContain("frame-ancestors 'self'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['strict-transport-security']).toContain('max-age=');
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
