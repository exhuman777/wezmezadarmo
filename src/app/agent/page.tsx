import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Twój agent AI -- świadczenia i aktualności | wezmezadarmo',
  description: 'Agent AI pilnuje co Ci przysługuje i informuje o zmianach w prawie. Dla JDG i osób prywatnych. Dzienny raport na e-mail.',
};

const CECHY = [
  { label: 'Świadczenia i ulgi', desc: 'Agent dopasowuje 117 świadczeń do Twojego profilu: 800+, becikowe, zasiłki, ulgi podatkowe.', icon: 'S' },
  { label: 'Zmiany w prawie', desc: 'Śledzi ZUS, podatki.gov.pl i zmiany przepisów. Informuje Cię zanim musisz działać.', icon: 'Z' },
  { label: 'Dzienny raport e-mail', desc: 'Co rano dostaniesz zwięzłe podsumowanie co jest nowego. Bez logowania do panelu.', icon: 'D' },
  { label: 'JDG i osoby prywatne', desc: 'Dla prowadzących działalność (NIP + PKD) i dla osób prywatnych (profil rodzinny).', icon: 'J' },
];

export default function AgentLanding() {
  return (
    <main>
      <section style={{
        background: 'linear-gradient(160deg, #0a1f14 0%, #0f2e1a 40%, #122d1c 100%)',
        borderRadius: '0 0 24px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '30%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,160,107,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(48px, 6vw, 80px) 20px clamp(40px, 5vw, 64px)', position: 'relative' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(142,234,173,0.5)', letterSpacing: '0.04em', marginBottom: 16 }}>
            {'// agent.wezmezadarmo.v1'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 20px', maxWidth: 700 }}>
            Twój agent AI.<br />
            <span style={{ color: '#8EEAAD' }}>Pilnuje spraw, gdy Ty żyjesz.</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: '0 0 32px', maxWidth: 520 }}>
            Dla JDG i osób prywatnych. Agent sprawdza co Ci przysługuje, śledzi zmiany w prawie
            i wysyła Ci codzienny raport na e-mail. Bez wchodzenia na rządowe strony.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/agent/rejestracja" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: '#fff', background: '#22A06B', padding: '12px 22px', borderRadius: 10, textDecoration: 'none' }}>
              Zacznij za darmo
            </Link>
            <Link href="/agent/logowanie" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.25)', padding: '12px 22px', borderRadius: 10, textDecoration: 'none' }}>
              Mam już konto
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: 'linear-gradient(160deg, #0a1f14 0%, #0f2e1a 40%, #122d1c 100%)', borderTop: '1px solid rgba(142,234,173,0.1)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: 16 }}>
            {CECHY.map(({ label, desc, icon }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(142,234,173,0.12)',
                borderRadius: 16,
                padding: '24px',
                transition: 'border-color 200ms',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(142,234,173,0.1)', color: '#8EEAAD',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, flexShrink: 0,
                  }}>{icon}</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: '#fff' }}>{label}</div>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
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
