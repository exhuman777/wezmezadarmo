/**
 * Wycinek slownika PKD 2007 - najczestsze kody dla MSP/JDG.
 * Pelna lista: ~3000 kodow, zrodlo: stat.gov.pl/Klasyfikacje/doc/pkd_07/pdf/pkd_07.pdf
 * Tu trzymamy ~250 najpopularniejszych + grupowanie po sekcjach.
 */

export interface PkdInfo {
  code: string;        // np. "62.01.Z"
  name: string;        // krotki opis
  section: PkdSection; // sekcja (literka)
}

export type PkdSection =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'
  | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U';

export const PKD_SECTIONS: Record<PkdSection, string> = {
  A: 'Rolnictwo, leśnictwo, łowiectwo, rybactwo',
  B: 'Górnictwo i wydobywanie',
  C: 'Przetwórstwo przemysłowe',
  D: 'Wytwarzanie i zaopatrywanie w energię',
  E: 'Dostawa wody, gospodarowanie ściekami i odpadami',
  F: 'Budownictwo',
  G: 'Handel hurtowy i detaliczny, naprawa pojazdów',
  H: 'Transport i gospodarka magazynowa',
  I: 'Hotelarstwo i gastronomia',
  J: 'Informacja i komunikacja',
  K: 'Działalność finansowa i ubezpieczeniowa',
  L: 'Działalność związana z obsługą rynku nieruchomości',
  M: 'Działalność profesjonalna, naukowa i techniczna',
  N: 'Działalność administracyjna i usługi wspierające',
  O: 'Administracja publiczna i obrona narodowa',
  P: 'Edukacja',
  Q: 'Opieka zdrowotna i pomoc społeczna',
  R: 'Działalność związana z kulturą, rozrywką i rekreacją',
  S: 'Pozostała działalność usługowa',
  T: 'Gospodarstwa domowe zatrudniające pracowników',
  U: 'Organizacje i zespoły eksterytorialne',
};

