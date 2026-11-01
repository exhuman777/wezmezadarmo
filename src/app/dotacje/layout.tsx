import type { Metadata } from 'next';
import { OG_IMAGES } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Dotacje dla firm | Agent AI | wezmezadarmo',
  description: 'Dotacje dla firm 2026: agent AI monitoruje KFS, PUP, PFRON, KPO i programy samorządowe. Powiadamia, gdy otworzy się nabór pasujący do Twojej firmy. Bezpłatnie.',
  openGraph: {
    images: OG_IMAGES,
    title: 'Dotacje dla firm | Agent AI | wezmezadarmo',
    description: 'Monitoring dotacji dla MŚP. KFS, PUP, PFRON, KPO, samorządy. Agent AI znający profil Twojej firmy.',
    siteName: 'wezmezadarmo',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function DotacjeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)', color: 'var(--color-text-1)' }}>
      {children}
    </div>
  );
}
