import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Pełnomocnictwo ZUS PEL: wypełnij online | wezmezadarmo',
  description: 'Upoważnij wybraną osobę do załatwiania spraw w ZUS w Twoim imieniu. Formularz PEL krok po kroku z eksportem PDF.',
  alternates: canonical('/wnioski/zus-pel'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'wezmezadarmo', url: 'https://www.wezmezadarmo.com' },
          { name: 'Wnioski', url: 'https://www.wezmezadarmo.com/wnioski' },
          { name: 'Pełnomocnictwo ZUS PEL', url: 'https://www.wezmezadarmo.com/wnioski/zus-pel' },
        ]}
      />
      {children}
    </>
  );
}
