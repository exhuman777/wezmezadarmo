import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Zasiłek chorobowy ZAS-53: wypełnij online | wezmezadarmo',
  description: 'Wniosek ZAS-53 o zasiłek chorobowy składany bezpośrednio do ZUS. Wypełnij krok po kroku z eksportem PDF.',
  alternates: canonical('/wnioski/zus-zas53'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'wezmezadarmo', url: 'https://www.wezmezadarmo.com' },
          { name: 'Wnioski', url: 'https://www.wezmezadarmo.com/wnioski' },
          { name: 'Zasiłek chorobowy ZAS-53', url: 'https://www.wezmezadarmo.com/wnioski/zus-zas53' },
        ]}
      />
      {children}
    </>
  );
}
