import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API dla firm | wezmezadarmo',
  description: 'Baza 117 polskich swiadczen jako API dla software house\'ow, fintechow i instytucji. Licencjonowanie B2B, integracja REST, brak danych uzytkownikow.',
};

const EXAMPLE_REQUEST = `curl -X POST https://wezmezadarmo.com/api/verify \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: TWOJ_KLUCZ" \\
  -d '{
    "profile": {
      "wiek": 35,
      "plec": "K",
      "stanCywilny": "malzenstwo",
      "liczbaDzieci": 2,
      "wiekDzieci": [3, 7],
      "dochodMiesiecznie": 4500,
      "dochodNaOsobe": 1500,
      "zatrudnienie": "umowa_o_prace",
      "niepelnosprawnosc": "brak",
      "wlasnosc": "mieszkanie",
      "wojewodztwo": "mazowieckie",
      "prowadzDzialalnosc": false,
      "pierwszaDzialalnosc": false,
      "ciaza": false,
      "student": false,
      "emeryt": false,
      "rolnik": false,
      "bezrobotnyZarejestrowany": false
    }
  }'`;

const EXAMPLE_RESPONSE = `{
  "results": [
    {
      "benefit": {
        "id": "800-plus",
        "nazwa": "Swiadczenie wychowawcze 800+",
        "kategoria": "RODZINA",
        "kwota": "800 PLN/mies.",
        "wniosek": {
          "kanal": ["EMPATIA", "ePUAP"],
          "dokumenty": ["Dowod osobisty", "Akty urodzenia dzieci"],
          "kroki": ["Zaloguj sie do Emp@tia", "Wypelnij wniosek SW-1", "..."],
          "terminRealizacji": "do 3 miesiecy od zlozenia wniosku"
        }
      },
      "status": "PRZYSLUGUJE",
      "confidence": "WYSOKA",
      "matchedCriteria": ["Ma 2 dzieci ponizej 18 lat"],
      "failedCriteria": [],
      "warnings": []
    }
  ],
  "aiVerified": true
}`;

