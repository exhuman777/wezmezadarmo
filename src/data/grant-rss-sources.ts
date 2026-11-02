import type { FeedMeta } from '@/app/aktualnosci/rss';

// Źródła RSS dla monitoringu naborów B2B (cron /api/dotacje/cron/daily-scrape).
// Stan 1.11.2026: zostały tylko kanały, które zwracają prawdziwy RSS z aktualnymi wpisami
// (sprawdzenie: npx tsx scripts/sprawdz-zrodla.ts). Usunięte, bo nie działały:
// - Fundusze Europejskie (/rss to strona HTML, WordPress /?feed=rss2 bez wpisów),
// - PARP i BGK (ochrona przed botami zwraca stronę z wyzwaniem zamiast RSS),
// - NCBR (stary adres zwraca 400, nowego kanału nie znaleziono),
// - PSZ (/rss 404).
// ARiMR, MF, MRiPT i MRiPS są na gov.pl, który nie ma RSS (stare /api/feed przekierowywało
// na stronę główną). Pobieramy listę wiadomości z ich stron (format: 'govpl').
// Raport: docs/audyt-api-2026-11-01.md
export const GRANT_RSS_SOURCES: FeedMeta[] = [
  {
    id: 'pfron',
    name: 'PFRON',
    fullName: 'Państwowy Fundusz Rehabilitacji Osób Niepełnosprawnych',
    // Nowa domena pfron.gov.pl, kanał RSS TYPO3 (link z ikony RSS na stronie głównej)
    url: 'https://www.pfron.gov.pl/?type=9818',
    audiences: ['firmy'],
    tags: ['pfron', 'niepełnosprawni', 'rehabilitacja', 'sod'],
  },
  {
    id: 'zus-b2b',
    name: 'ZUS',
    fullName: 'Zakład Ubezpieczeń Społecznych - aktualności',
    // Adresy z https://www.zus.pl/kanal-rss
    url: 'https://www.zus.pl/o-zus/aktualnosci/-/asset_publisher/aktualnosci/rss',
    audiences: ['firmy'],
    tags: ['zus', 'składki', 'ulgi', 'dofinansowania', 'mały zus plus'],
  },
  {
    id: 'zus-wyjasnienia',
    name: 'ZUS wyjaśnienia',
    fullName: 'ZUS - bieżące wyjaśnienia komórek merytorycznych',
    url: 'https://www.zus.pl/baza-wiedzy/biezace-wyjasnienia-komorek-merytorycznych/-/asset_publisher/biezace-wyjasnienia-komorek-merytorycznych/rss',
    audiences: ['firmy'],
    tags: ['zus', 'składki', 'przepisy', 'wyjaśnienia'],
  },
  {
    id: 'arimr-b2b',
    name: 'ARiMR',
    fullName: 'Agencja Restrukturyzacji i Modernizacji Rolnictwa',
    url: 'https://www.gov.pl/web/arimr',
    audiences: ['firmy'],
    tags: ['rolnictwo', 'arimr', 'dotacje', 'modernizacja', 'restrukturyzacja'],
    format: 'govpl',
  },
  {
    id: 'gov-mf',
    name: 'MF',
    fullName: 'Ministerstwo Finansów',
    url: 'https://www.gov.pl/web/finanse',
    audiences: ['firmy'],
    tags: ['podatki', 'ulgi podatkowe', 'przepisy', 'ksef'],
    format: 'govpl',
  },
  {
    id: 'gov-mrpit',
    name: 'MRiT',
    fullName: 'Ministerstwo Rozwoju i Technologii',
    url: 'https://www.gov.pl/web/rozwoj-technologia',
    audiences: ['firmy'],
    tags: ['gospodarka', 'przedsiębiorczość', 'msp', 'inwestycje'],
    format: 'govpl',
  },
  {
    id: 'gov-mps',
    name: 'MRPiPS',
    fullName: 'Ministerstwo Rodziny, Pracy i Polityki Społecznej',
    url: 'https://www.gov.pl/web/rodzina',
    audiences: ['firmy'],
    tags: ['zatrudnienie', 'rynek pracy', 'kfs', 'aktywizacja'],
    format: 'govpl',
  },
];
