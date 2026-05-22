import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'O projekcie | wezmezadarmo',
  description: 'Dowiedz się po co powstał wezmezadarmo, komu służy, jak działa i kto za nim stoi.',
};

export default function OProjekciePage() {
  return (
    <div className="min-h-screen bg-bg-0">
      <div className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-[24px] sm:text-[28px] font-bold text-text-1 mb-2">
          O projekcie
        </h1>
        <p className="text-[13px] text-text-3 mb-8">
          wezmezadarmo.com
        </p>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          {/* Po co to powstało */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Po co to powstało
            </h2>
            <div className="space-y-3">
              <p>
                Polska ma jeden z najszerszych systemów świadczeń społecznych w Europie.
                Problem polega na tym, że większość ludzi nie wie, co im przysługuje.
                Informacje są rozproszone po dziesiątkach stron rządowych, urzędowych portali
                i aktów prawnych. Przeciętny Polak nie ma czasu ani cierpliwości, żeby
                to wszystko przekopać.
              </p>
              <p>
                wezmezadarmo powstało, żeby rozwiązać ten konkretny problem: zebrać w jednym miejscu
                <strong className="text-text-1"> 117 świadczeń z 15 kategorii</strong> i dać
                każdemu możliwość sprawdzenia w 2 minuty, na co się kwalifikuje.
                Bez rejestracji, bez opłat, bez zbędnych kroków.
              </p>
              <p>
                Z czasem serwis rozrósł się o narzędzia dla firm i JDG: kreator wniosków ZUS,
                asystenta AI, automatyzacje procesów firmowych i monitoring dofinansowań.
                Kalkulator świadczeń i wnioski pozostają darmowe. Narzędzia B2B są odpłatne.
              </p>
            </div>
          </section>

          {/* Moduły serwisu */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Co zawiera serwis
            </h2>
            <div className="space-y-4">

              <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
                <div className="text-[13px] font-semibold text-text-1 mb-1">
                  <Link href="/" className="text-accent hover:underline">Kalkulator świadczeń</Link>
                  {' '}<span className="text-text-3 font-normal">— bezpłatny, anonimowy</span>
                </div>
                <p className="text-[13px] text-text-3">
                  Wypełniasz formularz (wiek, płeć, 11 pytań o sytuację życiową) i dostajesz
                  spersonalizowaną listę świadczeń. 117 świadczeń z ZUS, NFZ, PFRON, KRUS, MOPS
                  i programów samorządowych. Żadnych danych osobowych na serwerze.
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
                <div className="text-[13px] font-semibold text-text-1 mb-1">
                  <Link href="/wnioski" className="text-accent hover:underline">Kreator wniosków ZUS</Link>
                  {' '}<span className="text-text-3 font-normal">— bezpłatny</span>
                </div>
                <p className="text-[13px] text-text-3">
                  AI prowadzi przez wypełnianie formularzy ZUS: Z-15a, Z-15b, Z-3, ERPO, ZAS-53, PEL.
                  Na końcu generuje gotowy PDF do druku lub wysyłki pocztą. PESEL jest przetwarzany
                  jednorazowo w pamięci serwera i nie jest zapisywany.
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
                <div className="text-[13px] font-semibold text-text-1 mb-1">
                  <Link href="/aktualnosci" className="text-accent hover:underline">Aktualności z urzędów</Link>
                  {' '}<span className="text-text-3 font-normal">— bezpłatny</span>
                </div>
                <p className="text-[13px] text-text-3">
                  Agregator RSS z ZUS, GUS, NBP, NFZ, UOKiK, Sejmu i innych instytucji.
                  Wszystkie ważne komunikaty w jednym miejscu, filtrowane według profilu
                  (wszyscy / JDG / firma). Odświeżany co 30 minut.
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
                <div className="text-[13px] font-semibold text-text-1 mb-1">
                  <Link href="/agent" className="text-accent hover:underline">Asystent AI</Link>
                  {' '}<span className="text-text-3 font-normal">— wymaga rejestracji</span>
                </div>
                <p className="text-[13px] text-text-3">
                  Osobisty agent AI dla JDG i osób prywatnych. Dopasowuje świadczenia i ulgi
                  do profilu, monitoruje zmiany w przepisach i wysyła dzienny e-mail digest
                  z najważniejszymi aktualnościami. Dane profilu przechowywane w Supabase (serwery w UE).
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
                <div className="text-[13px] font-semibold text-text-1 mb-1">
                  <Link href="/dla-firm" className="text-accent hover:underline">Automatyzacje dla firm</Link>
                  {' '}<span className="text-text-3 font-normal">— wycena indywidualna</span>
                </div>
                <p className="text-[13px] text-text-3">
                  Gotowe systemy wdrażane w kilka dni: faktury z zagranicy, KSeF automatyczny,
                  raporty ZUS, onboarding pracownika, rozliczenie delegacji, windykacja należności,
                  terminarz compliance, OCR paragonów, alerty wygaśnięcia umów i inne.
                  Bez miesięcznych subskrypcji za narzędzia, których nie używasz.
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
                <div className="text-[13px] font-semibold text-text-1 mb-1">
                  <Link href="/dotacje" className="text-accent hover:underline">Monitoring dotacji</Link>
                  {' '}<span className="text-text-3 font-normal">— 25 PLN/mies., 7 dni trial</span>
                </div>
                <p className="text-[13px] text-text-3">
                  B2B SaaS dla firm. AI agent sprawdza otwarte nabory z KFS, PUP, PFRON, KPO
                  i programów samorządowych. Gdy pojawi się dofinansowanie pasujące do profilu
                  firmy (NIP, branża, województwo), właściciel dostaje alert e-mail.
                </p>
              </div>

            </div>
          </section>

          {/* Komu może służyć */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Komu może służyć
            </h2>
            <div className="space-y-3">
              <p>
                Narzędzie jest dla każdego mieszkańca Polski, niezależnie od wieku,
                statusu zatrudnienia czy sytuacji rodzinnej. W szczególności może pomóc:
              </p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Rodzinom z dziećmi</strong>: 800+, becikowe, ulga na dziecko, kosiniakowe, zasiłek rodzinny i wiele innych</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Seniorom i emerytom</strong>: trzynastka, czternastka, dodatek osłonowy, ulgi podatkowe, refundacja leków</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Osobom z niepełnosprawnością</strong>: świadczenie wspierające, dofinansowanie do rehabilitacji, ulga rehabilitacyjna</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Przedsiębiorcom i JDG</strong>: ulga na start, mały ZUS plus, dotacje z urzędu pracy, preferencyjny ZUS, monitoring dofinansowań</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Osobom bezrobotnym</strong>: zasiłek dla bezrobotnych, szkolenia, staże, bon na zasiedlenie</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Studentom</strong>: stypendium socjalne, naukowe, kredyt studencki, ulgi na transport</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Rolnikom</strong>: dopłaty KRUS, emerytura rolnicza, dotacje na modernizację</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Bezpieczeństwo */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Bezpieczeństwo danych
            </h2>
            <div className="space-y-3">
              <p>Prywatność jest fundamentem tego projektu. Każdy moduł ma inne zasady:</p>

              <p className="text-[13px] font-semibold text-text-1 mt-4 mb-1">Kalkulator świadczeń (/)</p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                  <span><strong className="text-text-1">PESEL dekodowany lokalnie</strong>: wiek i płeć odczytywane w przeglądarce, sam numer nie trafia na serwer</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                  <span><strong className="text-text-1">Brak bazy danych</strong>: kalkulator nie zapisuje danych osobowych ani historii</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                  <span><strong className="text-text-1">NIP jednorazowo</strong>: używany tylko do sprawdzenia statusu firmy w CEIDG, nie jest przechowywany</span>
                </li>
              </ul>

              <p className="text-[13px] font-semibold text-text-1 mt-4 mb-1">Kreator wniosków ZUS (/wnioski)</p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-warn)' }}>[!]</span>
                  <span><strong className="text-text-1">PESEL trafia na serwer</strong>: do wygenerowania PDF z wypełnionym wnioskiem. Przetwarzany jednorazowo w pamięci, nie jest zapisywany</span>
                </li>
              </ul>

              <p className="text-[13px] font-semibold text-text-1 mt-4 mb-1">Asystent AI (/agent/panel)</p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-warn)' }}>[!]</span>
                  <span><strong className="text-text-1">Wymaga rejestracji</strong>: dane profilu (wiek, dochód, zatrudnienie) i preferencje e-mail przechowywane w Supabase (serwery w UE). PESEL nie jest zbierany</span>
                </li>
              </ul>

              <p className="text-[13px] font-semibold text-text-1 mt-4 mb-1">Monitoring dotacji (/dotacje/panel)</p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-warn)' }}>[!]</span>
                  <span><strong className="text-text-1">Wymaga rejestracji</strong>: NIP, branża i adres e-mail przechowywane w Supabase (serwery w UE) do dopasowania dofinansowań i wysyłki alertów</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-warn)' }}>[!]</span>
                  <span><strong className="text-text-1">Płatność przez Stripe</strong>: dane karty przetwarzane wyłącznie przez Stripe, nie przechowujemy danych płatniczych</span>
                </li>
              </ul>

              <p className="text-[13px] text-text-3 mt-3">
                Całe połączenie jest szyfrowane (HTTPS). Szczegóły w <Link href="/polityka-prywatnosci" className="text-accent hover:underline">Polityce prywatności</Link>.
              </p>
            </div>
          </section>

          {/* Technologia */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Technologia
            </h2>
            <div className="space-y-3">
              <p>
                Projekt zbudowany w oparciu o nowoczesny stack technologiczny:
              </p>
              <ul className="space-y-1 pl-1">
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Next.js 16</strong> (App Router) z TypeScript</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">AI: Google Gemini</strong> (via OpenRouter) - asystent czatowy i weryfikator wyników</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Silnik dopasowań</strong>: autorski algorytm TypeScript weryfikujący kwalifikowalność na podstawie profilu</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Supabase</strong>: baza danych dla kont agenta i panelu dotacji (serwery w UE)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Stripe</strong>: obsługa płatności dla subskrypcji monitoringu dotacji</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Vercel</strong>: hosting serverless i edge deployment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Baza 117 świadczeń</strong>: ręcznie zweryfikowana, aktualizowana na bieżąco, każda pozycja z datą i źródłem</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Źródła danych */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Źródła danych
            </h2>
            <div className="space-y-3">
              <p>
                Baza świadczeń opracowana na podstawie oficjalnych źródeł rządowych i publicznych.
                Każde świadczenie ma przypisane źródło z datą weryfikacji. Główne instytucje:
              </p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">gov.pl</strong> (MRiPS) - świadczenia rodzinne: 800+, becikowe, kosiniakowe, zasiłek rodzinny, RKO</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">zus.pl</strong> - zasiłki chorobowe, macierzyński, ojcowski, opiekuńczy, trzynasta i czternasta emerytura</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">podatki.gov.pl</strong> - ulgi: na dziecko, rehabilitacyjna, termomodernizacyjna, na internet</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">pfron.org.pl</strong> - dofinansowania dla osób z niepełnosprawnością, turnusy rehabilitacyjne</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">nfz.gov.pl</strong> - refundacja leków, bon na okulary, leczenie uzdrowiskowe, rehabilitacja</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">praca.gov.pl</strong> - zasiłek dla bezrobotnych, szkolenia, staże, bony, dotacje z PUP</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">nfosigw.gov.pl</strong> - Czyste Powietrze, Mój Prąd, bon energetyczny, OZE</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">krus.gov.pl</strong> - świadczenia dla rolników, emerytura rolnicza, zasiłki KRUS</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">biznes.gov.pl / CEIDG</strong> - ulga na start, mały ZUS plus, preferencyjny ZUS dla nowych firm</span>
                </li>
              </ul>
              <p className="text-[13px] text-text-3 mt-2">
                Dane są weryfikowane ręcznie. Jeśli zauważysz nieaktualną informację, zgłoś przez LinkedIn.
              </p>
            </div>
          </section>

          {/* Kto za tym stoi */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Kto za tym stoi
            </h2>
            <div className="space-y-3">
              <p>
                Projekt stworzył <strong className="text-text-1">Kamil Sobkowicz</strong>,
                programista i przedsiębiorca z Polski. Kalkulator świadczeń i kreator wniosków
                to projekt społeczny. Narzędzia dla firm rozwijane są przez zespół
                theVelopers.
              </p>
              <p>
                Motywacją było proste spostrzeżenie: Polska daje naprawdę dużo swoim mieszkańcom,
                ale system jest tak skomplikowany, że większość ludzi nie korzysta z tego,
                co im przysługuje.
              </p>
              <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[16px] font-extrabold" style={{ background: 'linear-gradient(135deg, var(--color-green), var(--green-600))', color: '#fff' }}>
                  KS
                </div>
                <div>
                  <div className="text-[14px] font-bold text-text-1">Kamil Sobkowicz</div>
                  <a
                    href="https://www.linkedin.com/in/kamil-sobkowicz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-accent hover:underline"
                  >
                    linkedin.com/in/kamil-sobkowicz {'->'}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Kontakt i zgłoszenia
            </h2>
            <div className="space-y-3">
              <p>
                Znalazłeś błąd w danych? Brakuje jakiegoś świadczenia? Masz pomysł na ulepszenie?
              </p>
              <p>
                Napisz na{' '}
                <a
                  href="https://www.linkedin.com/in/kamil-sobkowicz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  LinkedIn
                </a>{' '}
                lub przez formularz na stronie{' '}
                <Link href="/dla-firm" className="text-accent hover:underline">Dla firm</Link>.
                Każde zgłoszenie jest czytane i brane pod uwagę przy aktualizacjach bazy.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-text-3">
          <Link href="/" className="text-accent hover:underline">Strona główna</Link>
          <Link href="/swiadczenia" className="text-accent hover:underline">Baza świadczeń</Link>
          <Link href="/wnioski" className="text-accent hover:underline">Wnioski ZUS</Link>
          <Link href="/aktualnosci" className="text-accent hover:underline">Aktualności</Link>
          <Link href="/dla-firm" className="text-accent hover:underline">Dla firm</Link>
          <Link href="/regulamin" className="text-accent hover:underline">Regulamin</Link>
          <Link href="/polityka-prywatnosci" className="text-accent hover:underline">Polityka prywatności</Link>
        </div>
      </div>
      </div>
    </div>
  );
}
