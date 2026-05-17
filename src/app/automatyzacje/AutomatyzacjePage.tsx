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
    opis: 'Pierwsze 24 miesiace prowadzenia pierwszej dzialalnosci. Podstawa wymiaru to 30% minimalnego wynagrodzenia.',
    szacunkowe_oszczednosci: 'ok. 800-1100 PLN/mies. mniej niz Duzy ZUS',
    uwaga: 'Dotyczy tylko pierwszej dzialalnosci. Po 24 mies. sprawdz czy kwalifikujesz sie na Maly ZUS Plus.',
    next_step: 'Zloz DRA za miesiac po rejestracji -- ZUS wyliczy sk ladki automatycznie. Weryfikuj na zus.pl.',
  },
  maly_zus_plus: {
    variant: 'maly_zus_plus',
    label: 'Maly ZUS Plus',
    opis: 'Dla JDG ktore w poprzednim roku osiagnely przychod ponizej obowiazujacego limitu (sprawdz aktualny limit na zus.pl). Podstawa wymiaru to czesd dochodu z poprzedniego roku.',
    szacunkowe_oszczednosci: 'ok. 200-700 PLN/mies. mniej niz Duzy ZUS (zalezne od dochodu)',
    uwaga: 'Limit przychodu zmienia sie co roku. Weryfikuj z ksiegowym lub na zus.pl przed zlozeniem.',
    next_step: 'Zloz odpowiednie druki ZUS (ZZA, ZUA lub DRA z kodem 05 70) do konca stycznia. Terminy sa nieprzekraczalne.',
  },
  duzy_zus: {
    variant: 'duzy_zus',
    label: 'Duzy ZUS (pelne skladki)',
    opis: 'Standardowe sk ladki spoleczne. Podstawa to min. 60% przecietnego wynagrodzenia. Dotyczy wiekszosci przedsiebiorców po preferencyjnym okresie i przy wyzszych dochodach.',
    szacunkowe_oszczednosci: 'Mozliwa optymalizacja przez zmiane formy zatrudnienia lub spolki -- konsultuj z ksiegowym.',
    uwaga: 'Sprawdz czy nie kwalifikujesz sie na Maly ZUS Plus -- wielu przedsiebiorców nie sklada drukow na czas i placi wiecej niz powinni.',
    next_step: 'Weryfikuj swoj przychod z poprzedniego roku i sprawdz limit Malego ZUS Plus na zus.pl.',
  },
};

