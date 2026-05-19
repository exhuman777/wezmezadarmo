import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { CookieConsent } from '@/components/CookieConsent';
import { SiteNav } from '@/components/SiteNav';
import { SiteFooter } from '@/components/SiteFooter';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-57R2TFXNH7';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f0f6f1',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'https://wezmezadarmo.vercel.app'),
  title: 'wezmezadarmo - Sprawdź co Ci się należy',
  description: 'Odkryj świadczenia rządowe, na które się kwalifikujesz. Darmowe badania, zasiłki, ulgi podatkowe - wszystko w jednym miejscu.',
  openGraph: {
    title: 'wezmezadarmo - Sprawdź co Ci się należy',
    description: 'Zasiłki, ulgi, dotacje, darmowe badania - sprawdź w 2 minuty co Ci się należy od państwa.',
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
        {/* Anti-flicker: apply saved dark theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
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
        <SiteNav />
        {children}
        <SiteFooter />
        <CookieConsent />
      </body>
    </html>
  );
}
