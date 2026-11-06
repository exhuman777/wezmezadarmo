import Link from 'next/link';
import { MultiLineChart, type Series } from './MultiLineChart';
import {
  NEWS_ELEVENLABS, NEWS_NFZ, STAT_TILES, FREE_APIS,
  WYNAGRODZENIE, CENA_M2_ROCZNA, CPI, PROFIL_ZAUFANY, EZLA,
  WYNAGRODZENIE_SOURCE, CENA_M2_SOURCE, CPI_SOURCE, PROFIL_ZAUFANY_SOURCE, EZLA_SOURCE,
  type NewsItem,
} from '@/data/polska-cyfrowa';

// Kolory serii z palety strony: zieleń, rdza, tusz.
const GREEN = 'var(--zielen)';
const AMBER = 'var(--rdza)';
const BLUE = 'var(--tusz)';

// ----- Pochodne serie (liczone ze zrodel surowych) -----

// Dostepnosc: ile m2 nowego mieszkania kupisz za przecietne miesieczne wynagrodzenie brutto
function affordabilitySeries(): Series {
  const m2 = new Map(CENA_M2_ROCZNA.map(r => [r.rok, r.pln]));
  const points = WYNAGRODZENIE
    .filter(w => m2.has(w.rok))
    .map(w => ({ x: w.rok, y: Math.round((w.pln / m2.get(w.rok)!) * 100) / 100 }));
  return { name: 'm² za pensję', color: GREEN, points, unit: ' m²' };
}

// Cena m2: nominalnie vs realnie (deflacja CPI do zlotowki z 2015 r.)
function realVsNominalSeries(): { nominal: Series; real: Series } {
  // Skumulowany czynnik cenowy wzgledem 2015 (2015 = 1.0)
  const factor = new Map<number, number>();
  let acc = 1;
  for (const c of CPI) {
    if (c.rok === 2015) { factor.set(2015, 1); continue; }
    acc = acc * (1 + c.proc / 100);
    factor.set(c.rok, acc);
  }
  const lastCpiYear = CPI[CPI.length - 1].rok;
  const nominalPts = CENA_M2_ROCZNA.map(r => ({ x: r.rok, y: r.pln }));
  const realPts = CENA_M2_ROCZNA
    .filter(r => r.rok <= lastCpiYear && factor.has(r.rok))
    .map(r => ({ x: r.rok, y: Math.round(r.pln / factor.get(r.rok)!) }));
  return {
    nominal: { name: 'Cena nominalna', color: AMBER, points: nominalPts, unit: ' zł/m²' },
    real: { name: 'Cena realna (zł z 2015)', color: GREEN, points: realPts, unit: ' zł/m²' },
  };
}

