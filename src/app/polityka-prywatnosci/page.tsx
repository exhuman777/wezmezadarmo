import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatności | wezmezadarmo.com',
  description: 'Polityka prywatności serwisu wezmezadarmo.com. Informacje o przetwarzaniu danych osobowych zgodnie z RODO i EU AI Act.',
};

const EMAIL = 'sobkowicz.kamil@gmail.com';

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
          Ostatnia aktualizacja: 23 maja 2026 r.
        </p>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Administrator danych osobowych">
            <P>1.1. Administratorem danych osobowych jest:</P>
            <div className="pl-4 mt-1 mb-2 space-y-1 text-[14px]">
              <p><strong className="text-text-1">Mooning Charts Research Kamil Sobkowicz</strong></p>
              <p>NIP: 7133061369</p>
              <p>Kontakt: formularz na stronie <Link href="/o-projekcie" className="text-accent hover:underline">/o-projekcie</Link> lub <ContactEmail />.</p>
            </div>
            <P>1.2. Niniejsza Polityka Prywatności została opracowana zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2024/1689 (Akt o Sztucznej Inteligencji, dalej: &quot;EU AI Act&quot;).</P>
            <P>1.3. Serwis nie jest organem administracji publicznej. Wyniki generowane przez Serwis mają charakter wyłącznie informacyjny i nie stanowią decyzji administracyjnej ani wiążącej opinii prawnej.</P>
          </Section>

          <Section n="2" title="Zakres serwisu i zasada minimalizacji danych">
            <P>Serwis wezmezadarmo.com świadczy następujące usługi:</P>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong className="text-text-1">Kalkulator świadczeń</strong> (strona główna): bezstanowy, bez kont, bez bazy danych osobowych. Dane przetwarzane jednorazowo w pamięci serwera i natychmiast usuwane.</li>
              <li><strong className="text-text-1">Kreator wniosków ZUS</strong> (/wnioski): formularze Z-15A, Z-15B, Z-3, ZAS-53, PEL, ERPO, ERSU. PESEL (jeśli wymagany) przetwarzany jednorazowo w pamięci serwera w celu wygenerowania PDF, bez zapisu.</li>
              <li><strong className="text-text-1">Wyszukiwarka NFZ</strong> (/nfz): bez konta. Zapytania (świadczenie, województwo, miasto) wysyłane do publicznego API NFZ. Brak danych osobowych Użytkownika w zapytaniach.</li>
              <li><strong className="text-text-1">Centrum Obywatela</strong> (/centrum-obywatela): hub 11 publicznych polskich API (NFZ, NBP, GIOŚ, Biała Lista VAT, IMGW/RCB, ELI/Sejm, BDL GUS, ARiMR, PKP, CEIDG). Operator nie przekazuje do tych API żadnych danych osobowych Użytkownika.</li>
              <li><strong className="text-text-1">Aktualności rządowe</strong> (/aktualnosci): agregator RSS z 8 instytucji + widgety publiczne (kursy NBP, jakość powietrza GIOŚ). Bez konta.</li>
              <li><strong className="text-text-1">Panel agenta AI</strong> (/agent/panel): bezpłatny, wymaga rejestracji. Profil demograficzny i preferencje e-mail w bazie Supabase (serwery UE).</li>
              <li><strong className="text-text-1">Panel monitoringu dotacji</strong> (/dotacje/panel): bezpłatny, wymaga rejestracji. Dane firmowe w Supabase (UE). Bez opłat.</li>
              <li><strong className="text-text-1">Automatyzacje dla firm</strong> (/dla-firm, /automatyzacje): strona informacyjna o automatyzacjach dostępnych dla europejskich firm. Wdrożenia realizują niezależni europejscy partnerzy (co-promocja); Operator nie pobiera danych firmowych.</li>
            </ul>
            <P>2.1. Serwis stosuje zasadę minimalizacji danych (art. 5 ust. 1 lit. c RODO). Kalkulator świadczeń nie zbiera numeru PESEL ani danych kontaktowych. PESEL może być podany jedynie w kreatorze wniosków - wyłącznie do wygenerowania PDF, bez zapisu.</P>
          </Section>

          <Section n="3" title="Zbierane dane i cel przetwarzania">
            <P>3.1. <strong className="text-text-1">Kalkulator świadczeń (niezalogowani Użytkownicy):</strong></P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Dane</Th><Th>Cel</Th><Th>Podstawa prawna</Th><Th>Okres</Th>
                </tr>
              </thead>
              <tbody>
                <Tr><Td>Dane demograficzne (wiek, płeć, dochód, zatrudnienie, sytuacja rodzinna)</Td><Td>Dopasowanie świadczeń do profilu</Td><Td>Art. 6 ust. 1 lit. b RODO (wykonanie usługi)</Td><Td>Czas trwania zapytania (kilka sekund), bez zapisu</Td></Tr>
                <Tr><Td>Numer NIP (opcjonalnie)</Td><Td>Weryfikacja statusu działalności w CEIDG + statusu VAT w Białej Liście (równolegle, po stronie serwera)</Td><Td>Art. 6 ust. 1 lit. b RODO</Td><Td>Tranzytowe: usuwane natychmiast po odpowiedzi z publicznych API</Td></Tr>
                <Tr><Td>Adres IP</Td><Td>Rate limiting (ochrona przed nadużyciami)</Td><Td>Art. 6 ust. 1 lit. f RODO (uzasadniony interes)</Td><Td>Maks. 24 godziny w pamięci operacyjnej; bez zapisu</Td></Tr>
                <Tr><Td>Historia czatu i wyniki analizy</Td><Td>Ciągłość sesji</Td><Td>Art. 6 ust. 1 lit. b RODO</Td><Td>7 dni w localStorage przeglądarki</Td></Tr>
              </tbody>
            </TableWrapper>

            <P>3.2. <strong className="text-text-1">Panel monitoringu dotacji B2B (/dotacje/panel):</strong></P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Dane</Th><Th>Cel</Th><Th>Podstawa prawna</Th><Th>Okres</Th>
                </tr>
              </thead>
              <tbody>
                <Tr><Td>Adres e-mail, hasło (zaszyfrowane)</Td><Td>Rejestracja i logowanie do konta firmowego</Td><Td>Art. 6 ust. 1 lit. b RODO</Td><Td>Do usunięcia konta lub żądania usunięcia</Td></Tr>
                <Tr><Td>Dane firmy: NIP, PKD, województwo, wielkość</Td><Td>Dopasowanie dofinansowań do profilu firmy</Td><Td>Art. 6 ust. 1 lit. b RODO</Td><Td>Do usunięcia konta</Td></Tr>
                <Tr><Td>Historia dopasowań, eksporty</Td><Td>Archiwum monitoringu</Td><Td>Art. 6 ust. 1 lit. b RODO</Td><Td>Do usunięcia konta</Td></Tr>
              </tbody>
            </TableWrapper>
            <P className="text-[13px] text-text-3 italic">Uwaga: Serwis jest bezpłatny i nie obsługuje żadnych płatności. Nie wykorzystujemy procesora płatności typu Stripe.</P>

            <P>3.3. <strong className="text-text-1">Panel agenta (/agent/panel):</strong></P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Dane</Th><Th>Cel</Th><Th>Podstawa prawna</Th><Th>Okres</Th>
                </tr>
              </thead>
              <tbody>
                <Tr><Td>Adres e-mail, hasło (zaszyfrowane)</Td><Td>Rejestracja i logowanie</Td><Td>Art. 6 ust. 1 lit. b RODO</Td><Td>Do usunięcia konta</Td></Tr>
                <Tr><Td>Profil demograficzny (wiek, płeć, dochód, zatrudnienie, sytuacja rodzinna, województwo)</Td><Td>Dopasowanie świadczeń</Td><Td>Art. 6 ust. 1 lit. b RODO</Td><Td>Do usunięcia konta</Td></Tr>
                <Tr><Td>Preferencje e-mail (kategorie, godzina digestu)</Td><Td>Wysyłka dziennego raportu e-mail</Td><Td>Art. 6 ust. 1 lit. b RODO</Td><Td>Do usunięcia konta lub wyłączenia digestu</Td></Tr>
                <Tr><Td>Log wysłanych digestów (data, liczba pozycji)</Td><Td>Diagnostyka i zapobieganie duplikatom</Td><Td>Art. 6 ust. 1 lit. f RODO</Td><Td>90 dni</Td></Tr>
              </tbody>
            </TableWrapper>

            <P>3.4. <strong className="text-text-1">Formularz kontaktowy:</strong> Imię, nazwa firmy, adres e-mail i treść wiadomości. Cel: odpowiedź na zapytanie. Podstawa: art. 6 ust. 1 lit. b RODO. Dane nie są przechowywane po udzieleniu odpowiedzi.</P>

            <P>3.5. <strong className="text-text-1">Centrum Obywatela i wyszukiwarka NFZ - zapytania do publicznych API:</strong></P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Dane wysyłane</Th><Th>Cel</Th><Th>Dane PII?</Th>
                </tr>
              </thead>
              <tbody>
                <Tr><Td>Lat/lon wybranego miasta (GIOŚ)</Td><Td>Znalezienie najbliższej stacji pomiarowej</Td><Td>Nie - współrzędne miasta są publiczne</Td></Tr>
                <Tr><Td>Świadczenie + województwo + miasto (NFZ)</Td><Td>Wyszukanie kolejek lub świadczeniodawców</Td><Td>Nie - parametry zapytania</Td></Tr>
                <Tr><Td>NIP firmy (Biała Lista VAT, CEIDG)</Td><Td>Sprawdzenie kontrahenta</Td><Td>NIP firmy nie jest danymi osobowymi (osoba prawna)</Td></Tr>
                <Tr><Td>Brak danych (NBP, ELI, RCB)</Td><Td>Pobranie publicznych komunikatów</Td><Td>Nie - dane statyczne</Td></Tr>
              </tbody>
            </TableWrapper>
          </Section>

          <Section n="4" title="Modele AI i przetwarzanie przez systemy sztucznej inteligencji">
            <P>4.1. Serwis wykorzystuje modele AI dostarczane przez Google LLC za pośrednictwem platformy OpenRouter, Inc.:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Google Gemini 2.0 Flash: asystent czatowy</li>
              <li>Google Gemini 2.0 Flash Lite: weryfikacja i filtrowanie wyników dopasowania</li>
            </ul>
            <P>4.2. Do modeli AI <strong className="text-text-1">NIE są przesyłane</strong>: imię, nazwisko, numer PESEL, adres zamieszkania, adres e-mail. Przesyłany jest profil demograficzny (wiek, płeć, dochód, zatrudnienie, sytuacja rodzinna, województwo) oraz lista dopasowanych świadczeń.</P>
            <P>4.3. <strong className="text-text-1">Klasyfikacja zgodnie z EU AI Act (art. 6)</strong>: system AI w Serwisie należy do klasy <strong className="text-text-1">MINIMALNE RYZYKO</strong>. System nie wykorzystuje praktyk zakazanych (art. 5), nie jest systemem wysokiego ryzyka (Załącznik III), nie podejmuje decyzji wywołujących skutki prawne (art. 22 RODO).</P>
            <P>4.4. <strong className="text-text-1">Obowiązki przejrzystości (art. 50 EU AI Act)</strong>:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Użytkownik jest jasno informowany o interakcji z AI (oznaczenie &quot;Asystent AI&quot; w nagłówku panelu czatu, badge &quot;AI&quot; przy wiadomościach);</li>
              <li>treści generowane przez AI są wyraźnie oznaczone w interfejsie;</li>
              <li>Operator nie generuje deepfake&apos;ów ani treści wprowadzających w błąd.</li>
            </ul>
            <P>4.5. Wyniki generowane przez AI mają charakter wyłącznie informacyjny. Ostateczna decyzja o przyznaniu świadczenia należy do właściwego organu administracji publicznej.</P>
          </Section>

          <Section n="5" title="Podmioty przetwarzające dane (procesorzy)">
            <P>5.1. Dane Użytkowników mogą być przekazywane następującym procesorom:</P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Podmiot</Th><Th>Rola</Th><Th>Przekazywane dane</Th><Th>Umowa/podstawa</Th>
                </tr>
              </thead>
              <tbody>
                <Tr><Td>OpenRouter, Inc. (USA) / Google LLC</Td><Td>Obsługa modeli AI</Td><Td>Profil demograficzny i dopasowane świadczenia</Td><Td>Art. 49 ust. 1 lit. a RODO (zgoda), SCC</Td></Tr>
                <Tr><Td>Supabase, Inc. (USA, serwery EU)</Td><Td>Baza kont (agent + dotacje B2B)</Td><Td>E-mail, hasło (hash), profil, dane firmy</Td><Td>Umowa powierzenia, SCC, serwery w UE</Td></Tr>
                <Tr><Td>Resend, Inc. (USA)</Td><Td>Wysyłka e-mail (digest, kontakt)</Td><Td>Adres e-mail odbiorcy, treść wiadomości</Td><Td>Umowa powierzenia, SCC</Td></Tr>
                <Tr><Td>Vercel, Inc. (USA, serwery EU)</Td><Td>Hosting aplikacji</Td><Td>Logi dostępu (IP, user agent)</Td><Td>Umowa powierzenia, SCC, serwery EU</Td></Tr>
                <Tr><Td>Google Ireland Ltd. (IE)</Td><Td>Google Analytics (po zgodzie)</Td><Td>Anonimowe dane o ruchu</Td><Td>Art. 6 ust. 1 lit. a RODO (zgoda)</Td></Tr>
                <Tr><Td>GitHub Inc. / Microsoft (USA)</Td><Td>Cron RSS cache (GitHub Actions)</Td><Td>Brak PII Użytkowników (tylko pobieranie publicznych RSS)</Td><Td>Infrastruktura SaaS</Td></Tr>
                <Tr><Td>Cloudflare, Inc. (USA)</Td><Td>Worker proxy RSS (opcjonalny)</Td><Td>Brak PII Użytkowników (tylko pośrednictwo)</Td><Td>Infrastruktura SaaS</Td></Tr>
              </tbody>
            </TableWrapper>
            <P className="text-[13px] text-text-3 italic">Operator NIE wykorzystuje procesora płatności (Stripe nie jest używany). Wszystkie funkcje serwisu są bezpłatne.</P>

            <P>5.2. Administrator nie sprzedaje danych Użytkowników. Dane nie są przekazywane brokerom danych, sieciom reklamowym ani społecznościowym.</P>

            <P>5.3. <strong className="text-text-1">Źródła publicznych danych</strong> (to my pobieramy dane z nich - nie odwrotnie; żadne dane osobowe Użytkowników nie są przekazywane do tych podmiotów):</P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Instytucja</Th><Th>Co udostępnia</Th><Th>URL API</Th>
                </tr>
              </thead>
              <tbody>
                <Tr><Td>CEIDG (Min. Rozwoju)</Td><Td>Rejestr JDG po NIP</Td><Td>dane.biznes.gov.pl</Td></Tr>
                <Tr><Td>Min. Finansów (Biała Lista)</Td><Td>Status VAT firm + konta bankowe</Td><Td>wl-api.mf.gov.pl</Td></Tr>
                <Tr><Td>NFZ</Td><Td>Kolejki, świadczeniodawcy</Td><Td>api.nfz.gov.pl</Td></Tr>
                <Tr><Td>NBP</Td><Td>Kursy walut</Td><Td>api.nbp.pl</Td></Tr>
                <Tr><Td>GIOŚ</Td><Td>Jakość powietrza</Td><Td>api.gios.gov.pl</Td></Tr>
                <Tr><Td>IMGW / RCB</Td><Td>Ostrzeżenia meteo i kryzysowe</Td><Td>api.rcb.gov.pl</Td></Tr>
                <Tr><Td>Sejm RP (ELI)</Td><Td>Zmiany w prawie</Td><Td>api.sejm.gov.pl/eli</Td></Tr>
                <Tr><Td>GUS (BDL)</Td><Td>Dane demograficzne per gmina</Td><Td>bdl.stat.gov.pl</Td></Tr>
                <Tr><Td>ARiMR</Td><Td>Mapy działek rolnych</Td><Td>geoportal.arimr.gov.pl</Td></Tr>
                <Tr><Td>PKP</Td><Td>Rozkład jazdy, ulgi</Td><Td>portalpasazera.pl</Td></Tr>
                <Tr><Td>Instytucje RSS (8)</Td><Td>Aktualności rządowe</Td><Td>Publiczne feedy RSS</Td></Tr>
              </tbody>
            </TableWrapper>
          </Section>

          <Section n="6" title="Pliki cookies">
            <P>6.1. Serwis wykorzystuje następujące typy plików cookie:</P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Typ</Th><Th>Przykłady</Th><Th>Cel</Th><Th>Okres</Th><Th>Zgoda</Th>
                </tr>
              </thead>
              <tbody>
                <Tr><Td><strong className="text-text-1">Niezbędne techniczne</strong></Td><Td>Sesja Next.js, CSRF, preferencje cookies</Td><Td>Poprawne działanie, ochrona CSRF</Td><Td>Sesja lub 12 mies.</Td><Td>Nie</Td></Tr>
                <Tr><Td><strong className="text-text-1">Sesja uwierzytelnienia</strong></Td><Td>sb-auth-token (Supabase) - dla zalogowanych w /agent/panel i /dotacje/panel</Td><Td>Utrzymanie sesji</Td><Td>Do wylogowania lub wygaśnięcia</Td><Td>Nie (niezbędne)</Td></Tr>
                <Tr><Td><strong className="text-text-1">Analityczne</strong></Td><Td>Google Analytics (_ga, _gid)</Td><Td>Anonimowe statystyki</Td><Td>Do 13 mies.</Td><Td>Tak (baner)</Td></Tr>
              </tbody>
            </TableWrapper>
            <P>6.2. Cookies analityczne instalowane są wyłącznie po wyrażeniu zgody (Google Consent Mode v2, domyślnie tryb &quot;denied&quot;). Zgodę można cofnąć przez usunięcie cookies z przeglądarki.</P>
            <P>6.3. Dane z Google Analytics nie są łączone z danymi z formularzy. Serwis nie stosuje pikseli śledzących, fingerprintingu ani Facebook Pixel.</P>
            <P>6.4. Podstawa prawna: art. 6 ust. 1 lit. a RODO (zgoda) oraz art. 173 ust. 1 pkt 2 ustawy Prawo telekomunikacyjne.</P>
          </Section>

          <Section n="7" title="Przekazywanie danych do państw trzecich">
            <P>7.1. Dane mogą być przekazywane do podmiotów w USA (OpenRouter, Google, Supabase, Resend, Vercel, GitHub, Cloudflare) na podstawie:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Standardowych klauzul umownych (SCC) zatwierdzonych przez Komisję Europejską;</li>
              <li>Art. 49 ust. 1 lit. a RODO (wyraźna zgoda) - w przypadku danych przesyłanych do modeli AI.</li>
            </ul>
            <P>7.2. Supabase i Vercel przechowują dane B2B na serwerach zlokalizowanych w regionie Unii Europejskiej (Frankfurt, EU West).</P>
          </Section>

          <Section n="8" title="Bezpieczeństwo danych">
            <P>8.1. Administrator stosuje następujące środki ochrony technicznej:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Szyfrowanie HTTPS/TLS dla całego ruchu;</li>
              <li>Kalkulator świadczeń nie zbiera numeru PESEL. W kreatorze wniosków (/wnioski) PESEL przetwarzany jest jednorazowo w pamięci serwera bez zapisu;</li>
              <li>Tokeny do publicznych API (CEIDG) przechowywane wyłącznie po stronie serwera (zmienne środowiskowe Vercel), nigdy nie trafiają do przeglądarki;</li>
              <li>Rate limiting per adres IP na wszystkich endpointach publicznych (ochrona przed nadużyciami);</li>
              <li>Cache odpowiedzi z publicznych API (CEIDG, Biała Lista, NFZ, GIOŚ, NBP) - minimalizacja obciążenia źródeł i ekspozycji danych;</li>
              <li>Google Consent Mode v2 (Analytics wyłączony domyślnie);</li>
              <li>Hasła kont przechowywane w formie zaszyfrowanej przez Supabase Auth (bcrypt);</li>
              <li>Sanityzacja błędów - klient otrzymuje generyczne komunikaty, szczegóły trafiają tylko do logów serwera.</li>
            </ul>
          </Section>

          <Section n="9" title="Prawa Użytkownika">
            <P>9.1. Na podstawie RODO Użytkownikowi przysługują następujące prawa:</P>
            <ul className="list-disc pl-6 space-y-1 mt-1">
              <li>Prawo dostępu do danych (art. 15);</li>
              <li>Prawo do sprostowania danych (art. 16);</li>
              <li>Prawo do usunięcia danych (&quot;prawo do bycia zapomnianym&quot;, art. 17);</li>
              <li>Prawo do ograniczenia przetwarzania (art. 18);</li>
              <li>Prawo do przenoszenia danych (art. 20);</li>
              <li>Prawo do sprzeciwu wobec przetwarzania (art. 21);</li>
              <li>Prawo do cofnięcia zgody w dowolnym momencie bez wpływu na zgodność z prawem przetwarzania przed cofnięciem (art. 7 ust. 3).</li>
            </ul>
            <P>9.2. Wnioski dotyczące realizacji praw RODO należy kierować przez formularz kontaktowy na stronie <Link href="/o-projekcie" className="text-accent hover:underline">/o-projekcie</Link> lub przez <ContactEmail />. Administrator odpowiada w ciągu 30 dni.</P>
            <P>9.3. Ze względu na to, że kalkulator świadczeń nie przechowuje danych osobowych na serwerach Administratora, realizacja praw RODO w tym zakresie jest bezprzedmiotowa. Dane przechowywane lokalnie w przeglądarce (localStorage) są dostępne i usuwalne wyłącznie przez Użytkownika.</P>
            <P>9.4. Cofnięcie zgody: na przetwarzanie danych demograficznych - przez zamknięcie strony. Na Google Analytics - przez zmianę ustawień w banerze cookie lub usunięcie cookies z przeglądarki.</P>
            <P>9.5. Użytkownikowi przysługuje prawo wniesienia skargi do organu nadzorczego: Prezesa Urzędu Ochrony Danych Osobowych:</P>
            <div className="pl-4 mt-2 space-y-1 text-[13px] text-text-3">
              <p>Urząd Ochrony Danych Osobowych</p>
              <p>ul. Stawki 2, 00-193 Warszawa</p>
              <p>Infolinia: 606 950 000</p>
              <p><a href="https://uodo.gov.pl/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">uodo.gov.pl</a></p>
            </div>
          </Section>

          <Section n="10" title="Dane przechowywane w przeglądarce (localStorage)">
            <P>10.1. Serwis zapisuje następujące dane lokalnie w przeglądarce (localStorage). Administrator nie ma do nich dostępu:</P>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Klucz</Th><Th>Co zawiera</Th><Th>TTL</Th>
                </tr>
              </thead>
              <tbody>
                <Tr><Td><code className="text-[12px]">wzd_session_v1</code></Td><Td>Profil kalkulatora + historia czatu z asystentem AI</Td><Td>7 dni</Td></Tr>
                <Tr><Td><code className="text-[12px]">wzd_cookie_consent</code></Td><Td>Zgoda na cookies analityczne</Td><Td>12 miesięcy</Td></Tr>
                <Tr><Td><code className="text-[12px]">wzd_air_city</code></Td><Td>Wybór miasta dla widgetu jakości powietrza GIOŚ</Td><Td>Bezterminowo (do ręcznego usunięcia)</Td></Tr>
                <Tr><Td><code className="text-[12px]">wzd_nfz_recent_queues</code></Td><Td>5 ostatnich wyszukiwań kolejek NFZ</Td><Td>Bezterminowo</Td></Tr>
                <Tr><Td><code className="text-[12px]">wzd_nfz_recent_providers</code></Td><Td>5 ostatnich wyszukiwań świadczeniodawców NFZ</Td><Td>Bezterminowo</Td></Tr>
              </tbody>
            </TableWrapper>
            <P>10.2. Wszystkie klucze można usunąć ręcznie w ustawieniach przeglądarki lub przyciskiem &quot;Zacznij od nowa&quot; w aplikacji (czyści <code className="text-[12px]">wzd_session_v1</code>).</P>
            <P>10.3. Podstawa prawna: art. 6 ust. 1 lit. b RODO (niezbędność do wykonania usługi) oraz art. 173 Prawa telekomunikacyjnego (cookies analityczne tylko po zgodzie).</P>
          </Section>

          <Section n="11" title="Usługa pomocy w wypełnieniu wniosku (/wnioski)">
            <P>11.1. Usługa przetwarza dane podane przez Użytkownika w formularzu, w tym numer PESEL (jeśli wymagany przez dany formularz ZUS: Z-15A, Z-15B, Z-3, ZAS-53, PEL, ERPO, ERSU). Dane formularza przesyłane są na serwer wyłącznie w celu wygenerowania pliku PDF i są przetwarzane jednorazowo w pamięci operacyjnej bez zapisu w bazie danych.</P>
            <P>11.2. Asystent AI w kreatorze (/api/form-assist) otrzymuje wyłącznie informacje opisowe o sytuacji Użytkownika. Numer PESEL NIE jest przesyłany do modeli AI. Wygenerowane treści przechowywane są wyłącznie lokalnie w przeglądarce.</P>
            <P>11.3. Podstawa prawna: art. 6 ust. 1 lit. b RODO.</P>
          </Section>

          <Section n="12" title="Profilowanie i zautomatyzowane podejmowanie decyzji">
            <P>12.1. Serwis nie podejmuje decyzji wywołujących skutki prawne w rozumieniu art. 22 RODO. Wyniki generowane przez Serwis mają charakter wyłącznie informacyjny, nie stanowią decyzji administracyjnej, przyrzeczenia świadczenia ani wiążącej opinii prawnej.</P>
            <P>12.2. Serwis nie prowadzi profilowania Użytkowników w celach reklamowych ani handlowych.</P>
            <P>12.3. Zgodnie z EU AI Act, system AI wykorzystywany w Serwisie ma klasę <strong className="text-text-1">minimalnego ryzyka</strong> i pełni wyłącznie rolę informacyjno-doradczą.</P>
          </Section>

          <Section n="13" title="Źródła danych o świadczeniach">
            <P>13.1. Informacje o świadczeniach rządowych pochodzą wyłącznie z oficjalnych, publicznych źródeł: gov.pl, zus.pl, nfz.gov.pl, podatki.gov.pl, pfron.org.pl, praca.gov.pl, krus.gov.pl, biznes.gov.pl, nfosigw.gov.pl. Linki widoczne są bezpośrednio w interfejsie. Dane weryfikowane są regularnie, jednak Administrator nie gwarantuje ich aktualności w każdym momencie.</P>
            <P>13.2. Linki wychodzące do podmiotów trzecich (m.in. partner VIA - tryvia.eu) są oznaczone w interfejsie. Administrator nie ponosi odpowiedzialności za politykę prywatności i działanie serwisów zewnętrznych.</P>
          </Section>

          <Section n="14" title="Zmiany polityki prywatności">
            <P>14.1. Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. Aktualna wersja jest zawsze dostępna pod adresem /polityka-prywatnosci. Data ostatniej aktualizacji widoczna jest na górze dokumentu. Dalsze korzystanie z Serwisu po wprowadzeniu zmian oznacza ich akceptację.</P>
          </Section>

          <Section n="15" title="Kontakt">
            <P>15.1. We wszelkich sprawach dotyczących ochrony danych osobowych: formularz kontaktowy na stronie <Link href="/o-projekcie" className="text-accent hover:underline">/o-projekcie</Link> lub <ContactEmail />.</P>
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

function ContactEmail() {
  return <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">email</a>;
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
