import { Metadata } from 'next';
import { getSdgIndicator, FEATURED_INDICATORS } from '@/lib/sources/sdg-gus';
import { LineChart } from './LineChart';

export const metadata: Metadata = {
  title: 'Polska w liczbach -- statystyki GUS, NBP, NFZ | wezmezadarmo',
  description: 'Dashboard danych publicznych: ceny mieszkan, inflacja, emisja CO2, edukacja, zdrowie. Zrodla GUS, NBP, ZUS, NFZ -- aktualizowane na biezaco.',
};

const CENA_M2: Array<{ rok: number; q1: number | null; q2: number | null; q3: number | null; q4: number | null }> = [
  { rok: 2026, q1: 8155, q2: null, q3: null, q4: null },
  { rok: 2025, q1: 7251, q2: 6973, q3: 7720, q4: 7933 },
  { rok: 2024, q1: 6722, q2: 6737, q3: 7362, q4: 7162 },
  { rok: 2023, q1: 5668, q2: 6134, q3: 6335, q4: 6386 },
  { rok: 2022, q1: 5252, q2: 5020, q3: 5295, q4: 5708 },
  { rok: 2021, q1: 4944, q2: 5112, q3: 5347, q4: 5134 },
  { rok: 2020, q1: 4567, q2: 5000, q3: 4987, q4: 5012 },
  { rok: 2019, q1: 4388, q2: 4484, q3: 4376, q4: 4597 },
  { rok: 2018, q1: 4132, q2: 4294, q3: 4385, q4: 4139 },
  { rok: 2017, q1: 4424, q2: 4014, q3: 4097, q4: 4145 },
  { rok: 2016, q1: 4177, q2: 4063, q3: 3976, q4: 4000 },
  { rok: 2015, q1: 3926, q2: 4066, q3: 3961, q4: 3925 },
  { rok: 2010, q1: 4372, q2: 4433, q3: 4657, q4: 3979 },
  { rok: 2005, q1: 2505, q2: 2336, q3: 2528, q4: 2388 },
  { rok: 2000, q1: 2245, q2: 2280, q3: 2300, q4: 2300 },
];

