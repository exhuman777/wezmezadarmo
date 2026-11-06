/**
 * Pliki dla modeli językowych i agentów AI (standard llmstxt.org): /llms.txt, /llms-full.txt
 * i wersje .md najważniejszych stron. Treść składana z tych samych danych co strona:
 * rejestr src/lib/strony.ts (tytuły, opisy), baza świadczeń, wpisy bloga i lista narzędzi.
 * Teksty bez długich myślników, bez emoji i bez „--”; pilnuje tego src/lib/__tests__/llms.test.ts.
 */
import { POSTS } from '@/data/blog-posts';
import { getAllBenefits } from '@/engine/benefits';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/engine/kategorie';
import type { ApplicationChannel, Benefit } from '@/engine/types';
import { NARZEDZIA } from '@/lib/narzedzia/lista';
import { SITE_URL, adres, sciezkaMd } from '@/lib/seo';
import { SIEC_TUKAMIL, TA_STRONA, aplikacjaSieci } from '@/lib/siec';
import { STRONY, podstrony, strona, type GrupaStrony, type Strona } from '@/lib/strony';

export interface Link { nazwa: string; url: string; opis?: string }

/**
 * Narzędzia tuKamil na subdomenach wezmezadarmo.com (adresy kanoniczne).
 * Dwie Strony i Należy się z opisem z katalogu sieci (src/lib/siec.ts).
 */
export const NARZEDZIA_NA_SUBDOMENACH: Link[] = [
  { nazwa: 'Dwie Strony', url: 'https://dwiestrony.wezmezadarmo.com', opis: zKatalogu('dwie-strony').opis },
  { nazwa: 'Należy się', url: 'https://nalezysie.wezmezadarmo.com', opis: zKatalogu('nalezy-sie').opis },
  { nazwa: 'Przegląd 2027', url: 'https://jpk.wezmezadarmo.com', opis: 'JPK przed 2027' },
  { nazwa: 'Gry', url: 'https://gry.wezmezadarmo.com', opis: 'gry w pikselach' },
];

function zKatalogu(id: string): Link {
  const a = aplikacjaSieci(id);
  return { nazwa: a.nazwa, url: a.adres, opis: a.jednoZdanie };
}

/** Aplikacje sieci tuKamil z katalogu (src/lib/siec.ts), bez tej strony; kolejność i nazwy jak w stopce. */
export const INNE_APLIKACJE: Link[] = SIEC_TUKAMIL.filter(a => a.id !== TA_STRONA).map(a => zKatalogu(a.id));

/** Sekcja w plikach .md: katalog sieci plus subdomeny spoza katalogu (bez powtórzeń adresu). */
function bezUkosnika(url: string): string {
  return url.replace(/\/$/, '');
}
const INNE_I_SUBDOMENY: Link[] = [
  ...INNE_APLIKACJE,
  ...NARZEDZIA_NA_SUBDOMENACH.filter(n => !INNE_APLIKACJE.some(a => bezUkosnika(a.url) === bezUkosnika(n.url))),
];

const KANALY: Partial<Record<ApplicationChannel, string>> = {
  PUE_ZUS: 'PUE ZUS (eZUS)', ePUAP: 'ePUAP', EMPATIA: 'portal Emp@tia', BANK: 'bankowość internetowa', MOPS: 'MOPS lub GOPS',
  URZAD_GMINY: 'urząd gminy', POZ: 'przychodnia POZ', URZAD_SKARBOWY: 'urząd skarbowy (PIT)', PUP: 'powiatowy urząd pracy',
  UCZELNIA: 'uczelnia', WFOSIGW: 'WFOŚiGW', ONLINE: 'online', ARiMR: 'ARiMR',
};

function liczba(n: number, formy: [string, string, string]): string {
  const d = n % 10, s = n % 100;
  const forma = n === 1 ? formy[0] : d >= 2 && d <= 4 && (s < 12 || s > 14) ? formy[1] : formy[2];
  return `${n} ${forma}`;
}

