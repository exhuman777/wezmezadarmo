import type { Metadata } from 'next';
import { canonical, OG_IMAGES } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: canonical('/centrum-obywatela/biala-lista'),
  title: 'Biała Lista VAT - sprawdź NIP kontrahenta | wezmezadarmo',
  description: 'Sprawdź status VAT firmy w Białej Liście Ministerstwa Finansów. Status, rachunki bankowe, daty rejestracji. Wymagane prawnie przed płatnościami B2B >15k PLN.',
  openGraph: {
    images: OG_IMAGES,
    title: 'Biała Lista VAT - sprawdź kontrahenta',
    description: 'Status VAT, rachunki bankowe, REGON, KRS - na żywo z wl-api.mf.gov.pl.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
