import type { Metadata } from 'next';
import { canonical, OG_IMAGES } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: canonical('/centrum-obywatela/pogoda'),
  title: 'Ostrzeżenia IMGW: burze, powodzie, mróz | wezmezadarmo',
  description: 'Aktualne ostrzeżenia meteorologiczne i hydrologiczne IMGW dla całej Polski. Dane na żywo z danepubliczne.imgw.pl.',
  openGraph: {
    images: OG_IMAGES,
    title: 'Ostrzeżenia meteorologiczne i hydrologiczne',
    description: 'Burze, powodzie, mróz - na żywo z IMGW.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
