import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Za darmo dla biznesu - narzędzia dla polskich firm | wezmezadarmo',
  description: 'Sprawdzone narzędzia dla polskich firm: DogInvoice (automatyzacja faktur i KSeF z AI) oraz DogAnswer (asystent AI odbierający telefony 24/7). Przykłady użycia w biznesie. Rozwiązania dedykowane - zapraszamy do kontaktu.',
  robots: { index: true, follow: true },
};

const CONTACT_EMAIL = 'kamil.sobkowicz@dogtronic.io';

// Spójny zielony akcent całej zakładki (nazwy produktów, tagline'y, wyróżnienia).
const BRAND_GREEN = '#22A06B';
const BRAND_GREEN_ON_DARK = '#8EEAAD';

interface UseCase { who: string; story: string }
interface Tier { name: string; price: string; detail: string; highlight?: boolean }

// ---- treść ----

const DOGINVOICE = {
  tagline: 'KSeF działa w tle. Ty zajmujesz się biznesem.',
  lead: 'DogInvoice przejmuje całą papierkową robotę wokół faktur. Dokument trafia do systemu z dowolnego miejsca - zdjęcie z telefonu, PDF z e-maila, plik z KSeF - a autorskie AI w kilka sekund odczytuje numer, kwotę, kontrahenta i VAT, rozpoznaje czy to koszt czy przychód i odkłada wszystko do uporządkowanego archiwum. Faktury z KSeF pobiera samo i zamienia nieczytelny XML na zwykły PDF, bez logowania do rządowego portalu.',
  features: [
    ['AI odczytuje faktury', 'Ze zdjęcia, PDF-a lub e-maila - numer, kwota, kontrahent, VAT i daty w kilka sekund, nawet z niewyraźnego zdjęcia.'],
    ['KSeF w tle', 'Automatyczne pobieranie e-faktur z KSeF i zamiana XML na czytelny PDF. Gotowe na obowiązkowy KSeF.'],
    ['Sama kategoryzacja kosztów', 'System rozpoznaje rodzaj wydatku i przypisuje go do kategorii, ucząc się Twoich nawyków.'],
    ['Archiwum w Google Drive', 'Dokumenty układane w folderach rok/miesiąc, gotowe do przekazania księgowej.'],
    ['Pilnowanie płatności', 'Co poniedziałek e-mail z fakturami po terminie i nadchodzącymi. Oznaczasz opłacone jednym kliknięciem.'],
    ['Koszyk przelewów', 'Jeden plik z wieloma przelewami do wgrania w banku (ING, PKO, mBank). Koniec przepisywania numerów kont.'],
  ] as [string, string][],
  useCases: [
    { who: 'Sklep internetowy', story: 'Dziesiątki faktur kosztowych miesięcznie od dostawców, kurierów i platform reklamowych wpadają na dedykowany adres. AI czyta je same, oznacza jako koszty i odkłada do archiwum, a wszystkich dostawców opłacasz jednym plikiem przelewów.' },
    { who: 'Gabinet i mała praktyka', story: 'Zamiast pilnować terminów w głowie, co poniedziałek dostajesz listę faktur do zapłaty. Oznaczasz opłacone prosto z e-maila. Koniec z odsetkami za spóźnienia i pełny obraz zobowiązań bez arkusza.' },
    { who: 'Biuro rachunkowe', story: 'Każdy klient dostaje własny panel i sam wrzuca zdjęcia dokumentów, które AI od razu odczytuje i porządkuje osobno per firma i miesiąc. Jeden pulpit do wielu firm i kilkanaście godzin mniej pracy w tygodniu.' },
    { who: 'Firma budowlana lub handlowa', story: 'Po wejściu obowiązkowego KSeF nie musisz logować się do rządowego portalu ani czytać XML-i. DogInvoice pobiera e-faktury sam i pokazuje je jako zwykłe PDF-y - zespół pracuje jak dotąd.' },
  ] as UseCase[],
  pricing: [
    { name: 'Starter', price: '0 zł', detail: '10 faktur AI + 100 z KSeF miesięcznie, bez karty' },
    { name: 'Professional', price: '149 zł/mies.', detail: '150 faktur AI + 500 z KSeF', highlight: true },
    { name: 'Business', price: '299 zł/mies.', detail: '500 faktur AI + 1000 z KSeF' },
    { name: 'Enterprise', price: 'indywidualnie', detail: 'bez limitów, SLA, integracje z ERP' },
  ] as Tier[],
  href: 'https://doginvoice.com',
};

