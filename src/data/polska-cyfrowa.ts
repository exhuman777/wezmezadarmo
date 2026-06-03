/**
 * Dane do zakladki /centrum-obywatela/polska-cyfrowa
 *
 * Wszystkie wartosci pochodza ze zrodel oficjalnych (CeZ, NFZ, GUS, ZUS, MC, KE)
 * lub renomowanej prasy. Kazdy news i wskaznik ma link do zrodla + date.
 * Wzorzec: dane hardcoded + cytowane, jak CENA_M2 w /statystyki.
 *
 * Stan na: 2026-06-03
 */

export interface NewsItem {
  title: string;
  date: string; // YYYY-MM lub YYYY
  summary: string;
  sourceName: string;
  sourceUrl: string;
}

export interface StatTile {
  value: string;
  label: string;
  sourceName: string;
  sourceUrl: string;
  year: string;
}

export interface FreeApi {
  name: string;
  data: string;
  url: string;
  key: boolean; // czy wymaga rejestracji/klucza
}

// ----- Newsy: ElevenLabs (polski jednorozec AI) -----

export const NEWS_ELEVENLABS: NewsItem[] = [
  {
    title: 'ElevenLabs zalozony przez dwoch Polakow',
    date: '2022',
    summary: 'Firme zalozyli w 2022 r. Mati Staniszewski (były Palantir) i Piotr Dąbkowski (były inżynier Google). Inspiracją były polskie filmy z lektorem - chcieli przełamać bariery językowe dzięki AI.',
    sourceName: 'Wikipedia / Endeavor',
    sourceUrl: 'https://en.wikipedia.org/wiki/ElevenLabs',
  },
  {
    title: 'Runda Series D - wycena 11 mld USD',
    date: '2026-02',
    summary: '4 lutego 2026 r. ElevenLabs pozyskał 500 mln USD w rundzie Series D prowadzonej przez Sequoia Capital, osiągając wycenę 11 mld USD - ponad trzykrotnie więcej niż rok wcześniej. Firma celuje w IPO.',
    sourceName: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/2026/02/04/elevenlabs-raises-500m-from-sequioia-at-a-11-billion-valuation/',
  },
  {
    title: 'Centrum R&D w Warszawie - główna siedziba w UE',
    date: '2024-11',
    summary: 'ElevenLabs ogłosił inwestycję ok. 44 mln zł w rozwój AI w Polsce w ciągu 5 lat oraz centrum badawczo-rozwojowe w Warszawie, które ma być główną siedzibą firmy w Unii Europejskiej.',
    sourceName: 'MamStartup',
    sourceUrl: 'https://mamstartup.pl/powrot-do-korzeni-elevenlabs-inwestuje-44-mln-pln-na-rozwoj-ai-w-polsce-i-buduje-centrum-rd-w-warszawie/',
  },
  {
    title: 'Ponad 330 mln USD przychodu rocznego (ARR)',
    date: '2025',
    summary: 'ElevenLabs zamknął 2025 rok z ponad 330 mln USD powtarzalnego przychodu rocznego, napędzanego adopcją przez firmy takie jak Deutsche Telekom czy Square.',
    sourceName: 'ElevenLabs (blog Series D)',
    sourceUrl: 'https://elevenlabs.io/blog/series-d',
  },
  {
    title: 'Polski syntezator mowy i Summit w Warszawie',
    date: '2025',
    summary: 'ElevenLabs oferuje darmowy syntezator mowy i transkrypcję w języku polskim, a podczas Summitu w Warszawie zaprezentował modele Dubbing V2 oraz zaawansowany model TTS.',
    sourceName: 'Rzeczpospolita',
    sourceUrl: 'https://www.rp.pl/biznes/art44529181-tworcy-elevenlabs-wracaja-do-korzeni-oglosili-ai-ktora-ma-odmienic-turystyke',
  },
  {
    title: 'Do 100 specjalistów AI w Warszawie',
    date: '2024-11',
    summary: 'W warszawskim centrum R&D ElevenLabs planuje zatrudnić ok. 30 specjalistów w pierwszym roku, z perspektywą wzrostu do 100 osób w kolejnych latach.',
    sourceName: 'MamStartup',
    sourceUrl: 'https://mamstartup.pl/powrot-do-korzeni-elevenlabs-inwestuje-44-mln-pln-na-rozwoj-ai-w-polsce-i-buduje-centrum-rd-w-warszawie/',
  },
];

