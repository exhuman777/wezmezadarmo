import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { metadaneStrony } from '@/lib/strony';
import { COOKIE_DOSTEP, sprawdzDostep } from '@/lib/narzedzia/dostep';
import { narzedzie, type Narzedzie } from '@/lib/narzedzia/lista';
import { bezpiecznyNext } from '@/lib/narzedzia/walidacja';
import { Bramka } from './Bramka';

/** Metadane z rejestru stron (title, opis, słowa kluczowe, canonical, OG z adresem). Obraz OG z opengraph-image.tsx w folderze narzędzia. */
export function metadaneNarzedzia(slug: Narzedzie['slug']): Metadata {
  return metadaneStrony(narzedzie(slug).adres);
}

/** Dokąd prowadzi formularz: ścieżka z middleware (np. podstrona narzędzia) albo domyślne narzędzie. */
export function celPoFormularzu(n: Narzedzie, next: string | undefined): string {
  if (!next) return n.cel;
  const bezp = bezpiecznyNext(next);
  return bezp === n.prefiks || bezp.startsWith(`${n.prefiks}/`) ? bezp : n.cel;
}

/** Strona statycznego narzędzia (KPiR, JPK): z dostępem od razu narzędzie, bez dostępu opis i formularz. */
export async function StronaNarzedzia({ slug, searchParams }: { slug: 'kpir' | 'jpk'; searchParams: Promise<{ next?: string }> }) {
  const n = narzedzie(slug);
  const sp = await searchParams;
  const cel = celPoFormularzu(n, sp.next);
  const jar = await cookies();
  if (await sprawdzDostep(jar.get(COOKIE_DOSTEP)?.value)) redirect(cel);
  return <Bramka n={n} next={cel} />;
}
