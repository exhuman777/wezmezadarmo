/**
 * Press kit (/press): opis w 1 i 3 zdaniach z przyciskiem „Kopiuj”, fakty, narzędzia, pliki do pobrania,
 * kontakt i data aktualizacji. Liczby liczone z kodu (baza świadczeń, programy B2B, źródła RSS), więc nie
 * rozjeżdżają się z resztą strony. Pliki w public/press/: znak (SVG i PNG z src/lib/znak.ts) i zrzuty ekranu.
 * Kontakt tylko przez formularz w stopce i strony autora, bez telefonu, e-maila i nazwiska.
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import { StronaJsonLd } from '@/components/JsonLd';
import { PixelMark } from '@/components/SiteNav';
import { BENEFITS } from '@/engine/benefits';
import { PROGRAMS } from '@/data/programs-b2b';
import { FEEDS } from '@/app/aktualnosci/rss';
import { metadaneStrony } from '@/lib/strony';
import { MARKA_TEJ_STRONY } from '@/lib/siec';
import { Kopiuj, OtworzKontakt } from './PressAkcje';

export const metadata: Metadata = metadaneStrony('/press');

/** Data ostatniej zmiany treści tej strony. Podbij przy każdej zmianie press kitu. */
const AKTUALIZACJA = '2026-11-05';

const LICZBA_SWIADCZEN = BENEFITS.length;
const LICZBA_KATEGORII = new Set(BENEFITS.map(b => b.kategoria)).size;
const ZE_ZRODLEM = BENEFITS.filter(b => b.zrodloUrl.startsWith('https://')).length;
const WERYFIKACJA = BENEFITS.map(b => b.dataWeryfikacji).sort().at(-1) ?? AKTUALIZACJA;
const LICZBA_PROGRAMOW = PROGRAMS.length;
const ZRODLA_RSS = FEEDS.map(f => f.name);

const NAZWY_KATEGORII_B2B: Record<string, string> = {
  kfs: 'KFS', pup: 'PUP', pfron: 'PFRON', kpo: 'KPO', feng: 'FENG', parp: 'PARP', ncbr: 'NCBR', nfz: 'NFZ', arimir: 'ARiMR', samorzad: 'samorządy',
};
const KATEGORIE_B2B = [...new Set(PROGRAMS.map(p => p.category))].map(k => NAZWY_KATEGORII_B2B[k] ?? k);

function data(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Warsaw' });
}

function lista(slowa: string[]): string {
  return slowa.length < 2 ? slowa.join('') : `${slowa.slice(0, -1).join(', ')} i ${slowa.at(-1)}`;
}

const OPIS_1 = `wezmezadarmo.com to darmowy serwis, w którym bez zakładania konta można sprawdzić, które ze ${LICZBA_SWIADCZEN} świadczeń, ulg i dotacji mogą przysługiwać.`;

const OPIS_3 = [
  `wezmezadarmo.com to darmowy serwis, w którym bez zakładania konta i bez numeru PESEL można sprawdzić, które ze ${LICZBA_SWIADCZEN} świadczeń, ulg i dotacji mogą przysługiwać.`,
  `Przy każdym świadczeniu jest kwota, warunki, kroki wniosku i link do źródła urzędowego, a obok działają wnioski ZUS z pomocą AI, kolejki NFZ, aktualności z urzędów i darmowe narzędzia dla firm z bazą ${LICZBA_PROGRAMOW} programów dofinansowań.`,
  'Projekt jest prywatny i niekomercyjny, prowadzi go tuKamil z Lublina, kod jest otwarty (AGPL-3.0), a baza świadczeń to otwarte dane (CC-BY-4.0).',
].join(' ');

