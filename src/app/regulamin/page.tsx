import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Regulamin | wezmezadarmo',
  description: 'Regulamin świadczenia usług drogą elektroniczną serwisu wezmezadarmo.',
};

const EMAIL = 'sobkowicz.kamil@gmail.com';

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
          Ostatnia aktualizacja: 23 maja 2026 r.
        </p>

        <div className="mb-8 p-4 border border-accent/30 bg-accent/5 rounded-[8px] text-[13px] text-text-2">
          Regulamin obejmuje wszystkie usługi Serwisu, w tym: kalkulator świadczeń (/), kreator wniosków ZUS (/wnioski), agregator aktualności (/aktualnosci), wyszukiwarkę NFZ (/nfz), Centrum Obywatela (/centrum-obywatela), panel agenta AI (/agent/panel), panel monitoringu dotacji B2B (/dotacje/panel) oraz katalog automatyzacji (/dla-firm, /automatyzacje).
        </div>

        <div className="space-y-8 text-[14px] sm:text-[15px] leading-[1.7] text-text-2">

          <Section n="1" title="Postanowienia ogólne">
            <P>1.1. Niniejszy Regulamin określa zasady świadczenia usług drogą elektroniczną za pośrednictwem serwisu internetowego wezmezadarmo.com (dalej: &quot;Serwis&quot;).</P>
            <P>1.2. Operatorem Serwisu jest:</P>
            <div className="pl-4 mt-1 mb-2 space-y-1 text-[14px]">
              <p><strong className="text-text-1">Mooning Charts Research Kamil Sobkowicz</strong></p>
              <p>NIP: 7133061369</p>
              <p>Kontakt: formularz na stronie <Link href="/o-projekcie" className="text-accent hover:underline">/o-projekcie</Link> lub <ContactEmail />.</p>
            </div>
            <P>1.3. Serwis jest narzędziem informacyjnym pomagającym zidentyfikować świadczenia rządowe, ulgi i programy wsparcia. Serwis nie jest organem administracji publicznej, nie przyznaje świadczeń i nie gwarantuje ich uzyskania.</P>
            <P>1.4. Wszystkie funkcje Serwisu są bezpłatne. Kalkulator świadczeń i kreator wniosków nie wymagają konta. Niektóre narzędzia (panel agenta /agent/panel, panel monitoringu dotacji /dotacje/panel) wymagają rejestracji, ale pozostają bezpłatne, z limitami uczciwego użycia. Serwis nie obsługuje żadnych płatności ani subskrypcji. Strony o automatyzacjach dla firm (/dla-firm, /automatyzacje) mają charakter informacyjny; ewentualne wdrożenia realizują niezależni europejscy partnerzy w ramach co-promocji, poza Serwisem.</P>
          </Section>

          <Section n="2" title="Definicje">
            <P>2.1. Użytkownik: każda osoba fizyczna lub przedstawiciel podmiotu gospodarczego korzystający z Serwisu.</P>
            <P>2.2. Usługa: udostępnienie narzędzi do analizy kwalifikowalności do świadczeń rządowych, wypełniania wniosków ZUS, monitorowania aktualności urzędowych oraz korzystania z publicznych danych państwowych.</P>
            <P>2.3. NIP: Numer Identyfikacji Podatkowej, dziesięciocyfrowy numer identyfikacyjny dla podmiotów gospodarczych.</P>
            <P>2.4. AI: sztuczna inteligencja wykorzystywana w Serwisie jako asystent czatowy oraz element procesu weryfikacji wyników dopasowania świadczeń.</P>
            <P>2.5. EU AI Act: Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2024/1689 z dnia 13 czerwca 2024 r. (Akt o Sztucznej Inteligencji).</P>
          </Section>

          <Section n="3" title="Rodzaj i zakres usług">
            <P>3.1. Serwis świadczy następujące usługi drogą elektroniczną:</P>
            <P className="pl-4">a) kalkulator kwalifikowalności do świadczeń (formularz: wiek, płeć, opcjonalnie NIP firmy; 11 pytań sytuacyjnych);</P>
            <P className="pl-4">b) weryfikacja NIP w rejestrze CEIDG (Ministerstwo Rozwoju) oraz Białej Liście VAT (Ministerstwo Finansów) - poprzez publiczne API; numer NIP nie jest zapisywany przez Operatora;</P>
            <P className="pl-4">c) analiza dopasowania świadczeń do profilu Użytkownika przez autorski silnik regułowy;</P>
            <P className="pl-4">d) asystent AI odpowiadający na pytania o świadczenia; do modelu AI przesyłany jest profil demograficzny (wiek, płeć, dochód, zatrudnienie, sytuacja rodzinna, województwo) oraz lista dopasowanych świadczeń, bez danych umożliwiających bezpośrednią identyfikację (imię, nazwisko, PESEL, adres, e-mail);</P>
            <P className="pl-4">e) prezentacja wyników z kwotami, krokami wnioskowania i źródłami prawnymi.</P>
            <P>3.2. Serwis nie świadczy usług doradztwa prawnego, podatkowego ani finansowego.</P>
            <P>3.3. W kalkulatorze świadczeń Użytkownik podaje wiek i płeć bezpośrednio w formularzu, numer PESEL nie jest wymagany. W kreatorze wniosków (/wnioski) numer PESEL może być podany w formularzu i jest przesyłany na serwer wyłącznie w celu wygenerowania dokumentu PDF, bez zapisu w bazie danych.</P>
          </Section>

          <Section n="3a" title="Kreator wniosków ZUS (/wnioski)">
            <P>3a.1. Kreator wniosków ZUS jest bezpłatny i prowadzi przez wypełnianie formularzy: Z-15A, Z-15B, Z-3, ZAS-53, PEL, ERPO, ERSU. Na końcu generowany jest gotowy PDF do druku lub wysyłki pocztą.</P>
            <P>3a.2. Numer PESEL (jeśli wymagany przez dany formularz) jest przesyłany na serwer wyłącznie w celu wygenerowania pliku PDF. Dane są przetwarzane jednorazowo w pamięci operacyjnej bez zapisu w bazie danych.</P>
            <P>3a.3. Asystent AI w kreatorze otrzymuje wyłącznie opisowe informacje o sytuacji Użytkownika. Numer PESEL NIE jest przesyłany do modeli AI.</P>
            <P>3a.4. Użytkownik ponosi wyłączną odpowiedzialność za treść ostateczną wniosku, jego zgodność z wymaganiami ZUS oraz prawdziwość podanych informacji.</P>
          </Section>

          <Section n="3b" title="Automatyzacje dla firm i JDG (/dla-firm, /automatyzacje)">
            <P>3b.1. Serwis prezentuje informacyjnie katalog automatyzacji procesów firmowych dostępnych dla europejskich firm, m.in.: Faktury z zagranicy, KSeF automatyczny, Raport ZUS miesięczny, Onboarding pracownika, Rozliczenie delegacji, Windykacja należności, Terminarz compliance, OCR paragonów, Alerty wygaśnięcia umów.</P>
            <P>3b.2. Strony te mają charakter wyłącznie informacyjny. Serwis nie sprzedaje tych usług, nie pobiera za nie opłat i nie obsługuje płatności. Ewentualne wdrożenia realizują niezależni europejscy partnerzy, poza Serwisem, w ramach co-promocji i wspierania europejskich przedsiębiorców oraz projektów.</P>
            <P>3b.3. Operator nie pobiera danych firmowych Użytkownika - kontakt odbywa się przez formularz w stopce lub <ContactEmail />.</P>
            <P>3b.4. Karta &quot;Monitoring dotacji&quot; (/dla-firm) prezentuje partnerski serwis VIA (tryvia.eu), prowadzony przez podmiot trzeci. Operator nie świadczy tej usługi bezpośrednio i nie ponosi odpowiedzialności za działanie serwisu partnerskiego.</P>
          </Section>

          <Section n="3c" title="Agregator aktualności (/aktualnosci)">
            <P>3c.1. Bezpłatny agregator aktualności z oficjalnych kanałów RSS instytucji rządowych: ZUS, GUS, NBP, NFZ, UOKiK, Fundusze Europejskie, e-Zdrowie, Sejm RP, ARiMR. Odświeżany w cyklu około 2 razy dziennie (GitHub Actions cron) oraz na żywo dla wybranych źródeł.</P>
            <P>3c.2. Strona zawiera widgety publiczne nieprzetwarzające danych osobowych Użytkownika: jakość powietrza GIOŚ (wybór miasta zapisywany lokalnie w przeglądarce) oraz kursy walut NBP. Dane pobierane są na żywo z api.gios.gov.pl i api.nbp.pl.</P>
            <P>3c.3. Operator nie jest autorem treści RSS ani danych w widgetach - odpowiedzialność za treść ponoszą instytucje będące ich źródłem.</P>
          </Section>

          <Section n="3d" title="Wyszukiwarka NFZ (/nfz)">
            <P>3d.1. Bezpłatna wyszukiwarka, bez konieczności rejestracji. Dwa tryby: kolejki do specjalistów oraz świadczeniodawcy (szpitale, przychodnie) - z opcjonalnym filtrem miasta i województwa.</P>
            <P>3d.2. Dane pobierane na żywo z oficjalnego API NFZ (api.nfz.gov.pl). Operator nie zapisuje historii wyszukiwań na serwerze. Do 5 ostatnich zapytań na typ wyszukiwania zapisywanych jest lokalnie w przeglądarce Użytkownika (localStorage, klucze wzd_nfz_recent_*).</P>
            <P>3d.3. Operator nie odpowiada za dostępność API NFZ ani za aktualność danych o terminach (zależne od raportowania przez świadczeniodawców).</P>
          </Section>

          <Section n="3e" title="Centrum Obywatela (/centrum-obywatela)">
            <P>3e.1. Bezpłatny hub publicznych narzędzi państwowych zintegrowanych z oficjalnymi polskimi API:</P>
            <P className="pl-4">a) NFZ (api.nfz.gov.pl) - kolejki, świadczeniodawcy;</P>
            <P className="pl-4">b) NBP (api.nbp.pl) - kursy walut;</P>
            <P className="pl-4">c) GIOŚ (api.gios.gov.pl) - jakość powietrza;</P>
            <P className="pl-4">d) Biała Lista VAT (wl-api.mf.gov.pl) - status VAT i konta bankowe firm;</P>
            <P className="pl-4">e) IMGW / RCB (api.rcb.gov.pl) - ostrzeżenia meteorologiczne i kryzysowe;</P>
            <P className="pl-4">f) ELI / Sejm RP (api.sejm.gov.pl/eli) - zmiany w przepisach;</P>
            <P className="pl-4">g) BDL GUS (bdl.stat.gov.pl) - dane demograficzne per gmina;</P>
            <P className="pl-4">h) ARiMR (geoportal.arimr.gov.pl) - mapy działek rolnych;</P>
            <P className="pl-4">i) PKP (portalpasazera.pl) - rozkład jazdy i tabela ulg;</P>
            <P className="pl-4">j) CEIDG (dane.biznes.gov.pl) - rejestr firm jednoosobowych;</P>
            <P className="pl-4">k) kolejne narzędzia dodawane w miarę rozwoju Serwisu.</P>
            <P>3e.2. Wszystkie dane są publiczne i pobierane na żywo. Operator nie przekazuje do tych API żadnych danych osobowych Użytkownika - zapytania zawierają jedynie parametry techniczne (kod miasta, NIP firmy do sprawdzenia, zakres dat, kategoria świadczenia).</P>
            <P>3e.3. Operator nie ponosi odpowiedzialności za dostępność API zewnętrznych ani za aktualność i prawdziwość zwracanych danych.</P>
          </Section>

          <Section n="3f" title="Panel agenta AI (/agent/panel)">
            <P>3f.1. Bezpłatny panel wymagający rejestracji (e-mail i hasło, Supabase Auth). Po zalogowaniu Użytkownik uzyskuje dostęp do: profilu demograficznego, listy dopasowanych świadczeń, filtrowanych aktualności, dziennego e-mail digestu oraz asystenta AI z kontekstem profilu.</P>
            <P>3f.2. Dane profilu przechowywane są w bazie Supabase (serwery w UE). Konto może być w każdej chwili usunięte z poziomu panelu lub przez kontakt z Operatorem.</P>
            <P>3f.3. Daily digest jest wysyłany e-mailem (przez usługę Resend, USA) zgodnie z preferencjami ustawionymi w panelu. Można go wyłączyć w każdej chwili w sekcji powiadomień.</P>
          </Section>

          <Section n="3g" title="Panel monitoringu dotacji B2B (/dotacje/panel)">
            <P>3g.1. Bezpłatna usługa dla firm: monitoring otwartych naborów dofinansowań pasujących do profilu firmy (NIP, PKD, województwo, wielkość). Wymaga rejestracji konta.</P>
            <P>3g.2. Usługa jest bezpłatna, z limitami uczciwego użycia. Serwis NIE obsługuje płatności ani subskrypcji.</P>
            <P>3g.3. Dane firmy przechowywane są w bazie Supabase (serwery w UE). Konto może być usunięte przez kontakt z Operatorem.</P>
          </Section>

          <Section n="4" title="Źródła danych o świadczeniach">
            <P>4.1. Baza świadczeń opiera się wyłącznie na oficjalnych, publicznych źródłach prawa i informacji rządowych. Dane nie są wymyślone, szacowane ani pobierane z prywatnych baz. Główne źródła: gov.pl, zus.pl, nfz.gov.pl, podatki.gov.pl, pfron.org.pl, praca.gov.pl, krus.gov.pl, biznes.gov.pl, nfosigw.gov.pl. Adresy źródeł widoczne są bezpośrednio w interfejsie Serwisu przy każdym świadczeniu.</P>
            <P>4.2. Kalkulator świadczeń nie prowadzi bazy danych użytkowników. Żadne dane podane w formularzu kalkulatora nie są zapisywane na serwerach Operatora, nie są profilowane, sprzedawane ani przekazywane do rejestrów.</P>
          </Section>

          <Section n="5" title="Zastrzeżenia dotyczące sztucznej inteligencji">
            <P>5.1. Serwis wykorzystuje modele AI Google Gemini 2.0 Flash (asystent czatowy) oraz Google Gemini 2.0 Flash Lite (weryfikacja wyników dopasowania), dostępne za pośrednictwem platformy OpenRouter, Inc. Faktycznym dostawcą modeli jest Google LLC; OpenRouter pełni rolę pośrednika.</P>
            <P>5.2. <strong className="text-text-1">Klasyfikacja systemu AI zgodnie z EU AI Act (art. 6)</strong>: system AI w Serwisie należy do klasy <strong className="text-text-1">MINIMALNE RYZYKO</strong>. System:</P>
            <P className="pl-4">a) nie jest systemem wysokiego ryzyka (nie spełnia kryteriów z Załącznika III);</P>
            <P className="pl-4">b) nie wykorzystuje praktyk zakazanych (art. 5): brak scoringu społecznego, brak rozpoznawania emocji w miejscu pracy/edukacji, brak biometrii kategoryzującej, brak manipulacji subliminalnej;</P>
            <P className="pl-4">c) nie podejmuje zautomatyzowanych decyzji wywołujących skutki prawne wobec Użytkownika (art. 22 RODO);</P>
            <P className="pl-4">d) pełni wyłącznie rolę informacyjną i doradczą.</P>
            <P>5.3. <strong className="text-text-1">Obowiązki przejrzystości (art. 50 EU AI Act)</strong>:</P>
            <P className="pl-4">a) Użytkownik jest jasno informowany, że wchodzi w interakcję z systemem AI (oznaczenie w nagłówku panelu czatu: &quot;Asystent AI&quot;, badge &quot;AI&quot; przy wiadomościach generowanych przez model);</P>
            <P className="pl-4">b) treści generowane przez AI są wyraźnie oznaczone w interfejsie;</P>
            <P className="pl-4">c) Operator nie generuje deepfake&apos;ów ani treści mogących wprowadzać w błąd co do rzeczywistości.</P>
            <P>5.4. Do modelu AI <strong className="text-text-1">NIE są przesyłane</strong>: imię, nazwisko, numer PESEL, adres zamieszkania, adres e-mail. Przesyłany jest profil demograficzny (wiek, płeć, dochód, zatrudnienie, sytuacja rodzinna, województwo) oraz lista dopasowanych świadczeń.</P>
            <P>5.5. Użytkownik jest informowany, że:</P>
            <P className="pl-4">a) wyniki generowane z udziałem AI mają charakter wyłącznie informacyjny i orientacyjny;</P>
            <P className="pl-4">b) AI może popełniać błędy; wyniki nie stanowią porady prawnej, podatkowej ani finansowej;</P>
            <P className="pl-4">c) ostateczna decyzja o kwalifikowalności do świadczenia należy wyłącznie do właściwego organu administracji publicznej;</P>
            <P className="pl-4">d) Operator nie ponosi odpowiedzialności za decyzje podjęte na podstawie wyników wygenerowanych przez Serwis.</P>
            <P>5.6. Baza świadczeń jest ręcznie zweryfikowana przez człowieka. Przy każdym świadczeniu widoczne są: kryteria dopasowania, źródło prawne i data ostatniej weryfikacji. Użytkownik może zapytać asystenta AI o uzasadnienie każdego dopasowania.</P>
          </Section>

          <Section n="6" title="Warunki techniczne">
            <P>6.1. Korzystanie z Serwisu wymaga urządzenia z dostępem do internetu oraz przeglądarki obsługującej JavaScript (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+).</P>
            <P>6.2. Serwis nie wymaga instalacji dodatkowego oprogramowania.</P>
            <P>6.3. Serwis może wykorzystywać Google Analytics do zbierania anonimowych statystyk odwiedzin. Pliki cookie analityczne są instalowane wyłącznie po wyrażeniu zgody przez Użytkownika (Google Consent Mode v2, domyślnie wyłączone). Serwis nie stosuje pikseli śledzących, fingerprintingu przeglądarki ani technologii profilowania reklamowego.</P>
          </Section>

          <Section n="7" title="Zawarcie i rozwiązanie umowy">
            <P>7.1. Umowa o świadczenie usług drogą elektroniczną zostaje zawarta z chwilą rozpoczęcia korzystania z Serwisu przez Użytkownika.</P>
            <P>7.2. Dla usług bez rejestracji: umowa wygasa z chwilą opuszczenia Serwisu. Historia czatu i wyniki analizy zapisywane są wyłącznie lokalnie w przeglądarce (localStorage, do 7 dni) i nie są w żadnym momencie przesyłane na serwer Operatora.</P>
            <P>7.3. Dla usług wymagających rejestracji (panel agenta, panel dotacji B2B): umowa wygasa z chwilą usunięcia konta przez Użytkownika lub na żądanie skierowane do Operatora. Operator usuwa dane w terminie do 30 dni od żądania.</P>
            <P>7.4. Użytkownik może w każdej chwili zaprzestać korzystania z Serwisu bez podawania przyczyny.</P>
          </Section>

          <Section n="8" title="Prawo odstąpienia od umowy">
            <P>8.1. Wszystkie usługi Serwisu są bezpłatne (kalkulator, kreator wniosków, aktualności, wyszukiwarka NFZ, Centrum Obywatela, panel agenta, panel monitoringu dotacji): zgodnie z art. 38 pkt 1 ustawy o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość nie przysługuje w odniesieniu do umów, za które konsument nie jest zobowiązany do zapłaty.</P>
            <P>8.2. Serwis nie pobiera żadnych opłat i nie obsługuje płatności. Strony o automatyzacjach dla firm mają charakter informacyjny; ewentualne wdrożenia realizują niezależni europejscy partnerzy poza Serwisem, na własnych warunkach.</P>
          </Section>

          <Section n="9" title="Zakaz dostarczania treści bezprawnych i niedozwolone użycie automatyczne">
            <P>9.1. Użytkownik zobowiązuje się do niepodawania danych nieprawdziwych, cudzych ani sfabrykowanych w celu uzyskania informacji o świadczeniach przysługujących innym osobom.</P>
            <P>9.2. Zabronione jest korzystanie z Serwisu w sposób naruszający przepisy prawa, prawa osób trzecich lub dobre obyczaje.</P>
            <P>9.3. Bez uprzedniej pisemnej zgody Operatora zabronione jest automatyczne pobieranie treści Serwisu za pomocą skryptów, botów, crawlerów lub innych narzędzi scrapingowych. Baza świadczeń, jej struktura, opisy i instrukcje stanowią autorskie dzieło Operatora w rozumieniu ustawy z dnia 4 lutego 1994 r. o prawie autorskim i prawach pokrewnych.</P>
            <P>9.4. Bez uprzedniej pisemnej zgody Operatora zabronione jest korzystanie z interfejsu API Serwisu przez podmioty zewnętrzne w celach komercyjnych lub integracyjnych. Dotyczy w szczególności endpointów: <code className="text-[12px] text-text-3">/api/verify</code>, <code className="text-[12px] text-text-3">/api/chat</code>, <code className="text-[12px] text-text-3">/api/form-assist</code>, <code className="text-[12px] text-text-3">/api/pdf</code>, <code className="text-[12px] text-text-3">/api/contact</code>, <code className="text-[12px] text-text-3">/api/aktualnosci</code>, <code className="text-[12px] text-text-3">/api/ceidg</code>, <code className="text-[12px] text-text-3">/api/agent/*</code>, <code className="text-[12px] text-text-3">/api/dotacje/*</code>, <code className="text-[12px] text-text-3">/api/digest/*</code> oraz <code className="text-[12px] text-text-3">/api/public/*</code> (nfz, gios, nbp, whitelist). Korzystanie z API wymaga zawarcia indywidualnej umowy licencyjnej. Zapytania o licencję - przez formularz kontaktowy lub <ContactEmail />.</P>
            <P>9.5. Naruszenie postanowień punktów 9.3 i 9.4 uprawnia Operatora do dochodzenia roszczeń na podstawie przepisów o prawie autorskim oraz ustawy o zwalczaniu nieuczciwej konkurencji, a także blokowania dostępu do Serwisu i API.</P>
          </Section>

          <Section n="10" title="Odpowiedzialność">
            <P>10.1. Serwis dostarcza informacje o charakterze orientacyjnym. Operator dokłada staranności, aby informacje były aktualne i zgodne z obowiązującym stanem prawnym, jednak nie gwarantuje ich kompletności, dokładności ani aktualności.</P>
            <P>10.2. Operator nie ponosi odpowiedzialności za:</P>
            <P className="pl-4">a) decyzje podjęte przez Użytkownika na podstawie informacji uzyskanych z Serwisu;</P>
            <P className="pl-4">b) odmowę przyznania świadczenia przez właściwy organ administracji;</P>
            <P className="pl-4">c) przerwy w działaniu Serwisu wynikające z przyczyn technicznych lub awarii API zewnętrznych (NFZ, GIOŚ, NBP, CEIDG, Biała Lista, RCB, Sejm, GUS, ARiMR, PKP);</P>
            <P className="pl-4">d) działanie serwisów partnerskich (m.in. VIA / tryvia.eu) prowadzonych przez podmioty trzecie.</P>
          </Section>

          <Section n="11" title="Reklamacje">
            <P>11.1. Użytkownik ma prawo złożyć reklamację dotyczącą działania Serwisu przez formularz kontaktowy na stronie <Link href="/o-projekcie" className="text-accent hover:underline">/o-projekcie</Link> lub przez <ContactEmail />.</P>
            <P>11.2. Reklamacja powinna zawierać opis problemu, datę i godzinę wystąpienia oraz adres e-mail do kontaktu zwrotnego.</P>
            <P>11.3. Operator rozpatrzy reklamację w terminie 14 dni od daty jej otrzymania.</P>
          </Section>

          <Section n="12" title="Pozasądowe rozwiązywanie sporów">
            <P>12.1. Konsument ma prawo skorzystać z pozasądowych sposobów rozwiązywania sporów, w tym mediacji prowadzonej przez wojewódzkich inspektorów Inspekcji Handlowej oraz platformy ODR dostępnej pod adresem: <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">ec.europa.eu/consumers/odr</a></P>
          </Section>

          <Section n="13" title="Postanowienia końcowe">
            <P>13.1. Regulamin wchodzi w życie z dniem opublikowania w Serwisie.</P>
            <P>13.2. Operator zastrzega sobie prawo do zmiany Regulaminu. Dalsze korzystanie z Serwisu po opublikowaniu zmian oznacza akceptację nowego brzmienia Regulaminu.</P>
            <P>13.3. W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego, Ustawy o świadczeniu usług drogą elektroniczną, Ustawy o prawach konsumenta, Rozporządzenia (UE) 2016/679 (RODO) oraz Rozporządzenia (UE) 2024/1689 (EU AI Act).</P>
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

function ContactEmail() {
  return <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">email</a>;
}
