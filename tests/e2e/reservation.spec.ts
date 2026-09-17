import { test, expect } from '@playwright/test';

test.describe('Parcours de réservation', () => {
  test('Le formulaire de réservation est accessible depuis la page publique', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que le lien de réservation existe
    const reserveLink = page.locator('a[href="/reserver"]').first();
    await expect(reserveLink).toBeVisible();
    
    await reserveLink.click();
    
    // On devrait être sur /reserver
    await expect(page).toHaveURL(/.*\/reserver/);
    
    // Le formulaire devrait être présent
    await expect(page.locator('form')).toBeVisible();
  });
});
