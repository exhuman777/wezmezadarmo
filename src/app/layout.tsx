import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf7f2',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'https://wezmezadarmo.vercel.app'),
  title: 'wezmezadarmo -- Sprawdź co Ci się należy',
  description: 'Odkryj świadczenia rządowe, na które się kwalifikujesz. Darmowe badania, zasiłki, ulgi podatkowe -- wszystko w jednym miejscu.',
  openGraph: {
    title: 'wezmezadarmo -- Sprawdź co Ci się należy',
    description: 'Zasiłki, ulgi, dotacje, darmowe badania -- sprawdź w 2 minuty co Ci się należy od państwa.',
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
