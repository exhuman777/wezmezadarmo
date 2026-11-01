import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Baza świadczeń 2026: zasiłki, ulgi i dopłaty, które Ci się należą | wezmezadarmo',
  description: 'Jakie świadczenia mi się należą? Przeglądaj zasiłki ZUS, świadczenia rodzinne, ulgi podatkowe, NFZ i PFRON. Każde świadczenie ze źródłem i warunkami. Bezpłatnie.',
  alternates: canonical('/swiadczenia'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'wezmezadarmo', url: 'https://www.wezmezadarmo.com' },
          { name: 'Świadczenia', url: 'https://www.wezmezadarmo.com/swiadczenia' },
        ]}
      />
      {children}
    </>
  );
}
