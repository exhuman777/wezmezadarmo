import type { Metadata } from 'next';
import AutomatyzacjePage from './AutomatyzacjePage';

export const metadata: Metadata = {
  title: 'Automatyzacje AI dla firm | wezmezadarmo',
  description:
    'Gotowe automatyzacje AI dla polskich JDG i malych spolek. Kalkulator ZUS, 10 darmowych promptow, Automat Fakturowy za 1200 PLN. Konkretne narzedzia, nie consulting.',
  openGraph: {
    title: 'Automatyzacje AI dla polskiego przedsiebiorcy',
    description:
      'Kalkulator ZUS + 10 gotowych promptow AI za darmo. Automat Fakturowy: faktury same wpisuja sie do arkusza. 1200 PLN, bez abonamentu.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Page() {
  return <AutomatyzacjePage />;
}
