import Link from 'next/link';
import { MultiLineChart, type Series } from './MultiLineChart';
import {
  NEWS_ELEVENLABS, NEWS_NFZ, STAT_TILES, FREE_APIS,
  WYNAGRODZENIE, CENA_M2_ROCZNA, CPI, PROFIL_ZAUFANY, EZLA,
  WYNAGRODZENIE_SOURCE, CENA_M2_SOURCE, CPI_SOURCE, PROFIL_ZAUFANY_SOURCE, EZLA_SOURCE,
  type NewsItem,
} from '@/data/polska-cyfrowa';

const GREEN = '#22A06B';
const AMBER = '#c4841a';
const BLUE = '#003874';

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
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* HERO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, boxShadow: '0 0 7px rgba(34,160,107,0.55)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Centrum Obywatela · Polska cyfrowa
        </span>
      </div>
      <h1 style={{ fontSize: 'clamp(26px, 3.8vw, 40px)', fontWeight: 700, marginBottom: 14, color: 'var(--ink-900)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
        Polska jest cyfrowa - i mamy na to liczby
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ink-500)', marginBottom: 28, lineHeight: 1.6, maxWidth: 800 }}>
        e-zdrowie i e-administracja w Polsce działają na poziomie światowym: ponad 2,3 mld e-recept,
        20 mln kont pacjenta, asystent AI w rejestracji do lekarza. A jeden z najszybciej rosnących
        startupów AI na świecie, ElevenLabs, założyli Polacy i buduje centrum R&D w Warszawie.
        Wszystkie liczby poniżej pochodzą ze źródeł oficjalnych - każda z linkiem.
      </p>

      {/* KAFELKI: Polska w liczbach */}
      <section style={{ marginBottom: 36 }}>
        <SectionLabel text="Polska w liczbach" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: 12 }}>
          {STAT_TILES.map(t => (
            <a key={t.label} href={t.sourceUrl} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block', padding: '16px 18px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
              <span style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${GREEN}, transparent)` }} />
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.02em', fontFamily: 'var(--f-mono)', lineHeight: 1.1 }}>{t.value}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 6, lineHeight: 1.4 }}>{t.label}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--ink-500)', marginTop: 8, letterSpacing: '0.04em' }}>{t.sourceName} · {t.year}</div>
            </a>
          ))}
        </div>
      </section>

      {/* NEWSY: ElevenLabs */}
      <section style={{ marginBottom: 36 }}>
        <SectionLabel text="ElevenLabs - polski jednorożec AI" />
        <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 16, lineHeight: 1.55, maxWidth: 760 }}>
          Wyceniany na 11 mld USD lider syntezy mowy AI. Założony przez dwóch Polaków, dziś z głównym
          centrum badawczym w Unii Europejskiej zlokalizowanym w Warszawie.
        </p>
        <NewsGrid items={NEWS_ELEVENLABS} accent={BLUE} />
      </section>

      {/* NEWSY: NFZ / e-zdrowie */}
      <section style={{ marginBottom: 36 }}>
        <SectionLabel text="NFZ i e-zdrowie - cyfryzacja zdrowia" />
        <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 16, lineHeight: 1.55, maxWidth: 760 }}>
          System e-zdrowie w Polsce należy do najszerzej używanych w Europie. Recepta, skierowanie i
          rejestracja do lekarza działają online, a NFZ wdraża asystenta AI do umawiania wizyt.
        </p>
        <NewsGrid items={NEWS_NFZ} accent={GREEN} />
      </section>

      {/* WYKRES 1: Dostepnosc mieszkan */}
      <ChartCard
        label="Dostępność mieszkań"
        title="Ile m² nowego mieszkania kupisz za jedną pensję"
        desc="Przeciętne miesięczne wynagrodzenie brutto podzielone przez średnią cenę 1 m². Wartość ~1 oznacza, że za miesięczną pensję kupisz ok. 1 m². Mimo szybko rosnących cen mieszkań dostępność jest w ostatniej dekadzie w miarę stabilna - bo płace rosną podobnie szybko."
        sources={[['GUS - wynagrodzenia', WYNAGRODZENIE_SOURCE], ['GUS - ceny m²', CENA_M2_SOURCE]]}
      >
        <MultiLineChart series={[affordability]} xLabel="Rok" yLabel="m² za pensję" />
      </ChartCard>

      {/* WYKRES 2: Realne vs nominalne ceny m2 */}
      <ChartCard
        label="Ceny mieszkań - realnie"
        title="Cena m² nominalnie vs po odjęciu inflacji"
        desc="Cena nominalna prawie się podwoiła (2015-2024), ale po przeliczeniu na siłę nabywczą złotówki z 2015 r. realny wzrost jest dużo mniejszy. Skok inflacji 2022-2023 „zjadł” znaczną część nominalnego wzrostu cen. Seria realna kończy się na 2024 r. (ostatni zweryfikowany wskaźnik CPI)."
        sources={[['GUS - ceny m²', CENA_M2_SOURCE], ['GUS - inflacja CPI', CPI_SOURCE]]}
      >
        <MultiLineChart series={[nominal, real]} xLabel="Rok" yLabel="zł/m²" />
      </ChartCard>

      {/* WYKRES 3: Wzrost e-uslug */}
      <ChartCard
        label="Wzrost e-usług"
        title="Adopcja e-usług państwowych w czasie"
        desc="Dwie najlepiej udokumentowane serie roczne. Profil Zaufany (logowanie do e-administracji) urósł z 1,3 mln (2018) do 14,5 mln (2022). e-ZLA to elektroniczne zwolnienia lekarskie - od 2018 r. praktycznie 100% zwolnień jest cyfrowych, ok. 22 mln rocznie."
        sources={[['Ministerstwo Cyfryzacji', PROFIL_ZAUFANY_SOURCE], ['ZUS - e-ZLA', EZLA_SOURCE]]}
      >
        <MultiLineChart series={eUslugi} xLabel="Rok" yLabel="mln" />
      </ChartCard>

      {/* UCZCIWY KONTEKST: DESI */}
      <section style={{ marginBottom: 36, padding: '16px 20px', background: 'var(--green-25, #fafaf7)', border: '1px dashed var(--line)', borderRadius: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-600)', lineHeight: 1.6 }}>
          <strong>Dla równowagi:</strong> w unijnym indeksie cyfryzacji DESI (ostatnia edycja 2022) Polska
          zajmowała 24. miejsce na 27 krajów - słabe strony to cyfrowe usługi dla firm i część usług
          publicznych. Ale w tempie poprawy 2017-2022 Polska była wśród liderów UE, a w e-zdrowiu należy
          do europejskiej czołówki. Cyfryzacja idzie szybko, choć nie wszędzie równo.
          {' '}
          <a href="https://digital-strategy.ec.europa.eu/en/policies/desi-poland" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-900)' }}>
            Źródło: Komisja Europejska
          </a>
        </div>
      </section>

      {/* DARMOWE API */}
      <section style={{ marginBottom: 12 }}>
        <SectionLabel text="Darmowe API państwowe - co jeszcze podpinamy" />
        <p style={{ fontSize: 14, color: 'var(--ink-500)', marginBottom: 16, lineHeight: 1.55, maxWidth: 760 }}>
          Polska udostępnia dziesiątki publicznych API bez opłat. Poniżej te, które rozważamy do
          integracji obok już używanych (NFZ, NBP, GIOŚ, GUS, Sejm/ELI, CEIDG, MF).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 10 }}>
          {FREE_APIS.map(api => (
            <a key={api.name} href={api.url} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block', padding: 14, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <code style={{ fontSize: 13, fontFamily: 'var(--f-mono)', fontWeight: 700, color: 'var(--ink-900)' }}>{api.name}</code>
                <span style={{ marginLeft: 'auto', fontSize: 9, fontFamily: 'var(--f-mono)', padding: '2px 7px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em',
                  background: api.key ? 'rgba(196,132,26,0.12)' : 'rgba(34,160,107,0.12)',
                  color: api.key ? '#9a6512' : '#157a4f',
                  border: `1px solid ${api.key ? 'rgba(196,132,26,0.3)' : 'rgba(34,160,107,0.3)'}` }}>
                  {api.key ? 'klucz API' : 'bez klucza'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.45 }}>{api.data}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Link powrotny */}
      <div style={{ marginTop: 32 }}>
        <Link href="/centrum-obywatela" style={{ fontSize: 13, color: 'var(--green-900)', fontFamily: 'var(--f-mono)' }}>
          ← wszystkie narzędzia Centrum Obywatela
        </Link>
      </div>
    </main>
  );
}

// ----- Komponenty pomocnicze -----

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 14, paddingLeft: 12, borderLeft: `3px solid ${GREEN}` }}>
      <h2 style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink-900)', letterSpacing: '-0.01em', lineHeight: 1.2, margin: 0 }}>{text}</h2>
    </div>
  );
}

function NewsGrid({ items, accent }: { items: NewsItem[]; accent: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 12 }}>
      {items.map(n => (
        <a key={n.title} href={n.sourceUrl} target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'block', padding: 16, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.6 }} />
          <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: accent, letterSpacing: '0.06em', marginBottom: 6 }}>{n.date}</div>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink-900)', lineHeight: 1.3, marginBottom: 8, letterSpacing: '-0.01em' }}>{n.title}</div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-500)', lineHeight: 1.5, margin: 0, marginBottom: 10 }}>{n.summary}</p>
          <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--ink-500)' }}>{n.sourceName} ↗</div>
        </a>
      ))}
    </div>
  );
}

function ChartCard({ label, title, desc, sources, children }: {
  label: string; title: string; desc: string; sources: Array<[string, string]>; children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 28 }}>
      <SectionLabel text={label} />
      <div style={{ border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden', background: 'var(--white)' }}>
        <div style={{ padding: '16px 22px 4px' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-900)', margin: 0, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
          <p style={{ fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.55, margin: 0, marginBottom: 12 }}>{desc}</p>
        </div>
        <div style={{ padding: '4px 18px 12px', color: 'var(--ink-900)' }}>
          {children}
        </div>
        <div style={{ padding: '8px 22px 14px', fontSize: 10, color: 'var(--ink-500)', fontFamily: 'var(--f-mono)', borderTop: '1px solid var(--line)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {sources.map(([name, url]) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-500)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{name}</a>
          ))}
        </div>
      </div>
    </section>
  );
}