export default function DlaFirmPage() {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróć do strony głównej
        </Link>

        <div className="mb-8">
          <div className="text-[11px] font-mono tracking-widest text-text-3 uppercase mb-3">API / B2B</div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-text-1 mb-2">
            Baza świadczeń jako API
          </h1>
          <p className="text-[14px] text-text-3">
            wezmezadarmo.com &mdash; licencjonowanie dla firm
          </p>
        </div>

        <div className="space-y-10 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          {/* Oferta */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Co udostępniamy
            </h2>
            <div className="space-y-3">
              <p>
                Zbudowaliśmy bazę{' '}
                <strong className="text-text-1">117 polskich świadczeń socjalnych, ulg podatkowych i dotacji</strong>
                {' '}z oficjalnych źródeł rządowych (gov.pl, ZUS, NFZ, ARiMR, KRUS). Każde świadczenie ma
                zweryfikowane warunki kwalifikowalności, instrukcję krok po kroku i link do źródła.
              </p>
              <p>
                API udostępniamy na licencji B2B. Integracja REST, bez bazy danych użytkowników po
                naszej stronie -- dane wejściowe nie są zapisywane ani logowane.
              </p>
            </div>
          </section>

          {/* Przypadki uzycia */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Kto korzysta
            </h2>
            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <div className="font-mono text-[11px] text-accent tracking-widest uppercase mb-2">Oprogramowanie HR</div>
                <p className="text-[14px]">
                  Systemy kadrowe (np. przy onboardingu pracownika) mogą wyświetlać listę świadczeń,
                  do których kwalifikuje się nowy zatrudniony -- 500+, becikowe, ulga prorodzinna,
                  dofinansowanie do żłobka. Bez konieczności ręcznego sprawdzania przez HR.
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="font-mono text-[11px] text-accent tracking-widest uppercase mb-2">Fintech / bankowość</div>
                <p className="text-[14px]">
                  Aplikacje bankowe i fintechowe mogą wzbogacić profil klienta o informacje
                  o należnych mu świadczeniach -- przydatne przy scoringu kredytowym, onboardingu
                  i doradztwie finansowym. Klient wie, że ma stałe dochody ze świadczeń.
                </p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <div className="font-mono text-[11px] text-accent tracking-widest uppercase mb-2">OPS / instytucje pomocy spolecznej</div>
                <p className="text-[14px]">
                  Pracownicy Ośrodków Pomocy Społecznej i NGO mogą zintegrować bazę z wewnętrznym
                  systemem do obsługi klientów. Automatyczna weryfikacja kwalifikowalności zastępuje
                  ręczne sprawdzanie kilkudziesięciu stron rządowych.
                </p>
              </div>
            </div>
          </section>

          {/* API - jak dziala */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Jak działa API
            </h2>
            <div className="space-y-4">
              <p>
                Jeden endpoint: <code className="font-mono text-[13px] bg-surface-2 px-1.5 py-0.5 rounded text-accent">POST /api/verify</code>.
                Wysyłasz profil użytkownika (wiek, dochód, sytuacja rodzinna), otrzymujesz listę
                pasujących świadczeń ze statusem kwalifikowalności i instrukcją aplikacji.
              </p>
              <p>
                Pełna dokumentacja w formacie LLM-friendly:{' '}
                <a href="/llm.md" className="text-accent hover:underline">wezmezadarmo.com/llm.md</a>
              </p>

              <div>
                <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-2">Przykładowe zapytanie</div>
                <pre className="bg-bg-2 border border-border rounded-lg p-4 text-[12px] font-mono text-text-2 overflow-x-auto whitespace-pre leading-relaxed">
                  {EXAMPLE_REQUEST}
                </pre>
              </div>

              <div>
                <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-2">Przykładowa odpowiedź (skrócona)</div>
                <pre className="bg-bg-2 border border-border rounded-lg p-4 text-[12px] font-mono text-text-2 overflow-x-auto whitespace-pre leading-relaxed">
                  {EXAMPLE_RESPONSE}
                </pre>
              </div>

              <div className="border border-border rounded-lg p-4 space-y-2">
                <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-3">Parametry techniczne</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                  <span className="text-text-3">Autoryzacja</span>
                  <span className="font-mono text-text-1">X-API-Key: &lt;klucz&gt;</span>
                  <span className="text-text-3">Format</span>
                  <span className="font-mono text-text-1">JSON (REST)</span>
                  <span className="text-text-3">Protokół</span>
                  <span className="font-mono text-text-1">HTTPS</span>
                  <span className="text-text-3">CORS</span>
                  <span className="font-mono text-text-1">Wlaczony (*)</span>
                  <span className="text-text-3">Dane uzytkownika</span>
                  <span className="font-mono text-text-1">Nie zapisywane</span>
                  <span className="text-text-3">SLA</span>
                  <span className="font-mono text-text-1">Do ustalenia</span>
                </div>
              </div>
            </div>
          </section>

          {/* GDPR */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              RODO i ochrona danych
            </h2>
            <div className="space-y-3">
              <p>
                API nie przechowuje danych osobowych. Profil użytkownika wysłany w zapytaniu
                jest przetwarzany w pamięci (in-memory) i natychmiast usuwany po zwróceniu odpowiedzi.
                Nie prowadzimy bazy użytkowników, nie logujemy danych wejściowych.
              </p>
              <p>
                Dane wejściowe to dane anonimowe (wiek, dochód, sytuacja rodzinna) -- nie
                wymagamy PESEL ani żadnych danych identyfikujących. Administrator danych osobowych
                końcowego użytkownika pozostaje po stronie integratora (Twojej firmy).
              </p>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Licencjonowanie i kontakt
            </h2>
            <div className="space-y-3">
              <p>
                Oferujemy licencje miesięczne dla organizacji. Cena zależy od liczby zapytań
                i przypadku użycia. Napisz do nas -- wrócimy w ciągu 24 godzin roboczych.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:kontakt@wezmezadarmo.com"
                  className="inline-block bg-accent text-bg-0 font-semibold text-[14px] px-5 py-2.5 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  Napisz do nas
                </a>
              </div>
              <p className="text-[13px] text-text-3 pt-1">
                Możesz też sprawdzić dokumentację techniczną:{' '}
                <a href="/llm.md" className="text-accent hover:underline">llm.md</a>
                {' '}lub przetestować API bezpośrednio bez klucza (limity dotyczą pełnego ruchu produkcyjnego).
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
