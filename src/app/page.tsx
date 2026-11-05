import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import Home from './strona-glowna';

// Strona główna jest komponentem klienta (strona-glowna.tsx), więc metadane i JSON-LD są tutaj.
export const metadata = metadaneStrony('/');

export default function Page() {
  return (
    <>
      <StronaJsonLd sciezka="/" />
      <Home />
    </>
  );
}
