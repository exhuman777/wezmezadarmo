import Link from 'next/link';
import type { Metadata } from 'next';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';

export const metadata: Metadata = metadaneStrony('/o-projekcie');

const MODULY = [
  { href: '/', nazwa: 'Kalkulator świadczeń', opis: 'Kilka pytań i lista świadczeń z ZUS, NFZ, PFRON, KRUS i MOPS, które mogą Ci przysługiwać.' },
  { href: '/swiadczenia', nazwa: 'Baza 133 świadczeń', opis: 'Kwoty, warunki i źródło przy każdym świadczeniu.' },
  { href: '/wnioski', nazwa: 'Wnioski ZUS z pomocą AI', opis: 'Wypełniasz formularz z podpowiedziami i pobierasz PDF.' },
  { href: '/aktualnosci', nazwa: 'Aktualności', opis: 'Komunikaty urzędów i zmiany w prawie w jednym miejscu.' },
  { href: '/centrum-obywatela', nazwa: 'Centrum Obywatela', opis: 'Narzędzia z oficjalnych API: NFZ, NBP, GIOŚ, Biała Lista VAT, GUS i inne.' },
  { href: '/statystyki', nazwa: 'Polska w liczbach', opis: 'Dane publiczne z GUS, NBP i NFZ.' },
  { href: '/dotacje', nazwa: 'Dotacje dla firm', opis: 'Wyszukiwarka programów bez konta i dopasowanie po NIP.' },
  { href: '/dla-firm/narzedzia', nazwa: 'Narzędzia dla firm', opis: 'Przegląd KPiR i JPK_V7 od razu, bez konta.' },
  { href: '/blog', nazwa: 'Blog', opis: 'Poradniki o świadczeniach i największych dotacjach dla firm.' },
];

const ZRODLA = [
  'gov.pl', 'zus.pl', 'podatki.gov.pl', 'pfron.gov.pl', 'nfz.gov.pl', 'praca.gov.pl', 'nfosigw.gov.pl',
  'krus.gov.pl', 'biznes.gov.pl', 'danepubliczne.imgw.pl', 'api.sejm.gov.pl', 'bdl.stat.gov.pl', 'geoportal.arimr.gov.pl', 'portalpasazera.pl',
];

export default function OProjekciePage() {
  return (
    <main className="prosta">
      <StronaJsonLd sciezka="/o-projekcie" />
      <section className="prosta-blok">
        <p className="etykieta">O projekcie</p>
        <h1>wezmezadarmo.com</h1>
        <p className="pod">
          Darmowa strona, która pomaga sprawdzić, jakie świadczenia, ulgi i dotacje mogą Ci przysługiwać. Projekt prywatny, nie rządowy i niekomercyjny.
        </p>
        <p className="pod">Wszystko działa bez konta i logowania. E-mail i telefon podajesz tylko przy sprawdzeniu firmy po NIP.</p>
      </section>

      <section className="prosta-blok">
        <h2>Co jest w środku</h2>
        <ul className="linki">
          {MODULY.map(m => (
            <li key={m.href}>
              <Link href={m.href}>
                <span>{m.nazwa}<small>{m.opis}</small></span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Prywatność</h2>
        <ul className="lista">
          <li>Kalkulator nie pyta o PESEL i nie zapisuje Twoich odpowiedzi.</li>
          <li>PESEL jest potrzebny tylko do wniosku ZUS i zostaje w Twojej przeglądarce.</li>
          <li>Nie ma kont ani logowania. E-mail i telefon podajesz tylko przy sprawdzeniu firmy po NIP, każda zgoda na kontakt jest osobna i domyślnie odznaczona. Danych nie sprzedajemy.</li>
          <li>Asystent AI odpowiada z bazy świadczeń i podaje źródła. To program, więc ważne rzeczy sprawdź w urzędzie.</li>
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Skąd są dane</h2>
        <p>Z oficjalnych stron i API instytucji publicznych. Przy każdym świadczeniu jest link do źródła.</p>
        <p className="mala">{ZRODLA.join(' · ')}</p>
        <p className="mala">
          Widzisz nieaktualną informację? Napisz przez formularz „Napisz do nas” w stopce.
        </p>
      </section>

      <section className="prosta-blok">
        <h2>Kto robi tę stronę</h2>
        <p>
          Stronę robi tuKamil z Lublina, pro bono. Kod jest otwarty (AGPL-3.0), baza świadczeń to otwarte dane (CC-BY-4.0).
        </p>
        <ul className="linki">
          <li><a href="https://tukamil.com/wezmezadarmo/" target="_blank" rel="noopener"><span>Przewodnik po wezmezadarmo<small>Jak korzystać ze strony, na tukamil.com</small></span><span aria-hidden="true">→</span></a></li>
          <li><a href="https://tukamil.com" target="_blank" rel="noopener"><span>tukamil.com<small>Inne aplikacje i kontakt</small></span><span aria-hidden="true">→</span></a></li>
          <li><a href="https://tukamil.com/wdrozenie-ai/" target="_blank" rel="noopener"><span>Wdrożenie AI w firmie<small>Pakiet tuKamil: 4 godziny szkolenia z AI w Twojej firmie</small></span><span aria-hidden="true">→</span></a></li>
          <li><a href="https://github.com/exhuman777/wezmezadarmo" target="_blank" rel="noopener noreferrer"><span>Kod na GitHubie<small>github.com/exhuman777/wezmezadarmo</small></span><span aria-hidden="true">→</span></a></li>
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Dla firm: produkty, przy których pracuje autor</h2>
        <ul className="linki">
          <li><a href="https://doginvoice.com" target="_blank" rel="noopener"><span>DogInvoice<small>Faktury z KSeF, terminy płatności i przelewy. Widzisz, czy zapłacili Ci za fakturę.</small></span><span aria-hidden="true">→</span></a></li>
          <li><a href="https://doganswer.com" target="_blank" rel="noopener"><span>DogAnswer<small>Asystent AI odbiera telefon w firmie, także w święta.</small></span><span aria-hidden="true">→</span></a></li>
        </ul>
      </section>
    </main>
  );
}