const FAKTY: { liczba: string; tekst: string }[] = [
  { liczba: String(LICZBA_SWIADCZEN), tekst: `świadczeń, ulg i programów w bazie, w ${LICZBA_KATEGORII} kategoriach.` },
  { liczba: `${ZE_ZRODLEM} z ${LICZBA_SWIADCZEN}`, tekst: 'świadczeń ma link do źródła urzędowego i datę weryfikacji.' },
  { liczba: String(LICZBA_PROGRAMOW), tekst: `programów dofinansowań dla firm: ${lista(KATEGORIE_B2B)}.` },
  { liczba: String(ZRODLA_RSS.length), tekst: `źródeł komunikatów w Aktualnościach (${lista(ZRODLA_RSS)}), odświeżanych co 30 minut.` },
  { liczba: 'Na żywo', tekst: 'dane z API: NFZ, NBP, GIOŚ, IMGW, Sejm (ELI), GUS (BDL i SDG), Biała Lista VAT i CEIDG.' },
  { liczba: '0 zł', tekst: 'za każdą funkcję. Kalkulator działa bez konta i nie pyta o PESEL.' },
  { liczba: data(WERYFIKACJA), tekst: 'ostatnia weryfikacja bazy świadczeń.' },
  { liczba: 'AGPL-3.0', tekst: 'licencja kodu. Baza świadczeń: otwarte dane CC-BY-4.0, wolno jej używać z podaniem źródła.' },
];

const NARZEDZIA = [
  { href: '/', nazwa: 'Kalkulator świadczeń', opis: 'Kilka pytań bez konta i lista świadczeń, ulg i dotacji, które mogą przysługiwać.' },
  { href: '/swiadczenia', nazwa: 'Baza świadczeń', opis: `${LICZBA_SWIADCZEN} pozycji: kwota, warunki, kroki wniosku i link do źródła.` },
  { href: '/wnioski', nazwa: 'Wnioski ZUS z pomocą AI', opis: 'Z-15A, Z-15B, ZAS-53, ERPO, PEL, ERSU i ERU krok po kroku, na końcu PDF do podpisu.' },
  { href: '/agent', nazwa: 'Asystent AI', opis: 'Odpowiada na pytania o świadczenia, ZUS i urzędy z bazy świadczeń i podaje źródła.' },
  { href: '/nfz', nazwa: 'Kolejki NFZ', opis: 'Czas oczekiwania do specjalisty i placówki z kontraktem NFZ, dane z api.nfz.gov.pl.' },
  { href: '/aktualnosci', nazwa: 'Aktualności', opis: `Komunikaty z ${ZRODLA_RSS.length} źródeł w jednym miejscu, z filtrem dla JDG, firm i obywateli.` },
  { href: '/centrum-obywatela', nazwa: 'Centrum Obywatela', opis: 'Kursy NBP, powietrze GIOŚ, Biała Lista VAT, ostrzeżenia IMGW, zmiany w prawie, dane gminy z GUS i ulgi PKP.' },
  { href: '/statystyki', nazwa: 'Polska w liczbach', opis: 'Cena metra mieszkania od 2000 roku, wskaźniki GUS i lista publicznych API.' },
  { href: '/dla-firm/narzedzia', nazwa: 'Narzędzia dla firm', opis: 'Przegląd KPiR, sprawdzenie pliku JPK_V7 i dofinansowania po NIP, dostęp po podaniu e-maila i telefonu.' },
  { href: '/dotacje', nazwa: 'Dotacje dla firm', opis: `Baza ${LICZBA_PROGRAMOW} programów i agent, który dopasowuje nabory do firmy po NIP.` },
  { href: '/blog', nazwa: 'Blog', opis: 'Poradniki o świadczeniach, ulgach i wnioskach.' },
];

const ZNAKI = [
  { plik: '/press/znak.svg', nazwa: 'Znak marki, SVG', opis: 'Wektor, przezroczyste tło.' },
  { plik: '/press/znak-1024.png', nazwa: 'Znak marki, PNG 1024 px', opis: 'Przezroczyste tło.' },
  { plik: '/ikona-512.png', nazwa: 'Ikona, PNG 512 px', opis: 'Znak na tle papieru.' },
  { plik: '/apple-icon.png', nazwa: 'Ikona aplikacji, PNG 180 px', opis: 'Ekran główny telefonu.' },
  { plik: '/favicon.ico', nazwa: 'Favicon, ICO', opis: '16 i 32 px.' },
  { plik: '/og-2026-11.png', nazwa: 'Obraz podglądu linku, PNG 1200 x 630', opis: 'Hasło strony głównej i znak.' },
];

const ZRZUTY = [
  { slug: 'strona-glowna', nazwa: 'Strona główna' },
  { slug: 'swiadczenia', nazwa: 'Baza świadczeń' },
  { slug: 'wnioski', nazwa: 'Wnioski ZUS' },
  { slug: 'nfz', nazwa: 'Kolejki NFZ' },
  { slug: 'dla-firm', nazwa: 'Dla firm' },
];