// ----- Newsy: NFZ / e-zdrowie -----

export const NEWS_NFZ: NewsItem[] = [
  {
    title: 'Ponad 2,3 miliarda wystawionych e-recept',
    date: '2026-01',
    summary: 'Według podsumowania Centrum e-Zdrowia za 2025 rok liczba wystawionych e-recept przekroczyła 2,3 miliarda. E-recepta jest obowiązkowa w Polsce od 8 stycznia 2020 r.',
    sourceName: 'Centrum e-Zdrowia',
    sourceUrl: 'https://www.cez.gov.pl/pl/page/o-nas/aktualnosci/e-zdrowie-w-liczbach-i-faktach-podsumowanie-2025-roku',
  },
  {
    title: 'Ponad 20 milionów kont IKP',
    date: '2025-12',
    summary: 'Internetowe Konto Pacjenta przekroczyło 20 milionów aktywowanych kont, co odpowiada ponad połowie populacji Polski. To jeden z najszerzej używanych systemów e-zdrowia w Europie.',
    sourceName: 'Centrum e-Zdrowia',
    sourceUrl: 'https://www.cez.gov.pl/pl/page/o-nas/aktualnosci/juz-ponad-20-mln-osob-korzysta-z-ikp',
  },
  {
    title: '237 milionów e-skierowań',
    date: '2026-01',
    summary: 'W ciągu 4 lat działania systemu wystawiono łącznie 237 milionów e-skierowań; ok. 94 proc. z nich jest refundowanych przez NFZ. E-skierowanie jest obowiązkowe od 8 stycznia 2021 r.',
    sourceName: 'Centrum e-Zdrowia',
    sourceUrl: 'https://www.cez.gov.pl/pl/page/o-nas/aktualnosci/e-zdrowie-w-liczbach-i-faktach-podsumowanie-2025-roku',
  },
  {
    title: 'Centralna e-Rejestracja obowiązkowa od 2026 r.',
    date: '2026-01',
    summary: 'Od 1 stycznia 2026 r. centralna e-rejestracja stała się obowiązkowa dla kardiologii, mammografii i testu HPV. Pacjent umawia wizytę online przez IKP - z systemu skorzystało już ok. 1,6 mln osób.',
    sourceName: 'NFZ',
    sourceUrl: 'https://www.nfz.gov.pl/aktualnosci/aktualnosci-centrali/centralna-e-rejestracja-narodowy-fundusz-zdrowia-rozpoczal-nabor-do-pilotazu,8665.html',
  },
  {
    title: 'Asystent AI (VoiceBot) dla e-rejestracji',
    date: '2025-08',
    summary: 'Centrum e-Zdrowia prowadzi przetarg na System Asystenta SI (VoiceBot) finansowany z KPO. Asystent ma odbierać połączenia po polsku, angielsku i ukraińsku, umawiać wizyty i proponować badania profilaktyczne.',
    sourceName: 'Prawo.pl / CeZ',
    sourceUrl: 'https://www.prawo.pl/zdrowie/asystent-ai-w-centralnej-e-rejestracji-przetarg,534352.html',
  },
  {
    title: 'mojeIKP - ponad 4 mln pobrań',
    date: '2026-01',
    summary: 'Mobilna aplikacja mojeIKP przekroczyła 4 miliony pobrań do końca 2025 roku, a miesięcznie korzysta z niej ponad 500 tys. osób (e-recepty, e-skierowania, historia leczenia w telefonie).',
    sourceName: 'Centrum e-Zdrowia',
    sourceUrl: 'https://www.cez.gov.pl/pl/page/o-nas/aktualnosci/e-zdrowie-w-liczbach-i-faktach-podsumowanie-2025-roku',
  },
];

