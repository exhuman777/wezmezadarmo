import { test, expect } from '@playwright/test';

// Realne wyszukiwanie i rozwijanie świadczenia: wpisywanie w pole, klikanie,
// sprawdzanie że pojawia się wynik i szczegóły z linkiem do źródła.
test.describe('Wyszukiwarka świadczeń', () => {
  test('wpisanie potocznej nazwy "kuroniowka" znajduje zasiłek dla bezrobotnych', async ({ page }) => {
    await page.goto('/swiadczenia');
    const search = page.getByPlaceholder(/Szukaj świadczenia/i);
    await expect(search).toBeVisible();
    await search.fill('kuroniowka');
    await expect(page.getByText(/zasiłek dla bezrobotnych/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('wyszukiwanie bez polskich znaków działa', async ({ page }) => {
    await page.goto('/swiadczenia');
    const search = page.getByPlaceholder(/Szukaj świadczenia/i);
    await search.fill('swiadczenie pielegnacyjne');
    await expect(page.getByText(/pielęgnacyjne/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('kliknięcie świadczenia rozwija szczegóły z linkiem do źródła', async ({ page }) => {
    await page.goto('/swiadczenia');
    const search = page.getByPlaceholder(/Szukaj świadczenia/i);
    await search.fill('becikowe');
    const row = page.getByRole('button', { name: /becikowe/i }).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    await row.click();
    // po rozwinięciu widać przycisk pełnego przewodnika (link do oficjalnego źródła)
    await expect(page.getByRole('link', { name: /Pełny przewodnik/i }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('bezsensowne zapytanie nie wyrzuca błędu', async ({ page }) => {
    await page.goto('/swiadczenia');
    await page.getByPlaceholder(/Szukaj świadczenia/i).fill('xyzqwertyuiop');
    // strona nadal działa, brak crasha
    await expect(page.locator('body')).toBeVisible();
  });
});
