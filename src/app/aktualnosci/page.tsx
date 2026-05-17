import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchAllFeeds, FEEDS } from './rss';
import FeedClient from './FeedClient';

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
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[13px] text-accent hover:underline mb-6 inline-block font-mono">
          &larr; wezmezadarmo.com
        </Link>

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

        {/* Client component with all data */}
        <FeedClient
          items={items}
          active={active}
          failed={failed}
          fetchedAt={new Date().toISOString()}
        />
      </div>
    </div>
  );
}
