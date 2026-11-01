import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Mama 4+ / Tata 4+: oświadczenie ERU | wezmezadarmo',
  description: 'Rodzicielskie świadczenie uzupełniające Mama 4+ i Tata 4+. Przygotuj oświadczenie ERU krok po kroku.',
  alternates: canonical('/wnioski/zus-ersu'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'wezmezadarmo', url: 'https://www.wezmezadarmo.com' },
          { name: 'Wnioski', url: 'https://www.wezmezadarmo.com/wnioski' },
          { name: 'Mama 4+ / Tata 4+', url: 'https://www.wezmezadarmo.com/wnioski/zus-ersu' },
        ]}
      />
      {children}
    </>
  );
}
