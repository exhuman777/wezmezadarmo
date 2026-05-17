'use client';

import { useState } from 'react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// ZUS Eligibility Checker
// ---------------------------------------------------------------------------

type ZusVariant = 'preferencyjny' | 'maly_zus_plus' | 'duzy_zus' | null;

interface ZusResult {
  variant: ZusVariant;
  label: string;
  opis: string;
  szacunkowe_oszczednosci: string;
  uwaga: string;
  next_step: string;
}

const ZUS_RESULTS: Record<NonNullable<ZusVariant>, ZusResult> = {
  preferencyjny: {
    variant: 'preferencyjny',
    label: 'Preferencyjny ZUS',
    opis: 'Pierwsze 24 miesiące prowadzenia pierwszej działalności. Podstawa wymiaru to 30% minimalnego wynagrodzenia.',
    szacunkowe_oszczednosci: 'ok. 800–1100 PLN/mies. mniej niż Duży ZUS',
    uwaga: 'Dotyczy tylko pierwszej działalności. Po 24 mies. sprawdź czy kwalifikujesz się na Mały ZUS Plus.',
    next_step: 'Złóż DRA za miesiąc po rejestracji -- ZUS wyliczy składki automatycznie. Weryfikuj na zus.pl.',
  },
  maly_zus_plus: {
    variant: 'maly_zus_plus',
    label: 'Mały ZUS Plus',
    opis: 'Dla JDG które w poprzednim roku osiągnęły przychód poniżej obowiązującego limitu (sprawdź aktualny limit na zus.pl). Podstawa wymiaru to część dochodu z poprzedniego roku.',
    szacunkowe_oszczednosci: 'ok. 200–700 PLN/mies. mniej niż Duży ZUS (zależne od dochodu)',
    uwaga: 'Limit przychodu zmienia się co roku. Weryfikuj z księgowym lub na zus.pl przed złożeniem.',
    next_step: 'Złóż odpowiednie druki ZUS (ZZA, ZUA lub DRA z kodem 05 70) do końca stycznia. Terminy są nieprzekraczalne.',
  },
  duzy_zus: {
    variant: 'duzy_zus',
    label: 'Duży ZUS (pełne składki)',
    opis: 'Standardowe składki społeczne. Podstawa to min. 60% przeciętnego wynagrodzenia. Dotyczy większości przedsiębiorców po preferencyjnym okresie i przy wyższych dochodach.',
    szacunkowe_oszczednosci: 'Możliwa optymalizacja przez zmianę formy zatrudnienia lub spółki -- konsultuj z księgowym.',
    uwaga: 'Sprawdź czy nie kwalifikujesz się na Mały ZUS Plus -- wielu przedsiębiorców nie składa druków na czas i płaci więcej niż powinni.',
    next_step: 'Zweryfikuj swój przychód z poprzedniego roku i sprawdź limit Małego ZUS Plus na zus.pl.',
  },
};

