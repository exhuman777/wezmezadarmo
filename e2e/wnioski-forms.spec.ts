import { test, expect } from '@playwright/test';

// Każdy wniosek ZUS to osobny feature (kreator + eksport PDF). Sprawdzamy, że
// wszystkie strony wniosków realnie się otwierają i pokazują treść formularza.
const WNIOSKI: string[] = [
  '/wnioski/zus-erpo',
  '/wnioski/zus-ersu',
  '/wnioski/zus-pel',
  '/wnioski/zus-z15a',
  '/wnioski/zus-z15b',
  '/wnioski/zus-z3',
  '/wnioski/zus-zas53',
  '/wnioski/nlnet',
];

test.describe('Wnioski - strony kreatorów', () => {
  test('hub /wnioski linkuje do wniosków ZUS', async ({ page }) => {
    await page.goto('/wnioski');
    await expect(page.locator('body')).toContainText(/ZUS|wnios/i);
    // przynajmniej jeden link do konkretnego wniosku
    await expect(page.locator('a[href^="/wnioski/"]').first()).toBeVisible();
  });

  for (const path of WNIOSKI) {
    test(`otwiera ${path}`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(res!.status(), `zły status dla ${path}`).toBeLessThan(400);
      await expect(page.locator('body')).not.toContainText(/Application error|Internal Server Error/i);
      // strona wniosku pokazuje jakiś nagłówek / formularz
      await expect(page.locator('h1, h2, form').first()).toBeVisible({ timeout: 15_000 });
    });
  }
});

test.describe('Strony logowania i rejestracji renderują formularze', () => {
  const AUTH: string[] = ['/logowanie', '/rejestracja', '/agent/logowanie', '/agent/rejestracja', '/dotacje/logowanie', '/dotacje/rejestracja'];
  for (const path of AUTH) {
    test(`formularz na ${path}`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(res!.status()).toBeLessThan(400);
      // pole e-mail lub hasło musi być obecne
      await expect(
        page.locator('input[type="email"], input[type="password"], input[name="email"]').first(),
      ).toBeVisible({ timeout: 15_000 });
    });
  }
});
