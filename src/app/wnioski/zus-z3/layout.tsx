import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Zaświadczenie Z-3: jak je uzyskać od pracodawcy | wezmezadarmo',
  description: 'Przewodnik dla pracownika: czym jest zaświadczenie płatnika Z-3, jak je sprawdzić i uzyskać od pracodawcy.',
  alternates: canonical('/wnioski/zus-z3'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'wezmezadarmo', url: 'https://www.wezmezadarmo.com' },
          { name: 'Wnioski', url: 'https://www.wezmezadarmo.com/wnioski' },
          { name: 'Zaświadczenie Z-3', url: 'https://www.wezmezadarmo.com/wnioski/zus-z3' },
        ]}
      />
      {children}
    </>
  );
}
