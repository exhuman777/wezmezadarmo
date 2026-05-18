import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Polityka przejrzystości AI | dotacje | wezmezadarmo',
  description: 'Informacja o charakterze systemu AI zgodnie z art. 52 Rozporządzenia UE o AI (AI Act). Zakres wiedzy agenta, ograniczenia i prawa użytkownika.',
};

const SECTION_STYLE = {
  marginBottom: '40px',
} as const;

const H2_STYLE = {
  fontFamily: 'var(--font-mono)',
  fontSize: '15px',
  fontWeight: 500,
  color: 'var(--color-text-1)',
  margin: '0 0 12px',
  letterSpacing: '-0.01em',
  paddingBottom: '10px',
  borderBottom: '1px solid var(--color-border)',
} as const;

const P_STYLE = {
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'var(--color-text-2)',
  lineHeight: 1.7,
  margin: '0 0 10px',
} as const;

const UL_STYLE = {
  margin: '0 0 10px',
  padding: '0 0 0 0',
  listStyle: 'none',
} as const;

const LI_STYLE = {
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'var(--color-text-2)',
  lineHeight: 1.6,
  padding: '5px 0 5px 18px',
  position: 'relative' as const,
  borderBottom: '1px solid var(--color-border)',
} as const;

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={LI_STYLE}>
      <span style={{
        position: 'absolute',
        left: 0,
        top: '8px',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--color-accent)',
      }}>
        --
      </span>
      {children}
    </li>
  );
}

