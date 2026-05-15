'use client';

import { useState } from 'react';
import Link from 'next/link';

// ---- TYPES ----

type Powod = 'choroba' | 'kwarantanna' | 'placowka' | 'inne';
type Relacja = 'matka' | 'ojciec' | 'opiekun';

interface Z15aData {
  // Wnioskodawca
  imieNazwisko: string;
  pesel: string;
  adres: string;
  telefon: string;
  relacjaDoZiecka: Relacja;

  // Dziecko
  imieNazwiskoDziecka: string;
  peselDziecka: string;
  dataUrodzeniaDziecka: string;

  // Opieka
  powodOpieki: Powod;
  dataOd: string;
  dataDo: string;
  drugirodzicNieMoze: string; // powod niemoznosci sprawowania opieki przez drugiego rodzica

  // Pracodawca
  nazwaPracodawcy: string;
  nipPracodawcy: string;
  adresPracodawcy: string;

  // Konto
  nrKonta: string;
}

type Step = 'wnioskodawca' | 'dziecko' | 'opieka' | 'pracodawca' | 'podglad' | 'done';

const EMPTY: Z15aData = {
  imieNazwisko: '',
  pesel: '',
  adres: '',
  telefon: '',
  relacjaDoZiecka: 'matka',
  imieNazwiskoDziecka: '',
  peselDziecka: '',
  dataUrodzeniaDziecka: '',
  powodOpieki: 'choroba',
  dataOd: '',
  dataDo: '',
  drugirodzicNieMoze: '',
  nazwaPracodawcy: '',
  nipPracodawcy: '',
  adresPracodawcy: '',
  nrKonta: '',
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'wnioskodawca', label: 'Twoje dane' },
  { key: 'dziecko', label: 'Dane dziecka' },
  { key: 'opieka', label: 'Szczegoly opieki' },
  { key: 'pracodawca', label: 'Pracodawca' },
  { key: 'podglad', label: 'Podglad' },
];

const POWOD_LABELS: Record<Powod, string> = {
  choroba: 'Choroba dziecka',
  kwarantanna: 'Kwarantanna lub izolacja dziecka',
  placowka: 'Zamkniecie zlobka, przedszkola lub szkoly',
  inne: 'Inna przyczyna',
};

// ---- COMPONENT ----