function ZusKalkulator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    pierwsza: '',
    wiek_firmy: '',
    przychod: '',
  });
  const [result, setResult] = useState<ZusResult | null>(null);

  const questions = [
    {
      id: 'pierwsza',
      pytanie: 'Czy to Twoja pierwsza działalność gospodarcza?',
      opcje: [
        { value: 'tak', label: 'Tak -- pierwsza w życiu' },
        { value: 'nie', label: 'Nie -- prowadziłam/em wcześniej' },
      ],
    },
    {
      id: 'wiek_firmy',
      pytanie: 'Jak długo prowadzisz aktualną działalność?',
      opcje: [
        { value: 'ponizej_24', label: 'Mniej niż 24 miesiące' },
        { value: 'od_24_do_60', label: '24–60 miesięcy' },
        { value: 'powyzej_60', label: 'Ponad 5 lat' },
      ],
    },
    {
      id: 'przychod',
      pytanie: 'Jaki był Twój przychód z działalności w poprzednim roku kalendarzowym?',
      opcje: [
        { value: 'ponizej_limitu', label: 'Poniżej limitu Małego ZUS Plus (ok. 120 000 PLN -- sprawdź aktualny na zus.pl)' },
        { value: 'powyzej_limitu', label: 'Powyżej tego limitu lub nie wiem' },
      ],
    },
  ];

  const currentQ = questions[step];

  function handleAnswer(value: string) {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      if (newAnswers.pierwsza === 'tak' && newAnswers.wiek_firmy === 'ponizej_24') {
        setResult(ZUS_RESULTS.preferencyjny);
      } else if (newAnswers.przychod === 'ponizej_limitu') {
        setResult(ZUS_RESULTS.maly_zus_plus);
      } else {
        setResult(ZUS_RESULTS.duzy_zus);
      }
    }
  }

  function reset() {
    setStep(0);
    setAnswers({ pierwsza: '', wiek_firmy: '', przychod: '' });
    setResult(null);
  }

  const variantColors: Record<NonNullable<ZusVariant>, string> = {
    preferencyjny: 'border-green-border bg-green-bg text-green',
    maly_zus_plus: 'border-green-border bg-green-bg text-green',
    duzy_zus: 'border-amber-border bg-amber-bg text-warn',
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-bg-2 border-b border-border px-5 py-3 flex items-center justify-between">
        <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase">
          Kalkulator ZUS dla JDG -- bezpłatny
        </div>
        {(step > 0 || result) && (
          <button onClick={reset} className="text-[12px] text-accent hover:underline font-mono">
            zacznij od nowa
          </button>
        )}
      </div>

      <div className="p-5">
        {!result ? (
          <div className="space-y-4">
            <div className="flex gap-1.5 mb-5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= step ? 'bg-accent' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-2">
              Pytanie {step + 1} z {questions.length}
            </div>
            <p className="text-[15px] font-medium text-text-1 leading-snug mb-4">
              {currentQ.pytanie}
            </p>
            <div className="space-y-2">
              {currentQ.opcje.map((o) => (
                <button
                  key={o.value}
                  onClick={() => handleAnswer(o.value)}
                  className="w-full text-left border border-border rounded-lg px-4 py-3 text-[14px] text-text-2 hover:border-accent hover:text-text-1 hover:bg-accent-soft transition-colors"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`rounded-lg border px-5 py-4 ${variantColors[result.variant!]}`}>
              <div className="font-mono text-[11px] tracking-widest uppercase mb-1 opacity-70">
                Prawdopodobny wariant
              </div>
              <div className="text-[18px] font-bold mb-2">{result.label}</div>
              <p className="text-[13px] leading-relaxed opacity-80">{result.opis}</p>
            </div>

            <div className="border border-border rounded-lg px-5 py-4 space-y-3">
              <div>
                <div className="font-mono text-[10px] text-text-3 tracking-widest uppercase mb-1">
                  Szacunkowe oszczędności
                </div>
                <p className="text-[14px] text-text-1 font-medium">{result.szacunkowe_oszczednosci}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] text-text-3 tracking-widest uppercase mb-1">
                  Następny krok
                </div>
                <p className="text-[13px] text-text-2 leading-relaxed">{result.next_step}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-[12px] text-text-3 leading-relaxed">
                  <span className="text-warn font-medium">Uwaga: </span>
                  {result.uwaga} To narzędzie nie zastępuje porady księgowego ani ZUS. Weryfikuj zawsze przed złożeniem druków.
                </p>
              </div>
            </div>

            <div className="border border-border rounded-lg px-5 py-4 bg-bg-2">
              <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-3">
                Masz pytania? Napisz do nas.
              </div>
              <p className="text-[13px] text-text-2 mb-3">
                Pomagamy też zautomatyzować faktury, raporty i inne powtarzalne zadania -- żeby ZUS był Twoim jedynym problemem.
              </p>
              <a href="#kontakt" className="inline-block text-[13px] font-mono text-accent hover:underline">
                Napisz do nas --&gt;
              </a>
            </div>

            <button onClick={reset} className="text-[12px] text-text-3 hover:text-text-2 hover:underline font-mono">
              Sprawdź ponownie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contact / Order form
// ---------------------------------------------------------------------------

function KontaktForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ imie: '', email: '', firma: '', opis: '' });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const subject = encodeURIComponent(`Automatyzacja AI -- zapytanie od ${form.imie} (${form.firma})`);
    const body = encodeURIComponent(
      `Imię: ${form.imie}\nEmail: ${form.email}\nFirma: ${form.firma}\n\nOpis:\n${form.opis}`
    );
    window.location.href = `mailto:sobkowicz.kamil@gmail.com?subject=${subject}&body=${body}`;
    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-green-border bg-green-bg rounded-lg px-5 py-6 text-center">
        <div className="font-mono text-[11px] text-green tracking-widest uppercase mb-2">Gotowe</div>
        <p className="text-[14px] text-text-2">
          Otworzył się Twój klient pocztowy z gotową wiadomością. Wyślij ją i odezwiemy się w ciągu jednego dnia roboczego.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-[11px] text-text-3 tracking-widest uppercase block mb-1.5">
            Imię i nazwisko
          </label>
          <input
            type="text"
            required
            value={form.imie}
            onChange={e => setForm({ ...form, imie: e.target.value })}
            className="w-full bg-bg-2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text-1 font-mono placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors"
            placeholder="Jan Kowalski"
          />
        </div>
        <div>
          <label className="font-mono text-[11px] text-text-3 tracking-widest uppercase block mb-1.5">
            Adres e-mail
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full bg-bg-2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text-1 font-mono placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors"
            placeholder="jan@firma.pl"
          />
        </div>
      </div>

      <div>
        <label className="font-mono text-[11px] text-text-3 tracking-widest uppercase block mb-1.5">
          Nazwa firmy (opcjonalnie)
        </label>
        <input
          type="text"
          value={form.firma}
          onChange={e => setForm({ ...form, firma: e.target.value })}
          className="w-full bg-bg-2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text-1 font-mono placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors"
          placeholder="Firma sp. z o.o."
        />
      </div>

      <div>
        <label className="font-mono text-[11px] text-text-3 tracking-widest uppercase block mb-1.5">
          Co chcesz zautomatyzować?
        </label>
        <textarea
          required
          value={form.opis}
          onChange={e => setForm({ ...form, opis: e.target.value })}
          rows={4}
          className="w-full bg-bg-2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text-1 font-mono placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Np. co tydzień ręcznie przepisuję faktury do arkusza... albo odpisuję na te same pytania w mailach..."
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full sm:w-auto bg-accent text-bg-0 font-mono text-[13px] tracking-wide px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {sending ? 'Otwieranie...' : 'Wyślij zapytanie'}
      </button>

      <p className="text-[12px] text-text-3">
        Odpowiedź w ciągu jednego dnia roboczego. Bez sprzedaży, bez dripsowania -- tylko konkretna rozmowa o Twojej sytuacji.
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Prompt Pack
// ---------------------------------------------------------------------------

const PROMPTS = [
  {
    tytul: 'Odpowiedź na zapytanie ofertowe',
    kontekst: 'Klient pyta o cenę i termin',
    prompt: `Jesteś ekspertem w branży [TWOJA BRANŻA]. Napisz profesjonalną odpowiedź na poniższe zapytanie ofertowe. Ton: rzeczowy, konkretny, bez sprzedażowej ściemy. Zawrzyj: krótkie potwierdzenie rozumienia potrzeby, wycenę w przedziale [MIN PLN]–[MAX PLN] z uzasadnieniem, proponowany termin realizacji, następny krok (np. krótka rozmowa 15 min). Maksymalnie 180 słów.

Zapytanie: [WKLEJ TREŚĆ MAILA]`,
  },
  {
    tytul: 'Odpowiedź na negatywną recenzję',
    kontekst: 'Klient zostawił 1–2 gwiazdki w Google',
    prompt: `Napisz profesjonalną odpowiedź na poniższą recenzję w imieniu firmy [NAZWA FIRMY]. Zasady: nie broń się, przyjmij feedback, zaproponuj konkretne działanie naprawcze, zakończ zaproszeniem do kontaktu. Maksymalnie 80 słów. Bez trzykrotnego przepraszania.

Recenzja: [WKLEJ RECENZJĘ]`,
  },
  {
    tytul: 'Instrukcja dla nowego pracownika',
    kontekst: 'Onboarding, powtarzalne zadania',
    prompt: `Na podstawie poniższego opisu stanowiska i zadań napisz klarowną, krok po kroku instrukcję dla nowego pracownika który zaczyna w poniedziałek. Format: lista numerowana, maksymalnie 3 linijki na krok, bez zbędnych słów. Język: polski, nieformalny, ale profesjonalny.

Stanowisko i zadania: [OPISZ]`,
  },
  {
    tytul: 'Podsumowanie spotkania',
    kontekst: 'Po call z klientem lub zespołem',
    prompt: `Przekształć poniższe notatki ze spotkania w profesjonalne podsumowanie do wysłania uczestnikom. Struktura: 1) Ustalenia (lista), 2) Kto co robi i do kiedy (tabela), 3) Następne spotkanie (jeśli ustalone). Maksymalnie 200 słów.

Notatki: [WKLEJ LUB PODYKTUJ]`,
  },
  {
    tytul: 'Opis produktu/usługi na stronę',
    kontekst: 'Copywriting bez płatnej agencji',
    prompt: `Napisz opis [PRODUKTU/USŁUGI] na stronę internetową. Grupa docelowa: [OPIS KLIENTA]. Główna korzyść: [CO KLIENT ZYSKUJE]. Format: nagłówek (maks. 8 słów) + 3 zdania opisu + 3 korzyści w punktach + CTA (1 zdanie). Język: konkretny, bez "najwyższej jakości" i "kompleksowych rozwiązań".`,
  },
  {
    tytul: 'Windykacja -- przypomnienie o płatności',
    kontekst: 'Faktura przeterminowana 7–30 dni',
    prompt: `Napisz grzeczne, ale stanowcze przypomnienie o nieuregulowanej płatności. Dane: faktura nr [NR], kwota [SUMA PLN], termin płatności [DATA]. Ton: profesjonalny, nie agresywny, ale bez przepraszania za wysłanie przypomnienia. Maksymalnie 60 słów. Zakończ konkretnym działaniem do podjęcia.`,
  },
  {
    tytul: 'Analiza umowy -- czerwone flagi',
    kontekst: 'Przed podpisaniem z klientem lub dostawcą',
    prompt: `Przeanalizuj poniższą umowę i wylistuj: 1) Klauzule niekorzystne dla [MOJA STRONA: klient/wykonawca], 2) Brakujące zabezpieczenia, 3) Niejasne zapisy wymagające doprecyzowania. Format: lista numerowana, 1–2 zdania na punkt. Nie jestem prawnikiem -- weryfikuję potem z adwokatem.

Umowa: [WKLEJ TEKST]`,
  },
  {
    tytul: 'Post na LinkedIn -- case study klienta',
    kontekst: 'Marketing bez płatnego copywritera',
    prompt: `Napisz post na LinkedIn o tym jak pomogłam/em klientowi [KRÓTKI OPIS PROBLEMU] osiągnąć [KONKRETNY WYNIK]. Format: hook (1 zdanie, bez "Jestem podekscytowany"), historia (3–4 zdania), lesson learned (1 zdanie), CTA (pytanie do czytelników). Bez banalnych hashtagów. Maksymalnie 200 słów.`,
  },
  {
    tytul: 'Warunki współpracy -- wersja robocza',
    kontekst: 'Zanim zaangażujesz prawnika',
    prompt: `Przygotuj wersję roboczą warunków współpracy (term sheet) dla projektu [OPIS]. Strony: [TWOJA FIRMA] i [KLIENT]. Uwzględnij: zakres prac, termin, płatności i harmonogram, prawa autorskie, kary umowne, zasady zmian w projekcie. Format: krótkie punkty, język prosty. To szkic do weryfikacji przez prawnika.`,
  },
  {
    tytul: 'Oferta handlowa jako PDF-ready dokument',
    kontekst: 'Profesjonalna oferta w 10 minut',
    prompt: `Przygotuj profesjonalną ofertę handlową dla klienta [NAZWA/BRANŻA]. Projekt: [OPIS]. Struktura: streszczenie (2 zdania), zakres prac (lista), harmonogram (tabela: etap / czas / koszt), warunki płatności, gwarancja i wsparcie, następny krok. Ton: ekspercki, bez zbędnych pochlebstw. Dane do wstawienia: [PODAJ WARTOŚCI].`,
  },
];

function PromptPack() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  function copyPrompt(i: number, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-2">
      {PROMPTS.map((p, i) => (
        <div key={i} className="border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-bg-2 transition-colors"
          >
            <div>
              <span className="font-mono text-[10px] text-text-3 mr-3">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[14px] font-medium text-text-1">{p.tytul}</span>
              <span className="text-[12px] text-text-3 ml-3">-- {p.kontekst}</span>
            </div>
            <span className="font-mono text-[12px] text-accent ml-2 shrink-0">
              {expanded === i ? '[-]' : '[+]'}
            </span>
          </button>

          {expanded === i && (
            <div className="border-t border-border bg-bg-2 p-4 space-y-3">
              <pre className="font-mono text-[12px] text-text-2 whitespace-pre-wrap leading-relaxed">
                {p.prompt}
              </pre>
              <button
                onClick={() => copyPrompt(i, p.prompt)}
                className="font-mono text-[11px] border border-border rounded px-3 py-1.5 text-text-3 hover:border-accent hover:text-accent transition-colors"
              >
                {copied === i ? 'Skopiowano!' : 'Kopiuj prompt'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AutomatyzacjePage() {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block font-mono">
          &larr; wezmezadarmo.com
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-4">
            AI dla polskiego przedsiębiorcy
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-text-1 leading-tight mb-4">
            Twoja firma traci kilkanaście godzin miesięcznie na powtarzalne zadania.
            <span className="text-accent"> Można to naprawić.</span>
          </h1>
          <p className="text-[15px] sm:text-[16px] text-text-2 leading-relaxed mb-6">
            Faktury, raporty, oferty, maile -- to nie wymaga Twoich godzin. Wymaga dobrego systemu.
            Budujemy konkretne automatyzacje AI dla polskich JDG i małych spółek. Nie &quot;consulting&quot;. Działające narzędzia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#kalkulator-zus"
              className="inline-block bg-bg-2 border border-border text-text-1 font-mono text-[13px] tracking-wide px-5 py-3 rounded-lg hover:border-accent hover:text-accent transition-colors text-center"
            >
              Kalkulator ZUS -- bezpłatnie
            </a>
            <a
              href="#kontakt"
              className="inline-block bg-accent text-bg-0 font-mono text-[13px] tracking-wide px-5 py-3 rounded-lg hover:bg-accent-hover transition-colors text-center"
            >
              Zamów automatyzację -- 1200 PLN
            </a>
          </div>
        </div>

        {/* Problem statement */}
        <div className="mb-12 border border-border rounded-lg divide-y divide-border">
          {[
            ['Faktury', '4–6 godz./tyg. na ręczne przepisywanie danych do arkuszy i programów księgowych.'],
            ['Oferty', 'Każde zapytanie ofertowe -- od nowa. Te same pytania, te same odpowiedzi, inny klient.'],
            ['Raporty', 'Poniedziałek rano: zbierasz dane z pięciu miejsc żeby zrobić raport o poprzednim tygodniu.'],
            ['ZUS / księgowość', 'Każdy miesiąc: czy już zmienić wariant ZUS? Czy się kwalifikuję? Ile zapłacić?'],
          ].map(([tytul, opis]) => (
            <div key={tytul} className="px-5 py-4 grid grid-cols-[1fr_3fr] gap-4">
              <div className="font-mono text-[12px] text-accent font-medium pt-0.5">{tytul}</div>
              <div className="text-[13px] text-text-2 leading-relaxed">{opis}</div>
            </div>
          ))}
        </div>

        {/* FREE: ZUS Kalkulator */}
        <section id="kalkulator-zus" className="mb-12 scroll-mt-8">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-2">
            Bezpłatne narzędzie nr 1
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-bold text-text-1 mb-2">
            Kalkulator ZUS -- który wariant Ci przysługuje?
          </h2>
          <p className="text-[14px] text-text-2 mb-5 leading-relaxed">
            3 pytania. Dowiesz się czy płacisz za dużo i co z tym zrobić. Żadnych danych osobowych, żadnego rejestrowania się.
          </p>
          <ZusKalkulator />
        </section>

        {/* FREE: Prompt Pack */}
        <section id="prompty" className="mb-12 scroll-mt-8">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-2">
            Bezpłatny zestaw nr 2 -- do skopiowania
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-bold text-text-1 mb-2">
            10 gotowych promptów AI dla polskiej firmy
          </h2>
          <p className="text-[14px] text-text-2 mb-5 leading-relaxed">
            Kopiuj, wklej do Claude lub ChatGPT, podmień dane w nawiasach. Każdy oszczędza 30–90 minut roboty.
            Bez rejestracji, bez maila -- po prostu użyj.
          </p>
          <PromptPack />
          <p className="mt-4 text-[12px] text-text-3">
            Te prompty to punkt wyjścia. Jeżeli chcesz żeby cały przepływ działał automatycznie -- bez kopiowania, bez ręcznej pracy -- to jest właśnie to, co robimy płatnie.
          </p>
        </section>

        {/* PAID: Automat Fakturowy */}
        <section id="automat-fakturowy" className="mb-12 scroll-mt-8">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-2">
            Automatyzacja do kupienia
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-bold text-text-1 mb-2">
            Automat Fakturowy
          </h2>
          <p className="text-[14px] text-text-2 mb-6 leading-relaxed">
            Faktura przychodzi mailem. Automat czyta ją, wyciąga dane, wpisuje do arkusza (lub do iFirmy / Fakturowni) i wysyła Ci tygodniowe podsumowanie. Bez dotykania. Raz skonfigurowany, działa sam.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-border rounded-lg p-4">
              <div className="font-mono text-[10px] text-text-3 tracking-widest uppercase mb-3">Teraz</div>
              <div className="font-mono text-[12px] text-text-2 space-y-1.5">
                <div className="text-red">  [mail od dostawcy]</div>
                <div className="text-text-3">       v</div>
                <div>  [otwierasz PDF]</div>
                <div className="text-text-3">       v</div>
                <div>  [przepisujesz ręcznie]</div>
                <div className="text-text-3">       v</div>
                <div>  [wpisujesz do arkusza]</div>
                <div className="text-text-3">       v</div>
                <div>  [zapomniałeś o jednej]</div>
                <div className="text-text-3">       v</div>
                <div className="text-red">  [30–90 min stracone]</div>
              </div>
            </div>
            <div className="border border-green-border rounded-lg p-4">
              <div className="font-mono text-[10px] text-green tracking-widest uppercase mb-3">Po automatyzacji</div>
              <div className="font-mono text-[12px] text-text-2 space-y-1.5">
                <div className="text-green">  [mail od dostawcy]</div>
                <div className="text-text-3">       v</div>
                <div>  [automat czyta PDF]</div>
                <div className="text-text-3">       v</div>
                <div>  [wyciąga: nr faktury,</div>
                <div>   kwota, NIP, termin]</div>
                <div className="text-text-3">       v</div>
                <div>  [wpisuje do arkusza]</div>
                <div className="text-text-3">       v</div>
                <div className="text-green">  [Ty: nic nie robisz]</div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg divide-y divide-border mb-6">
            <div className="px-5 py-3 bg-bg-2">
              <div className="font-mono text-[10px] text-text-3 tracking-widest uppercase">Co zawiera</div>
            </div>
            {[
              ['Konfiguracja', 'Ustawiam automat pod Twój e-mail i typ faktur (PDF, skany, faktury elektroniczne). Czas: 5–7 dni roboczych.'],
              ['Integracja', 'Arkusz Google Sheets (standardowo) lub iFirma / Fakturownia (jeżeli masz konto). Bez instalowania czegokolwiek na Twoim komputerze.'],
              ['Podsumowania', 'Tygodniowy raport mailowy: co wpłynęło, co jest do zapłaty, co już zapłacone.'],
              ['Wsparcie', '30 dni wsparcia w cenie. Jeżeli coś nie działa -- naprawiam.'],
              ['Szkolenie', '30-minutowa rozmowa przez Zoom: pokazuję jak to sprawdzić i jak zgłaszać błędy.'],
            ].map(([k, v]) => (
              <div key={k} className="px-5 py-3.5 grid grid-cols-[1fr_3fr] gap-4">
                <div className="font-mono text-[12px] text-accent font-medium">{k}</div>
                <div className="text-[13px] text-text-2 leading-relaxed">{v}</div>
              </div>
            ))}
          </div>

          <div className="border border-accent-soft bg-accent-soft rounded-lg px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-1">Cena</div>
              <div className="text-[28px] font-bold text-text-1">1 200 PLN</div>
              <div className="text-[13px] text-text-3">jednorazowo, netto. Brak abonamentu.</div>
            </div>
            <a
              href="#kontakt"
              className="inline-block bg-accent text-bg-0 font-mono text-[13px] tracking-wide px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors text-center"
            >
              Zamów automatyzację
            </a>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-2">Jak wygląda współpraca</div>
          <h2 className="text-[20px] font-bold text-text-1 mb-5">3 kroki</h2>
          <div className="space-y-3">
            {[
              ['01', 'Rozmowa', '30 minut. Pokazujesz mi jak wygląda Twój e-mail, jakie faktury dostajesz, gdzie chcesz mieć dane. Ustalamy co dokładnie ma robić automat.'],
              ['02', 'Konfiguracja', '5–7 dni roboczych. Buduję i testuję na prawdziwych fakturach (anonimizujemy jeśli wolisz). Przez cały czas masz dostęp do postępów.'],
              ['03', 'Przekazanie', 'Zoom 30 minut: pokaz tego co zbudowałem, szkolenie jak to sprawdzać, 30 dni wsparcia w razie pytań.'],
            ].map(([nr, tytul, opis]) => (
              <div key={nr} className="border border-border rounded-lg px-5 py-4 grid grid-cols-[2rem_1fr] gap-4">
                <div className="font-mono text-[18px] font-bold text-accent">{nr}</div>
                <div>
                  <div className="font-medium text-[15px] text-text-1 mb-1">{tytul}</div>
                  <div className="text-[13px] text-text-2 leading-relaxed">{opis}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-2">FAQ</div>
          <div className="border border-border rounded-lg divide-y divide-border">
            {[
              ['Czy potrzebuję programisty lub wiedzy technicznej?', 'Nie. Konfiguruję wszystko za Ciebie. Ty tylko pokazujesz e-mail i mówisz co chcesz osiągnąć.'],
              ['Co jeśli faktury są w różnych formatach?', 'AI radzi sobie z większością formatów PDF. Przy skanach o niskiej jakości może być problem -- omawiam to na rozmowie wstępnej.'],
              ['Czy moje dane są bezpieczne?', 'Automat działa na Twoim koncie Google (Sheets) lub koncie księgowym. Nie przechowuję faktur u siebie ani na zewnętrznych serwerach.'],
              ['Co jeśli coś przestanie działać po 30 dniach wsparcia?', 'Oferuję plany wsparcia po 199 PLN/mies. lub naprawy ad-hoc. Ale większość automatyzacji działa bezobsługowo przez miesiące.'],
              ['Czy można zautomatyzować też inne rzeczy?', 'Tak. Raporty tygodniowe, odpowiedzi na maile, generowanie ofert, windykacja -- pytaj na rozmowie co Cię boli najbardziej.'],
            ].map(([q, a]) => (
              <div key={q} className="px-5 py-4">
                <div className="font-medium text-[14px] text-text-1 mb-1.5">{q}</div>
                <div className="text-[13px] text-text-2 leading-relaxed">{a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="kontakt" className="scroll-mt-8">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-2">Kontakt</div>
          <h2 className="text-[20px] font-bold text-text-1 mb-2">Napisz co chcesz zautomatyzować</h2>
          <p className="text-[14px] text-text-2 mb-6 leading-relaxed">
            Opisz w kilku zdaniach które zadanie zjada Ci najwięcej czasu. Odpiszemy z konkretną propozycją -- bez sprzedażowej ściemy.
          </p>
          <KontaktForm />
          <div className="mt-6 border-t border-border pt-6">
            <p className="text-[13px] text-text-3">
              Preferujesz mail?{' '}
              <a href="mailto:sobkowicz.kamil@gmail.com" className="text-accent hover:underline font-mono">
                sobkowicz.kamil@gmail.com
              </a>
              <span className="mx-2 text-border">|</span>
              <a href="/dla-firm" className="text-accent hover:underline">
                API dla deweloperów i firm --&gt;
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
