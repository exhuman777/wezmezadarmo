import { Metadata } from 'next';
import { canonical } from '@/lib/seo';
import { getSdgIndicator, FEATURED_INDICATORS } from '@/lib/sources/sdg-gus';
import { LineChart } from './LineChart';

export const metadata: Metadata = {
  alternates: canonical('/statystyki'),
  title: 'Polska w liczbach - statystyki GUS, NBP, NFZ | wezmezadarmo',
  description: 'Dashboard danych publicznych: ceny mieszkań, inflacja, emisja CO2, edukacja, zdrowie. Źródła GUS, NBP, ZUS, NFZ, aktualizowane na bieżąco.',
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
  { name: 'NFZ (Narodowy Fundusz Zdrowia)', url: 'https://api.nfz.gov.pl/', status: 'live', opis: 'Świadczeniodawcy, kolejki, recepty, bez rejestracji' },
  { name: 'GUS BDL (Bank Danych Lokalnych)', url: 'https://bdl.stat.gov.pl/api/v1/', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API' },
  { name: 'REGON', url: 'https://api.stat.gov.pl/Home/RegonApi', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API + umowa' },
  { name: 'CEIDG', url: 'https://datastore.ceidg.gov.pl/', status: 'live', opis: 'JDG, wyszukiwanie po NIP' },
  { name: 'TERYT', url: 'https://api.stat.gov.pl/Home/TerytApi', status: 'pending', opis: 'WYMAGANE: rejestracja klucza API' },
  { name: 'STRATEG', url: 'https://strateg.stat.gov.pl/api', status: 'pending', opis: 'Wskaźniki strategii rozwoju Polski (planowana integracja)' },
  { name: 'dane.gov.pl', url: 'https://api.dane.gov.pl/doc', status: 'live', opis: 'Centralny katalog otwartych danych - tysiące zbiorów, bez rejestracji' },
  { name: 'KRS Open API', url: 'https://prs.ms.gov.pl/krs/openApi', status: 'live', opis: 'Krajowy Rejestr Sądowy - spółki, fundacje (JSON), bez klucza' },
  { name: 'NFZ - Terminy leczenia', url: 'https://api.nfz.gov.pl/app-itl-api/', status: 'live', opis: 'Pierwszy wolny termin wizyty i kolejki, bez rejestracji' },
  { name: 'GUGiK ULDK', url: 'https://www.geoportal.gov.pl/', status: 'live', opis: 'Lokalizacja działek ewidencyjnych po ID/adresie, bez klucza' },
  { name: 'Sejm API (głosowania)', url: 'https://api.sejm.gov.pl/sejm.html', status: 'live', opis: 'Posłowie, głosowania, interpelacje, bez rejestracji' },
  { name: 'Eurostat', url: 'https://ec.europa.eu/eurostat/web/main/data/web-services', status: 'live', opis: 'Statystyki UE - porównanie Polski z innymi krajami, bez klucza' },
  { name: 'GDOŚ Geoserwis', url: 'https://geoserwis.gdos.gov.pl/mapy/', status: 'live', opis: 'Obszary chronione Natura 2000, parki, rezerwaty (WMS/WFS)' },
];

const liveCount = STATUS_API.filter(a => a.status === 'live').length;

export default async function StatystykiPage() {
  const indicators = await Promise.all(
    FEATURED_INDICATORS.slice(0, 4).map(i => getSdgIndicator(i.id).then(data => ({ ...i, data })))
  );

  const lastM2 = CENA_M2[0].q1!;
  const m22020 = CENA_M2.find(r => r.rok === 2020)?.q1 ?? 4567;
  const zmianaPct = (((lastM2 - m22020) / m22020) * 100).toLocaleString('pl', { maximumFractionDigits: 1 });

  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Polska w liczbach</p>
        <h1>Dane publiczne w jednym miejscu</h1>
        <p className="pod">Liczby z GUS, NBP i NFZ. Część pobiera się na żywo z oficjalnych API, przy każdej jest źródło.</p>
      </section>

      <section className="prosta-blok">
        <h2>Cena 1 m² nowego mieszkania</h2>
        <p><b style={{ fontFamily: 'var(--f-mono)', fontSize: 28 }}>{lastM2.toLocaleString('pl')} zł/m²</b> w 1. kwartale 2026, o {zmianaPct}% więcej niż w 1. kwartale 2020.</p>
        <div style={{ border: '1px solid var(--linia)', padding: '12px 8px 4px', marginTop: 16, background: 'var(--surface)' }}>
          <LineChart
            data={CENA_M2.slice().reverse().map(r => ({ x: r.rok, y: r.q1 ?? 0 }))}
            xLabel="Rok"
            yLabel="PLN/m²"
            color="var(--zielen)"
          />
        </div>
        <p className="mala">Źródło: stat.gov.pl, budownictwo, dane za 1. kwartał każdego roku.</p>
      </section>

      <section className="prosta-blok">
        <h2>Wskaźniki z GUS (SDG)</h2>
        <p className="pod">Cele Zrównoważonego Rozwoju ONZ, dane z API sdg.gov.pl.</p>
        <ul className="lista">
          {indicators.map(ind => {
            const d = ind.data && ind.data.dane.length > 0 ? ind.data.dane[ind.data.dane.length - 1] : null;
            return (
              <li key={ind.id}>
                <b>{ind.label}:</b>{' '}
                {d && ind.data
                  ? <>{d.wartosc.toLocaleString('pl', { maximumFractionDigits: 1 })} {ind.data.metadane.jednostka} ({d.rok})</>
                  : <>brak danych, API nie odpowiada</>}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Z jakich API korzystamy</h2>
        <p className="pod">{liveCount} z {STATUS_API.length} działa bez klucza, reszta czeka na rejestrację.</p>
        <ul className="lista">
          {STATUS_API.map(api => (
            <li key={api.name}>
              <b>{api.name}</b>. {api.opis.startsWith('WYMAGANE') ? 'Czeka na klucz API.' : `${api.opis}.`}{' '}
              <a href={api.url} target="_blank" rel="noopener noreferrer" className="mala">{api.url.replace(/^https?:\/\//, '')}</a>
            </li>
          ))}
        </ul>
        <p className="mala" style={{ marginTop: 16 }}>Brakuje Ci jakiejś liczby? Napisz przez formularz w stopce.</p>
      </section>
    </main>
  );
}
