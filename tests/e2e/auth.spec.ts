import { test, expect } from '@playwright/test';

test.describe('Authentification et RBAC', () => {
  test('Un visiteur non connecté est redirigé vers /login depuis /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  test('Un visiteur non connecté est redirigé vers /login depuis /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/login.*/);
  });

  // Tests nécessitant des credentials réels ou mockés
  // test('Un client connecté peut accéder à /dashboard', async ({ page }) => {
  //   // Logique de login
  // });
});
