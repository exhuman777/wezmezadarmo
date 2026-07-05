import type { Metadata } from 'next';
import { fetchAllWithCache, FEEDS } from './rss';
import FeedClient from './FeedClient';
import Link from 'next/link';
import { AirQualityWidget } from '@/components/AirQualityWidget';
import { NbpRatesWidget } from '@/components/NbpRatesWidget';
import { ImgwAlertWidget } from '@/components/ImgwAlertWidget';
import { EliChangesWidget } from '@/components/EliChangesWidget';

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

const SOURCE_COLORS: Record<string, string> = {
  zus: '#003874', gus: '#004B8D', nbp: '#CC0000',
  uokik: '#1B5E20', fundusze: '#6A0DAD', ezdrowie: '#00695C',
  sejm: '#8B0000', arimr: '#4E342E',
};

export default async function AktualnosciPage() {
  const { items, active, failed } = await fetchAllWithCache();

  return (
    <div className="min-h-screen bg-bg-0">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) 16px 64px' }}>

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: '#22A06B',
            boxShadow: '0 0 8px rgba(34,160,107,0.6)',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: 'var(--color-text-3)',
          }}>
            Agregator RSS
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, color: 'var(--color-text-1)', marginBottom: 6, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Aktualności z polskich instytucji
        </h1>

        {/* Subtitle boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 8, margin: '14px 0 20px' }}>
          <div style={{
            padding: '11px 14px',
            background: 'rgba(34,160,107,0.06)',
            border: '1px solid rgba(34,160,107,0.14)',
            borderLeft: '2px solid #22A06B',
            borderRadius: 9,
          }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#22A06B', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 3 }}>
              {FEEDS.length}
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
              źródeł: ZUS, GUS, NBP, UOKiK, Fundusze EU, e-Zdrowie, Sejm, ARiMR
            </span>
          </div>
          <div style={{
            padding: '11px 14px',
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid var(--color-border)',
            borderRadius: 9,
          }}>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', display: 'block', marginBottom: 3, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Odświeżane
            </span>
            <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
              Co 30 minut. Bez potrzeby odwiedzania 8 osobnych stron.
            </span>
          </div>
        </div>

        {/* Source dots legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {FEEDS.map(f => (
            <span
              key={f.id}
              title={f.fullName}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                padding: '3px 9px', borderRadius: 5,
                background: SOURCE_COLORS[f.id] ?? '#444',
                color: '#fff',
                letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                opacity: active.includes(f.id) ? 1 : 0.3,
                transition: 'opacity 0.2s',
              }}
            >
              {f.name}
            </span>
          ))}
        </div>

        {/* CTA dla firm */}
        <div style={{
          padding: '14px 18px', marginBottom: 24,
          background: 'rgba(34,160,107,0.05)',
          border: '1px solid rgba(34,160,107,0.14)',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--color-text-3)', marginBottom: 4 }}>
              Dla firm
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.55, margin: 0 }}>
              Zaloguj się i skonfiguruj własne kanały monitorowania dla swojej firmy.
            </p>
          </div>
          <Link
            href="/panel"
            className="aktualnosci-cta-btn"
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
              color: '#fff', background: '#22A06B',
              padding: '8px 16px', borderRadius: 8,
              textDecoration: 'none', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(34,160,107,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            Przejdź do panelu →
          </Link>
        </div>

        {/* Live data widgets: air quality + currency rates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 20 }}>
          <AirQualityWidget />
          <NbpRatesWidget />
          <ImgwAlertWidget />
          <EliChangesWidget />
        </div>

        {/* Feed client */}
        <FeedClient
          items={items}
          active={active}
          failed={failed}
          fetchedAt={new Date().toISOString()}
        />

        {/* Footer */}
        <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 8 }}>
            Treści pobierane bezpośrednio z kanałów RSS instytucji publicznych. Strona odświeżana automatycznie co 30 minut.
          </p>
          <div style={{ fontSize: 12 }}>
            <Link href="/" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Strona główna</Link>
            <span style={{ margin: '0 8px', color: 'var(--color-text-3)' }}>|</span>
            <a href="/swiadczenia" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Baza świadczeń</a>
            <span style={{ margin: '0 8px', color: 'var(--color-text-3)' }}>|</span>
            <a href="/regulamin" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Regulamin</a>
          </div>
        </div>
      </div>
    </div>
  );
}
