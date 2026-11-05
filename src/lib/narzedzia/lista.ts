/** Narzędzia dla firm: stałe adresy do linkowania (mail, LinkedIn) i miejsca, do których prowadzą po formularzu. */

export interface Narzedzie {
  slug: 'kpir' | 'jpk' | 'dofinansowania';
  /** Adres do wklejania w maila i na LinkedIn. */
  adres: string;
  /** Właściwe narzędzie (po formularzu albo z ciasteczkiem). */
  cel: string;
  /** Ścieżki tego narzędzia (podstrony też), do których wolno wrócić po formularzu. */
  prefiks: string;
  nazwa: string;
  /** 1-2 zdania nad formularzem. */
  opis: string;
  /** Tytuł bez dopisku marki (dopisek dodaje metadaneStrony). */
  title: string;
  description: string;
}

export const NARZEDZIA: Narzedzie[] = [
  {
    slug: 'kpir',
    adres: '/dla-firm/narzedzia/kpir',
    cel: '/narzedzia/kpir/kpir/',
    prefiks: '/narzedzia/kpir',
    nazwa: 'Przegląd księgi KPiR',
    opis: 'Wgrywasz księgę (PDF z Optimy, JPK_PKPIR, XLSX albo CSV) i widzisz kondycję firmy, wpisy do sprawdzenia, zaliczki PIT i zdrowotną oraz porównanie form opodatkowania na 2027. Plik czyta tylko Twoja przeglądarka.',
    title: 'Przegląd księgi KPiR za darmo',
    description: 'Wgraj KPiR (PDF z Optimy, JPK_PKPIR, XLSX, CSV): wpisy do sprawdzenia, zaliczki PIT i zdrowotna oraz formy opodatkowania na 2027. Za darmo, bez konta.',
  },
  {
    slug: 'jpk',
    adres: '/dla-firm/narzedzia/jpk',
    cel: '/narzedzia/jpk/',
    prefiks: '/narzedzia/jpk',
    nazwa: 'Przegląd JPK_V7 przed 2027',
    opis: 'Wgrywasz plik JPK_V7M albo JPK_V7K (opcjonalnie faktury FA(3) z KSeF) i dostajesz listę pozycji do wyjaśnienia oraz kalendarz zmian do 2028. Plik czyta tylko Twoja przeglądarka.',
    title: 'Przegląd pliku JPK_V7 przed 2027 za darmo',
    description: 'Wgraj JPK_V7M albo JPK_V7K i dostań listę pozycji do wyjaśnienia oraz kalendarz zmian do 2028. Za darmo, bez konta, plik zostaje w Twojej przeglądarce.',
  },
  {
    slug: 'dofinansowania',
    adres: '/dla-firm/narzedzia/dofinansowania',
    cel: '/dla-firm/narzedzia/dofinansowania',
    prefiks: '/dla-firm/narzedzia/dofinansowania',
    nazwa: 'Dofinansowania po NIP',
    opis: 'Wpisujesz NIP, pobieramy dane firmy z CEIDG i dopasowujemy programy dofinansowań z naszej bazy.',
    title: 'Dofinansowania dla firmy po NIP za darmo',
    description: 'Wpisz NIP: pobieramy dane firmy z CEIDG (PKD, województwo) i dopasowujemy programy dofinansowań z bazy wezmezadarmo. Za darmo, bez konta.',
  },
];

export function narzedzie(slug: Narzedzie['slug']): Narzedzie {
  const n = NARZEDZIA.find((x) => x.slug === slug);
  if (!n) throw new Error(`brak narzędzia ${slug}`);
  return n;
}

/** Ścieżka statycznego narzędzia (/narzedzia/...) → strona z opisem i formularzem. */
export function bramkaDla(sciezka: string): string {
  const n = NARZEDZIA.find((x) => x.prefiks.startsWith('/narzedzia/') && (sciezka === x.prefiks || sciezka.startsWith(`${x.prefiks}/`)));
  return n ? n.adres : '/dla-firm/narzedzia';
}
