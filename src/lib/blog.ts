/**
 * Wspólne funkcje bloga: podział treści na bloki (strona HTML), wersja Markdown wpisu
 * (/blog/<slug>.md, llms-full.txt) i tekst bez linków (FAQPage w JSON-LD).
 * Format treści opisuje BlogPost.content w src/data/blog-posts.ts.
 */
import type { BlogPost } from '@/data/blog-posts';
import { adres } from '@/lib/seo';

export type Blok =
  | { typ: 'h2' | 'h3' | 'p'; tekst: string }
  | { typ: 'ul'; punkty: string[] }
  | { typ: 'cta'; tekst: string; href: string };

const PUNKT = /^\s*(•|-)\s+/;
const SAM_LINK_WEWNETRZNY = /^\[([^\]]+)\]\((\/[^)\s]*)\)\s*$/;

/** Treść wpisu jako lista bloków: nagłówki, akapity, listy i przyciski. */
export function bloki(tresc: string): Blok[] {
  const wynik: Blok[] = [];
  let akapit: string[] = [];
  let punkty: string[] = [];
  const zamknij = () => {
    if (akapit.length) wynik.push({ typ: 'p', tekst: akapit.join(' ').trim() });
    if (punkty.length) wynik.push({ typ: 'ul', punkty });
    akapit = [];
    punkty = [];
  };
  for (const linia of tresc.split('\n')) {
    if (linia.startsWith('### ')) { zamknij(); wynik.push({ typ: 'h3', tekst: linia.slice(4).trim() }); continue; }
    if (linia.startsWith('## ')) { zamknij(); wynik.push({ typ: 'h2', tekst: linia.slice(3).trim() }); continue; }
    const cta = linia.trim().match(SAM_LINK_WEWNETRZNY);
    if (cta) { zamknij(); wynik.push({ typ: 'cta', tekst: cta[1], href: cta[2] }); continue; }
    if (PUNKT.test(linia)) {
      if (akapit.length) { wynik.push({ typ: 'p', tekst: akapit.join(' ').trim() }); akapit = []; }
      punkty.push(linia.replace(PUNKT, '').trim());
      continue;
    }
    if (linia.trim() === '') { zamknij(); continue; }
    if (punkty.length) { wynik.push({ typ: 'ul', punkty }); punkty = []; }
    akapit.push(linia.trim());
  }
  zamknij();
  return wynik;
}

/** Fragmenty tekstu z linkami [tekst](adres): do renderowania w akapitach, punktach i FAQ. */
export type Fragment = { tekst: string; href?: string };

export function fragmenty(tekst: string): Fragment[] {
  const wynik: Fragment[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let ostatni = 0;
  for (const m of tekst.matchAll(re)) {
    if (m.index > ostatni) wynik.push({ tekst: tekst.slice(ostatni, m.index) });
    wynik.push({ tekst: m[1], href: m[2] });
    ostatni = m.index + m[0].length;
  }
  if (ostatni < tekst.length) wynik.push({ tekst: tekst.slice(ostatni) });
  return wynik;
}

/** Tekst bez składni linków (JSON-LD, meta). */
export function bezLinkow(tekst: string): string {
  return tekst.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1');
}

/** Linki wewnętrzne (/adres) jako absolutne: plik .md czytają agenci poza stroną. */
function absolutneLinki(tekst: string): string {
  return tekst.replace(/\]\((\/[^)\s]*)\)/g, (_m, p: string) => `](${adres(p)})`);
}

export function sciezkaWpisu(slug: string): string {
  return `/blog/${slug}`;
}

/** Wersja Markdown wpisu: tytuł, opis, adres, treść i FAQ. */
export function wpisMd(p: BlogPost): string {
  const faq = p.faq?.length
    ? `\n\n## Najczęstsze pytania\n\n${p.faq.map(f => `### ${f.pytanie}\n\n${f.odpowiedz}`).join('\n\n')}`
    : '';
  return absolutneLinki(`# ${p.title}

> ${p.description}

Strona: ${adres(sciezkaWpisu(p.slug))}, opublikowano ${p.date}${p.zmiana && p.zmiana !== p.date ? `, zmieniono ${p.zmiana}` : ''}

${p.content.trim().replace(/^ • /gm, '- ')}${faq}`);
}
