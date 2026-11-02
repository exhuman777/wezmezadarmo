import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_DOSTEP, sprawdzDostep } from '@/lib/narzedzia/dostep';
import PanelDotacjePage from '@/app/panel/dotacje/page';

export const metadata: Metadata = {
  title: 'Dofinansowania po NIP | wezmezadarmo',
  robots: { index: false, follow: false },
};

/** Sprawdzenie dofinansowań po NIP bez konta: dostęp po potwierdzeniu e-maila (jak pozostałe narzędzia). */
export default async function DofinansowaniaPage() {
  const jar = await cookies();
  if (!(await sprawdzDostep(jar.get(COOKIE_DOSTEP)?.value))) redirect('/dla-firm/narzedzia?wymagany=1');
  return <PanelDotacjePage />;
}
