import { test, expect } from '@playwright/test';

// Pełne pokrycie publicznych stron z mapy projektu (AGENTS.md): każda strona
// realnie się otwiera (status < 400), renderuje sensowną treść i nie pokazuje
// ekranu błędu Next. Chroni przed regresją nawigacji i martwymi trasami.

// [ścieżka, regex treści która MUSI się pojawić w <body>]
const PUBLIC_PAGES: Array<[string, RegExp]> = [
  ['/', /wezmezadarmo|świadcze/i],
  ['/swiadczenia', /świadcze/i],
  ['/wnioski', /wnios/i],
  ['/aktualnosci', /Aktualności|aktualn/i],
  ['/statystyki', /Polska w liczbach|statyst|wskaźnik/i],
  ['/nfz', /NFZ|kolejk/i],
  ['/centrum-obywatela', /Centrum Obywatela/i],
  ['/centrum-obywatela/polska-cyfrowa', /cyfr/i],
  ['/centrum-obywatela/gus', /GUS|dane/i],
  ['/centrum-obywatela/pogoda', /pogod|IMGW/i],
  ['/centrum-obywatela/powietrze', /powietrz|smog|jako/i],
  ['/centrum-obywatela/prawo', /prawo|ustaw|Sejm/i],
  ['/centrum-obywatela/biala-lista', /biał|VAT|NIP/i],
  ['/centrum-obywatela/transport', /transport|rozkład|opóźni/i],
  ['/centrum-obywatela/dzialki', /działk|geodez|mapa/i],
  ['/centrum-obywatela/kursy', /kurs|walut|NBP/i],
  ['/automatyzacje', /Automatyzacje AI|KSeF|automat/i],
  ['/dotacje', /dotacj|NIP|dofinans/i],
  ['/dla-firm', /firm|JDG|biznes/i],
  ['/za-darmo-dla-biznesu', /DogInvoice|DogAnswer/],
  ['/agent', /Asystent|asystent|agent|świadcze/i],
  ['/o-projekcie', /projekc|misj/i],
  ['/polityka-prywatnosci', /prywatnośc|RODO|dane/i],
  ['/regulamin', /Regulamin|regulamin/i],
  ['/blog', /Blog|blog|porad/i],
  ['/press', /Press|press|media/i],
];

test.describe('Publiczne strony - pełne pokrycie mapy', () => {
  for (const [path, contentRe] of PUBLIC_PAGES) {
    test(`otwiera ${path}`, async ({ page }) => {
      const res = await page.goto(path, { waitUntil: 'domcontentloaded' });
      expect(res, `brak odpowiedzi dla ${path}`).not.toBeNull();
      expect(res!.status(), `zły status dla ${path}`).toBeLessThan(400);
      await expect(page.locator('body')).toContainText(contentRe, { timeout: 15_000 });
      // Nie może być ekranu błędu środowiska produkcyjnego Next.
      await expect(page.locator('body')).not.toContainText(/Application error|Internal Server Error/i);
    });
  }

  test('nieistniejąca strona zwraca 404', async ({ page }) => {
    const res = await page.goto('/nie-ma-takiej-strony-999');
    expect(res?.status()).toBe(404);
  });
});

test.describe('SEO i metadane', () => {
  test('strona główna ma tytuł', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/wezmezadarmo|świadcze/i);
  });

  test('tytuły stron nie zawierają zakazanego "--"', async ({ page }) => {
    for (const path of ['/statystyki', '/agent', '/wnioski']) {
      await page.goto(path);
      const title = await page.title();
      expect(title, `tytuł ${path}: ${title}`).not.toContain('--');
    }
  });

  test('sitemap.xml odpowiada i zawiera trasy', async ({ page, baseURL }) => {
    const res = await page.request.get(new URL('/sitemap.xml', baseURL!).href);
    expect(res.ok()).toBeTruthy();
    const body = await res.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('/swiadczenia');
  });
});