const DOGANSWER = {
  tagline: 'Telefony odbiera za Ciebie asystent AI. 24 godziny na dobę.',
  lead: 'DogAnswer to głosowy asystent, który odbiera połączenia zamiast Ciebie - także w nocy, w święta i podczas urlopu. Rozmawia z dzwoniącym naturalnym głosem, zbiera potrzebne informacje i od razu wysyła Ci podsumowanie z numerem klienta i transkrypcją na SMS, WhatsApp lub e-mail. Konfiguracja zajmuje kilka minut, bez umowy i bez instalowania aplikacji - wystarczy przekierować numer.',
  steps: [
    ['Zakładasz konto', 'Ustawiasz powitanie, wybierasz głos (damski lub męski) i piszesz, czego asystent ma się dowiedzieć od dzwoniącego.', '/partnerzy/doganswer-step1.webp'],
    ['Przekierowujesz numer', 'Wpisujesz w telefonie kod przekierowania połączeń od operatora. Bez umowy, bez aplikacji.', '/partnerzy/doganswer-step2.webp'],
    ['Dostajesz podsumowania', 'Po każdej rozmowie masz komplet informacji i transkrypcję - na SMS, WhatsApp lub e-mail.', '/partnerzy/doganswer-step3.webp'],
  ] as [string, string, string][],
  features: [
    ['Odbiera 24/7/365', 'Noc, weekend, urlop - żaden telefon od klienta nie przepada.'],
    ['Naturalna rozmowa', 'Głos oparty o technologię ElevenLabs, do wyboru damski lub męski.'],
    ['Podsumowanie każdej rozmowy', 'Numer dzwoniącego, treść sprawy i transkrypcja od razu do Ciebie.'],
    ['Powiadomienia jak lubisz', 'SMS, WhatsApp albo e-mail - wybierasz sam.'],
    ['Własne instrukcje', 'Mówisz asystentowi o co pytać i jak się przedstawiać.'],
    ['Obsługa obcych języków', 'Klient dzwoni po niemiecku? Asystent poprowadzi rozmowę i przetłumaczy ją w podsumowaniu.'],
  ] as [string, string][],
  useCases: [
    { who: 'Warsztat samochodowy', story: 'Mechanik pod maską nie odbiera telefonu i traci zlecenia. Asystent odbiera każde połączenie, zapisuje markę auta, problem i numer, wysyła SMS z podsumowaniem. Oddzwaniasz w przerwie z pełnym kontekstem.' },
    { who: 'Gabinet lekarski', story: 'Recepcja nie nadąża, pacjenci słyszą sygnał zajętości. Asystent odbiera równolegle, zbiera dane pacjenta i powód wizyty. Personel oddzwania tylko tam, gdzie trzeba.' },
    { who: 'Serwis awaryjny, hydraulik, zarządca', story: 'Awarie po godzinach przepadały do rana. Asystent działa całą dobę, przyjmuje zgłoszenie z adresem i opisem, natychmiast wysyła powiadomienie na WhatsApp. Pilne sprawy nie czekają.' },
    { who: 'Firma z klientami zagranicznymi', story: 'Napływają telefony po niemiecku, których nikt w firmie nie obsłuży. Asystent prowadzi rozmowę w języku klienta i zbiera zapytanie ofertowe. Obsługujesz zagranicę bez obcojęzycznej recepcji.' },
  ] as UseCase[],
  pricing: [
    { name: 'Starter', price: '0 zł', detail: '10 minut na start, 5-10 połączeń miesięcznie' },
    { name: 'Professional', price: '99 zł netto/mies.', detail: '120 minut, wszystkie funkcje', highlight: true },
    { name: 'Business', price: '299 zł netto/mies.', detail: '300 minut, 5-20 połączeń dziennie' },
    { name: 'Enterprise', price: 'indywidualnie', detail: 'własne limity, integracje, SLA' },
  ] as Tier[],
  href: 'https://doganswer.com',
  demo: '+48 732 126 419',
};

// ---- komponenty pomocnicze ----

function SectionTag({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--color-text-3)', marginBottom: 10 }}>
      {children}
    </div>
  );
}

function FeatureGrid({ items, dark }: { items: [string, string][]; dark?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 14, marginTop: 8 }}>
      {items.map(([t, d]) => (
        <div key={t} style={{ display: 'flex', gap: 11 }}>
          <span style={{ color: dark ? BRAND_GREEN_ON_DARK : BRAND_GREEN, fontWeight: 800, flexShrink: 0, lineHeight: 1.5 }}>+</span>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: dark ? '#fff' : 'var(--color-text-1)', marginBottom: 2 }}>{t}</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: dark ? 'rgba(255,255,255,0.7)' : 'var(--color-text-2)' }}>{d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function UseCases({ items, dark }: { items: UseCase[]; dark?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 12 }}>
      {items.map(u => (
        <div key={u.who} style={{
          padding: '16px 18px', borderRadius: 12,
          background: dark ? 'rgba(255,255,255,0.05)' : 'var(--color-bg-0)',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'var(--color-border)'}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: dark ? BRAND_GREEN_ON_DARK : BRAND_GREEN, marginBottom: 8 }}>{u.who}</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: dark ? 'rgba(255,255,255,0.78)' : 'var(--color-text-2)', margin: 0 }}>{u.story}</p>
        </div>
      ))}
    </div>
  );
}

