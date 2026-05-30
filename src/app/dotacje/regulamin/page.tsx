import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Regulamin | dotacje | wezmezadarmo',
  description: 'Regulamin usługi dotacje.wezmezadarmo.com - warunki korzystania, bezpłatny dostęp, prawa użytkownika.',
};

const SECTION_STYLE = { marginBottom: '40px' } as const;

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
  padding: '0',
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
        color: 'var(--color-green)',
      }}>
        --
      </span>
      {children}
    </li>
  );
}

export default function RegulaminsPage() {
  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' }}>
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
          regulamin
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
          WARUNKI KORZYSTANIA Z USŁUGI
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
          Regulamin
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

      {/* §1 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§1 Definicje</h2>
        <ul style={UL_STYLE}>
          <Li><strong>Usługodawca</strong>: wezmezadarmo.com, operator serwisu dotacje.wezmezadarmo.com.</Li>
          <Li><strong>Użytkownik</strong>: osoba fizyczna lub prawna, która zarejestrowała konto w serwisie.</Li>
          <Li><strong>Agent AI</strong>: system sztucznej inteligencji oparty na dużym modelu językowym (LLM), dostępny w panelu użytkownika.</Li>
          <Li><strong>Dostęp</strong>: bezpłatny dostęp do panelu, agenta AI i powiadomień, z limitami uczciwego użycia. Serwis jest prowadzony pro bono.</Li>
        </ul>
      </section>

      {/* §2 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§2 Zakres usługi</h2>
        <p style={P_STYLE}>
          Usługa dotacje.wezmezadarmo.com udostępnia:
        </p>
        <ul style={UL_STYLE}>
          <Li>Bazę informacji o polskich programach wsparcia publicznego dla firm (KFS, PUP, PFRON, KPO, samorządy, PARP/FENG).</Li>
          <Li>Agenta AI odpowiadającego na pytania dotyczące programów dopasowanych do profilu firmy Użytkownika.</Li>
          <Li>System monitorowania naborów (powiadomienia e-mail wysyłane co tydzień, w każdy poniedziałek rano).</Li>
        </ul>
        <p style={P_STYLE}>
          Usługa ma charakter informacyjny. Usługodawca nie gwarantuje przyznania
          dofinansowania, nie składa wniosków w imieniu Użytkownika i nie udziela
          porad prawnych ani finansowych.
        </p>
      </section>

      {/* §3 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§3 Rejestracja i konto</h2>
        <ul style={UL_STYLE}>
          <Li>Konto może założyć osoba pełnoletnia lub podmiot gospodarczy posiadający NIP.</Li>
          <Li>Jeden adres e-mail może być przypisany do jednego konta.</Li>
          <Li>Użytkownik jest odpowiedzialny za bezpieczeństwo hasła i wszelkie działania wykonane za pośrednictwem konta.</Li>
          <Li>Usługodawca może zawiesić lub usunąć konto naruszające niniejszy regulamin.</Li>
        </ul>
      </section>

      {/* §4 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§4 Bezpłatny dostęp</h2>
        <ul style={UL_STYLE}>
          <Li>Korzystanie z usługi jest bezpłatne. Serwis nie pobiera opłat, nie wymaga karty płatniczej i nie obsługuje płatności automatycznych ani subskrypcji.</Li>
          <Li>Dostęp objęty jest limitami uczciwego użycia, które służą wyłącznie utrzymaniu stabilności i porządku platformy.</Li>
          <Li>Usługa jest prowadzona pro bono. Usługodawca może zmienić zakres bezpłatnych funkcji lub limity, informując o istotnych zmianach drogą e-mailową.</Li>
        </ul>
      </section>

      {/* §5 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§5 Rezygnacja z konta</h2>
        <p style={P_STYLE}>
          Użytkownik może w dowolnym momencie zrezygnować z korzystania z usługi i usunąć
          konto, bez podania przyczyny i bez żadnych kosztów. Ponieważ usługa jest bezpłatna,
          nie powstają żadne zobowiązania finansowe ani rozliczenia.
        </p>
        <p style={P_STYLE}>
          Żądanie usunięcia konta prosimy zgłaszać przez formularz kontaktowy lub e-mailem.
          Dane są usuwane w ciągu 30 dni od zgłoszenia.
        </p>
      </section>

      {/* §6 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§6 Ochrona danych osobowych</h2>
        <p style={P_STYLE}>
          Administratorem danych osobowych jest Usługodawca. Dane przetwarzane są
          w celu świadczenia usługi i wysyłania powiadomień.
          Szczegóły: Polityka przejrzystości AI i Polityka prywatności dostępna
          na stronie serwisu.
        </p>
        <ul style={UL_STYLE}>
          <Li>Użytkownik ma prawo dostępu, sprostowania, usunięcia i przenoszenia danych.</Li>
          <Li>Żądanie usunięcia konta realizowane jest w ciągu 30 dni od złożenia wniosku.</Li>
          <Li>Eksport danych (JSON) dostępny jest bezpośrednio w panelu użytkownika.</Li>
        </ul>
      </section>

      {/* §7 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§7 Odpowiedzialność</h2>
        <ul style={UL_STYLE}>
          <Li>Usługodawca dokłada starań, by informacje w bazie były aktualne, jednak nie ponosi odpowiedzialności za decyzje podjęte na podstawie odpowiedzi agenta AI.</Li>
          <Li>Usługodawca nie odpowiada za przerwy w dostępie do usługi spowodowane awariami infrastruktury zewnętrznej (Supabase, OpenAI/OpenRouter).</Li>
          <Li>Łączna odpowiedzialność Usługodawcy wobec Użytkownika nie przekroczy kwoty opłat uiszczonych przez Użytkownika w ciągu 3 miesięcy poprzedzających zdarzenie szkodzące.</Li>
        </ul>
      </section>

      {/* §8 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§8 Reklamacje</h2>
        <p style={P_STYLE}>
          Reklamacje dotyczące usługi należy kierować przez formularz kontaktowy
          na stronie /dotacje/kontakt lub drogą e-mailową. Usługodawca rozpatruje
          reklamacje w ciągu 14 dni kalendarzowych.
        </p>
        <p style={P_STYLE}>
          Użytkownik będący konsumentem może skorzystać z platformy ODR (Online
          Dispute Resolution): <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-green)' }}>ec.europa.eu/consumers/odr</span>
        </p>
      </section>

      {/* §9 */}
      <section style={SECTION_STYLE}>
        <h2 style={H2_STYLE}>§9 Postanowienia końcowe</h2>
        <ul style={UL_STYLE}>
          <Li>W sprawach nieuregulowanych zastosowanie ma prawo polskie.</Li>
          <Li>Usługodawca zastrzega prawo zmiany regulaminu z 14-dniowym wyprzedzeniem. O istotnych zmianach poinformujemy e-mailem.</Li>
          <Li>Korzystanie z usługi po wejściu w życie zmian oznacza akceptację nowego regulaminu.</Li>
          <Li>Regulamin obowiązuje od 17 maja 2026 r.</Li>
        </ul>
      </section>

      {/* Back links */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: '24px',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
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
          href="/dotacje/polityka-ai"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-3)',
            textDecoration: 'none',
          }}
        >
          Polityka przejrzystości AI
        </Link>
      </div>
    </main>
  );
}
