import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ulgi PKP 2026 - tabela dla studenta, seniora, KDR | wezmezadarmo',
  description: 'Pełna tabela ulg PKP Intercity i Polregio: student (51%), senior 65+ (37%), Karta Dużej Rodziny (37%), niepełnosprawni, weterani. Aktualne stawki 2026.',
  alternates: { canonical: 'https://www.wezmezadarmo.com/centrum-obywatela/transport' },
  openGraph: {
    title: 'Ulgi PKP 2026 - Centrum Obywatela',
    description: 'Tabela ulg dla studenta, seniora, KDR, niepełnosprawnych.',
    url: 'https://www.wezmezadarmo.com/centrum-obywatela/transport',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
