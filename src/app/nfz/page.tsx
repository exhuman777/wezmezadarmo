import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import NFZSearchClient from './NFZSearchClient';

export const metadata = metadaneStrony('/nfz');

export default function NFZPage() {
  return (
    <>
      <StronaJsonLd sciezka="/nfz" />
      <NFZSearchClient />
    </>
  );
}
