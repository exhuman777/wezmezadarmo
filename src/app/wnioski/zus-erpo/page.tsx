'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DateInput } from '@/components/DateInput';
import { FormChatWidget } from '@/components/FormChatWidget';

// ---- TYPES ----

type RodzajEmerytury = 'zwykła' | 'częściowa' | 'pomostowa';
type FormaZatrudnienia = 'pracownik' | 'przedsiębiorca' | 'rolnik' | 'inne';

interface ErpoData {
  // Wnioskodawca
  imieNazwisko: string;
  imieOjca: string;
  pesel: string;
  adres: string;
  telefon: string;
  email: string;
  płeć: 'K' | 'M';

  // Emerytura
  rodzajEmerytury: RodzajEmerytury;
  dataUrodzenia: string; // potrzebna do sprawdzenia wieku
  formaZatrudnienia: FormaZatrudnienia;
  latPracy: string; // szacunkowe
  latSkładkowych: string;

  // Konto bankowe
  nrKonta: string;

  // Dodatkowe
  pobieraRente: 'tak' | 'nie';
  numerDecyzjiRentowej: string;
}

type Step = 'wnioskodawca' | 'emerytura' | 'dokumenty' | 'konto' | 'podgląd' | 'done';

const EMPTY: ErpoData = {
  imieNazwisko: '',
  imieOjca: '',
  pesel: '',
  adres: '',
  telefon: '',
  email: '',
  płeć: 'K',
  rodzajEmerytury: 'zwykła',
  dataUrodzenia: '',
  formaZatrudnienia: 'pracownik',
  latPracy: '',
  latSkładkowych: '',
  nrKonta: '',
  pobieraRente: 'nie',
  numerDecyzjiRentowej: '',
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'wnioskodawca', label: 'Twoje dane' },
  { key: 'emerytura', label: 'Rodzaj emerytury' },
  { key: 'dokumenty', label: 'Dokumenty' },
  { key: 'konto', label: 'Konto bankowe' },
  { key: 'podgląd', label: 'Podgląd' },
];

const RODZAJ_LABELS: Record<RodzajEmerytury, string> = {
  zwykła: 'Emerytura zwykła (po osiągnięciu wieku emerytalnego)',
  częściowa: 'Emerytura częściowa (wiek emerytalny - 5 lat i 25/30 lat stażu)',
  pomostowa: 'Emerytura pomostowa (praca w szczególnych warunkach)',
};

const FORMA_LABELS: Record<FormaZatrudnienia, string> = {
  pracownik: 'Pracownik etatowy (umowa o pracę)',
  przedsiębiorca: 'Osoba prowadząca działalność gospodarczą',
  rolnik: 'Rolnik (ubezpieczony w KRUS)',
  inne: 'Inna forma (zlecenie, domownik, itp.)',
};

// Minimalny staż składkowy i nieskładkowy do emerytury
const MIN_STAZ = { K: 20, M: 25 }; // lata
const WIEK_EMERYTALNY = { K: 60, M: 65 }; // lata

// ---- COMPONENT ----

