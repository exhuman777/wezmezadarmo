import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Otwarte API bazy świadczeń dla firm, NGO i instytucji | wezmezadarmo',
  description:
    'Bezpłatne, otwarte REST API z bazą 118 zweryfikowanych polskich świadczeń socjalnych, ulg i dotacji. Dla firm, organizacji pozarządowych, pracowników socjalnych i instytucji wspierających obywateli. Prywatność wbudowana, bez przechowywania danych.',
};

export default function DlaFirmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
