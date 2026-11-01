import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Zasiłek opiekuńczy na członka rodziny Z-15B: wypełnij online | wezmezadarmo',
  description: 'Wniosek Z-15B o zasiłek opiekuńczy na chorego członka rodziny powyżej 14 lat. Wypełnij krok po kroku z eksportem PDF.',
  alternates: canonical('/wnioski/zus-z15b'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'wezmezadarmo', url: 'https://www.wezmezadarmo.com' },
          { name: 'Wnioski', url: 'https://www.wezmezadarmo.com/wnioski' },
          { name: 'Zasiłek opiekuńczy na członka rodziny Z-15B', url: 'https://www.wezmezadarmo.com/wnioski/zus-z15b' },
        ]}
      />
      {children}
    </>
  );
}