// Najczestsze kody PKD - prefix 2-cyfrowy + dokladne sub-kody dla popularnych
export const PKD_CODES: Record<string, { name: string; section: PkdSection }> = {
  // A - Rolnictwo
  '01': { name: 'Uprawy rolne, chów i hodowla zwierząt, łowiectwo', section: 'A' },
  '02': { name: 'Leśnictwo i pozyskiwanie drewna', section: 'A' },
  '03': { name: 'Rybactwo', section: 'A' },

  // C - Produkcja
  '10': { name: 'Produkcja artykułów spożywczych', section: 'C' },
  '11': { name: 'Produkcja napojów', section: 'C' },
  '13': { name: 'Produkcja wyrobów tekstylnych', section: 'C' },
  '14': { name: 'Produkcja odzieży', section: 'C' },
  '15': { name: 'Produkcja skór i wyrobów ze skór wyprawionych', section: 'C' },
  '16': { name: 'Produkcja wyrobów z drewna', section: 'C' },
  '17': { name: 'Produkcja papieru', section: 'C' },
  '18': { name: 'Poligrafia i reprodukcja zapisanych nośników', section: 'C' },
  '20': { name: 'Produkcja chemikaliów', section: 'C' },
  '21': { name: 'Produkcja wyrobów farmaceutycznych', section: 'C' },
  '22': { name: 'Produkcja wyrobów z gumy i tworzyw sztucznych', section: 'C' },
  '23': { name: 'Produkcja wyrobów z mineralnych surowców niemetalicznych', section: 'C' },
  '24': { name: 'Produkcja metali', section: 'C' },
  '25': { name: 'Produkcja metalowych wyrobów gotowych', section: 'C' },
  '26': { name: 'Produkcja komputerów, wyrobów elektronicznych i optycznych', section: 'C' },
  '27': { name: 'Produkcja urządzeń elektrycznych', section: 'C' },
  '28': { name: 'Produkcja maszyn i urządzeń', section: 'C' },
  '29': { name: 'Produkcja pojazdów samochodowych', section: 'C' },
  '30': { name: 'Produkcja pozostałego sprzętu transportowego', section: 'C' },
  '31': { name: 'Produkcja mebli', section: 'C' },
  '32': { name: 'Pozostała produkcja wyrobów', section: 'C' },
  '33': { name: 'Naprawa, konserwacja i instalowanie maszyn i urządzeń', section: 'C' },

  // D - Energia
  '35': { name: 'Wytwarzanie i zaopatrywanie w energię, gaz, parę wodną', section: 'D' },

  // E - Woda/ścieki
  '36': { name: 'Pobór, uzdatnianie i dostarczanie wody', section: 'E' },
  '37': { name: 'Odprowadzanie i oczyszczanie ścieków', section: 'E' },
  '38': { name: 'Działalność związana ze zbieraniem i przetwarzaniem odpadów', section: 'E' },

  // F - Budownictwo
  '41': { name: 'Roboty budowlane związane ze wznoszeniem budynków', section: 'F' },
  '42': { name: 'Roboty związane z budową obiektów inżynierii lądowej', section: 'F' },
  '43': { name: 'Roboty budowlane specjalistyczne', section: 'F' },

  // G - Handel
  '45': { name: 'Handel hurtowy i detaliczny pojazdami samochodowymi', section: 'G' },
  '46': { name: 'Handel hurtowy, z wyłączeniem pojazdów', section: 'G' },
  '47': { name: 'Handel detaliczny, z wyłączeniem pojazdów', section: 'G' },

  // H - Transport
  '49': { name: 'Transport lądowy oraz rurociągowy', section: 'H' },
  '50': { name: 'Transport wodny', section: 'H' },
  '51': { name: 'Transport lotniczy', section: 'H' },
  '52': { name: 'Magazynowanie i działalność wspierająca transport', section: 'H' },
  '53': { name: 'Działalność pocztowa i kurierska', section: 'H' },

  // I - Hotelarstwo, gastronomia
  '55': { name: 'Zakwaterowanie (hotele, pensjonaty)', section: 'I' },
  '56': { name: 'Gastronomia (restauracje, catering, bary)', section: 'I' },

  // J - Informatyka, telekomunikacja
  '58': { name: 'Wydawanie książek, czasopism, oprogramowania', section: 'J' },
  '59': { name: 'Produkcja filmów, nagrań video i dźwiękowych', section: 'J' },
  '60': { name: 'Nadawanie programów radiowych i telewizyjnych', section: 'J' },
  '61': { name: 'Telekomunikacja', section: 'J' },
  '62': { name: 'Oprogramowanie i doradztwo informatyczne', section: 'J' },
  '63': { name: 'Działalność usługowa w zakresie informacji', section: 'J' },

  // K - Finanse
  '64': { name: 'Finansowe usługi, z wyłączeniem ubezpieczeń', section: 'K' },
  '65': { name: 'Ubezpieczenia, reasekuracja i fundusze emerytalne', section: 'K' },
  '66': { name: 'Działalność wspomagająca usługi finansowe', section: 'K' },

  // L - Nieruchomości
  '68': { name: 'Działalność związana z obsługą rynku nieruchomości', section: 'L' },

  // M - Profesjonalna, naukowa, techniczna
  '69': { name: 'Prawnicza i rachunkowo-księgowa, doradztwo podatkowe', section: 'M' },
  '70': { name: 'Działalność firm centralnych, doradztwo zarządcze', section: 'M' },
  '71': { name: 'Architektura, inżynieria, badania techniczne', section: 'M' },
  '72': { name: 'Badania naukowe i prace rozwojowe', section: 'M' },
  '73': { name: 'Reklama, badanie rynku i opinii publicznej', section: 'M' },
  '74': { name: 'Pozostała działalność profesjonalna (fotograficzna, tłumaczenia)', section: 'M' },
  '75': { name: 'Działalność weterynaryjna', section: 'M' },

  // N - Administracja, wsparcie
  '77': { name: 'Wynajem i dzierżawa (samochody, sprzęt, wyposażenie)', section: 'N' },
  '78': { name: 'Działalność związana z zatrudnieniem (agencje pracy)', section: 'N' },
  '79': { name: 'Organizacja turystyki, rezerwacji (biura podróży)', section: 'N' },
  '80': { name: 'Ochrona osób i mienia, działalność detektywistyczna', section: 'N' },
  '81': { name: 'Utrzymanie porządku w budynkach, zagospodarowanie terenów', section: 'N' },
  '82': { name: 'Administracyjna obsługa biura (sekretariat, telemarketing)', section: 'N' },

  // P - Edukacja
  '85': { name: 'Edukacja (szkoły, kursy, szkolenia)', section: 'P' },

  // Q - Zdrowie, pomoc społeczna
  '86': { name: 'Opieka zdrowotna (praktyka lekarska, szpitale)', section: 'Q' },
  '87': { name: 'Pomoc społeczna z zakwaterowaniem (domy opieki)', section: 'Q' },
  '88': { name: 'Pomoc społeczna bez zakwaterowania (opieka dzienna)', section: 'Q' },

  // R - Kultura, rozrywka
  '90': { name: 'Działalność twórcza, artystyczna i rozrywkowa', section: 'R' },
  '91': { name: 'Biblioteki, archiwa, muzea, ogrody zoologiczne', section: 'R' },
  '92': { name: 'Gry losowe i zakłady wzajemne', section: 'R' },
  '93': { name: 'Sport, rozrywka i rekreacja', section: 'R' },

  // S - Pozostałe usługi
  '94': { name: 'Organizacje członkowskie (związki, stowarzyszenia)', section: 'S' },
  '95': { name: 'Naprawa komputerów, sprzętu RTV/AGD, artykułów gospodarstwa domowego', section: 'S' },
  '96': { name: 'Pozostała indywidualna działalność usługowa (fryzjerstwo, pranie)', section: 'S' },
};

