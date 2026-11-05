import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';

export const metadata = metadaneStrony('/wnioski/zus-zas53');

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StronaJsonLd sciezka="/wnioski/zus-zas53" />
      {children}
    </>
  );
}
