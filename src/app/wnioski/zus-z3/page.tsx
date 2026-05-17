'use client';

import { useState } from 'react';
import Link from 'next/link';

// Z-3 to zaswiadczenie wypelniane przez pracodawce, nie pracownika.
// Ten wizard pomaga pracownikowi:
// 1. Zrozumiec co powinno byc w Z-3
// 2. Sprawdzic czy pracodawca wypelnil poprawnie
// 3. Przygotowac przypomnienie do dzialu kadr

interface Z3CheckData {
  imieNazwisko: string;
  pesel: string;
  nazwaFirmy: string;
  dataOd: string;
  dataDo: string;
  podstawaWymiaru: string; // srednie wynagrodzenie brutto
  uwagi: string;
}

type Step = 'intro' | 'dane' | 'checklist' | 'pismo' | 'done';

const EMPTY: Z3CheckData = {
  imieNazwisko: '',
  pesel: '',
  nazwaFirmy: '',
  dataOd: '',
  dataDo: '',
  podstawaWymiaru: '',
  uwagi: '',
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'intro', label: 'Informacje' },
  { key: 'dane', label: 'Twoje dane' },
  { key: 'checklist', label: 'Checklista' },
  { key: 'pismo', label: 'Pismo do kadr' },
];

const CHECKLIST_ITEMS = [
  { id: 'dane_pracownika', label: 'Dane pracownika: imie i nazwisko, PESEL, adres -- czy sa poprawne?' },
  { id: 'dane_platnika', label: 'Dane platnika skladek: NIP, REGON, nazwa firmy -- czy odpowiadaja rzeczywistosci?' },
  { id: 'okres_zatrudnienia', label: 'Okres zatrudnienia: czy data od-do jest poprawna?' },
  { id: 'podstawa_wymiaru', label: 'Podstawa wymiaru zasilku: srednie wynagrodzenie brutto z 12 ostatnich miesiecy -- czy zgadza sie z Twoimi paskami?' },
  { id: 'skladka_chorobowa', label: 'Informacja o skladce chorobowej: czy pracodawca potwierdza ze oplacal za Ciebie skladke chorobowa?' },
  { id: 'przerwy', label: 'Przerwy w ubezpieczeniu: czy sa prawidlowo uwzglednione (urlopy bezplatne, przerwy w zatrudnieniu)?' },
  { id: 'podpis', label: 'Podpis i pieczetka pracodawcy lub osoby upowazionej -- czy sa na dokumencie?' },
  { id: 'data', label: 'Data wystawienia zaswiadczenia -- czy jest wspolczesna (nie stara)?', },
];

