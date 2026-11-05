/**
 * Rejestr publicznych podstron: jedno źródło dla metadanych (title, description,
 * keywords, canonical, Open Graph), JSON-LD, sitemap.xml, llms.txt i plików .md.
 * Nowa publiczna strona = wpis tutaj + metadaneStrony('/sciezka') w page/layout.
 * Panele, logowanie i API tu nie trafiają (są poza indeksem).
 */
import type { Metadata } from 'next';
import { narzedzie } from '@/lib/narzedzia/lista';
import { DOPISEK_MARKI, OG_IMAGES, SITE_NAME, adres, canonical } from '@/lib/seo';

export type GrupaStrony = 'obywatele' | 'centrum' | 'wnioski' | 'firmy' | 'informacje';

export interface Strona {
  sciezka: string;
  /** Krótka nazwa: okruszki, listy w llms.txt. */
  nazwa: string;
  /** Tytuł bez dopisku marki (z dopiskiem do ok. 60 znaków). */
  tytul: string;
  /** Meta description: 120-155 znaków, konkretny efekt. */
  opis: string;
  /** Frazy, które ludzie wpisują w wyszukiwarkę (8-15). */
  slowa: string[];
  grupa: GrupaStrony;
  /** Rodzic w okruszkach; domyślnie strona główna. */
  rodzic?: string;
  /** Typ schema.org strony. */
  typ?: 'WebPage' | 'CollectionPage' | 'AboutPage';
  /** Strona jest narzędziem w przeglądarce: WebApplication z tą kategorią. */
  aplikacja?: string;
  /** Ma wersję Markdown pod /sciezka.md (strona główna: /index.md). */
  md?: boolean;
  zmiana: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priorytet: number;
  /** Własny obraz OG strony (opengraph-image.tsx w jej folderze); domyślnie obraz serwisu. */
  obrazOg?: string;
  /** Skąd lastmod w sitemapie: data bazy świadczeń, czas generowania (dane na żywo) albo data stała. */
  lastmod?: 'swiadczenia' | 'teraz';
}

function zNarzedzia(slug: 'kpir' | 'jpk' | 'dofinansowania', slowa: string[], aplikacja: string): Strona {
  const n = narzedzie(slug);
  return {
    sciezka: n.adres, nazwa: n.nazwa, tytul: n.title, opis: n.description, slowa,
    grupa: 'firmy', rodzic: '/dla-firm/narzedzia', aplikacja, zmiana: 'monthly', priorytet: 0.7,
    obrazOg: `${n.adres}/opengraph-image`,
  };
}

