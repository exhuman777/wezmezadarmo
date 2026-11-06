import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isValidElement, type ReactElement } from 'react';
import sitemap from '@/app/sitemap';
import { SerwisJsonLd, StronaJsonLd } from '@/components/JsonLd';
import { INNE_APLIKACJE, NARZEDZIA_NA_SUBDOMENACH, SCIEZKI_MD, llmsFullTxt, llmsTxt, markdownStrony } from '@/lib/llms';
import { NARZEDZIA } from '@/lib/narzedzia/lista';
import { POSTS } from '@/data/blog-posts';
import { DOPISEK_MARKI, SITE_URL, adres, jsonLd, sciezkaMd } from '@/lib/seo';
import { STRONY, metadaneStrony, okruszki } from '@/lib/strony';

const ROOT = path.resolve(__dirname, '../../..');
const APP = path.join(ROOT, 'src/app');

// Zasady repo i briefu SEO: bez długich myślników, bez „--”, bez emoji, bez sloganu „to jest”, bez starych adresów.
const ZAKAZANE: [string, RegExp][] = [
  ['długi myślnik', /—/],
  ['podwójny myślnik', /(^|[^-])--([^-]|$)/m],
  ['emoji', /\p{Extended_Pictographic}/u],
  ['stary adres *.vercel.app', /vercel\.app/],
  ['„to jest”', /\bto jest\b/i],
];

function sprawdzTekst(nazwa: string, tekst: string, zTrescia = false) {
  // Adresy urzędów bywają z „--” w ścieżce (gov.pl), więc reguły tekstowe sprawdzamy bez URL-i; stare domeny z nimi.
  const bezUrl = tekst.replace(/https?:\/\/\S+/g, '');
  // llms-full.txt niesie też istniejącą treść bazy i bloga: tam sprawdzamy tylko znaki, nie styl zdań.
  for (const [opis, re] of ZAKAZANE.filter(([o]) => !(zTrescia && o.includes('to jest')))) expect(re.test(opis.startsWith('stary') ? tekst : bezUrl), `${nazwa}: ${opis}`).toBe(false);
}

function daneJsonLd(el: ReactElement): unknown {
  // StronaJsonLd i SerwisJsonLd zwracają <Skrypt dane={...} />: sprawdzamy dokładnie to, co trafi do <script>.
  const props = el.props as { dane: object };
  return JSON.parse(jsonLd(props.dane));
}

describe('rejestr stron (src/lib/strony.ts)', () => {
  it('ścieżki są unikalne, tytuły i opisy też', () => {
    const p = STRONY.map(s => s.sciezka);
    expect(new Set(p).size).toBe(p.length);
    expect(new Set(STRONY.map(s => s.tytul)).size).toBe(p.length);
    expect(new Set(STRONY.map(s => s.opis)).size).toBe(p.length);
  });

  it.each(STRONY.map(s => [s.sciezka, s] as const))('%s: title do 60 znaków, description 120-155, 8-15 słów kluczowych', (_p, s) => {
    expect((s.tytul + DOPISEK_MARKI).length).toBeLessThanOrEqual(60);
    expect(s.opis.length).toBeGreaterThanOrEqual(120);
    expect(s.opis.length).toBeLessThanOrEqual(155);
    expect(s.slowa.length).toBeGreaterThanOrEqual(8);
    expect(s.slowa.length).toBeLessThanOrEqual(15);
    sprawdzTekst(s.sciezka, [s.tytul, s.opis, ...s.slowa].join('\n'));
  });

  it('metadaneStrony: canonical i og:url na adresie kanonicznym, link do .md tylko gdy jest', () => {
    for (const s of STRONY) {
      const m = metadaneStrony(s.sciezka);
      expect(m.alternates?.canonical).toBe(adres(s.sciezka));
      expect(m.openGraph && 'url' in m.openGraph ? m.openGraph.url : undefined).toBe(adres(s.sciezka));
      expect(adres(s.sciezka).startsWith(SITE_URL)).toBe(true);
      const typy = m.alternates?.types as Record<string, string> | undefined;
      expect(typy?.['text/markdown']).toBe(s.md ? adres(sciezkaMd(s.sciezka)) : undefined);
    }
  });

  it('każda strona z rejestru bierze metadane z rejestru (page albo layout)', () => {
    const narzedzia = new Set(NARZEDZIA.map(n => n.adres));
    for (const s of STRONY) {
      if (narzedzia.has(s.sciezka)) continue; // metadaneNarzedzia(slug) -> metadaneStrony(n.adres)
      const folder = path.join(APP, s.sciezka);
      const pliki = ['page.tsx', 'layout.tsx'].map(f => path.join(folder, f)).filter(f => fs.existsSync(f));
      const tresc = pliki.map(f => fs.readFileSync(f, 'utf8')).join('\n');
      expect(tresc, s.sciezka).toContain(`metadaneStrony('${s.sciezka}')`);
      expect(tresc, s.sciezka).toContain(`<StronaJsonLd sciezka="${s.sciezka}" />`);
    }
  });

  it('wpisy bloga mają <title> do 60 znaków (tytulSeo, gdy tytuł jest dłuższy)', () => {
    for (const p of POSTS) expect((p.tytulSeo ?? p.title).length, p.slug).toBeLessThanOrEqual(60);
  });

  it('narzędzia dla firm są w rejestrze', () => {
    for (const n of NARZEDZIA) expect(STRONY.some(s => s.sciezka === n.adres), n.adres).toBe(true);
  });

  it('okruszki prowadzą od strony głównej', () => {
    for (const s of STRONY) expect(okruszki(s.sciezka)[0].sciezka).toBe('/');
  });
});

