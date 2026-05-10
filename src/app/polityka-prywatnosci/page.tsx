import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polityka prywatności -- wezmezadarmo',
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
            <P>1.1. Administratorem danych osobowych jest Exhuman, adres e-mail: balthus.delarola@gmail.com (dalej: &quot;Administrator&quot;).</P>
            <P>1.2. We wszelkich sprawach dotyczących ochrony danych osobowych można kontaktować się pod adresem: balthus.delarola@gmail.com.</P>
          </Section>

          <Section n="2" title="Zakres przetwarzanych danych">
            <P>2.1. Serwis przetwarza następujące dane osobowe:</P>
            <P className="pl-4">a) Numer PESEL -- przetwarzany wyłącznie w przeglądarce Użytkownika (po stronie klienta). Z numeru PESEL dekodowane są: wiek i płeć. Sam numer PESEL nie jest w żadnym momencie przesyłany na serwer Administratora, do bazy danych ani do jakichkolwiek usług zewnętrznych. Po zamknięciu lub odświeżeniu strony dane te są trwale usuwane z pamięci przeglądarki.</P>
            <P className="pl-4">b) Numer NIP (opcjonalnie) -- jeżeli Użytkownik poda numer NIP, jest on przesyłany do publicznego rejestru CEIDG (API pod adresem https://dane.biznes.gov.pl/api/ceidg/v2/firmy) w celu weryfikacji statusu działalności gospodarczej. Numer NIP nie jest zapisywany na serwerze Administratora. Przetwarzanie NIP ma charakter tranzytowy -- numer jest przekazywany do API CEIDG i natychmiast usuwany z pamięci serwera po uzyskaniu odpowiedzi.</P>
            <P className="pl-4">c) Dane demograficzne i sytuacyjne podane w formularzu: wiek, płeć, stan cywilny, liczba dzieci, dochód miesięcznie i na osobę, forma zatrudnienia, stopień niepełnosprawności, forma własności mieszkania, województwo, status działalności gospodarczej, ciąża, status studenta, emeryta, rolnika, osoby bezrobotnej. Dane te są przetwarzane w pamięci operacyjnej serwera wyłącznie na czas trwania zapytania (kilka sekund) i nie są nigdzie zapisywane ani przechowywane.</P>
          </Section>

          <Section n="3" title="Cele i podstawy prawne przetwarzania">
            <P>3.1. Dane są przetwarzane w następujących celach i na następujących podstawach prawnych:</P>
            <P className="pl-4">a) Dekodowanie numeru PESEL (wiek, płeć) -- cel: świadczenie Usługi polegającej na analizie kwalifikowalności do świadczeń; podstawa prawna: art. 6 ust. 1 lit. a) RODO (zgoda Użytkownika wyrażona poprzez dobrowolne wpisanie numeru PESEL w formularzu).</P>
            <P className="pl-4">b) Weryfikacja numeru NIP w rejestrze CEIDG -- cel: ustalenie statusu działalności gospodarczej na potrzeby dopasowania świadczeń dla przedsiębiorców; podstawa prawna: art. 6 ust. 1 lit. a) RODO (zgoda Użytkownika wyrażona poprzez dobrowolne podanie numeru NIP).</P>
            <P className="pl-4">c) Analiza danych demograficznych i sytuacyjnych -- cel: dopasowanie świadczeń rządowych; podstawa prawna: art. 6 ust. 1 lit. a) RODO (zgoda wyrażona poprzez dobrowolne wypełnienie formularza).</P>
            <P className="pl-4">d) Weryfikacja AI wyników dopasowania -- cel: eliminacja błędnych dopasowań; podstawa prawna: art. 6 ust. 1 lit. f) RODO (prawnie uzasadniony interes Administratora polegający na zapewnieniu wysokiej jakości wyników); do modelu AI przesyłane są wyłącznie zanonimizowane dane demograficzne -- bez numeru PESEL, NIP, imienia, nazwiska ani innych identyfikatorów bezpośrednich.</P>
          </Section>

          <Section n="4" title="Odbiorcy danych">
            <P>4.1. Dane Użytkownika mogą być przekazywane następującym kategoriom odbiorców:</P>
            <P className="pl-4">a) CEIDG (Ministerstwo Rozwoju i Technologii) -- wyłącznie numer NIP, jeżeli Użytkownik go poda, w celu weryfikacji statusu działalności gospodarczej.</P>
            <P className="pl-4">b) OpenRouter, Inc. (siedziba: Stany Zjednoczone) -- zanonimizowane dane demograficzne (wiek, płeć, stan cywilny, dochód, forma zatrudnienia i podobne parametry sytuacyjne) są przesyłane do API OpenRouter w celu weryfikacji wyników dopasowania z wykorzystaniem modelu Claude Haiku (Anthropic, Inc.). Numer PESEL, NIP, imię, nazwisko ani żadne inne dane umożliwiające bezpośrednią identyfikację nie są przesyłane.</P>
            <P>4.2. Dane nie są przekazywane żadnym innym podmiotom trzecim, organom reklamowym, brokerom danych ani sieciom społecznościowym.</P>
          </Section>

          <Section n="5" title="Przekazywanie danych do państw trzecich">
            <P>5.1. Zanonimizowane dane demograficzne są przekazywane do OpenRouter, Inc. z siedzibą w Stanach Zjednoczonych. Przekazanie odbywa się na podstawie art. 49 ust. 1 lit. a) RODO (wyraźna zgoda Użytkownika) oraz w oparciu o Ramy Ochrony Danych UE-USA (EU-U.S. Data Privacy Framework).</P>
            <P>5.2. Dane przekazywane do OpenRouter nie zawierają identyfikatorów bezpośrednich i mają charakter zanonimizowany.</P>
          </Section>

          <Section n="6" title="Okres przechowywania danych">
            <P>6.1. Serwis nie przechowuje danych osobowych Użytkowników.</P>
            <P className="pl-4">a) Numer PESEL -- przetwarzany wyłącznie w pamięci przeglądarki Użytkownika na czas sesji; usuwany po zamknięciu lub odświeżeniu strony.</P>
            <P className="pl-4">b) Numer NIP -- przetwarzany tranzytowo w pamięci operacyjnej serwera; usuwany natychmiast po uzyskaniu odpowiedzi z API CEIDG.</P>
            <P className="pl-4">c) Dane demograficzne -- przetwarzane w pamięci operacyjnej serwera wyłącznie na czas trwania zapytania; usuwane natychmiast po zwróceniu odpowiedzi Użytkownikowi.</P>
            <P>6.2. Administrator nie prowadzi bazy danych Użytkowników. Nie istnieje możliwość odtworzenia danych po zakończeniu sesji.</P>
          </Section>

          <Section n="7" title="Prawa Użytkownika">
            <P>7.1. Na podstawie RODO Użytkownikowi przysługują następujące prawa: prawo dostępu do danych (art. 15), prawo do sprostowania danych (art. 16), prawo do usunięcia danych (art. 17), prawo do ograniczenia przetwarzania (art. 18), prawo do przenoszenia danych (art. 20), prawo do sprzeciwu wobec przetwarzania (art. 21), prawo do cofnięcia zgody w dowolnym momencie (art. 7 ust. 3).</P>
            <P>7.2. Ze względu na to, że Serwis nie przechowuje danych osobowych, realizacja powyższych praw jest w praktyce bezprzedmiotowa -- nie istnieją dane, do których można uzyskać dostęp, które można sprostować, usunąć, ograniczyć, przenieść lub wobec których można wnieść sprzeciw.</P>
            <P>7.3. Cofnięcie zgody realizowane jest poprzez zaprzestanie korzystania z Serwisu (zamknięcie strony).</P>
            <P>7.4. Użytkownikowi przysługuje prawo wniesienia skargi do organu nadzorczego -- Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa, https://uodo.gov.pl/).</P>
          </Section>

          <Section n="8" title="Pliki cookie i technologie śledzące">
            <P>8.1. Serwis nie wykorzystuje plików cookie śledzących.</P>
            <P>8.2. Serwis nie stosuje pikseli śledzących, fingerprintingu przeglądarki, local storage w celach identyfikacyjnych ani żadnych innych technologii profilowania.</P>
            <P>8.3. Serwis nie korzysta z narzędzi analitycznych takich jak Google Analytics, Facebook Pixel ani podobnych.</P>
            <P>8.4. Serwis może wykorzystywać niezbędne techniczne pliki cookie wymagane do prawidłowego działania frameworka Next.js. Pliki te nie służą identyfikacji Użytkownika i nie zawierają danych osobowych.</P>
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
            <P>12.1. We wszelkich sprawach dotyczących ochrony danych osobowych prosimy o kontakt pod adresem: balthus.delarola@gmail.com.</P>
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