function ZusKalkulator() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    pierwsza: '',     // first business ever?
    wiek_firmy: '',   // how long running
    przychod: '',     // revenue range
  });
  const [result, setResult] = useState<ZusResult | null>(null);

  function oblicz(): ZusResult {
    // First business + under 24 months = preferencyjny
    if (answers.pierwsza === 'tak' && answers.wiek_firmy === 'ponizej_24') {
      return ZUS_RESULTS.preferencyjny;
    }
    // Low revenue = potentially Maly ZUS Plus
    if (answers.przychod === 'ponizej_limitu') {
      return ZUS_RESULTS.maly_zus_plus;
    }
    return ZUS_RESULTS.duzy_zus;
  }

  const questions = [
    {
      id: 'pierwsza',
      pytanie: 'Czy to Twoja pierwsza dzialalnosc gospodarcza?',
      opcje: [
        { value: 'tak', label: 'Tak -- pierwsza w zyciu' },
        { value: 'nie', label: 'Nie -- prowadzilam/em wczesniej' },
      ],
    },
    {
      id: 'wiek_firmy',
      pytanie: 'Jak dlugo prowadzisz aktualna dzialalnosc?',
      opcje: [
        { value: 'ponizej_24', label: 'Mniej niz 24 miesiace' },
        { value: 'od_24_do_60', label: '24-60 miesiecy' },
        { value: 'powyzej_60', label: 'Ponad 5 lat' },
      ],
    },
    {
      id: 'przychod',
      pytanie: 'Jaki byl Twoj przychod z dzialalnosci w poprzednim roku kalendarzowym?',
      opcje: [
        { value: 'ponizej_limitu', label: 'Ponizej limitu Malego ZUS Plus (ok. 120 000 PLN -- sprawdz aktualny na zus.pl)' },
        { value: 'powyzej_limitu', label: 'Powyzej tego limitu lub nie wiem' },
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
      // Recalculate with updated answers
      const final = {
        pierwsza: newAnswers.pierwsza,
        wiek_firmy: newAnswers.wiek_firmy,
        przychod: newAnswers.przychod,
      };
      if (final.pierwsza === 'tak' && final.wiek_firmy === 'ponizej_24') {
        setResult(ZUS_RESULTS.preferencyjny);
      } else if (final.przychod === 'ponizej_limitu') {
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
          Kalkulator ZUS dla JDG -- bezplatny
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
            {/* Progress */}
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
                  Szacunkowe oszczednosci
                </div>
                <p className="text-[14px] text-text-1 font-medium">{result.szacunkowe_oszczednosci}</p>
              </div>
              <div>
                <div className="font-mono text-[10px] text-text-3 tracking-widest uppercase mb-1">
                  Nastepny krok
                </div>
                <p className="text-[13px] text-text-2 leading-relaxed">{result.next_step}</p>
              </div>
              <div className="border-t border-border pt-3">
                <p className="text-[12px] text-text-3 leading-relaxed">
                  <span className="text-warn font-medium">Uwaga: </span>
                  {result.uwaga} To narzedzie nie zastepuje porady ksiegowego ani ZUS. Weryfikuj zawsze przed zlozeniem drukow.
                </p>
              </div>
            </div>

            <div className="border border-border rounded-lg px-5 py-4 bg-bg-2">
              <div className="font-mono text-[11px] text-text-3 tracking-widest uppercase mb-3">
                Masz pytania? Napisz do nas.
              </div>
              <p className="text-[13px] text-text-2 mb-3">
                Pomagamy tez zautomatyzowac faktury, raporty i inne powtarzalne zadania -- zeby ZUS to byl Twoj jedyny problem.
              </p>
              <a
                href="#kontakt"
                className="inline-block text-[13px] font-mono text-accent hover:underline"
              >
                Napisz do nas --&gt;
              </a>
            </div>

            <button
              onClick={reset}
              className="text-[12px] text-text-3 hover:text-text-2 hover:underline font-mono"
            >
              Sprawdz ponownie
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
    // Simple mailto fallback -- no backend required for MVP
    const subject = encodeURIComponent(`Automatyzacja AI -- zapytanie od ${form.imie} (${form.firma})`);
    const body = encodeURIComponent(
      `Imie: ${form.imie}\nEmail: ${form.email}\nFirma: ${form.firma}\n\nOpis:\n${form.opis}`
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
          Otworzyl sie Twoj klient pocztowy z gotowa wiadomoscia. Wyslij ja i odezwiemy sie w ciagu jednego dnia roboczego.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-[11px] text-text-3 tracking-widest uppercase block mb-1.5">
            Imie i nazwisko
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
          Co chcesz zautomatyzowac?
        </label>
        <textarea
          required
          value={form.opis}
          onChange={e => setForm({ ...form, opis: e.target.value })}
          rows={4}
          className="w-full bg-bg-2 border border-border rounded-lg px-3 py-2.5 text-[14px] text-text-1 font-mono placeholder:text-text-3 focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Np. co tydzien reczne przepisuje faktury do arkusza... albo odpisuje na te same pytania w mailach..."
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="w-full sm:w-auto bg-accent text-bg-0 font-mono text-[13px] tracking-wide px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
      >
        {sending ? 'Otwieranie...' : 'Wyslij zapytanie'}
      </button>

      <p className="text-[12px] text-text-3">
        Odpowiedz w ciagu jednego dnia roboczego. Bez sprzedazy, bez dripsowania -- tylko konkretna rozmowa o Twojej sytuacji.
      </p>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Prompt Pack -- free downloadable section
// ---------------------------------------------------------------------------

const PROMPTS = [
  {
    tytul: 'Odpowiedz na zapytanie ofertowe',
    kontekst: 'Klient pyta o cene i termin',
    prompt: `Jestes ekspertem w branzy [TWOJA BRANŻA]. Napisz profesjonalna odpowiedz na ponizsze zapytanie ofertowe. Ton: rzeczowy, konkretny, bez sprzedazowej scemy. Zawrz: krotkie potwierdzenie rozumienia potrzeby, wycena w przedziale [MIN PLN]-[MAX PLN] z uzasadnieniem, proponowany termin realizacji, nastepny krok (np. krotka rozmowa 15 min). Max 180 slow.

Zapytanie: [WKLEJ TRESC MAILA]`,
  },
  {
    tytul: 'Odpowiedz na negatywna recenzje',
    kontekst: 'Klient zostawil 1-2 gwiazdki w Google',
    prompt: `Napisz profesjonalna odpowiedz na ponizszą recenzje w imieniu firmy [NAZWA FIRMY]. Zasady: nie bronij sie, przyjmij feedback, zaproponuj konkretne dzialanie naprawcze, zakonc zaproszeniem do kontaktu. Max 80 slow. Bez przepraszania po 3 razy.

Recenzja: [WKLEJ RECENZJE]`,
  },
  {
    tytul: 'Instrukcja dla nowego pracownika',
    kontekst: 'Onboarding, powtarzalne zadania',
    prompt: `Na podstawie ponizszego opisu stanowiska i zadan napisz clear, krokow-po-kroku instrukcje dla nowego pracownika ktory zaczyna w poniedzia lek. Format: numerowana lista, max 3 linijki na krok, bez zbednych slow. Jezyk: polski, nieformalny ale profesjonalny.

Stanowisko i zadania: [OPISZ]`,
  },
  {
    tytul: 'Podsumowanie spotkania',
    kontekst: 'Po call z klientem lub zespolem',
    prompt: `Przeksztalc ponizsze notatki ze spotkania w profesjonalne podsumowanie do wyslania uczestnikom. Struktura: 1) Ustalenia (lista), 2) Kto co robi i do kiedy (tabela), 3) Nastepne spotkanie (jesli ustalone). Max 200 slow.

Notatki: [WKLEJ LUB PODYKTUJ]`,
  },
  {
    tytul: 'Opis produktu/uslugi na strone',
    kontekst: 'Copywriting bez platnej agencji',
    prompt: `Napisz opis [PRODUKTU/USLUGI] na strone internetowa. Grupа docelowa: [OPIS KLIENTA]. Glowna korzysc: [CO KLIENT ZYSKUJE]. Format: naglowek (max 8 slow) + 3 zdania opisu + 3 punktorowe korzysci + CTA (1 zdanie). Jezyk: konkretny, bez "najwyzszej jakosci" i "kompleksowych rozwiazan".`,
  },
  {
    tytul: 'Windykacja -- przypomnienie o platnosci',
    kontekst: 'Faktura przeterminowana 7-30 dni',
    prompt: `Napisz grzeczne ale stanowcze przypomnienie o nieuregulowanej platnosci. Dane: faktura nr [NR], kwota [SUMA PLN], termin platnosci [DATA]. Ton: profesjonalny, nie agresywny, ale bez przepraszania za wysylanie przypomnienia. Max 60 slow. Zakonc konkretnym dzialaniem do podjecia.`,
  },
  {
    tytul: 'Analiza umowy -- czerwone flagi',
    kontekst: 'Przed podpisaniem z klientem lub dostawca',
    prompt: `Przeanalizuj ponizszą umowe i wylistuj: 1) Klauzule niekorzystne dla [MOJA STRONA: klient/wykonawca], 2) Brakujace zabezpieczenia, 3) Niejasne zapisy ktore wymagaja doprecyzowania. Format: numerowana lista, 1-2 zdania na punkt. Nie jestem prawnikiem -- weryfikuje potem z adwokatem.

Umowa: [WKLEJ TEKST]`,
  },
  {
    tytul: 'Post na LinkedIn -- case study klienta',
    kontekst: 'Marketing bez platnego copywritera',
    prompt: `Napisz post na LinkedIn o tym jak pomoglam/em klientowi [KROTKI OPIS PROBLEMU] osiagnac [KONKRETNY WYNIK]. Format: hook (1 zdanie, bez "Jestem podekscytowany"), historia (3-4 zdania), lesson learned (1 zdanie), CTA (pytanie do czytelnikow). Bez banalnych hastagow. Max 200 slow.`,
  },
  {
    tytul: 'Warunki wspolpracy -- wersja robocza',
    kontekst: 'Zanim zaangazujesz prawnika',
    prompt: `Przygotuj wersje robocza warunkow wspolpracy (term sheet) dla projektu [OPIS]. Strony: [TWOJA FIRMA] i [KLIENT]. Uwzglednij: zakres prac, termin, platnosci i harmonogram, prawa autorskie, kary umowne, zasady zmian w projekcie. Format: krotkie punkty, jezyk prosty. To szkic do weryfikacji przez prawnika.`,
  },
  {
    tytul: 'Oferta handlowa jako PDF-ready dokument',
    kontekst: 'Profesjonalna oferta w 10 minut',
    prompt: `Przygotuj profesjonalna oferte handlowa dla klienta [NAZWA/BRANZA]. Projekt: [OPIS]. Struktura: streszczenie (2 zdania), zakres prac (lista), harmonogram (tabela: etap / czas / koszt), warunki platnosci, gwarancja i wsparcie, nastepny krok. Ton: ekspercki, bez zbednych pochlebstw. Dane do wstawienia: [PODAJ WARTOSCI].`,
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
            AI dla polskiego przedsiebiorcy
          </div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-text-1 leading-tight mb-4">
            Twoja firma traci kilkanascie godzin miesiecznie na powtarzalne zadania.
            <span className="text-accent"> Mozna to naprawic.</span>
          </h1>
          <p className="text-[15px] sm:text-[16px] text-text-2 leading-relaxed mb-6">
            Faktury, raporty, oferty, maile -- to nie wymaga Twoich godzin. Wymaga dobrego systemu.
            Budujemy konkrente automatyzacje AI dla polskich JDG i malych spolek. Nie "consulting". Dzialajace narzedzia.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#kalkulator-zus"
              className="inline-block bg-bg-2 border border-border text-text-1 font-mono text-[13px] tracking-wide px-5 py-3 rounded-lg hover:border-accent hover:text-accent transition-colors text-center"
            >
              Kalkulator ZUS -- bezplatnie
            </a>
            <a
              href="#kontakt"
              className="inline-block bg-accent text-bg-0 font-mono text-[13px] tracking-wide px-5 py-3 rounded-lg hover:bg-accent-hover transition-colors text-center"
            >
              Zamow automatyzacje -- 1200 PLN
            </a>
          </div>
        </div>

        {/* Problem statement */}
        <div className="mb-12 border border-border rounded-lg divide-y divide-border">
          {[
            ['Faktury', '4-6 godz./tyg. na reczne przepisywanie danych do arkuszy i programow ksiegowych.'],
            ['Oferty', 'Kazde zapytanie ofertowe -- od nowa. Te same pytania, te same odpowiedzi, inny klient.'],
            ['Raporty', 'Poniedzialek rano zbierasz dane z pieciu miejsc zeby zrobic raport co bylo w poprzednim tygodniu.'],
            ['ZUS / ksiegowosc', 'Kazdy miesiąc: czy juz zmienic wariant ZUS? Czy sie kwalifikuje? Ile zaplacic?'],
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
            Bezplatne narzedzie #1
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-bold text-text-1 mb-2">
            Kalkulator ZUS -- ktory wariant Ci przysluguje?
          </h2>
          <p className="text-[14px] text-text-2 mb-5 leading-relaxed">
            3 pytania. Dowiesz sie czy placisz za duzo i co z tym zrobic. Zadnych danych osobowych, zadnego rejestrowania sie.
          </p>
          <ZusKalkulator />
        </section>

        {/* FREE: Prompt Pack */}
        <section id="prompty" className="mb-12 scroll-mt-8">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-2">
            Bezplatny zestaw #2 -- do pobrania / skopiowania
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-bold text-text-1 mb-2">
            10 gotowych promptow AI dla polskiej firmy
          </h2>
          <p className="text-[14px] text-text-2 mb-5 leading-relaxed">
            Kopiuj, wklej do Claude lub ChatGPT, podmien dane w nawiasach. Kazdy zaoszczedza 30-90 minut roboty.
            Bez rejestracji, bez maila -- po prostu uzyj.
          </p>
          <PromptPack />
          <p className="mt-4 text-[12px] text-text-3">
            Te prompty to punkt wyjscia. Jezeli chcesz zeby caly przeply wal dzia lal automatycznie -- bez kopiowania, bez recznej pracy -- to jest to, co robimy platnie.
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
            Faktura przychodzi mailem. Automat czyta ja, wyciaga dane, wpisuje do arkusza (lub do iFirmy / Fakturowni) i wysyla Ci tygodniowe podsumowanie. Bez dotykania. Raz skonfigurowany, dziala sam.
          </p>

          {/* Before / After */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-border rounded-lg p-4">
              <div className="font-mono text-[10px] text-text-3 tracking-widest uppercase mb-3">Teraz</div>
              <div className="font-mono text-[12px] text-text-2 space-y-1.5">
                <div className="text-red">  [mail od dostawcy]</div>
                <div className="text-text-3">       v</div>
                <div>  [otwierasz PDF]</div>
                <div className="text-text-3">       v</div>
                <div>  [przepisujesz rucznie]</div>
                <div className="text-text-3">       v</div>
                <div>  [wpisujesz do arkusza]</div>
                <div className="text-text-3">       v</div>
                <div>  [zapomniales o jednej]</div>
                <div className="text-text-3">       v</div>
                <div className="text-red">  [30-90 min stracone]</div>
              </div>
            </div>
            <div className="border border-green-border rounded-lg p-4">
              <div className="font-mono text-[10px] text-green tracking-widest uppercase mb-3">Po automatyzacji</div>
              <div className="font-mono text-[12px] text-text-2 space-y-1.5">
                <div className="text-green">  [mail od dostawcy]</div>
                <div className="text-text-3">       v</div>
                <div>  [automat czyta PDF]</div>
                <div className="text-text-3">       v</div>
                <div>  [wyciaga: nr faktury,</div>
                <div>   kwota, NIP, termin]</div>
                <div className="text-text-3">       v</div>
                <div>  [wpisuje do arkusza]</div>
                <div className="text-text-3">       v</div>
                <div className="text-green">  [Ty: nic nie robisz]</div>
              </div>
            </div>
          </div>

          {/* What's included */}
          <div className="border border-border rounded-lg divide-y divide-border mb-6">
            <div className="px-5 py-3 bg-bg-2">
              <div className="font-mono text-[10px] text-text-3 tracking-widest uppercase">Co zawiera</div>
            </div>
            {[
              ['Konfiguracja', 'Ustawiam automat pod Twoj e-mail i typ faktur (PDF, skany, faktury elektroniczne). Czas: 5-7 dni roboczych.'],
              ['Integracja', 'Arkusz Google Sheets (standardowo) lub iFirma / Fakturownia (jezeli masz konto). Bez instalowania czegokolwiek na Twoim komputerze.'],
              ['Podsumowania', 'Tygodniowy raport mailowy: co wplyneelo, co jest do zaplaty, co juz zaplacone.'],
              ['Wsparcie', '30 dni wsparcia w cenie. Jezeli cos nie dziala -- naprawiam.'],
              ['Szkolenie', '30-minutowa rozm owa przez Zoom: pokazuje jak to sprawdzic i jak zglaszac bledy.'],
            ].map(([k, v]) => (
              <div key={k} className="px-5 py-3.5 grid grid-cols-[1fr_3fr] gap-4">
                <div className="font-mono text-[12px] text-accent font-medium">{k}</div>
                <div className="text-[13px] text-text-2 leading-relaxed">{v}</div>
              </div>
            ))}
          </div>

          {/* Price */}
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
              Zamow automatyzacje
            </a>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-2">Jak wyglada wspolpraca</div>
          <h2 className="text-[20px] font-bold text-text-1 mb-5">3 kroki</h2>
          <div className="space-y-3">
            {[
              ['01', 'Rozmowa', '30 minut. Pokazujesz mi jak wyglada Twoj e-mail, jakie faktury dostajesz, gdzie chcesz miec dane. Ustalamy co dokladnie ma robic automat.'],
              ['02', 'Konfiguracja', '5-7 dni roboczych. Buduję i testuję na prawdziwych fakturach (anonimizujemy jesli wolisz). Przez caly czas masz dostep do postepow.'],
              ['03', 'Przekazanie', 'Zoom 30 minut: pokaz tego co zbuawalem, szkolenie jak to sprawdzac, 30 dni wsparcia w razie pytan.'],
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
              ['Czy potrzebuję programisty lub technicznej wiedzy?', 'Nie. Konfiguruje wszystko za Ciebie. Ty tylko pokazujesz e-mail i mowisz co chcesz osiagnac.'],
              ['Co jesli faktury sa w roznych formatach?', 'AI radzi sobie z wiekszosc ia formatow PDF. Przy skanach o niskiej jakosci moze byc problem -- omawiam to na rozmowie wstepnej.'],
              ['Czy moje dane sa bezpieczne?', 'Automat dziala na Twoim koncie Google (Sheets) lub koncie ksiegowym. Nie przechowuje faktur u mnie ani na zewnetrznych serwerach.'],
              ['Co jesli coś przestanie działac po 30 dniach wsparcia?', 'Oferuje plany wsparcia po 199 PLN/mies. lub naprawy ad-hoc. Ale wikszość automatyzacji dziala bezobsługowo przez miesiaće.'],
              ['Czy mozna zautomatyzowac tez inne rzeczy?', 'Tak. Raporty tygodniowe, odpowiedzi na maile, generowanie ofert, windykacja -- pytaj na rozmowie co Cie boli najbardziej.'],
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
          <h2 className="text-[20px] font-bold text-text-1 mb-2">Napisz co chcesz zautomatyzowac</h2>
          <p className="text-[14px] text-text-2 mb-6 leading-relaxed">
            Opisz w kilku zdaniach ktore zadanie zjada Ci najwiecej czasu. Odpiszemy z konkretna propozycja -- bez sprzedazowej sciemy.
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
                API dla deweloperow i firm --&gt;
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
