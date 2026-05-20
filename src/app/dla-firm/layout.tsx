import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Automatyzacje i API dla firm | wezmezadarmo.com',
  description:
    'Gotowe automatyzacje procesów firmowych plus baza 117 polskich świadczeń socjalnych jako REST API. KSeF, faktury, raporty ZUS, monitoring dotacji.',
};

export default function DlaFirmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