// ----- Kafelki: Polska w liczbach -----

export const STAT_TILES: StatTile[] = [
  {
    value: '95,9%',
    label: 'gospodarstw domowych z dostępem do internetu',
    year: '2024',
    sourceName: 'GUS',
    sourceUrl: 'https://stat.gov.pl/obszary-tematyczne/nauka-i-technika-spoleczenstwo-informacyjne/spoleczenstwo-informacyjne/spoleczenstwo-informacyjne-w-polsce-w-2024-roku,2,14.html',
  },
  {
    value: '61,1%',
    label: 'Polaków 16-74 korzysta z e-administracji',
    year: '2025',
    sourceName: 'GUS',
    sourceUrl: 'https://stat.gov.pl/obszary-tematyczne/nauka-i-technika-spoleczenstwo-informacyjne/spoleczenstwo-informacyjne/',
  },
  {
    value: '12 mln',
    label: 'użytkowników aplikacji mObywatel',
    year: '2025',
    sourceName: 'Ministerstwo Cyfryzacji',
    sourceUrl: 'https://www.gov.pl/web/cyfryzacja',
  },
  {
    value: '14,5 mln',
    label: 'aktywnych Profili Zaufanych',
    year: '2022',
    sourceName: 'Ministerstwo Cyfryzacji',
    sourceUrl: 'https://www.gov.pl/web/cyfryzacja/14-milionow-profili-zaufanych2',
  },
  {
    value: '2,3 mld',
    label: 'e-recept wystawionych od 2020 r.',
    year: '2025',
    sourceName: 'Centrum e-Zdrowia',
    sourceUrl: 'https://www.cez.gov.pl/pl/page/o-nas/aktualnosci/e-zdrowie-w-liczbach-i-faktach-podsumowanie-2025-roku',
  },
  {
    value: '1 mld+',
    label: 'zdarzeń medycznych w systemie e-zdrowie',
    year: '2025',
    sourceName: 'Centrum e-Zdrowia',
    sourceUrl: 'https://www.cez.gov.pl/pl/page/o-nas/aktualnosci/e-zdrowie-w-liczbach-i-faktach-podsumowanie-2025-roku',
  },
];

// ----- Serie do wykresow -----

// Przecietne miesieczne wynagrodzenie brutto w gospodarce narodowej (PLN), GUS
export const WYNAGRODZENIE: Array<{ rok: number; pln: number }> = [
  { rok: 2015, pln: 3899.78 },
  { rok: 2016, pln: 4047.21 },
  { rok: 2017, pln: 4271.51 },
  { rok: 2018, pln: 4585.03 },
  { rok: 2019, pln: 4918.17 },
  { rok: 2020, pln: 5167.47 },
  { rok: 2021, pln: 5662.53 },
  { rok: 2022, pln: 6346.15 },
  { rok: 2023, pln: 7155.48 },
  { rok: 2024, pln: 8181.72 },
  { rok: 2025, pln: 8903.56 },
];
export const WYNAGRODZENIE_SOURCE = 'https://stat.gov.pl/obszary-tematyczne/rynek-pracy/pracujacy-zatrudnieni-wynagrodzenia-koszty-pracy/przecietne-miesieczne-wynagrodzenie-w-gospodarce-narodowej-w-latach-1950-2025,2,1.html';

// Cena 1 m2 nowego mieszkania - srednia roczna z kwartalow GUS (PLN/m2)
export const CENA_M2_ROCZNA: Array<{ rok: number; pln: number }> = [
  { rok: 2015, pln: 3970 },
  { rok: 2016, pln: 4054 },
  { rok: 2017, pln: 4170 },
  { rok: 2018, pln: 4238 },
  { rok: 2019, pln: 4461 },
  { rok: 2020, pln: 4892 },
  { rok: 2021, pln: 5134 },
  { rok: 2022, pln: 5319 },
  { rok: 2023, pln: 6131 },
  { rok: 2024, pln: 6996 },
  { rok: 2025, pln: 7469 },
];
export const CENA_M2_SOURCE = 'https://stat.gov.pl/obszary-tematyczne/przemysl-budownictwo-srodki-trwale/budownictwo/';

