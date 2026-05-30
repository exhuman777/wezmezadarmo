import type { Metadata } from 'next';
import AutomatyzacjePage from './AutomatyzacjePage';

export const metadata: Metadata = {
  title: 'Automatyzacje AI dla europejskich firm | wezmezadarmo',
  description:
    'Informacyjnie: jakie automatyzacje AI są dziś możliwe i dostępne dla europejskich firm i JDG. wezmezadarmo.com to projekt pro bono dla obywateli; rozwiązania dla firm realizują niezależni europejscy partnerzy w ramach co-promocji.',
  openGraph: {
    title: 'Automatyzacje AI dla europejskich firm: co jest dziś możliwe',
    description:
      'Faktury spoza UE, oferty, raporty, maile, terminy. Takie automatyzacje są możliwe i dostępne dla europejskich firm. Strona informacyjna, w ramach co-promocji europejskich projektów.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Page() {
  return <AutomatyzacjePage />;
}
