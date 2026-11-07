import { test, expect, type Page } from '@playwright/test';

// Zasady designu z AGENTS.md sprawdzane w przeglądarce na publicznych stronach, na 390 i 1280 px:
// bez gradientów, rozmyć tła i zaokrąglonych przycisków. Ruch (od 7.11.2026, decyzja Kamila) tylko
// w dozwolonych miejscach: wejście kafli (.linki > li) i rotator (.ruch), wyłącznie transform i opacity.
// Przy prefers-reduced-motion żadnego ruchu. Gra działa w osobnej ramce, więc jej nie liczymy.
const STRONY = ['/', '/swiadczenia', '/wnioski', '/dla-firm', '/dla-firm/narzedzia', '/dotacje', '/aktualnosci', '/press', '/statystyki', '/centrum-obywatela', '/centrum-obywatela/polska-cyfrowa', '/nfz', '/o-projekcie', '/automatyzacje', '/blog', '/blog/najwieksze-dotacje-dla-firm-2026', '/agent'];

const WLASCIWOSCI_RUCHU = new Set(['opacity', 'transform']);

async function sprawdzStrone(page: Page) {
  return page.evaluate((dozwolone) => {
    const zle: string[] = [];
    for (const a of document.getAnimations()) {
      const cel = (a.effect as KeyframeEffect | null)?.target as Element | null;
      const opisCelu = cel ? `${cel.tagName.toLowerCase()}.${String(cel.className).slice(0, 30)}` : '?';
      if (a instanceof CSSAnimation) {
        if (!cel || !cel.matches('.linki > li, .ruch')) zle.push(`animacja poza dozwolonym miejscem ${opisCelu}`);
        const klatki = (a.effect as KeyframeEffect).getKeyframes();
        for (const k of klatki) for (const w of Object.keys(k)) {
          if (!['offset', 'computedOffset', 'easing', 'composite'].includes(w) && !dozwolone.includes(w)) zle.push(`animacja ${w} ${opisCelu}`);
        }
      } else if (a instanceof CSSTransition) {
        if (!dozwolone.includes(a.transitionProperty)) zle.push(`przejście ${a.transitionProperty} ${opisCelu}`);
      }
    }
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      const st = getComputedStyle(el);
      const opis = `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 30)}`;
      if (st.backgroundImage.includes('gradient')) zle.push(`gradient ${opis}`);
      if (st.backdropFilter && st.backdropFilter !== 'none') zle.push(`rozmycie ${opis}`);
      if (st.filter.includes('blur') || st.filter.includes('drop-shadow')) zle.push(`filtr ${opis}`);
      if ((el.matches('button, .btn') || el.classList.contains('filtr')) && parseFloat(st.borderTopLeftRadius) > 2) zle.push(`zaokrąglenie ${opis}`);
    }
    return zle.slice(0, 10);
  }, [...WLASCIWOSCI_RUCHU]);
}

for (const szerokosc of [390, 1280]) {
  test.describe(`wygląd ${szerokosc} px`, () => {
    test.use({ viewport: { width: szerokosc, height: 900 } });
    for (const adres of STRONY) {
      test(`${adres}: ruch tylko transform i opacity, bez gradientów, rozmyć i zaokrąglonych przycisków`, async ({ page }) => {
        await page.goto(adres);
        expect(await sprawdzStrone(page), 'zaraz po wejściu').toEqual([]);
        await page.waitForLoadState('networkidle').catch(() => undefined);
        expect(await sprawdzStrone(page), 'po załadowaniu').toEqual([]);
      });
    }
  });
}

test.describe('ograniczony ruch (prefers-reduced-motion)', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('strona główna: zero animacji, licznik od razu pokazuje liczbę, rotator stoi', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => undefined);
    const animacje = await page.evaluate(() => document.getAnimations().length);
    expect(animacje).toBe(0);
    const licznik = page.locator('.liczniki .licznik-liczba').first();
    await expect(licznik).toHaveText(String(await licznik.getAttribute('data-licznik')));
    const przed = await page.locator('.rotator-x.jest').textContent().catch(() => null);
    await page.waitForTimeout(3000);
    const po = await page.locator('.rotator-x.jest').textContent().catch(() => null);
    expect(po).toBe(przed);
  });
});

test.describe('ruch na stronie głównej', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('licznik dochodzi do liczby z bazy, rotator zmienia pozycję bez przesunięcia układu', async ({ page }) => {
    await page.goto('/');
    const licznik = page.locator('.liczniki .licznik-liczba').first();
    const cel = await licznik.getAttribute('data-licznik');
    expect(Number(cel)).toBeGreaterThan(100);
    await expect(licznik).toHaveText(String(cel), { timeout: 5000 });
    const rotator = page.getByTestId('rotator');
    await expect(rotator).toContainText('Należy Ci się:');
    const przed = await rotator.boundingBox();
    const tekstPrzed = await page.locator('.rotator-x.jest').textContent();
    await expect.poll(async () => page.locator('.rotator-x.jest').textContent(), { timeout: 6000 }).not.toBe(tekstPrzed);
    const po = await rotator.boundingBox();
    expect(po?.height).toBe(przed?.height);
    // Bez przesunięć układu (CLS) od ruchu na stronie
    const cls = await page.evaluate(() => new Promise<number>((ok) => {
      let suma = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) suma += e.value; })
        .observe({ type: 'layout-shift', buffered: true });
      setTimeout(() => ok(suma), 3000);
    }));
    expect(cls).toBeLessThan(0.05);
  });

  test('telefon z CPU 4x: brak długich zadań powyżej 200 ms od animacji po załadowaniu', async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.goto('/');
    await page.waitForLoadState('networkidle').catch(() => undefined);
    const dlugie = await page.evaluate(() => new Promise<number[]>((ok) => {
      const czasy: number[] = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) czasy.push(Math.round(e.duration)); }).observe({ type: 'longtask' });
      // ok. 3 zmiany rotatora i wejścia kafli po przewinięciu
      window.scrollTo(0, document.body.scrollHeight / 2);
      setTimeout(() => ok(czasy), 7500);
    }));
    expect(dlugie.filter((d) => d > 200), `długie zadania: ${dlugie.join(', ')}`).toEqual([]);
  });

  test('kalkulator pokazuje na żywo, ile świadczeń już pasuje', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('np. 34').fill('34');
    await page.getByRole('button', { name: 'Kobieta' }).click();
    await page.getByRole('checkbox', { name: /Korzystając z serwisu/i }).check();
    await page.getByRole('button', { name: /Sprawdź co Ci się należy/i }).click();
    const pasuje = page.getByTestId('pasuje-teraz');
    await expect(pasuje).toContainText(/Pasuj[eą] już \d+ świadcze/);
    const n1 = Number((await pasuje.locator('strong').textContent()) ?? '0');
    await page.getByRole('button', { name: /^B\s/ }).first().click(); // w związku małżeńskim
    await expect(page.getByText('Pytanie 2 z')).toBeVisible();
    await page.getByRole('button', { name: /^C\s/ }).first().click(); // dwoje dzieci
    await expect(page.getByText('Pytanie 3 z')).toBeVisible();
    const n2 = Number((await pasuje.locator('strong').textContent()) ?? '0');
    expect(n1).toBeGreaterThan(0);
    expect(n2).not.toBe(n1);
  });
});
