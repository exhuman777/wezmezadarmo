import Link from 'next/link';

const PRODUKT = [
  { href: '/', label: 'Świadczenia dla osoby' },
  { href: '/dla-firm', label: 'Agenci AI dla firm' },
  { href: '/wnioski', label: 'Wnioski' },
  { href: '/dotacje', label: 'Cennik' },
];

const WIEDZA = [
  { href: '/swiadczenia', label: 'Baza 117 świadczeń' },
  { href: '/aktualnosci', label: 'Aktualizacje' },
  { href: '/o-projekcie', label: 'Źródła' },
  { href: '/polityka-prywatnosci', label: 'Bezpieczeństwo' },
];

const KONTAKT_LINKS = [
  { href: 'mailto:sobkowicz.kamil@gmail.com', label: 'sobkowicz.kamil@gmail.com', external: true },
  { href: '/regulamin', label: 'Regulamin' },
  { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
];

export function SiteFooter() {
  return (
    <footer>
      {/* Green gradient top accent */}
      <div style={{
        height: 4,
        background: 'linear-gradient(90deg, var(--color-green) 0%, #4ADE80 50%, var(--color-green) 100%)',
      }} />

      <div style={{ background: 'var(--color-bg-0)' }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '48px 24px 20px',
        }}>
          {/* Columns */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            gap: 40,
            marginBottom: 40,
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-green)' }} />
                <span style={{
                  fontWeight: 600, fontSize: 15, color: 'var(--color-text-1)',
                }}>
                  wezmezadarmo<span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 400,
                    fontSize: 11, color: 'var(--color-text-3)',
                  }}>.com</span>
                </span>
              </div>
              <p style={{
                fontSize: 13, color: 'var(--color-text-3)',
                lineHeight: 1.65, margin: '0 0 16px', maxWidth: 280,
              }}>
                Wszystkie świadczenia, dotacje i ulgi, które Ci się należą
                - w jednym miejscu. Bez rejestracji, bez opłat, bez urzędów.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  padding: '4px 10px', borderRadius: 999,
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-3)',
                }}>
                  PESEL nie wychodzi z przeglądarki
                </span>
                <span style={{
                  fontSize: 11, fontFamily: 'var(--font-mono)',
                  padding: '4px 10px', borderRadius: 999,
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-3)',
                }}>
                  RODO
                </span>
              </div>
            </div>

            {/* PRODUKT */}
            <div>
              <div style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-3)', letterSpacing: '0.08em',
                textTransform: 'uppercase' as const, marginBottom: 16,
              }}>
                PRODUKT
              </div>
              {PRODUKT.map(link => (
                <Link key={link.href} href={link.href} style={{
                  display: 'block', fontSize: 13, color: 'var(--color-text-2)',
                  textDecoration: 'none', padding: '5px 0',
                }}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* WIEDZA */}
            <div>
              <div style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-3)', letterSpacing: '0.08em',
                textTransform: 'uppercase' as const, marginBottom: 16,
              }}>
                WIEDZA
              </div>
              {WIEDZA.map(link => (
                <Link key={link.href} href={link.href} style={{
                  display: 'block', fontSize: 13, color: 'var(--color-text-2)',
                  textDecoration: 'none', padding: '5px 0',
                }}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* KONTAKT */}
            <div>
              <div style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-3)', letterSpacing: '0.08em',
                textTransform: 'uppercase' as const, marginBottom: 16,
              }}>
                KONTAKT
              </div>
              {KONTAKT_LINKS.map(link => (
                link.external ? (
                  <a key={link.href} href={link.href} style={{
                    display: 'block', fontSize: 13, color: 'var(--color-text-2)',
                    textDecoration: 'none', padding: '5px 0',
                  }}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} style={{
                    display: 'block', fontSize: 13, color: 'var(--color-text-2)',
                    textDecoration: 'none', padding: '5px 0',
                  }}>
                    {link.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div style={{
              fontSize: 12, color: 'var(--color-text-3)',
              fontFamily: 'var(--font-sans)',
            }}>
              &copy; 2026 wezmezadarmo &middot; projekt obywatelski &middot; nie zarabiamy na Twoich danych
            </div>
            <div style={{
              fontSize: 12, fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-3)',
            }}>
              baza zweryfikowana 14.05.2026
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