export default function PolskaCyfrowaPage() {
  const affordability = affordabilitySeries();
  const { nominal, real } = realVsNominalSeries();

  const eUslugi: Series[] = [
    { name: 'Profil Zaufany', color: BLUE, points: PROFIL_ZAUFANY.map(p => ({ x: p.rok, y: p.mln })), unit: ' mln' },
    { name: 'e-ZLA (zwolnienia/rok)', color: GREEN, points: EZLA.map(p => ({ x: p.rok, y: p.mln })), unit: ' mln' },
  ];

  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Centrum Obywatela · Polska cyfrowa</p>
        <h1>Polska jest cyfrowa i mamy na to liczby</h1>
        <p className="pod">
          Ponad 2,3 mld e-recept, 20 mln kont pacjenta i asystent AI w rejestracji do lekarza.
          ElevenLabs, jeden z najszybciej rosnących startupów AI, założyli Polacy. Każda liczba poniżej ma link do źródła.
        </p>
      </section>

      <section className="prosta-blok">
        <h2>Polska w liczbach</h2>
        <ul className="lista">
          {STAT_TILES.map(t => (
            <li key={t.label} className="pc-liczba">
              <b>{t.value}</b>
              <span>
                {t.label}
                <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="pc-zrodlo">{t.sourceName}, {t.year}</a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>ElevenLabs, polski jednorożec AI</h2>
        <p className="pod">Lider syntezy mowy AI wyceniany na 11 mld USD. Założyli go dwaj Polacy, główne centrum badawcze w UE jest w Warszawie.</p>
        <NewsList items={NEWS_ELEVENLABS} />
      </section>

      <section className="prosta-blok">
        <h2>NFZ i e-zdrowie</h2>
        <p className="pod">Recepta, skierowanie i rejestracja do lekarza działają online. NFZ wdraża asystenta AI do umawiania wizyt.</p>
        <NewsList items={NEWS_NFZ} />
      </section>

      <ChartBlock
        label="Dostępność mieszkań"
        title="Ile m² nowego mieszkania kupisz za jedną pensję"
        desc="Przeciętna pensja brutto podzielona przez średnią cenę 1 m². Ceny rosną szybko, ale płace podobnie, więc dostępność od dekady jest w miarę stabilna."
        sources={[['GUS - wynagrodzenia', WYNAGRODZENIE_SOURCE], ['GUS - ceny m²', CENA_M2_SOURCE]]}
      >
        <MultiLineChart series={[affordability]} xLabel="Rok" yLabel="m² za pensję" />
      </ChartBlock>

      <ChartBlock
        label="Ceny mieszkań realnie"
        title="Cena m² nominalnie i po odjęciu inflacji"
        desc="Cena nominalna prawie się podwoiła (2015-2024), realna, w złotówkach z 2015 r., wzrosła dużo mniej. Seria realna kończy się na 2024 r., ostatnim zweryfikowanym wskaźniku CPI."
        sources={[['GUS - ceny m²', CENA_M2_SOURCE], ['GUS - inflacja CPI', CPI_SOURCE]]}
      >
        <MultiLineChart series={[nominal, real]} xLabel="Rok" yLabel="zł/m²" />
      </ChartBlock>

      <ChartBlock
        label="Wzrost e-usług"
        title="Adopcja e-usług państwowych w czasie"
        desc="Profil Zaufany urósł z 1,3 mln (2018) do 14,5 mln (2022). Od 2018 r. praktycznie wszystkie zwolnienia lekarskie (e-ZLA) są cyfrowe, ok. 22 mln rocznie."
        sources={[['Ministerstwo Cyfryzacji', PROFIL_ZAUFANY_SOURCE], ['ZUS - e-ZLA', EZLA_SOURCE]]}
      >
        <MultiLineChart series={eUslugi} xLabel="Rok" yLabel="mln" />
      </ChartBlock>

      <section className="prosta-blok">
        <h2>Dla równowagi</h2>
        <p className="pod">
          W unijnym indeksie DESI (ostatnia edycja 2022) Polska była 24. na 27 krajów. Słabe strony to cyfrowe usługi dla firm
          i część usług publicznych. W tempie poprawy 2017-2022 Polska była wśród liderów UE, a w e-zdrowiu należy do czołówki.
        </p>
        <p className="mala" style={{ marginTop: 8 }}>
          <a href="https://digital-strategy.ec.europa.eu/en/policies/desi-poland" target="_blank" rel="noopener noreferrer">Źródło: Komisja Europejska</a>
        </p>
      </section>

      <section className="prosta-blok">
        <h2>Darmowe API państwowe, które podpinamy</h2>
        <p className="pod">Kolejne publiczne API bez opłat, które rozważamy obok używanych już NFZ, NBP, GIOŚ, GUS, Sejm/ELI, CEIDG i MF.</p>
        <ul className="lista">
          {FREE_APIS.map(api => (
            <li key={api.name}>
              <a href={api.url} target="_blank" rel="noopener noreferrer"><b>{api.name}</b></a>
              {' '}<span className={api.key ? 'znacznik' : 'znacznik znacznik-zielony'}>{api.key ? 'klucz API' : 'bez klucza'}</span>
              <br /><span className="lista-opis">{api.data}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mala">
        <Link href="/centrum-obywatela">← Wszystkie narzędzia Centrum Obywatela</Link>
      </p>
    </main>
  );
}

// ----- Komponenty pomocnicze -----

function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="lista">
      {items.map(n => (
        <li key={n.title}>
          <span className="pc-data">{n.date}</span>
          <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="pc-tytul">{n.title}</a>
          <span className="pc-opis">{n.summary}</span>
          <span className="pc-zrodlo">{n.sourceName}</span>
        </li>
      ))}
    </ul>
  );
}

function ChartBlock({ label, title, desc, sources, children }: {
  label: string; title: string; desc: string; sources: Array<[string, string]>; children: React.ReactNode;
}) {
  return (
    <section className="prosta-blok">
      <p className="etykieta">{label}</p>
      <h2>{title}</h2>
      <p className="pod">{desc}</p>
      <div className="pc-wykres">{children}</div>
      <p className="mala" style={{ marginTop: 8 }}>
        Źródła:{' '}
        {sources.map(([name, url], i) => (
          <span key={url}>{i > 0 ? ', ' : ''}<a href={url} target="_blank" rel="noopener noreferrer">{name}</a></span>
        ))}
      </p>
    </section>
  );
}