export default function ZusZ3Page() {
  const [step, setStep] = useState<Step>('intro');
  const [data, setData] = useState<Z3CheckData>(EMPTY);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const update = (key: keyof Z3CheckData, value: string) =>
    setData(prev => ({ ...prev, [key]: value }));

  const toggleCheck = (id: string) =>
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const allChecked = CHECKLIST_ITEMS.every(item => checked[item.id]);
  const checkedCount = CHECKLIST_ITEMS.filter(item => checked[item.id]).length;

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const pismo = buildPismo(data);

  const copyPismo = () => {
    navigator.clipboard.writeText(pismo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const downloadPismo = () => {
    const blob = new Blob([pismo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prosba-o-Z3-${data.imieNazwisko.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,248,242,0.85)',
        backdropFilter: 'saturate(140%) blur(14px)',
        WebkitBackdropFilter: 'saturate(140%) blur(14px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <span style={{ display: 'inline-block', width: 9, height: 9, background: 'var(--color-pl-red)', borderRadius: '50%' }} />
            <span style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em', color: 'var(--color-text-1)' }}>
              wezmezadarmo<span className="mono" style={{ color: 'var(--color-text-3)', fontWeight: 400, fontSize: 11 }}>.com</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {step !== 'done' && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                Krok {stepIdx + 1} / {STEPS.length}
              </span>
            )}
            <Link href="/wnioski" style={{ fontSize: 13, color: 'var(--color-text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 6l-6 6 6 6"/>
              </svg>
              Wnioski
            </Link>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>Z-3</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Zaswiadczenie platnika skladek</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>Zaswiadczenie Z-3</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>Przewodnik dla pracownika -- jak sprawdzic i uzyskac Z-3 od pracodawcy</p>

        {/* Step progress bar */}
        {step !== 'done' && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 40 }}>
            {STEPS.map((s, i) => (
              <div key={s.key} style={{
                height: 3, flex: 1, borderRadius: 2,
                background: i < stepIdx ? 'var(--color-accent)' : i === stepIdx ? 'color-mix(in srgb, var(--color-accent) 50%, transparent)' : 'var(--color-border)',
                transition: 'background 300ms',
              }} />
            ))}
          </div>
        )}

        {step === 'intro' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Co to jest Z-3?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '20px 24px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zaswiadczenie platnika skladek (Z-3)</p>
                <p>Formularz Z-3 wypelnia Twoj pracodawca (platnik skladek) -- nie Ty. Zawiera informacje potrzebne ZUS do obliczenia podstawy wymiaru zasilku chorobowego lub macierzynskiego: Twoje wynagrodzenie z ostatnich 12 miesiecy, przerwy w ubezpieczeniu i inne dane.</p>
              </div>
              <div style={{ padding: '20px 24px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kiedy jest potrzebny</p>
                <p style={{ marginBottom: 10 }}>Z-3 jest potrzebny gdy ubiegasz sie o zasilek chorobowy lub inne swiadczenia i:</p>
                <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Pracodawca ma do 20 pracownikow -- wyplaca zasilek ZUS, nie pracodawca</li>
                  <li>Skladas ZAS-53 bezposrednio do ZUS</li>
                  <li>ZUS poprosi pracodawce o Z-3 podczas weryfikacji wniosku</li>
                </ul>
              </div>
              <div style={{ padding: '20px 24px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.7 }}>
                <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 8, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Co tu znajdziesz</p>
                <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>Checkliste: co sprawdzic w dokumencie otrzymanym od pracodawcy</li>
                  <li>Gotowe pismo / prosbe do dzialu kadr o wystawienie Z-3</li>
                  <li>Informacje co zrobic jesli pracodawca zwleka</li>
                </ul>
              </div>
            </div>
            <NavButtons onNext={() => setStep('dane')} nextLabel="Dalej" />
          </div>
        )}

        {step === 'dane' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Twoje dane</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Uzyjemy ich do przygotowania pisma do pracodawcy.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <Field label="Imie i nazwisko">
                <input className={IC} value={data.imieNazwisko} onChange={e => update('imieNazwisko', e.target.value)} placeholder="Jan Kowalski" />
              </Field>
              <Field label="PESEL" hint="Potrzebny w pisimie do kadr">
                <input className={IC} value={data.pesel} onChange={e => update('pesel', e.target.value)} placeholder="00000000000" maxLength={11} />
              </Field>
              <Field label="Nazwa firmy (pracodawcy)">
                <input className={IC} value={data.nazwaFirmy} onChange={e => update('nazwaFirmy', e.target.value)} placeholder="XYZ Sp. z o.o." />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Okres L4 od" hint="DD.MM.RRRR">
                  <input className={IC} value={data.dataOd} onChange={e => update('dataOd', e.target.value)} placeholder="01.05.2026" />
                </Field>
                <Field label="Okres L4 do" hint="DD.MM.RRRR">
                  <input className={IC} value={data.dataDo} onChange={e => update('dataDo', e.target.value)} placeholder="15.05.2026" />
                </Field>
              </div>
              <Field label="Twoje srednie wynagrodzenie brutto (PLN/mies.)" hint="Orientacyjna podstawa wymiaru zasilku -- sprawdzisz na paskach plac">
                <input className={IC} value={data.podstawaWymiaru} onChange={e => update('podstawaWymiaru', e.target.value)} placeholder="5000" />
              </Field>
            </div>
            <NavButtons onBack={() => setStep('intro')} onNext={() => setStep('checklist')} />
          </div>
        )}

        {step === 'checklist' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Checklista Z-3</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Gdy juz otrzymasz Z-3 od pracodawcy -- sprawdz czy zawiera wszystkie wymagane informacje.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {CHECKLIST_ITEMS.map(item => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '14px 16px',
                    background: checked[item.id] ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
                    border: `1px solid ${checked[item.id] ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 8, cursor: 'pointer',
                    transition: 'all 200ms',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={() => toggleCheck(item.id)}
                    style={{ marginTop: 2, accentColor: 'var(--color-accent)', width: 15, height: 15, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{item.label}</span>
                </label>
              ))}
            </div>

            <div style={{
              padding: '14px 18px',
              background: allChecked ? 'color-mix(in srgb, var(--color-accent) 10%, var(--color-bg-1))' : 'var(--color-bg-1)',
              border: `1px solid ${allChecked ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 8, fontSize: 13,
              color: allChecked ? 'var(--color-text-1)' : 'var(--color-text-3)',
            }}>
              {checkedCount}/{CHECKLIST_ITEMS.length} punktow zaliczonych.
              {allChecked
                ? ' Zaswiadczenie Z-3 wyglada poprawnie.'
                : ' Wróc do pracodawcy i popros o uzupelnienie brakujacych informacji.'}
            </div>

            <NavButtons onBack={() => setStep('dane')} onNext={() => setStep('pismo')} nextLabel="Przygotuj pismo do kadr" />
          </div>
        )}

        {step === 'pismo' && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Pismo do dzialu kadr</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Gotowe pismo z prosba o wystawienie Z-3. Wyslij emailem lub osobiscie.</p>

            <div className="mono" style={{
              background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
              borderRadius: 10, padding: '20px 24px',
              fontSize: 12, color: 'var(--color-text-2)',
              lineHeight: 1.8, whiteSpace: 'pre-wrap',
              boxShadow: 'var(--shadow-1)',
            }}>
              {pismo}
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={downloadPismo} className="btn btn-primary" style={{ borderRadius: 8, fontSize: 13 }}>
                Pobierz pismo (.txt)
              </button>
              <button onClick={copyPismo} className="btn btn-outline" style={{ borderRadius: 8, fontSize: 13 }}>
                {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
              </button>
            </div>

            <div style={{
              marginTop: 24, padding: '20px 24px',
              background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
              borderRadius: 10, fontSize: 13, color: 'var(--color-text-2)',
            }}>
              <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 12, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jesli pracodawca zwleka lub odmawia</p>
              <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.65 }}>
                <li>Pracodawca ma obowiazek wystawic Z-3 -- to wymog prawny (art. 61 ustawy o swiadczeniach pienieznych)</li>
                <li>Jesli zwleka ponad 7 dni -- zglós to do ZUS. ZUS moze sam zwrocic sie do pracodawcy o dane.</li>
                <li>W ostatecznosci ZUS moze sam wyliczyc podstawe na podstawie dostepnych danych z konta ubezpieczonego</li>
                <li>Mozesz tez zlozyc skarge do Panstwowej Inspekcji Pracy (PIP)</li>
              </ol>
            </div>

            <NavButtons onBack={() => setStep('checklist')} onNext={() => setStep('done')} nextLabel="Gotowe" />
          </div>
        )}

        {step === 'done' && (
          <div>
            <span className="label-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Gotowe</span>
            <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)', marginBottom: 12 }}>Informacje przygotowane</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 32, lineHeight: 1.7 }}>
              Pismo do kadr mozesz wyslac emailem lub odniesc osobiscie. Jesli juz masz Z-3, uzyj checklisty by je sprawdzic.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              <button onClick={downloadPismo} className="btn btn-primary" style={{ width: '100%', height: 50, borderRadius: 10, fontSize: 14 }}>
                Pobierz pismo do kadr (.txt)
              </button>
              <button onClick={copyPismo} className="btn btn-outline" style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13 }}>
                {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
              </button>
              <a
                href="https://www.zus.pl/wzory-formularzy"
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13, color: 'var(--color-accent)', border: '1px solid var(--color-accent)', justifyContent: 'center' }}
              >
                Formularz Z-3 na zus.pl (dla pracodawcy)
              </a>
            </div>
            <button onClick={() => { setData(EMPTY); setChecked({}); setStep('intro'); }} style={{ fontSize: 13, color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Zacznij od nowa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- HELPERS ----

function buildPismo(d: Z3CheckData): string {
  const dzis = new Date().toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const firma = d.nazwaFirmy || '[nazwa firmy]';
  const imie = d.imieNazwisko || '[imie i nazwisko]';
  const pesel = d.pesel || '[PESEL]';
  const okres = d.dataOd && d.dataDo ? `${d.dataOd} -- ${d.dataDo}` : '[okres zwolnienia]';

  return `${imie}
PESEL: ${pesel}
Data: ${dzis}

Do: Dzial kadr / Dzial plac
${firma}

PROSBA O WYSTAWIENIE ZASWIADCZENIA PLATNIKA SKLADEK (Z-3)

Szanowni Panstwo,

W zwiazku z moim zwolnieniem lekarskim na okres ${okres} i koniecznoscia uzyskania zasilku chorobowego z ZUS, uprzejmie prosze o jak najszybsze wystawienie Zaswiadczenia platnika skladek (formularz Z-3).

Zaswiadczenie jest potrzebne do:
- Obliczenia podstawy wymiaru zasilku chorobowego przez ZUS
- Zlozenia / dopelnienia wniosku o wyplate zasilku

Zgodnie z art. 61 ustawy z dnia 25 czerwca 1999 r. o swiadczeniach pienieznych z ubezpieczenia spolecznego w razie choroby i macierzyństwa, platnik skladek jest zobowiazany do wystawienia zaswiadczenia platnika skladek.

Prosze o wystawienie zaswiadczenia i:
- Przekazanie mi kopii zaswiadczenia (dla mojej dokumentacji)
- Przesłanie oryginalu do wlasciwego oddzialu ZUS lub elektronicznie przez PUE ZUS

W razie pytan jestem dostepny/dostepna pod telefonem lub emailem.

Z powazaniem,
${imie}

Wygenerowano przez: wezmezadarmo.com/wnioski/zus-z3
`;
}

// ---- SHARED ----

function NavButtons({ onBack, onNext, nextLabel = 'Dalej', nextDisabled = false }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
      {onBack ? (
        <button onClick={onBack} className="btn btn-ghost" style={{ borderRadius: 8, fontSize: 13 }}>
          Wstecz
        </button>
      ) : <div />}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="btn btn-primary"
          style={{ borderRadius: 999, fontSize: 13, opacity: nextDisabled ? 0.4 : 1, cursor: nextDisabled ? 'not-allowed' : 'pointer' }}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginBottom: 8, lineHeight: 1.5 }}>{hint}</p>}
      {children}
    </div>
  );
}

const IC = [
  'w-full bg-bg-1 border border-border rounded-[8px] px-3 py-2.5',
  'text-[13px] text-text-1 placeholder:text-text-3',
  'focus:outline-none focus:border-accent/60 transition-colors',
].join(' ');