export default function ZusZ15aPage() {
  const [step, setStep] = useState<Step>('wnioskodawca');
  const [data, setData] = useState<Z15aData>(EMPTY);
  const [generatingJustification, setGeneratingJustification] = useState(false);
  const [copied, setCopied] = useState(false);

  const update = (key: keyof Z15aData, value: string) =>
    setData(prev => ({ ...prev, [key]: value }));

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const generateJustification = async () => {
    setGeneratingJustification(true);
    try {
      const res = await fetch('/api/form-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'zus-z15a-justification',
          fieldKey: 'drugirodzicNieMoze',
          fieldLabel: 'Uzasadnienie niemoznosci sprawowania opieki przez drugiego rodzica',
          fieldDescription: 'Krotkie oswiadczenie dlaczego drugi rodzic nie moze sprawowac opieki',
          profile: {
            powodOpieki: data.powodOpieki,
            relacjaDoZiecka: data.relacjaDoZiecka,
          },
        }),
      });
      const json = await res.json();
      if (json.result) update('drugirodzicNieMoze', json.result);
    } catch { /* user fills manually */ }
    setGeneratingJustification(false);
  };

  const downloadTxt = () => {
    const txt = buildOutput(data);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Z-15a-${data.imieNazwisko.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>Z-15a</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Zakład Ubezpieczeń Społecznych</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>Zasiłek opiekuńczy</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>Opieka nad chorym dzieckiem lub zamknięcie placówki</p>

        {/* Info block */}
        <div style={{
          marginBottom: 32, padding: '20px 24px',
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: 12, fontSize: 13,
          color: 'var(--color-text-2)', lineHeight: 1.7,
          boxShadow: 'var(--shadow-1)',
        }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Komu przysługuje</p>
          <p style={{ marginBottom: 14 }}>Pracownicy i zleceniobiorcy opłacający składkę chorobową, gdy opiekują się chorym dzieckiem do 14 lat lub gdy zamknięto żłobek, przedszkole albo szkołę dziecka do lat 8. Zasiłek wynosi 80% wynagrodzenia. Limit: 60 dni w roku.</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jak złożyć</p>
          <p>Ten wniosek składasz u pracodawcy (nie bezpośrednio w ZUS). Pracodawca przesyła go do ZUS elektronicznie przez PUE ZUS.</p>
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

        {/* STEPS */}
        {step === 'wnioskodawca' && (
          <StepWnioskodawca data={data} update={update} onNext={() => setStep('dziecko')} />
        )}
        {step === 'dziecko' && (
          <StepDziecko data={data} update={update} onBack={() => setStep('wnioskodawca')} onNext={() => setStep('opieka')} />
        )}
        {step === 'opieka' && (
          <StepOpieka data={data} update={update} onBack={() => setStep('dziecko')} onNext={() => setStep('pracodawca')} generating={generatingJustification} onGenerate={generateJustification} />
        )}
        {step === 'pracodawca' && (
          <StepPracodawca data={data} update={update} onBack={() => setStep('opieka')} onNext={() => setStep('podglad')} />
        )}
        {step === 'podglad' && (
          <StepPodglad data={data} onBack={() => setStep('pracodawca')} onDone={() => setStep('done')} onDownload={downloadTxt} onCopy={copyAll} copied={copied} />
        )}
        {step === 'done' && (
          <StepDone onDownload={downloadTxt} onCopy={copyAll} copied={copied} onRestart={() => { setData(EMPTY); setStep('wnioskodawca'); }} />
        )}
      </div>
    </div>
  );
}

// ---- STEP COMPONENTS ----

function StepWnioskodawca({ data, update, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string) => void; onNext: () => void }) {
  const valid = data.imieNazwisko.trim().length > 3 && data.pesel.trim().length === 11;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Twoje dane</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Imię i nazwisko *">
          <input className={IC} value={data.imieNazwisko} onChange={e => update('imieNazwisko', e.target.value)} placeholder="Jan Kowalski" />
        </Field>
        <Field label="PESEL *" hint="Wpisywany tylko lokalnie w przeglądarce, nie wysyłany na serwer">
          <input className={IC} value={data.pesel} onChange={e => update('pesel', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <Field label="Adres zamieszkania">
          <input className={IC} value={data.adres} onChange={e => update('adres', e.target.value)} placeholder="ul. Kwiatowa 1/2, 00-001 Warszawa" />
        </Field>
        <Field label="Telefon kontaktowy">
          <input className={IC} value={data.telefon} onChange={e => update('telefon', e.target.value)} placeholder="+48 600 000 000" />
        </Field>
        <Field label="Stosunek do dziecka">
          <select className={IC} value={data.relacjaDoZiecka} onChange={e => update('relacjaDoZiecka', e.target.value)}>
            <option value="matka">Matka</option>
            <option value="ojciec">Ojciec</option>
            <option value="opiekun">Opiekun prawny</option>
          </select>
        </Field>
      </div>
      <NavButtons onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepDziecko({ data, update, onBack, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string) => void; onBack: () => void; onNext: () => void }) {
  const valid = data.imieNazwiskoDziecka.trim().length > 2 && data.peselDziecka.trim().length === 11;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Dane dziecka</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Imię i nazwisko dziecka *">
          <input className={IC} value={data.imieNazwiskoDziecka} onChange={e => update('imieNazwiskoDziecka', e.target.value)} placeholder="Anna Kowalska" />
        </Field>
        <Field label="PESEL dziecka *">
          <input className={IC} value={data.peselDziecka} onChange={e => update('peselDziecka', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <Field label="Data urodzenia dziecka" hint="W formacie DD.MM.RRRR">
          <input className={IC} value={data.dataUrodzeniaDziecka} onChange={e => update('dataUrodzeniaDziecka', e.target.value)} placeholder="15.03.2018" />
        </Field>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          Zasiłek opiekuńczy przysługuje na dziecko do 14 lat (lub do 18 lat przy niepełnosprawności). Po ukończeniu 14 lat dziecka należy złożyć formularz Z-15b.
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepOpieka({ data, update, onBack, onNext, generating, onGenerate }: {
  data: Z15aData; update: (k: keyof Z15aData, v: string) => void;
  onBack: () => void; onNext: () => void;
  generating: boolean; onGenerate: () => void;
}) {
  const valid = data.dataOd.trim().length > 0 && data.dataDo.trim().length > 0;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Szczegóły opieki</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Powód sprawowania opieki *">
          <select className={IC} value={data.powodOpieki} onChange={e => update('powodOpieki', e.target.value as Powod)}>
            {(Object.entries(POWOD_LABELS) as [Powod, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Data od *" hint="DD.MM.RRRR">
            <input className={IC} value={data.dataOd} onChange={e => update('dataOd', e.target.value)} placeholder="01.05.2026" />
          </Field>
          <Field label="Data do *" hint="DD.MM.RRRR">
            <input className={IC} value={data.dataDo} onChange={e => update('dataDo', e.target.value)} placeholder="05.05.2026" />
          </Field>
        </div>
        <Field label="Dlaczego drugi rodzic nie może sprawować opieki?" hint="Krótkie oświadczenie. Możesz wygenerować z AI lub wpisać samodzielnie.">
          <div>
            <textarea
              className={IC}
              style={{ minHeight: 80, resize: 'none', display: 'block', width: '100%', marginBottom: 8 }}
              value={data.drugirodzicNieMoze}
              onChange={e => update('drugirodzicNieMoze', e.target.value)}
              placeholder="Drugi rodzic nie może sprawować opieki ponieważ..."
            />
            <button
              onClick={onGenerate}
              disabled={generating}
              style={{ fontSize: 12, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: generating ? 'wait' : 'pointer', opacity: generating ? 0.5 : 1 }}
            >
              {generating ? 'Generuje...' : 'Wygeneruj z AI'}
            </button>
          </div>
        </Field>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 4 }}>Przykładowe uzasadnienia</p>
          <p>Pracuje zawodowo i nie może wziąć urlopu bez ważnej przyczyny. / Przebywa w delegacji służbowej. / Nie ma prawa do zasiłku opiekuńczego (prowadzi działalność bez ubezpieczenia chorobowego).</p>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepPracodawca({ data, update, onBack, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Dane pracodawcy</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Znajdziesz na umowie o pracę lub pasku wynagrodzenia.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Nazwa pracodawcy">
          <input className={IC} value={data.nazwaPracodawcy} onChange={e => update('nazwaPracodawcy', e.target.value)} placeholder="XYZ Sp. z o.o." />
        </Field>
        <Field label="NIP pracodawcy">
          <input className={IC} value={data.nipPracodawcy} onChange={e => update('nipPracodawcy', e.target.value)} placeholder="0000000000" maxLength={10} />
        </Field>
        <Field label="Adres pracodawcy">
          <input className={IC} value={data.adresPracodawcy} onChange={e => update('adresPracodawcy', e.target.value)} placeholder="ul. Firmowa 10, 00-001 Warszawa" />
        </Field>
        <Field label="Numer rachunku bankowego do wypłaty" hint="Format: PL00 0000 0000 0000 0000 0000 0000">
          <input className={IC} value={data.nrKonta} onChange={e => update('nrKonta', e.target.value)} placeholder="PL00 0000 0000 0000 0000 0000 0000" />
        </Field>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          Jeśli pracujesz u małego pracodawcy (do 20 osób), zasiłek wypłaca ZUS bezpośrednio. Jeśli u dużego (ponad 20 osób), wypłaca pracodawca i rozlicza się z ZUS. W obu przypadkach wniosek składasz u pracodawcy.
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Podgląd wniosku" />
    </div>
  );
}

function StepPodglad({ data, onBack, onDone, onDownload, onCopy, copied }: {
  data: Z15aData; onBack: () => void; onDone: () => void;
  onDownload: () => void; onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Podgląd wniosku Z-15a</h2>
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
        <button onClick={onDownload} className="btn btn-primary" style={{ borderRadius: 8, fontSize: 13 }}>
          Pobierz .txt
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
        <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 12, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Co zrobić dalej</p>
        <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.65 }}>
          <li>Pobierz oryginalny formularz Z-15a ze strony <a href="https://www.zus.pl/wzory-formularzy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>zus.pl/wzory-formularzy</a></li>
          <li>Przepisz dane z pobranego pliku do oryginalnego formularza PDF</li>
          <li>Dołącz zwolnienie lekarskie dziecka (e-ZLA) lub zaświadczenie o zamknięciu placówki</li>
          <li>Złóż wniosek u swojego pracodawcy (nie bezpośrednio w ZUS)</li>
          <li>Pracodawca prześle wniosek do ZUS przez PUE ZUS</li>
          <li>Zasiłek zostanie wypłacony w terminie wynagrodzenia lub przez ZUS (do 30 dni)</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-3)' }}>Potrzebne dokumenty: e-ZLA lub zaświadczenie o zamknięciu placówki.</p>
      </div>

      <NavButtons onBack={onBack} onNext={onDone} nextLabel="Gotowe" />
    </div>
  );
}

function StepDone({ onDownload, onCopy, copied, onRestart }: { onDownload: () => void; onCopy: () => void; copied: boolean; onRestart: () => void }) {
  return (
    <div>
      <span className="label-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Gotowe</span>
      <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)', marginBottom: 12 }}>Wniosek przygotowany</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 32, lineHeight: 1.7 }}>
        Oryginalny formularz Z-15a pobierz ze strony zus.pl, przepisz dane z pliku i złóż go u pracodawcy. Do wniosku dołącz e-ZLA od lekarza lub zaświadczenie o zamknięciu placówki.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <button onClick={onDownload} className="btn btn-primary" style={{ width: '100%', height: 50, borderRadius: 10, fontSize: 14 }}>
          Pobierz Z-15a (.txt)
        </button>
        <button onClick={onCopy} className="btn btn-outline" style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13 }}>
          {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
        </button>
        <a
          href="https://www.zus.pl/wzory-formularzy"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13, color: 'var(--color-accent)', border: '1px solid var(--color-accent)', justifyContent: 'center' }}
        >
          Oryginalny formularz Z-15a na zus.pl
        </a>
      </div>
      <button onClick={onRestart} style={{ fontSize: 13, color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
        Wypełnij nowy wniosek
      </button>
    </div>
  );
}

// ---- HELPERS ----

function buildOutput(d: Z15aData): string {
  return `WNIOSEK Z-15a
Wniosek o zasilek opiekuńczy z powodu sprawowania opieki nad chorym dzieckiem
lub z powodu zamkniecia zlobka, przedszkola lub szkoly

========================================

DANE WNIOSKODAWCY
Imie i nazwisko: ${d.imieNazwisko}
PESEL: ${d.pesel}
Adres: ${d.adres}
Telefon: ${d.telefon}
Stosunek do dziecka: ${d.relacjaDoZiecka}

DANE DZIECKA
Imie i nazwisko: ${d.imieNazwiskoDziecka}
PESEL: ${d.peselDziecka}
Data urodzenia: ${d.dataUrodzeniaDziecka}

OPIEKA
Powod sprawowania opieki: ${POWOD_LABELS[d.powodOpieki]}
Okres opieki od: ${d.dataOd}
Okres opieki do: ${d.dataDo}

Oswiadczam, ze wspolmałzonek / drugi rodzic nie moze sprawowac opieki, poniewaz:
${d.drugirodzicNieMoze}

DANE PRACODAWCY
Nazwa: ${d.nazwaPracodawcy}
NIP: ${d.nipPracodawcy}
Adres: ${d.adresPracodawcy}

Numer rachunku bankowego: ${d.nrKonta}

========================================

Oswiadczam, ze dane podane we wniosku są prawdziwe i zgodne ze stanem faktycznym.

Data: .........................
Podpis wnioskodawcy: .........................

========================================

INSTRUKCJA ZŁOZENIA:
1. Pobierz oryginalny formularz Z-15a z: https://www.zus.pl/wzory-formularzy
2. Przepisz powyzsze dane do oryginalnego formularza
3. Dolacz e-ZLA (zwolnienie lekarskie) lub zaswiadczenie o zamknieciu placowki
4. Zloz u pracodawcy (nie bezposrednio w ZUS)
5. Zasilek zostanie wyplacony przy najblizszym terminie wynagrodzenia

Wygenerowano przez: wezmezadarmo.com/wnioski/zus-z15a
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
