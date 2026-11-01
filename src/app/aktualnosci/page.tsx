import type { Metadata } from 'next';
import { canonical, OG_IMAGES } from '@/lib/seo';
import { fetchAllWithCache, FEEDS } from './rss';
import FeedClient from './FeedClient';
import Link from 'next/link';
import { AirQualityWidget } from '@/components/AirQualityWidget';
import { NbpRatesWidget } from '@/components/NbpRatesWidget';
import { ImgwAlertWidget } from '@/components/ImgwAlertWidget';
import { EliChangesWidget } from '@/components/EliChangesWidget';

export const revalidate = 1800;

export const metadata: Metadata = {
  alternates: canonical('/aktualnosci'),
  title: 'Aktualności z polskich instytucji | wezmezadarmo',
  description:
    'Komunikaty ZUS, PFRON, GUS, Sejmu, ARiMR i ministerstw w jednym miejscu. Filtruj po profilu: JDG, firma lub obywatel.',
  openGraph: {
    images: OG_IMAGES,
    title: 'Aktualności rządowe dla JDG, firm i obywateli',
    description:
      'Agregator RSS z 8 polskich instytucji rządowych. Filtruj po profilu: JDG, firma lub wszyscy.',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default async function AktualnosciPage() {
  const { items, active, failed } = await fetchAllWithCache();

  return (
    <main className="prosta">

      <section className="prosta-blok" style={{ padding: 0 }}>
        <p className="mono mala" style={{ margin: '0 0 8px' }}>Agregator RSS, odświeżany co 30 minut</p>
        <h1>Aktualności z polskich instytucji</h1>
        <p className="pod">Komunikaty z {FEEDS.length} źródeł w jednym miejscu, bez odwiedzania osobnych stron.</p>
        <p className="mono mala" style={{ marginTop: 10 }}>
          {FEEDS.map((f, i) => (
            <span key={f.id} title={f.fullName} style={{ opacity: active.includes(f.id) ? 1 : 0.5 }}>
              {i > 0 ? ' · ' : ''}{f.name}
            </span>
          ))}
        </p>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Dla firm</h2>
        <p className="pod">Zaloguj się i ustaw własne kanały monitorowania dla swojej firmy.</p>
        <div className="przyciski">
          <Link href="/panel" className="btn btn-primary btn-lg aktualnosci-cta-btn">Przejdź do panelu</Link>
        </div>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Na żywo</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 12 }}>
          <AirQualityWidget />
          <NbpRatesWidget />
          <ImgwAlertWidget />
          <EliChangesWidget />
        </div>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <FeedClient
          items={items}
          active={active}
          failed={failed}
          fetchedAt={new Date().toISOString()}
        />
      </section>

      <section className="prosta-blok" style={{ padding: '24px 0 0' }}>
        <p className="mala">Treści pochodzą prosto z kanałów RSS instytucji publicznych.</p>
        <p className="mala" style={{ marginTop: 8 }}>
          <Link href="/" style={{ textDecoration: 'underline' }}>Strona główna</Link>
          {' · '}
          <a href="/swiadczenia" style={{ textDecoration: 'underline' }}>Baza świadczeń</a>
          {' · '}
          <a href="/regulamin" style={{ textDecoration: 'underline' }}>Regulamin</a>
        </p>
      </section>

    </main>
  );
}
