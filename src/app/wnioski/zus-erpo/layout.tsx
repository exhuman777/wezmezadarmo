import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Wniosek o emeryturę ERPO: pomoc w wypełnieniu | wezmezadarmo',
  description: 'Przygotuj dane do wniosku o emeryturę ERPO krok po kroku. Lista dokumentów i podpowiedzi, dane zostają w Twojej przeglądarce.',
  alternates: canonical('/wnioski/zus-erpo'),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'wezmezadarmo', url: 'https://www.wezmezadarmo.com' },
          { name: 'Wnioski', url: 'https://www.wezmezadarmo.com/wnioski' },
          { name: 'Wniosek o emeryturę ERPO', url: 'https://www.wezmezadarmo.com/wnioski/zus-erpo' },
        ]}
      />
      {children}
    </>
  );
}
