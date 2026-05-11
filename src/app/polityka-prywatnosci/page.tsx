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
          Ostatnia aktualizacja: 10 maja 2026 r.
        </p>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Administrator danych osobowych">
            <P>1.1. Administratorem danych osobowych jest Kamil Sobkowicz, adres e-mail: sobkowicz.kamil@gmail.com (dalej: &quot;Administrator&quot;).</P>
            <P>1.2. We wszelkich sprawach dotyczących ochrony danych osobowych można kontaktować się pod adresem: sobkowicz.kamil@gmail.com.</P>
          </Section>

          <Section n="2" title="Zakres przetwarzanych danych">
            <P>2.1. Serwis przetwarza następujące dane osobowe:</P>
            <P className="pl-4">a) Numer PESEL - przetwarzany wyłącznie w przeglądarce Użytkownika (po stronie klienta). Z numeru PESEL dekodowane są: wiek i płeć. Sam numer PESEL nie jest w żadnym momencie przesyłany na serwer Administratora, do bazy danych ani do jakichkolwiek usług zewnętrznych. Po zamknięciu lub odświeżeniu strony dane te są trwale usuwane z pamięci przeglądarki.</P>
            <P className="pl-4">b) Numer NIP (opcjonalnie) - jeżeli Użytkownik poda numer NIP, jest on przesyłany do publicznego rejestru CEIDG (API pod adresem https://dane.biznes.gov.pl/api/ceidg/v2/firmy) w celu weryfikacji statusu działalności gospodarczej. Numer NIP nie jest zapisywany na serwerze Administratora. Przetwarzanie NIP ma charakter tranzytowy - numer jest przekazywany do API CEIDG i natychmiast usuwany z pamięci serwera po uzyskaniu odpowiedzi.</P>
            <P className="pl-4">c) Dane demograficzne i sytuacyjne podane w formularzu: wiek, płeć, stan cywilny, liczba dzieci, dochód miesięcznie i na osobę, forma zatrudnienia, stopień niepełnosprawności, forma własności mieszkania, województwo, status działalności gospodarczej, ciąża, status studenta, emeryta, rolnika, osoby bezrobotnej. Dane te są przetwarzane w pamięci operacyjnej serwera wyłącznie na czas trwania zapytania (kilka sekund) i nie są nigdzie zapisywane ani przechowywane.</P>
            <P className="pl-4">d) Adres IP - przetwarzany wyłącznie w celu ograniczenia liczby zapytań do asystenta AI (3 zapytania na 24 godziny na adres IP). Adres IP jest przechowywany w pamięci operacyjnej serwera i usuwany automatycznie po 24 godzinach lub po restarcie serwera. Nie jest zapisywany w bazie danych ani logach. Podstawa prawna: art. 6 ust. 1 lit. f) RODO (prawnie uzasadniony interes Administratora polegający na zapewnieniu dostępności Usługi dla wszystkich Użytkowników i ochronie przed nadużyciami).</P>
          </Section>

          <Section n="3" title="Cele i podstawy prawne przetwarzania">
            <P>3.1. Dane są przetwarzane w następujących celach i na następujących podstawach prawnych:</P>
            <P className="pl-4">a) Dekodowanie numeru PESEL (wiek, płeć) - cel: świadczenie Usługi polegającej na analizie kwalifikowalności do świadczeń; podstawa prawna: art. 6 ust. 1 lit. b) RODO (niezbędność do wykonania umowy o świadczenie usługi, którą Użytkownik zawiera poprzez rozpoczęcie korzystania z Serwisu). Przetwarzanie odbywa się wyłącznie w przeglądarce Użytkownika.</P>
            <P className="pl-4">b) Weryfikacja numeru NIP w rejestrze CEIDG - cel: ustalenie statusu działalności gospodarczej na potrzeby dopasowania świadczeń dla przedsiębiorców; podstawa prawna: art. 6 ust. 1 lit. b) RODO (niezbędność do wykonania umowy, Użytkownik dobrowolnie podaje NIP w celu uzyskania pełniejszej analizy).</P>
            <P className="pl-4">c) Analiza danych demograficznych i sytuacyjnych - cel: dopasowanie świadczeń rządowych; podstawa prawna: art. 6 ust. 1 lit. b) RODO (niezbędność do wykonania umowy, dane podawane dobrowolnie przez Użytkownika w celu uzyskania wyników analizy).</P>
            <P className="pl-4">d) Weryfikacja AI wyników dopasowania - cel: eliminacja błędnych dopasowań i poprawa jakości wyników; podstawa prawna: art. 6 ust. 1 lit. b) RODO (niezbędność do wykonania umowy, weryfikacja AI jest integralną częścią Usługi). Do modelu AI przesyłane są wyłącznie dane demograficzne bez identyfikatorów bezpośrednich (bez numeru PESEL, NIP, imienia, nazwiska).</P>
          </Section>

          <Section n="4" title="Odbiorcy danych">
            <P>4.1. Dane Użytkownika mogą być przekazywane następującym kategoriom odbiorców:</P>
            <P className="pl-4">a) CEIDG (Ministerstwo Rozwoju i Technologii) - wyłącznie numer NIP, jeżeli Użytkownik go poda, w celu weryfikacji statusu działalności gospodarczej.</P>
            <P className="pl-4">b) OpenRouter, Inc. (siedziba: Stany Zjednoczone) - dane demograficzne bez identyfikatorów bezpośrednich (wiek, płeć, stan cywilny, dochód, forma zatrudnienia i podobne parametry sytuacyjne) są przesyłane do API OpenRouter w celu weryfikacji wyników dopasowania z wykorzystaniem modelu Claude Haiku (Anthropic, Inc.). Numer PESEL, NIP, imię, nazwisko ani żadne inne dane umożliwiające bezpośrednią identyfikację nie są przesyłane.</P>
            <P className="pl-4">c) Google Ireland Limited - anonimowe dane statystyczne o ruchu na stronie (liczba odwiedzin, typ urządzenia, źródło wejścia) zbierane za pośrednictwem Google Analytics, wyłącznie po wyrażeniu zgody przez Użytkownika. Dane te nie zawierają informacji podanych w formularzu.</P>
            <P>4.2. Dane nie są przekazywane organom reklamowym, brokerom danych ani sieciom społecznościowym. Administrator nie sprzedaje danych Użytkowników.</P>
          </Section>

          <Section n="5" title="Przekazywanie danych do państw trzecich">
            <P>5.1. Dane demograficzne bez identyfikatorów bezpośrednich są przekazywane do OpenRouter, Inc. z siedzibą w Stanach Zjednoczonych. Przekazanie odbywa się na podstawie art. 49 ust. 1 lit. a) RODO (wyraźna zgoda Użytkownika wyrażona poprzez dobrowolne wypełnienie formularza i rozpoczęcie analizy).</P>
            <P>5.2. Dane przekazywane do OpenRouter nie zawierają identyfikatorów bezpośrednich (bez PESEL, NIP, imienia, nazwiska). Przesyłane są wyłącznie parametry demograficzne (wiek, płeć, stan cywilny, dochód, forma zatrudnienia), które nie pozwalają na bezpośrednią identyfikację Użytkownika.</P>
          </Section>

          <Section n="6" title="Okres przechowywania danych">
            <P>6.1. Serwis nie przechowuje danych osobowych Użytkowników.</P>
            <P className="pl-4">a) Numer PESEL - przetwarzany wyłącznie w pamięci przeglądarki Użytkownika na czas sesji; usuwany po zamknięciu lub odświeżeniu strony.</P>
            <P className="pl-4">b) Numer NIP - przetwarzany tranzytowo w pamięci operacyjnej serwera; usuwany natychmiast po uzyskaniu odpowiedzi z API CEIDG.</P>
            <P className="pl-4">c) Dane demograficzne - przetwarzane w pamięci operacyjnej serwera wyłącznie na czas trwania zapytania; usuwane natychmiast po zwróceniu odpowiedzi Użytkownikowi.</P>
            <P>6.2. Administrator nie prowadzi bazy danych Użytkowników. Nie istnieje możliwość odtworzenia danych po zakończeniu sesji.</P>
          </Section>

          <Section n="7" title="Prawa Użytkownika">
            <P>7.1. Na podstawie RODO Użytkownikowi przysługują następujące prawa: prawo dostępu do danych (art. 15), prawo do sprostowania danych (art. 16), prawo do usunięcia danych (art. 17), prawo do ograniczenia przetwarzania (art. 18), prawo do przenoszenia danych (art. 20), prawo do sprzeciwu wobec przetwarzania (art. 21), prawo do cofnięcia zgody w dowolnym momencie (art. 7 ust. 3).</P>
            <P>7.2. Ze względu na to, że Serwis nie przechowuje danych osobowych, realizacja powyższych praw jest w praktyce bezprzedmiotowa - nie istnieją dane, do których można uzyskać dostęp, które można sprostować, usunąć, ograniczyć, przenieść lub wobec których można wnieść sprzeciw.</P>
            <P>7.3. Cofnięcie zgody realizowane jest poprzez zaprzestanie korzystania z Serwisu (zamknięcie strony).</P>
            <P>7.4. Użytkownikowi przysługuje prawo wniesienia skargi do organu nadzorczego - Prezesa Urzędu Ochrony Danych Osobowych (ul. Stanisława Moniuszki 1A, 00-014 Warszawa, <a href="https://uodo.gov.pl/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">uodo.gov.pl</a>).</P>
          </Section>

          <Section n="8" title="Pliki cookie i technologie śledzące">
            <P>8.1. Serwis wykorzystuje Google Analytics (identyfikator: G-57R2TFXNH7), narzędzie analityczne dostarczane przez Google Ireland Limited (Gordon House, Barrow Street, Dublin 4, Irlandia). Google Analytics wykorzystuje pliki cookie do zbierania anonimowych danych statystycznych o ruchu na stronie, takich jak: liczba odwiedzin, czas spędzony na stronie, źródło wejścia, typ urządzenia i przeglądarki.</P>
            <P>8.2. Pliki cookie Google Analytics są instalowane wyłącznie po wyrażeniu zgody przez Użytkownika za pośrednictwem baneru cookies wyświetlanego przy pierwszej wizycie. Użytkownik może w każdej chwili wycofać zgodę, usuwając pliki cookie z przeglądarki.</P>
            <P>8.3. Dane zbierane przez Google Analytics nie są łączone z danymi podawanymi w formularzu (PESEL, NIP, dane demograficzne). Administrator nie sprzedaje, nie udostępnia i nie wykorzystuje danych analitycznych w celach reklamowych ani profilujących.</P>
            <P>8.4. Podstawa prawna: art. 6 ust. 1 lit. a) RODO (zgoda Użytkownika) oraz art. 173 ust. 1 pkt 2 ustawy Prawo telekomunikacyjne.</P>
            <P>8.5. Serwis nie stosuje pikseli śledzących, fingerprintingu przeglądarki ani technologii profilowania. Nie korzysta z Facebook Pixel ani podobnych narzędzi reklamowych.</P>
            <P>8.6. Serwis może wykorzystywać niezbędne techniczne pliki cookie wymagane do prawidłowego działania frameworka Next.js. Pliki te nie służą identyfikacji Użytkownika i nie wymagają zgody.</P>
          </Section>

          <Section n="9" title="Profilowanie i zautomatyzowane podejmowanie decyzji">
            <P>9.1. Serwis nie podejmuje decyzji, które wywołują skutki prawne lub w podobny sposób istotnie wpływają na Użytkownika w rozumieniu art. 22 RODO.</P>
            <P>9.2. Wyniki generowane przez Serwis (w tym z udziałem AI) mają charakter wyłącznie informacyjny i orientacyjny. Nie stanowią decyzji administracyjnej, przyrzeczenia świadczenia ani wiążącej opinii prawnej.</P>
          </Section>

          <Section n="10" title="Bezpieczeństwo danych">
            <P>10.1. Administrator stosuje następujące środki techniczne i organizacyjne w celu ochrony danych: szyfrowanie połączenia za pomocą protokołu TLS (HTTPS), przetwarzanie numeru PESEL wyłącznie po stronie klienta, brak bazy danych przechowującej dane osobowe, minimalizacja danych przesyłanych do modelu AI, tranzytowe przetwarzanie NIP bez logowania ani buforowania.</P>
          </Section>

          <Section n="11" title="Zmiany polityki prywatności">
            <P>11.1. Administrator zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności.</P>
            <P>11.2. Aktualna wersja jest zawsze dostępna w Serwisie pod adresem /polityka-prywatnosci.</P>
          </Section>

          <Section n="12" title="Kontakt">
            <P>12.1. We wszelkich sprawach dotyczących ochrony danych osobowych prosimy o kontakt pod adresem: sobkowicz.kamil@gmail.com.</P>
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
