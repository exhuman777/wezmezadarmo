/**
 * Wpisy bloga o dotacjach dla firm (listopad 2026). Fakty wyłącznie z oficjalnych źródeł,
 * każde z linkiem i datą sprawdzenia (6.11.2026). Ranking: budżet naboru według zestawienia
 * Ministerstwa Funduszy i Polityki Regionalnej (MFiPR) z 4.11.2026, tylko nabory, w których
 * wniosek składa przedsiębiorstwo, i w których wnioski przyjmowane są w listopadzie 2026.
 * Przed zmianą kwoty albo terminu: sprawdź ogłoszenie naboru i podbij datę `zmiana`.
 */
import type { BlogPost } from './blog-posts';

const SPRAWDZONO = '6.11.2026';

/** Oficjalne źródła (adresy sprawdzone 6.11.2026). */
export const ZRODLA = {
  mfiprListopad: 'https://funduszeeuropejskie.gov.pl/aktualnosci/nabory-z-funduszy-europejskich-w-listopadzie-2026-roku/',
  mfiprKrajowe: 'https://funduszeeuropejskie.gov.pl/wp-content/uploads/2026/11/NABORY_Krajowe_Programy_listopad2.xlsx',
  mfiprRegionalne: 'https://funduszeeuropejskie.gov.pl/wp-content/uploads/2026/10/Nabory_Programy_Regionalne_listopad.xlsx',
  harmonogramFeng: 'https://nowoczesnagospodarka.gov.pl/dokumenty/harmonogram-naborow-w-programie-fundusze-europejskie-dla-nowoczesnej-gospodarki/',
  smartOgloszenie: 'https://www.parp.gov.pl/storage/grants/documents/743/ogloszenie_naboru.pdf',
  smartPortal: 'https://www.funduszeunijne.gov.pl/nabory/11-sciezka-smart-nabor-projektow-br/',
  dualUsePortal: 'https://www.funduszeunijne.gov.pl/nabory/233-kredyt-na-wytwarzanie-produktow-podwojnego-zastosowania/',
  dualUseKryteria: 'https://nowoczesnagospodarka.gov.pl/wp-content/uploads/2026/07/zal_1_Kryteria_KREDU_CLEAR-2.pdf',
  dualUseBgk: 'https://www.bgk.pl/produkty/kredyt-na-wytwarzanie-produktow-podwojnego-zastosowania/',
  swietokrzyskie: 'https://funduszeueswietokrzyskie.pl/nabory/ogloszenie-naboru-nr-fesw-13-01-iz-00-001-26-w-ramach-dzialania-13-1-wsparcie-przemyslu-obronnego',
  lodzkie: 'https://funduszeue.lodzkie.pl/nabory/dzialanie-feld1301-zdolnosci-przemyslowe-dla-obronnosci-i-technologii-podwojnego/',
  opolskie: 'https://funduszeue.opolskie.pl/nabory/141-rozwoj-technologii-dual-use',
  slaskie: 'https://funduszeue.slaskie.pl/web/guest/nabory/lsi/596',
  platformyIIa: 'https://www.funduszeunijne.gov.pl/nabory/11-platformy-startowe-dla-nowych-pomyslow-komponent-iia-wsparcie-rozwoju-dzialalnosci-gospodarczej-startupu-1/',
  platformyIIb: 'https://www.funduszeunijne.gov.pl/nabory/11-platformy-startowe-dla-nowych-pomyslow-2/',
  digit: 'https://digit.arp.pl/eventy/nabory/digit-konkurs-22026/',
  eurogranty: 'https://www.funduszeunijne.gov.pl/nabory/212-granty-na-eurogranty-3/',
  doginvoice: 'https://doginvoice.com',
} as const;

const Z = ZRODLA;

