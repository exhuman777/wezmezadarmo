import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0806',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'https://wezmezadarmo.vercel.app'),
  title: 'wezmezadarmo -- Sprawdz co Ci sie nalezy',
  description: 'Odkryj swiadczenia rzadowe, na ktore sie kwalifikujesz. Darmowe badania, zasilki, ulgi podatkowe -- wszystko w jednym miejscu.',
  openGraph: {
    title: 'wezmezadarmo -- Sprawdz co Ci sie nalezy',
    description: 'Zasilki, ulgi, dotacje, darmowe badania -- sprawdz w 2 minuty co Ci sie nalezy od panstwa.',
    siteName: 'wezmezadarmo',
    locale: 'pl_PL',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
