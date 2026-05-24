import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kursy walut NBP - aktualne kursy EUR, USD, CHF, GBP | wezmezadarmo',
  description: 'Aktualne kursy walut Narodowego Banku Polskiego (tabela A). Konwerter walut na PLN, aktualizacja codziennie w dni robocze. Dane z api.nbp.pl.',
  openGraph: {
    title: 'Kursy walut NBP - tabela A',
    description: '40+ walut, konwerter PLN, dane na żywo z api.nbp.pl.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
