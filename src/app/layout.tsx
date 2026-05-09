import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'wezmezadarmo -- Sprawdz co Ci sie nalezy',
  description: 'Odkryj swiadczenia rzadowe, na ktore sie kwalifikujesz. Darmowe badania, zasilki, ulgi podatkowe -- wszystko w jednym miejscu.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
