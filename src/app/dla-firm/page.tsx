import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Współpraca B2B | wezmezadarmo.com',
  description:
    'Baza 117 polskich świadczeń socjalnych, ulg i dotacji dostępna jako API REST dla firm, NGO i instytucji. Bez przechowywania danych użytkowników. Integracja w jeden dzień.',
};

const EXAMPLE_REQUEST = `curl -X POST https://wezmezadarmo.com/api/verify \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: TWOJ_KLUCZ_API" \\
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
        "nazwa": "Świadczenie wychowawcze 800+",
        "kategoria": "RODZINA",
        "kwota": "800 PLN/mies.",
        "czestotliwosc": "miesięcznie",
        "wniosek": {
          "kanal": ["EMPATIA", "ePUAP"],
          "dokumenty": ["Dowód osobisty", "Akty urodzenia dzieci"],
          "kroki": [
            "Zaloguj się do portalu Emp@tia (empatia.mrpips.gov.pl)",
            "Wybierz wniosek SW-1",
            "Wypełnij dane dzieci i konto bankowe",
            "Prześlij elektronicznie (nie musisz iść do urzędu)"
          ],
          "terminRealizacji": "do 3 miesięcy od złożenia wniosku"
        },
        "zrodloUrl": "https://www.gov.pl/web/rodzina/800plus",
        "dataWeryfikacji": "2026-05-09"
      },
      "status": "PRZYSLUGUJE",
      "confidence": "WYSOKA",
      "matchedCriteria": ["Ma 2 dzieci poniżej 18 lat"],
      "failedCriteria": [],
      "warnings": []
    }
  ],
  "aiVerified": true
}`;

const PROFILE_FIELDS = [
  { pole: 'wiek', typ: 'number', opis: 'Wiek w latach', przyklad: '35' },
  { pole: 'plec', typ: '"K" | "M"', opis: 'Płeć: K = kobieta, M = mężczyzna', przyklad: '"K"' },
  { pole: 'stanCywilny', typ: 'string', opis: '"wolny" | "malzenstwo" | "rozwiedziony" | "wdowiec"', przyklad: '"malzenstwo"' },
  { pole: 'liczbaDzieci', typ: 'number', opis: 'Liczba dzieci poniżej 18 roku życia', przyklad: '2' },
  { pole: 'wiekDzieci', typ: 'number[]', opis: 'Wiek każdego dziecka (tablica)', przyklad: '[3, 7]' },
  { pole: 'dochodMiesiecznie', typ: 'number', opis: 'Łączny dochód netto gospodarstwa (PLN/mies.)', przyklad: '4500' },
  { pole: 'dochodNaOsobe', typ: 'number', opis: 'Dochód netto na osobę w gospodarstwie (PLN/mies.)', przyklad: '1500' },
  { pole: 'zatrudnienie', typ: 'string', opis: '"umowa_o_prace" | "dzialalnosc" | "umowa_zlecenie" | "bezrobotny" | "emeryt"', przyklad: '"umowa_o_prace"' },
  { pole: 'niepelnosprawnosc', typ: 'string', opis: '"brak" | "lekki" | "umiarkowany" | "znaczny"', przyklad: '"brak"' },
  { pole: 'wlasnosc', typ: 'string', opis: '"mieszkanie" | "dom" | "wynajem" | "rodzina"', przyklad: '"mieszkanie"' },
  { pole: 'wojewodztwo', typ: 'string', opis: 'Nazwa województwa (małymi literami, z myślnikami)', przyklad: '"mazowieckie"' },
  { pole: 'prowadzDzialalnosc', typ: 'boolean', opis: 'Czy prowadzi działalność gospodarczą', przyklad: 'false' },
  { pole: 'pierwszaDzialalnosc', typ: 'boolean', opis: 'Czy to pierwsza działalność gospodarcza', przyklad: 'false' },
  { pole: 'ciaza', typ: 'boolean', opis: 'Czy w ciąży (dotyczy kobiet)', przyklad: 'false' },
  { pole: 'student', typ: 'boolean', opis: 'Czy jest studentem', przyklad: 'false' },
  { pole: 'emeryt', typ: 'boolean', opis: 'Czy pobiera emeryturę lub rentę', przyklad: 'false' },
  { pole: 'rolnik', typ: 'boolean', opis: 'Czy jest rolnikiem ubezpieczonym w KRUS', przyklad: 'false' },
  { pole: 'bezrobotnyZarejestrowany', typ: 'boolean', opis: 'Czy jest zarejestrowany w urzędzie pracy (PUP)', przyklad: 'false' },
];

