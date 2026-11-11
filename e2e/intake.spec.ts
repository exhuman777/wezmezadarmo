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

  test('wynik ma na górze liczbę świadczeń, stałe kwoty z bazy i „Udostępnij” z linkiem bez danych', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    // bez Web Share API (jak na komputerze): przycisk kopiuje tekst z linkiem
    await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined, configurable: true }); });
    await page.goto('/');
    await page.getByPlaceholder('np. 34').fill('34');
    await page.getByRole('button', { name: 'Kobieta' }).click();
    await page.getByRole('checkbox', { name: /Korzystając z serwisu/i }).check();
    await page.getByRole('button', { name: /Sprawdź co Ci się należy/i }).click();
    await page.getByRole('button', { name: /^B\s/ }).first().click(); // w związku małżeńskim
    await expect(page.getByText('Pytanie 2 z')).toBeVisible();
    await page.getByRole('button', { name: /^C\s/ }).first().click(); // dwoje dzieci
    for (let i = 0; i < 12; i++) {
      const licznik = page.getByText(/Pytanie \d+ z \d+/i).first();
      if (!(await licznik.isVisible().catch(() => false))) break;
      const przed = await licznik.innerText();
      await page.getByRole('button', { name: /^A\s/ }).first().click();
      await expect(licznik).not.toHaveText(przed, { timeout: 5_000 }).catch(() => undefined);
    }
    const podsumowanie = page.getByTestId('wynik-podsumowanie');
    await expect(podsumowanie).toBeVisible({ timeout: 30_000 });
    await expect(podsumowanie).toContainText(/(Może|Mogą) Ci przysługiwać \d+ świadcze/);
    await expect(podsumowanie).toContainText(/zł co miesiąc/);
    await podsumowanie.getByRole('button', { name: 'Udostępnij' }).click();
    await expect(podsumowanie.getByRole('button', { name: 'Skopiowano link' })).toBeVisible();
    const schowek = await page.evaluate(() => navigator.clipboard.readText());
    // tylko liczba świadczeń i link na stronę główną, bez odpowiedzi i kwot osoby
    expect(schowek).toMatch(/^Sprawdzam na wezmezadarmo\.com: (może|mogą) mi przysługiwać \d+ świadcze\S+\. Sprawdź, co należy się Tobie\. Bez konta i za darmo\. https:\/\/www\.wezmezadarmo\.com\/\?ref=wynik$/);
  });

  test('przycisk „Zacznij” prowadzi do pierwszego pola', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('list', { name: 'Jak to działa' }).getByRole('listitem')).toHaveCount(3);
    await page.getByRole('link', { name: 'Zacznij: wpisz wiek' }).click();
    await expect(page.getByPlaceholder('np. 34')).toBeFocused();
    await expect(page.getByPlaceholder('np. 34')).toBeInViewport();
  });

  test('landing zaczyna się od kalkulatora i ma przycisk startu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Należy Ci się więcej, niż myślisz/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Sprawdź za darmo/i }).first()).toBeVisible();
    await expect(page.getByPlaceholder('np. 34')).toBeVisible();
  });

  test('gra ładuje się dopiero po kliknięciu „Zagraj”', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('iframe[src="/gra/index.html"]')).toHaveCount(0);
    await page.getByRole('button', { name: 'Zagraj' }).click();
    await expect(page.locator('iframe[src="/gra/index.html"]')).toBeVisible();
  });
});
