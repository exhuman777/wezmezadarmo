import { cookies } from 'next/headers';
import { COOKIE_DOSTEP, sprawdzDostep } from '@/lib/narzedzia/dostep';
import { narzedzie } from '@/lib/narzedzia/lista';
import PanelDotacjePage from '@/app/panel/dotacje/page';
import { metadaneNarzedzia } from '../strona-narzedzia';
import { Bramka } from '../Bramka';

export const metadata = metadaneNarzedzia('dofinansowania');

/** Dofinansowania po NIP bez konta: z dostępem od razu wyszukiwarka, bez dostępu opis i formularz. */
export default async function DofinansowaniaPage() {
  const jar = await cookies();
  if (!(await sprawdzDostep(jar.get(COOKIE_DOSTEP)?.value))) {
    const n = narzedzie('dofinansowania');
    return <Bramka n={n} next={n.cel} />;
  }
  return <PanelDotacjePage />;
}