export default function DlaFirmPage() {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróć do strony głównej
        </Link>

        {/* Nagłówek */}
        <div className="mb-10">
          <div className="text-[11px] font-mono tracking-widest text-text-3 uppercase mb-3">Współpraca B2B</div>
          <h1 className="text-[24px] sm:text-[30px] font-bold text-text-1 mb-4 leading-tight">
            Baza polskich świadczeń<br />dla Twojej aplikacji
          </h1>
          <p className="text-[15px] text-text-2 leading-relaxed">
            117 zweryfikowanych świadczeń socjalnych, ulg podatkowych i dotacji z oficjalnych
            źródeł rządowych, dostępnych przez jedno wywołanie API. Twoja aplikacja pyta,
            my odpowiadamy, co danemu użytkownikowi przysługuje i jak to dostać.
          </p>
          <div className="mt-8 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', maxWidth: 520 }}>
            <a href="/automatyzacje" className="block rounded-xl border border-border bg-surface p-4 hover:border-green transition-colors no-underline">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-mono font-semibold shrink-0" style={{ background: '#0F1F14', color: '#8EEAAD' }}>A</span>
                <span className="text-[13px] font-semibold text-text-1">Automatyzacje AI</span>
              </div>
              <p className="text-[12px] text-text-3 leading-relaxed m-0">Faktury, raporty, dokumenty. Gotowe systemy od 399 PLN.</p>
            </a>
            <a href="/dla-firm#api" className="block rounded-xl border border-border bg-surface p-4 hover:border-green transition-colors no-underline">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-mono font-semibold shrink-0" style={{ background: '#0F1F14', color: '#8EEAAD' }}>B</span>
                <span className="text-[13px] font-semibold text-text-1">API świadczeń</span>
              </div>
              <p className="text-[12px] text-text-3 leading-relaxed m-0">Baza 117 świadczeń jako REST API do Twojej aplikacji.</p>
            </a>
          </div>
        </div>

        <div className="space-y-12 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          {/* Dla kogo */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Dla kogo to jest
            </h2>
            <div className="space-y-3">

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-9 h-9 rounded-full bg-[var(--green-950)] text-white flex items-center justify-center font-mono text-[13px] font-semibold shrink-0">H</span>
                  <div className="font-mono text-[13px] font-medium text-text-1">Oprogramowanie kadrowe i HR</div>
                </div>
                <p className="text-[14px] leading-relaxed mb-3">
                  Przy onboardingu nowego pracownika Twój system może automatycznie sprawdzić,
                  jakie świadczenia mu przysługują: świadczenie 800+ na dzieci, ulga
                  prorodzinna w PIT, dofinansowanie do żłobka z budżetu gminy, becikowe.
                  HR dostaje gotową listę zamiast odsyłać pracownika na rządowe strony.
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">onboarding</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">HR</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">kadry</span>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-9 h-9 rounded-full bg-[var(--green-950)] text-white flex items-center justify-center font-mono text-[13px] font-semibold shrink-0">F</span>
                  <div className="font-mono text-[13px] font-medium text-text-1">Aplikacje bankowe i fintech</div>
                </div>
                <p className="text-[14px] leading-relaxed mb-3">
                  Klient składa wniosek kredytowy. Twoja aplikacja w tle sprawdza, na jakie
                  regularne świadczenia się kwalifikuje: 800+, trzynasta emerytura, renta.
                  To realny, stały dochód, który powinien wchodzić do scoringu. Dodatkowo
                  doradztwo finansowe zyskuje nowy wymiar: "przysługuje Ci X, możesz to
                  przeznaczyć na nadpłatę kredytu".
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">fintech</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">scoring</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">kredyty</span>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-9 h-9 rounded-full bg-[var(--green-950)] text-white flex items-center justify-center font-mono text-[13px] font-semibold shrink-0">N</span>
                  <div className="font-mono text-[13px] font-medium text-text-1">Ośrodki Pomocy Społecznej i NGO</div>
                </div>
                <p className="text-[14px] leading-relaxed mb-3">
                  Pracownik socjalny obsługuje klienta. Zamiast ręcznie sprawdzać kilkadziesiąt
                  stron rządowych. Jedno zapytanie do API i gotowa lista świadczeń, do których
                  dana osoba się kwalifikuje, z instrukcją gdzie i jak złożyć wniosek.
                  Oszczędność czasu, mniej błędów, lepsza obsługa.
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">NGO</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">OPS</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-border rounded-full text-text-3">pomoc</span>
                </div>
              </div>

            </div>
          </section>

          {/* Jak to dziala */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Jak to działa
            </h2>
            <div className="space-y-4">
              <p>
                Jeden endpoint REST:{' '}
                <code className="font-mono text-[13px] bg-bg-2 px-1.5 py-0.5 rounded text-green border border-border">
                  POST /api/verify
                </code>
                . Wysyłasz profil użytkownika w formacie JSON, otrzymujesz listę
                świadczeń posortowaną według pewności dopasowania. Każde świadczenie
                zawiera kwotę, jak często jest wypłacane, jakie dokumenty są potrzebne
                i dokładną instrukcję składania wniosku krok po kroku.
              </p>
              <p>
                Dopasowanie działa dwuetapowo: najpierw deterministyczny algorytm
                sprawdza twarde warunki (wiek, dochód, liczba dzieci itd.), a następnie
                model językowy AI weryfikuje przypadki graniczne i dodaje ostrzeżenia
                tam, gdzie kwalifikowalność nie jest jednoznaczna.
              </p>

              <div>
                <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-2">Przykładowe zapytanie</div>
                <pre className="bg-bg-2 border border-border rounded-lg p-4 text-[12px] font-mono text-text-2 overflow-x-auto whitespace-pre leading-relaxed">
                  {EXAMPLE_REQUEST}
                </pre>
              </div>

              <div>
                <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-2">Przykładowa odpowiedź (jedno świadczenie ze skróconej listy)</div>
                <pre className="bg-bg-2 border border-border rounded-lg p-4 text-[12px] font-mono text-text-2 overflow-x-auto whitespace-pre leading-relaxed">
                  {EXAMPLE_RESPONSE}
                </pre>
              </div>
            </div>
          </section>

          {/* Pola profilu */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Pola profilu użytkownika
            </h2>
            <p className="mb-4 text-[14px]">
              Wszystkie pola są opcjonalne. Im więcej podasz, tym dokładniejsze dopasowanie.
              Minimalne zapytanie wystarczy z samym <code className="font-mono text-[13px] bg-bg-2 px-1 rounded border border-border text-green">wiek</code> i <code className="font-mono text-[13px] bg-bg-2 px-1 rounded border border-border text-green">plec</code>.
            </p>
            <div className="border border-border rounded-lg overflow-x-auto">
              <div className="min-w-[480px]">
                <div className="grid grid-cols-[1fr_1fr_2fr] bg-bg-2 border-b border-border px-4 py-2 font-mono text-[10px] tracking-widest uppercase text-text-3">
                  <span>Pole</span>
                  <span>Typ</span>
                  <span>Opis</span>
                </div>
                {PROFILE_FIELDS.map((f, i) => (
                  <div
                    key={f.pole}
                    className={`grid grid-cols-[1fr_1fr_2fr] px-4 py-2.5 text-[12px] border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg-2'}`}
                  >
                    <code className="font-mono text-green">{f.pole}</code>
                    <code className="font-mono text-text-3 text-[11px]">{f.typ}</code>
                    <span className="text-text-2 text-[12px]">{f.opis}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Odpowiedź */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Co zwraca API
            </h2>
            <div className="space-y-3">
              <p>Każde świadczenie w odpowiedzi zawiera:</p>
              <ul className="space-y-2 pl-1">
                {[
                  ['status', '"PRZYSLUGUJE" | "MOZLIWE" | "NIE_PRZYSLUGUJE" (pewność dopasowania)'],
                  ['confidence', '"WYSOKA" | "SREDNIA" | "NISKA" (jakość danych wejściowych)'],
                  ['matchedCriteria', 'lista warunków, które zostały spełnione'],
                  ['warnings', 'ostrzeżenia, np. "dochód blisko progu, sprawdź dokładnie"'],
                  ['wniosek.kroki', 'instrukcja krok po kroku jak złożyć wniosek'],
                  ['wniosek.dokumenty', 'lista wymaganych dokumentów'],
                  ['wniosek.kanal', 'gdzie złożyć: ePUAP, Emp@tia, ZUS, urząd gminy itd.'],
                  ['zrodloUrl', 'link do oficjalnego źródła rządowego'],
                  ['dataWeryfikacji', 'data ostatniej weryfikacji danych'],
                ].map(([pole, opis]) => (
                  <li key={pole} className="flex gap-3 text-[14px]">
                    <code className="font-mono text-green text-[12px] shrink-0 mt-0.5">{pole}</code>
                    <span className="text-text-2">{opis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Parametry techniczne */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Parametry techniczne
            </h2>
            <div className="border border-border rounded-lg overflow-hidden">
              {[
                ['Autoryzacja', 'Nagłówek X-API-Key lub Authorization: Bearer <klucz>'],
                ['Format', 'JSON / REST (HTTPS)'],
                ['CORS', 'Włączony (możesz wywoływać z frontendu lub backendu)'],
                ['Opóźnienie (p50)', 'ok. 200 ms samo dopasowanie; ok. 1,5 s z weryfikacją AI'],
                ['Dane użytkownika', 'Nie zapisywane, przetwarzane in-memory i usuwane po odpowiedzi'],
                ['Baza danych', 'Brak po naszej stronie; żadnych kont, żadnych logów'],
                ['Dostępność', 'Vercel Edge Network (hostowany w UE)'],
              ].map(([para, wartosc], i) => (
                <div
                  key={para}
                  className={`grid sm:grid-cols-[1fr_2fr] px-4 py-3 text-[13px] border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-bg-2'}`}
                >
                  <span className="text-text-3 font-medium">{para}</span>
                  <span className="text-text-1 font-mono text-[12px]">{wartosc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* RODO */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              RODO i ochrona danych
            </h2>
            <div className="space-y-3">
              <p>
                API nie przechowuje żadnych danych osobowych. Profil użytkownika wysłany
                w zapytaniu jest przetwarzany wyłącznie w pamięci operacyjnej serwera
                i usuwany natychmiast po zwróceniu odpowiedzi. Nie prowadzimy bazy
                użytkowników ani logów zapytań.
              </p>
              <p>
                Dane wejściowe (wiek, dochód, sytuacja rodzinna) są danymi anonimowymi.
                Nie wymagamy PESEL ani żadnych danych identyfikujących. Administratorem
                danych osobowych końcowego użytkownika pozostaje Twoja firma jako integrator,
                nie przenosimy tej odpowiedzialności na siebie.
              </p>
              <p>
                Dane dot. dochodu, sytuacji rodzinnej i niepełnosprawności mogą być
                uznane za dane wrażliwe w rozumieniu RODO art. 9, jeśli są powiązane
                z konkretną osobą po stronie integratora. Zalecamy ich anonimizację
                przed przesłaniem do API.
              </p>
            </div>
          </section>

          {/* Wycena */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Wycena i warunki współpracy
            </h2>
            <div className="space-y-3">
              <p>
                Każde wykorzystanie API przez podmiot zewnętrzny jest uzgadniane
                indywidualnie. Nie ma jednej stałej stawki. Warunki zależą od
                charakteru organizacji, liczby zapytań miesięcznie i sposobu użycia.
              </p>
              <p>
                Dla <strong className="text-text-1">fundacji i organizacji pozarządowych (NGO)</strong>{' '}
                działających na rzecz osób wykluczonych, seniorów, osób z niepełnosprawnościami
                lub rodzin w trudnej sytuacji: dostęp do API może być całkowicie bezpłatny.
                Decyzja jest podejmowana indywidualnie po zapoznaniu się z działalnością organizacji.
              </p>
              <p>
                Dla firm komercyjnych warunki finansowe są negocjowane w zależności od skali
                i przeznaczenia integracji.
              </p>
            </div>
          </section>

          {/* Zakaz nieuprawnionego uzycia */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Niedozwolone użycie
            </h2>
            <div className="space-y-3">
              <p>
                Korzystanie z API wezmezadarmo.com przez podmioty zewnętrzne bez uprzedniej
                pisemnej zgody autora jest <strong className="text-text-1">zabronione</strong>.
                Dotyczy to zarówno użycia komercyjnego, jak i integracyjnego.
              </p>
              <p>
                Zabronione jest również automatyczne pobieranie treści serwisu (web scraping,
                crawlowanie, skrypty masowe). Baza świadczeń, jej struktura i opisy stanowią
                autorskie dzieło Kamila Sobkowicza w rozumieniu ustawy o prawie autorskim
                i prawach pokrewnych.
              </p>
              <p>
                Szczegółowe postanowienia zawiera{' '}
                <a href="/regulamin" className="text-accent hover:underline">Regulamin serwisu (§ 9)</a>.
              </p>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-4">
              Kontakt
            </h2>
            <div className="space-y-4">
              <p>
                Napisz na adres poniżej z krótkim opisem przypadku użycia i szacowaną
                liczbą zapytań miesięcznie. Odpisuję w ciągu jednego dnia roboczego.
              </p>
              <div className="border border-border rounded-lg p-5 space-y-3">
                <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase">Kontakt</div>
                <div className="text-[15px]">
                  <span className="text-text-3 text-[13px]">e-mail: </span>
                  <a
                    href="mailto:sobkowicz.kamil@gmail.com"
                    className="text-accent hover:underline font-mono text-[14px]"
                  >
                    sobkowicz.kamil@gmail.com
                  </a>
                </div>
                <div className="text-[13px] text-text-3">
                  Kamil Sobkowicz, autor projektu wezmezadarmo.com
                </div>
              </div>
              <p className="text-[13px] text-text-3">
                Dokumentacja techniczna w formacie czytelnym dla modeli AI:{' '}
                <a href="/llm.md" className="text-accent hover:underline">wezmezadarmo.com/llm.md</a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
