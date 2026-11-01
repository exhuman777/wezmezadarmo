import type { Metadata } from 'next';
import { MobileAgentWarning } from '@/components/MobileAgentWarning';

export const metadata: Metadata = {
  title: 'Asystent AI: świadczenia, ZUS i urzędy | wezmezadarmo',
  description: 'Asystent AI odpowiada na pytania o świadczenia, ZUS i urzędy z bazy świadczeń i danych urzędów. 3 pytania dziennie bez konta.',
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)', color: 'var(--color-text-1)' }}>
      <MobileAgentWarning />
      {children}
    </div>
  );
}