describe('JSON-LD', () => {
  it('serwis: WebSite z SearchAction, Organization, wydawca tuKamil, bez GovernmentService', () => {
    const el = SerwisJsonLd();
    expect(isValidElement(el)).toBe(true);
    const tekst = JSON.stringify(daneJsonLd(el));
    expect(tekst).toContain('"WebSite"');
    expect(tekst).toContain('"SearchAction"');
    expect(tekst).toContain('https://tukamil.com');
    expect(tekst).not.toMatch(/Government/);
  });

  it.each(STRONY.map(s => [s.sciezka] as const))('%s: WebPage parsuje się i ma adres kanoniczny', (p) => {
    const dane = daneJsonLd(StronaJsonLd({ sciezka: p })) as { '@graph': { '@type': string; url?: string }[] };
    const strona = dane['@graph'][0];
    expect(strona.url).toBe(adres(p));
    expect(JSON.stringify(dane)).not.toMatch(/Government/);
  });
});

describe('sitemap.xml', () => {
  const mapa = sitemap();
  it('ma wszystkie strony z rejestru, tylko adresy kanoniczne', () => {
    const adresy = mapa.map(w => w.url);
    for (const s of STRONY) expect(adresy).toContain(adres(s.sciezka));
    for (const u of adresy) expect(u.startsWith(SITE_URL)).toBe(true);
  });
  it('bez paneli, API, admina i narzędzi po ciasteczku', () => {
    for (const w of mapa) expect(w.url.replace(SITE_URL, '')).not.toMatch(/^\/(panel|api|admin|narzedzia)(\/|$)|\/panel(\/|$)|logowanie|rejestracja/);
  });
});

describe('robots.txt', () => {
  const robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
  it('wpuszcza boty AI i wskazuje sitemapę na adresie kanonicznym', () => {
    for (const bot of ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Bingbot']) {
      expect(robots).toContain(`User-agent: ${bot}\n`);
    }
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
  it('każda grupa blokuje panele, admina, API i narzędzia po ciasteczku', () => {
    const grupy = robots.split(/\n(?=User-agent:)/).filter(g => g.startsWith('User-agent:'));
    expect(grupy.length).toBe(14);
    for (const g of grupy) {
      for (const d of ['/api', '/admin', '/panel', '/dotacje/panel', '/agent/panel', '/narzedzia']) expect(g).toContain(`Disallow: ${d}\n`);
      expect(g).toContain('Allow: /api/public/\n');
    }
  });
});

describe('llms.txt, llms-full.txt i pliki .md', () => {
  const llms = llmsTxt();

  it('llms.txt w formacie llmstxt.org: tytuł, opis w >, sekcje z linkami, Optional', () => {
    expect(llms.startsWith('# wezmezadarmo\n\n> ')).toBe(true);
    expect(llms).toMatch(/\n## Optional\n/);
    expect(llms).toContain(`${SITE_URL}/llm.md`);
    expect(llms).toContain(`${SITE_URL}/agents.md`);
    expect(llms).toContain(`${SITE_URL}/llms-full.txt`);
    sprawdzTekst('llms.txt', llms);
  });

  it('llms.txt ma sekcję Narzędzia na subdomenach z czterema adresami', () => {
    const sekcja = llms.split('## Narzędzia na subdomenach\n')[1].split('\n## ')[0];
    for (const u of ['https://dwiestrony.wezmezadarmo.com', 'https://nalezysie.wezmezadarmo.com', 'https://jpk.wezmezadarmo.com', 'https://gry.wezmezadarmo.com']) {
      expect(sekcja).toContain(`(${u})`);
    }
    expect(NARZEDZIA_NA_SUBDOMENACH).toHaveLength(4);
    for (const a of INNE_APLIKACJE) expect(a.url).toMatch(/^https:\/\/[a-z0-9.-]+\/([a-z0-9-]+\/)?$/);
  });

  it('każda strona z md: true ma treść i route handler', () => {
    const zMd = STRONY.filter(s => s.md).map(s => s.sciezka).sort();
    expect([...SCIEZKI_MD].sort()).toEqual(zMd);
    for (const p of zMd) {
      const route = p === '/' ? path.join(APP, 'index.md/route.ts') : path.join(APP, `${p}.md/route.ts`);
      expect(fs.existsSync(route), route).toBe(true);
      const md = markdownStrony(p);
      expect(md, p).not.toBeNull();
      expect(md!.startsWith('# ')).toBe(true);
      expect(md).toContain(`Strona: ${adres(p)}`);
      expect(md).toContain('## Inne aplikacje tuKamil');
      sprawdzTekst(`${p}.md`, md!);
    }
  });

  it('llms-full.txt ma wszystkie strony .md, bazę świadczeń i wpisy bloga', () => {
    const full = llmsFullTxt();
    for (const p of SCIEZKI_MD) expect(full).toContain(`Strona: ${adres(p)}`);
    expect(full).toContain('### Program Moje Zdrowie');
    expect(full.length).toBeGreaterThan(50_000);
    sprawdzTekst('llms-full.txt', full, true);
  });
});
