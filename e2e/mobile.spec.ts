import { test, expect, type Page } from '@playwright/test';

// Telefon (emulacja dotyku): publiczne strony i narzędzia dla firm w pionie i w poziomie.
// Bez poziomego przewijania, przyciski i pola co najmniej 44 px, pola 16 px (iOS nie przybliża ekranu),
// formularz przy sprawdzeniu po NIP (jedyny z e-mailem) da się wypełnić palcem. Bez wysyłki formularza (nic nie idzie do bazy ani na maila).
const STRONY = ['/', '/dla-firm', '/dla-firm/narzedzia', '/dla-firm/narzedzia/kpir', '/dla-firm/narzedzia/jpk', '/dla-firm/narzedzia/dofinansowania', '/swiadczenia', '/o-projekcie', '/press', '/polityka-prywatnosci',
  '/wnioski', '/dotacje', '/aktualnosci', '/statystyki', '/centrum-obywatela', '/centrum-obywatela/polska-cyfrowa', '/nfz', '/blog', '/blog/najwieksze-dotacje-dla-firm-2026', '/agent'];
const EKRANY = [
  { nazwa: '375', viewport: { width: 375, height: 667 } },
  { nazwa: '390', viewport: { width: 390, height: 844 } },
  { nazwa: 'poziomo', viewport: { width: 844, height: 390 } },
];

async function sprawdz(page: Page) {
  return page.evaluate(() => {
    const przew = document.documentElement.scrollWidth - innerWidth;
    const male = [...document.querySelectorAll<HTMLElement>('button, .btn, input:not([type=checkbox]):not([type=radio]):not([type=hidden]), select, textarea')]
      .filter((e) => e.offsetWidth > 0 && e.offsetHeight > 0 && !e.closest('[aria-hidden="true"]'))
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width < 44 || r.height < 44; })
      .map((e) => `${e.tagName.toLowerCase()} "${(e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 16)}" ${Math.round(e.offsetWidth)}x${Math.round(e.offsetHeight)}`);
    const pola = [...document.querySelectorAll<HTMLElement>('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=range]), select, textarea')]
      .filter((e) => !e.closest('[aria-hidden="true"]') && parseFloat(getComputedStyle(e).fontSize) < 16).length;
    const vp = document.querySelector('meta[name=viewport]')?.getAttribute('content') || '';
    return { przew, male, pola, vp };
  });
}

for (const ekran of EKRANY) {
  test.describe(`telefon ${ekran.nazwa}`, () => {
    test.use({ viewport: ekran.viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    for (const adres of STRONY) {
      test(`${adres}: bez przewijania w poziomie, cele dotyku 44 px, pola 16 px`, async ({ page }) => {
        await page.goto(adres);
        const r = await sprawdz(page);
        expect(r.przew, 'poziome przewijanie').toBeLessThanOrEqual(0);
        expect(r.male, 'za małe cele dotyku').toEqual([]);
        expect(r.pola, 'pola mniejsze niż 16 px').toBe(0);
        expect(r.vp, 'bez viewport-fit=cover (iOS 26 chowa wtedy treść pod paskiem przeglądarki)').not.toContain('viewport-fit=cover');
      });
    }
  });
}

test.describe('formularz NIP palcem', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
  test('e-mail, telefon i zgoda działają po tapnięciu', async ({ page }) => {
    await page.goto('/dla-firm/narzedzia/dofinansowania');
    const form = page.getByTestId('formularz-narzedzia');
    await expect(form).toBeVisible();
    await page.locator('#n-email').tap();
    await page.keyboard.type('test@example.com');
    await page.locator('#n-tel').tap();
    await page.keyboard.type('600100200');
    await form.locator('input[data-zgoda=email]').tap();
    await expect(form.locator('input[data-zgoda=email]')).toBeChecked();
    await expect(page.locator('#n-email')).toHaveValue('test@example.com');
    const przycisk = form.locator('button[type=submit]');
    const r = await przycisk.boundingBox();
    expect(r && r.height >= 44 && r.width <= 390).toBeTruthy();
  });
});
