import Link from 'next/link';

const PROBLEMY = [
  {
    obszar: 'Faktury',
    opis: 'Ręczne przepisywanie danych z maili do programu -- 3-5 godz. miesięcznie na każdego handlowca.',
  },
  {
    obszar: 'Oferty',
    opis: 'Kopiowanie szablonu, ręczna edycja kwot, wysyłka -- każda oferta to 20-40 minut pracy.',
  },
  {
    obszar: 'Raporty',
    opis: 'Zbieranie danych z arkuszy na koniec miesiąca, formatowanie, wysyłka do zarządu lub księgowej.',
  },
  {
    obszar: 'Maile do klientów',
    opis: 'Potwierdzenia zamówień, przypomnienia o płatnościach, follow-up po spotkaniu -- pisane od nowa za każdym razem.',
  },
  {
    obszar: 'Dane z ZUS/US',
    opis: 'Pilnowanie terminów, generowanie druków, przepisywanie do arkusza ewidencji.',
  },
];

const KROKI = [
  {
    tytul: 'Bezpłatna rozmowa',
    opis: 'Opowiadasz nam, co w Twojej firmie zajmuje za dużo czasu. 30 minut. Bez prezentacji, bez handlowania.',
  },
  {
    tytul: 'Konkretna wycena',
    opis: 'W ciągu 2 dni roboczych dostajesz propozycję: co zautomatyzujemy, ile to kosztuje, ile czasu zaoszczędzisz miesięcznie.',
  },
  {
    tytul: 'Wdrożenie i test',
    opis: 'Budujemy system. Testujesz go na swoich danych. Jeśli nie działa tak jak uzgodniliśmy -- nie płacisz.',
  },
];

const PRODUKT_FEATURES = [
  'Automatyczne odczytywanie zamówień z maili klientów',
  'Generowanie faktury w Twoim systemie (np. Fakturownia, wFirma, arkusz Google)',
  'Powiadomienie na maila lub WhatsApp gdy faktura jest gotowa',
  'Archiwizacja w chmurze -- szukasz faktury z marca? 3 sekundy',
  'Raport tygodniowy: kto zapłacił, kto zalega, ile wpłynęło',
  'Wdrożenie w ciągu 5 dni roboczych, instrukcja obsługi, 30 dni wsparcia',
];

