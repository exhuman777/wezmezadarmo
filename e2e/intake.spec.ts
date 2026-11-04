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

    // potem krótki kreator (11 pytań z odpowiedziami A-D): wybieramy pierwszą odpowiedź
    // wyniki: lista z filtrem „Wszystkie · N” albo komunikat o braku świadczeń
    const wynik = page.getByRole('button', { name: /Wszystkie · \d+/ }).or(page.getByText(/Nie znalazłem świadczeń/)).first();
    for (let i = 0; i < 15; i++) {
      const licznik = page.getByText(/Pytanie \d+ z \d+/i).first();
      if (!(await licznik.isVisible().catch(() => false))) break;
      const przed = await licznik.innerText();
      await page.getByRole('button', { name: /^A\s/ }).first().click();
      await expect(licznik).not.toHaveText(przed, { timeout: 5_000 }).catch(() => undefined);
    }

    // po przeliczeniu pojawia się ekran z wynikami / rozmową (może być animacja ładowania)
    await expect(wynik).toBeVisible({ timeout: 30_000 });
  });

  test('landing zaczyna się od kalkulatora i ma przycisk startu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Należy Ci się więcej, niż myślisz/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sprawdź za darmo/i }).first()).toBeVisible();
    await expect(page.getByPlaceholder('np. 34')).toBeVisible();
  });
});
