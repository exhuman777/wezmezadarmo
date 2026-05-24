import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ostrzeżenia meteo IMGW/RCB - powódź, burze, mróz | wezmezadarmo',
  description: 'Aktualne ostrzeżenia meteorologiczne i kryzysowe dla całej Polski. IMGW i Rządowe Centrum Bezpieczeństwa. Dane na żywo.',
  openGraph: {
    title: 'Ostrzeżenia meteo i kryzysowe',
    description: 'Powódź, burze, mróz, smog - na żywo z IMGW i RCB.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
