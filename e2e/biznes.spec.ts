import { test, expect } from '@playwright/test';

// Strona "Za darmo dla biznesu": obecność obu produktów, przykłady użycia,
// poprawny e-mail kontaktowy i faktyczne ładowanie obrazków.
test.describe('Za darmo dla biznesu', () => {
  test('pokazuje DogInvoice i DogAnswer z przykładami użycia', async ({ page }) => {
    await page.goto('/za-darmo-dla-biznesu');
    await expect(page.getByRole('heading', { name: /DogInvoice/ }).or(page.getByText('DogInvoice').first())).toBeVisible();
    await expect(page.getByText('DogAnswer').first()).toBeVisible();
    // przykłady użycia w biznesie
    await expect(page.getByText(/Sklep internetowy|Biuro rachunkowe/).first()).toBeVisible();
    await expect(page.getByText(/Warsztat samochodowy|Gabinet lekarski/).first()).toBeVisible();
  });

  test('kontakt prowadzi na właściwy e-mail', async ({ page }) => {
    await page.goto('/za-darmo-dla-biznesu');
    const mailto = page.locator('a[href^="mailto:kamil.sobkowicz@dogtronic.io"]');
    await expect(mailto.first()).toBeVisible();
    // stary adres nie może już występować
    await expect(page.locator('a[href*="admin@dogtronic.io"]')).toHaveCount(0);
  });

  test('obrazki produktów faktycznie się ładują (nie broken)', async ({ page, baseURL }) => {
    await page.goto('/za-darmo-dla-biznesu');
    // pulpit DogInvoice - konkretny obraz produktu
    const dashboard = page.getByAltText(/pulpit do zarządzania fakturami/i);
    await expect(dashboard).toBeVisible();
    // sam adres obrazu musi zwracać poprawną odpowiedź (nie broken/404)
    const src = await dashboard.getAttribute('src');
    expect(src).toBeTruthy();
    const resp = await page.request.get(new URL(src!, baseURL!).href);
    expect(resp.ok()).toBeTruthy();
    expect((resp.headers()['content-type'] ?? '')).toMatch(/image\//);
  });

  test('linki do produktów prowadzą na ich strony', async ({ page }) => {
    await page.goto('/za-darmo-dla-biznesu');
    await expect(page.locator('a[href="https://doginvoice.com"]').first()).toBeVisible();
    await expect(page.locator('a[href="https://doganswer.com"]').first()).toBeVisible();
  });
});