// Inflacja CPI roczna (%, srednioroczna), GUS. 2025 niezweryfikowany - pominiety.
export const CPI: Array<{ rok: number; proc: number }> = [
  { rok: 2015, proc: -0.9 },
  { rok: 2016, proc: -0.6 },
  { rok: 2017, proc: 2.0 },
  { rok: 2018, proc: 1.6 },
  { rok: 2019, proc: 2.3 },
  { rok: 2020, proc: 3.4 },
  { rok: 2021, proc: 5.1 },
  { rok: 2022, proc: 14.4 },
  { rok: 2023, proc: 11.4 },
  { rok: 2024, proc: 3.6 },
];
export const CPI_SOURCE = 'https://stat.gov.pl/obszary-tematyczne/ceny-handel/wskazniki-cen/wskazniki-cen-towarow-i-uslug-konsumpcyjnych-pot-inflacja-/roczne-wskazniki-cen-towarow-i-uslug-konsumpcyjnych/';

// Profil Zaufany - liczba aktywnych profili (mln), MC
export const PROFIL_ZAUFANY: Array<{ rok: number; mln: number }> = [
  { rok: 2018, mln: 1.3 },
  { rok: 2020, mln: 4.65 },
  { rok: 2021, mln: 8.8 },
  { rok: 2022, mln: 14.5 },
];
export const PROFIL_ZAUFANY_SOURCE = 'https://www.gov.pl/web/cyfryzacja/14-milionow-profili-zaufanych2';

// e-ZLA - elektroniczne zwolnienia lekarskie rocznie (mln), ZUS
export const EZLA: Array<{ rok: number; mln: number }> = [
  { rok: 2021, mln: 20.4 },
  { rok: 2022, mln: 21.8 },
  { rok: 2023, mln: 21.9 },
  { rok: 2024, mln: 22.1 },
];
export const EZLA_SOURCE = 'https://www.zus.pl/swiadczenia/zasilki/e-zla-elektroniczne-zwolnienia-lekarskie';

// ----- Darmowe API panstwowe (publiczna lista) -----

export const FREE_APIS: FreeApi[] = [
  { name: 'dane.gov.pl', data: 'Centralny katalog otwartych danych - tysiące zbiorów ze wszystkich ministerstw', url: 'https://api.dane.gov.pl/doc', key: false },
  { name: 'KRS Open API', data: 'Krajowy Rejestr Sądowy - spółki, fundacje, stowarzyszenia (JSON)', url: 'https://prs.ms.gov.pl/krs/openApi', key: false },
  { name: 'NFZ - Terminy leczenia', data: 'Pierwszy wolny termin wizyty i kolejki per świadczenie i województwo', url: 'https://api.nfz.gov.pl/app-itl-api/', key: false },
  { name: 'GUGiK ULDK', data: 'Lokalizacja działek ewidencyjnych po ID, adresie lub współrzędnych', url: 'https://www.geoportal.gov.pl/pl/uslugi/', key: false },
  { name: 'Sejm API', data: 'Posłowie, głosowania, interpelacje, prace komisji - rozliczalność władzy', url: 'https://api.sejm.gov.pl/sejm.html', key: false },
  { name: 'Eurostat', data: 'Statystyki UE - ceny, płace, indeks cen mieszkań, PKB (porównanie PL vs UE)', url: 'https://ec.europa.eu/eurostat/web/main/data/web-services', key: false },
  { name: 'GDOŚ Geoserwis', data: 'Obszary chronione Natura 2000, parki, rezerwaty, gatunki chronione (WMS/WFS)', url: 'https://geoserwis.gdos.gov.pl/mapy/', key: false },
  { name: 'GUS REGON BIR', data: 'Pełny rejestr podmiotów po NIP/REGON/KRS (uzupełnienie CEIDG)', url: 'https://api.stat.gov.pl/Home/RegonApi', key: true },
];
