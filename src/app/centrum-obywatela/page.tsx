import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import Link from 'next/link';

export const metadata: Metadata = {
  alternates: canonical('/centrum-obywatela'),
  title: 'Centrum Obywatela - darmowe narzędzia urzędowe | wezmezadarmo',
  description: '12 narzędzi z oficjalnych polskich API: NFZ, NBP, GIOŚ, Biała Lista VAT, IMGW, ELI/Sejm, BDL GUS, ARiMR, PKP. Bez logowania.',
};

interface Tool {
  href: string;
  icon: string;
  label: string;
  desc: string;
  badge: string;
  color: string;
  audiences: string[];
}

const TOOLS: Tool[] = [
  { href: '/nfz', icon: 'N', label: 'NFZ - kolejki i lekarze', desc: 'Czasy oczekiwania, najbliższy lekarz, refundacja leków', badge: 'na żywo', color: '#1B5E20',
    audiences: ['rolnik', 'senior', 'rodzina', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/kursy', icon: 'K', label: 'Kursy walut NBP', desc: 'Aktualne kursy + konwerter na PLN', badge: 'codziennie', color: '#CC0000',
    audiences: ['firma', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/powietrze', icon: 'A', label: 'Jakość powietrza GIOŚ', desc: 'Indeks PM10/PM2.5 dla Twojej lokalizacji', badge: 'na żywo', color: '#00695C',
    audiences: ['senior', 'rodzina', 'wszyscy'] },
  { href: '/centrum-obywatela/biala-lista', icon: 'V', label: 'Biała Lista VAT', desc: 'Sprawdź kontrahenta po NIP. Status VAT, konta, KRS', badge: 'na żywo', color: '#4527A0',
    audiences: ['firma'] },
  { href: '/centrum-obywatela/pogoda', icon: 'P', label: 'Ostrzeżenia IMGW', desc: 'Ostrzeżenia meteorologiczne i hydrologiczne IMGW', badge: 'na żywo', color: '#c4841a',
    audiences: ['rolnik', 'senior', 'rodzina', 'wszyscy'] },
  { href: '/centrum-obywatela/prawo', icon: 'L', label: 'Zmiany w prawie (ELI/Sejm)', desc: 'Tracker ustaw i rozporządzeń o świadczeniach', badge: 'co 30 min', color: '#003874',
    audiences: ['senior', 'firma', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/gus', icon: 'G', label: 'Dane gminy (BDL GUS)', desc: 'Ludność, bezrobocie, wynagrodzenia w Twojej gminie', badge: 'wyszukiwarka', color: '#004B8D',
    audiences: ['rolnik', 'firma', 'wszyscy'] },
  { href: '/centrum-obywatela/dzialki', icon: 'D', label: 'Geoportal ARiMR', desc: 'Mapy działek rolnych, dopłaty bezpośrednie', badge: 'link + instrukcja', color: '#5d7c1f',
    audiences: ['rolnik'] },
  { href: '/centrum-obywatela/transport', icon: 'T', label: 'Ulgi PKP', desc: 'Tabela ulg dla studenta, seniora, KDR, niepełnosprawnych', badge: 'tabela', color: '#a01818',
    audiences: ['senior', 'student', 'rodzina'] },
  { href: '/aktualnosci', icon: 'R', label: 'Aktualności RSS', desc: 'Komunikaty urzędów i zmiany w prawie', badge: '2x/dzień', color: '#003874',
    audiences: ['firma', 'wszyscy'] },
  { href: '/swiadczenia', icon: 'S', label: 'Świadczenia i ulgi', desc: '133 świadczenia z ZUS, NFZ, PFRON, KRUS i MOPS w jednej wyszukiwarce', badge: 'baza wiedzy', color: '#2b7353',
    audiences: ['rolnik', 'senior', 'rodzina', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/polska-cyfrowa', icon: 'C', label: 'Polska cyfrowa', desc: 'e-zdrowie, ElevenLabs, wykresy: dostępność mieszkań i wzrost e-usług', badge: 'dane + wykresy', color: '#157a4f',
    audiences: ['senior', 'firma', 'student', 'wszyscy'] },
];

interface Audience {
  slug: string;
  label: string;
  marker: string;
  desc: string;
  benefit: string;
  accent: string;
}

const AUDIENCES: Audience[] = [
  {
    slug: 'rolnik',
    label: 'Rolnik (KRUS)',
    marker: '01',
    desc: 'Jeśli prowadzisz gospodarstwo i jesteś ubezpieczony w KRUS - sprawdź pogodę przed pracą polową, dane swojej gminy, mapy działek i świadczenia dla rolników.',
    benefit: 'Mniej wizyt w urzędzie, więcej czasu na pracę.',
    accent: '#5d7c1f',
  },
  {
    slug: 'senior',
    label: 'Senior i pacjent',
    marker: '02',
    desc: 'Po 60. roku życia, na emeryturze albo z przewlekłą chorobą - czas oczekiwania do specjalisty, ulgi transportowe, zmiany w prawie o emeryturach i jakość powietrza.',
    benefit: 'Wszystko co potrzebujesz przed wizytą u lekarza i podróżą.',
    accent: '#1B5E20',
  },
  {
    slug: 'rodzina',
    label: 'Rodzina z dziećmi',
    marker: '03',
    desc: 'Świadczenia rodzinne, smog dla dziecka z astmą, ulgi PKP dla Karty Dużej Rodziny i wizyty u pediatry. Wszystko czego potrzebujesz w jednym miejscu.',
    benefit: 'Mniej formalności, więcej czasu z dziećmi.',
    accent: '#c4841a',
  },
  {
    slug: 'student',
    label: 'Student',
    marker: '04',
    desc: 'Ulga studencka 51% na PKP, kolejki NFZ przy długich miesięcznych przerwach na badania, kursy walut dla stypendiów zagranicznych i tracker zmian w przepisach.',
    benefit: 'Codzienne narzędzia studenckie bez zbędnej rejestracji.',
    accent: '#4527A0',
  },
  {
    slug: 'firma',
    label: 'Przedsiębiorca / JDG',
    marker: '05',
    desc: 'Sprawdzenie kontrahenta na Białej Liście VAT, kursy NBP do faktur zagranicznych, dane GUS o rynku w Twojej gminie i monitoring zmian w przepisach podatkowych.',
    benefit: 'Solidarna odpowiedzialność za VAT i ryzyko - pod kontrolą.',
    accent: '#003874',
  },
  {
    slug: 'wszyscy',
    label: 'Wszyscy obywatele',
    marker: '06',
    desc: 'Baza 133 świadczeń, codzienne aktualności rządowe, kursy walut, jakość powietrza, tracker zmian w prawie - narzędzia dla każdego, niezależnie od sytuacji.',
    benefit: 'Najczęściej używane narzędzia w jednym miejscu.',
    accent: '#2b7353',
  },
];

const SOURCES = [
  { name: 'api.nfz.gov.pl', purpose: 'kolejki, lekarze, refundacja' },
  { name: 'api.nbp.pl', purpose: 'kursy walut Tabela A' },
  { name: 'api.gios.gov.pl', purpose: 'indeks powietrza PM10/PM2.5' },
  { name: 'wl-api.mf.gov.pl', purpose: 'Biała Lista VAT' },
  { name: 'danepubliczne.imgw.pl', purpose: 'ostrzeżenia meteo i hydrologiczne' },
  { name: 'api.sejm.gov.pl/eli', purpose: 'zmiany w przepisach' },
  { name: 'bdl.stat.gov.pl', purpose: 'dane demograficzne GUS' },
  { name: 'geoportal.arimr.gov.pl', purpose: 'mapy działek rolnych' },
  { name: 'portalpasazera.pl', purpose: 'rozkład i ulgi PKP' },
];

export default function CentrumObywatelaPage() {
  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Centrum Obywatela</p>
        <h1>Narzędzia z danych urzędowych</h1>
        <p className="pod">Kolejki NFZ, kursy NBP, powietrze, Biała Lista VAT, zmiany w prawie. Wszystko z oficjalnych API, bez logowania.</p>
      </section>

      <section className="prosta-blok">
        <h2>Narzędzia</h2>
        <ul className="linki">
          {TOOLS.map(t => (
            <li key={t.href}>
              <Link href={t.href}>
                <span>{t.label}<small>{t.desc}</small></span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Dla kogo co</h2>
        <ul className="lista">
          {AUDIENCES.map(aud => {
            const tools = TOOLS.filter(t => t.audiences.includes(aud.slug));
            return (
              <li key={aud.slug}>
                <b>{aud.label}:</b>{' '}
                {tools.map((t, i) => (
                  <span key={t.href}>{i > 0 ? ', ' : ''}<Link href={t.href}>{t.label}</Link></span>
                ))}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Źródła</h2>
        <p className="pod">Dane pobieramy na żądanie i niczego nie przechowujemy.</p>
        <ul className="lista">
          {SOURCES.map(src => (
            <li key={src.name}><b>{src.name}</b> {src.purpose}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
