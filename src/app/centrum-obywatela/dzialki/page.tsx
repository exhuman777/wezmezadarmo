import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Geoportal ARiMR - mapy działek | Centrum Obywatela',
  description: 'Sprawdź działkę rolną w Geoportalu ARiMR - kontrolę agro, dopłaty bezpośrednie, granice ewidencyjne.',
};

const KROKI = [
  { n: 1, tytul: 'Otwórz Geoportal ARiMR', opis: 'Wejdź na geoportal.arimr.gov.pl - publiczny serwis Agencji Restrukturyzacji i Modernizacji Rolnictwa.' },
  { n: 2, tytul: 'Zaloguj się (opcjonalnie)', opis: 'Profil zaufany (login.gov.pl) odblokowuje dodatkowe warstwy: kontrole agro, dopłaty bezpośrednie, historię działek.' },
  { n: 3, tytul: 'Znajdź działkę', opis: 'Wpisz numer ewidencyjny, adres lub przesuń mapę do swojej działki. Możesz też wkleić koordynaty.' },
  { n: 4, tytul: 'Sprawdź warstwy', opis: 'Granice działek, użytki rolne, obszary ONW, Natura 2000, ortofotomapa.' },
];

export default function DzialkiPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5d7c1f' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          ARiMR · Geoportal
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Mapy działek rolnych</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Geoportal ARiMR to oficjalne narzędzie do sprawdzania granic działek, kontroli agrotechnicznych i dopłat bezpośrednich.
        Wymaga przejścia do zewnętrznego portalu - integracja iframe nie jest możliwa (X-Frame-Options).
      </p>

      <a href="https://geoportal.arimr.gov.pl" target="_blank" rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', background: '#5d7c1f', color: '#fff',
          borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15,
          marginBottom: 28,
        }}>
        Otwórz Geoportal ARiMR
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17l10-10M7 7h10v10"/>
        </svg>
      </a>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {KROKI.map(k => (
          <div key={k.n} style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10 }}>
            <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, fontFamily: 'var(--f-mono)' }}>{k.n}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>{k.tytul}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-600)', lineHeight: 1.5 }}>{k.opis}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://geoportal.arimr.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>geoportal.arimr.gov.pl</a>
      </p>
    </main>
  );
}
