import { test, expect } from '@playwright/test';

test('public landing and login smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Find the help you need/i })).toBeVisible();
  await page.getByRole('link', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
});
