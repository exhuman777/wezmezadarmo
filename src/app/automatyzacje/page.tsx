import type { Metadata } from 'next';
import AutomatyzacjePage from './AutomatyzacjePage';

export const metadata: Metadata = {
  title: 'Automatyzacje AI dla firm i JDG | wezmezadarmo',
  description:
    'Gotowe automatyzacje AI dla polskich firm i JDG. Automatyzacja mailowa 399 PLN: faktury zagraniczne wpisywane automatycznie do arkusza. Jeśli nie działa, nie płacisz.',
  openGraph: {
    title: 'Automatyzacje AI dla polskiej firmy: konkretne narzędzia',
    description:
      'Nie kursy, nie konsulting. Działające automatyzacje: faktury, oferty, raporty. Automatyzacja mailowa 399 PLN, automatyzacja na zamówienie od 599 PLN. Jeśli nie działa, nie płacisz.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Page() {
  return <AutomatyzacjePage />;
}
