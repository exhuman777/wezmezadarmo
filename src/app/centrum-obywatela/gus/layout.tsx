import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';

export const metadata = metadaneStrony('/centrum-obywatela/gus');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StronaJsonLd sciezka="/centrum-obywatela/gus" />
      {children}
    </>
  );
}
