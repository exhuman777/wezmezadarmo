import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';

export const metadata = metadaneStrony('/centrum-obywatela/transport');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StronaJsonLd sciezka="/centrum-obywatela/transport" />
      {children}
    </>
  );
}
