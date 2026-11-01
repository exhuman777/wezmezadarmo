import type { Metadata } from 'next';
import { canonical, OG_IMAGES } from '@/lib/seo';
import AutomatyzacjePage from './AutomatyzacjePage';

export const metadata: Metadata = {
  alternates: canonical('/automatyzacje'),
  title: 'Automatyzacje w małej firmie: co da się zrobić | wezmezadarmo',
  description:
    'Faktury spoza KSeF, oferty, raporty, maile i terminy ZUS. Pięć przykładów automatyzacji w małej firmie, każda sprawdzana przez człowieka.',
  openGraph: {
    images: OG_IMAGES,
    title: 'Co w firmie da się dziś zautomatyzować',
    description:
      'Pięć przykładów automatyzacji w małej firmie.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function Page() {
  return <AutomatyzacjePage />;
}
