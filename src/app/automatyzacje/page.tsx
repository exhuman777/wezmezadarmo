import type { Metadata } from 'next';
import AutomatyzacjePage from './AutomatyzacjePage';

export const metadata: Metadata = {
  title: 'Automatyzacje AI dla firm i JDG | wezmezadarmo',
  description:
    'Gotowe automatyzacje AI dla polskich firm i JDG. Automat Fakturowy za 1200 PLN -- faktury wystawiane automatycznie z maili klientów. Bez abonamentu, wdrożenie 5 dni.',
  openGraph: {
    title: 'Automatyzacje AI dla polskiej firmy -- konkretne narzędzia',
    description:
      'Nie kursy, nie konsulting. Działające automatyzacje: faktury, oferty, raporty. Automat Fakturowy 1200 PLN, gwarancja zwrotu jeśli nie działa.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Page() {
  return <AutomatyzacjePage />;
}
