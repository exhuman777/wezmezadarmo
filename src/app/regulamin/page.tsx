import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regulamin -- wezmezadarmo',
  description: 'Regulamin świadczenia usług drogą elektroniczną serwisu wezmezadarmo.',
};

export default function RegulaminPage() {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróć do strony głównej
        </Link>

        <h1 className="text-[24px] sm:text-[28px] font-bold text-text-1 mb-2">
          Regulamin
        </h1>
        <p className="text-[13px] text-text-3 mb-8">
          Ostatnia aktualizacja: 10 maja 2026 r.
        </p>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Postanowienia ogólne">
            <P>1.1. Niniejszy Regulamin określa zasady świadczenia usług drogą elektroniczną za pośrednictwem serwisu internetowego wezmezadarmo (dalej: &quot;Serwis&quot;).</P>
            <P>1.2. Operatorem Serwisu jest Exhuman, adres e-mail: balthus.delarola@gmail.com (dalej: &quot;Operator&quot;).</P>
            <P>1.3. Serwis jest narzędziem informacyjnym, które pomaga użytkownikom zidentyfikować świadczenia rządowe, na które mogą się kwalifikować. Serwis nie jest organem administracji publicznej, nie przyznaje świadczeń i nie gwarantuje ich uzyskania.</P>
            <P>1.4. Korzystanie z Serwisu jest bezpłatne i nie wymaga rejestracji ani zakładania konta użytkownika.</P>
          </Section>

          <Section n="2" title="Definicje">
            <P>2.1. Użytkownik -- każda osoba fizyczna korzystająca z Serwisu.</P>
            <P>2.2. Usługa -- udostępnienie narzędzia do analizy kwalifikowalności Użytkownika do świadczeń rządowych na podstawie podanych przez niego danych demograficznych i sytuacyjnych.</P>
            <P>2.3. PESEL -- Powszechny Elektroniczny System Ewidencji Ludności, jedenastocyfrowy numer identyfikacyjny.</P>
            <P>2.4. NIP -- Numer Identyfikacji Podatkowej, dziesięciocyfrowy numer identyfikacyjny dla podmiotów gospodarczych.</P>
            <P>2.5. AI -- sztuczna inteligencja wykorzystywana w Serwisie do weryfikacji wyników dopasowania świadczeń.</P>
          </Section>

          <Section n="3" title="Rodzaj i zakres usług">
            <P>3.1. Serwis świadczy następujące usługi drogą elektroniczną:</P>
            <P className="pl-4">a) dekodowanie numeru PESEL w celu ustalenia wieku i płci Użytkownika -- przetwarzanie odbywa się wyłącznie w przeglądarce Użytkownika (po stronie klienta), numer PESEL nie jest przesyłany na serwer Operatora ani do jakichkolwiek podmiotów trzecich;</P>
            <P className="pl-4">b) opcjonalna weryfikacja numeru NIP w rejestrze CEIDG w celu potwierdzenia statusu działalności gospodarczej -- numer NIP jest przesyłany do publicznego API Centralnej Ewidencji i Informacji o Działalności Gospodarczej (CEIDG) prowadzonego przez Ministerstwo Rozwoju i Technologii; numer NIP nie jest zapisywany przez Operatora;</P>
            <P className="pl-4">c) analiza kwalifikowalności do świadczeń rządowych na podstawie anonimowych danych demograficznych (wiek, płeć, stan cywilny, dochód, liczba dzieci, zatrudnienie, województwo i inne parametry podane w formularzu);</P>
            <P className="pl-4">d) weryfikacja wyników dopasowania z wykorzystaniem modelu sztucznej inteligencji (Claude Haiku, dostarczanego przez OpenRouter) w celu eliminacji błędnych dopasowań;</P>
            <P className="pl-4">e) prezentacja wyników w formie listy świadczeń z informacjami o wymaganiach, kwotach, procedurze składania wniosków oraz źródłach prawnych.</P>
            <P>3.2. Serwis nie świadczy usług doradztwa prawnego, podatkowego ani finansowego.</P>
          </Section>

          <Section n="4" title="Zastrzeżenia dotyczące sztucznej inteligencji">
            <P>4.1. Serwis wykorzystuje model sztucznej inteligencji Claude Haiku (dostarczany przez OpenRouter, Inc.) jako element procesu weryfikacji wyników dopasowania świadczeń.</P>
            <P>4.2. Użytkownik jest niniejszym informowany, że:</P>
            <P className="pl-4">a) wyniki generowane z udziałem AI mają charakter wyłącznie informacyjny i orientacyjny;</P>
            <P className="pl-4">b) AI może popełniać błędy -- wyniki nie stanowią porady prawnej, podatkowej ani finansowej;</P>
            <P className="pl-4">c) ostateczna decyzja o kwalifikowalności do danego świadczenia należy wyłącznie do właściwego organu administracji publicznej;</P>
            <P className="pl-4">d) Operator nie ponosi odpowiedzialności za decyzje podjęte na podstawie wyników wygenerowanych przez Serwis;</P>
            <P className="pl-4">e) dane przesyłane do modelu AI nie zawierają numeru PESEL, NIP, imienia, nazwiska ani żadnych innych danych umożliwiających bezpośrednią identyfikację Użytkownika -- przesyłane są wyłącznie zanonimizowane dane demograficzne.</P>
            <P>4.3. Zgodnie z art. 50 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2024/1689 (Akt o Sztucznej Inteligencji), Operator informuje, że Użytkownik wchodzi w interakcję z systemem wykorzystującym sztuczną inteligencję, a nie z człowiekiem.</P>
          </Section>

          <Section n="5" title="Warunki techniczne">
            <P>5.1. Korzystanie z Serwisu wymaga urządzenia z dostępem do internetu oraz przeglądarki obsługującej JavaScript (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+).</P>
            <P>5.2. Serwis nie wymaga instalacji dodatkowego oprogramowania.</P>
            <P>5.3. Serwis nie wykorzystuje plików cookie śledzących, nie stosuje pikseli śledzących ani analogicznych technologii profilowania.</P>
          </Section>

          <Section n="6" title="Zawarcie i rozwiązanie umowy">
            <P>6.1. Umowa o świadczenie usług drogą elektroniczną zostaje zawarta z chwilą rozpoczęcia korzystania z Serwisu przez Użytkownika (wejście na stronę i wypełnienie formularza).</P>
            <P>6.2. Umowa zostaje rozwiązana z chwilą opuszczenia Serwisu przez Użytkownika. Żadne dane Użytkownika nie są przechowywane po zakończeniu sesji.</P>
            <P>6.3. Użytkownik może w każdej chwili zaprzestać korzystania z Serwisu bez podawania przyczyny.</P>
          </Section>

          <Section n="7" title="Zakaz dostarczania treści bezprawnych">
            <P>7.1. Użytkownik zobowiązuje się do niepodawania danych nieprawdziwych, cudzych ani sfabrykowanych w celu uzyskania informacji o świadczeniach przysługujących innym osobom.</P>
            <P>7.2. Zabronione jest korzystanie z Serwisu w sposób naruszający przepisy prawa, prawa osób trzecich lub dobre obyczaje.</P>
          </Section>

          <Section n="8" title="Odpowiedzialność">
            <P>8.1. Serwis dostarcza informacje o charakterze orientacyjnym. Operator dokłada staranności, aby informacje były aktualne i zgodne z obowiązującym stanem prawnym, jednak nie gwarantuje ich kompletności, dokładności ani aktualności.</P>
            <P>8.2. Operator nie ponosi odpowiedzialności za decyzje podjęte przez Użytkownika na podstawie informacji uzyskanych z Serwisu, odmowę przyznania świadczenia przez właściwy organ, ani przerwy w działaniu Serwisu wynikające z przyczyn technicznych.</P>
          </Section>

          <Section n="9" title="Reklamacje">
            <P>9.1. Użytkownik ma prawo złożyć reklamację dotyczącą działania Serwisu na adres e-mail: balthus.delarola@gmail.com.</P>
            <P>9.2. Reklamacja powinna zawierać opis problemu, datę i godzinę wystąpienia problemu oraz adres e-mail do kontaktu zwrotnego.</P>
            <P>9.3. Operator rozpatrzy reklamację w terminie 14 dni od daty jej otrzymania.</P>
          </Section>

          <Section n="10" title="Pozasądowe rozwiązywanie sporów">
            <P>10.1. Konsument ma prawo skorzystać z pozasądowych sposobów rozwiązywania sporów, w tym mediacji prowadzonej przez wojewódzkich inspektorów Inspekcji Handlowej oraz platformy ODR dostępnej pod adresem: https://ec.europa.eu/consumers/odr/</P>
          </Section>

          <Section n="11" title="Postanowienia końcowe">
            <P>11.1. Regulamin wchodzi w życie z dniem opublikowania w Serwisie.</P>
            <P>11.2. Operator zastrzega sobie prawo do zmiany Regulaminu. Dalsze korzystanie z Serwisu po opublikowaniu zmian oznacza akceptację nowego brzmienia Regulaminu.</P>
            <P>11.3. W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego, Ustawy o świadczeniu usług drogą elektroniczną oraz Ustawy o prawach konsumenta.</P>
          </Section>

        </div>

        <div className="mt-12 pt-4 border-t border-border text-[12px] text-text-3">
          <Link href="/polityka-prywatnosci" className="text-accent hover:underline">
            Polityka prywatności
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
