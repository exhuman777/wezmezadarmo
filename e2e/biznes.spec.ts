import { test, expect } from '@playwright/test';

// Strona "Za darmo dla biznesu": oba produkty z aktualnymi opisami, kontakt przez
// formularz (bez prywatnego e-maila) i brak zepsutych obrazków.
test.describe('Za darmo dla biznesu', () => {
  test('pokazuje DogInvoice i DogAnswer z aktualnymi opisami', async ({ page }) => {
    await page.goto('/za-darmo-dla-biznesu');
    await expect(page.getByRole('heading', { name: 'DogInvoice' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'DogAnswer' })).toBeVisible();
    await expect(page.getByText(/faktur z KSeF/).first()).toBeVisible();
    await expect(page.getByText(/białej liście VAT/).first()).toBeVisible();
    await expect(page.getByText(/Kalendarzu Google/).first()).toBeVisible();
  });

  test('kontakt przez formularz, bez prywatnego e-maila na stronie', async ({ page }) => {
    await page.goto('/za-darmo-dla-biznesu');
    await expect(page.getByText(/Napisz do nas/).first()).toBeVisible();
    // decyzja 11.2026: na stronie nie ma prywatnych adresów e-mail ani starego adresu
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    // decyzja Kamila 7.11.2026: DogInvoice i DogAnswer bez nazwy firmy, która je robi
    await expect(page.locator('body')).not.toContainText(/dogtronic|hajdowska/i);
  });

  test('żaden obrazek na stronie nie jest zepsuty', async ({ page }) => {
    await page.goto('/za-darmo-dla-biznesu', { waitUntil: 'load' });
    const zepsute = await page.locator('img').evaluateAll((imgs) =>
      (imgs as HTMLImageElement[]).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
    );
    expect(zepsute).toEqual([]);
  });

  test('linki do produktów prowadzą na ich strony', async ({ page }) => {
    await page.goto('/za-darmo-dla-biznesu');
    await expect(page.locator('a[href="https://doginvoice.com"]').first()).toBeVisible();
    await expect(page.locator('a[href="https://doganswer.com"]').first()).toBeVisible();
  });
});