const aktywne = () => getAllBenefits().filter(b => !b.zakonczony);

/** Link do wersji .md, gdy strona ją ma, inaczej do strony HTML. */
function linkStrony(s: Strona): string {
  return adres(s.md ? sciezkaMd(s.sciezka) : s.sciezka);
}

function listaStron(strony: Strona[]): string {
  return strony.map(s => `- [${s.nazwa}](${linkStrony(s)}): ${s.opis}`).join('\n');
}

function listaLinkow(linki: Link[]): string {
  return linki.map(l => `- [${l.nazwa}](${l.url})${l.opis ? `: ${l.opis}` : ''}`).join('\n');
}

const STOPKA_MD = `## Inne aplikacje tuKamil

${listaLinkow(INNE_I_SUBDOMENY)}

Pełny spis serwisu dla modeli: ${SITE_URL}/llms.txt`;

const UWAGA = 'Projekt prywatny, nie rządowy i niekomercyjny. Informacja orientacyjna, nie decyzja urzędowa: ważne sprawy potwierdź w urzędzie.';

function naglowek(s: Strona): string {
  return `# ${s.tytul}

> ${s.opis}

Strona: ${adres(s.sciezka)}`;
}

function kanaly(b: Benefit): string {
  return b.wniosek.kanal.map(k => KANALY[k] ?? k.replace(/_/g, ' ')).join(', ');
}

/** Świadczenie w Markdown: krótko (lista) albo pełniej (llms-full.txt). */
function swiadczenieMd(b: Benefit, pelne: boolean): string {
  const linie = [
    `### ${b.nazwa}${b.zakonczony ? ' (program zakończony)' : ''}`,
    '',
    `- Kwota: ${b.kwota}${b.czestotliwosc && !b.kwota.toLowerCase().includes(b.czestotliwosc.toLowerCase()) ? `, ${b.czestotliwosc}` : ''}`,
    `- Gdzie złożyć: ${kanaly(b)}${b.wniosek.formularz ? ` (formularz ${b.wniosek.formularz})` : ''}`,
    `- Źródło: [${b.zrodloNazwa}](${b.zrodloUrl}), sprawdzone ${b.dataWeryfikacji}`,
  ];
  if (b.opis) linie.push('', pelne ? b.opis : `${b.opis.split(/(?<=\.)\s/)[0]}`);
  if (pelne) {
    if (b.wniosek.dokumenty.length) linie.push('', 'Dokumenty:', ...b.wniosek.dokumenty.map(d => `- ${d}`));
    if (b.wniosek.kroki.length) linie.push('', 'Kroki:', ...b.wniosek.kroki.map((k, i) => `${i + 1}. ${k}`));
    if (b.wniosek.terminRealizacji) linie.push('', `Czas załatwienia: ${b.wniosek.terminRealizacji}`);
    if (b.wniosek.pulapki.length) linie.push('', 'Na co uważać:', ...b.wniosek.pulapki.map(p => `- ${p}`));
  }
  return linie.join('\n');
}

function bazaSwiadczenMd(pelne: boolean): string {
  const wszystkie = getAllBenefits();
  return CATEGORY_ORDER.map(kat => {
    const lista = wszystkie.filter(b => b.kategoria === kat);
    if (!lista.length) return '';
    return `## ${CATEGORY_LABELS[kat]} (${lista.length})\n\n${lista.map(b => swiadczenieMd(b, pelne)).join('\n\n')}`;
  }).filter(Boolean).join('\n\n');
}

