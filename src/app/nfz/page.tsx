import type { Metadata } from 'next';
import NFZSearchClient from './NFZSearchClient';

export const metadata: Metadata = {
  title: 'Wyszukiwarka NFZ - kolejki i świadczeniodawcy | wezmezadarmo',
  description: 'Sprawdź czas oczekiwania do specjalisty NFZ, znajdź szpital lub przychodnię z kontraktem NFZ. Dane na żywo z api.nfz.gov.pl.',
  openGraph: {
    title: 'Wyszukiwarka NFZ - kolejki i świadczeniodawcy',
    description: 'Sprawdź czasy oczekiwania, znajdź lekarza/szpital. Dane z oficjalnego API NFZ.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function NFZPage() {
  return <NFZSearchClient />;
}
