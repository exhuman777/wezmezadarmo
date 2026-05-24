import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Press kit | wezmezadarmo',
  description: 'Materiały prasowe dla dziennikarzy, blogerów i influencerów. Logo, screenshoty, statystyki, kontakt.',
  alternates: { canonical: 'https://www.wezmezadarmo.com/press' },
  openGraph: {
    title: 'Press kit - wezmezadarmo',
    description: 'Materiały prasowe, statystyki, kontakt dla mediów.',
    url: 'https://www.wezmezadarmo.com/press',
    locale: 'pl_PL', type: 'website',
  },
};

const FACTS = [
  { n: '118', label: 'zweryfikowanych świadczeń w bazie' },
  { n: '23', label: 'programy dotacyjne B2B' },
  { n: '11', label: 'darmowych narzędzi Centrum Obywatela' },
  { n: '8', label: 'instytucji rządowych w agregatorze RSS' },
  { n: '2026', label: 'data weryfikacji (aktualizacja co 2-3 tygodnie)' },
  { n: '0 PLN', label: 'koszt dla użytkownika końcowego' },
];

const SHORT_DESC = `wezmezadarmo.com to bezpłatne narzędzie pomagające polskim obywatelom i firmom odkryć świadczenia rządowe, ulgi podatkowe i programy wsparcia, na które się kwalifikują. Agregator 118 świadczeń (ZUS, NFZ, PFRON, KRUS, MOPS, ulgi PIT), 23 programów dotacyjnych B2B (KFS, PARP, NCBR, KPO, ARiMR) i 11 darmowych narzędzi (NFZ kolejki, kursy NBP, jakość powietrza GIOŚ, Biała Lista VAT, sprawdzenie NIP).`;

const LONG_DESC = `Polacy tracą średnio 2 400-5 000 PLN rocznie nie korzystając ze świadczeń, do których mają prawo. Powód: rozproszenie informacji między 8 instytucji rządowych i brak narzędzia agregującego wszystko w jednym miejscu.

wezmezadarmo.com rozwiązuje ten problem. W 10 anonimowych pytaniach (bez logowania, bez PESEL) silnik dopasowania przelicza 118 świadczeń i pokazuje co PEWNIE Ci przysługuje + co MOŻLIWE. Dla firm i JDG: matching 23 programów dotacyjnych na podstawie PKD i województwa pobranego z CEIDG.

Asystent AI (Google Gemini 2.0 Flash) ma dostęp do całej bazy + 8 publicznych API rządowych (NBP, NFZ, GIOŚ, Biała Lista VAT, CEIDG, IMGW, ELI/Sejm, BDL GUS) i odpowiada na pytania użytkownika z konkretnym kontekstem jego profilu.

Projekt rozwijany jest pro bono jako wkład w polskie społeczeństwo cyfrowe. Cała baza świadczeń (src/engine/benefits/) udostępniona na licencji AGPL-3.0.`;

export default function PressPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 7px rgba(34,160,107,0.55)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Press kit
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, marginBottom: 12, color: 'var(--ink-900)' }}>
        Materiały dla mediów
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-500)', marginBottom: 36, lineHeight: 1.6 }}>
        Piszesz artykuł, robisz wywiad, kręcisz materiał? Wszystko czego potrzebujesz - poniżej.
        Możesz cytować bez prośby o pozwolenie (licencja AGPL-3.0).
      </p>

      {/* Quick stats */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 14, color: 'var(--ink-900)' }}>
          Liczby (stan: 24 maja 2026)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 12 }}>
          {FACTS.map(f => (
            <div key={f.label} style={{
              padding: 16, background: 'var(--white)',
              border: '1px solid var(--line)', borderLeft: '3px solid #22A06B',
              borderRadius: 10,
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#22A06B', fontFamily: 'var(--f-mono)' }}>
                {f.n}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 4, lineHeight: 1.4 }}>
                {f.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Short description */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--ink-900)' }}>
          Krótki opis (~60 słów)
        </h2>
        <div style={{ padding: 18, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-700)' }}>
          {SHORT_DESC}
        </div>
      </div>

      {/* Long description */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--ink-900)' }}>
          Pełny opis (~200 słów)
        </h2>
        <div style={{ padding: 18, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-700)', whiteSpace: 'pre-wrap' }}>
          {LONG_DESC}
        </div>
      </div>

      {/* Logo */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--ink-900)' }}>Logo</h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ padding: 24, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, textAlign: 'center', minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#22A06B' }} />
              <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--ink-900)' }}>wezmezadarmo</span>
              <span style={{ color: 'var(--ink-400)', fontSize: 13 }}>.com</span>
            </div>
            <a href="/icon" download="wezmezadarmo-logo.png" style={{ fontSize: 12, color: '#22A06B', textDecoration: 'none' }}>
              Pobierz PNG →
            </a>
          </div>
          <div style={{ padding: 24, background: '#0c1714', border: '1px solid var(--line)', borderRadius: 10, textAlign: 'center', minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#8EEAAD' }} />
              <span style={{ fontWeight: 600, fontSize: 16, color: '#fff' }}>wezmezadarmo</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>.com</span>
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Wersja dark</span>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--ink-900)' }}>
          Źródła danych
        </h2>
        <div style={{ padding: 18, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, color: 'var(--ink-600)', lineHeight: 1.7 }}>
          Wyłącznie oficjalne źródła rządowe: gov.pl, zus.pl, nfz.gov.pl, pfron.org.pl, krus.gov.pl, podatki.gov.pl, biznes.gov.pl, czystepowietrze.gov.pl, ksef.mf.gov.pl, parp.gov.pl, ncbr.gov.pl, arimr.gov.pl, api.nbp.pl, api.gios.gov.pl, wl-api.mf.gov.pl, dane.biznes.gov.pl, bdl.stat.gov.pl, api.sejm.gov.pl, rcb.gov.pl.
          <br /><br />
          Brak danych z third-party, brak scrapowania treści, brak AI-generated benefit descriptions. Każda kwota i regulacja ręcznie zweryfikowana.
        </div>
      </div>

      {/* Contact */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--ink-900)' }}>
          Kontakt
        </h2>
        <div style={{ padding: 18, background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 10, fontSize: 14, color: 'var(--green-900)', lineHeight: 1.7 }}>
          <div style={{ marginBottom: 8 }}>
            <strong>Founder & autor:</strong> Kamil Sobkowicz (Mooning Charts Research)
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>E-mail prasowy:</strong> <a href="mailto:press@wezmezadarmo.com" style={{ color: '#22A06B' }}>press@wezmezadarmo.com</a>
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>GitHub (open-source):</strong> <a href="https://github.com/exhuman777/wezmezadarmo" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>github.com/exhuman777/wezmezadarmo</a>
          </div>
          <div>
            <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/kamil-sobkowicz" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>kamil-sobkowicz</a>
          </div>
        </div>
      </div>

      {/* License */}
      <div style={{ padding: 16, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, fontSize: 12, color: 'var(--ink-500)' }}>
        <strong style={{ color: 'var(--ink-700)' }}>Licencja:</strong> Cała baza świadczeń (src/engine/benefits/) na licencji AGPL-3.0.
        Możesz cytować, kopiować, modyfikować z zachowaniem atrybucji. Komercyjne wykorzystanie bazy poza tym oprogramowaniem wymaga osobnej licencji.
        <br />
        <Link href="/regulamin" style={{ color: '#22A06B' }}>Pełne warunki →</Link>
      </div>
    </main>
  );
}
