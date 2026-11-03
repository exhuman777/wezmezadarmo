import { metadaneNarzedzia, StronaNarzedzia } from '../strona-narzedzia';

export const metadata = metadaneNarzedzia('jpk');

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default function Page({ searchParams }: Props) {
  return <StronaNarzedzia slug="jpk" searchParams={searchParams} />;
}
