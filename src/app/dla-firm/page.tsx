import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import DlaFirm from './DlaFirm';

// Treść jest komponentem klienta (DlaFirm.tsx), więc metadane i JSON-LD są tutaj, a nie w layout
// (layout obejmowałby też /dla-firm/narzedzia/*).
export const metadata = metadaneStrony('/dla-firm');

export default function Page() {
  return (
    <>
      <StronaJsonLd sciezka="/dla-firm" />
      <DlaFirm />
    </>
  );
}