export const STRONY: Strona[] = [
  // Dla obywateli
  {
    sciezka: '/', nazwa: 'Kalkulator świadczeń', grupa: 'obywatele', md: true, aplikacja: 'FinanceApplication',
    tytul: 'Kalkulator świadczeń 2026: co mi się należy?',
    opis: 'Odpowiedz na kilka pytań i zobacz, które ze 133 świadczeń, ulg i dotacji mogą Ci przysługiwać: 800+, 13. emerytura, zasiłki. Bez konta i za darmo.',
    slowa: ['kalkulator świadczeń 2026', 'jakie świadczenia mi się należą', 'co mi się należy od państwa', 'zasiłki 2026', 'ulgi podatkowe 2026', '800 plus', 'trzynasta emerytura', 'świadczenia socjalne', 'świadczenia dla rodzin', 'świadczenia dla seniorów', 'darmowe badania NFZ', 'pomoc od państwa'],
    zmiana: 'weekly', priorytet: 1.0, lastmod: 'swiadczenia',
  },
  {
    sciezka: '/swiadczenia', nazwa: 'Baza świadczeń', grupa: 'obywatele', md: true, typ: 'CollectionPage',
    tytul: 'Baza świadczeń 2026: zasiłki, ulgi i dopłaty',
    opis: 'Zasiłki ZUS, świadczenia rodzinne, ulgi podatkowe, NFZ i PFRON w jednej bazie. Przy każdym kwota, warunki, kroki wniosku i link do źródła. Za darmo.',
    slowa: ['baza świadczeń', 'lista świadczeń 2026', 'zasiłki ZUS', 'świadczenia rodzinne', 'ulgi podatkowe', 'świadczenia PFRON', 'świadczenia NFZ', 'becikowe', 'dodatek mieszkaniowy', 'świadczenie pielęgnacyjne', 'zasiłek dla bezrobotnych', 'kuroniówka'],
    zmiana: 'weekly', priorytet: 0.9, lastmod: 'swiadczenia',
  },
  {
    sciezka: '/agent', nazwa: 'Asystent AI', grupa: 'obywatele', md: true, aplikacja: 'ReferenceApplication',
    tytul: 'Asystent AI: świadczenia, ZUS i urzędy',
    opis: 'Zapytaj asystenta AI o świadczenia, ZUS i urzędy. Odpowiada z bazy świadczeń i danych NFZ, NBP, GIOŚ, podaje źródła. 3 pytania dziennie bez konta.',
    slowa: ['asystent AI świadczenia', 'czat ZUS', 'pytanie o zasiłek', 'jakie świadczenia mi przysługują', 'czy należy mi się 800 plus', 'ulgi dla JDG', 'chatbot urzędowy', 'pomoc w sprawach urzędowych', 'asystent AI po polsku'],
    zmiana: 'monthly', priorytet: 0.8,
  },
  {
    sciezka: '/nfz', nazwa: 'Kolejki NFZ', grupa: 'obywatele', md: true, aplikacja: 'HealthApplication',
    tytul: 'Kolejki NFZ: czas oczekiwania do specjalisty',
    opis: 'Sprawdź czas oczekiwania do specjalisty NFZ i znajdź szpital albo przychodnię z kontraktem w swoim województwie. Dane na żywo z api.nfz.gov.pl.',
    slowa: ['kolejki NFZ', 'czas oczekiwania do specjalisty', 'terminy leczenia NFZ', 'kolejka do kardiologa', 'wolne terminy NFZ', 'przychodnia NFZ', 'szpital NFZ', 'lekarz na NFZ', 'wyszukiwarka NFZ', 'poradnia specjalistyczna NFZ'],
    zmiana: 'weekly', priorytet: 0.9,
  },
  {
    sciezka: '/aktualnosci', nazwa: 'Aktualności', grupa: 'obywatele', md: true, typ: 'CollectionPage',
    tytul: 'Aktualności z ZUS, GUS, ARiMR i Sejmu',
    opis: 'Komunikaty ZUS, GUS, NBP, UOKiK, ARiMR, Sejmu i e-Zdrowia z 8 źródeł w jednym miejscu, odświeżane co 30 minut. Filtr dla JDG, firm i obywateli.',
    slowa: ['aktualności ZUS', 'komunikaty GUS', 'nabory ARiMR', 'zmiany w prawie 2026', 'aktualności dla JDG', 'wiadomości dla przedsiębiorców', 'komunikaty urzędów', 'nowe przepisy', 'RSS instytucji publicznych'],
    zmiana: 'daily', priorytet: 0.8, lastmod: 'teraz',
  },
  {
    sciezka: '/statystyki', nazwa: 'Polska w liczbach', grupa: 'obywatele', md: true,
    tytul: 'Polska w liczbach: dane GUS, NBP i NFZ',
    opis: 'Cena metra mieszkania od 2000 roku, wskaźniki GUS i lista 15 publicznych API. Dane z GUS, NBP i NFZ, część na żywo z oficjalnych źródeł.',
    slowa: ['Polska w liczbach', 'statystyki GUS', 'cena metra mieszkania', 'ceny mieszkań 2026', 'dane publiczne', 'wskaźniki SDG', 'API GUS', 'API NBP', 'API NFZ', 'otwarte dane Polska'],
    zmiana: 'weekly', priorytet: 0.8, lastmod: 'teraz',
  },

  // Wnioski
  {
    sciezka: '/wnioski', nazwa: 'Wnioski ZUS z pomocą AI', grupa: 'wnioski', md: true, typ: 'CollectionPage',
    tytul: 'Wnioski ZUS online z pomocą AI i PDF',
    opis: 'Wypełnij wniosek ZUS krok po kroku: Z-15a, Z-15b, ZAS-53, ERPO, PEL, ERSU. AI tłumaczy pola, a Ty pobierasz PDF do podpisu. Dane zostają u Ciebie.',
    slowa: ['wniosek ZUS online', 'jak wypełnić wniosek ZUS', 'formularze ZUS PDF', 'Z-15a', 'ZAS-53', 'wniosek o emeryturę ERPO', 'pełnomocnictwo ZUS PEL', 'Mama 4 plus wniosek', 'zasiłek opiekuńczy wniosek', 'wypełnianie wniosków z AI'],
    zmiana: 'monthly', priorytet: 0.9,
  },
  {
    sciezka: '/wnioski/zus-z15a', nazwa: 'Z-15A: zasiłek opiekuńczy na dziecko', grupa: 'wnioski', rodzic: '/wnioski', aplikacja: 'BusinessApplication',
    tytul: 'Zasiłek opiekuńczy na dziecko Z-15A online',
    opis: 'Wniosek Z-15A o zasiłek opiekuńczy: choroba dziecka, kwarantanna albo zamknięcie żłobka, przedszkola lub szkoły. Wypełnij krok po kroku i pobierz PDF.',
    slowa: ['Z-15A', 'Z-15A wzór', 'zasiłek opiekuńczy na dziecko', 'wniosek o zasiłek opiekuńczy', 'opieka nad chorym dzieckiem', 'zasiłek opiekuńczy 2026', 'Z-15A PDF', 'L4 na dziecko', 'zamknięcie przedszkola zasiłek'],
    zmiana: 'monthly', priorytet: 0.7,
  },
  {
    sciezka: '/wnioski/zus-z15b', nazwa: 'Z-15B: zasiłek opiekuńczy na członka rodziny', grupa: 'wnioski', rodzic: '/wnioski', aplikacja: 'BusinessApplication',
    tytul: 'Zasiłek opiekuńczy Z-15B na członka rodziny',
    opis: 'Wniosek Z-15B o zasiłek opiekuńczy na chorego członka rodziny powyżej 14 lat, np. małżonka albo rodzica. Wypełnij krok po kroku i pobierz gotowy PDF.',
    slowa: ['Z-15B', 'Z-15B wzór', 'zasiłek opiekuńczy na członka rodziny', 'opieka nad chorym rodzicem', 'opieka nad chorym małżonkiem', 'wniosek Z-15B PDF', 'zasiłek opiekuńczy 2026', 'L4 na opiekę'],
    zmiana: 'monthly', priorytet: 0.7,
  },
  {
    sciezka: '/wnioski/zus-zas53', nazwa: 'ZAS-53: zasiłek chorobowy', grupa: 'wnioski', rodzic: '/wnioski', aplikacja: 'BusinessApplication',
    tytul: 'Zasiłek chorobowy ZAS-53: wypełnij online',
    opis: 'Wniosek ZAS-53 o zasiłek chorobowy składany bezpośrednio do ZUS, gdy nie wypłaca go pracodawca albo prowadzisz firmę. Wypełnij i pobierz gotowy PDF.',
    slowa: ['ZAS-53', 'ZAS-53 wzór', 'zasiłek chorobowy wniosek', 'zasiłek chorobowy z ZUS', 'zasiłek chorobowy JDG', 'zasiłek chorobowy 80 procent', 'wniosek ZAS-53 PDF', 'chorobowe od ZUS'],
    zmiana: 'monthly', priorytet: 0.7,
  },
  {
    sciezka: '/wnioski/zus-erpo', nazwa: 'ERPO: wniosek o emeryturę', grupa: 'wnioski', rodzic: '/wnioski', aplikacja: 'BusinessApplication',
    tytul: 'Wniosek o emeryturę ERPO: pomoc w wypełnieniu',
    opis: 'Przygotuj dane do wniosku o emeryturę ERPO krok po kroku: lista dokumentów i podpowiedzi przy polach. Wniosek złożysz też online przez PUE ZUS.',
    slowa: ['ERPO', 'wniosek o emeryturę', 'ERPO wzór', 'jak złożyć wniosek o emeryturę', 'emerytura ZUS wniosek', 'wniosek ERPO PUE ZUS', 'dokumenty do emerytury', 'przejście na emeryturę'],
    zmiana: 'monthly', priorytet: 0.7,
  },
  {
    sciezka: '/wnioski/zus-ersu', nazwa: 'ERSU i ERU: Mama 4+ i Tata 4+', grupa: 'wnioski', rodzic: '/wnioski', aplikacja: 'BusinessApplication',
    tytul: 'Mama 4+ i Tata 4+: wniosek ERSU i ERU',
    opis: 'Rodzicielskie świadczenie uzupełniające Mama 4+ i Tata 4+ (1901 zł miesięcznie) dla rodziców co najmniej czworga dzieci. Przygotuj wniosek krok po kroku.',
    slowa: ['Mama 4 plus', 'Tata 4 plus', 'rodzicielskie świadczenie uzupełniające', 'ERSU', 'ERU', 'Mama 4+ wniosek', 'Mama 4+ kwota', 'emerytura za wychowanie dzieci'],
    zmiana: 'monthly', priorytet: 0.7,
  },
  {
    sciezka: '/wnioski/zus-pel', nazwa: 'PEL: pełnomocnictwo do ZUS', grupa: 'wnioski', rodzic: '/wnioski', aplikacja: 'BusinessApplication',
    tytul: 'Pełnomocnictwo ZUS PEL: wypełnij online',
    opis: 'Upoważnij wybraną osobę do spraw w ZUS: ubezpieczenia, PIT albo konto eZUS. Wypełnij formularz PEL krok po kroku i pobierz gotowy PDF do podpisu.',
    slowa: ['PEL ZUS', 'pełnomocnictwo ZUS', 'PEL wzór', 'upoważnienie do ZUS', 'pełnomocnictwo eZUS', 'pełnomocnik w ZUS', 'formularz PEL PDF', 'pełnomocnictwo PUE ZUS'],
    zmiana: 'monthly', priorytet: 0.6,
  },
  {
    sciezka: '/wnioski/zus-z3', nazwa: 'Z-3: zaświadczenie płatnika składek', grupa: 'wnioski', rodzic: '/wnioski',
    tytul: 'Zaświadczenie Z-3 od pracodawcy: przewodnik',
    opis: 'Czym jest zaświadczenie płatnika składek Z-3, jak sprawdzić, co wpisał pracodawca, i jak przygotować pismo do działu kadr. Przewodnik dla pracownika.',
    slowa: ['Z-3', 'zaświadczenie Z-3', 'Z-3 ZUS', 'zaświadczenie płatnika składek', 'Z-3 od pracodawcy', 'Z-3 do zasiłku chorobowego', 'jak uzyskać Z-3', 'pismo do kadr'],
    zmiana: 'monthly', priorytet: 0.6,
  },
  {
    sciezka: '/wnioski/nlnet', nazwa: 'Wniosek NLnet NGI Zero Commons Fund', grupa: 'wnioski', rodzic: '/wnioski', aplikacja: 'BusinessApplication',
    tytul: 'Wniosek NLnet NGI Zero Commons Fund z AI',
    opis: 'Przygotuj wniosek o grant NLnet NGI Zero Commons Fund do 50 000 EUR dla projektów open source. Wypełnij pola, a AI pomoże zredagować sekcje.',
    slowa: ['NLnet', 'NGI Zero Commons Fund', 'grant open source', 'grant NLnet wniosek', 'dofinansowanie open source', 'grant dla programistów', 'Horizon Europe grant', 'civic tech grant'],
    zmiana: 'monthly', priorytet: 0.6,
  },

  // Centrum Obywatela
  {
    sciezka: '/centrum-obywatela', nazwa: 'Centrum Obywatela', grupa: 'centrum', md: true, typ: 'CollectionPage',
    tytul: 'Centrum Obywatela: NFZ, NBP, GIOŚ i inne',
    opis: 'Darmowe narzędzia z oficjalnych API: kolejki NFZ, kursy NBP, powietrze GIOŚ, Biała Lista VAT, ostrzeżenia IMGW, zmiany w prawie i dane GUS. Bez logowania.',
    slowa: ['narzędzia urzędowe', 'dane publiczne', 'kolejki NFZ', 'kursy walut NBP', 'jakość powietrza', 'Biała Lista VAT', 'ostrzeżenia IMGW', 'zmiany w prawie', 'dane GUS gmina', 'ulgi PKP'],
    zmiana: 'weekly', priorytet: 0.9,
  },
  {
    sciezka: '/centrum-obywatela/kursy', nazwa: 'Kursy walut NBP', grupa: 'centrum', rodzic: '/centrum-obywatela', aplikacja: 'FinanceApplication',
    tytul: 'Kursy walut NBP dziś: EUR, USD, CHF, GBP',
    opis: 'Aktualne kursy walut Narodowego Banku Polskiego (tabela A) i konwerter na złote. Aktualizacja w każdy dzień roboczy, dane z api.nbp.pl.',
    slowa: ['kursy walut NBP', 'kurs euro NBP', 'kurs dolara NBP', 'kurs franka', 'tabela A NBP', 'przelicznik walut', 'kurs funta', 'średni kurs NBP do faktury'],
    zmiana: 'weekly', priorytet: 0.7,
  },
  {
    sciezka: '/centrum-obywatela/powietrze', nazwa: 'Jakość powietrza GIOŚ', grupa: 'centrum', rodzic: '/centrum-obywatela', aplikacja: 'HealthApplication',
    tytul: 'Jakość powietrza GIOŚ: smog w Twoim mieście',
    opis: 'Aktualny indeks jakości powietrza dla 18 miast wojewódzkich: PM10, PM2.5, NO2, O3, SO2. Dane z api.gios.gov.pl na żywo. Bez logowania.',
    slowa: ['jakość powietrza', 'smog dziś', 'indeks jakości powietrza', 'PM10', 'PM2.5', 'GIOŚ powietrze', 'smog Kraków', 'smog Warszawa', 'czy można wyjść na spacer'],
    zmiana: 'weekly', priorytet: 0.7,
  },
  {
    sciezka: '/centrum-obywatela/biala-lista', nazwa: 'Biała Lista VAT', grupa: 'centrum', rodzic: '/centrum-obywatela', aplikacja: 'BusinessApplication',
    tytul: 'Biała Lista VAT: sprawdź NIP kontrahenta',
    opis: 'Sprawdź firmę w Białej Liście VAT Ministerstwa Finansów: status VAT, rachunki bankowe, daty rejestracji. Przed płatnością B2B powyżej 15 000 zł.',
    slowa: ['Biała Lista VAT', 'sprawdź NIP', 'wykaz podatników VAT', 'sprawdzenie kontrahenta', 'rachunek na białej liście', 'status VAT firmy', 'weryfikacja NIP', 'czynny podatnik VAT'],
    zmiana: 'weekly', priorytet: 0.8,
  },
  {
    sciezka: '/centrum-obywatela/pogoda', nazwa: 'Ostrzeżenia IMGW', grupa: 'centrum', rodzic: '/centrum-obywatela',
    tytul: 'Ostrzeżenia IMGW: burze, powodzie, mróz',
    opis: 'Aktualne ostrzeżenia meteorologiczne i hydrologiczne IMGW dla całej Polski: burze, powodzie, mróz. Dane na żywo z danepubliczne.imgw.pl, bez logowania.',
    slowa: ['ostrzeżenia IMGW', 'ostrzeżenia pogodowe', 'ostrzeżenia hydrologiczne', 'burze dziś', 'ostrzeżenie przed mrozem', 'alert powodziowy', 'IMGW ostrzeżenia meteorologiczne', 'pogoda ostrzeżenia Polska'],
    zmiana: 'daily', priorytet: 0.7, lastmod: 'teraz',
  },
  {
    sciezka: '/centrum-obywatela/prawo', nazwa: 'Zmiany w prawie', grupa: 'centrum', rodzic: '/centrum-obywatela',
    tytul: 'Zmiany w prawie: Dziennik Ustaw i Sejm',
    opis: 'Aktualne zmiany w polskim prawie: Dziennik Ustaw, Monitor Polski, projekty ustaw z Sejmu. Filtrowanie po słowach kluczowych. Dane z api.sejm.gov.pl.',
    slowa: ['zmiany w prawie', 'Dziennik Ustaw', 'Monitor Polski', 'projekty ustaw', 'nowe przepisy 2026', 'ELI Sejm', 'nowe rozporządzenia', 'zmiany w przepisach o świadczeniach'],
    zmiana: 'daily', priorytet: 0.8, lastmod: 'teraz',
  },
  {
    sciezka: '/centrum-obywatela/gus', nazwa: 'Dane gminy z GUS', grupa: 'centrum', rodzic: '/centrum-obywatela',
    tytul: 'Dane GUS gminy: ludność, bezrobocie, płace',
    opis: 'Liczba mieszkańców, stopa bezrobocia i średnie wynagrodzenie dla każdej polskiej gminy. Dane z Banku Danych Lokalnych GUS, wyszukiwarka po nazwie.',
    slowa: ['dane GUS gmina', 'Bank Danych Lokalnych', 'liczba mieszkańców gminy', 'stopa bezrobocia w gminie', 'średnie wynagrodzenie powiat', 'BDL GUS', 'statystyki gminy', 'demografia gminy'],
    zmiana: 'monthly', priorytet: 0.7,
  },
  {
    sciezka: '/centrum-obywatela/dzialki', nazwa: 'Geoportal ARiMR', grupa: 'centrum', rodzic: '/centrum-obywatela',
    tytul: 'Geoportal ARiMR: jak sprawdzić działkę rolną',
    opis: 'Linki i instrukcja: jak sprawdzić działkę rolną w Geoportalu ARiMR, ewidencję gruntów, dopłaty bezpośrednie i kontrolę satelitarną działek.',
    slowa: ['Geoportal ARiMR', 'mapa działek rolnych', 'jak sprawdzić działkę', 'dopłaty bezpośrednie', 'ewidencja gruntów', 'kontrola satelitarna ARiMR', 'działka rolna mapa', 'granice działki'],
    zmiana: 'monthly', priorytet: 0.6,
  },
  {
    sciezka: '/centrum-obywatela/transport', nazwa: 'Ulgi PKP', grupa: 'centrum', rodzic: '/centrum-obywatela',
    tytul: 'Ulgi PKP 2026: student, senior, KDR',
    opis: 'Pełna tabela ulg PKP Intercity i Polregio: student (51%), senior 65+ (37%), Karta Dużej Rodziny (37%), niepełnosprawni, weterani. Aktualne stawki 2026.',
    slowa: ['ulgi PKP', 'ulga studencka PKP', 'ulga dla seniora PKP', 'Karta Dużej Rodziny PKP', 'ulgi Intercity 2026', 'ulga dla niepełnosprawnych PKP', 'zniżki na pociąg', 'ulgi Polregio'],
    zmiana: 'monthly', priorytet: 0.6,
  },
  {
    sciezka: '/centrum-obywatela/polska-cyfrowa', nazwa: 'Polska cyfrowa', grupa: 'centrum', rodzic: '/centrum-obywatela',
    tytul: 'Polska cyfrowa: e-zdrowie, e-usługi i dane',
    opis: 'Polska cyfrowa w liczbach: 2,3 mld e-recept, 20 mln kont IKP, ElevenLabs i e-rejestracja. Wykresy dostępności mieszkań i wzrostu e-usług ze źródłami.',
    slowa: ['Polska cyfrowa', 'e-zdrowie', 'e-recepta statystyki', 'Internetowe Konto Pacjenta', 'e-rejestracja', 'cyfryzacja administracji', 'ElevenLabs', 'dostępność mieszkań', 'e-usługi publiczne'],
    zmiana: 'monthly', priorytet: 0.7,
  },

  // Dla firm
  {
    sciezka: '/dla-firm', nazwa: 'Dla firm i JDG', grupa: 'firmy', md: true,
    tytul: 'Dla firm za darmo: KPiR, JPK_V7, dotacje, API',
    opis: 'Darmowe narzędzia dla firm i JDG: przegląd KPiR, plik JPK_V7 przed 2027, dofinansowania po NIP i otwarte API bazy świadczeń dla NGO i instytucji.',
    slowa: ['narzędzia dla firm za darmo', 'narzędzia dla JDG', 'API świadczeń', 'otwarte dane świadczenia', 'dotacje dla firm', 'KPiR sprawdzenie', 'JPK_V7 sprawdzenie', 'API dla NGO', 'darmowe API rządowe'],
    zmiana: 'monthly', priorytet: 0.8,
  },
  {
    sciezka: '/dla-firm/narzedzia', nazwa: 'Narzędzia dla firm', grupa: 'firmy', md: true, rodzic: '/dla-firm', typ: 'CollectionPage',
    tytul: 'Darmowe narzędzia dla firm: KPiR i JPK_V7',
    opis: 'Sprawdź za darmo księgę KPiR, plik JPK_V7 przed 2027 i dofinansowania dla firmy po NIP. Bez zakładania konta: wystarczy e-mail i telefon.',
    slowa: ['narzędzia dla firm', 'przegląd KPiR', 'sprawdzenie JPK_V7', 'dofinansowania po NIP', 'JPK 2027', 'KSeF 2027', 'kontrola księgi przychodów i rozchodów', 'narzędzia dla księgowej'],
    zmiana: 'monthly', priorytet: 0.8,
  },
  zNarzedzia('kpir', ['przegląd KPiR', 'sprawdzenie KPiR', 'księga przychodów i rozchodów', 'KPiR Optima', 'JPK_PKPIR', 'zaliczki PIT', 'składka zdrowotna JDG', 'forma opodatkowania 2027', 'ryczałt czy liniowy'], 'FinanceApplication'),
  zNarzedzia('jpk', ['JPK_V7', 'sprawdzenie JPK_V7', 'JPK_V7M', 'JPK_V7K', 'JPK przed 2027', 'KSeF FA(3)', 'błędy w JPK', 'zmiany w JPK 2028', 'kontrola pliku JPK'], 'FinanceApplication'),
  zNarzedzia('dofinansowania', ['dofinansowania dla firm', 'dotacje po NIP', 'dofinansowanie dla JDG', 'CEIDG NIP', 'dotacje 2026 dla firm', 'programy wsparcia dla firm', 'dotacje PKD', 'dofinansowanie dla przedsiębiorcy'], 'BusinessApplication'),
  {
    sciezka: '/dotacje', nazwa: 'Dotacje dla firm', grupa: 'firmy', md: true, aplikacja: 'BusinessApplication',
    tytul: 'Dotacje dla firm 2026: KFS, PUP, PFRON, KPO',
    opis: 'Agent AI śledzi nabory KFS, PUP, PFRON, KPO, PARP i programy samorządowe, dopasowuje je do firmy po NIP i daje znać mailem. Bezpłatnie.',
    slowa: ['dotacje dla firm 2026', 'dofinansowanie dla firm', 'Krajowy Fundusz Szkoleniowy', 'dotacje PUP', 'dofinansowanie PFRON dla pracodawcy', 'KPO dla firm', 'dotacje PARP', 'nabory dotacji', 'monitoring dotacji', 'dotacje samorządowe'],
    zmiana: 'weekly', priorytet: 0.8,
  },
  {
    sciezka: '/automatyzacje', nazwa: 'Automatyzacje w firmie', grupa: 'firmy', md: true,
    tytul: 'Automatyzacje w małej firmie: 5 przykładów',
    opis: 'Faktury spoza KSeF, oferty, raporty, maile i terminy ZUS. Pięć przykładów automatyzacji w małej firmie, każda sprawdzana przez człowieka.',
    slowa: ['automatyzacja w firmie', 'automatyzacja faktur', 'faktury spoza KSeF', 'automatyzacja ofert', 'automatyczne raporty', 'terminy ZUS przypomnienia', 'AI w małej firmie', 'automatyzacja biura'],
    zmiana: 'monthly', priorytet: 0.7,
  },
  {
    sciezka: '/za-darmo-dla-biznesu', nazwa: 'DogInvoice i DogAnswer', grupa: 'firmy', md: true,
    tytul: 'DogInvoice i DogAnswer: narzędzia dla firm',
    opis: 'DogInvoice dopasowuje przelewy do faktur z KSeF i płaci kilka faktur jednym plikiem do banku. DogAnswer odbiera telefony, kiedy Ty nie możesz.',
    slowa: ['DogInvoice', 'DogAnswer', 'dopasowanie przelewów do faktur', 'KSeF faktury', 'płatności masowe', 'biała lista VAT przelew', 'asystent głosowy AI', 'automatyczna sekretarka', 'Dogtronic Labs'],
    zmiana: 'monthly', priorytet: 0.7,
  },

  // Informacje
  {
    sciezka: '/blog', nazwa: 'Blog', grupa: 'informacje', md: true, typ: 'CollectionPage',
    tytul: 'Blog: poradniki o świadczeniach i ulgach',
    opis: 'Praktyczne poradniki o świadczeniach, ulgach podatkowych i programach wsparcia w Polsce w 2026: co Ci się należy, w jakiej kwocie i jak złożyć wniosek.',
    slowa: ['blog o świadczeniach', 'poradnik świadczenia', 'ulgi podatkowe poradnik', 'świadczenia 2026', 'jak złożyć wniosek', 'pomijane świadczenia', 'programy wsparcia', 'zmiany w świadczeniach'],
    zmiana: 'weekly', priorytet: 0.7,
  },
  {
    sciezka: '/o-projekcie', nazwa: 'O projekcie', grupa: 'informacje', md: true, typ: 'AboutPage',
    tytul: 'O projekcie: skąd dane i kto stoi za stroną',
    opis: 'Darmowy, prywatny i niekomercyjny projekt tuKamil z Lublina: kalkulator i baza świadczeń, wnioski ZUS, dotacje. Skąd są dane i jak dbamy o prywatność.',
    slowa: ['wezmezadarmo', 'o projekcie', 'źródła danych świadczeń', 'otwarte dane CC-BY', 'kod AGPL', 'prywatność', 'projekt obywatelski', 'tuKamil'],
    zmiana: 'monthly', priorytet: 0.6,
  },
  {
    sciezka: '/press', nazwa: 'Press kit', grupa: 'informacje',
    tytul: 'Press kit: materiały dla mediów',
    opis: 'Materiały prasowe wezmezadarmo.com dla dziennikarzy i twórców: krótki i pełny opis projektu, liczby, logo, źródła danych i kontakt dla mediów.',
    slowa: ['wezmezadarmo press kit', 'materiały prasowe', 'kalkulator świadczeń media', 'logo wezmezadarmo', 'informacja prasowa', 'projekt obywatelski', 'civic tech Polska', 'kontakt dla mediów'],
    zmiana: 'monthly', priorytet: 0.5,
  },
  {
    sciezka: '/regulamin', nazwa: 'Regulamin', grupa: 'informacje',
    tytul: 'Regulamin serwisu',
    opis: 'Regulamin świadczenia usług drogą elektroniczną w wezmezadarmo.com: kalkulator i baza świadczeń, kreator wniosków ZUS, automatyzacje, konto i asystent AI.',
    slowa: ['regulamin wezmezadarmo', 'regulamin serwisu', 'warunki korzystania', 'usługi drogą elektroniczną', 'kreator wniosków ZUS', 'asystent AI', 'konto użytkownika', 'zasady korzystania'],
    zmiana: 'yearly', priorytet: 0.4,
  },
  {
    sciezka: '/polityka-prywatnosci', nazwa: 'Polityka prywatności', grupa: 'informacje',
    tytul: 'Polityka prywatności',
    opis: 'Polityka prywatności wezmezadarmo.com: kto jest administratorem, jakie dane zbieramy i po co, jak długo je trzymamy i jakie masz prawa według RODO.',
    slowa: ['polityka prywatności', 'RODO', 'dane osobowe', 'prywatność kalkulatora', 'PESEL bezpieczeństwo', 'administrator danych', 'pliki cookie', 'AI Act'],
    zmiana: 'yearly', priorytet: 0.4,
  },
  {
    sciezka: '/dotacje/regulamin', nazwa: 'Regulamin dotacji', grupa: 'informacje', rodzic: '/dotacje',
    tytul: 'Regulamin usługi dotacji dla firm',
    opis: 'Regulamin usługi dotacji dla firm w wezmezadarmo.com: zakres usługi, konto, bezpłatny dostęp z limitami uczciwego użycia, dane osobowe i reklamacje.',
    slowa: ['regulamin dotacje', 'monitoring dotacji regulamin', 'agent AI dotacje', 'bezpłatny dostęp', 'konto firmowe', 'reklamacje', 'ochrona danych', 'warunki usługi'],
    zmiana: 'yearly', priorytet: 0.3,
  },
  {
    sciezka: '/dotacje/polityka-ai', nazwa: 'Polityka przejrzystości AI', grupa: 'informacje', rodzic: '/dotacje',
    tytul: 'Polityka przejrzystości AI w dotacjach',
    opis: 'Informacja o charakterze systemu AI zgodnie z art. 52 Rozporządzenia UE o AI (AI Act). Zakres wiedzy agenta, ograniczenia i prawa użytkownika.',
    slowa: ['AI Act', 'przejrzystość AI', 'art. 52 AI Act', 'agent AI dotacje', 'ograniczenia AI', 'prawa użytkownika AI', 'rozporządzenie o AI', 'system AI informacja'],
    zmiana: 'yearly', priorytet: 0.3,
  },
];

