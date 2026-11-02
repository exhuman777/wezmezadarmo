/**
 * Sprawdza wszystkie zewnętrzne źródła danych wezmezadarmo.com:
 * czy odpowiadają, czy format zgadza się z parserem i jak świeże są dane.
 *
 * Uruchomienie: npx tsx scripts/sprawdz-zrodla.ts [--json]
 * Kod wyjścia 1, gdy któreś źródło oznaczone jako wymagane nie działa.
 */
import { FEEDS, parseGovPlList, type FeedMeta } from '../src/app/aktualnosci/rss';
import { GRANT_RSS_SOURCES } from '../src/data/grant-rss-sources';

type Rodzaj = 'rss' | 'json' | 'html';
interface Zrodlo {
  nazwa: string;
  url: string;
  rodzaj: Rodzaj;
  /** Zwraca datę najnowszych danych (ISO) albo null, gdy format się nie zgadza. */
  data?: (body: string) => string | null;
  /** Kod HTTP uznawany za poprawny (np. 401 dla API z kluczem sprawdzanego bez klucza). */
  oczekiwany?: number;
  /** Przez proxy (Cloudflare Worker) albo cache w Supabase: z tej maszyny może być blokowane. */
  przezProxy?: boolean;
  /** Nagłówek Accept (np. GIOŚ odrzuca application/json kodem 406). */
  accept?: string;
  uwaga?: string;
}

const UA = 'Mozilla/5.0 (compatible; wezmezadarmo-rss/1.0; +https://www.wezmezadarmo.com/llm.md)';
const dzis = new Date().toISOString().slice(0, 10);

function najnowszaZRss(xml: string): string | null {
  if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(xml)) return null;
  const daty = [...xml.matchAll(/<(pubDate|updated|published|dc:date)[^>]*>(?:<!\[CDATA\[)?([^<\]]+)(?:\]\]>)?<\//gi)]
    .map(m => new Date(m[2].trim()))
    .filter(d => !isNaN(d.getTime()));
  const liczbaWpisow = (xml.match(/<(item|entry)[\s>]/gi) ?? []).length;
  if (liczbaWpisow === 0) return null;
  if (daty.length === 0) return 'brak dat';
  return new Date(Math.max(...daty.map(d => d.getTime()))).toISOString().slice(0, 10);
}

const json = (f: (d: unknown) => string | null | undefined) => (body: string) => {
  try { return f(JSON.parse(body)) ?? null; } catch { return null; }
};
type Obj = Record<string, unknown>;
const pole = (o: unknown, ...k: string[]): unknown => k.reduce<unknown>((a, kk) => (a && typeof a === 'object' ? (a as Obj)[kk] : undefined), o);

