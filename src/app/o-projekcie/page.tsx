import Link from 'next/link';
import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';

export const metadata: Metadata = {
  alternates: canonical('/o-projekcie'),
  title: 'O projekcie | wezmezadarmo',
  description: 'Po co powstał wezmezadarmo, co jest w środku, skąd są dane, jak traktujemy prywatność i kto za tym stoi.',
};

const MODULY = [
  { href: '/', nazwa: 'Kalkulator świadczeń', opis: 'Kilka pytań i lista świadczeń z ZUS, NFZ, PFRON, KRUS i MOPS, które mogą Ci przysługiwać.' },
  { href: '/swiadczenia', nazwa: 'Baza 133 świadczeń', opis: 'Kwoty, warunki i źródło przy każdym świadczeniu.' },
  { href: '/wnioski', nazwa: 'Wnioski ZUS z pomocą AI', opis: 'Wypełniasz formularz z podpowiedziami i pobierasz PDF.' },
  { href: '/aktualnosci', nazwa: 'Aktualności', opis: 'Komunikaty urzędów i zmiany w prawie w jednym miejscu.' },
  { href: '/centrum-obywatela', nazwa: 'Centrum Obywatela', opis: 'Narzędzia z oficjalnych API: NFZ, NBP, GIOŚ, Biała Lista VAT, GUS i inne.' },
  { href: '/statystyki', nazwa: 'Polska w liczbach', opis: 'Dane publiczne z GUS, NBP i NFZ.' },
  { href: '/dotacje', nazwa: 'Dotacje dla firm', opis: 'Agent śledzi nabory i pokazuje te, które pasują do firmy.' },
];

const ZRODLA = [
  'gov.pl', 'zus.pl', 'podatki.gov.pl', 'pfron.org.pl', 'nfz.gov.pl', 'praca.gov.pl', 'nfosigw.gov.pl',
  'krus.gov.pl', 'biznes.gov.pl', 'danepubliczne.imgw.pl', 'api.sejm.gov.pl', 'bdl.stat.gov.pl', 'geoportal.arimr.gov.pl', 'portalpasazera.pl',
];

export default function OProjekciePage() {
  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">O projekcie</p>
        <h1>wezmezadarmo.com</h1>
        <p className="pod">
          Darmowa strona, która pomaga sprawdzić, jakie świadczenia, ulgi i dotacje mogą Ci przysługiwać. Projekt prywatny, nie rządowy i niekomercyjny.
        </p>
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
          <li>PESEL jest potrzebny tylko do wniosku ZUS. Zapisuje się w Twojej przeglądarce, a po zalogowaniu opcjonalnie w profilu.</li>
          <li>Konto i profil są w bazie Supabase na serwerach w UE. Danych nie sprzedajemy.</li>
          <li>Asystent AI odpowiada z bazy świadczeń i podaje źródła. To program, więc ważne rzeczy sprawdź w urzędzie.</li>
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Skąd są dane</h2>
        <p>Z oficjalnych stron i API instytucji publicznych. Przy każdym świadczeniu jest link do źródła.</p>
        <p className="mala">{ZRODLA.join(' · ')}</p>
        <p className="mala">
          Widzisz nieaktualną informację? Napisz przez formularz w stopce albo na LinkedIn.
        </p>
      </section>

      <section className="prosta-blok">
        <h2>Autor</h2>
        <p>
          Projekt stworzył Kamil Sobkowicz z Lublina, pro bono. Kod jest otwarty (AGPL-3.0), baza świadczeń to otwarte dane (CC-BY-4.0).
        </p>
        <ul className="linki">
          <li><a href="https://pixel-kamil.vercel.app" target="_blank" rel="noopener"><span>pixel-kamil.vercel.app<small>Strona autora</small></span><span aria-hidden="true">→</span></a></li>
          <li><a href="https://www.linkedin.com/in/kamil-sobkowicz/" target="_blank" rel="noopener noreferrer"><span>LinkedIn<small>Zgłoszenia i kontakt</small></span><span aria-hidden="true">→</span></a></li>
          <li><a href="https://github.com/exhuman777/wezmezadarmo" target="_blank" rel="noopener noreferrer"><span>Kod na GitHubie<small>github.com/exhuman777/wezmezadarmo</small></span><span aria-hidden="true">→</span></a></li>
        </ul>
      </section>
    </main>
  );
}