export default function ZusErpoPage() {
  const [step, setStep] = useState<Step>('wnioskodawca');
  const [data, setData] = useState<ErpoData>(EMPTY);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const update = (key: keyof ErpoData, value: string) =>
    setData(prev => ({ ...prev, [key]: value }));

  const stepIdx = STEPS.findIndex(s => s.key === step);

  // Check basic eligibility
  const wiekEmerytalny = WIEK_EMERYTALNY[data.płeć];
  const minStaz = MIN_STAZ[data.płeć];

  const downloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'zus-erpo', data }),
      });
      if (!res.ok) throw new Error('PDF error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ERPO-${data.imieNazwisko.replace(/\s+/g, '-') || 'wniosek'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Błąd generowania PDF. Użyj opcji kopiowania do schowka.');
    }
    setDownloadingPdf(false);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(buildOutput(data)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(236,242,236,0.85)',
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
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>ERPO</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Zaklad Ubezpieczeń Spolecznych</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>Wniosek o emeryturę</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>Przygotuj dane do wniosku ERPO / Emerytura+</p>

        {/* Info block */}
        <div style={{
          marginBottom: 32, padding: '20px 24px',
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: 12, fontSize: 13,
          color: 'var(--color-text-2)', lineHeight: 1.7,
          boxShadow: 'var(--shadow-1)',
        }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wiek emerytalny</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div style={{ padding: '10px 14px', background: 'var(--color-bg-0)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginBottom: 4 }}>Kobiety</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-accent)' }}>60 lat</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>min. 20 lat stażu</div>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--color-bg-0)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginBottom: 4 }}>Mężczyźni</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--color-accent)' }}>65 lat</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>min. 25 lat stażu</div>
            </div>
          </div>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jak złożyć</p>
          <p>Wniosek ERPO można złożyć przez PUE ZUS (online z profilem zaufanym), osobiście w oddziale ZUS lub listownie. Najwygodniej przez PUE ZUS -- przetwarza się szybciej.</p>
        </div>

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

        {step === 'wnioskodawca' && <StepWnioskodawca data={data} update={update} onNext={() => setStep('emerytura')} />}
        {step === 'emerytura' && <StepEmerytura data={data} update={update} wiekEmerytalny={wiekEmerytalny} minStaz={minStaz} onBack={() => setStep('wnioskodawca')} onNext={() => setStep('dokumenty')} />}
        {step === 'dokumenty' && <StepDokumenty data={data} onBack={() => setStep('emerytura')} onNext={() => setStep('konto')} />}
        {step === 'konto' && <StepKonto data={data} update={update} onBack={() => setStep('dokumenty')} onNext={() => setStep('podgląd')} />}
        {step === 'podgląd' && <StepPodgląd data={data} onBack={() => setStep('konto')} onDone={() => setStep('done')} onDownloadPdf={downloadPdf} downloadingPdf={downloadingPdf} onCopy={copyAll} copied={copied} />}
        {step === 'done' && <StepDone onDownloadPdf={downloadPdf} downloadingPdf={downloadingPdf} onCopy={copyAll} copied={copied} onRestart={() => { setData(EMPTY); setStep('wnioskodawca'); }} />}
      </div>
      <FormChatWidget formType="zus-erpo" />
    </div>
  );
}

// ---- STEP COMPONENTS ----