function nazwaPliku(plik: string): string {
  return `wezmezadarmo-${plik.split('/').at(-1)}`;
}

export default function PressPage() {
  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Press kit</p>
        <h1>Materiały dla mediów</h1>
        <p className="pod">Opis serwisu, fakty, znak marki i zrzuty ekranu wezmezadarmo.com.</p>
        <p className="mala">Stan na {data(AKTUALIZACJA)}.</p>
      </section>

      <section className="prosta-blok">
        <h2>Opis w jednym zdaniu</h2>
        <p className="press-tekst">{OPIS_1}</p>
        <Kopiuj tekst={OPIS_1} etykieta="opis w jednym zdaniu" />
      </section>

      <section className="prosta-blok">
        <h2>Opis w trzech zdaniach</h2>
        <p className="press-tekst">{OPIS_3}</p>
        <Kopiuj tekst={OPIS_3} etykieta="opis w trzech zdaniach" />
      </section>

      <section className="prosta-blok">
        <h2>Najważniejsze fakty</h2>
        <ul className="lista">
          {FAKTY.map(f => (
            <li key={f.liczba}><b>{f.liczba}</b> {f.tekst}</li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Co robi każde narzędzie</h2>
        <ul className="linki">
          {NARZEDZIA.map(n => (
            <li key={n.href}>
              <Link href={n.href}>
                <span>{n.nazwa}<small>{n.opis}</small></span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Znak marki do pobrania</h2>
        <p className="pod">Pikselowy prezent 16 x 16. Przy powiększaniu skaluj bez wygładzania.</p>
        <div className="press-znak">
          <PixelMark size={96} />
          <span className="stopka-marka">wezmezadarmo<span className="dim">.com</span></span>
        </div>
        <ul className="linki">
          {ZNAKI.map(z => (
            <li key={z.plik}>
              <a href={z.plik} download={nazwaPliku(z.plik)}>
                <span>{z.nazwa}<small>{z.opis}</small></span>
                <span aria-hidden="true">↓</span>
              </a>
            </li>
          ))}
          <li>
            <a href={MARKA_TEJ_STRONY}>
              <span>Marka i materiały<small>Księga marki, kolory, kroje i pliki do druku na tukamil.com.</small></span>
              <span aria-hidden="true">→</span>
            </a>
          </li>
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Zrzuty ekranu</h2>
        <p className="pod">PNG z komputera (1280 x 800) i z telefonu (390 x 844, podwójna rozdzielczość), stan na {data(AKTUALIZACJA)}.</p>
        <ul className="lista press-zrzuty">
          {ZRZUTY.map(z => (
            <li key={z.slug}>
              <span>{z.nazwa}</span>
              <span className="press-zrzuty-pliki">
                {[1280, 390].map(szer => {
                  const plik = `/press/zrzut-${z.slug}-${szer}.png`;
                  return (
                    <a key={szer} className="btn btn-ghost" href={plik} download={nazwaPliku(plik)} aria-label={`${szer} px: ${z.nazwa}`}>
                      {szer} px
                    </a>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Kontakt dla mediów</h2>
        <p>Napisz przez formularz „Napisz do nas” w stopce. Wiadomość trafia do autora projektu.</p>
        <div className="przyciski">
          <OtworzKontakt />
        </div>
        <ul className="linki">
          <li><a href="https://tukamil.com" target="_blank" rel="noopener"><span>tukamil.com<small>Strona autora</small></span><span aria-hidden="true">→</span></a></li>
          <li><a href="https://github.com/exhuman777/wezmezadarmo" target="_blank" rel="noopener noreferrer"><span>Kod na GitHubie<small>github.com/exhuman777/wezmezadarmo</small></span><span aria-hidden="true">→</span></a></li>
          <li><Link href="/o-projekcie"><span>O projekcie<small>Skąd są dane i jak dbamy o prywatność.</small></span><span aria-hidden="true">→</span></Link></li>
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Aktualizacja</h2>
        <p className="mala">
          Press kit: {data(AKTUALIZACJA)}. Baza świadczeń: {data(WERYFIKACJA)}. Liczby na tej stronie pochodzą wprost z bazy serwisu.
        </p>
      </section>

      {/* JSON-LD na końcu: pierwszy blok zostaje :first-child (bez linii i odstępu nad nagłówkiem). */}
      <StronaJsonLd sciezka="/press" />
    </main>
  );
}