const PO_DOTACJI = `## Po otrzymaniu dotacji: faktury i płatności

Dotacja to też rozliczenie: faktury od dostawców, przelewy i terminy. [DogInvoice](${Z.doginvoice}) pobiera faktury z KSeF, łączy się z bankiem i sam dopasowuje wpłaty do faktur, więc widać, co jest opłacone, a co czeka. Widzisz też, czy klienci zapłacili Ci za fakturę.`;

const SPRAWDZ_FIRME = `## Sprawdź, co pasuje do Twojej firmy

 • [Wyszukiwarka programów](/dotacje#wyszukiwarka): programy z bazy, bez konta i bez e-maila.
 • [Dofinansowania po NIP](/dla-firm/narzedzia/dofinansowania): dane firmy z CEIDG i pasujące programy. To jedyne miejsce na stronie, które prosi o e-mail.
 • [10 największych dotacji dla firm w 2026](/blog/najwieksze-dotacje-dla-firm-2026): ranking naborów z listopada według budżetu.`;

export const WPISY_DOTACJE_2026: BlogPost[] = [
  {
    slug: 'najwieksze-dotacje-dla-firm-2026',
    title: '10 największych dotacji dla firm w 2026: nabory otwarte w listopadzie',
    tytulSeo: '10 największych dotacji dla firm w 2026',
    description: 'Ranking 10 naborów dla firm z listopada 2026 według budżetu: Ścieżka SMART 500 mln zł, kredyt dual-use 400 mln zł i programy regionalne. Ze źródłami.',
    date: '2026-11-06',
    zmiana: '2026-11-06',
    author: 'Zespół wezmezadarmo',
    readingMinutes: 9,
    tags: ['dotacje dla firm 2026', 'największe dotacje', 'Ścieżka SMART', 'kredyt dual-use', 'FENG', 'nabory listopad 2026', 'dofinansowanie dla MŚP'],
    dlaFirm: true,
    content: `## Jak powstał ranking

Kryterium: budżet naboru, czyli pula pieniędzy na wszystkie projekty w danym konkursie. Bierzemy tylko nabory, w których wniosek składa przedsiębiorstwo i w których wnioski przyjmowane są w listopadzie 2026.

Listę naborów i budżety bierzemy z zestawienia Ministerstwa Funduszy i Polityki Regionalnej z 4.11.2026: [Nabory z Funduszy Europejskich w listopadzie 2026 roku](${Z.mfiprListopad}). Według ministerstwa w listopadzie trwają 152 konkursy, w tym 15 z programów krajowych na prawie 1,7 mld zł i 122 z programów regionalnych na ponad 3 mld zł.

Pomijamy nabory dla samorządów, szkół i organizacji badawczych. Wszystkie dane sprawdziliśmy ${SPRAWDZONO} w ogłoszeniach naborów.

## 1. Ścieżka SMART dla MŚP: 500 mln zł

 • Na co: projekty badawczo-rozwojowe (B+R), czyli badania przemysłowe i prace rozwojowe, które prowadzą do nowego produktu albo procesu.
 • Kto: pojedyncze mikro, małe i średnie przedsiębiorstwa.
 • Termin: od 29.10.2026 do 29.12.2026, w ostatnim dniu do godz. 16:00.
 • Instytucja: Polska Agencja Rozwoju Przedsiębiorczości (PARP), program FENG.

Na jeden projekt można dostać do 50 mln zł, a minimalne koszty prac B+R to 3 mln zł. Źródła: [ogłoszenie naboru PARP](${Z.smartOgloszenie}) i [zestawienie MFiPR](${Z.mfiprKrajowe}). Więcej: [Ścieżka SMART 2026 dla MŚP](/blog/sciezka-smart-2026-dotacja-dla-msp).

## 2. Kredyt na produkty podwójnego zastosowania: 400 mln zł

 • Na co: inwestycje w produkcję wyrobów o zastosowaniu cywilnym i wojskowym (dual-use).
 • Kto: mikro, małe i średnie przedsiębiorstwa.
 • Termin: od 29.10.2026 do 28.01.2027.
 • Instytucja: Bank Gospodarstwa Krajowego (BGK), program FENG, działanie 2.33.

Dofinansowanie spłaca część kredytu inwestycyjnego, do 70% wydatków kwalifikowalnych zależnie od wielkości firmy i miejsca projektu. Źródło: [strona naboru na portalu Funduszy Europejskich](${Z.dualUsePortal}). Więcej: [kredyt dual-use z BGK](/blog/kredyt-dual-use-bgk-2026).

## 3. Wsparcie przemysłu obronnego w Świętokrzyskiem: 113 mln zł

 • Program: Fundusze Europejskie dla Świętokrzyskiego, działanie 13.01.
 • Termin: od 30.06.2026 do 08.01.2027.
 • Instytucja: Urząd Marszałkowski Województwa Świętokrzyskiego.

Ministerstwo oznacza ten nabór jako nabór dla przedsiębiorców. Kto dokładnie może złożyć wniosek, opisuje [ogłoszenie naboru](${Z.swietokrzyskie}). Budżet i termin: [zestawienie MFiPR dla programów regionalnych](${Z.mfiprRegionalne}).

## 4. Zdolności przemysłowe dla obronności w Łódzkiem: 90,09 mln zł

 • Na co: inwestycje produkcyjne i projekty B+R w technologiach dla obronności i dual-use.
 • Kto: duże przedsiębiorstwa, MŚP i konsorcja naukowo-przemysłowe z wiodącą rolą przedsiębiorcy.
 • Termin: od 30.09.2026 do 30.11.2026, do godz. 23:59.
 • Instytucja: Centrum Obsługi Przedsiębiorcy, nabór FELD.13.01-IP.02-001/26.

Minimalna wartość projektu to 1 mln zł. Przy inwestycjach dofinansowanie wynosi do 40% dla dużych firm, 50% dla średnich i 60% dla mikro i małych. Źródło: [ogłoszenie naboru](${Z.lodzkie}).

## 5. Rozwój technologii dual-use w Opolskiem: 48 mln zł

 • Na co: rozwój i wdrożenie technologii podwójnego zastosowania, np. dronów, sensorów, robotów i oprogramowania, oraz pierwsza produkcja.
 • Kto: MŚP i duże przedsiębiorstwa z siedzibą, oddziałem albo miejscem działalności w województwie opolskim.
 • Termin: od 27.10.2026 do 30.11.2026 (termin przedłużony 26.10.2026).
 • Instytucja: Opolskie Centrum Rozwoju Gospodarki, nabór FEOP.14.01-IP.01-001/26.

Maksymalny poziom dofinansowania to 70%. Źródło: [ogłoszenie naboru](${Z.opolskie}).

## 6. Przemysł obronny w Śląskiem: 43,65 mln zł

 • Na co: inwestycje produkcyjne, które zwiększają możliwości dostaw dla sił zbrojnych państw UE.
 • Kto: duże przedsiębiorstwa, które w ciągu 5 lat przed wnioskiem dostarczały siłom zbrojnym państw UE produkty lub usługi związane z obronnością.
 • Termin: od 22.10.2026 do 17.12.2026.
 • Instytucja: Śląskie Centrum Przedsiębiorczości, nabór FESL.15.01-IP.01-353/26.

Źródła: [ogłoszenie naboru](${Z.slaskie}) i [zestawienie MFiPR](${Z.mfiprRegionalne}).

## 7. Dig.IT: cyfryzacja firm produkcyjnych: 40 mln zł

 • Na co: wdrożenie gotowych technologii cyfrowych albo zamówione prace programistyczne.
 • Kto: MŚP z przetwórstwa przemysłowego albo usług produkcyjnych, z co najmniej 5 zamkniętymi latami obrotowymi.
 • Termin: od 2.11.2026 do 30.11.2026.
 • Instytucja: Agencja Rozwoju Przemysłu (ARP), program FENG.

Grant wynosi od 150 000 zł do 850 000 zł, do 50% kosztów kwalifikowanych. Źródło: [strona naboru ARP](${Z.digit}). Więcej: [Dig.IT krok po kroku](/blog/digit-arp-dotacja-na-cyfryzacje-2026).

## 8. Platformy startowe w Polsce Wschodniej: 40 mln zł

 • Na co: rozwój produktu startupu i pierwsza sprzedaż.
 • Kto: mikro i małe spółki kapitałowe z Polski Wschodniej, które mają raport z inkubacji i rekomendację Platformy Startowej.
 • Termin: od 3.11.2026 do 14.01.2027.
 • Instytucja: PARP, program FEPW, komponent IIa.

Dig.IT i Platformy startowe mają ten sam budżet, więc wyżej stoi nabór, który kończy się wcześniej. Źródło: [strona naboru](${Z.platformyIIa}).

## 9. Granty na eurogranty: 15 mln zł

 • Na co: przygotowanie projektu do programów UE zarządzanych przez Komisję Europejską, np. szukanie partnerów i prezentacja projektu w ocenie.
 • Kto: MŚP i organizacje badawcze.
 • Termin: od 19.11.2026 do 31.03.2027.
 • Instytucja: PARP, program FENG.

Źródło: [strona naboru](${Z.eurogranty}).

## 10. Platformy startowe, komponent IIb: 10 mln zł

 • Na co: dodatkowe wsparcie produktu, który startup przygotował w Platformach startowych i wprowadził na rynek.
 • Kto: mikro i małe spółki kapitałowe z Polski Wschodniej po projekcie w komponencie IIa.
 • Termin: od 6.10.2026 do 10.12.2026.
 • Instytucja: PARP, program FEPW.

Źródło: [strona naboru](${Z.platformyIIb}).

## Czego nie ma w rankingu

Szkolenia podwójnego zastosowania w Śląskiem mają w zestawieniu MFiPR budżet 149,93 mln zł, ale ogłoszenie z warunkami ma się ukazać później. Bez ogłoszenia nie wiemy, kto składa wniosek, więc nabór nie trafił do listy.

Harmonogram FENG zapowiada na listopad 2026 do stycznia 2027 nabory STEP dla technologii obronnych: 500 mln zł w PARP i dwa po 250 mln zł w NCBR. Ogłoszenie ma nastąpić pod warunkiem przyjęcia zmian w programie. Źródło: [harmonogram naborów FENG, wersja od 31.07.2026](${Z.harmonogramFeng}).

${SPRAWDZ_FIRME}

${PO_DOTACJI}

## Źródła

Wszystkie sprawdzone ${SPRAWDZONO}.

 • [MFiPR: Nabory z Funduszy Europejskich w listopadzie 2026 roku](${Z.mfiprListopad})
 • [MFiPR: tabela naborów z programów krajowych (XLSX)](${Z.mfiprKrajowe})
 • [MFiPR: tabela naborów z programów regionalnych (XLSX)](${Z.mfiprRegionalne})
 • [Harmonogram naborów FENG](${Z.harmonogramFeng})
 • [PARP: ogłoszenie naboru Ścieżka SMART FENG.01.01-IP.02-003/26 (PDF)](${Z.smartOgloszenie})
 • [Portal FE: Kredyt na wytwarzanie produktów podwójnego zastosowania](${Z.dualUsePortal})
 • [Fundusze Europejskie dla Łódzkiego: FELD.13.01](${Z.lodzkie})
 • [Fundusze Europejskie dla Opolskiego: FEOP.14.01](${Z.opolskie})
 • [Fundusze Europejskie dla Śląskiego: FESL.15.01](${Z.slaskie})
 • [ARP: Dig.IT konkurs 2/2026](${Z.digit})`,
    faq: [
      {
        pytanie: 'Jaka jest największa dotacja dla firm w listopadzie 2026?',
        odpowiedz: `Ścieżka SMART dla MŚP z budżetem 500 mln zł (PARP, wnioski od 29.10.2026 do 29.12.2026). Drugi jest kredyt na produkty podwójnego zastosowania z BGK: 400 mln zł. Źródło: [zestawienie MFiPR](${Z.mfiprListopad}).`,
      },
      {
        pytanie: 'Czy budżet naboru to kwota dla jednej firmy?',
        odpowiedz: 'Nie. Budżet to pula na wszystkie projekty w naborze. Limit dla jednego projektu podaje ogłoszenie, np. w Ścieżce SMART do 50 mln zł.',
      },
      {
        pytanie: 'Czy kredyt dual-use z BGK to dotacja?',
        odpowiedz: `Ministerstwo podaje formę wsparcia „dotacja”. Dofinansowanie spłaca część kredytu inwestycyjnego, który firma bierze w banku współpracującym z BGK. Źródło: [kryteria wyboru projektów](${Z.dualUseKryteria}).`,
      },
      {
        pytanie: 'Gdzie znajdę wszystkie nabory, także mniejsze?',
        odpowiedz: `Na portalu Funduszy Europejskich w zakładce „Nabory wniosków” i w [miesięcznym zestawieniu MFiPR](${Z.mfiprListopad}). Programy z naszej bazy przeszukasz bez konta w [wyszukiwarce dotacji](/dotacje#wyszukiwarka).`,
      },
    ],
  },

  {
    slug: 'sciezka-smart-2026-dotacja-dla-msp',
    title: 'Ścieżka SMART 2026 dla MŚP: 500 mln zł na prace B+R, wnioski do 29 grudnia',
    tytulSeo: 'Ścieżka SMART 2026 dla MŚP: 500 mln zł na B+R',
    description: 'Ścieżka SMART 2026 dla MŚP: 500 mln zł, do 50 mln zł na projekt, dofinansowanie 35-80%, wnioski od 29.10 do 29.12.2026 w systemie PARP. Kto może i na co.',
    date: '2026-11-06',
    zmiana: '2026-11-06',
    author: 'Zespół wezmezadarmo',
    readingMinutes: 5,
    tags: ['Ścieżka SMART 2026', 'dotacja na B+R', 'PARP nabór', 'FENG dla MŚP', 'dotacje dla firm 2026', 'prace badawczo-rozwojowe dotacja'],
    dlaFirm: true,
    content: `## Ścieżka SMART w skrócie

Ścieżka SMART to dotacja z programu Fundusze Europejskie dla Nowoczesnej Gospodarki (FENG) na projekty badawczo-rozwojowe firm. Nabór dla MŚP prowadzi PARP, numer FENG.01.01-IP.02-003/26.

Budżet naboru to 500 mln zł. To największy nabór dla firm w listopadzie 2026 w zestawieniu MFiPR, patrz [ranking 10 największych dotacji](/blog/najwieksze-dotacje-dla-firm-2026).

## Termin naboru Ścieżka SMART 2026

Wnioski przyjmowane są od 29 października 2026 do 29 grudnia 2026, w ostatnim dniu do godz. 16:00. Składa się je w Lokalnym Systemie Informatycznym PARP. PARP ogłosił nabór 29.09.2026. Źródło: [ogłoszenie naboru PARP (PDF)](${Z.smartOgloszenie}).

## Kto może dostać dofinansowanie

Mikro, mali i średni przedsiębiorcy z działalnością zarejestrowaną w Polsce. Projekt może dotyczyć całego kraju. Źródło: [ogłoszenie naboru](${Z.smartOgloszenie}).

## Ile pieniędzy na projekt

 • Dofinansowanie: od 35% do 80% zależnie od rodzaju zadania, wydatku, wielkości firmy i miejsca projektu.
 • Minimalne koszty kwalifikowane prac B+R: 3 mln zł.
 • Maksymalna pomoc na projekt: 50 mln zł.

Źródło: [ogłoszenie naboru](${Z.smartOgloszenie}).

## Na co można wydać dotację

Prace B+R są obowiązkowe: badania przemysłowe i prace rozwojowe albo same prace rozwojowe, które prowadzą do innowacji produktowej albo innowacji w procesie biznesowym.

Do projektu można dodać dwa moduły nieobowiązkowe:

 • umiędzynarodowienie produktu i ochrona własności przemysłowej, np. targi, misje gospodarcze, koszty patentu;
 • rozwój kompetencji pracowników i kadry zarządzającej, np. szkolenia w kraju i za granicą.

W pracach B+R kwalifikują się m.in. wynagrodzenia personelu B+R, usługi zewnętrzne, amortyzacja aparatury i budynków, wartości niematerialne i prawne oraz koszty pośrednie. Źródło: [ogłoszenie naboru](${Z.smartOgloszenie}).

## Następny nabór w Ścieżce SMART

Harmonogram FENG zapowiada nabór dla MŚP na wdrożenie wyników prac B+R od 21.01.2027 do 16.03.2027. Budżet ma zostać podany później. Źródło: [harmonogram naborów FENG](${Z.harmonogramFeng}).

${SPRAWDZ_FIRME}

${PO_DOTACJI}

## Źródła

Wszystkie sprawdzone ${SPRAWDZONO}.

 • [PARP: ogłoszenie naboru FENG.01.01-IP.02-003/26 (PDF)](${Z.smartOgloszenie})
 • [Portal FE: strona naboru Ścieżka SMART](${Z.smartPortal})
 • [MFiPR: Nabory z Funduszy Europejskich w listopadzie 2026 roku](${Z.mfiprListopad})
 • [Harmonogram naborów FENG](${Z.harmonogramFeng})`,
    faq: [
      {
        pytanie: 'Do kiedy można złożyć wniosek w Ścieżce SMART?',
        odpowiedz: 'Do 29 grudnia 2026, do godz. 16:00. Nabór ruszył 29 października 2026.',
      },
      {
        pytanie: 'Czy mogę złożyć wniosek bez prac B+R?',
        odpowiedz: 'Nie. Prace B+R są obowiązkowe. Moduły umiędzynarodowienia i kompetencji można tylko do nich dodać.',
      },
      {
        pytanie: 'Ile maksymalnie można dostać w Ścieżce SMART?',
        odpowiedz: 'Do 50 mln zł pomocy na jeden projekt, przy dofinansowaniu od 35% do 80% kosztów.',
      },
      {
        pytanie: 'Czy duża firma może wziąć udział w tym naborze?',
        odpowiedz: 'Nie. Nabór FENG.01.01-IP.02-003/26 jest dla mikro, małych i średnich przedsiębiorstw.',
      },
    ],
  },

  {
    slug: 'kredyt-dual-use-bgk-2026',
    title: 'Kredyt dual-use z BGK: 400 mln zł dla MŚP na produkcję podwójnego zastosowania',
    tytulSeo: 'Kredyt dual-use BGK 2026: 400 mln zł dla MŚP',
    description: 'Kredyt na wytwarzanie produktów podwójnego zastosowania z BGK: 400 mln zł, do 70% wydatków, min. 2 mln zł kosztów. Wnioski od 29.10.2026 do 28.01.2027.',
    date: '2026-11-06',
    zmiana: '2026-11-06',
    author: 'Zespół wezmezadarmo',
    readingMinutes: 5,
    tags: ['kredyt dual-use', 'BGK kredyt 2026', 'podwójne zastosowanie', 'FENG 2.33', 'dotacje dla firm 2026', 'dofinansowanie dla MŚP'],
    dlaFirm: true,
    content: `## Kredyt dual-use w skrócie

Kredyt na wytwarzanie produktów podwójnego zastosowania to działanie 2.33 programu FENG. Wspiera inwestycje MŚP w produkcję wyrobów, które mają zastosowanie cywilne i wojskowe.

Budżet naboru to 400 mln zł. To drugi największy nabór dla firm w listopadzie 2026, patrz [ranking 10 największych dotacji](/blog/najwieksze-dotacje-dla-firm-2026). Źródło: [strona naboru na portalu Funduszy Europejskich](${Z.dualUsePortal}).

## Termin naboru

Wnioski przyjmuje Bank Gospodarstwa Krajowego od 29.10.2026 do 28.01.2027. Planowane rozstrzygnięcie naboru: lipiec 2027. Wniosek składa się elektronicznie w generatorze wniosków BGK. Źródło: [strona naboru](${Z.dualUsePortal}).

## Jak działa dofinansowanie

Firma bierze kredyt inwestycyjny w banku, który współpracuje z BGK. Dofinansowanie to częściowa refundacja części kapitałowej tego kredytu. Do wniosku trzeba dołączyć promesę albo warunkową umowę kredytu z takiego banku. Źródło: [kryteria wyboru projektów (PDF)](${Z.dualUseKryteria}).

Poziom dofinansowania: do 70% wydatków kwalifikowalnych, zależnie od wielkości firmy i miejsca projektu. Źródło: [strona naboru](${Z.dualUsePortal}).

## Kto może skorzystać

Mikro, małe i średnie przedsiębiorstwa. Źródło: [strona naboru](${Z.dualUsePortal}).

Warunki z kryteriów wyboru projektów:

 • wydatki kwalifikowalne co najmniej 2 mln zł;
 • wkład własny co najmniej 25% kosztów kwalifikowalnych, ze środków bez wsparcia publicznego;
 • projekt to inwestycja początkowa w rozumieniu przepisów o pomocy publicznej.

Źródło: [kryteria wyboru projektów (PDF)](${Z.dualUseKryteria}).

## Na co można wydać pieniądze

 • zakup gruntu albo prawa użytkowania wieczystego i nieruchomości, bez lokali mieszkalnych;
 • zakup albo wytworzenie środków trwałych;
 • roboty i materiały budowlane;
 • patenty, licencje, know-how i inne prawa własności intelektualnej.

Źródło: [strona naboru](${Z.dualUsePortal}). Regulamin, wzór umowy i generator wniosków są na [stronie produktu BGK](${Z.dualUseBgk}).

${SPRAWDZ_FIRME}

${PO_DOTACJI}

## Źródła

Wszystkie sprawdzone ${SPRAWDZONO}.

 • [Portal FE: 2.33 Kredyt na wytwarzanie produktów podwójnego zastosowania](${Z.dualUsePortal})
 • [Kryteria wyboru projektów dla działania 2.33 FENG (PDF)](${Z.dualUseKryteria})
 • [MFiPR: Nabory z Funduszy Europejskich w listopadzie 2026 roku](${Z.mfiprListopad})
 • [BGK: strona produktu](${Z.dualUseBgk})`,
    faq: [
      {
        pytanie: 'Do kiedy trwa nabór na kredyt dual-use?',
        odpowiedz: 'Od 29 października 2026 do 28 stycznia 2027. Wnioski przyjmuje BGK w generatorze wniosków.',
      },
      {
        pytanie: 'Ile wynosi dofinansowanie kredytu dual-use?',
        odpowiedz: 'Do 70% wydatków kwalifikowalnych, zależnie od wielkości firmy i miejsca projektu.',
      },
      {
        pytanie: 'Jaki jest minimalny projekt?',
        odpowiedz: 'Wydatki kwalifikowalne muszą wynosić co najmniej 2 mln zł.',
      },
      {
        pytanie: 'Czy potrzebuję kredytu z banku?',
        odpowiedz: 'Tak. Do wniosku dołączasz promesę albo warunkową umowę kredytu z banku, który współpracuje z BGK w tym działaniu.',
      },
    ],
  },

  {
    slug: 'digit-arp-dotacja-na-cyfryzacje-2026',
    title: 'Dig.IT 2026: grant do 850 000 zł na cyfryzację firm produkcyjnych',
    tytulSeo: 'Dig.IT 2026: do 850 000 zł na cyfryzację MŚP',
    description: 'Dig.IT z ARP: granty od 150 000 do 850 000 zł, do 50% kosztów, na technologie cyfrowe w MŚP z przetwórstwa przemysłowego. Wnioski do 30.11.2026.',
    date: '2026-11-06',
    zmiana: '2026-11-06',
    author: 'Zespół wezmezadarmo',
    readingMinutes: 4,
    tags: ['Dig.IT', 'dotacja na cyfryzację', 'ARP grant', 'FENG 2.21', 'dotacje dla firm 2026', 'cyfryzacja produkcji'],
    dlaFirm: true,
    content: `## Dig.IT w skrócie

Dig.IT to granty Agencji Rozwoju Przemysłu (ARP) z programu FENG na wdrożenie technologii cyfrowych w małych i średnich firmach produkcyjnych. Trwa konkurs 2/2026.

Budżet naboru to 40 mln zł. Źródło: [zestawienie MFiPR z 4.11.2026](${Z.mfiprListopad}). Nabór jest w [rankingu 10 największych dotacji](/blog/najwieksze-dotacje-dla-firm-2026).

## Termin naboru Dig.IT

Wnioski przyjmowane są od 2 listopada 2026 do 30 listopada 2026. Źródło: [strona naboru ARP](${Z.digit}).

## Ile można dostać

 • Grant od 150 000 zł do 850 000 zł.
 • Do 50% kosztów kwalifikowanych.
 • Grant nie może przekroczyć 30% średnich rocznych przychodów netto ze sprzedaży z ostatnich trzech lat.
 • Pomoc de minimis, wypłata jednorazowo jako refundacja, bez zaliczek.

Źródło: [strona naboru ARP](${Z.digit}).

## Kto może złożyć wniosek

MŚP, których główna działalność to przetwórstwo przemysłowe albo usługi produkcyjne, np. naprawy, remonty, odlewnictwo albo obróbka na zlecenie. Firma musi mieć co najmniej 5 zamkniętych pełnych lat obrotowych i wolny limit pomocy de minimis. Projekt nie może zacząć się przed złożeniem wniosku. Źródło: [strona naboru ARP](${Z.digit}).

## Na co można wydać grant

Projekt musi obejmować co najmniej jedno z dwóch działań:

 • zakup i wdrożenie gotowych technologii cyfrowych;
 • zamówienie prac programistycznych i wdrożenie ich w firmie.

Do 40% kosztów projektu mogą stanowić szkolenia pracowników z nowych technologii, środki trwałe potrzebne do wdrożenia oraz materiały. Źródło: [strona naboru ARP](${Z.digit}).

${SPRAWDZ_FIRME}

${PO_DOTACJI}

## Źródła

Wszystkie sprawdzone ${SPRAWDZONO}.

 • [ARP: Dig.IT konkurs 2/2026](${Z.digit})
 • [MFiPR: Nabory z Funduszy Europejskich w listopadzie 2026 roku](${Z.mfiprListopad})
 • [MFiPR: tabela naborów z programów krajowych (XLSX)](${Z.mfiprKrajowe})`,
    faq: [
      {
        pytanie: 'Do kiedy trwa nabór Dig.IT?',
        odpowiedz: 'Od 2 do 30 listopada 2026.',
      },
      {
        pytanie: 'Ile wynosi grant Dig.IT?',
        odpowiedz: 'Od 150 000 zł do 850 000 zł, do 50% kosztów kwalifikowanych, w formule de minimis.',
      },
      {
        pytanie: 'Czy firma usługowa może dostać Dig.IT?',
        odpowiedz: 'Tak, jeśli jej główna działalność to usługi produkcyjne, np. naprawy, remonty albo obróbka na zlecenie producenta. Nabór obejmuje tylko przetwórstwo przemysłowe i usługi produkcyjne.',
      },
      {
        pytanie: 'Czy młoda firma może złożyć wniosek?',
        odpowiedz: 'Nie. Firma musi mieć co najmniej 5 zamkniętych pełnych lat obrotowych.',
      },
    ],
  },
];
