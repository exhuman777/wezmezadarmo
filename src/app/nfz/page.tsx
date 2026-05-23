import type { Metadata } from 'next';
import NFZSearchClient from './NFZSearchClient';

export const metadata: Metadata = {
  title: 'Wyszukiwarka NFZ - kolejki, lekarze, refundacja leków | wezmezadarmo',
  description: 'Sprawdź czas oczekiwania do specjalisty NFZ, znajdź najbliższego lekarza, sprawdź refundację leków. Darmowe, dane na żywo z api.nfz.gov.pl.',
  openGraph: {
    title: 'Wyszukiwarka NFZ - kolejki, lekarze, refundacja leków',
    description: 'Sprawdź czasy oczekiwania, znajdź lekarza, sprawdź refundację leków. Dane z oficjalnego API NFZ.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function NFZPage() {
  return <NFZSearchClient />;
}