const API: Zrodlo[] = [
  { nazwa: 'NBP kursy (tabela A)', url: 'https://api.nbp.pl/api/exchangerates/tables/A?format=json', rodzaj: 'json',
    data: json(d => (Array.isArray(d) ? String(pole(d[0], 'effectiveDate')) : null)) },
  { nazwa: 'Biała lista VAT (MF)', url: `https://wl-api.mf.gov.pl/api/search/nip/5261040828?date=${dzis}`, rodzaj: 'json',
    data: json(d => (pole(d, 'result', 'subject', 'name') ? String(pole(d, 'result', 'requestDateTime') ?? dzis).slice(0, 10) : null)) },
  { nazwa: 'ELI Sejm (Dziennik Ustaw, bieżący rok)', url: `https://api.sejm.gov.pl/eli/acts/DU/${new Date().getFullYear()}?limit=500&offset=0`, rodzaj: 'json',
    data: json(d => {
      const items = (pole(d, 'items') ?? d) as Array<Obj>;
      if (!Array.isArray(items) || !items.length) return null;
      return items.map(i => String(i.announcementDate ?? i.promulgation ?? '')).filter(Boolean).sort().pop() ?? null;
    }) },
  { nazwa: 'IMGW ostrzeżenia meteo', url: 'https://danepubliczne.imgw.pl/api/data/warningsmeteo', rodzaj: 'json',
    data: json(d => (Array.isArray(d) ? (d.length ? String(pole(d[0], 'opublikowano') ?? 'są ostrzeżenia').slice(0, 10) : 'brak ostrzeżeń') : 'brak ostrzeżeń')) },
  { nazwa: 'IMGW ostrzeżenia hydro', url: 'https://danepubliczne.imgw.pl/api/data/warningshydro', rodzaj: 'json',
    data: json(d => (Array.isArray(d) ? (d.length ? String(pole(d[0], 'opublikowano') ?? 'są ostrzeżenia').slice(0, 10) : 'brak ostrzeżeń') : 'brak ostrzeżeń')) },
  { nazwa: 'GIOŚ stacje', url: 'https://api.gios.gov.pl/pjp-api/v1/rest/station/findAll?page=0&size=5', rodzaj: 'json', accept: 'application/ld+json',
    data: json(d => (JSON.stringify(d).includes('Identyfikator stacji') ? dzis : null)) },
  { nazwa: 'GIOŚ indeks (Lublin, stacja 266)', url: 'https://api.gios.gov.pl/pjp-api/v1/rest/aqindex/getIndex/266', rodzaj: 'json', accept: 'application/ld+json',
    data: json(d => { const m = JSON.stringify(d).match(/"Data wykonania obliczeń indeksu[^"]*":"([^"]+)"/); return m ? m[1].slice(0, 10) : null; }) },
  { nazwa: 'BDL GUS jednostki', url: 'https://bdl.stat.gov.pl/api/v1/units/search?name=Lublin&level=5&format=json&page-size=1', rodzaj: 'json',
    data: json(d => (Array.isArray(pole(d, 'results')) && (pole(d, 'results') as unknown[]).length ? dzis : null)) },
  { nazwa: 'BDL GUS dane (gmina Lublin: ludność)', url: 'https://bdl.stat.gov.pl/api/v1/data/by-unit/060611163011?var-id=72305&var-id=149&var-id=155&format=json', rodzaj: 'json',
    data: json(d => { const v = pole(d, 'results') as Array<{ values: Array<{ year: string }> }> | undefined; return v?.[0]?.values?.at(-1)?.year ?? null; }) },
  { nazwa: 'NFZ kolejki (ortopeda, lubelskie)', url: 'https://api.nfz.gov.pl/app-itl-api/queues?format=json&case=1&province=03&benefit=ortop&limit=1&api-version=1.3', rodzaj: 'json',
    data: json(d => { const q = (pole(d, 'data') as Array<Obj> | undefined)?.[0]; return q ? String(pole(q, 'attributes', 'dates', 'date-situation-as-at') ?? '').slice(0, 10) || 'jest' : null; }) },
  { nazwa: 'NFZ świadczenia (słownik)', url: 'https://api.nfz.gov.pl/app-itl-api/benefits?format=json&name=ortop&api-version=1.3', rodzaj: 'json',
    data: json(d => (Array.isArray(pole(d, 'data')) ? dzis : null)) },
  { nazwa: 'BDL GUS dane (powiat Lublin: bezrobocie, płace)', url: 'https://bdl.stat.gov.pl/api/v1/data/by-unit/060611163000?var-id=60270&var-id=64428&format=json', rodzaj: 'json',
    data: json(d => { const v = pole(d, 'results') as Array<{ values: Array<{ year: string }> }> | undefined; return v?.[0]?.values?.at(-1)?.year ?? null; }) },
  { nazwa: 'NFZ umowy, świadczeniodawcy', url: 'https://api.nfz.gov.pl/app-umw-api/providers?format=json&api-version=1.2&page=1&limit=1&name=szpital', rodzaj: 'json',
    data: json(d => (Array.isArray(pole(d, 'data')) ? dzis : null)) },
  { nazwa: 'GUS SDG (wskaźnik 11-5-a, raw)', url: 'https://raw.githubusercontent.com/statisticspoland/sdg-indicators-pl/master/api/v1/krajowe/11/11-5-a.json', rodzaj: 'json',
    data: json(d => { const s = JSON.stringify(d); const lata = [...s.matchAll(/"(20\d\d)":/g)].map(m => m[1]).sort(); return lata.at(-1) ?? null; }) },
  { nazwa: 'CEIDG v3 (wymaga tokenu)', url: 'https://dane.biznes.gov.pl/api/ceidg/v3/firmy?nip=5261040828', rodzaj: 'json', oczekiwany: 401,
    uwaga: 'bez tokenu oczekiwane 401; token w env CEIDG_API_TOKEN' },
];

function zFeedu(prefiks: string, f: FeedMeta): Zrodlo {
  if (f.format === 'govpl') {
    return { nazwa: `${prefiks}: ${f.name}`, url: f.url, rodzaj: 'html', data: (html: string) => {
      const items = parseGovPlList(html, f);
      return items.length ? (items[0].pubDate ?? '').slice(0, 10) : null;
    } };
  }
  if (f.requiresProxy) {
    // Strony HTML (albo RSS blokowany na Vercelu) pobiera GitHub Action do Supabase rss_cache.
    // Tu sprawdzamy tylko, czy strona odpowiada; świeżość cache pokazuje /api/health.
    return { nazwa: `${prefiks}: ${f.name}`, url: f.url, rodzaj: 'html', przezProxy: true,
      data: (body: string) => (body.length > 2000 ? 'strona działa' : null) };
  }
  return { nazwa: `${prefiks}: ${f.name}`, url: f.url, rodzaj: 'rss', data: najnowszaZRss };
}

const RSS: Zrodlo[] = [
  ...FEEDS.map(f => zFeedu('Aktualności', f)),
  ...GRANT_RSS_SOURCES.map(f => zFeedu('Dotacje', f)),
];

async function sprawdz(z: Zrodlo) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  const start = Date.now();
  try {
    const res = await fetch(z.url, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': UA, Accept: z.accept ?? (z.rodzaj === 'json' ? 'application/json' : z.rodzaj === 'html' ? 'text/html' : 'application/rss+xml, application/atom+xml, text/xml, */*') } });
    const body = await res.text();
    const okKod = z.oczekiwany ? res.status === z.oczekiwany : res.ok;
    const najnowsze = res.ok && z.data ? z.data(body) : null;
    const ok = okKod && (z.oczekiwany ? true : najnowsze !== null);
    return { ...z, status: res.status, ok, najnowsze, ms: Date.now() - start, blad: ok ? '' : (okKod ? 'format nie pasuje do parsera' : `HTTP ${res.status}`) };
  } catch (e) {
    return { ...z, status: 0, ok: false, najnowsze: null, ms: Date.now() - start, blad: (e as Error).name === 'AbortError' ? 'timeout 15 s' : (e as Error).message };
  } finally {
    clearTimeout(t);
  }
}

(async () => {
  const wyniki = await Promise.all([...API, ...RSS].map(sprawdz));
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(wyniki.map(({ data: _parser, ...r }) => r), null, 2));
  } else {
    for (const r of wyniki) {
      console.log(`${r.ok ? 'OK  ' : 'BŁĄD'} ${r.nazwa.padEnd(42)} ${String(r.status).padEnd(4)} ${String(r.najnowsze ?? '').padEnd(16)} ${r.blad}${r.przezProxy ? ' (na produkcji przez proxy/cache)' : ''}`);
    }
    const zle = wyniki.filter(r => !r.ok);
    console.log(`\nŹródła: ${wyniki.length}, działa: ${wyniki.length - zle.length}, nie działa: ${zle.length}`);
  }
  process.exit(wyniki.some(r => !r.ok && !r.przezProxy) ? 1 : 0);
})();
