import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatności | wezmezadarmo',
  description: 'Polityka prywatności serwisu wezmezadarmo. Informacje o przetwarzaniu danych osobowych zgodnie z RODO.',
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
          Ostatnia aktualizacja: 15 maja 2026 r.
        </p>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Administrator danych osobowych">
            <P>1.1. Administratorem danych osobowych jest Kamil Sobkowicz, adres e-mail: sobkowicz.kamil@gmail.com (dalej: &quot;Administrator&quot;).</P>
            <P>1.2. We wszelkich sprawach dotyczących ochrony danych osobowych można kontaktować się pod adresem: sobkowicz.kamil@gmail.com.</P>
            <P>1.3. Niniejsza Polityka Prywatności została opracowana zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO) oraz Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2024/1689 (Akt o Sztucznej Inteligencji).</P>
          </Section>

          <Section n="2" title="Zasada minimalizacji danych i brak bazy użytkowników">
            <P>2.1. Serwis stosuje zasadę minimalizacji danych (art. 5 ust. 1 lit. c RODO). Serwis nie zbiera, nie przetwarza ani nie przechowuje numerów PESEL. Użytkownik podaje wyłącznie wiek i płeć bezpośrednio w formularzu -- żadne numery identyfikacyjne nie są wymagane ani akceptowane.</P>
            <P>2.2. Serwis nie prowadzi żadnej bazy danych użytkowników. Na serwerach Administratora nie są przechowywane żadne profile użytkowników, historia wyszukiwań ani wyniki analiz. Każde zapytanie przetwarzane jest jednorazowo w pamięci operacyjnej serwera i natychmiast usuwane po zwróceniu odpowiedzi.</P>
            <P>2.3. Serwis nie rejestruje Użytkowników, nie zakłada kont i nie wymaga podania adresu e-mail ani żadnych danych kontaktowych.</P>
          </Section>

          <Section n="3" title="Źródła danych o świadczeniach">
            <P>3.1. Informacje o świadczeniach rządowych prezentowane w Serwisie pochodzą wyłącznie z oficjalnych, publicznych źródeł: gov.pl, zus.pl, nfz.gov.pl, podatki.gov.pl, pfron.org.pl, praca.gov.pl, krus.gov.pl. Linki do tych źródeł są widoczne bezpośrednio w interfejsie Serwisu.</P>
            <P>3.2. Serwis nie pobiera ani nie przetwarza danych osobowych Użytkownika z publicznych rejestrów. Jedynym wyjątkiem jest opcjonalna weryfikacja numeru NIP w CEIDG na żądanie Użytkownika (sekcja 4.1b).</P>
          </Section>

          <Section n="4" title="Zakres przetwarzanych danych">
            <P>4.1. Serwis przetwarza następujące dane:</P>
            <P className="pl-4">a) Dane demograficzne i sytuacyjne podane ręcznie w formularzu: wiek, płeć, stan cywilny, liczba dzieci (i ich wiek), dochód miesięczny i na osobę, forma zatrudnienia, stopień niepełnosprawności, forma własności mieszkania, województwo, status działalności gospodarczej, ciąża, status studenta, emeryta, rolnika, osoby bezrobotnej. Dane te są przetwarzane w pamięci operacyjnej serwera wyłącznie na czas trwania zapytania (kilka sekund) i usuwane natychmiast po zwróceniu wyników Użytkownikowi. Nie są nigdzie zapisywane na serwerze Administratora.</P>
            <P className="pl-4">b) Numer NIP (opcjonalnie) -- jeżeli Użytkownik poda numer NIP, jest on przesyłany do publicznego rejestru CEIDG (API dane.biznes.gov.pl) w celu weryfikacji statusu działalności gospodarczej. Numer NIP nie jest zapisywany na serwerze Administratora. Przetwarzanie NIP ma charakter tranzytowy -- numer jest przekazywany do API CEIDG i natychmiast usuwany z pamięci serwera po uzyskaniu odpowiedzi.</P>
            <P className="pl-4">c) Adres IP -- przetwarzany wyłącznie w celu ograniczenia liczby zapytań do asystenta AI (rate limiting). Adres IP jest przechowywany w pamięci operacyjnej serwera i usuwany automatycznie po 24 godzinach lub po restarcie serwera. Nie jest zapisywany w bazie danych ani logach. Podstawa prawna: art. 6 ust. 1 lit. f) RODO (prawnie uzasadniony interes Administratora polegający na zapewnieniu dostępności Usługi i ochronie przed nadużyciami).</P>
            <P className="pl-4">d) Historia czatu i wyniki analizy (localStorage) -- Serwis automatycznie zapisuje historię rozmów z asystentem AI oraz wyniki analizy świadczeń w lokalnym magazynie przeglądarki (localStorage) na urządzeniu Użytkownika. Są przechowywane wyłącznie lokalnie i wygasają automatycznie po 7 dniach. Administrator nie ma dostępu do danych przechowywanych w localStorage. Użytkownik może usunąć te dane klikając &quot;Zacznij od nowa&quot; lub czyszcząc localStorage w ustawieniach przeglądarki. Podstawa prawna: art. 6 ust. 1 lit. b) RODO (niezbędność do wykonania umowy -- zachowanie ciągłości sesji).</P>
          </Section>

          <Section n="5" title="Cele i podstawy prawne przetwarzania">
            <P>5.1. Dane są przetwarzane w następujących celach i na następujących podstawach prawnych:</P>
            <P className="pl-4">a) Analiza danych demograficznych i sytuacyjnych -- cel: dopasowanie świadczeń rządowych do profilu Użytkownika; podstawa prawna: art. 6 ust. 1 lit. b) RODO (niezbędność do wykonania umowy).</P>
            <P className="pl-4">b) Weryfikacja numeru NIP w rejestrze CEIDG -- cel: ustalenie statusu działalności gospodarczej; podstawa prawna: art. 6 ust. 1 lit. b) RODO (niezbędność do wykonania umowy, Użytkownik dobrowolnie podaje NIP).</P>
            <P className="pl-4">c) Asystent AI i weryfikacja wyników -- cel: udzielanie odpowiedzi na pytania o świadczenia i eliminacja błędnych dopasowań; podstawa prawna: art. 6 ust. 1 lit. b) RODO. Do modeli AI przesyłane są wyłącznie zanonimizowane dane demograficzne.</P>
            <P className="pl-4">d) Rate limiting (adres IP) -- cel: ochrona przed nadużyciami i zapewnienie dostępności; podstawa prawna: art. 6 ust. 1 lit. f) RODO (prawnie uzasadniony interes Administratora).</P>
          </Section>

          <Section n="6" title="Modele AI i odbiorcy danych">
            <P>6.1. Serwis wykorzystuje dwa modele sztucznej inteligencji dostarczane przez Google LLC za pośrednictwem platformy OpenRouter, Inc.:</P>
            <P className="pl-4">a) Google Gemini 2.0 Flash -- asystent czatowy odpowiadający na pytania Użytkownika o świadczenia;</P>
            <P className="pl-4">b) Google Gemini 2.0 Flash Lite -- weryfikacja i filtrowanie wyników dopasowania świadczeń.</P>
            <P>6.2. Do modeli AI przesyłane są wyłącznie zanonimizowane dane demograficzne (wiek, płeć, stan cywilny, dochód, forma zatrudnienia i podobne parametry sytuacyjne). Żadne dane umożliwiające bezpośrednią identyfikację Użytkownika nie są przesyłane.</P>
            <P>6.3. Dane Użytkownika mogą być przekazywane następującym kategoriom odbiorców:</P>
            <P className="pl-4">a) CEIDG (Ministerstwo Rozwoju i Technologii) -- wyłącznie numer NIP, jeżeli Użytkownik go poda.</P>
            <P className="pl-4">b) OpenRouter, Inc. (siedziba: Stany Zjednoczone) / Google LLC -- zanonimizowane dane demograficzne w celu obsługi asystenta AI i weryfikacji wyników.</P>
            <P className="pl-4">c) Google Ireland Limited -- anonimowe dane statystyczne o ruchu na stronie, wyłącznie po wyrażeniu zgody przez Użytkownika za pośrednictwem baneru cookies.</P>
            <P>6.4. Dane nie są przekazywane organom reklamowym, brokerom danych ani sieciom społecznościowym. Administrator nie sprzedaje danych Użytkowników.</P>
          </Section>

          <Section n="7" title="Przekazywanie danych do państw trzecich">
            <P>7.1. Zanonimizowane dane demograficzne są przekazywane do OpenRouter, Inc. z siedzibą w Stanach Zjednoczonych w celu obsługi modeli AI Google LLC. Przekazanie odbywa się na podstawie art. 49 ust. 1 lit. a) RODO (wyraźna zgoda Użytkownika wyrażona poprzez dobrowolne wypełnienie formularza i akceptację regulaminu). Przesyłane dane nie pozwalają na bezpośrednią identyfikację Użytkownika.</P>
          </Section>

          <Section n="8" title="Okres przechowywania danych">
            <P>8.1. Serwis nie przechowuje danych osobowych Użytkowników na serwerach Administratora.</P>
            <P className="pl-4">a) Dane demograficzne przesyłane do serwera -- przetwarzane w pamięci operacyjnej wyłącznie na czas trwania zapytania; usuwane natychmiast po zwróceniu odpowiedzi.</P>
            <P className="pl-4">b) Numer NIP -- tranzytowe przetwarzanie w pamięci operacyjnej; usuwany natychmiast po uzyskaniu odpowiedzi z CEIDG.</P>
            <P className="pl-4">c) Adres IP -- przechowywany w pamięci operacyjnej przez maksymalnie 24 godziny lub do restartu serwera; nie jest zapisywany w żadnej bazie danych.</P>
            <P className="pl-4">d) Historia czatu i wyniki analizy (localStorage) -- przechowywane wyłącznie lokalnie w przeglądarce Użytkownika przez maksymalnie 7 dni.</P>
            <P>8.2. Administrator nie prowadzi bazy danych Użytkowników. Dane przechowywane w przeglądarce (localStorage) są dostępne wyłącznie dla Użytkownika na jego urządzeniu.</P>
          </Section>

          <Section n="9" title="Prawa Użytkownika">
            <P>9.1. Na podstawie RODO Użytkownikowi przysługują następujące prawa: prawo dostępu do danych (art. 15), prawo do sprostowania danych (art. 16), prawo do usunięcia danych (art. 17), prawo do ograniczenia przetwarzania (art. 18), prawo do przenoszenia danych (art. 20), prawo do sprzeciwu wobec przetwarzania (art. 21), prawo do cofnięcia zgody w dowolnym momencie (art. 7 ust. 3).</P>
            <P>9.2. Ze względu na to, że Serwis nie przechowuje danych osobowych na serwerach Administratora, realizacja powyższych praw jest w praktyce bezprzedmiotowa. Dane przechowywane lokalnie w przeglądarce (localStorage) są dostępne i usuwalne wyłącznie przez Użytkownika na jego własnym urządzeniu.</P>
            <P>9.3. Cofnięcie zgody na przetwarzanie danych demograficznych -- przez zaprzestanie korzystania z Serwisu (zamknięcie strony). Cofnięcie zgody na Google Analytics -- przez usunięcie plików cookie lub zmianę ustawień zgód w banerze cookie.</P>
            <P>9.4. Użytkownikowi przysługuje prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stanisława Moniuszki 1A, 00-014 Warszawa, <a href="https://uodo.gov.pl/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">uodo.gov.pl</a>).</P>
          </Section>

          <Section n="10" title="Pliki cookie i technologie śledzące">
            <P>10.1. Serwis może wykorzystywać Google Analytics (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlandia) do zbierania anonimowych danych statystycznych o ruchu na stronie (liczba odwiedzin, czas na stronie, typ urządzenia, źródło wejścia).</P>
            <P>10.2. Pliki cookie Google Analytics są instalowane wyłącznie po wyrażeniu zgody przez Użytkownika za pośrednictwem baneru cookies przy pierwszej wizycie. Domyślnie Analytics jest wyłączony (tryb &quot;denied&quot; zgodnie z Google Consent Mode v2). Użytkownik może wycofać zgodę w dowolnym momencie, usuwając pliki cookie z przeglądarki.</P>
            <P>10.3. Dane zbierane przez Google Analytics nie są łączone z danymi podawanymi w formularzu. Administrator nie wykorzystuje danych analitycznych w celach reklamowych ani profilujących.</P>
            <P>10.4. Podstawa prawna: art. 6 ust. 1 lit. a) RODO (zgoda Użytkownika) oraz art. 173 ust. 1 pkt 2 ustawy Prawo telekomunikacyjne.</P>
            <P>10.5. Serwis nie stosuje pikseli śledzących, fingerprintingu przeglądarki, Facebook Pixel ani podobnych narzędzi reklamowych.</P>
            <P>10.6. Serwis może wykorzystywać niezbędne techniczne pliki cookie wymagane do prawidłowego działania frameworka Next.js. Pliki te nie służą identyfikacji Użytkownika i nie wymagają zgody.</P>
          </Section>

          <Section n="11" title="Profilowanie i zautomatyzowane podejmowanie decyzji">
            <P>11.1. Serwis nie podejmuje decyzji wywołujących skutki prawne w rozumieniu art. 22 RODO.</P>
            <P>11.2. Wyniki generowane przez Serwis mają charakter wyłącznie informacyjny. Nie stanowią decyzji administracyjnej, przyrzeczenia świadczenia ani wiążącej opinii prawnej.</P>
            <P>11.3. Zgodnie z art. 50 Rozporządzenia (UE) 2024/1689 (Akt o Sztucznej Inteligencji), Serwis wyraźnie informuje Użytkownika o interakcji z systemem AI w interfejsie aplikacji.</P>
          </Section>

          <Section n="12" title="Bezpieczeństwo danych">
            <P>12.1. Administrator stosuje następujące środki ochrony: szyfrowanie TLS/HTTPS, brak zbierania numerów PESEL ani innych krajowych numerów identyfikacyjnych, brak bazy danych przechowującej dane osobowe Użytkowników, minimalizacja danych przesyłanych do modeli AI, tranzytowe przetwarzanie NIP bez logowania ani buforowania, implementacja Google Consent Mode v2 (Analytics wyłączony domyślnie do czasu wyrażenia zgody).</P>
          </Section>

          <Section n="12a" title="Usługa pomocy w wypełnieniu wniosku -- dane">
            <P>12a.1. Usługa pomocy w wypełnieniu wniosku (/wnioski) przetwarza informacje opisowe o projekcie lub sytuacji Użytkownika podane przez niego w formularzu (np. nazwa projektu, opis działalności, cele projektu). Dane te nie zawierają numerów PESEL, NIP ani innych identyfikatorów osobowych, chyba że Użytkownik sam je wpisze w polu tekstowym.</P>
            <P>12a.2. Informacje o projekcie są przesyłane do modelu AI (Google Gemini via OpenRouter) wyłącznie w celu wygenerowania treści odpowiedzi do pól formularza. Treść przesyłana do AI ograniczona jest do minimum niezbędnego do wygenerowania danego pola.</P>
            <P>12a.3. Administrator nie przechowuje informacji o projekcie podanych w ramach Usługi Wnioskowej na swoich serwerach. Dane przetwarzane są w pamięci operacyjnej serwera wyłącznie na czas trwania zapytania i usuwane natychmiast po zwróceniu odpowiedzi. Wygenerowane treści są przechowywane wyłącznie lokalnie w przeglądarce Użytkownika (RAM / stan aplikacji) i nie są zapisywane w localStorage ani wysyłane do serwera Administratora.</P>
            <P>12a.4. Podstawa prawna: art. 6 ust. 1 lit. b) RODO -- przetwarzanie niezbędne do wykonania usługi na żądanie Użytkownika.</P>
          </Section>

          <Section n="13" title="Zmiany polityki prywatności">
            <P>13.1. Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności.</P>
            <P>13.2. Aktualna wersja jest zawsze dostępna w Serwisie pod adresem /polityka-prywatnosci. Data ostatniej aktualizacji widoczna jest na górze dokumentu.</P>
          </Section>

          <Section n="14" title="Kontakt">
            <P>14.1. We wszelkich sprawach dotyczących ochrony danych osobowych: sobkowicz.kamil@gmail.com.</P>
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
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className}>{children}</p>;
}
