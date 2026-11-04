import { test, expect } from '@playwright/test';
import { wydajDostep, COOKIE_DOSTEP } from '../src/lib/narzedzia/dostep';

/**
 * Narzędzia KPiR i JPK w wersji WZD działają tylko w przeglądarce: bez czatu, bez formularzy
 * i bez wywołań API (pliki nie trafiają na serwer). W paczkach JS zostały martwe ścieżki
 * z wersji dla biur (/api/czat, /api/zapytanie, /api/zgloszenie); ten test pilnuje,
 * żeby żaden widoczny element ich nie uruchamiał.
 */
const KLUCZ_TESTOWY = 'tylko-tryb-testowy-narzedzia';
const NARZEDZIA = ['/narzedzia/kpir/', '/narzedzia/kpir/kpir/', '/narzedzia/kpir/forma/', '/narzedzia/jpk/'];

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

test.describe('narzędzia dla firm z ciasteczkiem dostępu', () => {
  test.beforeEach(async ({ context, baseURL }) => {
    const wartosc = await wydajDostep('e2e-test', Date.now(), KLUCZ_TESTOWY);
    expect(wartosc).toBeTruthy();
    await context.addCookies([{ name: COOKIE_DOSTEP, value: wartosc as string, url: baseURL as string }]);
  });

  for (const sciezka of NARZEDZIA) {
    test(`${sciezka}: przykład działa bez API, bez błędów i bez przewijania w poziomie`, async ({ page }) => {
      const bledy: string[] = [];
      const api: string[] = [];
      page.on('pageerror', (e) => bledy.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
      page.on('request', (r) => { if (/\/api\//.test(new URL(r.url()).pathname)) api.push(r.url()); });

      const odp = await page.goto(sciezka);
      expect(odp?.status()).toBe(200);
      expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe(sciezka.replace(/\/$/, ''));

      const przyklad = page.getByText(/przykład|demo/i).first();
      if (await przyklad.isVisible().catch(() => false)) {
        await przyklad.click();
        await page.waitForTimeout(1500);
      }

      const widoczneFormularze = await page.locator('form:visible').count();
      const widocznyCzat = await page.locator('[data-czat-otworz]:visible').count();
      const szerokosc = await page.evaluate(() => document.documentElement.scrollWidth);

      expect(widoczneFormularze, 'formularz w narzędziu (wysyłałby dane na nieistniejące API)').toBe(0);
      expect(widocznyCzat, 'czat w narzędziu').toBe(0);
      expect(api, 'wywołania API z narzędzia').toEqual([]);
      expect(bledy).toEqual([]);
      expect(szerokosc).toBeLessThanOrEqual(390);
    });
  }
});
