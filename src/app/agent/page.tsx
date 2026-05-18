import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Twój agent AI -- świadczenia i aktualności | wezmezadarmo',
  description: 'Agent AI pilnuje co Ci przysługuje i informuje o zmianach w prawie. Dla JDG i osób prywatnych. Dzienny raport na e-mail.',
};

const CECHY = [
  { label: 'Świadczenia i ulgi', desc: 'Agent dopasowuje 117 świadczeń do Twojego profilu: 800+, becikowe, zasiłki, ulgi podatkowe.' },
  { label: 'Zmiany w prawie', desc: 'Śledzi ZUS, podatki.gov.pl i zmiany przepisów. Informuje Cię zanim musisz działać.' },
  { label: 'Dzienny raport e-mail', desc: 'Co rano dostaniesz zwięzłe podsumowanie co jest nowego. Bez logowania do panelu.' },
  { label: 'JDG i osoby prywatne', desc: 'Dla prowadzących działalność (NIP + PKD) i dla osób prywatnych (profil rodzinny).' },
];

export default function AgentLanding() {
  return (
    <main>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px 56px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-3)', letterSpacing: '0.04em', marginBottom: 16 }}>
          {'// agent.wezmezadarmo.v1'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--color-text-1)', margin: '0 0 20px', maxWidth: 700 }}>
          Twój agent AI.<br />
          <span style={{ color: 'var(--color-accent)' }}>Pilnuje spraw, gdy Ty żyjesz.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 32px', maxWidth: 520 }}>
          Dla JDG i osób prywatnych. Agent sprawdza co Ci przysługuje, śledzi zmiany w prawie
          i wysyła Ci codzienny raport na e-mail. Bez wchodzenia na rządowe strony.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/agent/rejestracja" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--color-bg-0)', background: 'var(--color-accent)', padding: '10px 20px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            Zacznij za darmo
          </Link>
          <Link href="/agent/logowanie" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-2)', border: '1px solid var(--color-border-light)', padding: '10px 20px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            Mam już konto
          </Link>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-1)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {CECHY.map(({ label, desc }) => (
              <div key={label} style={{ background: 'var(--color-bg-1)', padding: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--color-accent)', marginBottom: 10 }}>{label}</div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-sans)', lineHeight: 1.6, maxWidth: 640 }}>
          Agent AI ma charakter wyłącznie informacyjny. Nie składamy wniosków bez Twojej akceptacji.
          Żaden dokument nie jest wysyłany do urzędu bez Twojej wiedzy i zgody.
        </p>
      </section>
    </main>
  );
}
