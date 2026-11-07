/**
 * Sieć tuKamil: wspólny katalog aplikacji (standard z audytu spójności 6.11.2026, katalog.json).
 * Jedno źródło dla stopki „Sieć tuKamil” (src/components/SiecTuKamil.tsx) i sekcji
 * „Inne aplikacje tuKamil” w llms.txt i plikach .md (src/lib/llms.ts).
 * Nazwy, adresy, kolejność i opisy jak w katalogu; zmiana tylko razem z katalogiem.
 * Strony klientów (BNI UNIA, Domy w Jastkowie) nie należą do stopki ani do tej listy.
 */

export interface AplikacjaSieci {
  id: string;
  nazwa: string;
  adres: string;
  jednoZdanie: string;
}

/** Id tej strony w katalogu: w stopce jako aria-current bez linku, w llms.txt pominięta. */
export const TA_STRONA = 'wezmezadarmo';

export const SIEC_TUKAMIL: readonly AplikacjaSieci[] = [
  { id: 'wezmezadarmo', nazwa: 'wezmezadarmo.com', adres: 'https://www.wezmezadarmo.com/', jednoZdanie: 'Kalkulator świadczeń, ulg i dotacji, bez konta i za darmo.' },
  { id: 'yesno', nazwa: 'yesno.events', adres: 'https://yesno.events/', jednoZdanie: 'Szanse wydarzeń z rynków prognostycznych i co zmieniają w firmie.' },
  { id: 'thepolacy', nazwa: 'thePolacy', adres: 'https://thepolacy.com/', jednoZdanie: 'Muzeum kolekcji 2137 pikselowych Polaków: historia, obrazy i gra.' },
  { id: 'tukamil', nazwa: 'tuKamil', adres: 'https://tukamil.com/', jednoZdanie: 'Wdrożenie AI w firmie: agenci Claude, DogInvoice, DogAnswer, aplikacje i gry.' },
  { id: 'dwie-strony', nazwa: 'Dwie Strony', adres: 'https://dwiestrony.wezmezadarmo.com/', jednoZdanie: 'Umowa budowlana, kupno auta albo najem na dwóch telefonach.' },
  { id: 'cyfrowy-pomocnik', nazwa: 'Cyfrowy Pomocnik', adres: 'https://www.cyfrowypomocnik.com/', jednoZdanie: 'Wdrożenie agentów AI na Claude w firmie w jednej sesji.' },
  { id: 'nalezy-sie', nazwa: 'Należy się', adres: 'https://nalezysie.wezmezadarmo.com/', jednoZdanie: 'Sprawdzenie firmy po NIP i zmiany od 1 stycznia 2027.' },
  { id: 'asystent-firmy', nazwa: 'Asystent Firmy', adres: 'https://asystent24.com/', jednoZdanie: 'Czat AI na stronie firmy odpowiada klientom z wiedzy firmy.' },
  { id: 'brand-agent', nazwa: 'Brand Agent', adres: 'https://brand.cyfrowypomocnik.com/', jednoZdanie: 'Wizytówka z agentem AI, który odpowiada wyłącznie wiedzą marki.' },
  { id: 'claude-start', nazwa: 'Claude Start', adres: 'https://start.cyfrowypomocnik.com/', jednoZdanie: 'Przewodnik krok po kroku: instalacja Claude, połączenia i pierwsze polecenie.' },
  { id: 'pixelkamil', nazwa: 'pixelkamil', adres: 'https://pixel.tukamil.com/galeria/', jednoZdanie: 'Gry w pikselach, studio pixel artu, syntezator lo-fi i widżety.' },
  { id: 'doginvoice', nazwa: 'DogInvoice', adres: 'https://doginvoice.com/', jednoZdanie: 'Pilnuje faktur z KSeF i banku i mówi mailem, kto zapłacił.' },
  { id: 'doganswer', nazwa: 'DogAnswer', adres: 'https://doganswer.com/', jednoZdanie: 'Asystent głosowy AI odbiera telefon i umawia spotkania w Kalendarzu Google.' },
];

/** Pakiet marki i druku tej aplikacji na tukamil.com (dział /marka/, od 7.11.2026). */
export const MARKA_TEJ_STRONY = 'https://tukamil.com/marka/wezmezadarmo/';

/** Kontakt sieci: jedna sekcja na tukamil.com. */
export const KONTAKT_SIECI = 'https://tukamil.com/#kontakt';

/** Aplikacja z katalogu po id (opis do list na tej stronie). */
export function aplikacjaSieci(id: string): AplikacjaSieci {
  const a = SIEC_TUKAMIL.find(x => x.id === id);
  if (!a) throw new Error(`Brak aplikacji w katalogu sieci: ${id}`);
  return a;
}
