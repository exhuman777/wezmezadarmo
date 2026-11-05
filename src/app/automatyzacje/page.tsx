import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import AutomatyzacjePage from './AutomatyzacjePage';

export const metadata = metadaneStrony('/automatyzacje');

export default function Page() {
  return (
    <>
      <StronaJsonLd sciezka="/automatyzacje" />
      <AutomatyzacjePage />
    </>
  );
}
