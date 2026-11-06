import { test, expect } from '@playwright/test';

// Zasady designu z AGENTS.md sprawdzane w przeglądarce na publicznych stronach:
// bez animacji (gra działa w osobnej ramce, więc jej nie liczymy), bez gradientów,
// bez rozmycia tła i bez zaokrąglonych przycisków. Na 390 i 1280 px.
const STRONY = ['/', '/swiadczenia', '/wnioski', '/dla-firm', '/dla-firm/narzedzia', '/dotacje', '/aktualnosci', '/press', '/statystyki', '/centrum-obywatela', '/centrum-obywatela/polska-cyfrowa', '/nfz', '/o-projekcie', '/automatyzacje', '/blog', '/logowanie'];

for (const szerokosc of [390, 1280]) {
  test.describe(`wygląd ${szerokosc} px`, () => {
    test.use({ viewport: { width: szerokosc, height: 900 } });
    for (const adres of STRONY) {
      test(`${adres}: bez animacji, gradientów, rozmyć i zaokrąglonych przycisków`, async ({ page }) => {
        await page.goto(adres);
        await page.waitForLoadState('networkidle').catch(() => undefined);
        const r = await page.evaluate(() => {
          const animacje = document.getAnimations().filter((a) => a instanceof CSSAnimation).length;
          const zle: string[] = [];
          for (const el of document.querySelectorAll<HTMLElement>('body *')) {
            const st = getComputedStyle(el);
            const opis = `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)}`;
            if (st.backgroundImage.includes('gradient')) zle.push(`gradient ${opis}`);
            if (st.backdropFilter && st.backdropFilter !== 'none') zle.push(`rozmycie ${opis}`);
            if ((el.matches('button, .btn') || el.classList.contains('filtr')) && parseFloat(st.borderTopLeftRadius) > 2) zle.push(`zaokrąglenie ${opis}`);
          }
          return { animacje, zle: zle.slice(0, 10) };
        });
        expect(r.animacje, 'animacje CSS').toBe(0);
        expect(r.zle, 'elementy łamiące zasady designu').toEqual([]);
      });
    }
  });
}
