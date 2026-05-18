import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regulamin | wezmezadarmo',
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
          Ostatnia aktualizacja: 17 maja 2026 r.
        </p>

        <div className="mb-8 p-4 border border-accent/30 bg-accent/5 rounded-[8px] text-[13px] text-text-2">
          Regulamin obejmuje również usługę pomocy w wypełnieniu wniosków dostępną pod adresem /wnioski (sekcja 3a), narzędzie automatyzacji dla przedsiębiorców dostępne pod adresem /automatyzacje (sekcja 3b) oraz agregator aktualności rządowych dostępny pod adresem /aktualnosci (sekcja 3c).
        </div>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Postanowienia ogólne">
            <P>1.1. Niniejszy Regulamin określa zasady świadczenia usług drogą elektroniczną za pośrednictwem serwisu internetowego wezmezadarmo (dalej: &quot;Serwis&quot;).</P>
            <P>1.2. Operatorem Serwisu jest Kamil Sobkowicz, adres e-mail: sobkowicz.kamil@gmail.com (dalej: &quot;Operator&quot;).</P>
            <P>1.3. Serwis jest narzędziem informacyjnym, które pomaga użytkownikom zidentyfikować świadczenia rządowe, na które mogą się kwalifikować. Serwis nie jest organem administracji publicznej, nie przyznaje świadczeń i nie gwarantuje ich uzyskania.</P>
            <P>1.4. Korzystanie z Serwisu jest bezpłatne i nie wymaga rejestracji ani zakładania konta użytkownika.</P>
          </Section>

          <Section n="2" title="Definicje">
            <P>2.1. Użytkownik: każda osoba fizyczna korzystająca z Serwisu.</P>
            <P>2.2. Usługa: udostępnienie narzędzia do analizy kwalifikowalności Użytkownika do świadczeń rządowych na podstawie podanych przez niego danych demograficznych i sytuacyjnych.</P>
            <P>2.3. NIP: Numer Identyfikacji Podatkowej, dziesięciocyfrowy numer identyfikacyjny dla podmiotów gospodarczych.</P>
            <P>2.4. AI: sztuczna inteligencja wykorzystywana w Serwisie jako asystent czatowy oraz element procesu weryfikacji wyników dopasowania świadczeń.</P>
          </Section>

          <Section n="3" title="Rodzaj i zakres usług">
            <P>3.1. Serwis świadczy następujące usługi drogą elektroniczną:</P>
            <P className="pl-4">a) przyjęcie od Użytkownika danych demograficznych i sytuacyjnych (wiek, płeć, stan cywilny, dochód, liczba dzieci, forma zatrudnienia, województwo i inne parametry podane w formularzu) wyłącznie w zakresie niezbędnym do przeprowadzenia analizy kwalifikowalności do świadczeń;</P>
            <P className="pl-4">b) opcjonalna weryfikacja numeru NIP w rejestrze CEIDG w celu potwierdzenia statusu działalności gospodarczej, numer NIP jest przesyłany do publicznego API Centralnej Ewidencji i Informacji o Działalności Gospodarczej (CEIDG) prowadzonego przez Ministerstwo Rozwoju i Technologii; numer NIP nie jest zapisywany przez Operatora;</P>
            <P className="pl-4">c) analiza kwalifikowalności do świadczeń rządowych na podstawie podanych danych demograficznych i sytuacyjnych;</P>
            <P className="pl-4">d) asystent AI umożliwiający zadawanie pytań o szczegóły świadczeń, do modelu AI przesyłane są wyłącznie zanonimizowane dane demograficzne, bez jakichkolwiek danych umożliwiających bezpośrednią identyfikację Użytkownika;</P>
            <P className="pl-4">e) prezentacja wyników w formie listy świadczeń z informacjami o wymaganiach, kwotach, procedurze składania wniosków oraz źródłach prawnych.</P>
            <P>3.2. Serwis nie świadczy usług doradztwa prawnego, podatkowego ani finansowego.</P>
            <P>3.3. Serwis nie zbiera, nie przetwarza ani nie przechowuje numerów PESEL. Użytkownik podaje wiek i płeć bezpośrednio w formularzu.</P>
          </Section>

          <Section n="3a" title="Usługa pomocy w wypełnieniu wniosku">
            <P>3a.1. Serwis świadczy dodatkową usługę pomocy w przygotowaniu treści wniosków o granty i dofinansowania (dalej: &quot;Usługa Wnioskowa&quot;), dostępną pod adresem /wnioski.</P>
            <P>3a.2. Usługa Wnioskowa polega na generowaniu przez model AI propozycji treści poszczególnych pól formularza wniosku na podstawie informacji opisowych podanych przez Użytkownika. Wygenerowane treści mają charakter wyłącznie pomocniczy i stanowią punkt wyjścia do dalszej edycji przez Użytkownika.</P>
            <P>3a.3. Usługa Wnioskowa nie jest usługą doradztwa prawnego, podatkowego ani konsultingowego. Operator nie gwarantuje, że wygenerowane treści spełnią wymagania instytucji przyjmującej wniosek.</P>
            <P>3a.4. Wszystkie dane o projekcie wprowadzone przez Użytkownika w ramach Usługi Wnioskowej są przetwarzane wyłącznie w przeglądarce Użytkownika i przesyłane do modelu AI wyłącznie w zakresie niezbędnym do wygenerowania treści danego pola. Operator nie przechowuje tych danych na serwerze.</P>
            <P>3a.5. Użytkownik ponosi wyłączną odpowiedzialność za treść ostateczną wniosku, jego zgodność z wymaganiami instytucji i prawdziwość podanych informacji. Operator odpowiada wyłącznie za dostępność techniczną narzędzia.</P>
            <P>3a.6. Usługa Wnioskowa może być w przyszłości świadczona odpłatnie. O zmianie warunków Operator poinformuje z wyprzedzeniem na stronie Serwisu. Aktualne warunki cenowe są widoczne na stronie /wnioski.</P>
          </Section>

          <Section n="3b" title="Usługa narzędzi automatyzacji">
            <P>3b.1. Serwis udostępnia bezpłatne narzędzie dla przedsiębiorców pomagające w ocenie kwalifikowalności do ulg ZUS, generowaniu gotowych poleceń AI do zadań biznesowych oraz informacji o usłudze Automat Fakturowy (dalej: &quot;Usługa Automatyzacji&quot;), dostępne pod adresem /automatyzacje.</P>
            <P>3b.2. Kalkulator składek ZUS w ramach Usługi Automatyzacji działa wyłącznie po stronie przeglądarki Użytkownika. Żadne dane wprowadzone przez Użytkownika nie są przesyłane ani zapisywane na serwerach Operatora.</P>
            <P>3b.3. Gotowe polecenia AI (prompt pack) stanowią materiały informacyjno-edukacyjne i mogą być swobodnie kopiowane i używane przez Użytkownika.</P>
            <P>3b.4. Usługa Automat Fakturowy jest usługą płatną świadczoną na podstawie odrębnej umowy zawieranej po kontakcie z Operatorem. Warunki cenowe i zakres usługi są określone w indywidualnej umowie.</P>
            <P>3b.5. Operator nie gwarantuje, że wyniki kalkulatora składek ZUS są zgodne z aktualnie obowiązującymi przepisami. Użytkownik powinien weryfikować wyniki w ZUS lub u właściwego doradcy.</P>
          </Section>

          <Section n="3c" title="Agregator aktualności rządowych">
            <P>3c.1. Serwis udostępnia bezpłatny agregator aktualności z publicznych kanałów RSS instytucji rządowych Rzeczypospolitej Polskiej (dalej: &quot;Usługa Aktualności&quot;), dostępny pod adresem /aktualnosci.</P>
            <P>3c.2. Usługa Aktualności pobiera dane wyłącznie z oficjalnych, publicznych kanałów RSS instytucji takich jak ZUS, GUS, NBP, UOKiK, Fundusze Europejskie, e-Zdrowie, Sejm RP i ARiMR. Operator nie jest autorem ani redaktorem treści pobieranych z tych źródeł.</P>
            <P>3c.3. Strona odświeżana jest automatycznie co 30 minut (ISR). Operator nie gwarantuje aktualności ani kompletności treści w czasie rzeczywistym.</P>
            <P>3c.4. Usługa Aktualności nie przetwarza ani nie zapisuje żadnych danych Użytkownika. Filtry wyboru profilu (JDG, firma, wszyscy) działają wyłącznie po stronie przeglądarki.</P>
            <P>3c.5. Odpowiedzialność za treść aktualności ponoszą wyłącznie instytucje będące ich źródłem.</P>
          </Section>

          <Section n="4" title="Źródła danych o świadczeniach">
            <P>4.1. Baza świadczeń dostępna w Serwisie opiera się wyłącznie na oficjalnych, publicznych źródłach prawa i informacji rządowych. Dane nie są wymyślone, szacowane ani pobierane z prywatnych baz danych. Źródła: gov.pl, zus.pl, nfz.gov.pl, podatki.gov.pl, pfron.org.pl, praca.gov.pl, krus.gov.pl. Adresy tych źródeł są widoczne bezpośrednio w interfejsie Serwisu.</P>
            <P>4.2. Serwis nie prowadzi żadnej bazy danych użytkowników. Żadne dane podane w formularzu nie są zapisywane na serwerach Operatora, nie są profilowane, nie są sprzedawane i nie trafiają do żadnych rejestrów.</P>
          </Section>

          <Section n="5" title="Zastrzeżenia dotyczące sztucznej inteligencji">
            <P>5.1. Serwis wykorzystuje modele sztucznej inteligencji dostarczane przez Google LLC za pośrednictwem platformy OpenRouter, Inc.: Google Gemini 2.0 Flash (asystent czatowy) oraz Google Gemini 2.0 Flash Lite (weryfikacja wyników dopasowania). Serwis korzysta z OpenRouter wyłącznie jako warstwy pośredniczącej, faktycznym dostawcą modeli AI jest Google LLC.</P>
            <P>5.2. Użytkownik jest niniejszym informowany, że:</P>
            <P className="pl-4">a) wyniki generowane z udziałem AI mają charakter wyłącznie informacyjny i orientacyjny;</P>
            <P className="pl-4">b) AI może popełniać błędy, wyniki nie stanowią porady prawnej, podatkowej ani finansowej;</P>
            <P className="pl-4">c) ostateczna decyzja o kwalifikowalności do danego świadczenia należy wyłącznie do właściwego organu administracji publicznej;</P>
            <P className="pl-4">d) Operator nie ponosi odpowiedzialności za decyzje podjęte na podstawie wyników wygenerowanych przez Serwis;</P>
            <P className="pl-4">e) dane przesyłane do modelu AI nie zawierają imienia, nazwiska, numeru NIP ani żadnych innych danych umożliwiających bezpośrednią identyfikację Użytkownika, przesyłane są wyłącznie zanonimizowane dane demograficzne.</P>
            <P>5.3. Zgodnie z art. 50 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2024/1689 (Akt o Sztucznej Inteligencji), Operator informuje, że Użytkownik wchodzi w interakcję z systemem wykorzystującym sztuczną inteligencję, a nie z człowiekiem.</P>
            <P>5.4. Transparentność AI: wszystkie treści wygenerowane przez model AI są wyraźnie oznaczone etykietą &quot;AI&quot; w interfejsie użytkownika. Baza świadczeń jest ręcznie zweryfikowana przez człowieka. AI pełni wyłącznie rolę pomocniczą (weryfikacja dopasowań, asystent czatowy).</P>
            <P>5.5. Wyjaśnialność wyników: Użytkownik może zapytać asystenta AI o uzasadnienie każdego dopasowania. Przy każdym świadczeniu podane są kryteria dopasowania, źródło prawne i data weryfikacji. Funkcja ta ma charakter informacyjny i nie stanowi realizacji prawa z art. 22 RODO, ponieważ system nie podejmuje zautomatyzowanych decyzji wywołujących skutki prawne.</P>
            <P>5.6. System AI wykorzystywany w Serwisie nie podejmuje zautomatyzowanych decyzji wywołujących skutki prawne wobec Użytkownika. Wyniki mają charakter wyłącznie informacyjny.</P>
          </Section>

          <Section n="6" title="Warunki techniczne">
            <P>6.1. Korzystanie z Serwisu wymaga urządzenia z dostępem do internetu oraz przeglądarki obsługującej JavaScript (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+).</P>
            <P>6.2. Serwis nie wymaga instalacji dodatkowego oprogramowania.</P>
            <P>6.3. Serwis może wykorzystywać Google Analytics do zbierania anonimowych statystyk odwiedzin (liczba wejść, czas na stronie, typ urządzenia). Pliki cookie analityczne są instalowane wyłącznie po wyrażeniu zgody przez Użytkownika. Dane analityczne nie są łączone z danymi z formularza i nie są sprzedawane. Serwis nie stosuje pikseli śledzących, fingerprintingu ani technologii profilowania.</P>
          </Section>

          <Section n="7" title="Zawarcie i rozwiązanie umowy">
            <P>7.1. Umowa o świadczenie usług drogą elektroniczną zostaje zawarta z chwilą rozpoczęcia korzystania z Serwisu przez Użytkownika (wejście na stronę i wypełnienie formularza).</P>
            <P>7.2. Umowa zostaje rozwiązana z chwilą opuszczenia Serwisu przez Użytkownika. Historia czatu z asystentem AI oraz wyniki analizy świadczeń są zapisywane wyłącznie lokalnie w pamięci przeglądarki Użytkownika (localStorage) na jego urządzeniu i wygasają automatycznie po 7 dniach. Dane te nie są w żadnym momencie przesyłane ani przechowywane na serwerze Operatora. Użytkownik może usunąć te dane w dowolnym momencie klikając przycisk &quot;Zacznij od nowa&quot; w Serwisie lub czyszcząc dane lokalnego magazynu przeglądarki.</P>
            <P>7.3. Użytkownik może w każdej chwili zaprzestać korzystania z Serwisu bez podawania przyczyny.</P>
          </Section>

          <Section n="8" title="Prawo odstąpienia od umowy">
            <P>8.1. Zgodnie z art. 38 pkt 1 ustawy o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość nie przysługuje w odniesieniu do umów o świadczenie usług, za które konsument nie jest zobowiązany do zapłaty.</P>
            <P>8.2. Usługa jest w pełni bezpłatna i wykonywana natychmiast po wypełnieniu formularza. Użytkownik może w każdej chwili zaprzestać korzystania z Serwisu bez podawania przyczyny i bez jakichkolwiek konsekwencji.</P>
          </Section>

          <Section n="9" title="Zakaz dostarczania treści bezprawnych i niedozwolone użycie automatyczne">
            <P>9.1. Użytkownik zobowiązuje się do niepodawania danych nieprawdziwych, cudzych ani sfabrykowanych w celu uzyskania informacji o świadczeniach przysługujących innym osobom.</P>
            <P>9.2. Zabronione jest korzystanie z Serwisu w sposób naruszający przepisy prawa, prawa osób trzecich lub dobre obyczaje.</P>
            <P>9.3. Bez uprzedniej pisemnej zgody Operatora zabronione jest automatyczne pobieranie treści Serwisu za pomocą skryptów, botów, crawlerów lub innych narzędzi scrapingowych (tzw. web scraping). Baza świadczeń, jej struktura, opisy i instrukcje stanowią autorskie dzieło Operatora w rozumieniu ustawy z dnia 4 lutego 1994 r. o prawie autorskim i prawach pokrewnych.</P>
            <P>9.4. Bez uprzedniej pisemnej zgody Operatora zabronione jest korzystanie z interfejsu API Serwisu (w tym endpointów /api/verify, /api/chat, /api/form-assist, /api/pdf i innych) przez podmioty zewnętrzne w celach komercyjnych lub integracyjnych. Korzystanie z API przez osoby trzecie wymaga zawarcia indywidualnej umowy licencyjnej z Operatorem. Zapytania o licencję należy kierować na adres: sobkowicz.kamil@gmail.com.</P>
            <P>9.5. Naruszenie postanowień punktów 9.3 i 9.4 uprawnia Operatora do dochodzenia roszczeń na podstawie przepisów o prawie autorskim oraz ustawy o zwalczaniu nieuczciwej konkurencji, a także blokowania dostępu do Serwisu i API.</P>
          </Section>

          <Section n="10" title="Odpowiedzialność">
            <P>10.1. Serwis dostarcza informacje o charakterze orientacyjnym. Operator dokłada staranności, aby informacje były aktualne i zgodne z obowiązującym stanem prawnym, jednak nie gwarantuje ich kompletności, dokładności ani aktualności.</P>
            <P>10.2. Operator nie ponosi odpowiedzialności za decyzje podjęte przez Użytkownika na podstawie informacji uzyskanych z Serwisu, odmowę przyznania świadczenia przez właściwy organ, ani przerwy w działaniu Serwisu wynikające z przyczyn technicznych.</P>
          </Section>

          <Section n="11" title="Reklamacje">
            <P>11.1. Użytkownik ma prawo złożyć reklamację dotyczącą działania Serwisu na adres e-mail: sobkowicz.kamil@gmail.com.</P>
            <P>11.2. Reklamacja powinna zawierać opis problemu, datę i godzinę wystąpienia problemu oraz adres e-mail do kontaktu zwrotnego.</P>
            <P>11.3. Operator rozpatrzy reklamację w terminie 14 dni od daty jej otrzymania.</P>
          </Section>

          <Section n="12" title="Pozasądowe rozwiązywanie sporów">
            <P>12.1. Konsument ma prawo skorzystać z pozasądowych sposobów rozwiązywania sporów, w tym mediacji prowadzonej przez wojewódzkich inspektorów Inspekcji Handlowej oraz platformy ODR dostępnej pod adresem: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">ec.europa.eu/consumers/odr</a></P>
          </Section>

          <Section n="13" title="Postanowienia końcowe">
            <P>13.1. Regulamin wchodzi w życie z dniem opublikowania w Serwisie.</P>
            <P>13.2. Operator zastrzega sobie prawo do zmiany Regulaminu. Dalsze korzystanie z Serwisu po opublikowaniu zmian oznacza akceptację nowego brzmienia Regulaminu.</P>
            <P>13.3. W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego, Ustawy o świadczeniu usług drogą elektroniczną oraz Ustawy o prawach konsumenta.</P>
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
