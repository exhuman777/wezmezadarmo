/**
 * Wspólne stałe SEO. Canonical zawsze absolutny na www, niezależnie od
 * NEXT_PUBLIC_URL (preview i stare adresy nie mogą przejąć kanonicznego URL).
 * Canonical ustawiamy tylko na stronach (page) i layoutach-liściach, nigdy w
 * root layout: metadata jest dziedziczona i wszystkie podstrony wskazywałyby /.
 */
import type { Metadata } from 'next';

export const SITE_URL = 'https://www.wezmezadarmo.com';

export function canonical(path: string): NonNullable<Metadata['alternates']> {
  return { canonical: `${SITE_URL}${path === '/' ? '' : path}` };
}

/** Strony logowania, paneli i techniczne: poza indeksem Google. */
export const NOINDEX: NonNullable<Metadata['robots']> = { index: false, follow: false };

/**
 * Obraz OG z app/opengraph-image.tsx. Strona, która ustawia własne openGraph,
 * nadpisuje całe pole (płytkie scalanie) i traci obraz z pliku, więc musi go podać.
 */
export const OG_IMAGES: NonNullable<NonNullable<Metadata['openGraph']>['images']> = [
  { url: '/opengraph-image', width: 1200, height: 630, alt: 'wezmezadarmo: sprawdź, co Ci się należy' },
];
