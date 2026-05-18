import type { Metadata } from 'next';
import { fetchAllFeeds, FEEDS } from './rss';
import FeedClient from './FeedClient';
import { SiteHeader } from '@/components/SiteHeader';
import Link from 'next/link';

// Revalidate every 30 minutes -- ISR
export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'Aktualności z polskich instytucji | wezmezadarmo',
  description:
    'ZUS, GUS, NBP, UOKiK, Fundusze EU, NFZ, Sejm i ARiMR w jednym miejscu. Filtruj po profilu: JDG, firma lub obywatel.',
  openGraph: {
    title: 'Aktualności rządowe dla JDG, firm i obywateli',
    description:
      'Agregator RSS z 8 polskich instytucji rządowych. Filtruj po profilu: JDG, firma lub wszyscy.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default async function AktualnosciPage() {
  const { items, active, failed } = await fetchAllFeeds();

  return (
    <div className="min-h-screen bg-bg-0">
      <SiteHeader />
      <div className="py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="font-mono text-[11px] tracking-widest text-text-3 uppercase mb-3">
            Agregator RSS
          </div>
          <h1 className="text-[24px] sm:text-[30px] font-bold text-text-1 mb-3 leading-tight">
            Aktualności z polskich instytucji
          </h1>
          <p className="text-[14px] sm:text-[15px] text-text-2 leading-relaxed mb-5">
            ZUS, GUS, NBP, UOKiK, Fundusze EU, e-Zdrowie, Sejm, ARiMR -- wszystko w jednym miejscu,
            dopasowane do Twojego profilu. Strona odświeżana co 30 minut.
          </p>

          {/* Source legend */}
          <div className="flex flex-wrap gap-2">
            {FEEDS.map(f => (
              <span
                key={f.id}
                title={f.fullName}
                className={`font-mono text-[10px] px-2 py-1 rounded tracking-widest uppercase ${
                  active.includes(f.id) ? 'opacity-100' : 'opacity-30'
                }`}
                style={{
                  background: ({
                    zus:      '#003874',
                    gus:      '#004B8D',
                    nbp:      '#CC0000',
                    uokik:    '#1B5E20',
                    fundusze: '#6A0DAD',
                    ezdrowie: '#00695C',
                    sejm:     '#8B0000',
                    arimr:    '#4E342E',
                  } as Record<string, string>)[f.id] ?? '#333',
                  color: 'white',
                }}
              >
                {f.name}
              </span>
            ))}
          </div>
        </div>

        {/* CTA dla firm */}
        <div
          style={{
            background: 'var(--color-bg-1)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--color-text-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '6px',
            }}
          >
            Dla firm
          </p>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--color-text-2)',
              lineHeight: 1.6,
              margin: '0 0 12px',
            }}
          >
            Jesteś firmą? Zaloguj się do panelu wezmezadarmo i skonfiguruj własne kanały monitorowania.
          </p>
          <Link
            href="/dotacje/logowanie"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Przejdź do panelu --&gt;
          </Link>
        </div>

        {/* Client component with all data */}
        <FeedClient
          items={items}
          active={active}
          failed={failed}
          fetchedAt={new Date().toISOString()}
        />
      </div>
      </div>
    </div>
  );
}
