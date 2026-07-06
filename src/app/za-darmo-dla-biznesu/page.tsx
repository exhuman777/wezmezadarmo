import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Za darmo dla biznesu - narzędzia dla polskich firm | wezmezadarmo',
  description: 'Wartościowe narzędzia dla polskich firm: DogInvoice (automatyzacja faktur i KSeF z AI) oraz DogAnswer (asystent AI odbierający telefony 24/7). Treść informacyjna. Rozwiązania dedykowane - zapraszamy do kontaktu.',
  robots: { index: true, follow: true },
};

interface Product {
  name: string;
  tagline: string;
  intro: string;
  features: string[];
  audience: string;
  href: string;
  preview: { src: string; w: number; h: number; alt: string };
  logo?: { src: string; w: number; h: number; alt: string };
  dark?: boolean;
}

const PRODUCTS: Product[] = [
  {
    name: 'DogInvoice',
    tagline: 'Automatyzacja faktur i KSeF z AI',
    intro: 'Koniec z ręcznym przepisywaniem faktur. DogInvoice pobiera dokumenty z KSeF, rozpoznaje je autorskim AI-OCR niezależnie od źródła (e-mail, PDF, zdjęcie z telefonu), kategoryzuje koszty i archiwizuje. Odciąża właścicieli firm i księgowych, oszczędzając godziny pracy w miesiącu i porządkując finanse przed obowiązkowym KSeF.',
    features: [
      'Integracja z KSeF + konwersja XML na czytelny PDF',
      'AI-OCR: rozpoznawanie faktur ze zdjęć, PDF-ów i e-maili',
      'Inteligentna kategoryzacja wydatków',
      'Analityka finansowa i dashboardy',
      'Import wyciągów bankowych (MT940) i dopasowanie płatności',
      'Ponad 11 integracji: Fakturownia, inFakt, BaseLinker, Apilo, Gmail, Google Drive',
    ],
    audience: 'Właściciele MŚP, sklepy e-commerce, biura rachunkowe i księgowi.',
    href: 'https://doginvoice.com',
    preview: { src: '/partnerzy/doginvoice-preview.png', w: 1200, h: 599, alt: 'DogInvoice - panel do automatyzacji faktur' },
  },
  {
    name: 'DogAnswer',
    tagline: 'Asystent AI, który odbiera telefony 24/7',
    intro: 'Każdy telefon w środku pracy to przerwana koncentracja, a nieodebrany po godzinach to stracony klient. DogAnswer odbiera połączenia zamiast Ciebie przez całą dobę, rozmawia naturalnym głosem, obsługuje dzwoniącego i wysyła Ci podsumowanie rozmowy. Bez kosztu sekretariatu i bez utraty leadów.',
    features: [
      'Odbieranie połączeń 24/7 przez asystenta AI',
      'Podsumowania rozmów na SMS, WhatsApp lub e-mail',
      'Transkrypty i identyfikacja dzwoniącego',
      'Własne powitania i instrukcje dla agenta',
      'Inteligentne przekierowania połączeń',
      'Naturalny głos (technologia ElevenLabs)',
    ],
    audience: 'Freelancerzy, gabinety lekarskie, sklepy oraz małe i średnie firmy.',
    href: 'https://doganswer.com',
    preview: { src: '/partnerzy/doganswer-preview.webp', w: 1200, h: 630, alt: 'DogAnswer - asystent AI do obsługi połączeń' },
    logo: { src: '/partnerzy/doganswer-logo-white.svg', w: 190, h: 40, alt: 'DogAnswer' },
    dark: true,
  },
];