const PO_SCIEZCE = new Map(STRONY.map((s) => [s.sciezka, s]));

export function strona(sciezka: string): Strona {
  const s = PO_SCIEZCE.get(sciezka);
  if (!s) throw new Error(`Brak strony ${sciezka} w src/lib/strony.ts`);
  return s;
}

/** Pełny tytul z dopiskiem marki. */
export function pelnyTytul(s: Pick<Strona, 'tytul'>): string {
  return `${s.tytul}${DOPISEK_MARKI}`;
}

/** Łańcuch okruszków od strony głównej do strony (włącznie). */
export function okruszki(sciezka: string): Strona[] {
  const lancuch: Strona[] = [];
  let s: Strona | undefined = strona(sciezka);
  while (s) {
    lancuch.unshift(s);
    if (s.sciezka === '/') break;
    s = PO_SCIEZCE.get(s.rodzic ?? '/');
  }
  return lancuch;
}

/** Dzieci strony w rejestrze (np. formularze pod /wnioski). */
export function podstrony(sciezka: string): Strona[] {
  return STRONY.filter((s) => s.sciezka !== sciezka && (s.rodzic ?? '/') === sciezka);
}

/**
 * Metadane strony z rejestru: title, description, keywords, canonical (+ link do .md),
 * Open Graph z adresem kanonicznym i Twitter. Bez robots: zostaje decyzja z root layout.
 */
export function metadaneStrony(sciezka: string, dodatkowe: Partial<Metadata> = {}): Metadata {
  const s = strona(sciezka);
  const tytul = pelnyTytul(s);
  return {
    title: { absolute: tytul },
    description: s.opis,
    keywords: s.slowa,
    alternates: canonical(s.sciezka, s.md),
    openGraph: {
      title: s.tytul,
      description: s.opis,
      url: adres(s.sciezka),
      siteName: SITE_NAME,
      locale: 'pl_PL',
      type: 'website',
      images: s.obrazOg ? [{ url: s.obrazOg, width: 1200, height: 630, alt: s.nazwa }] : OG_IMAGES,
    },
    twitter: { card: 'summary_large_image', title: s.tytul, description: s.opis },
    ...dodatkowe,
  };
}
