import type { Metadata } from 'next';
import { canonical, OG_IMAGES } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: canonical('/centrum-obywatela/pogoda'),
  title: 'Ostrzeżenia meteo IMGW/RCB - powódź, burze, mróz | wezmezadarmo',
  description: 'Aktualne ostrzeżenia meteorologiczne i kryzysowe dla całej Polski. IMGW i Rządowe Centrum Bezpieczeństwa. Dane na żywo.',
  openGraph: {
    images: OG_IMAGES,
    title: 'Ostrzeżenia meteo i kryzysowe',
    description: 'Powódź, burze, mróz, smog - na żywo z IMGW i RCB.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