export default function PolitykAiPage() {
  return (
    <main style={{
      maxWidth: '760px',
      margin: '0 auto',
      padding: '48px 24px 80px',
    }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          href="/dotacje"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--color-text-3)',
            textDecoration: 'none',
          }}
        >
          dotacje
        </Link>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-border-light)',
          margin: '0 6px',
        }}>
          /
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-3)',
        }}>
          polityka-ai
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--color-text-3)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: '10px',
        }}>
          ZGODNOŚĆ Z AI ACT ART. 52 | RODO
        </span>
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '28px',
          fontWeight: 500,
          color: 'var(--color-text-1)',
          margin: '0 0 12px',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          Polityka przejrzystości AI
        </h1>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--color-text-3)',
          margin: 0,
        }}>
          Ostatnia aktualizacja: 17 maja 2026 r.
        </p>
      </div>

      {/* Notice box */}
      <div style={{
        background: 'var(--color-amber-bg)',
        border: '1px solid var(--color-amber-border)',
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        marginBottom: '40px',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--color-accent)',
          margin: '0 0 6px',
          fontWeight: 500,
        }}>
          UWAGA: Rozmawiasz z systemem AI
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: 'var(--color-text-2)',
          margin: 0,
          lineHeight: 1.6,
        }}>
          Agent dotacje to system sztucznej inteligencji, nie jest to człowiek,
          doradca prawny ani ekspert finansowy. Odpowiedzi generuje model językowy
          na podstawie bazy programów dotacyjnych. Treść powinna być weryfikowana
          źródłowo przed podjęciem jakichkolwiek działań.
        </p>
      </div>

      {/* Section 1 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Korzystasz z systemu AI</h2>
        <p style={P_STYLE}>
          Zgodnie z art. 52 ust. 1 Rozporządzenia Parlamentu Europejskiego i Rady (UE)
          2024/1689 (Akt o AI) informujemy, że serwis wezmezadarmo.com/dotacje wdrożył
          system AI wchodzący w bezpośrednią interakcję z użytkownikami.
        </p>
        <p style={P_STYLE}>
          Agent dotacje jest systemem AI opartym na dużym modelu językowym (LLM).
          Nie jest człowiekiem. Nie posiada uprawnień doradcy finansowego,
          radcy prawnego ani konsultanta dotacyjnego. Nie jest pracownikiem żadnej instytucji
          publicznej ani urzędu.
        </p>
        <p style={P_STYLE}>
          Interakcja z agentem nie jest równoznaczna ze złożeniem wniosku, uzyskaniem
          interpretacji prawnej ani oficjalnym potwierdzeniem kwalifikowalności firmy
          do jakiegokolwiek programu.
        </p>
      </section>

      {/* Section 2 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Zakres wiedzy agenta</h2>
        <p style={P_STYLE}>
          Agent posiada informacje o następujących programach i instrumentach wsparcia:
        </p>
        <ul style={UL_STYLE}>
          <Li>Krajowy Fundusz Szkoleniowy (KFS): na podstawie publikacji PUP i MPiPS</Li>
          <Li>Refundacje wynagrodzeń przez Powiatowe Urzędy Pracy (PUP)</Li>
          <Li>Dofinansowania PFRON do zatrudnienia osób z niepełnosprawnością</Li>
          <Li>Instrumenty KPO: nabory prowadzone przez PARP, BGK, Ministerstwo Funduszy</Li>
          <Li>Wybrane programy samorządowe z 16 województw (dane aktualizowane co tydzień)</Li>
          <Li>Programy PARP z Funduszy Europejskich dla Nowoczesnej Gospodarki (FENG)</Li>
        </ul>
        <p style={P_STYLE}>
          Baza wiedzy jest aktualizowana co najmniej raz w tygodniu na podstawie publicznie
          dostępnych źródeł: stron instytucji, Biuletynów Informacji Publicznej
          i komunikatów prasowych.
        </p>
        <p style={{
          ...P_STYLE,
          color: 'var(--color-text-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
        }}>
          Data aktualności bazy: 17 maja 2026 r. Agent nie posiada dostępu do wewnętrznych
          systemów instytucji ani do indywidualnych historii wniosków.
        </p>
      </section>

      {/* Section 3 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Czego agent NIE robi</h2>
        <ul style={UL_STYLE}>
          <Li>
            Nie składa wniosków w imieniu użytkownika do żadnej instytucji
          </Li>
          <Li>
            Nie gwarantuje przyznania dofinansowania: decyzja należy wyłącznie
            do instytucji zarządzającej programem
          </Li>
          <Li>
            Nie udziela porad prawnych ani finansowych w rozumieniu ustawy
            o doradztwie prawnym
          </Li>
          <Li>
            Nie interpretuje indywidualnych umów, zapisów w statucie ani dokumentów firmy
          </Li>
          <Li>
            Nie ma dostępu do rejestrów KRS, ZUS ani US: NIP służy wyłącznie
            do pobrania danych z CEIDG w celu skonfigurowania profilu
          </Li>
          <Li>
            Nie przetwarza danych osobowych pracowników: agent widzi tylko dane
            identyfikacyjne firmy i skonfigurowane flagi profilu
          </Li>
        </ul>
      </section>

      {/* Section 4 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Dane używane przez agenta</h2>
        <p style={P_STYLE}>
          W celu personalizacji odpowiedzi agent przetwarza następujące dane firmy:
        </p>
        <ul style={UL_STYLE}>
          <Li>
            NIP: identyfikator pobierany z CEIDG wyłącznie w celu dopasowania profilu
          </Li>
          <Li>
            Kody PKD: do filtrowania programów wg branży
          </Li>
          <Li>
            Liczba zatrudnionych (MŚP / mikro): do weryfikacji limitów programów
          </Li>
          <Li>
            Flagi zainteresowania: zaznaczone przez użytkownika kategorie:
            szkolenia, zatrudnienie, innowacje, zielona transformacja, eksport
          </Li>
          <Li>
            Województwo siedziby: do filtrowania programów samorządowych
          </Li>
        </ul>
        <p style={P_STYLE}>
          Agent nie przetwarza: imion i nazwisk pracowników, danych kadrowych,
          numerów rachunków bankowych, danych wrażliwych ani korespondencji
          z urzędami. Szczegóły przetwarzania danych osobowych opisuje
          Polityka Prywatności serwisu.
        </p>
      </section>

      {/* Section 5 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Jak zakwestionować odpowiedź agenta</h2>
        <p style={P_STYLE}>
          Jeżeli uważasz, że agent przekazał informacje nieprawidłowe, nieaktualne
          lub mylące, masz prawo:
        </p>
        <ul style={UL_STYLE}>
          <Li>
            Zgłosić błąd przez formularz kontaktowy: podaj fragment rozmowy
            i źródło, które wskazuje na błędną informację
          </Li>
          <Li>
            Zażądać ręcznej weryfikacji odpowiedzi: odpowiemy w ciągu 5 dni roboczych
          </Li>
          <Li>
            Nie opierać się wyłącznie na odpowiedzi agenta, zawsze zweryfikuj
            informacje na stronie instytucji zarządzającej programem
          </Li>
        </ul>
        <p style={P_STYLE}>
          Zgłoszenia dotyczące jakości odpowiedzi trafiają do zespołu redakcyjnego
          i są uwzględniane przy aktualizacji bazy wiedzy.
        </p>
      </section>

      {/* Section 6 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>Kontakt i reklamacje</h2>
        <p style={P_STYLE}>
          Administrator serwisu wezmezadarmo.com/dotacje:
        </p>
        <div style={{
          background: 'var(--color-bg-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
          marginBottom: '12px',
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-2)',
            margin: 0,
            lineHeight: 1.8,
          }}>
            wezmezadarmo.com<br />
            kontakt: przez formularz na stronie /dotacje/kontakt<br />
            reklamacje rozpatrujemy w ciągu 14 dni kalendarzowych
          </p>
        </div>
        <p style={P_STYLE}>
          W sprawach dotyczących przetwarzania danych osobowych (RODO) możesz
          złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (UODO),
          ul. Stawki 2, 00-193 Warszawa, www.uodo.gov.pl.
        </p>
        <p style={{
          ...P_STYLE,
          color: 'var(--color-text-3)',
          fontSize: '12px',
        }}>
          Niniejsza polityka obowiązuje od 17 maja 2026 r. Zastrzegamy prawo
          do zmiany treści, w przypadku istotnych zmian poinformujemy użytkowników
          drogą mailową z 14-dniowym wyprzedzeniem.
        </p>
      </section>

      {/* Back link */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: '24px',
        display: 'flex',
        gap: '20px',
      }}>
        <Link
          href="/dotacje"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-3)',
            textDecoration: 'none',
          }}
        >
          -- powrót do strony głównej dotacje
        </Link>
        <Link
          href="/dotacje/regulamin"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-3)',
            textDecoration: 'none',
          }}
        >
          Regulamin
        </Link>
      </div>
    </main>
  );
}
