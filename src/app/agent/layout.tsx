import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Twój agent AI | wezmezadarmo',
  description: 'Agent AI pilnuje Twoich świadczeń, ulg i zmian w prawie. Codziennie na e-mail.',
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)', color: 'var(--color-text-1)' }}>
      {children}
    </div>
  );
}