function StepWnioskodawca({ data, update, onNext }: { data: ErpoData; update: (k: keyof ErpoData, v: string) => void; onNext: () => void }) {
  const valid = data.imieNazwisko.trim().length > 3 && data.pesel.trim().length === 11;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Twoje dane osobowe</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Imię i nazwisko *">
          <input className={IC} value={data.imieNazwisko} onChange={e => update('imieNazwisko', e.target.value)} placeholder="Jan Kowalski" />
        </Field>
        <Field label="Imię ojca">
          <input className={IC} value={data.imieOjca} onChange={e => update('imieOjca', e.target.value)} placeholder="Adam" />
        </Field>
        <Field label="PESEL *" hint="Przesyłany na serwer wyłącznie do wygenerowania PDF, bez zapisu">
          <input className={IC} value={data.pesel} onChange={e => update('pesel', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <Field label="Płeć">
          <select className={IC} value={data.płeć} onChange={e => update('płeć', e.target.value as 'K' | 'M')}>
            <option value="K">Kobieta</option>
            <option value="M">Mężczyzna</option>
          </select>
        </Field>
        <Field label="Adres zamieszkania">
          <input className={IC} value={data.adres} onChange={e => update('adres', e.target.value)} placeholder="ul. Kwiatowa 1/2, 00-001 Warszawa" />
        </Field>
        <Field label="Telefon kontaktowy">
          <input className={IC} value={data.telefon} onChange={e => update('telefon', e.target.value)} placeholder="+48 600 000 000" />
        </Field>
        <Field label="Adres e-mail" hint="Opcjonalnie: ZUS może wysłać decyzję e-mailem">
          <input className={IC} value={data.email} onChange={e => update('email', e.target.value)} placeholder="jan@przyklad.pl" type="email" />
        </Field>
      </div>
      <NavButtons onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepEmerytura({ data, update, wiekEmerytalny, minStaz, onBack, onNext }: {
  data: ErpoData; update: (k: keyof ErpoData, v: string) => void;
  wiekEmerytalny: number; minStaz: number;
  onBack: () => void; onNext: () => void;
}) {
  const latPracyNum = parseInt(data.latSkładkowych) || 0;
  const stazeOK = latPracyNum >= minStaz;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Szczegoly emerytury</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Rodzaj emerytury *">
          <select className={IC} value={data.rodzajEmerytury} onChange={e => update('rodzajEmerytury', e.target.value as RodzajEmerytury)}>
            {(Object.entries(RODZAJ_LABELS) as [RodzajEmerytury, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Data urodzenia" hint="DD.MM.RRRR -- do weryfikacji wieku emerytalnego">
          <DateInput className={IC} value={data.dataUrodzenia} onChange={v => update('dataUrodzenia', v)} placeholder="15.03.1964" />
        </Field>
        <Field label="Główna forma zatrudnienia przez większość kariery">
          <select className={IC} value={data.formaZatrudnienia} onChange={e => update('formaZatrudnienia', e.target.value as FormaZatrudnienia)}>
            {(Object.entries(FORMA_LABELS) as [FormaZatrudnienia, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Szacunkowy łączny staz pracy (lata)" hint="Okresy składkowe i nieskładkowe razem">
          <input className={IC} value={data.latPracy} onChange={e => update('latPracy', e.target.value)} placeholder="35" type="number" min="0" max="50" />
        </Field>
        <Field label="Z czego okresy składkowe (lata)" hint={`Lata w których oplacane byly składki na ubezpieczenie emerytalne. Minimum dla Ciebie: ${minStaz} lat.`}>
          <input className={IC} value={data.latSkładkowych} onChange={e => update('latSkładkowych', e.target.value)} placeholder={String(minStaz)} type="number" min="0" max="50" />
        </Field>

        {data.latSkładkowych && (
          <div style={{
            padding: '14px 18px',
            background: stazeOK ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'rgba(200,50,50,0.08)',
            border: `1px solid ${stazeOK ? 'var(--color-accent)' : 'rgba(200,50,50,0.3)'}`,
            borderRadius: 8, fontSize: 13,
            color: stazeOK ? 'var(--color-text-1)' : 'var(--color-text-2)',
          }}>
            {stazeOK
              ? `Staz składkowy wystarczajacy. Wymagane minimum: ${minStaz} lat. Masz: ${latPracyNum} lat.`
              : `Uwaga: wymagane minimum to ${minStaz} lat stażu składkowego. Wpisałaś/eś ${latPracyNum} lat. Skonsultuj z ZUS -- mozliwa emerytura na innych zasadach.`
            }
          </div>
        )}

        <Field label="Czy aktualnie pobierasz rente z ZUS?">
          <select className={IC} value={data.pobieraRente} onChange={e => update('pobieraRente', e.target.value as 'tak' | 'nie')}>
            <option value="nie">Nie</option>
            <option value="tak">Tak</option>
          </select>
        </Field>
        {data.pobieraRente === 'tak' && (
          <Field label="Numer decyzji rentowej" hint="Znajdziesz w decyzji ZUS lub na legitimacji rencisty">
            <input className={IC} value={data.numerDecyzjiRentowej} onChange={e => update('numerDecyzjiRentowej', e.target.value)} placeholder="NRI---------" />
          </Field>
        )}

        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 4 }}>Ważne: historia zatrudnienia</p>
          <p>Wniosek ERPO wymaga podania pełnej historii zatrudnienia (pracodawcy, okresy, rodzaj ubezpieczenia). ZUS posiada dane z systemu od 1999 r. Dla wczesniejszych okresow potrzebne sa świadectwa pracy z archiwum. Ten kreator pomaga przygotowac dane. Pelna historia jest wymagana na formularzu oryginalnym.</p>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepDokumenty({ data, onBack, onNext }: { data: ErpoData; onBack: () => void; onNext: () => void }) {
  const DOCS_PODSTAWOWE = [
    'Dokument tozsamosci (dowod osobisty lub paszport)',
    'PESEL (wystarczy podać numer)',
    data.pobieraRente === 'tak' ? 'Decyzja o przyznaniu renty z ZUS' : null,
  ].filter(Boolean) as string[];

  const DOCS_ZATRUDNIENIE = [
    'Świadectwa pracy lub inne dokumenty potwierdzające okresy zatrudnienia',
    'Zaświadczenia o zatrudnieniu i wynagrodzeniu z poszczególnych lat (ZUS Rp-7) -- potrzebne do obliczenia wysokości emerytury',
    'Dokumenty potwierdzające okresy rownoważne składkowym (urlop wychowawczy, sluzba wojskowa, studia, dla lat sprzed 1999)',
  ];

  const DOCS_DODATKOWE: string[] = [];
  if (data.rodzajEmerytury === 'pomostowa') {
    DOCS_DODATKOWE.push('Zaświadczenie pracodawcy o pracy w szczególnych warunkach lub o szczególnym charakterze (wzór ZUS Rp-6)');
    DOCS_DODATKOWE.push('Świadectwo pracy z wymienionym kodem pracy szczególnej');
  }
  if (data.rodzajEmerytury === 'częściowa') {
    DOCS_DODATKOWE.push('Dokumenty potwierdzające dlugi staz pracy: min. 35 lat dla kobiet lub 40 lat dla mezczyzn');
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Potrzebne dokumenty</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Przygotuj poniższe dokumenty przed złożeniem wniosku ERPO.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <DocSection title="Dokumenty podstawowe" docs={DOCS_PODSTAWOWE} />
        <DocSection title="Historia zatrudnienia" docs={DOCS_ZATRUDNIENIE} />
        {DOCS_DODATKOWE.length > 0 && (
          <DocSection title={`Dodatkowe -- ${data.rodzajEmerytury === 'pomostowa' ? 'emerytura pomostowa' : 'emerytura częściowa'}`} docs={DOCS_DODATKOWE} />
        )}

        <div style={{ padding: '16px 20px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.65 }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 8 }}>Archiwum dokumentow</p>
          <p style={{ marginBottom: 8 }}>Jeśli pracodawca nie istnieje lub dokumenty zaginęły:</p>
          <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>ZUS posiada dane od 1999 r. automatycznie</li>
            <li>Dla lat wcześniejszych: Archiwum Państwowe lub Krajowe Centrum Informacji Kryminalnej</li>
            <li>ZETO / COIG dla danych z lat 80-90 z duzych zakładów pracy</li>
            <li>Świadkowie pracy: możliwe poświadczenie zeznaniami (wymagane wnioskowanie do ZUS)</li>
          </ul>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function DocSection({ title, docs }: { title: string; docs: string[] }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {docs.map((doc, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '12px 14px',
            background: 'var(--color-bg-1)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
          }}>
            <span style={{ color: 'var(--color-accent)', fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>--</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{doc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepKonto({ data, update, onBack, onNext }: { data: ErpoData; update: (k: keyof ErpoData, v: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Konto bankowe</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>ZUS będzie wypłacac emeryturę na ten rachunek.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Numer rachunku bankowego" hint="Format: PL00 0000 0000 0000 0000 0000 0000">
          <input className={IC} value={data.nrKonta} onChange={e => update('nrKonta', e.target.value)} placeholder="PL00 0000 0000 0000 0000 0000 0000" />
        </Field>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          Jeśli nie masz konta lub nie chcesz podawac, ZUS wypłaci emeryturę na poczcie. Podanie konta bankowego przyspiesza wypłatę i eliminuje ryzyko zaginiocia przekazu.
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Podgląd" />
    </div>
  );
}

function StepPodgląd({ data, onBack, onDone, onDownloadPdf, downloadingPdf, onCopy, copied }: {
  data: ErpoData; onBack: () => void; onDone: () => void;
  onDownloadPdf: () => void; downloadingPdf: boolean;
  onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Podgląd danych do wniosku ERPO</h2>
      <div className="mono" style={{
        background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
        borderRadius: 10, padding: '20px 24px',
        fontSize: 12, color: 'var(--color-text-2)',
        lineHeight: 1.8, whiteSpace: 'pre-wrap',
        boxShadow: 'var(--shadow-1)',
      }}>
        {buildOutput(data)}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="btn btn-primary"
          style={{ borderRadius: 8, fontSize: 13, opacity: downloadingPdf ? 0.6 : 1, cursor: downloadingPdf ? 'wait' : 'pointer' }}
        >
          {downloadingPdf ? 'Generuje PDF...' : 'Pobierz PDF'}
        </button>
        <button onClick={onCopy} className="btn btn-outline" style={{ borderRadius: 8, fontSize: 13 }}>
          {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
        </button>
      </div>

      <div style={{
        marginTop: 24, padding: '20px 24px',
        background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
        borderRadius: 10, fontSize: 13, color: 'var(--color-text-2)',
        boxShadow: 'var(--shadow-1)',
      }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 12, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jak złożyć wniosek ERPO</p>
        <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.65 }}>
          <li><strong style={{ color: 'var(--color-text-1)' }}>Online (najszybciej):</strong> Zaloguj się do <a href="https://www.zus.pl/pue" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>PUE ZUS</a> profilem zaufanym. Wniosek ERPO dostępny w sekcji "Emerytury i renty"</li>
          <li><strong style={{ color: 'var(--color-text-1)' }}>Osobiście:</strong> W kazdym oddziale ZUS. Możesz umowic wizyte online lub przyjsc bez kolejki w wyznaczonych godzinach.</li>
          <li><strong style={{ color: 'var(--color-text-1)' }}>Pocztą:</strong> Na adres oddziału ZUS właściwego dla miejsca zamieszkania. Zachowaj potwierdzenie nadania.</li>
          <li>ZUS wyda decyzje w ciagu 30 dni od złożenia kompletnego wniosku.</li>
          <li>Emerytura przysługuje od miesiąca złożenia wniosku (nie wstecznie) -- nie zwlekaj z wnioskiem po osiągnięciu wieku emerytalnego.</li>
        </ol>
      </div>

      <NavButtons onBack={onBack} onNext={onDone} nextLabel="Gotowe" />
    </div>
  );
}

function StepDone({ onDownloadPdf, downloadingPdf, onCopy, copied, onRestart }: {
  onDownloadPdf: () => void; downloadingPdf: boolean;
  onCopy: () => void; copied: boolean; onRestart: () => void
}) {
  return (
    <div>
      <span className="label-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Gotowe</span>
      <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)', marginBottom: 12 }}>Dane do wniosku ERPO przygotowane</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 32, lineHeight: 1.7 }}>
        PDF zawiera Twoje dane i wskazowki. Uzupełnij pełny formularz ERPO przez PUE ZUS lub w oddziale ZUS.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="btn btn-primary"
          style={{ width: '100%', height: 50, borderRadius: 10, fontSize: 14, opacity: downloadingPdf ? 0.6 : 1, cursor: downloadingPdf ? 'wait' : 'pointer' }}
        >
          {downloadingPdf ? 'Generuje PDF...' : 'Pobierz dane ERPO (PDF)'}
        </button>
        <button onClick={onCopy} className="btn btn-outline" style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13 }}>
          {copied ? 'Skopiowano!' : 'Kopiuj dane do schowka'}
        </button>
        <a
          href="https://www.zus.pl/pue"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13, color: 'var(--color-accent)', border: '1px solid var(--color-accent)', justifyContent: 'center' }}
        >
          Złóż wniosek przez PUE ZUS
        </a>
      </div>
      <button onClick={onRestart} style={{ fontSize: 13, color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
        Wypełnij ponownie
      </button>
    </div>
  );
}

// ---- HELPERS ----

function buildOutput(d: ErpoData): string {
  const rodzajLabel = RODZAJ_LABELS[d.rodzajEmerytury];
  const formaLabel = FORMA_LABELS[d.formaZatrudnienia];

  return `DANE DO WNIOSKU ERPO
Wniosek o przyznanie emerytury
Przygotowane przez kreator wezmezadarmo.com

========================================

DANE WNIOSKODAWCY
Imię i nazwisko: ${d.imieNazwisko}
Imię ojca: ${d.imieOjca}
PESEL: ${d.pesel}
Płeć: ${d.płeć === 'K' ? 'Kobieta' : 'Mężczyzna'}
Data urodzenia: ${d.dataUrodzenia}
Adres zamieszkania: ${d.adres}
Telefon: ${d.telefon}
Email: ${d.email}

SZCZEGOLY EMERYTURY
Rodzaj świadczenia: ${rodzajLabel}
Główna forma zatrudnienia: ${formaLabel}
Laczny staz pracy (szacunek): ${d.latPracy} lat
W tym okresy składkowe: ${d.latSkładkowych} lat
${d.pobieraRente === 'tak' ? `Aktualnie pobierana renta: TAK\nNumer decyzji rentowej: ${d.numerDecyzjiRentowej}` : 'Aktualnie pobierana renta: NIE'}

WYPLATA SWIADCZENIA
Numer rachunku bankowego: ${d.nrKonta || '(nie podano - wypłata przekazem pocztowym)'}

========================================

UWAGA: To sa dane przygotowawcze.
Pelny wniosek ERPO należy wypełnić w systemie PUE ZUS lub na formularzu papierowym
dostępnym w oddziale ZUS. Wymagane jest podanie pełnej historii zatrudnienia
z datami i nazwami pracodawców.

INSTRUKCJA ZLOZENIA:
1. Zaloguj się do PUE ZUS: https://www.zus.pl/pue
2. Wybierz: "Emerytury i renty" -> "Wniosek o emeryturę (ERPO)"
3. Uzupełnij formularz korzystając z powyższych danych
4. Dołącz dokumenty potwierdzające historie zatrudnienia
5. Podpisz profilem zaufanym i wyślij

Alternatywnie: osobiście w oddziale ZUS lub listem poleconym.

Wygenerowano przez: wezmezadarmo.com/wnioski/zus-erpo
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
