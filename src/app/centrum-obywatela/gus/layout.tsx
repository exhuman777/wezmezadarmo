import type { Metadata } from 'next';
import { canonical, OG_IMAGES } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: canonical('/centrum-obywatela/gus'),
  title: 'Dane GUS dla Twojej gminy - demografia, bezrobocie, wynagrodzenie | wezmezadarmo',
  description: 'Liczba mieszkańców, stopa bezrobocia, średnie wynagrodzenie dla każdej polskiej gminy. Dane Banku Danych Lokalnych GUS na żywo.',
  openGraph: {
    images: OG_IMAGES,
    title: 'Dane GUS dla Twojej gminy',
    description: 'Demografia i ekonomia per gmina - z bdl.stat.gov.pl.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
