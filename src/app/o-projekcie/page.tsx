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
                Projekt jest w pełni darmowy. Nie zarabiamy na Twoich danych, nie wyświetlamy reklam,
                nie sprzedajemy niczego. Jedynym celem jest pomóc ludziom sprawdzić, z jakich świadczeń mogą skorzystać.
              </p>
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
                  <span><strong className="text-text-1">Przedsiębiorcom</strong>: ulga na start, mały ZUS plus, dotacje z urzędu pracy, preferencyjny ZUS</span>
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

          {/* Jak to działa */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Jak to działa
            </h2>
            <div className="space-y-3">
              <p>Cały proces zajmuje około 2 minut i składa się z trzech kroków:</p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-[18px] font-extrabold text-accent shrink-0">1.</span>
                  <div>
                    <strong className="text-text-1">Podajesz podstawowe dane</strong>
                    <p className="text-[13px] text-text-3 mt-0.5">
                      Wiek, płeć oraz opcjonalnie NIP. Jeśli podasz PESEL, jest on dekodowany
                      lokalnie w Twojej przeglądarce w celu odczytania wieku i płci. Sam numer
                      PESEL nie jest wysyłany na serwer.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[18px] font-extrabold text-accent shrink-0">2.</span>
                  <div>
                    <strong className="text-text-1">Odpowiadasz na 11 pytań</strong>
                    <p className="text-[13px] text-text-3 mt-0.5">
                      Stan cywilny, liczba dzieci, dochód, zatrudnienie, niepełnosprawność,
                      sytuacja mieszkaniowa, województwo. Na ich podstawie algorytm dopasowuje
                      świadczenia do Twojej sytuacji.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[18px] font-extrabold text-accent shrink-0">3.</span>
                  <div>
                    <strong className="text-text-1">Dostajesz spersonalizowaną listę</strong>
                    <p className="text-[13px] text-text-3 mt-0.5">
                      System pokazuje świadczenia, które mogą Ci przysługiwać na podstawie podanych danych.
                      Przy każdym znajdziesz kwotę, wymagane dokumenty, kroki do złożenia wniosku
                      i pułapki, na które trzeba uważać. Asystent AI jest dostępny do zadawania pytań
                      i prowadzenia przez cały proces.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bezpieczeństwo */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Bezpieczeństwo danych
            </h2>
            <div className="space-y-3">
              <p>Prywatność jest fundamentem tego projektu. Każda usługa ma inne zasady:</p>

              <p className="text-[13px] font-semibold text-text-1 mt-4 mb-1">Kalkulator świadczeń (strona główna)</p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                  <span><strong className="text-text-1">Kalkulator nie wymaga PESEL</strong>: wystarczy wiek i płeć. Jeśli podasz PESEL, jest dekodowany lokalnie w przeglądarce i nie trafia na serwer</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                  <span><strong className="text-text-1">Brak bazy danych i kont</strong>: kalkulator nie zapisuje danych osobowych, nie tworzy kont i nie przechowuje historii na serwerze</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                  <span><strong className="text-text-1">NIP jednorazowo</strong>: jeśli podasz NIP, jest używany tylko do jednorazowego sprawdzenia statusu firmy w CEIDG i nie jest przechowywany</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-green)' }}>[v]</span>
                  <span><strong className="text-text-1">HTTPS</strong>: całe połączenie jest szyfrowane</span>
                </li>
              </ul>

              <p className="text-[13px] font-semibold text-text-1 mt-4 mb-1">Formularze wniosków (/wnioski)</p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-warn)' }}>[!]</span>
                  <span><strong className="text-text-1">PESEL jest przesyłany na serwer</strong>: w celu wygenerowania pliku PDF z wypełnionym wnioskiem. Dane są przetwarzane jednorazowo w pamięci i nie są zapisywane</span>
                </li>
              </ul>

              <p className="text-[13px] font-semibold text-text-1 mt-4 mb-1">Panel agenta (/agent/panel)</p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="font-bold shrink-0" style={{ color: 'var(--color-warn)' }}>[!]</span>
                  <span><strong className="text-text-1">Wymaga rejestracji</strong>: dane profilu (wiek, dochód, zatrudnienie) i preferencje e-mail przechowywane w bazie Supabase (serwery w UE). PESEL nie jest zbierany</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Technologia */}
          <section>
            <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
              Technologia
            </h2>
            <div className="space-y-3">
              <p>
                Projekt zbudowany jest w oparciu o nowoczesny stack technologiczny:
              </p>
              <ul className="space-y-1 pl-1">
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Next.js</strong>: framework React do budowy aplikacji webowych</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">TypeScript</strong>: typy statyczne dla bezpieczeństwa kodu</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">AI (LLM)</strong>: asystent czatowy do odpowiadania na pytania o świadczenia (<Link href="/regulamin" className="text-accent hover:underline">transparentność AI</Link>)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Silnik dopasowań</strong>: autorski algorytm weryfikujący kwalifikowalność na podstawie profilu użytkownika</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">Baza 117 świadczeń</strong>: ręcznie zweryfikowana baza z oficjalnych źródeł rządowych, aktualizowana na bieżąco</span>
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
                Baza 117 świadczeń została opracowana na podstawie ogólnodostępnych, oficjalnych
                źródeł rządowych i publicznych. Każde świadczenie w bazie ma przypisane źródło
                z datą weryfikacji. Główne instytucje, z których danych korzystamy:
              </p>
              <ul className="space-y-2 pl-1">
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">gov.pl</strong> (Ministerstwo Rodziny i Polityki Społecznej) - świadczenia rodzinne: 800+, becikowe, kosiniakowe, zasiłek rodzinny, Rodzinny Kapitał Opiekuńczy</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">zus.pl</strong> (Zakład Ubezpieczeń Społecznych) - zasiłki chorobowe, macierzyński, ojcowski, opiekuńczy, świadczenie rehabilitacyjne, trzynasta i czternasta emerytura</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">podatki.gov.pl</strong> (Ministerstwo Finansów) - ulgi podatkowe: ulga na dziecko, prorodzinna, rehabilitacyjna, termomodernizacyjna, na internet</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">pfron.org.pl</strong> (Państwowy Fundusz Rehabilitacji Osób Niepełnosprawnych) - dofinansowania dla osób z niepełnosprawnością, PFRON, turnusy rehabilitacyjne</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">nfz.gov.pl</strong> (Narodowy Fundusz Zdrowia) - refundacja leków, bon na okulary, leczenie uzdrowiskowe, rehabilitacja NFZ</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">praca.gov.pl</strong> (Ministerstwo Rodziny / Urzędy Pracy) - zasiłek dla bezrobotnych, szkolenia, staże, bony, dofinansowania z PUP</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">gov.pl/klimat</strong> i <strong className="text-text-1">nfosigw.gov.pl</strong> (Ministerstwo Klimatu / NFOŚiGW / WFOŚiGW) - Czyste Powietrze, Mój Prąd, bon energetyczny, dofinansowanie OZE</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">krus.gov.pl</strong> (Kasa Rolniczego Ubezpieczenia Społecznego) - świadczenia dla rolników, emerytura rolnicza, zasiłki KRUS</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">{'>'}</span>
                  <span><strong className="text-text-1">biznes.gov.pl / CEIDG</strong> (Ministerstwo Rozwoju i Technologii) - ulga na start, mały ZUS plus, preferencyjny ZUS dla nowych firm</span>
                </li>
              </ul>
              <p className="text-[13px] text-text-3 mt-2">
                Dane są weryfikowane ręcznie. Przy każdym świadczeniu widoczna jest data ostatniej weryfikacji.
                Jeśli zauważysz nieaktualną informację, zgłoś to przez LinkedIn.
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
                programista i przedsiębiorca z Polski. wezmezadarmo to projekt społeczny,
                zbudowany w wolnym czasie, bez komercyjnego celu.
              </p>
              <p>
                Motywacją było proste spostrzeżenie: Polska daje naprawdę dużo swoim mieszkańcom,
                ale system jest tak skomplikowany, że większość ludzi nie korzysta z tego,
                co im przysługuje. To narzędzie ma to zmienić.
              </p>
              <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ background: 'var(--color-bg-2)', border: '1px solid var(--color-border)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[16px] font-extrabold" style={{ background: 'linear-gradient(135deg, var(--color-green), #3D9D60)', color: '#fff' }}>
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
                lub zgłoś przez formularz kontaktowy. Każde zgłoszenie jest czytane i brane pod uwagę
                przy aktualizacjach bazy.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-x-4 gap-y-2 text-[12px] text-text-3">
          <Link href="/" className="text-accent hover:underline">Strona główna</Link>
          <Link href="/swiadczenia" className="text-accent hover:underline">Baza świadczeń</Link>
          <Link href="/regulamin" className="text-accent hover:underline">Regulamin</Link>
          <Link href="/polityka-prywatnosci" className="text-accent hover:underline">Polityka prywatności</Link>
        </div>
      </div>
      </div>
    </div>
  );
}
