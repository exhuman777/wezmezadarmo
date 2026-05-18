import type { Metadata } from 'next';
import AutomatyzacjePage from './AutomatyzacjePage';

export const metadata: Metadata = {
  title: 'Automatyzacje AI dla firm i JDG | wezmezadarmo',
  description:
    'Gotowe automatyzacje AI dla polskich firm i JDG. Automat Fakturowy za 100 zł: faktury zagraniczne wpisywane automatycznie do arkusza. Bez abonamentu, wdrożenie 1 dzień roboczy.',
  openGraph: {
    title: 'Automatyzacje AI dla polskiej firmy: konkretne narzędzia',
    description:
      'Nie kursy, nie konsulting. Działające automatyzacje: faktury, oferty, raporty. Automat Fakturowy 100 zł, gwarancja zwrotu jeśli nie działa.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Page() {
  return <AutomatyzacjePage />;
}
