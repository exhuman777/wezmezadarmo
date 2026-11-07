import { metadaneNarzedzia, StronaNarzedzia } from '../strona-narzedzia';

export const metadata = metadaneNarzedzia('jpk');

export default function Page() {
  return <StronaNarzedzia slug="jpk" />;
}
