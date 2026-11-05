import { MobileAgentWarning } from '@/components/MobileAgentWarning';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';

// Podstrony /agent/* (logowanie, panel) przekierowują na nowe adresy (next.config.ts), więc canonical /agent ich nie dotyczy.
export const metadata = metadaneStrony('/agent');

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)', color: 'var(--color-text-1)' }}>
      <StronaJsonLd sciezka="/agent" />
      <MobileAgentWarning />
      {children}
    </div>
  );
}
