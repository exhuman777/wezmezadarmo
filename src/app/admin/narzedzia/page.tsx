import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { magazyn, type Lead } from '@/lib/narzedzia/leady';

export const metadata: Metadata = {
  title: 'Admin: leady narzędzi dla firm | wezmezadarmo',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

/** Druga linia obrony (pierwsza: Basic Auth w middleware). Brak ADMIN_PASSWORD = strona wyłączona. */
async function wymagajAdmina(): Promise<void> {
  const haslo = process.env.ADMIN_PASSWORD;
  if (!haslo) notFound();
  const auth = (await headers()).get('authorization');
  if (!auth?.startsWith('Basic ')) notFound();
  try {
    const dec = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    if (dec.slice(dec.indexOf(':') + 1) !== haslo) notFound();
  } catch {
    notFound();
  }
}

const data = (s: string | null) => (s ? new Date(s).toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }) : '-');

export default async function LeadyNarzedziaPage() {
  await wymagajAdmina();
  let leady: Lead[] = [];
  let blad = false;
  try {
    leady = await magazyn().lista(500);
  } catch {
    blad = true;
  }
  const potwierdzone = leady.filter((l) => l.potwierdzony_at).length;

  return (
    <main className="prosta" style={{ maxWidth: 1000 }}>
      <h1>Leady: narzędzia dla firm</h1>
      <p className="pod">Wszystkich: {leady.length}, potwierdzonych: {potwierdzone}.</p>
      {blad && <p role="alert">Nie udało się pobrać leadów (sprawdź tabelę leady_narzedzia i klucz service role).</p>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>{['E-mail', 'Imię', 'Telefon', 'Zapis', 'Potwierdzony'].map((h) => <th key={h} style={{ textAlign: 'left', borderBottom: '2px solid var(--tusz)', padding: '8px 6px' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {leady.map((l) => (
              <tr key={l.id}>
                <td style={{ borderBottom: '1px solid var(--linia)', padding: '8px 6px' }}>{l.email}</td>
                <td style={{ borderBottom: '1px solid var(--linia)', padding: '8px 6px' }}>{l.imie ?? '-'}</td>
                <td style={{ borderBottom: '1px solid var(--linia)', padding: '8px 6px' }}>{l.telefon ?? '-'}</td>
                <td style={{ borderBottom: '1px solid var(--linia)', padding: '8px 6px' }}>{data(l.created_at)}</td>
                <td style={{ borderBottom: '1px solid var(--linia)', padding: '8px 6px' }}>{data(l.potwierdzony_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
