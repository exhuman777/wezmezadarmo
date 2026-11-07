import { test, expect } from '@playwright/test';

// Od 7.11.2026 wezmezadarmo działa bez kont: żadna publiczna strona nie linkuje do logowania,
// rejestracji ani paneli, a ich adresy dają 308 na strony publiczne. /admin właściciela zostaje (Basic Auth).
const STRONY = ['/', '/swiadczenia', '/wnioski', '/dla-firm', '/dla-firm/narzedzia', '/dla-firm/narzedzia/dofinansowania', '/dotacje', '/aktualnosci',
  '/statystyki', '/centrum-obywatela', '/nfz', '/o-projekcie', '/blog', '/blog/najwieksze-dotacje-dla-firm-2026', '/agent', '/press',
  '/polityka-prywatnosci', '/regulamin', '/automatyzacje', '/za-darmo-dla-biznesu'];

const ZLE_HREF = /(^|\/)(logowanie|rejestracja|reset-hasla|nowe-haslo|sprawdz-email)(\/|$|\?)|^\/(panel|agent\/panel|dotacje\/panel)(\/|$|\?)/;

test.describe('bez kont i logowania', () => {
  for (const adres of STRONY) {
    test(`${adres}: brak linków do kont i przycisków logowania`, async ({ page }) => {
      await page.goto(adres);
      const hrefy = await page.locator('a[href]').evaluateAll((a) => a.map((x) => {
        const u = new URL((x as HTMLAnchorElement).href);
        return u.origin === location.origin ? u.pathname + u.search : '';
      }).filter(Boolean));
      expect(hrefy.filter((h) => ZLE_HREF.test(h)), 'linki do kont').toEqual([]);
      const tekst = await page.locator('body').innerText();
      expect(tekst).not.toMatch(/Załóż konto|Mam już konto|Zaloguj się|Zarejestruj się/);
    });
  }

  test('308 z /panel i podstron na strony publiczne', async ({ request }) => {
    for (const [z, na] of [['/panel', '/'], ['/panel/swiadczenia', '/swiadczenia'], ['/panel/profil', '/'], ['/agent/panel/powiadomienia', '/agent'],
      ['/dotacje/panel/monitoring', '/dotacje'], ['/logowanie', '/'], ['/agent/logowanie', '/agent'], ['/dotacje/regulamin', '/regulamin']]) {
      const r = await request.get(z, { maxRedirects: 0 });
      expect(r.status(), z).toBe(308);
      expect(new URL(r.headers()['location'], 'http://x').pathname, z).toBe(na);
    }
  });

  test('sitemap i llms.txt bez paneli i logowania', async ({ request }) => {
    for (const plik of ['/sitemap.xml', '/llms.txt']) {
      const t = await (await request.get(plik)).text();
      expect(t, plik).not.toMatch(/wezmezadarmo\.com\/(panel|logowanie|rejestracja|agent\/panel|dotacje\/panel)/);
    }
  });

  test('/admin właściciela dalej działa za hasłem (401 bez hasła)', async ({ request }) => {
    const r = await request.get('/admin', { maxRedirects: 0 });
    expect(r.status()).toBe(401);
  });
});
