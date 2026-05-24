import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zmiany w prawie - Dziennik Ustaw, projekty Sejmu | wezmezadarmo',
  description: 'Aktualne zmiany w polskim prawie: Dziennik Ustaw, Monitor Polski, projekty ustaw z Sejmu. Filtrowanie po słowach kluczowych. Dane z api.sejm.gov.pl.',
  openGraph: {
    title: 'Zmiany w prawie - ELI / Sejm RP',
    description: 'Dziennik Ustaw, Monitor Polski, projekty ustaw - na żywo.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
