import Link from 'next/link';
import { FooterContactForm } from './FooterContactForm';
import { NewsletterSignup } from './NewsletterSignup';

const PRODUKT = [
  { href: '/', label: 'Świadczenia dla osoby' },
  { href: '/dla-firm', label: 'Agenci AI dla firm' },
  { href: '/wnioski', label: 'Wnioski' },
  { href: '/dotacje', label: 'AI dla Twojej firmy' },
];

const WIEDZA = [
  { href: '/swiadczenia', label: 'Baza 118 świadczeń' },
  { href: '/nfz', label: 'Wyszukiwarka NFZ' },
  { href: '/aktualnosci', label: 'Aktualności' },
  { href: '/o-projekcie', label: 'O projekcie' },
  { href: '/polityka-prywatnosci', label: 'Bezpieczeństwo' },
];

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="stack-16">
      <span className="mono" style={{
        fontSize: 12, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--ink-500)',
      }}>
        {title}
      </span>
      <div className="stack-4">
        {children}
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer style={{
      background: `
        linear-gradient(180deg, transparent, rgba(6,36,24,.04) 40%, rgba(6,36,24,.08)),
        var(--paper)
      `,
      padding: '80px 0 40px',
    }}>
      <div className="wrap">
        {/* Columns */}
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 2fr',
          gap: 40,
        }}>
          {/* Brand */}
          <div className="stack-16">
            <div className="row-8">
              <span className="logo-dot" />
              <span style={{
                fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em',
                color: 'var(--ink-900)',
              }}>
                wezmezadarmo<span className="dim" style={{ fontFamily: 'var(--f-mono)', fontWeight: 400, fontSize: 12 }}>.com</span>
              </span>
            </div>
            <p className="mute" style={{ fontSize: 14, lineHeight: 1.65, maxWidth: 300 }}>
              Wszystkie świadczenia, dotacje i ulgi, które Ci się należą
              - w jednym miejscu. Bez rejestracji, bez opłat, bez urzędów.
            </p>
          </div>

          {/* PRODUKT */}
          <FooterCol title="Produkt">
            {PRODUKT.map(link => (
              <Link key={link.href} href={link.href} style={{
                fontSize: 14, color: 'var(--ink-700)',
                textDecoration: 'none', padding: '3px 0',
              }}>
                {link.label}
              </Link>
            ))}
          </FooterCol>

          {/* WIEDZA */}
          <FooterCol title="Wiedza">
            {WIEDZA.map(link => (
              <Link key={link.href} href={link.href} style={{
                fontSize: 14, color: 'var(--ink-700)',
                textDecoration: 'none', padding: '3px 0',
              }}>
                {link.label}
              </Link>
            ))}
          </FooterCol>

          {/* KONTAKT */}
          <FooterCol title="Kontakt">
            <a
              href="https://linkedin.com/in/kamil-sobkowicz"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 14, color: 'var(--ink-700)', textDecoration: 'none', padding: '3px 0', display: 'block' }}
            >
              LinkedIn
            </a>
            <Link href="/regulamin" style={{ fontSize: 14, color: 'var(--ink-700)', textDecoration: 'none', padding: '3px 0', display: 'block' }}>
              Regulamin
            </Link>
            <Link href="/polityka-prywatnosci" style={{ fontSize: 14, color: 'var(--ink-700)', textDecoration: 'none', padding: '3px 0', display: 'block' }}>
              Polityka prywatności
            </Link>
            <div style={{ marginTop: 16 }}>
              <FooterContactForm />
            </div>
          </FooterCol>
        </div>

        {/* Newsletter signup -- nowy block, nie usuwa nic */}
        <div className="divider" style={{ margin: '40px 0 24px' }} />
        <div style={{
          padding: '20px 24px',
          background: 'rgba(34,160,107,0.04)',
          border: '1px solid rgba(34,160,107,0.15)',
          borderRadius: 12,
          marginBottom: 24,
          maxWidth: 480,
        }}>
          <NewsletterSignup />
        </div>

        {/* Divider + bottom bar */}
        <div className="divider" style={{ margin: '40px 0 24px' }} />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <span className="mute" style={{ fontSize: 13 }}>
            &copy; 2026 wezmezadarmo &middot; projekt obywatelski &middot; nie zarabiamy na Twoich danych
          </span>
          <span className="mono mute" style={{ fontSize: 12 }}>
            baza zweryfikowana 23.05.2026
          </span>
        </div>
      </div>
    </footer>
  );
}
