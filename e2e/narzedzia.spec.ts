import { test, expect } from '@playwright/test';

/**
 * Narzędzia KPiR i JPK w wersji WZD działają tylko w przeglądarce: bez czatu, bez formularzy
 * i bez wywołań API (pliki nie trafiają na serwer). W paczkach JS zostały martwe ścieżki
 * z wersji dla biur (/api/czat, /api/zapytanie, /api/zgloszenie); ten test pilnuje,
 * żeby żaden widoczny element ich nie uruchamiał. Od 6.11.2026 narzędzia działają bez konta,
 * formularza i ciasteczka; e-mail pada tylko przy sprawdzeniu firmy po NIP.
 */
const NARZEDZIA = ['/narzedzia/kpir/', '/narzedzia/kpir/kpir/', '/narzedzia/kpir/forma/', '/narzedzia/jpk/'];

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

test.describe('narzędzia dla firm bez konta i bez ciasteczka', () => {
  test('strony KPiR i JPK prowadzą prosto do narzędzia, bez formularza', async ({ page, context }) => {
    for (const [opis, cel] of [['/dla-firm/narzedzia/kpir', '/narzedzia/kpir/kpir/'], ['/dla-firm/narzedzia/jpk', '/narzedzia/jpk/']]) {
      await page.goto(opis);
      expect(await page.locator('.prosta form').count(), `${opis}: formularz`).toBe(0);
      await page.getByTestId('otworz-narzedzie').click();
      // Next.js zdejmuje końcowy ukośnik (308), middleware podaje index.html katalogu.
      await page.waitForURL((u) => u.pathname.replace(/\/$/, '') === cel.replace(/\/$/, ''));
      expect(await page.title()).not.toMatch(/nie znaleziono|404/i);
    }
    expect((await context.cookies()).some((c) => c.name === 'wzd_narzedzia'), 'ciasteczko dostępu').toBe(false);
  });

  test('lista narzędzi: KPiR i JPK bez formularza, NIP prosi o e-mail i telefon', async ({ page }) => {
    await page.goto('/dla-firm/narzedzia');
    expect(await page.locator('.prosta form').count()).toBe(0);
    await expect(page.locator('a[href="/narzedzia/kpir/kpir/"]')).toBeVisible();
    await expect(page.locator('a[href="/narzedzia/jpk/"]')).toBeVisible();
    await page.goto('/dla-firm/narzedzia/dofinansowania');
    const form = page.getByTestId('formularz-narzedzia');
    await expect(form.locator('#n-email')).toBeVisible();
    await expect(form.locator('#n-tel')).toBeVisible();
  });

  test('NIP: wynik dopiero po kliknięciu linku z maila (atrapa maila w trybie testowym)', async ({ page, context }) => {
    await page.goto('/dla-firm/narzedzia/dofinansowania');
    const form = page.getByTestId('formularz-narzedzia');
    await form.locator('#n-email').fill('ktos+1@firma.pl');
    await form.locator('#n-tel').fill('600 100 200');
    await form.locator('input[data-zgoda=email]').check();
    await form.locator('button[type=submit]').click();
    await expect(form.getByRole('alert')).toContainText('plus');
    await form.locator('#n-email').fill(`e2e-${Date.now()}@firma.pl`);
    await form.locator('button[type=submit]').click();
    await expect(page.getByText('Sprawdź skrzynkę')).toBeVisible();
    expect((await context.cookies()).some((c) => c.name === 'wzd_nip_potwierdzony'), 'dostęp przed kliknięciem linku').toBe(false);
    await expect(page.locator('input[placeholder^="NIP"]')).toHaveCount(0);
    await page.getByTestId('link-testowy').click();
    await page.waitForURL(/\/dla-firm\/narzedzia\/dofinansowania/);
    await expect(page.locator('input[placeholder^="NIP"]')).toBeVisible();
  });

  test('wyszukiwarka programów na /dotacje działa bez konta i bez e-maila', async ({ page }) => {
    await page.goto('/dotacje');
    const w = page.getByTestId('wyszukiwarka-programow');
    await expect(w).toBeVisible();
    await w.getByRole('button', { name: 'Wszystkie' }).click();
    const wszystkie = await w.locator('ul.lista > li').count();
    expect(wszystkie).toBeGreaterThan(20);
    await page.locator('#szukaj-programu').fill('pfron');
    await expect.poll(async () => w.locator('ul.lista > li').count()).toBeLessThan(wszystkie);
    expect(await w.locator('ul.lista > li').count()).toBeGreaterThan(0);
  });

  test('asystent AI na /agent: pole czatu bez logowania', async ({ page }) => {
    await page.goto('/agent?q=Jakie%20ulgi%20mam%20jako%20JDG');
    const czat = page.getByTestId('czat-publiczny');
    await expect(czat.locator('#czat-pytanie')).toHaveValue('Jakie ulgi mam jako JDG');
    await expect(page.getByRole('link', { name: /Zaloguj się i zapytaj/ })).toHaveCount(0);
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