const STATUS_API: Array<{ name: string; url: string; status: 'live' | 'pending' | 'planowane'; opis: string }> = [
  { name: 'GUS SDG (Cele Zrównoważonego Rozwoju)', url: 'https://sdg.gov.pl/api/', status: 'live', opis: '200+ wskaźników publicznych, bez rejestracji' },
  { name: 'NBP (Narodowy Bank Polski)', url: 'https://api.nbp.pl/', status: 'live', opis: 'Kursy walut, stopy procentowe, bez rejestracji' },
  { name: 'NFZ (Narodowy Fundusz Zdrowia)', url: 'https://api.nfz.gov.pl/', status: 'live', opis: 'Świadczeniodawcy, kolejki, recepty -- bez rejestracji' },
  { name: 'GUS BDL (Bank Danych Lokalnych)', url: 'https://bdl.stat.gov.pl/api/v1/', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API (planowana 06.2026)' },
  { name: 'REGON', url: 'https://api.stat.gov.pl/Home/RegonApi', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API + umowa' },
  { name: 'CEIDG', url: 'https://datastore.ceidg.gov.pl/', status: 'live', opis: 'JDG, wyszukiwanie po NIP' },
  { name: 'TERYT', url: 'https://api.stat.gov.pl/Home/TerytApi', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API' },
  { name: 'STRATEG', url: 'https://strateg.stat.gov.pl/api', status: 'pending', opis: 'Wskaźniki strategii rozwoju Polski (planowane integracja)' },
];

const liveCount = STATUS_API.filter(a => a.status === 'live').length;

export default async function StatystykiPage() {
  const indicators = await Promise.all(
    FEATURED_INDICATORS.slice(0, 4).map(i => getSdgIndicator(i.id).then(data => ({ ...i, data })))
  );

  const lastM2 = CENA_M2[0].q1!;
  const m22020 = CENA_M2.find(r => r.rok === 2020)?.q1 ?? 4567;
  const zmianaPct = (((lastM2 - m22020) / m22020) * 100).toFixed(1);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 72px' }}>

      {/* HERO */}
      <section style={{
        marginBottom: 28,
        padding: '36px 40px',
        background: 'linear-gradient(135deg, var(--color-bg-2) 0%, var(--color-bg-0) 60%)',
        borderRadius: 18,
        border: '1px solid var(--color-green-border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,160,107,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -30, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(34,160,107,0.12)', pointerEvents: 'none' }} />

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-green)', marginBottom: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Polska w liczbach
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 52px)', fontWeight: 600, marginBottom: 14, lineHeight: 1.1, color: 'var(--color-text-1)', letterSpacing: '-0.025em' }}>
          Statystyki państwowe<br />w jednym miejscu
        </h1>
        <p style={{ fontSize: 15, color: 'var(--color-text-2)', maxWidth: 580, lineHeight: 1.65, marginBottom: 24 }}>
          Dashboard danych publicznych z GUS, NBP, NFZ. Wartości pobierane na żywo z oficjalnych API lub uzupełniane ze źródeł rządowych. Aktualizacja: 25.05.2026.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Źródeł API', val: STATUS_API.length.toString() },
            { label: 'Live teraz', val: `${liveCount}/${STATUS_API.length}`, green: true },
            { label: 'Wskaźniki SDG', val: '200+' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.green ? 'rgba(34,160,107,0.1)' : 'rgba(13,80,54,0.06)',
              padding: '10px 18px',
              borderRadius: 10,
              border: `1px solid ${s.green ? 'rgba(34,160,107,0.25)' : 'rgba(13,80,54,0.12)'}`,
              minWidth: 90,
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.green ? '#22a06b' : 'var(--color-text-1)', letterSpacing: '-0.02em' }}>{s.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cena 1m2 */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader badge="Budownictwo · GUS" title="Cena 1 m² powierzchni użytkowej nowego mieszkania" />
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden', background: 'var(--color-bg-1)' }}>
          <div style={{
            padding: '16px 24px',
            background: 'linear-gradient(90deg, var(--color-bg-2) 0%, var(--color-bg-0) 100%)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 38, fontWeight: 700, color: 'var(--color-text-1)', letterSpacing: '-0.03em' }}>
              {lastM2.toLocaleString('pl')} zł/m²
            </span>
            <span style={{
              fontSize: 12, color: '#22a06b', fontWeight: 500,
              background: 'rgba(34,160,107,0.1)', padding: '3px 10px', borderRadius: 6,
              border: '1px solid rgba(34,160,107,0.22)',
            }}>
              +{zmianaPct}% od 2020
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-2)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
              1 kwartał 2026
            </span>
          </div>
          <div style={{ padding: '16px 20px 4px' }}>
            <LineChart
              data={CENA_M2.slice().reverse().map(r => ({ x: r.rok, y: r.q1 ?? 0 }))}
              xLabel="Rok"
              yLabel="PLN/m²"
              color="var(--color-green)"
            />
          </div>
          <div style={{ padding: '6px 24px 14px', fontSize: 10, color: 'var(--color-text-2)', fontFamily: 'var(--font-mono)' }}>
            Źródło: stat.gov.pl/obszary-tematyczne/przemysl-budownictwo · ostatnia aktualizacja: 25.05.2026
          </div>
        </div>
      </section>

      {/* Wskaźniki SDG */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <SectionHeader badge="Live · SDG API" title="Wskaźniki SDG (LIVE z GUS)" />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22a06b', boxShadow: '0 0 0 3px rgba(34,160,107,0.2)', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#22a06b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>live</span>
          </div>
        </div>
        <p style={{ color: 'var(--color-text-2)', marginBottom: 16, fontSize: 13 }}>
          Cele Zrównoważonego Rozwoju ONZ - dane z oficjalnego API GUS SDG (sdg.gov.pl).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 12 }}>
          {indicators.map(ind => (
            <div key={ind.id} style={{
              border: '1px solid var(--color-border)',
              borderTop: '3px solid var(--color-green)',
              borderRadius: 12,
              padding: '16px 18px',
              background: 'var(--color-bg-1)',
            }}>
              <div style={{ fontSize: 9, color: 'var(--color-green)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {ind.category} · SDG {ind.id}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, lineHeight: 1.35, color: 'var(--color-text-1)' }}>{ind.label}</div>
              {ind.data && ind.data.dane.length > 0 ? (
                <>
                  <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: 'var(--color-text-1)', letterSpacing: '-0.025em' }}>
                    {ind.data.dane[ind.data.dane.length - 1].wartosc.toLocaleString('pl', { maximumFractionDigits: 1 })}
                    <span style={{ fontSize: 12, color: 'var(--color-text-2)', marginLeft: 5, fontWeight: 400 }}>{ind.data.metadane.jednostka}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-2)', fontFamily: 'var(--font-mono)' }}>
                    {ind.data.dane[ind.data.dane.length - 1].rok} · seria {ind.data.dane[0].rok}-{ind.data.dane[ind.data.dane.length - 1].rok}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--color-text-2)' }}>Brak danych (API offline)</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Status API */}
      <section style={{ marginBottom: 28 }}>
        <SectionHeader badge="Infrastruktura" title="Status integracji z API państwowymi" />
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          {STATUS_API.map((api, i) => (
            <div key={api.name} style={{
              padding: '12px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 16,
              alignItems: 'center',
              borderBottom: i < STATUS_API.length - 1 ? '1px solid var(--color-border)' : 'none',
              background: i % 2 === 0 ? 'var(--color-bg-1)' : 'var(--color-bg-0)',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-1)' }}>{api.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-2)', marginTop: 1 }}>{api.opis}</div>
                <a href={api.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: 'var(--color-green)', fontFamily: 'var(--font-mono)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>
                  {api.url}
                </a>
              </div>
              <span style={{
                fontSize: 10, fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap',
                background: api.status === 'live' ? 'rgba(34,160,107,0.1)' : api.status === 'pending' ? 'rgba(184,116,26,0.1)' : 'rgba(120,120,120,0.08)',
                color: api.status === 'live' ? '#22a06b' : api.status === 'pending' ? '#B8741A' : 'var(--color-text-2)',
                border: `1px solid ${api.status === 'live' ? 'rgba(34,160,107,0.28)' : api.status === 'pending' ? 'rgba(184,116,26,0.28)' : 'rgba(120,120,120,0.2)'}`,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {api.status === 'live' ? '● LIVE' : api.status === 'pending' ? '○ KLUCZ API' : '- PLANOWANE'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '36px 40px',
        background: 'linear-gradient(135deg, var(--color-green) 0%, #105c40 100%)',
        borderRadius: 16,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 40, bottom: -20, width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(255,255,255,0.6)', marginBottom: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Chcesz więcej danych?
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 10, color: '#fff', letterSpacing: '-0.02em' }}>Zaproponuj wskaźnik</h3>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 22, fontSize: 14, maxWidth: 500, lineHeight: 1.6 }}>
          Pracujemy nad cross-reference między cenami mieszkań, inflacją, średnim wynagrodzeniem i innymi wskaźnikami. Napisz, czego potrzebujesz.
        </p>
        <a
          href="mailto:hello@wezmezadarmo.com?subject=Dashboard%20-%20propozycja%20wska%C5%BAnika"
          style={{
            display: 'inline-block', padding: '10px 22px',
            background: '#fff', color: 'var(--color-green)',
            borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: 13,
          }}
        >
          Zaproponuj wskaźnik →
        </a>
      </section>
    </main>
  );
}

function SectionHeader({ badge, title }: { badge: string; title: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 16, paddingLeft: 14, borderLeft: '3px solid var(--color-green)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-green)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{badge}</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-1)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{title}</h2>
    </div>
  );
}
