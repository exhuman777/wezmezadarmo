/**
 * Wspólne stałe SEO. Canonical zawsze absolutny na www, niezależnie od
 * NEXT_PUBLIC_URL (preview i stare adresy nie mogą przejąć kanonicznego URL).
 * Canonical ustawiamy tylko na stronach (page) i layoutach-liściach, nigdy w
 * root layout: metadata jest dziedziczona i wszystkie podstrony wskazywałyby /.
 */
import type { Metadata } from 'next';

export const SITE_URL = 'https://www.wezmezadarmo.com';
export const SITE_NAME = 'wezmezadarmo';
/** Dopisek marki w <title>. Tytuł strony z dopiskiem ma mieć do ok. 60 znaków. */
export const DOPISEK_MARKI = ` | ${SITE_NAME}`;

/** Autor i wydawca: marka tuKamil (bez imienia, nazwiska i danych kontaktowych). */
export const AUTOR = { name: 'tuKamil', url: 'https://tukamil.com' } as const;

/**
 * Identyfikatory węzłów JSON-LD, żeby strony odwoływały się do jednego WebSite i jednej Organization.
 * organizacja = wezmezadarmo (własna marka serwisu); autor = tuKamil z tym samym @id co na tukamil.com
 * i w całej sieci (https://tukamil.com/#tukamil), żeby wyszukiwarka połączyła węzły w jeden podmiot.
 */
export const LD_ID = {
  website: `${SITE_URL}/#website`,
  organizacja: `${SITE_URL}/#organization`,
  autor: 'https://tukamil.com/#tukamil',
} as const;

/** Absolutny adres kanoniczny ścieżki (strona główna bez końcowego ukośnika). */
export function adres(path: string): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

/** Ścieżka wersji Markdown strony (dla modeli językowych i agentów). */
export function sciezkaMd(path: string): string {
  return path === '/' ? '/index.md' : `${path}.md`;
}

/**
 * Canonical i opcjonalnie link do wersji Markdown. Pole alternates scala się płytko,
 * więc strona z wersją .md musi podać oba naraz.
 */
export function canonical(path: string, md = false): NonNullable<Metadata['alternates']> {
  return md
    ? { canonical: adres(path), types: { 'text/markdown': adres(sciezkaMd(path)) } }
    : { canonical: adres(path) };
}

/** Strony logowania, paneli i techniczne: poza indeksem Google. */
export const NOINDEX: NonNullable<Metadata['robots']> = { index: false, follow: false };

/**
 * Obraz OG serwisu: statyczny plik public/og-2026-11.png (1200 x 630, znak marki i hasło strony głównej).
 * Nowa nazwa pliku przy każdej zmianie wyglądu, bo komunikatory (Telegram, Messenger, Slack) trzymają podgląd po adresie obrazu.
 * Ustawiony w layout.tsx; strona, która ustawia własne openGraph, nadpisuje całe pole (płytkie scalanie), więc musi go podać.
 * Plik opengraph-image.tsx w folderze strony (narzędzia dla firm) ma pierwszeństwo przed tym polem.
 */
export const OBRAZ_OG = '/og-2026-11.png';
export const OBRAZ_OG_ALT = 'wezmezadarmo: należy Ci się więcej, niż myślisz. Pikselowy prezent, znak serwisu.';
export const OG_IMAGES: NonNullable<NonNullable<Metadata['openGraph']>['images']> = [
  { url: OBRAZ_OG, width: 1200, height: 630, alt: OBRAZ_OG_ALT, type: 'image/png' },
];

/**
 * JSON-LD do wstawienia przez dangerouslySetInnerHTML. Znak < zamieniony na <,
 * żeby tekst z danych nie zamknął znacznika script (zalecenie z przewodnika Next.js).
 */
export function jsonLd(dane: object): string {
  return JSON.stringify(dane).replace(/</g, '\\u003c');
}
