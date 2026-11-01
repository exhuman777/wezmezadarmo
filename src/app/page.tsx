import type { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import Home from './strona-glowna';

// Strona główna jest komponentem klienta (strona-glowna.tsx), więc canonical ustawiamy tutaj.
export const metadata: Metadata = { alternates: canonical('/') };

export default function Page() {
  return <Home />;
}
