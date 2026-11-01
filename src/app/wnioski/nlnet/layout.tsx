import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Wniosek NLnet NGI Zero Commons Fund: opisz projekt z pomocą AI | wezmezadarmo',
  description: 'Przygotuj wniosek do NLnet NGI Zero Commons Fund. Wypełnij pola, a AI pomoże zredagować sekcje formularza.',
  alternates: canonical('/wnioski/nlnet'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
