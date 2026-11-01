import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CookieConsent } from '@/components/CookieConsent';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import { WebSiteJsonLd, OrganizationJsonLd } from '@/components/JsonLd';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-57R2TFXNH7';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f6f0e4',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Jakie świadczenia mi się należą? Kalkulator świadczeń 2026 | wezmezadarmo',
  description: 'Bezpłatny kalkulator świadczeń 2026: sprawdź w 2 minuty, jakie zasiłki, ulgi podatkowe, dopłaty i darmowe badania Ci się należą. Bez logowania, ze źródłami urzędowymi.',
  applicationName: 'wezmezadarmo',
  appleWebApp: {
    capable: true,
    title: 'wezmezadarmo',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'Jakie świadczenia mi się należą? Kalkulator świadczeń 2026',
    description: 'Zasiłki, ulgi, dotacje, darmowe badania. Sprawdź w 2 minuty, co Ci się należy od państwa.',
    siteName: 'wezmezadarmo',
    locale: 'pl_PL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jakie świadczenia mi się należą? Kalkulator świadczeń 2026',
    description: 'Zasiłki, ulgi, dotacje, darmowe badania. Sprawdź w 2 minuty, co Ci się należy od państwa. Bezpłatnie.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Force light mode -- whitelabel v2 is light-only; clear any stale dark preference */}
        <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.classList.remove('dark');localStorage.removeItem('theme')}catch(e){}` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {GA_ID && (
          <>
            <Script id="ga-consent-default" strategy="beforeInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{'analytics_storage':'denied'});`}
            </Script>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});if(typeof localStorage!=='undefined'&&localStorage.getItem('wzd_cookie_consent')==='accepted'){gtag('consent','update',{'analytics_storage':'granted'});}`}
            </Script>
          </>
        )}
      </head>
      <body>
        <WebSiteJsonLd />
        <OrganizationJsonLd />
        <SiteNav />
        {children}
        <SiteFooter />
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
