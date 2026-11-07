import { metadaneNarzedzia, StronaNarzedzia } from '../strona-narzedzia';

export const metadata = metadaneNarzedzia('kpir');

export default function Page() {
  return <StronaNarzedzia slug="kpir" />;
}
