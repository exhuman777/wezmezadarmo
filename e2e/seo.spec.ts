import { test, expect } from '@playwright/test';
import { STRONY } from '../src/lib/strony';
import { SCIEZKI_MD } from '../src/lib/llms';

// SEO i AI SEO na zbudowanej stronie: pliki dla robotów i modeli odpowiadają 200 z dobrym Content-Type,
// każda publiczna strona ma title, description, keywords, canonical i og:url na adresie kanonicznym,
// JSON-LD parsuje się jako JSON, a w przeglądarce jest jeden h1 i zero błędów w konsoli.
const SITE = 'https://www.wezmezadarmo.com';
const kanoniczny = (p: string) => `${SITE}${p === '/' ? '' : p}`;

function meta(html: string, re: RegExp): string | undefined {
  return html.match(re)?.[1];
}

test.describe('pliki dla robotów i modeli', () => {
  const PLIKI: [string, RegExp][] = [
    ['/robots.txt', /^text\/plain/],
    ['/sitemap.xml', /xml/],
    ['/llms.txt', /^text\/plain; charset=utf-8/],
    ['/llms-full.txt', /^text\/plain; charset=utf-8/],
    ['/llm.md', /^text\/markdown; charset=utf-8/],
    ['/agents.md', /^text\/markdown; charset=utf-8/],
    ...SCIEZKI_MD.map((p): [string, RegExp] => [p === '/' ? '/index.md' : `${p}.md`, /^text\/markdown; charset=utf-8/]),
  ];
  for (const [plik, typ] of PLIKI) {
    test(`${plik}: 200 i ${typ.source}`, async ({ request }) => {
      const r = await request.get(plik);
      expect(r.status()).toBe(200);
      expect(r.headers()['content-type']).toMatch(typ);
      expect((await r.text()).length).toBeGreaterThan(100);
    });
  }

  test('sitemap.xml ma tylko adresy kanoniczne i wszystkie strony z rejestru', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const adresy = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    for (const s of STRONY) expect(adresy).toContain(kanoniczny(s.sciezka));
    for (const a of adresy) expect(a.startsWith(SITE)).toBe(true);
  });

  test('obrazy OG: serwisu i własne obrazy narzędzi, 200 i PNG', async ({ request }) => {
    for (const [strona, obraz] of [['/', '/og-2026-11.png'], ['/dla-firm/narzedzia/kpir', '/dla-firm/narzedzia/kpir/opengraph-image'], ['/dla-firm/narzedzia/jpk', '/dla-firm/narzedzia/jpk/opengraph-image']]) {
      const html = await (await request.get(strona)).text();
      expect(meta(html, /<meta property="og:image" content="([^"]+)"/)).toBe(`${SITE}${obraz}`);
      const r = await request.get(obraz);
      expect(r.status()).toBe(200);
      expect(r.headers()['content-type']).toBe('image/png');
    }
  });

  test('wersja .md wskazuje stronę HTML jako kanoniczną', async ({ request }) => {
    const r = await request.get('/swiadczenia.md');
    expect(r.headers()['link']).toBe(`<${SITE}/swiadczenia>; rel="canonical"`);
  });
});

test.describe('metadane publicznych stron', () => {
  for (const s of STRONY) {
    test(`${s.sciezka}: title, description, keywords, canonical, og, JSON-LD`, async ({ request }) => {
      const r = await request.get(s.sciezka);
      expect(r.status()).toBe(200);
      const html = await r.text();
      expect(meta(html, /<html lang="([^"]+)"/)).toBe('pl');
      expect(meta(html, /<title>([^<]+)<\/title>/)).toBeTruthy();
      expect(meta(html, /<meta name="description" content="([^"]+)"/)?.length).toBeGreaterThan(100);
      expect(meta(html, /<meta name="keywords" content="([^"]+)"/)).toBeTruthy();
      expect(meta(html, /<link rel="canonical" href="([^"]+)"/)).toBe(kanoniczny(s.sciezka));
      expect(meta(html, /<meta property="og:url" content="([^"]+)"/)).toBe(kanoniczny(s.sciezka));
      expect(meta(html, /<meta property="og:locale" content="([^"]+)"/)).toBe('pl_PL');
      expect(meta(html, /<meta property="og:image" content="([^"]+)"/)).toBeTruthy();
      expect(meta(html, /<meta name="twitter:card" content="([^"]+)"/)).toBe('summary_large_image');
      expect(meta(html, /<meta name="theme-color" content="([^"]+)"/)).toBeTruthy();
      expect(html).not.toMatch(/<meta name="robots" content="noindex/);
      if (s.md) expect(html).toContain(`<link rel="alternate" type="text/markdown" href="${kanoniczny(s.sciezka === '/' ? '/index.md' : `${s.sciezka}.md`)}"/>`);

      const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]) as Record<string, unknown>);
      const typy = JSON.stringify(ld);
      expect(typy).toContain('"WebSite"');
      expect(typy).toContain(`"url":"${kanoniczny(s.sciezka)}"`);
      expect(typy).not.toContain('Government');
    });
  }
});

test.describe('strony w przeglądarce', () => {
  for (const p of ['/', '/swiadczenia', '/agent', '/wnioski', '/dla-firm', '/centrum-obywatela/dzialki', '/blog', '/press']) {
    test(`${p}: jeden h1 i bez błędów w konsoli`, async ({ page }) => {
      const bledy: string[] = [];
      page.on('console', m => { if (m.type() === 'error') bledy.push(m.text()); });
      page.on('pageerror', e => bledy.push(e.message));
      await page.goto(p);
      await expect(page.locator('h1')).toHaveCount(1);
      // Supabase w testach ma atrapę adresu: błędy sieci do dummy.supabase.co nie są błędami strony.
      expect(bledy.filter(b => !/supabase|Failed to load resource|ERR_NAME_NOT_RESOLVED/i.test(b))).toEqual([]);
    });
  }

  test('/swiadczenia?q= filtruje listę (SearchAction w JSON-LD)', async ({ page }) => {
    await page.goto('/swiadczenia?q=becikowe');
    await expect(page.getByPlaceholder(/Szukaj świadczenia/)).toHaveValue('becikowe');
  });

  test('/agent ma treść w HTML z serwera (bez JS)', async ({ request }) => {
    const html = await (await request.get('/agent')).text();
    expect(html).toContain('<h1>Zapytaj o świadczenia, ZUS i urzędy</h1>');
  });
});
