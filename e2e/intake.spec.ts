import { test, expect } from '@playwright/test';

// Prawdziwe wypełnienie kalkulatora świadczeń na stronie głównej: wpisanie wieku,
// wybór płci, wysłanie i doczekanie się dopasowanych wyników.
test.describe('Kalkulator świadczeń (strona główna)', () => {
  test('wypełnienie profilu pokazuje dopasowane świadczenia', async ({ page }) => {
    await page.goto('/');

    // formularz jest na dole strony głównej (kotwica #formularz)
    const age = page.getByPlaceholder('np. 34');
    await age.scrollIntoViewIfNeeded();
    await expect(age).toBeVisible();
    await age.fill('34');

    await page.getByRole('button', { name: 'Kobieta' }).click();

    // akceptacja regulaminu jest wymagana, żeby odblokować przycisk
    await page.getByRole('checkbox', { name: /Korzystając z serwisu/i }).check();

    await page.getByRole('button', { name: /Sprawdź co Ci się należy/i }).click();

    // po przeliczeniu pojawia się ekran z wynikami / rozmową (może być animacja ładowania)
    await expect(
      page.getByText(/Znalazłem|dopasowa|świadcze|dopasował/i).first(),
    ).toBeVisible({ timeout: 30_000 });
  });

  test('landing ma czat i przyciski startu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Zacznij sprawdzanie/i })).toBeVisible();
    await expect(page.getByPlaceholder('np. 34')).toBeVisible();
  });
});
