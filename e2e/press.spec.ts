import { test, expect } from '@playwright/test';

// Press kit: kopiowanie opisów, pliki do pobrania, formularz kontaktu ze stopki, kontakt bez danych osobowych.
test.describe('/press', () => {
  test('kopiuj wkleja opis do schowka i bez błędów w konsoli', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const bledy: string[] = [];
    page.on('console', m => { if (m.type() === 'error') bledy.push(m.text()); });
    page.on('pageerror', e => bledy.push(e.message));
    await page.goto('/press');
    await expect(page.locator('h1')).toHaveCount(1);
    const opis = await page.locator('.press-tekst').first().innerText();
    await page.getByRole('button', { name: 'Kopiuj: opis w jednym zdaniu' }).click();
    await expect(page.getByText('Skopiowano do schowka.')).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(opis);
    expect(bledy.filter(b => !/supabase|Failed to load resource|ERR_NAME_NOT_RESOLVED/i.test(b))).toEqual([]);
  });

  test('opis w trzech zdaniach ma trzy zdania, bez długich myślników i „--”', async ({ page }) => {
    await page.goto('/press');
    const opis = await page.locator('.press-tekst').nth(1).innerText();
    expect(opis.split(/(?<=\.)\s+/).length).toBe(3);
    const tresc = await page.locator('main').innerText();
    expect(tresc).not.toMatch(/—|--/);
  });

  test('każdy plik do pobrania istnieje i ma właściwy typ', async ({ page, request }) => {
    await page.goto('/press');
    const pliki = await page.locator('main a[download]').evaluateAll(as => as.map(a => (a as HTMLAnchorElement).getAttribute('href') ?? ''));
    expect(pliki.length).toBeGreaterThanOrEqual(16);
    for (const plik of pliki) {
      const r = await request.get(plik);
      expect(r.status(), plik).toBe(200);
      const typ = r.headers()['content-type'] ?? '';
      if (plik.endsWith('.svg')) expect(typ, plik).toContain('image/svg+xml');
      else if (plik.endsWith('.png')) expect(typ, plik).toContain('image/png');
      else expect(typ, plik).toMatch(/image\//);
    }
  });

  test('przycisk kontaktu rozwija formularz w stopce', async ({ page }) => {
    await page.goto('/press');
    await page.getByRole('link', { name: 'Otwórz formularz kontaktu' }).click();
    await expect(page.locator('#napisz-do-nas')).toHaveAttribute('open', '');
    await expect(page.locator('#napisz-do-nas textarea')).toBeVisible();
  });

  test('treść bez telefonu, e-maila i nazwiska', async ({ page }) => {
    await page.goto('/press');
    const html = await page.locator('main').innerHTML();
    expect(html).not.toMatch(/mailto:|tel:|@wezmezadarmo|Sobkowicz|linkedin/i);
  });
});
