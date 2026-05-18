import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatności | WezmeZaDarmo.com',
  description: 'Polityka prywatności serwisu WezmeZaDarmo.com. Informacje o przetwarzaniu danych osobowych zgodnie z RODO.',
};

export default function PolitykaPage() {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróć do strony głównej
        </Link>

        <h1 className="text-[24px] sm:text-[28px] font-bold text-text-1 mb-2">
          Polityka prywatności
        </h1>
        <p className="text-[13px] text-text-3 mb-8">
          Ostatnia aktualizacja: 18 maja 2026 r.
        </p>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Administrator danych osobowych">
            <P>1.1. Administratorem danych osobowych jest Kamil Sobkowicz, prowadzący serwis WezmeZaDarmo.com (dalej: &quot;Administrator&quot;). We wszelkich sprawach dotyczących ochrony danych osobowych można kontaktować się przez formularz na stronie <Link href="/o-projekcie" className="text-accent hover:underline">/o-projekcie</Link> lub pisząc na adres: kontakt(at)wezmezadarmo.com.</P>
            <P>1.2. Niniejsza Polityka Prywatności została opracowana zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2024/1689 (Akt o Sztucznej Inteligencji).</P>
            <P>1.3. Serwis nie jest organem administracji publicznej. Wyniki generowane przez serwis mają charakter wyłącznie informacyjny i nie stanowią decyzji administracyjnej ani wiążącej opinii prawnej.</P>
          </Section>

          <Section n="2" title="Zakres serwisu i zasada minimalizacji danych">
            <P>Serwis WezmeZaDarmo.com świadczy dwa rodzaje usług:</P>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-text-1">Kalkulator świadczeń</strong> (strona główna, /wnioski): bezstanowy, bez kont użytkowników, bez bazy danych osobowych. Dane przetwarzane jednorazowo w pamięci operacyjnej serwera i natychmiast usuwane.</li>
              <li><strong className="text-text-1">Platforma B2B: Dotacje i monitoring</strong> (/dotacje): usługa płatna dla firm i JDG. Wymaga rejestracji konta z podaniem danych firmy. Dane przechowywane w Supabase (serwery UE).</li>
            </ul>
            <P>2.1. Serwis stosuje zasadę minimalizacji danych (art. 5 ust. 1 lit. c RODO). Nie zbiera numerów PESEL. W kalkulatorze świadczeń nie są wymagane żadne dane kontaktowe.</P>
          </Section>

          <Section n="3" title="Zbierane dane i cel przetwarzania">
            <P>3.1. <strong className="text-text-1">Kalkulator świadczeń (niezalogowani użytkownicy):</strong></P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Dane</Th>
                  <Th>Cel</Th>
                  <Th>Podstawa prawna</Th>
                  <Th>Okres</Th>
                </tr>
              </thead>
              <tbody>
                <Tr>
                  <Td>Dane demograficzne (wiek, płeć, dochód, zatrudnienie, sytuacja rodzinna)</Td>
                  <Td>Dopasowanie świadczeń rządowych do profilu</Td>
                  <Td>Art. 6 ust. 1 lit. b RODO (wykonanie usługi)</Td>
                  <Td>Czas trwania zapytania (kilka sekund), bez zapisu</Td>
                </Tr>
                <Tr>
                  <Td>Numer NIP (opcjonalnie)</Td>
                  <Td>Weryfikacja statusu działalności w rejestrze CEIDG</Td>
                  <Td>Art. 6 ust. 1 lit. b RODO</Td>
                  <Td>Tranzytowe: usuwane natychmiast po odpowiedzi CEIDG</Td>
                </Tr>
                <Tr>
                  <Td>Adres IP</Td>
                  <Td>Rate limiting (ochrona przed nadużyciami)</Td>
                  <Td>Art. 6 ust. 1 lit. f RODO (uzasadniony interes)</Td>
                  <Td>Maksymalnie 24 godziny w pamięci operacyjnej; bez zapisu w bazie</Td>
                </Tr>
                <Tr>
                  <Td>Historia czatu i wyniki analizy</Td>
                  <Td>Ciągłość sesji użytkownika</Td>
                  <Td>Art. 6 ust. 1 lit. b RODO</Td>
                  <Td>7 dni w localStorage przeglądarki (wyłącznie lokalnie)</Td>
                </Tr>
              </tbody>
            </TableWrapper>

            <P>3.2. <strong className="text-text-1">Platforma B2B: Dotacje (/dotacje):</strong></P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Dane</Th>
                  <Th>Cel</Th>
                  <Th>Podstawa prawna</Th>
                  <Th>Okres</Th>
                </tr>
              </thead>
              <tbody>
                <Tr>
                  <Td>Adres e-mail, hasło (zaszyfrowane)</Td>
                  <Td>Rejestracja i logowanie do konta firmowego</Td>
                  <Td>Art. 6 ust. 1 lit. b RODO</Td>
                  <Td>Do usunięcia konta lub żądania usunięcia</Td>
                </Tr>
                <Tr>
                  <Td>Dane firmy: NIP, PKD, województwo, liczba zatrudnionych</Td>
                  <Td>Dopasowanie dofinansowań do profilu firmy</Td>
                  <Td>Art. 6 ust. 1 lit. b RODO</Td>
                  <Td>Do usunięcia konta</Td>
                </Tr>
                <Tr>
                  <Td>Dane płatnicze (karta, adres rozliczeniowy)</Td>
                  <Td>Obsługa płatności za tokeny (jednorazowe zakupy)</Td>
                  <Td>Art. 6 ust. 1 lit. b RODO</Td>
                  <Td>Obsługiwane przez Stripe, Administrator nie przechowuje danych kart</Td>
                </Tr>
                <Tr>
                  <Td>Historia dopasowań, eksporty</Td>
                  <Td>Archiwum wyników monitorowania</Td>
                  <Td>Art. 6 ust. 1 lit. b RODO</Td>
                  <Td>Do usunięcia konta; dokumentacja podatkowa: 5 lat</Td>
                </Tr>
              </tbody>
            </TableWrapper>

            <P>3.3. <strong className="text-text-1">Formularz kontaktowy (/automatyzacje):</strong> Imię, nazwa firmy, adres e-mail i treść wiadomości. Cel: odpowiedź na zapytanie o automatyzację. Podstawa: art. 6 ust. 1 lit. b RODO. Dane nie są przechowywane po udzieleniu odpowiedzi.</P>
          </Section>

          <Section n="4" title="Modele AI i przetwarzanie przez systemy sztucznej inteligencji">
            <P>4.1. Serwis wykorzystuje modele sztucznej inteligencji dostarczane przez Google LLC za pośrednictwem platformy OpenRouter, Inc.:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Google Gemini 2.0 Flash: asystent czatowy odpowiadający na pytania o świadczenia</li>
              <li>Google Gemini 2.0 Flash Lite: weryfikacja i filtrowanie wyników dopasowania</li>
            </ul>
            <P>4.2. Do modeli AI przesyłane są wyłącznie zanonimizowane dane demograficzne. Żadne dane umożliwiające bezpośrednią identyfikację Użytkownika nie są przesyłane do systemów AI.</P>
            <P>4.3. Zgodnie z art. 50 Rozporządzenia (UE) 2024/1689 (Akt o Sztucznej Inteligencji), serwis wyraźnie informuje o interakcji z systemem AI w interfejsie aplikacji. Wyniki generowane przez AI mają charakter informacyjny i nie wywołują skutków prawnych (art. 22 RODO).</P>
          </Section>

          <Section n="5" title="Podmioty przetwarzające dane (zewnętrzni procesorzy)">
            <P>5.1. Dane Użytkowników mogą być przekazywane wyłącznie następującym podmiotom:</P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Podmiot</Th>
                  <Th>Rola</Th>
                  <Th>Przekazywane dane</Th>
                  <Th>Umowa/podstawa</Th>
                </tr>
              </thead>
              <tbody>
                <Tr>
                  <Td>OpenRouter, Inc. (USA) / Google LLC</Td>
                  <Td>Obsługa modeli AI</Td>
                  <Td>Zanonimizowane dane demograficzne</Td>
                  <Td>Art. 49 ust. 1 lit. a RODO (zgoda), SCC</Td>
                </Tr>
                <Tr>
                  <Td>CEIDG (Ministerstwo Rozwoju, PL)</Td>
                  <Td>Weryfikacja NIP</Td>
                  <Td>Numer NIP (jeśli podany)</Td>
                  <Td>Art. 6 ust. 1 lit. b RODO</Td>
                </Tr>
                <Tr>
                  <Td>Supabase, Inc. (USA, serwery EU)</Td>
                  <Td>Baza danych kont B2B (/dotacje)</Td>
                  <Td>Dane konta firmowego</Td>
                  <Td>Umowa powierzenia, SCC, serwery w regionie UE</Td>
                </Tr>
                <Tr>
                  <Td>Stripe, Inc. (USA)</Td>
                  <Td>Obsługa płatności (/dotacje)</Td>
                  <Td>Dane karty i adres rozliczeniowy</Td>
                  <Td>SCC, certyfikat PCI DSS; dane kart nie trafiają do serwera Administratora</Td>
                </Tr>
                <Tr>
                  <Td>Resend, Inc. (USA)</Td>
                  <Td>Wysyłka e-mail (alerty, kontakt)</Td>
                  <Td>Adres e-mail odbiorcy, treść wiadomości</Td>
                  <Td>Umowa powierzenia, SCC</Td>
                </Tr>
                <Tr>
                  <Td>Vercel, Inc. (USA, serwery EU)</Td>
                  <Td>Hosting aplikacji</Td>
                  <Td>Logi dostępu (IP, user agent)</Td>
                  <Td>Umowa powierzenia, SCC, serwery EU</Td>
                </Tr>
                <Tr>
                  <Td>Google Ireland Ltd. (IE)</Td>
                  <Td>Google Analytics (statystyki)</Td>
                  <Td>Anonimowe dane o ruchu (wyłącznie po zgodzie)</Td>
                  <Td>Art. 6 ust. 1 lit. a RODO (zgoda użytkownika)</Td>
                </Tr>
              </tbody>
            </TableWrapper>
            <P>5.2. Administrator nie sprzedaje danych Użytkowników. Dane nie są przekazywane organom reklamowym, brokerom danych ani sieciom społecznościowym.</P>
          </Section>

          <Section n="6" title="Pliki cookies">
            <P>6.1. Serwis wykorzystuje następujące typy plików cookie:</P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Typ</Th>
                  <Th>Przykłady</Th>
                  <Th>Cel</Th>
                  <Th>Okres</Th>
                  <Th>Zgoda wymagana</Th>
                </tr>
              </thead>
              <tbody>
                <Tr>
                  <Td><strong className="text-text-1">Niezbędne techniczne</strong></Td>
                  <Td>Sesja Next.js, token CSRF, preferencje cookies</Td>
                  <Td>Poprawne działanie aplikacji, ochrona przed CSRF</Td>
                  <Td>Czas sesji lub do 12 miesięcy</Td>
                  <Td>Nie (art. 6 ust. 1 lit. f RODO)</Td>
                </Tr>
                <Tr>
                  <Td><strong className="text-text-1">Sesja uwierzytelnienia</strong></Td>
                  <Td>sb-auth-token (Supabase)</Td>
                  <Td>Utrzymanie sesji zalogowanego użytkownika B2B</Td>
                  <Td>Do wylogowania lub wygaśnięcia sesji</Td>
                  <Td>Nie (niezbędne do usługi)</Td>
                </Tr>
                <Tr>
                  <Td><strong className="text-text-1">Analityczne</strong></Td>
                  <Td>Google Analytics (_ga, _gid)</Td>
                  <Td>Anonimowe statystyki: liczba wizyt, czas na stronie, źródła ruchu</Td>
                  <Td>Do 13 miesięcy lub cofnięcia zgody</Td>
                  <Td>Tak (baner cookies przy pierwszej wizycie)</Td>
                </Tr>
              </tbody>
            </TableWrapper>
            <P>6.2. Cookies analityczne instalowane są wyłącznie po wyrażeniu zgody przez Użytkownika. Domyślnie Analytics jest wyłączony (Google Consent Mode v2, tryb &quot;denied&quot;). Zgodę można cofnąć w dowolnym momencie, usuwając pliki cookie z przeglądarki.</P>
            <P>6.3. Dane zbierane przez Google Analytics nie są łączone z danymi podawanymi w formularzach. Administrator nie stosuje pikseli śledzących, fingerprintingu przeglądarki, Facebook Pixel ani podobnych narzędzi reklamowych.</P>
            <P>6.4. Podstawa prawna dla cookies analitycznych: art. 6 ust. 1 lit. a RODO (zgoda Użytkownika) oraz art. 173 ust. 1 pkt 2 ustawy Prawo telekomunikacyjne.</P>
          </Section>

          <Section n="7" title="Przekazywanie danych do państw trzecich">
            <P>7.1. Dane mogą być przekazywane do podmiotów w Stanach Zjednoczonych (OpenRouter, Google, Supabase, Stripe, Resend, Vercel). Przekazanie odbywa się na podstawie:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Standardowych klauzul umownych (SCC) zatwierdzonych przez Komisję Europejską</li>
              <li>Art. 49 ust. 1 lit. a RODO (wyraźna zgoda Użytkownika): w przypadku danych przesyłanych do modeli AI</li>
            </ul>
            <P>7.2. Supabase i Vercel przechowują dane B2B na serwerach zlokalizowanych w regionie Unii Europejskiej (Frankfurt, EU West).</P>
          </Section>

          <Section n="8" title="Bezpieczeństwo danych">
            <P>8.1. Administrator stosuje następujące środki ochrony technicznej:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Szyfrowanie HTTPS/TLS dla całego ruchu</li>
              <li>Brak zbierania numerów PESEL ani innych krajowych numerów identyfikacyjnych</li>
              <li>Kalkulator świadczeń nie prowadzi bazy danych osobowych Użytkowników</li>
              <li>Tranzytowe przetwarzanie NIP bez logowania ani buforowania</li>
              <li>Rate limiting oparty na adresie IP (ochrona przed nadużyciami)</li>
              <li>Google Consent Mode v2 (Analytics wyłączony domyślnie)</li>
              <li>Dane kart płatniczych obsługiwane wyłącznie przez Stripe (certyfikat PCI DSS)</li>
              <li>Hasła kont B2B przechowywane w formie zaszyfrowanej przez Supabase Auth</li>
            </ul>
          </Section>

          <Section n="9" title="Prawa Użytkownika">
            <P>9.1. Na podstawie RODO Użytkownikowi przysługują następujące prawa:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Prawo dostępu do danych (art. 15)</li>
              <li>Prawo do sprostowania danych (art. 16)</li>
              <li>Prawo do usunięcia danych (&quot;prawo do bycia zapomnianym&quot;, art. 17)</li>
              <li>Prawo do ograniczenia przetwarzania (art. 18)</li>
              <li>Prawo do przenoszenia danych (art. 20)</li>
              <li>Prawo do sprzeciwu wobec przetwarzania (art. 21)</li>
              <li>Prawo do cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania przed cofnięciem (art. 7 ust. 3)</li>
            </ul>
            <P>9.2. Wnioski dotyczące realizacji praw RODO należy kierować przez formularz kontaktowy na stronie <Link href="/o-projekcie" className="text-accent hover:underline">/o-projekcie</Link>. Administrator odpowiada w ciągu 30 dni od otrzymania wniosku.</P>
            <P>9.3. Ze względu na to, że kalkulator świadczeń nie przechowuje danych osobowych na serwerach Administratora, realizacja praw RODO w tym zakresie jest bezprzedmiotowa. Dane przechowywane lokalnie w przeglądarce (localStorage) są dostępne i usuwalne wyłącznie przez Użytkownika.</P>
            <P>9.4. Cofnięcie zgody: na przetwarzanie danych demograficznych: przez zamknięcie strony. Na Google Analytics: przez zmianę ustawień w banerze cookie lub usunięcie plików cookie z przeglądarki.</P>
            <P>9.5. Użytkownikowi przysługuje prawo wniesienia skargi do organu nadzorczego: Prezesa Urzędu Ochrony Danych Osobowych:</P>
            <div className="pl-4 mt-2 space-y-1 text-[13px] text-text-3">
              <p>Urząd Ochrony Danych Osobowych</p>
              <p>ul. Stawki 2, 00-193 Warszawa</p>
              <p>Infolinia: 606 950 000</p>
              <p><a href="https://uodo.gov.pl/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">uodo.gov.pl</a></p>
            </div>
          </Section>

          <Section n="10" title="Dane przechowywane w przeglądarce (localStorage)">
            <P>10.1. Serwis automatycznie zapisuje historię rozmów z asystentem AI oraz wyniki analizy świadczeń w lokalnym magazynie przeglądarki (localStorage) na urządzeniu Użytkownika. Dane te:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Przechowywane są wyłącznie lokalnie i wygasają automatycznie po 7 dniach</li>
              <li>Administrator nie ma dostępu do danych przechowywanych w localStorage</li>
              <li>Użytkownik może je usunąć klikając &quot;Zacznij od nowa&quot; lub czyszcząc localStorage w ustawieniach przeglądarki</li>
            </ul>
            <P>10.2. Podstawa prawna: art. 6 ust. 1 lit. b RODO (niezbędność do wykonania usługi, zachowanie ciągłości sesji).</P>
          </Section>

          <Section n="11" title="Usługa pomocy w wypełnieniu wniosku (/wnioski)">
            <P>11.1. Usługa przetwarza informacje opisowe o projekcie lub sytuacji Użytkownika podane w formularzu. Dane te nie zawierają numerów PESEL, NIP ani innych identyfikatorów, chyba że Użytkownik sam je wpisze.</P>
            <P>11.2. Informacje są przesyłane do modelu AI wyłącznie w celu wygenerowania treści do pól formularza. Administrator nie przechowuje tych danych na serwerach. Wygenerowane treści przechowywane są wyłącznie lokalnie w przeglądarce Użytkownika.</P>
            <P>11.3. Podstawa prawna: art. 6 ust. 1 lit. b RODO.</P>
          </Section>

          <Section n="12" title="Profilowanie i zautomatyzowane podejmowanie decyzji">
            <P>12.1. Serwis nie podejmuje decyzji wywołujących skutki prawne w rozumieniu art. 22 RODO. Wyniki generowane przez serwis mają charakter wyłącznie informacyjny, nie stanowią decyzji administracyjnej, przyrzeczenia świadczenia ani wiążącej opinii prawnej.</P>
            <P>12.2. Serwis nie prowadzi profilowania Użytkowników w celach reklamowych ani handlowych.</P>
          </Section>

          <Section n="13" title="Źródła danych o świadczeniach">
            <P>13.1. Informacje o świadczeniach rządowych prezentowane w serwisie pochodzą wyłącznie z oficjalnych, publicznych źródeł: gov.pl, zus.pl, nfz.gov.pl, podatki.gov.pl, pfron.org.pl, praca.gov.pl, krus.gov.pl. Linki do źródeł widoczne są bezpośrednio w interfejsie serwisu. Dane weryfikowane są regularnie, jednak Administrator nie gwarantuje ich aktualności w każdym momencie.</P>
          </Section>

          <Section n="14" title="Zmiany polityki prywatności">
            <P>14.1. Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. Aktualna wersja jest zawsze dostępna pod adresem /polityka-prywatnosci. Data ostatniej aktualizacji widoczna jest na górze dokumentu. Dalsze korzystanie z serwisu po wprowadzeniu zmian oznacza ich akceptację.</P>
          </Section>

          <Section n="15" title="Kontakt">
            <P>15.1. We wszelkich sprawach dotyczących ochrony danych osobowych: formularz kontaktowy dostępny na stronie <Link href="/o-projekcie" className="text-accent hover:underline">/o-projekcie</Link>.</P>
            <P>15.2. Administrator dąży do udzielenia odpowiedzi w ciągu 72 godzin. Na wnioski RODO Administrator odpowiada w ciągu 30 dni.</P>
          </Section>

        </div>

        <div className="mt-12 pt-4 border-t border-border text-[12px] text-text-3">
          <Link href="/regulamin" className="text-accent hover:underline">
            Regulamin
          </Link>
          <span className="mx-2">|</span>
          <Link href="/" className="text-accent hover:underline">
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[16px] sm:text-[18px] font-bold text-text-1 mb-3">
        {n}. {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}

function TableWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto mt-3 mb-2">
      <table className="w-full text-[13px] border-collapse">
        {children}
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left py-2 px-3 text-text-3 font-semibold border-b border-border bg-surface text-[12px] uppercase tracking-wide">
      {children}
    </th>
  );
}

function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-border">{children}</tr>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="py-2 px-3 align-top text-text-2">{children}</td>;
}
