import { test, expect } from '@playwright/test';

test('public landing and login smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your campus is full of people who can help/i })).toBeVisible();
  await page.getByRole('link', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
});

test('landing and sign-in adapt to a mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your campus is full of people who can help/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
