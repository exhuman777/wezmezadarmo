import { metadaneNarzedzia, StronaNarzedzia } from '../strona-narzedzia';

export const metadata = metadaneNarzedzia('kpir');

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default function Page({ searchParams }: Props) {
  return <StronaNarzedzia slug="kpir" searchParams={searchParams} />;
}