/** Treść stron, które mają wersję .md. Fakty wyłącznie z treści tych stron. */
const TRESCI: Record<string, () => string> = {
  '/': () => {
    const n = aktywne().length;
    return `${naglowek(strona('/'))}

wezmezadarmo pomaga sprawdzić, jakie świadczenia, ulgi i dotacje mogą Ci przysługiwać, i pokazuje, jak o nie wystąpić. ${UWAGA}

## Jak działa kalkulator

1. Podajesz wiek i płeć, a jeśli prowadzisz firmę, opcjonalnie NIP.
2. Odpowiadasz na kilka pytań: stan cywilny, dzieci, dochód gospodarstwa, zatrudnienie, orzeczenie o niepełnosprawności, mieszkanie i województwo.
3. Silnik porównuje odpowiedzi z bazą ${liczba(n, ['aktywnego świadczenia', 'aktywnych świadczeń', 'aktywnych świadczeń'])} i pokazuje te, które pewnie albo możliwie Ci przysługują.
4. Przy każdym świadczeniu widzisz kwotę, warunki, kroki wniosku i link do źródła urzędowego.

Bez konta i bez PESEL. Odpowiedzi nie są zapisywane.

## Dwa przykłady ze strony

- 800+: 800 zł miesięcznie na każde dziecko do 18 lat, bez względu na dochód.
- 13. emerytura: 1978,49 zł brutto co roku w kwietniu dla emerytów i rencistów.

## Co jeszcze jest w serwisie

${listaStron(STRONY.filter(s => s.sciezka !== '/' && s.md))}

${STOPKA_MD}`;
  },

  '/swiadczenia': () => {
    const w = getAllBenefits();
    const zak = w.filter(b => b.zakonczony).length;
    return `${naglowek(strona('/swiadczenia'))}

Baza ma ${liczba(w.length, ['pozycję', 'pozycje', 'pozycji'])} w ${liczba(CATEGORY_ORDER.length, ['kategorii', 'kategoriach', 'kategoriach'])}${zak ? `, w tym ${liczba(zak, ['program zakończony', 'programy zakończone', 'programów zakończonych'])} (zostają jako informacja, kalkulator ich nie dopasowuje)` : ''}. Wyszukiwarka na stronie działa bez polskich znaków i zna potoczne nazwy, np. kuroniówka. Adres z frazą: ${SITE_URL}/swiadczenia?q=becikowe

Pełne opisy z dokumentami i krokami wniosku: ${SITE_URL}/llms-full.txt

${bazaSwiadczenMd(false)}

${STOPKA_MD}`;
  },

  '/wnioski': () => `${naglowek(strona('/wnioski'))}

AI tłumaczy każde pole i podpowiada treść. Pobierasz gotowy PDF do podpisania i złożenia. Dane zostają w Twojej przeglądarce, a serwis nie składa wniosków za Ciebie.

## Jak to działa

1. Wybierasz formularz. Po zalogowaniu dane z profilu (PESEL, imię, adres, numer konta) wpisują się same.
2. AI proponuje treść pól na podstawie kontekstu wniosku, a Ty czytasz i potwierdzasz.
3. Dane zostają w Twojej przeglądarce, więc przy kolejnym wniosku pola wypełnią się same.
4. Pobierasz PDF z danymi, instrukcją złożenia i wskazówkami. Drukujesz, podpisujesz i składasz.

## Formularze

${listaStron(podstrony('/wnioski'))}

${STOPKA_MD}`,

  '/agent': () => `${naglowek(strona('/agent'))}

Asystent odpowiada z bazy świadczeń i danych urzędów. Bez konta zadasz 3 pytania dziennie, z kontem odpowiada pod Twój profil.

## Co potrafi

- Po uzupełnieniu profilu odpowiada pod Twój wiek, rodzinę, dochód i firmę.
- Pokazuje świadczenia, które pasują, z linkiem do źródła.
- Sprawdza dane na żywo: kurs w NBP, kolejkę w NFZ, NIP na Białej Liście VAT, powietrze z GIOŚ.
- Cytuje komunikaty ZUS, PFRON, GUS, Sejmu i ministerstw.
- Podpowiada, co wpisać we wnioskach ZUS, i przygotowuje PDF.
- Gdy czegoś nie ma w bazie, mówi to wprost i odsyła do urzędu.

## Przykładowe pytania

- Jakie świadczenia mi przysługują?
- Czy mogę dostać 800+ na dziecko?
- Ile czekam do kardiologa?
- Jak złożyć wniosek o zasiłek chorobowy?
- Jakie ulgi podatkowe mam jako JDG?

Pytanie można przekazać w adresie: ${SITE_URL}/agent?q=jakie%20ulgi%20mam%20jako%20JDG

Asystent ma charakter informacyjny i nie składa wniosków za Ciebie. Działa na modelu Google Gemini przez OpenRouter, pytania nie służą do trenowania modeli.

${STOPKA_MD}`,

  '/nfz': () => `${naglowek(strona('/nfz'))}

## Jak sprawdzić kolejkę

1. Wybierz świadczenie, np. poradnię kardiologiczną, albo jedną z popularnych kategorii (specjaliści, badania, rehabilitacja, stomatologia).
2. Wybierz województwo i miasto oraz tryb przyjęcia: stabilny albo pilny.
3. Zobacz placówki z najbliższym wolnym terminem i liczbą oczekujących.

Druga zakładka wyszukuje świadczeniodawców: szpitale i przychodnie z kontraktem NFZ. Dane są orientacyjne, termin potwierdź na nfz.gov.pl albo w placówce.

${STOPKA_MD}`,

  '/aktualnosci': () => `${naglowek(strona('/aktualnosci'))}

Agregator RSS odświeżany co 30 minut. Źródła: ZUS, GUS, NBP, UOKiK, Fundusze EU, e-Zdrowie, Sejm i ARiMR. Wpisy można filtrować: dla wszystkich, dla JDG, dla firm. Obok widżety na żywo: jakość powietrza GIOŚ, kursy NBP, ostrzeżenia i zmiany w prawie.

Firmy po zalogowaniu ustawiają własne kanały monitorowania w panelu.

${STOPKA_MD}`,

  '/statystyki': () => `${naglowek(strona('/statystyki'))}

Liczby z GUS, NBP i NFZ. Część pobiera się na żywo z oficjalnych API, przy każdej jest źródło.

## Co jest na stronie

- Cena 1 m² nowego mieszkania w 1. kwartale każdego roku od 2000 (źródło: stat.gov.pl, budownictwo).
- Wskaźniki Celów Zrównoważonego Rozwoju z API sdg.gov.pl, np. lekarze i pielęgniarki na 10 tys. mieszkańców.
- Lista 15 publicznych API (GUS SDG, NBP, NFZ, BDL, REGON, CEIDG, TERYT, dane.gov.pl, KRS, Sejm, Eurostat i inne) z informacją, które działają bez klucza.

${STOPKA_MD}`,

  '/centrum-obywatela': () => `${naglowek(strona('/centrum-obywatela'))}

Narzędzia korzystają z publicznych API instytucji i działają bez logowania.

## Narzędzia

${listaStron([strona('/nfz'), ...podstrony('/centrum-obywatela'), strona('/aktualnosci'), strona('/swiadczenia')])}

## Źródła

api.nfz.gov.pl, api.nbp.pl, api.gios.gov.pl, wl-api.mf.gov.pl, danepubliczne.imgw.pl, api.sejm.gov.pl/eli, bdl.stat.gov.pl, geoportal.arimr.gov.pl, portalpasazera.pl

${STOPKA_MD}`,

  '/dla-firm': () => `${naglowek(strona('/dla-firm'))}

## Narzędzia dla firm za darmo

Wgrywasz plik, a przeglądarka pokazuje, co sprawdzić przed wysyłką. Pliki zostają u Ciebie. Bez zakładania konta: wystarczy e-mail i telefon.

${listaStron(podstrony('/dla-firm/narzedzia'))}

## Otwarte API bazy świadczeń

Jeden endpoint REST: POST ${SITE_URL}/api/verify z profilem osoby (wiek, płeć, dzieci, dochód) i kluczem API w nagłówku X-API-Key. API nie zapisuje danych osób, o które pytasz. Kod AGPL-3.0, dane CC-BY-4.0, bezpłatnie także dla NGO i instytucji publicznych. Klucz API: formularz na stronie. Dokumentacja dla agentów: ${SITE_URL}/llm.md

Z API korzystają głównie ci, którzy pomagają ludziom: NGO i ośrodki pomocy, pracownicy socjalni i doradcy, biblioteki i punkty pomocy cyfrowej, uczelnie i badacze.

## Więcej dla firm

${listaStron([strona('/dotacje'), strona('/za-darmo-dla-biznesu'), strona('/automatyzacje')])}

${STOPKA_MD}`,

  '/dla-firm/narzedzia': () => `${naglowek(strona('/dla-firm/narzedzia'))}

Pliki czyta tylko Twoja przeglądarka, nie wysyłamy ich na serwer. Narzędzia wskazują pozycje do sprawdzenia i liczą szacunki, ale nie zastępują doradztwa podatkowego: decyzję podejmuje księgowa.

## Narzędzia

${NARZEDZIA.map(n => `### ${n.nazwa}\n\n${n.opis}\n\nAdres: ${adres(n.adres)}`).join('\n\n')}

## Jak otworzyć

1. Wejdź na stronę narzędzia.
2. Podaj e-mail i telefon (imię opcjonalnie) i zaznacz zgodę na kontakt.
3. Narzędzia otwierają się od razu na 30 dni, bez zakładania konta.

${STOPKA_MD}`,

  '/dotacje': () => `${naglowek(strona('/dotacje'))}

## Jak to działa

1. Podajesz NIP. Agent pobiera dane z CEIDG i Białej Listy VAT: nazwę, PKD, województwo, status VAT.
2. Zaznaczasz, co Cię interesuje: szkolenia, zatrudnienie, innowacje, zielona transformacja, eksport.
3. Rozmawiasz z agentem: pokazuje, co pasuje do profilu firmy, i wyjaśnia, dlaczego inne programy nie spełniają kryteriów.
4. Dostajesz e-mail, gdy otworzy się nowy nabór pasujący do profilu firmy.

## Co monitoruje agent

- Krajowy Fundusz Szkoleniowy: do 300% przeciętnego wynagrodzenia na kształcenie pracowników i pracodawcy, nabory przez PUP.
- Refundacja kosztów zatrudnienia bezrobotnego: do 6-krotności średniej krajowej.
- Dofinansowanie zatrudnienia osób z niepełnosprawnością (PFRON): 2400 zł miesięcznie na osobę, wnioski przez SODiR.
- Krajowy Plan Odbudowy: do 2 mln zł na cyfryzację, zieloną transformację i odporność firm, nabory PARP i BGK.
- Programy samorządowe: od 5 tys. zł, monitoring 16 województw.
- PARP: do 10 mln zł na B+R, innowacje, eksport i cyfryzację z funduszy FEP 2021-2027.

Dostęp jest bezpłatny, z limitami uczciwego użycia. Nic nie jest składane bez Twojej zgody, a decyzja o dofinansowaniu należy do instytucji, która prowadzi program.

${STOPKA_MD}`,

  '/automatyzacje': () => `${naglowek(strona('/automatyzacje'))}

Strona informacyjna. Każdą automatyzację przed wysłaniem czegokolwiek sprawdza człowiek.

## Pięć przykładów

- Faktury spoza KSeF: rachunki z zagranicznych usług przychodzą mailem, program może je odczytać i wpisać do arkusza.
- Oferty: szablon, kwoty i wysyłka to powtarzalna praca, którą łatwo przyspieszyć.
- Raporty: dane z arkuszy na koniec miesiąca mogą składać się same i trafiać do księgowej.
- Maile do klientów: potwierdzenia, przypomnienia i odpowiedzi po spotkaniu jako szkice do sprawdzenia.
- Terminy ZUS i US: przypomnienia o terminach i przepisywanie danych do ewidencji.

${STOPKA_MD}`,

  '/za-darmo-dla-biznesu': () => `${naglowek(strona('/za-darmo-dla-biznesu'))}

wezmezadarmo.com jest darmowe. Ta strona opisuje dwa płatne produkty Dogtronic Labs z Lublina, przy których pracuje autor serwisu.

## DogInvoice (https://doginvoice.com)

- Dopasowuje przelewy z banku do faktur z KSeF, więc widać, co jest opłacone, a co nie.
- Sprawdza kontrahentów na białej liście VAT, wpisuje numery faktur w tytuły i robi jeden plik do banku dla kilku faktur.
- Księgowa i zespół mają dostęp, a miesiąc zamyka się jednym kliknięciem.

## DogAnswer (https://doganswer.com)

- Asystent głosowy AI, który odbiera telefon, kiedy Ty nie możesz, o każdej porze.
- Zna firmę i ofertę, odpowiada na pytania klientów i dopytuje o szczegóły.
- Umawia spotkania w Kalendarzu Google i zapisuje, o czym była rozmowa.

${STOPKA_MD}`,

  '/blog': () => `${naglowek(strona('/blog'))}

${[...POSTS].sort((a, b) => b.date.localeCompare(a.date)).map(p => `- [${p.title}](${adres(`/blog/${p.slug}`)}) (${p.date}): ${p.description}`).join('\n')}

Pełna treść wpisów: ${SITE_URL}/llms-full.txt

${STOPKA_MD}`,

  '/o-projekcie': () => `${naglowek(strona('/o-projekcie'))}

Darmowa strona, która pomaga sprawdzić, jakie świadczenia, ulgi i dotacje mogą Ci przysługiwać. Projekt prywatny, nie rządowy i niekomercyjny. Stworzył go tuKamil z Lublina, pro bono. Kod jest otwarty (AGPL-3.0), baza świadczeń to otwarte dane (CC-BY-4.0): https://github.com/exhuman777/wezmezadarmo

## Prywatność

- Kalkulator nie pyta o PESEL i nie zapisuje Twoich odpowiedzi.
- PESEL jest potrzebny tylko do wniosku ZUS. Zapisuje się w Twojej przeglądarce, a po zalogowaniu opcjonalnie w profilu.
- Konto i profil są w bazie Supabase na serwerach w UE. Danych nie sprzedajemy.
- Asystent AI odpowiada z bazy świadczeń i podaje źródła. Ważne rzeczy sprawdź w urzędzie.

## Skąd są dane

Z oficjalnych stron i API instytucji publicznych: gov.pl, zus.pl, podatki.gov.pl, pfron.gov.pl, nfz.gov.pl, praca.gov.pl, nfosigw.gov.pl, krus.gov.pl, biznes.gov.pl, danepubliczne.imgw.pl, api.sejm.gov.pl, bdl.stat.gov.pl, geoportal.arimr.gov.pl, portalpasazera.pl. Przy każdym świadczeniu jest link do źródła.

${STOPKA_MD}`,
};

export const SCIEZKI_MD = Object.keys(TRESCI);

/** Treść pliku .md strony albo null, gdy strona nie ma wersji Markdown. */
export function markdownStrony(sciezka: string): string | null {
  const tresc = TRESCI[sciezka];
  return tresc ? `${tresc()}\n` : null;
}

const NAZWY_GRUP: Record<GrupaStrony, string> = {
  obywatele: 'Dla obywateli',
  wnioski: 'Wnioski ZUS i granty',
  centrum: 'Centrum Obywatela: dane urzędowe na żywo',
  firmy: 'Dla firm i JDG',
  informacje: 'Informacje',
};

/** /llms.txt: spis serwisu według llmstxt.org. */
export function llmsTxt(): string {
  const n = getAllBenefits().length;
  const grupa = (g: GrupaStrony) => listaStron(STRONY.filter(s => s.grupa === g));
  return `# wezmezadarmo

> Darmowy serwis, który pomaga osobom w Polsce sprawdzić, jakie świadczenia, ulgi i dotacje mogą im przysługiwać (baza ${liczba(n, ['świadczenia', 'świadczeń', 'świadczeń'])}, ulg i dotacji ze źródłami urzędowymi), wypełnić wniosek ZUS z pomocą AI i skorzystać z darmowych narzędzi dla firm. Projekt prywatny tuKamil, nie rządowy.

Wszystko po polsku, bez logowania (konto tylko do panelu). Informacja orientacyjna, nie decyzja urzędowa. Adres kanoniczny: ${SITE_URL}. Pliki .md mają tę samą treść co strony, bez nawigacji.

## ${NAZWY_GRUP.obywatele}

${grupa('obywatele')}

## ${NAZWY_GRUP.wnioski}

${grupa('wnioski')}

## ${NAZWY_GRUP.centrum}

${grupa('centrum')}

## ${NAZWY_GRUP.firmy}

${grupa('firmy')}

## Dla agentów AI

- [Pełna treść serwisu](${SITE_URL}/llms-full.txt): wszystkie strony z plików .md i pełne opisy świadczeń z dokumentami i krokami wniosku
- [Przewodnik techniczny dla agentów: kalkulator i API świadczeń](${SITE_URL}/llm.md): endpointy /api/verify, /api/chat, /api/form-assist, /api/pdf i model danych
- [Przewodnik dla agentów firmowych](${SITE_URL}/agents.md): dotacje, monitoring naborów, aktualności i wnioski dla firm

## Narzędzia na subdomenach

${listaLinkow(NARZEDZIA_NA_SUBDOMENACH)}

## Inne aplikacje tuKamil

${listaLinkow(INNE_APLIKACJE)}

## Optional

${grupa('informacje')}
${POSTS.map(p => `- [${p.title}](${adres(`/blog/${p.slug}`)}): ${p.description}`).join('\n')}
`;
}

/** /llms-full.txt: treść wszystkich stron .md po kolei, pełna baza świadczeń i wpisy bloga. */
export function llmsFullTxt(): string {
  const strony = SCIEZKI_MD.filter(p => p !== '/swiadczenia').map(p => TRESCI[p]().replace(/\n## Inne aplikacje tuKamil[\s\S]*$/, '').trim());
  const blog = [...POSTS].sort((a, b) => b.date.localeCompare(a.date)).map(p => `# ${p.title}

> ${p.description}

Strona: ${adres(`/blog/${p.slug}`)}, ${p.date}

${p.content.trim().replace(/^ • /gm, '- ')}`);
  return `# wezmezadarmo: pełna treść dla modeli językowych

> Spis z linkami: ${SITE_URL}/llms.txt. ${UWAGA}

${strony.join('\n\n---\n\n')}

---

${naglowek(strona('/swiadczenia'))}

${bazaSwiadczenMd(true)}

---

${blog.join('\n\n---\n\n')}

---

${STOPKA_MD}
`;
}

/** Odpowiedź route handlera: tekst z poprawnym Content-Type; dla .md nagłówek Link wskazuje stronę HTML jako kanoniczną. */
export function odpowiedzTekst(tekst: string, typ: 'text/plain' | 'text/markdown', kanoniczny?: string): Response {
  const naglowki: Record<string, string> = {
    'Content-Type': `${typ}; charset=utf-8`,
    'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
  };
  if (kanoniczny) naglowki.Link = `<${kanoniczny}>; rel="canonical"`;
  return new Response(tekst, { headers: naglowki });
}

/** GET dla /sciezka.md. */
export function odpowiedzMd(sciezka: string): Response {
  const tresc = markdownStrony(sciezka);
  if (!tresc) return new Response('Nie ma takiej strony.', { status: 404 });
  return odpowiedzTekst(tresc, 'text/markdown', adres(sciezka));
}
