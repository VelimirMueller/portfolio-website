import { test, expect } from '@playwright/test';

test.describe('Admin area', () => {
  test('inbox redirects to login when signed out', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole('button', { name: 'Send login link' })).toBeVisible();
  });

  test('a message page redirects to login when signed out', async ({ page }) => {
    await page.goto('/admin/11111111-1111-4111-8111-111111111111');
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test('login page is not indexable', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('admin is not served under a locale', async ({ page }) => {
    const response = await page.goto('/de/admin');
    expect(response?.status()).toBe(404);
  });

  test('callback without a code sends you back to login with an error', async ({ page }) => {
    await page.goto('/admin/auth/callback');
    await expect(page).toHaveURL(/\/admin\/login\?error=1$/);
    await expect(page.getByText('That login link did not work')).toBeVisible();
  });
});