function PricingRow({ tiers, dark }: { tiers: Tier[]; dark?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr))', gap: 10 }}>
      {tiers.map(t => (
        <div key={t.name} style={{
          padding: '14px 16px', borderRadius: 12,
          background: t.highlight ? (dark ? 'rgba(142,234,173,0.12)' : 'var(--color-surface-2)') : (dark ? 'rgba(255,255,255,0.04)' : 'var(--color-bg-0)'),
          border: `1px solid ${t.highlight ? (dark ? BRAND_GREEN_ON_DARK : BRAND_GREEN) : (dark ? 'rgba(255,255,255,0.1)' : 'var(--color-border)')}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: dark ? 'rgba(255,255,255,0.6)' : 'var(--color-text-3)' }}>{t.name}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: dark ? '#fff' : 'var(--color-text-1)', margin: '3px 0 4px' }}>{t.price}</div>
          <div style={{ fontSize: 12, lineHeight: 1.45, color: dark ? 'rgba(255,255,255,0.65)' : 'var(--color-text-2)' }}>{t.detail}</div>
        </div>
      ))}
    </div>
  );
}

// ---- strona ----

export default function ZaDarmoDlaBiznesuPage() {
  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 90px' }}>
      {/* Nagłówek */}
      <header style={{ maxWidth: 780, marginBottom: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Za darmo dla biznesu
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 46px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--color-text-1)', margin: '0 0 18px' }}>
          Narzędzia, które robią nudną robotę za polskie firmy
        </h1>
        <p style={{ fontSize: 16.5, lineHeight: 1.65, color: 'var(--color-text-2)', margin: 0 }}>
          W części dla obywateli pokazujemy świadczenia, o których mało kto wie. Tutaj zbieramy
          narzędzia, które oszczędzają czas w firmie. Poniżej dwa produkty polskiego zespołu
          <strong> Dogtronic</strong> z Lublina: jeden ogarnia faktury i KSeF, drugi odbiera telefony.
          Oba mają darmowy plan, więc sprawdzisz je bez ryzyka. To materiał informacyjny, nie reklama.
        </p>
      </header>

      {/* ---------------- DOGINVOICE ---------------- */}
      <article style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 18, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: 'clamp(22px, 3vw, 36px)' }}>
          <SectionTag>Faktury i KSeF</SectionTag>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: BRAND_GREEN, marginBottom: 6 }}>
            DogInvoice
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: BRAND_GREEN, marginBottom: 14 }}>{DOGINVOICE.tagline}</div>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'var(--color-text-2)', margin: 0, maxWidth: 780 }}>{DOGINVOICE.lead}</p>
        </div>

        <div style={{ padding: '0 clamp(22px, 3vw, 36px)' }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 12px 34px rgba(0,0,0,0.1)' }}>
            <Image src="/partnerzy/doginvoice-dashboard.png" alt="DogInvoice - pulpit do zarządzania fakturami" width={2920} height={1532} style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        </div>

        <div style={{ padding: 'clamp(22px, 3vw, 36px)' }}>
          <FeatureGrid items={DOGINVOICE.features} />

          <div style={{ margin: '28px 0 12px' }}><SectionTag>Jak to wygląda w praktyce</SectionTag></div>
          <UseCases items={DOGINVOICE.useCases} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px,100%), 1fr))', gap: 20, alignItems: 'center', marginTop: 28 }}>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <Image src="/partnerzy/doginvoice-ksef-pdf.png" alt="Zamiana nieczytelnego XML z KSeF na zwykły PDF" width={1544} height={1476} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 8 }}>Nieczytelny XML z KSeF? Zamienia go na zwykły PDF.</div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-2)', margin: 0 }}>
                Konwerter jest nawet dostępny publicznie jako proste API - dowód, że to działa naprawdę,
                a nie tylko na slajdach.
              </p>
            </div>
          </div>

          <div style={{ margin: '28px 0 12px' }}><SectionTag>Cennik</SectionTag></div>
          <PricingRow tiers={DOGINVOICE.pricing} />

          <div style={{ marginTop: 22 }}>
            <a href={DOGINVOICE.href} target="_blank" rel="noopener noreferrer" style={{ padding: '11px 22px', background: 'var(--color-text-1)', color: 'var(--color-bg-0)', borderRadius: 9, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              Zobacz DogInvoice →
            </a>
          </div>
        </div>
      </article>

      {/* ---------------- DOGANSWER ---------------- */}
      <article style={{ background: '#07160f', borderRadius: 18, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ padding: 'clamp(22px, 3vw, 36px)' }}>
          <SectionTag dark>Telefon</SectionTag>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: BRAND_GREEN_ON_DARK, marginBottom: 6 }}>
            DogAnswer
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: BRAND_GREEN_ON_DARK, marginBottom: 14 }}>{DOGANSWER.tagline}</div>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.82)', margin: 0, maxWidth: 780 }}>{DOGANSWER.lead}</p>
        </div>

        {/* Jak to działa - 3 kroki */}
        <div style={{ padding: '0 clamp(22px, 3vw, 36px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px,100%), 1fr))', gap: 16 }}>
            {DOGANSWER.steps.map(([t, d, img], i) => (
              <div key={t}>
                <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 12 }}>
                  <Image src={img} alt={t} width={1408} height={768} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#8EEAAD', marginBottom: 4 }}>Krok {i + 1}. {t}</div>
                <p style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(255,255,255,0.72)', margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 'clamp(22px, 3vw, 36px)' }}>
          <FeatureGrid items={DOGANSWER.features} dark />

          <div style={{ margin: '28px 0 12px' }}><SectionTag dark>Jak to wygląda w praktyce</SectionTag></div>
          <UseCases items={DOGANSWER.useCases} dark />

          <div style={{ margin: '28px 0 12px' }}><SectionTag dark>Cennik</SectionTag></div>
          <PricingRow tiers={DOGANSWER.pricing} dark />

          <div style={{ marginTop: 22, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <a href={DOGANSWER.href} target="_blank" rel="noopener noreferrer" style={{ padding: '11px 22px', background: '#8EEAAD', color: '#07160f', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              Zobacz DogAnswer →
            </a>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              Chcesz usłyszeć jak brzmi? Zadzwoń na demo: <a href={`tel:${DOGANSWER.demo.replace(/\s/g, '')}`} style={{ color: '#8EEAAD', textDecoration: 'none', fontWeight: 600 }}>{DOGANSWER.demo}</a>
            </span>
          </div>
        </div>
      </article>

      {/* ---------------- CTA: rozwiązania dedykowane ---------------- */}
      <section style={{ padding: 'clamp(28px, 4vw, 44px)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 18 }}>
        <h2 style={{ fontSize: 'clamp(21px, 3vw, 28px)', fontWeight: 700, color: 'var(--color-text-1)', margin: '0 0 10px' }}>
          A jeśli potrzebujesz czegoś skrojonego na miarę?
        </h2>
        <p style={{ fontSize: 15.5, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 22px', maxWidth: 720 }}>
          Powyżej są gotowe produkty. Jeśli Twój proces wymaga własnej automatyzacji, integracji z
          Twoimi systemami albo aplikacji zbudowanej od zera - tym zajmuje się zespół Dogtronic
          (software house z Lublina). Napisz, opowiedz o problemie, a wspólnie sprawdzimy, czy da się
          go zautomatyzować.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Rozwiązanie%20dedykowane%20dla%20biznesu`} style={{ padding: '12px 24px', background: BRAND_GREEN, color: '#fff', borderRadius: 9, fontSize: 14.5, fontWeight: 600, textDecoration: 'none' }}>
            Napisz: {CONTACT_EMAIL}
          </a>
          <a href="https://dogtronic.io/kontakt/" target="_blank" rel="noopener noreferrer" style={{ padding: '12px 24px', background: 'transparent', color: 'var(--color-text-1)', border: '1px solid var(--color-border)', borderRadius: 9, fontSize: 14.5, fontWeight: 600, textDecoration: 'none' }}>
            Strona Dogtronic →
          </a>
        </div>
      </section>

      <p style={{ fontSize: 12, color: 'var(--color-text-3)', margin: '26px 0 0', lineHeight: 1.6 }}>
        Materiał informacyjny. DogInvoice i DogAnswer to produkty firmy Dogtronic Sp. z o.o. z Lublina.
        Nazwy, znaki towarowe, grafiki i ceny należą do ich właściciela i mogą się zmienić - aktualne
        warunki sprawdzisz na stronach produktów. wezmezadarmo prezentuje je jako przydatne narzędzia
        dla firm, bez wynagrodzenia za publikację.
      </p>
    </main>
  );
}
