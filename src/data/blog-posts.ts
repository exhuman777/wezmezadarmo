/**
 * Baza artykulow bloga - statyczne MDX-like.
 * Kazdy artykul = jeden eksport object z metadata + content (Markdown-like).
 *
 * Format: zostaw 'opis' krotki (do meta description SEO),
 * 'content' to surowy tekst (rendered jako paragraphs + headings).
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;     // Meta description - max 160 chars
  date: string;            // ISO 'YYYY-MM-DD'
  author: string;
  readingMinutes: number;
  tags: string[];
  ogImage?: string;
  content: string;         // Surowy text/markdown - renderowane po heading patterns
}

export const POSTS: BlogPost[] = [
  {
    slug: 'co-nowego-lipiec-2026-wyszukiwarka-audyt',
    title: 'Wyszukiwarka, która rozumie "kuroniówkę" i automatyczny audyt 133 źródeł: co nowego w serwisie',
    description: 'Nowa wyszukiwarka świadczeń działa bez polskich znaków i zna potoczne nazwy. Do tego automatyczny audyt 133 oficjalnych źródeł i szczelniejszy limit czatu AI.',
    date: '2026-07-05',
    author: 'Zespół wezmezadarmo',
    readingMinutes: 4,
    tags: ['aktualizacja', 'wyszukiwarka', 'świadczenia', 'za-kulisami'],
    content: `## Po co ten wpis

wezmezadarmo.com to projekt pro bono: baza 133 świadczeń, kalkulator dopasowania i asystent AI. Utrzymujemy go ze środków własnych i chcemy, żeby było widać, co się w nim dzieje. Poniżej zmiany z przełomu czerwca i lipca 2026.

## Wyszukiwarka, która mówi po ludzku

Największa zmiana dla Was. Dotychczasowa wyszukiwarka na stronie świadczeń wymagała wpisania dokładnej nazwy, z polskimi znakami. Teraz:

 • Piszesz bez ogonków i działa: "swiadczenie pielegnacyjne" znajdzie "Świadczenie pielęgnacyjne".
 • Zna potoczne nazwy: "kuroniówka" pokaże zasiłek dla bezrobotnych, "trzynastka" trzynastą emeryturę, "wyprawka" program Dobry Start, "800 plus" świadczenie wychowawcze.
 • Radzi sobie z odmianą: "leki seniorzy" trafi na bezpłatne leki dla osób 65+.
 • Przeszukuje też opisy, wymagane dokumenty i kroki wniosku, nie tylko nazwy. Wyniki układa według trafności.

Ta sama poprawka objęła czat: asystent AI lepiej rozpoznaje temat pytania niezależnie od tego, czy piszesz z polskimi znakami, czy bez.

## Automatyczny audyt 133 oficjalnych źródeł

Każde świadczenie w bazie linkuje do oficjalnego źródła: ZUS, gov.pl, NFZ, KRUS, PFRON. Problem w tym, że urzędy regularnie przebudowują swoje strony i linki umierają po cichu.

Dlatego co tydzień automat sprawdza wszystkie 133 adresy. Wykrywa:

 • zwykłe błędy 404, czyli strona przestała istnieć,
 • "miękkie 404", czyli podstępniejszy przypadek: urząd przekierowuje stary adres na stronę główną i niby wszystko działa, ale treści już nie ma,
 • strony, z których treść zniknęła, mimo że adres wciąż odpowiada.

W czerwcowym audycie wyłapaliśmy i naprawiliśmy sześć martwych linków, głównie po dużej przebudowie serwisu ZUS. Przy okazji zweryfikowaliśmy kwoty kilkunastu najbardziej zmiennych świadczeń po marcowej waloryzacji: wszystkie w bazie są aktualne, w tym zasiłek pogrzebowy 7000 zł od stycznia 2026 i najniższa emerytura 1978,49 zł od marca 2026.

## Drobniejsze, ale ważne

 • Limit czatu AI (3 pytania dziennie) jest teraz szczelny niezależnie od tego, jak serwis skaluje się w tle. Dbamy o prywatność: nie przechowujemy adresów IP, tylko ich nieodwracalne skróty.
 • Błędne zapytania do czatu nie zjadają już dziennego limitu.
 • Gdy logowanie ma awarię, zobaczysz zrozumiałą stronę z wyjaśnieniem zamiast technicznego błędu.
 • Strona główna ładuje się szybciej dzięki zoptymalizowanym zdjęciom, a nawigacja między podstronami nie przeładowuje całej strony.

## Co dalej

Pracujemy nad rozszerzeniem bazy świadczeń i lepszym dopasowaniem do profilu rodziny. Jeśli znajdziesz błąd albo nieaktualną kwotę, napisz: hello@wezmezadarmo.com. Każde zgłoszenie sprawdzamy ręcznie u źródła.`,
  },
  {
    slug: '10-swiadczen-o-ktorych-nie-wiesz',
    title: '10 świadczeń o których nie wiesz, że Ci się należą w 2026',
    description: 'Polacy tracą ~3000 PLN rocznie nie korzystając ze świadczeń. Sprawdź 10 najczęściej pomijanych: bon ciepłowniczy, ulga IKZE, refundacja okularów NFZ, dodatek mieszkaniowy i inne.',
    date: '2026-05-24',
    author: 'Zespół wezmezadarmo',
    readingMinutes: 8,
    tags: ['świadczenia', 'ulgi-podatkowe', 'NFZ', 'ZUS', 'poradnik'],
    content: `## Dlaczego Polacy tracą tysiące złotych rocznie

Według naszej analizy 133 świadczeń rządowych dostępnych w 2026 roku, przeciętna rodzina nie korzysta z 4-7 świadczeń, do których ma prawo. To strata 2 400 - 5 000 PLN rocznie na samych ulgach i dofinansowaniach.

Powód jest prosty: świadczenia są rozproszone między 8 instytucji (ZUS, NFZ, PFRON, MOPS, US, KRUS, ARiMR, samorządy), wymagają znajomości terminów składania wniosków i nie są nigdzie zebrane w jednym miejscu. Aż do teraz - wezmezadarmo.com agreguje wszystkie 133 i pokazuje co konkretnie Tobie się należy.

Poniżej 10 najczęściej pomijanych świadczeń w 2026 roku.

## 1. Bon ciepłowniczy 2026 - do 3 500 PLN

NOWE w 2026: jednorazowe wsparcie dla gospodarstw korzystających z ciepła systemowego (podłączonych do miejskiej sieci ciepłowniczej). Kwota zależy od ceny ciepła w Twojej taryfie:

 • 1 000 PLN gdy cena ciepła to 170-200 PLN/GJ
 • 2 000 PLN gdy 200-230 PLN/GJ
 • 3 500 PLN gdy powyżej 230 PLN/GJ

Nabór: 1 lipca - 31 sierpnia 2026. Wnioski wyłącznie w tym oknie - po 31.08 nie ma już szans. Wniosek można złożyć przez mObywatel, ePUAP albo osobiście w urzędzie gminy.

Dlaczego ludzie tego nie znają: program jest zupełnie nowy (od 2026), ale informacja o nim została opublikowana bez kampanii marketingowej.

## 2. Refundacja okularów z NFZ - do 600 PLN

Każdy ubezpieczony w NFZ raz na 2 lata ma prawo do refundacji okularów korekcyjnych lub soczewek kontaktowych:

 • 50-700 PLN na oprawki + szkła okularów
 • Do 600 PLN na soczewki kontaktowe (przy znacznych wadach wzroku)

Wymagane skierowanie od okulisty z umowy z NFZ + faktura z optyka. Wnioskuje się w oddziale wojewódzkim NFZ.

Dlaczego pomijane: większość ludzi myśli że NFZ pokrywa tylko leczenie, nie wie że okulary też się załapują.

## 3. Ulga IKZE - do 9 388,80 PLN odliczenia rocznie

Indywidualne Konto Zabezpieczenia Emerytalnego pozwala odliczyć WPŁACONE składki od podstawy opodatkowania PIT. Limit 2026:

 • Osoba na umowie o pracę: do 9 388,80 PLN rocznie
 • JDG/samozatrudniony: do 14 083,20 PLN rocznie

Wpłaty można dokonać do 30 grudnia, odliczyć w rocznym PIT. Realna oszczędność na podatku: ~1 690 PLN (przy stawce 17%) do 3 005 PLN (przy 32%).

Dlaczego pomijane: wymaga założenia IKZE w banku/TFI - dodatkowy krok który zniechęca. Ale ROI jest natychmiastowy.

## 4. Dodatek mieszkaniowy - do 1 500 PLN miesięcznie

Dopłata do czynszu dla osób o niskich dochodach (do 40% przeciętnego wynagrodzenia dla gospodarstwa jednoosobowego, do 30% dla wieloosobowego). W praktyce: ~2 538 PLN dla singla, ~5 076 PLN dla 2-osobowego gospodarstwa.

Wymóg: dochód + odpowiednia powierzchnia mieszkania (35 m² na 1 osobę, 40 m² na 2 osoby, 45 m² na 3 itd.). Wniosek w MOPS lub urzędzie gminy. Świadczenie przyznawane na 6 miesięcy - można odnawiać.

Dlaczego pomijane: ludzie myślą "to dla osób w skrajnej biedzie". Faktycznie próg jest szerszy - emeryt z minimalną emeryturą 1 978 PLN może się załapać.

## 5. Ulga na internet - do 760 PLN rocznie

Odliczenie 760 PLN od dochodu (nie podatku) raz na życie - można korzystać przez 2 kolejne lata podatkowe. Wymóg: faktura z internetu na Twoje nazwisko.

Realna oszczędność: ~129 PLN przy stawce 17%, ~243 PLN przy 32%. Mało, ale za jeden formularz - czemu nie.

Dlaczego pomijane: limit "raz w życiu, 2 lata" jest mylący. Wielu ludzi nie wie czy już z tego skorzystali.

## 6. Świadczenie wspierające - do 4 134 PLN miesięcznie

OD STYCZNIA 2026: próg punktowy WZON obniżony z 87 do 70 punktów - znacznie więcej osób kwalifikuje się. Kwoty zależą od punktacji:

 • 70-74 pkt: 752 PLN/mies.
 • 75-79 pkt: 1 130 PLN
 • 80-84 pkt: 1 505 PLN
 • 85-89 pkt: 1 883 PLN
 • 90-94 pkt: 2 636 PLN
 • 95-100 pkt: 4 134 PLN

Świadczenie wypłacane BEZPOŚREDNIO osobie z niepełnosprawnością, nie opiekunowi. Nie zależy od dochodu, można łączyć z rentą.

Wniosek wyłącznie elektroniczny: najpierw PPW-1 do WZON o ustalenie potrzeby wsparcia, potem SWP do ZUS przez PUE ZUS / Empatia / bank.

Dlaczego pomijane: nowość, próg się zmienił - osoby którym wcześniej odmówiono powinny złożyć ponowny wniosek.

## 7. Renta wdowia (zbieg świadczeń)

OD LIPCA 2025: wdowiec/wdowa może pobierać 100% własnej emerytury + 15% renty rodzinnej po zmarłym małżonku (od stycznia 2027 wzrośnie do 25%).

Limit łączny: 5 935,47 PLN brutto miesięcznie. Średnio osoba zyskuje ~351 PLN dodatkowo na miesiąc.

Warunki:
 • Co najmniej 60 lat (kobieta) / 65 lat (mężczyzna)
 • Małżeństwo trwało do dnia śmierci współmałżonka
 • Renta rodzinna nabyta nie wcześniej niż 5 lat przed wiekiem emerytalnym
 • Brak ponownego małżeństwa

Wniosek ZUS-Rwd. Korzysta już ok. 1,6 mln osób.

Dlaczego pomijane: nowość od 2025, wiele osób nie wie że może wnioskować.

## 8. Mały ZUS Plus (dla JDG) - oszczędność ~15 000 PLN rocznie

Możliwość opłacania niższych składek społecznych ZUS proporcjonalnie do przychodu. Próg: przychód roczny do 120 000 PLN.

OD 2026 nowa zasada: 36 miesięcy obniżonych składek w każdym 60-miesięcznym okresie (czyli 3 lata wolniej, potem 2 lata pełnego ZUS, powrót do ulgi).

Roczna oszczędność dla mikroprzedsiębiorcy: ~12 000 - 18 000 PLN. Wniosek elektronicznie przez PUE ZUS do 31 stycznia każdego roku.

Dlaczego pomijane: wielu JDG płaci pełny ZUS bo nie wie o uldze albo myśli że nie kwalifikuje się (próg 120k to bardzo dużo dla mikrofirm).

## 9. Wakacje składkowe (1 miesiąc wolny od ZUS)

Mikroprzedsiębiorca (do 9 pracowników, przychód do 2 mln EUR) może raz w roku wybrać miesiąc, w którym państwo opłaca za niego składki społeczne ZUS. Oszczędność: ~1 600 PLN jednorazowo.

WAŻNE: wniosek RWS składa się w miesiącu POPRZEDZAJĄCYM (np. dla grudnia - w listopadzie). To najczęstszy błąd.

Wymóg: PUE ZUS, podpis przez profil zaufany. Składkę zdrowotną opłacasz normalnie.

Dlaczego pomijane: program stosunkowo nowy (od 2024) i wymaga zaplanowania z miesięcznym wyprzedzeniem.

## 10. Czyste Powietrze - do 135 000 PLN

Największy program termomodernizacji w Europie. 3 poziomy dofinansowania (zależne od dochodu):

 • Podstawowy: do 66 000 PLN (40% kosztów) - dochód roczny do 135 000 PLN
 • Podwyższony: do 99 000 PLN (70%) - dochód do 2 250 PLN/os. (wieloosob.) lub 3 150 PLN (jednoosob.)
 • Najwyższy: do 135 000 PLN (100%) - najbiedniejsze rodziny

Co obejmuje: wymiana źródła ciepła (pompa ciepła, biomasa, podłączenie sieci ciepłowniczej) + ocieplenie + okna + mikroinstalacja PV.

OD 2025: WYKLUCZONE kotły gazowe i olejowe. Tylko pompy ciepła z listy ZUM (lista zweryfikowanych urządzeń).

Wniosek przez czystepowietrze.gov.pl. Najpierw audyt energetyczny (też refundowany).

Dlaczego pomijane: ludzie myślą że to "dla biedaków", a faktycznie poziom podstawowy obejmuje dochód do 135 000 PLN - czyli klasę średnią.

## Jak sprawdzić co Ci się należy w 2 minuty

Zamiast czytać 133 opisów świadczeń i sprawdzać kryteria, wystarczy wypełnić nasz formularz (10 pytań, anonimowo):

[Sprawdź teraz na stronie głównej →](/)

System przelicza Twoje dane (wiek, dochód, dzieci, zatrudnienie, województwo) z bazą 133 świadczeń i pokazuje co PEWNIE Ci przysługuje + co MOŻLIWE (warto sprawdzić).

Bez logowania, bez PESEL, dane przetwarzane w pamięci serwera i kasowane po analizie. Możesz też założyć konto żeby Asystent AI śledził dla Ciebie zmiany w przepisach i wysyłał alert e-mail przy nowych świadczeniach.

## Źródła

Wszystkie kwoty i regulacje zweryfikowane na 23 maja 2026 z oficjalnych źródeł:

 • gov.pl, zus.pl, nfz.gov.pl, pfron.org.pl, krus.gov.pl, arimr.gov.pl
 • podatki.gov.pl (Ministerstwo Finansów)
 • czystepowietrze.gov.pl (NFOŚiGW)
 • biznes.gov.pl

Aktualizacja bazy: 2-3x miesięcznie. Następna planowana: 15 czerwca 2026.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug);
}