export default function AutomatyzacjePage() {
  return (
    <div className="min-h-screen bg-bg-0">

      {/* Nav */}
      <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-2">
        <Link
          href="/"
          className="font-mono text-[13px] text-accent hover:underline"
        >
          &larr; wezmezadarmo.com
        </Link>
      </div>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-16">
        <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-5">
          Automatyzacje AI dla firm i JDG
        </div>

        <h1 className="text-[34px] sm:text-[46px] font-bold text-text-1 leading-[1.2] mb-6">
          Twoja firma traci kilkanaście godzin miesięcznie
          na rzeczy, które system może zrobić sam.
        </h1>

        <p className="text-[18px] sm:text-[20px] text-text-2 leading-[1.75] mb-3 max-w-2xl">
          Faktury, oferty, raporty, maile do klientów.
          Budujemy konkretne automatyzacje, które działają w Twoim środowisku pracy.
        </p>
        <p className="text-[18px] sm:text-[20px] text-text-2 leading-[1.75] mb-10 max-w-2xl">
          Nie kursy. Nie konsulting. <span className="text-text-1 font-semibold">Gotowe narzędzia.</span>
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="#kontakt"
            className="px-7 py-4 bg-accent text-bg-0 font-bold text-[17px] rounded-lg hover:opacity-90 transition-opacity"
          >
            Umów bezpłatną rozmowę
          </a>
          <a
            href="#jak-dzialamy"
            className="px-7 py-4 border border-border text-text-2 font-medium text-[17px] rounded-lg hover:border-accent hover:text-accent transition-colors"
          >
            Jak to działa?
          </a>
        </div>
      </section>

      {/* PROBLEMY */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-[24px] sm:text-[30px] font-bold text-text-1 mb-8">
          Gdzie ucieka czas w Twojej firmie?
        </h2>
        <div className="border border-border rounded-xl overflow-hidden divide-y divide-border">
          {PROBLEMY.map((p) => (
            <div key={p.obszar} className="flex gap-0 sm:gap-6 flex-col sm:flex-row px-6 py-5 hover:bg-bg-2 transition-colors">
              <div className="sm:w-36 shrink-0 text-accent font-semibold text-[16px] mb-1 sm:mb-0">
                {p.obszar}
              </div>
              <div className="text-[16px] text-text-2 leading-[1.65]">
                {p.opis}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[15px] text-text-3 font-mono">
          To jest norma. Większość firm w Polsce tak działa. Nie musi tak być.
        </p>
      </section>

      {/* PRODUKT */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-16">
        <div className="border border-accent/40 rounded-xl p-7 sm:p-10">
          <div className="font-mono text-[11px] tracking-widest text-accent uppercase mb-4">
            Flagship -- gotowy produkt
          </div>
          <h2 className="text-[28px] sm:text-[36px] font-bold text-text-1 mb-3">
            Automat Fakturowy
          </h2>
          <p className="text-[17px] text-text-2 leading-[1.7] mb-8 max-w-xl">
            System, który sam odczytuje zamówienia z maili klientów i wystawia
            faktury bez żadnego ręcznego przepisywania.
            Działa 24 godziny na dobę, 7 dni w tygodniu.
          </p>

          <ul className="space-y-4 mb-10">
            {PRODUKT_FEATURES.map((f, i) => (
              <li key={i} className="flex gap-4 text-[16px] text-text-2 leading-[1.6]">
                <span className="text-accent shrink-0 font-bold text-[18px] leading-none mt-0.5">--</span>
                {f}
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row sm:items-center gap-6">
            <div>
              <div className="text-[40px] font-bold text-text-1 leading-none mb-1">
                1 200 PLN
              </div>
              <div className="text-[15px] text-text-3">
                jednorazowo &bull; bez abonamentu &bull; wdrożenie 5 dni roboczych
              </div>
            </div>
            <a
              href="#kontakt"
              className="shrink-0 px-7 py-4 bg-accent text-bg-0 font-bold text-[17px] rounded-lg hover:opacity-90 transition-opacity text-center"
            >
              Zamów wdrożenie
            </a>
          </div>
        </div>
      </section>

      {/* JAK DZIAŁAMY */}
      <section id="jak-dzialamy" className="max-w-3xl mx-auto px-5 sm:px-8 pb-16">
        <h2 className="text-[24px] sm:text-[30px] font-bold text-text-1 mb-10">
          Jak wygląda współpraca
        </h2>
        <div className="space-y-8">
          {KROKI.map((k, i) => (
            <div key={i} className="flex gap-6">
              <div className="shrink-0 w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center">
                <span className="font-mono font-bold text-accent text-[18px]">{i + 1}</span>
              </div>
              <div className="pt-2">
                <div className="text-[19px] font-semibold text-text-1 mb-2">{k.tytul}</div>
                <div className="text-[16px] text-text-2 leading-[1.7]">{k.opis}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GWARANCJA */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-16">
        <div className="bg-bg-2 border border-border rounded-xl px-7 sm:px-10 py-8">
          <h3 className="text-[20px] sm:text-[24px] font-bold text-text-1 mb-4">
            Jeśli nie działa -- nie płacisz
          </h3>
          <p className="text-[16px] sm:text-[17px] text-text-2 leading-[1.75]">
            Zanim wystawię fakturę, testujemy system na Twoich prawdziwych danych.
            Jeśli automatyzacja nie robi tego, co uzgodniliśmy -- zwrot 100% wpłaty.
            Bez klauzul, bez gwiazdek.
          </p>
        </div>
      </section>

      {/* KONTAKT */}
      <section id="kontakt" className="max-w-3xl mx-auto px-5 sm:px-8 pb-24">
        <h2 className="text-[28px] sm:text-[36px] font-bold text-text-1 mb-4">
          Porozmawiajmy
        </h2>
        <p className="text-[17px] sm:text-[18px] text-text-2 leading-[1.75] mb-10 max-w-xl">
          Opisz krótko, co w Twojej firmie zajmuje za dużo czasu.
          Odpiszę w ciągu jednego dnia roboczego.
          Pierwsza rozmowa jest bezpłatna i bez żadnych zobowiązań.
        </p>

        {/* Direct contact */}
        <div className="border border-border rounded-xl px-7 sm:px-10 py-8 mb-8">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-5">
            Kontakt bezpośredni
          </div>
          <a
            href="mailto:sobkowicz.kamil@gmail.com?subject=Automatyzacja%20-%20zapytanie"
            className="block text-[22px] sm:text-[26px] font-mono text-accent hover:underline mb-2 break-all"
          >
            sobkowicz.kamil@gmail.com
          </a>
          <p className="text-[15px] text-text-3">
            Napisz maila -- to najprostszy sposób. Podaj firmę, branżę i opis problemu.
          </p>
        </div>

        {/* Quick form */}
        <div className="border border-border rounded-xl px-7 sm:px-10 py-8">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-6">
            Lub wyślij wiadomość tutaj
          </div>
          <form
            action="mailto:sobkowicz.kamil@gmail.com"
            method="post"
            encType="text/plain"
            className="space-y-5"
          >
            <div>
              <label className="block text-[15px] font-medium text-text-2 mb-2">
                Imię i nazwisko
              </label>
              <input
                type="text"
                name="imie"
                placeholder="Jan Kowalski"
                required
                className="w-full px-4 py-3 text-[16px] bg-bg-0 border border-border rounded-lg text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[15px] font-medium text-text-2 mb-2">
                Nazwa firmy
              </label>
              <input
                type="text"
                name="firma"
                placeholder="Kowalski Sp. z o.o."
                className="w-full px-4 py-3 text-[16px] bg-bg-0 border border-border rounded-lg text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[15px] font-medium text-text-2 mb-2">
                Adres e-mail (do odpowiedzi)
              </label>
              <input
                type="email"
                name="email"
                placeholder="jan@kowalski.pl"
                required
                className="w-full px-4 py-3 text-[16px] bg-bg-0 border border-border rounded-lg text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[15px] font-medium text-text-2 mb-2">
                Co w Twojej firmie zajmuje za dużo czasu?
              </label>
              <textarea
                name="wiadomosc"
                rows={5}
                placeholder="Np. co miesiąc ręcznie wystawiam 80 faktur, każda zajmuje mi 15 minut..."
                required
                className="w-full px-4 py-3 text-[16px] bg-bg-0 border border-border rounded-lg text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-4 bg-accent text-bg-0 font-bold text-[17px] rounded-lg hover:opacity-90 transition-opacity"
            >
              Wyślij wiadomość
            </button>
            <p className="text-[13px] text-text-3 font-mono">
              Nie sprzedajemy danych. Odpiszemy tylko w sprawie zapytania.
            </p>
          </form>
        </div>
      </section>

    </div>
  );
}
