import { Metadata } from 'next';
import { getSdgIndicator, FEATURED_INDICATORS } from '@/lib/sources/sdg-gus';
import { LineChart } from './LineChart';

export const metadata: Metadata = {
  title: 'Polska w liczbach -- statystyki GUS, NBP, NFZ | wezmezadarmo',
  description: 'Dashboard danych publicznych: ceny mieszkan, inflacja, emisja CO2, edukacja, zdrowie. Zrodla GUS, NBP, ZUS, NFZ -- aktualizowane na biezaco.',
};

// Cena 1m² powierzchni uzytkowej budynku mieszkalnego oddanego do uzytkowania
// Zrodlo: GUS stat.gov.pl/obszary-tematyczne/przemysl-budownictwo (publiczne)
// Dane: tabela kwartalna 1999-2026
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
  { name: 'NBP (Narodowy Bank Polski)', url: 'http://api.nbp.pl/', status: 'live', opis: 'Kursy walut, stopy procentowe -- bez rejestracji' },
  { name: 'NFZ (Narodowy Fundusz Zdrowia)', url: 'https://api.nfz.gov.pl/', status: 'live', opis: 'Świadczeniodawcy, kolejki, recepty -- bez rejestracji' },
  { name: 'GUS BDL (Bank Danych Lokalnych)', url: 'https://bdl.stat.gov.pl/api/v1/', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API (planowana 06.2026)' },
  { name: 'REGON', url: 'https://api.stat.gov.pl/Home/RegonApi', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API + umowa' },
  { name: 'CEIDG', url: 'https://datastore.ceidg.gov.pl/', status: 'live', opis: 'JDG -- po podaniu NIP' },
  { name: 'TERYT', url: 'https://api.stat.gov.pl/Home/TerytApi', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API' },
  { name: 'STRATEG', url: 'https://strateg.stat.gov.pl/api', status: 'pending', opis: 'Wskaźniki strategii rozwoju Polski (planowane integracja)' },
];

export default async function StatystykiPage() {
  // Pobierz 4 wskazniki SDG (LIVE)
  const indicators = await Promise.all(
    FEATURED_INDICATORS.slice(0, 4).map(i => getSdgIndicator(i.id).then(data => ({ ...i, data })))
  );

  const lastM2 = CENA_M2[0].q1!;
  const m22020 = CENA_M2.find(r => r.rok === 2020)?.q1 ?? 4567;
  const zmianaPct = (((lastM2 - m22020) / m22020) * 100).toFixed(1);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px 96px' }}>
      <section style={{ marginBottom: 64 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-green)', marginBottom: 8, letterSpacing: '0.08em' }}>
          POLSKA W LICZBACH
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 600, marginBottom: 16, lineHeight: 1.15 }}>
          Statystyki państwowe<br />w jednym miejscu
        </h1>
        <p style={{ fontSize: 18, color: 'var(--color-text-2)', maxWidth: 720, lineHeight: 1.6 }}>
          Dashboard danych publicznych z GUS, NBP, NFZ. Wszystkie wartości są pobierane na żywo z oficjalnych API lub uzupełniane ręcznie ze źródeł rządowych. Aktualizacja: 25.05.2026.
        </p>
      </section>

      {/* Featured cena 1m2 */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-2)', marginBottom: 8 }}>BUDOWNICTWO · GUS</div>
        <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Cena 1 m² powierzchni użytkowej nowego mieszkania</h2>
        <p style={{ color: 'var(--color-text-2)', marginBottom: 24, fontSize: 15 }}>
          1 kwartał 2026: <strong style={{ color: 'var(--color-text-1)', fontSize: 28 }}>{lastM2.toLocaleString('pl')} zł</strong>
          {' '}— wzrost o {zmianaPct}% od 2020 r.
        </p>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, background: 'var(--color-bg-1)' }}>
          <LineChart
            data={CENA_M2.slice().reverse().map(r => ({ x: r.rok, y: r.q1 ?? 0 }))}
            xLabel="Rok"
            yLabel="PLN/m²"
            color="var(--color-green)"
          />
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--color-text-2)', fontFamily: 'var(--font-mono)' }}>
            Źródło: stat.gov.pl/obszary-tematyczne/przemysl-budownictwo · ostatnia aktualizacja: 25.05.2026
          </div>
        </div>
      </section>

      {/* LIVE indicators z SDG API */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Wskaźniki SDG (LIVE z GUS)</h2>
        <p style={{ color: 'var(--color-text-2)', marginBottom: 24, fontSize: 14 }}>
          Cele Zrównoważonego Rozwoju ONZ -- dane pobierane na żywo z oficjalnego API GUS SDG (sdg.gov.pl).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {indicators.map(ind => (
            <div key={ind.id} style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, background: 'var(--color-bg-1)' }}>
              <div style={{ fontSize: 11, color: 'var(--color-green)', fontFamily: 'var(--font-mono)', marginBottom: 6, textTransform: 'uppercase' }}>
                {ind.category} · SDG {ind.id}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, lineHeight: 1.4 }}>{ind.label}</div>
              {ind.data && ind.data.dane.length > 0 ? (
                <>
                  <div style={{ fontSize: 32, fontWeight: 600, marginBottom: 4 }}>
                    {ind.data.dane[ind.data.dane.length - 1].wartosc.toLocaleString('pl', { maximumFractionDigits: 1 })}
                    <span style={{ fontSize: 14, color: 'var(--color-text-2)', marginLeft: 6 }}>{ind.data.metadane.jednostka}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-2)' }}>
                    Najnowsze: {ind.data.dane[ind.data.dane.length - 1].rok} · seria {ind.data.dane[0].rok}–{ind.data.dane[ind.data.dane.length - 1].rok}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Brak danych (API offline)</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap źródeł API */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Status integracji z API państwowymi</h2>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
          {STATUS_API.map((api, i) => (
            <div key={api.name} style={{
              padding: '14px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 16,
              alignItems: 'center',
              borderBottom: i < STATUS_API.length - 1 ? '1px solid var(--color-border)' : 'none',
              background: i % 2 === 0 ? 'var(--color-bg-1)' : 'transparent',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{api.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-2)', marginTop: 2 }}>{api.opis}</div>
                <a href={api.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--color-green)', fontFamily: 'var(--font-mono)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{api.url}</a>
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-mono)', padding: '4px 10px', borderRadius: 999,
                background: api.status === 'live' ? 'rgba(34,160,107,0.15)' : api.status === 'pending' ? 'rgba(230,153,58,0.15)' : 'rgba(120,120,120,0.15)',
                color: api.status === 'live' ? 'var(--color-green)' : api.status === 'pending' ? '#e6993a' : 'var(--color-text-2)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {api.status === 'live' ? '● LIVE' : api.status === 'pending' ? '○ wymaga klucza' : '— planowane'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '40px 24px', background: 'var(--color-bg-1)', borderRadius: 16, border: '1px solid var(--color-border)' }}>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Chcesz konkretny wskaźnik?</h3>
        <p style={{ color: 'var(--color-text-2)', marginBottom: 20, fontSize: 14, maxWidth: 560, margin: '0 auto 20px' }}>
          Pracujemy nad rozszerzeniem dashboardu o cross-reference między cenami mieszkań, inflacją, średnim wynagrodzeniem i innymi wskaźnikami. Napisz, czego potrzebujesz.
        </p>
        <a href="mailto:hello@wezmezadarmo.com?subject=Dashboard%20-%20propozycja%20wska%C5%BAnika" style={{
          display: 'inline-block', padding: '12px 24px', background: 'var(--color-green)', color: 'var(--color-bg-0)',
          borderRadius: 999, textDecoration: 'none', fontWeight: 600, fontSize: 14,
        }}>
          Zaproponuj wskaźnik →
        </a>
      </section>
    </main>
  );
}
