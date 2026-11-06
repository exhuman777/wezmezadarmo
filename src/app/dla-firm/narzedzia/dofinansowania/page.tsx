import { cookies } from 'next/headers';
import { COOKIE_DOSTEP, sprawdzDostep } from '@/lib/narzedzia/dostep';
import { narzedzie } from '@/lib/narzedzia/lista';
import PanelDotacjePage from '@/app/panel/dotacje/page';
import { metadaneNarzedzia } from '../strona-narzedzia';
import { Bramka } from '../Bramka';

export const metadata = metadaneNarzedzia('dofinansowania');

/** Komunikaty po kliknięciu linku z maila (/api/narzedzia/potwierdz). */
const KOMUNIKATY: Record<string, string> = {
  ok: 'Adres potwierdzony. Sprawdzenie po NIP działa na tym urządzeniu przez 30 dni.',
  wygasl: 'Link wygasł. Podaj e-mail jeszcze raz, wyślemy nowy link.',
  'zly-link': 'Ten link jest nieprawidłowy albo został już użyty. Podaj e-mail jeszcze raz, wyślemy nowy link.',
  blad: 'Coś poszło nie tak po naszej stronie. Spróbuj za chwilę.',
};

interface Props {
  searchParams: Promise<{ dostep?: string }>;
}

/** Dofinansowania po NIP: jedyne narzędzie z e-mailem. Po kliknięciu linku z maila wyszukiwarka, wcześniej opis i formularz. */
export default async function DofinansowaniaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const jar = await cookies();
  if (!(await sprawdzDostep(jar.get(COOKIE_DOSTEP)?.value))) {
    return <Bramka n={narzedzie('dofinansowania')} komunikat={sp.dostep ? KOMUNIKATY[sp.dostep] ?? null : null} />;
  }
  return <PanelDotacjePage />;
}
