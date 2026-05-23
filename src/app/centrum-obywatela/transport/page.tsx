import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ulgi PKP - kto ile płaci za pociąg | Centrum Obywatela',
  description: 'Pełna tabela ulg PKP, Intercity, Polregio - student, senior, KDR, niepełnosprawni, dziecko.',
};

const ULGI = [
  { grupa: 'Dziecko do 4 lat', ulga: '100%', warunek: 'Bez wykupywania biletu, na rękach opiekuna' },
  { grupa: 'Dziecko 4-6 lat', ulga: '78%', warunek: 'Bilet ulgowy bez dokumentów' },
  { grupa: 'Uczeń do 24 lat', ulga: '37%', warunek: 'Legitymacja szkolna; bilety jednorazowe i miesięczne' },
  { grupa: 'Uczeń - bilety miesięczne (szkoła ↔ dom)', ulga: '49%', warunek: 'Legitymacja szkolna + bilet miesięczny imienny' },
  { grupa: 'Student do 26 lat', ulga: '51%', warunek: 'Legitymacja studencka; jednorazowe i miesięczne' },
  { grupa: 'Senior 60+', ulga: '30%', warunek: 'Bilet jednorazowy 2 klasy Intercity/EIC/EIP/TLK; dokument tożsamości' },
  { grupa: 'Emeryt/rencista (renta z tytułu niezdolności)', ulga: '37%', warunek: 'Legitymacja emeryta/rencisty; 2 jednorazowe bilety/rok' },
  { grupa: 'Karta Dużej Rodziny - rodzic', ulga: '37%', warunek: 'KDR + bilet jednorazowy' },
  { grupa: 'Karta Dużej Rodziny - dziecko', ulga: '49%', warunek: 'KDR + bilet jednorazowy' },
  { grupa: 'Niepełnosprawny - znaczny stopień + opiekun', ulga: '49%/95%', warunek: 'Niepełnosprawny 49%, opiekun 95% (jednorazowy)' },
  { grupa: 'Niewidomy + przewodnik', ulga: '37%/95%', warunek: 'Niewidomy 37%, przewodnik 95%' },
  { grupa: 'Dziecko niepełnosprawne + opiekun', ulga: '78%/95%', warunek: 'Dziecko 78%, opiekun 95%; do nauki / na rehabilitację' },
  { grupa: 'Kombatant', ulga: '37% / 51%', warunek: 'Legitymacja kombatanta; jednorazowe/miesięczne' },
  { grupa: 'Żołnierz zasadniczej służby wojskowej', ulga: '78%', warunek: 'Książeczka wojskowa' },
];

const LINKI = [
  { tytul: 'Portal Pasażera (rozkład PKP PLK)', url: 'https://portalpasazera.pl', desc: 'Oficjalny rozkład jazdy wszystkich przewoźników kolejowych' },
  { tytul: 'PKP Intercity', url: 'https://www.intercity.pl', desc: 'Bilety na pociągi dalekobieżne EIC/EIP/IC/TLK' },
  { tytul: 'Polregio', url: 'https://polregio.pl', desc: 'Pociągi regionalne (R, RE)' },
];

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', fontWeight: 600 };
const td: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'top' };

export default function TransportPage() {
  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a01818' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          PKP · ulgi transportowe
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Ulgi PKP - kto ile płaci</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Pełna tabela ulg ustawowych obowiązujących we wszystkich przewoźnikach kolejowych w Polsce (Intercity, Polregio, Koleje Mazowieckie i in.).
      </p>

      <div style={{ overflow: 'auto', marginBottom: 28, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--white)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--green-50)' }}>
              <th style={th}>Grupa uprawniona</th>
              <th style={{ ...th, width: 90 }}>Ulga</th>
              <th style={th}>Warunek</th>
            </tr>
          </thead>
          <tbody>
            {ULGI.map((u, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={td}>{u.grupa}</td>
                <td style={{ ...td, fontFamily: 'var(--f-mono)', fontWeight: 600, color: 'var(--green-900)' }}>{u.ulga}</td>
                <td style={{ ...td, color: 'var(--ink-600)' }}>{u.warunek}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 12 }}>Sprawdź połączenie i ceny</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {LINKI.map(l => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', padding: 14, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>{l.tytul}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.5 }}>{l.desc}</div>
          </a>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: Ustawa z 20.06.1992 o uprawnieniach do ulgowych przejazdów; portalpasazera.pl.
      </p>
    </main>
  );
}
