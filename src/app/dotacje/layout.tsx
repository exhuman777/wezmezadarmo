import type { Metadata } from 'next';
import { DotacjeNav } from '@/components/DotacjeNav';

export const metadata: Metadata = {
  title: 'Dotacje dla firm | Agent AI | wezmezadarmo',
  description: 'Agent AI monitorujący KFS, PUP, PFRON, KPO i programy samorządowe. Powiadamia gdy otworzy się nabór pasujący do Twojej firmy. 25 PLN / miesiąc.',
  openGraph: {
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
      <DotacjeNav />
      {children}
    </div>
  );
}
