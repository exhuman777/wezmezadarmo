import { test, expect } from '@playwright/test';

// Klikanie po głównej nawigacji i sprawdzanie, że kluczowe strony faktycznie
// się otwierają z właściwą treścią (nie 404, nie pusto).
const PAGES: [string, string, RegExp][] = [
  ['Świadczenia', '/swiadczenia', /świadcze/i],
  ['Centrum Obywatela', '/centrum-obywatela', /Centrum Obywatela/i],
  ['Za darmo dla biznesu', '/za-darmo-dla-biznesu', /DogInvoice|DogAnswer/],
  ['Wnioski', '/wnioski', /wnios/i],
  ['Asystent AI', '/agent', /Asystent|asystent|świadcze/i],
  ['Statystyki', '/statystyki', /statyst|wskaźnik/i],
];

test.describe('Nawigacja główna', () => {
  test('strona główna się ładuje', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/wezmezadarmo|świadcze/i);
    await expect(page.getByRole('link', { name: /wezmezadarmo/i }).first()).toBeVisible();
  });

  for (const [label, path, contentRe] of PAGES) {
    test(`nawigacja: ${label} -> ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      await expect(page.locator('body')).toContainText(contentRe, { timeout: 15_000 });
    });
  }

  test('nieistniejąca strona daje 404', async ({ page }) => {
    const res = await page.goto('/ta-strona-nie-istnieje-123');
    expect(res?.status()).toBe(404);
  });
});
