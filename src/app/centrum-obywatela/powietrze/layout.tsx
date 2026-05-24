import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Jakość powietrza GIOŚ - sprawdź smog w swoim mieście | wezmezadarmo',
  description: 'Aktualny indeks jakości powietrza dla 18 miast wojewódzkich: PM10, PM2.5, NO2, O3, SO2. Dane z api.gios.gov.pl na żywo. Bez logowania.',
  openGraph: {
    title: 'Jakość powietrza GIOŚ - Polska indeks',
    description: 'Indeks jakości powietrza dla Twojego miasta. PM10, PM2.5, NO2, O3, SO2.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
