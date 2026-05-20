import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Twój agent AI -- świadczenia i aktualności | wezmezadarmo',
  description: 'Agent AI pilnuje co Ci przysługuje i informuje o zmianach w prawie. Dla JDG i osób prywatnych. Dzienny raport na e-mail.',
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)', color: 'var(--color-text-1)' }}>
      {children}
    </div>
  );
}
