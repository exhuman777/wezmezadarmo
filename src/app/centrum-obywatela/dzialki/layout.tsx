import type { Metadata } from 'next';
import { OG_IMAGES } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Geoportal ARiMR - mapy działek rolnych | wezmezadarmo',
  description: 'Linki + instrukcja jak sprawdzić działkę rolną w Geoportalu ARiMR. Dopłaty bezpośrednie, ewidencja gruntów, kontrola działek satelitarna.',
  alternates: { canonical: 'https://www.wezmezadarmo.com/centrum-obywatela/dzialki' },
  openGraph: {
    images: OG_IMAGES,
    title: 'Geoportal ARiMR - Centrum Obywatela',
    description: 'Mapy działek rolnych, dopłaty bezpośrednie, ewidencja gruntów.',
    url: 'https://www.wezmezadarmo.com/centrum-obywatela/dzialki',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