export default function ZaDarmoDlaBiznesuPage() {
  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Nagłówek */}
      <header style={{ maxWidth: 760, marginBottom: 44 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Za darmo dla biznesu
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 44px)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em', color: 'var(--color-text-1)', margin: '0 0 16px' }}>
          Narzędzia, które realnie oszczędzają czas polskim firmom
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--color-text-2)', margin: 0 }}>
          Tak jak w części dla obywateli pokazujemy świadczenia, których ludzie nie znają, tak tutaj
          zbieramy sprawdzone narzędzia przydatne w prowadzeniu firmy. Poniżej dwa produkty polskiego
          software house’u <strong>Dogtronic</strong>, które automatyzują żmudne, powtarzalne zadania.
          To treść informacyjna, nie reklama - każde narzędzie ma darmowy plan lub wersję próbną, więc
          możesz sprawdzić je sam.
        </p>
      </header>

      {/* Produkty */}
      <div style={{ display: 'grid', gap: 28 }}>
        {PRODUCTS.map(p => (
          <article key={p.name} style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 0 }}>
              {/* Nagłówek produktu */}
              <div style={{
                padding: 'clamp(20px, 3vw, 32px)',
                ...(p.dark ? { background: '#07160f' } : {}),
              }}>
                {p.logo ? (
                  <Image src={p.logo.src} alt={p.logo.alt} width={p.logo.w} height={p.logo.h}
                    unoptimized
                    style={{ height: 34, width: 'auto', marginBottom: 14 }} />
                ) : (
                  <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', color: p.dark ? '#fff' : 'var(--color-text-1)', marginBottom: 14 }}>
                    <span style={{ color: 'var(--color-accent)' }}>Dog</span>{p.name.replace('Dog', '')}
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: p.dark ? '#8EEAAD' : 'var(--color-accent)', marginBottom: 10 }}>
                  {p.tagline}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: p.dark ? 'rgba(255,255,255,0.82)' : 'var(--color-text-2)', margin: 0, maxWidth: 720 }}>
                  {p.intro}
                </p>
              </div>

              {/* Podgląd */}
              <div style={{ padding: '0 clamp(20px, 3vw, 32px)', marginTop: -4 }}>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                  <Image src={p.preview.src} alt={p.preview.alt} width={p.preview.w} height={p.preview.h}
                    style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              </div>

              {/* Funkcje + odbiorcy + CTA */}
              <div style={{ padding: 'clamp(20px, 3vw, 32px)' }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: 12 }}>
                  Co potrafi
                </div>
                <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px 20px', listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 9, fontSize: 14, lineHeight: 1.5, color: 'var(--color-text-2)' }}>
                      <span style={{ color: 'var(--color-accent)', flexShrink: 0, fontWeight: 700 }}>+</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 13, color: 'var(--color-text-3)', maxWidth: 520 }}>
                    <strong style={{ color: 'var(--color-text-2)' }}>Dla kogo:</strong> {p.audience}
                  </div>
                  <a href={p.href} target="_blank" rel="noopener noreferrer" style={{
                    padding: '10px 20px', background: 'var(--color-text-1)', color: 'var(--color-bg-0)',
                    borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap',
                  }}>
                    Zobacz {p.name} →
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* CTA: rozwiązania dedykowane */}
      <section style={{
        marginTop: 40, padding: 'clamp(28px, 4vw, 40px)',
        background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 16,
      }}>
        <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 10px' }}>
          Potrzebujesz rozwiązania dedykowanego dla swojego biznesu?
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 20px', maxWidth: 680 }}>
          Powyższe narzędzia to gotowe produkty. Jeśli Twój proces wymaga czegoś skrojonego na miarę
          - własnej automatyzacji, integracji z Twoimi systemami albo aplikacji zbudowanej od zera -
          zajmuje się tym zespół Dogtronic (software house z Lublina). Napisz, opowiedz o problemie,
          a wspólnie sprawdzimy, czy da się go zautomatyzować.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <a href="mailto:admin@dogtronic.io?subject=Rozwiązanie%20dedykowane%20dla%20biznesu" style={{
            padding: '11px 22px', background: 'var(--color-accent)', color: '#fff',
            borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            Napisz: admin@dogtronic.io
          </a>
          <a href="https://dogtronic.io/kontakt/" target="_blank" rel="noopener noreferrer" style={{
            padding: '11px 22px', background: 'transparent', color: 'var(--color-text-1)',
            border: '1px solid var(--color-border)', borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>
            Formularz kontaktowy Dogtronic →
          </a>
        </div>
      </section>

      <p style={{ fontSize: 12, color: 'var(--color-text-3)', margin: '24px 0 0', lineHeight: 1.6 }}>
        Materiał informacyjny. DogInvoice i DogAnswer to produkty firmy Dogtronic Sp. z o.o.
        Nazwy i znaki towarowe należą do ich właścicieli. wezmezadarmo prezentuje je jako przydatne
        narzędzia dla firm, bez wynagrodzenia za publikację.
      </p>
    </main>
  );
}