// Subkody - rozszerzenie dla najczestszych
export const PKD_SUBCODES: Record<string, string> = {
  '01.13.Z': 'Uprawa warzyw, melonów, korzeni i bulw',
  '47.11.Z': 'Sprzedaż detaliczna prowadzona w sklepach z przewagą żywności',
  '47.91.Z': 'Sprzedaż detaliczna prowadzona przez Internet',
  '49.41.Z': 'Transport drogowy towarów',
  '55.10.Z': 'Hotele i podobne obiekty zakwaterowania',
  '55.20.Z': 'Obiekty noclegowe turystyczne i miejsca krótkotrwałego zakwaterowania',
  '56.10.A': 'Restauracje i inne stałe placówki gastronomiczne',
  '56.10.B': 'Ruchome placówki gastronomiczne (food trucki)',
  '56.30.Z': 'Przygotowywanie i podawanie napojów (bary, kawiarnie)',
  '58.21.Z': 'Działalność wydawnicza w zakresie gier komputerowych',
  '58.29.Z': 'Działalność wydawnicza w zakresie pozostałego oprogramowania',
  '62.01.Z': 'Działalność związana z oprogramowaniem',
  '62.02.Z': 'Działalność związana z doradztwem informatycznym',
  '62.03.Z': 'Zarządzanie urządzeniami informatycznymi',
  '62.09.Z': 'Pozostała działalność usługowa w zakresie technologii informatycznych',
  '63.11.Z': 'Przetwarzanie danych, zarządzanie stronami internetowymi (hosting)',
  '63.12.Z': 'Działalność portali internetowych',
  '68.20.Z': 'Wynajem i zarządzanie nieruchomościami własnymi lub dzierżawionymi',
  '68.31.Z': 'Pośrednictwo w obrocie nieruchomościami',
  '69.10.Z': 'Działalność prawnicza',
  '69.20.Z': 'Działalność rachunkowo-księgowa, doradztwo podatkowe',
  '70.21.Z': 'Stosunki międzyludzkie (public relations) i komunikacja',
  '70.22.Z': 'Doradztwo gospodarcze i zarządcze',
  '71.11.Z': 'Działalność w zakresie architektury',
  '71.12.Z': 'Działalność w zakresie inżynierii i doradztwo techniczne',
  '73.11.Z': 'Działalność agencji reklamowych',
  '73.12.A': 'Pośrednictwo w sprzedaży czasu i miejsca na cele reklamowe (Internet)',
  '74.10.Z': 'Działalność w zakresie specjalistycznego projektowania',
  '74.20.Z': 'Działalność fotograficzna',
  '74.30.Z': 'Działalność tłumaczy',
  '85.51.Z': 'Pozaszkolne formy edukacji sportowej',
  '85.52.Z': 'Pozaszkolne formy edukacji artystycznej',
  '85.59.B': 'Pozostałe pozaszkolne formy edukacji, gdzie indziej niesklasyfikowane',
  '86.21.Z': 'Praktyka lekarska ogólna',
  '86.22.Z': 'Praktyka lekarska specjalistyczna',
  '86.23.Z': 'Praktyka lekarska dentystyczna',
  '86.90.A': 'Działalność fizjoterapeutyczna',
  '86.90.E': 'Pozostała działalność w zakresie opieki zdrowotnej',
  '93.13.Z': 'Działalność obiektów służących poprawie kondycji fizycznej (siłownie)',
  '93.29.Z': 'Pozostała działalność rozrywkowa i rekreacyjna',
  '95.11.Z': 'Naprawa i konserwacja komputerów i urządzeń peryferyjnych',
  '96.02.Z': 'Fryzjerstwo i pozostałe zabiegi kosmetyczne',
};

/**
 * Pobierz opis PKD. Priorytet: dokladny subkod -> 2-cyfrowy dzial -> null.
 */
export function getPkdName(code: string): string | null {
  if (!code) return null;
  const clean = code.trim().toUpperCase();
  // Dokladny subkod (np. 62.01.Z)
  if (PKD_SUBCODES[clean]) return PKD_SUBCODES[clean];
  // 2-cyfrowy dzial (np. 62)
  const prefix = clean.slice(0, 2);
  if (PKD_CODES[prefix]) return PKD_CODES[prefix].name;
  return null;
}

/**
 * Pobierz sekcje PKD (literka A-U) dla kodu.
 */
export function getPkdSection(code: string): PkdSection | null {
  if (!code) return null;
  const prefix = code.trim().slice(0, 2);
  return PKD_CODES[prefix]?.section ?? null;
}

/**
 * Z listy kodow PKD wybierz najczestsza sekcja - daje "branze" firmy.
 */
export function dominantSection(codes: string[]): { section: PkdSection; label: string } | null {
  if (!codes.length) return null;
  const counts = new Map<PkdSection, number>();
  for (const c of codes) {
    const s = getPkdSection(c);
    if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  let best: { section: PkdSection; n: number } | null = null;
  for (const [s, n] of counts) {
    if (!best || n > best.n) best = { section: s, n };
  }
  return best ? { section: best.section, label: PKD_SECTIONS[best.section] } : null;
}
