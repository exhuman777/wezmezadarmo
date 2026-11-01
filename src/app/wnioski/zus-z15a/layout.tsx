import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Zasiłek opiekuńczy na dziecko Z-15A: wypełnij online | wezmezadarmo',
  description: 'Wniosek Z-15A o zasiłek opiekuńczy: choroba dziecka, kwarantanna lub zamknięcie placówki. Wypełnij krok po kroku z eksportem PDF.',
  alternates: canonical('/wnioski/zus-z15a'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'wezmezadarmo', url: 'https://www.wezmezadarmo.com' },
          { name: 'Wnioski', url: 'https://www.wezmezadarmo.com/wnioski' },
          { name: 'Zasiłek opiekuńczy na dziecko Z-15A', url: 'https://www.wezmezadarmo.com/wnioski/zus-z15a' },
        ]}
      />
      {children}
    </>
  );
}
