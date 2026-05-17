'use client';

import { useState } from 'react';
import Link from 'next/link';

// ---- TYPES ----

type RelacjaOpiekun = 'malzonek' | 'rodzic' | 'tesciowie' | 'rodzenstwo' | 'dziecko' | 'dziadek' | 'wnuk' | 'inne';

interface Z15bData {
  // Twoje dane
  imie: string;
  nazwisko: string;
  pesel: string;
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowosc: string;
  telefon: string;

  // Dane platnika skladek
  nazwaPlatinika: string;
  nipPlatnika: string;
  regonPlatnika: string;

  // Konto bankowe
  nrKonta: string;

  // Okres i e-ZLA
  dataOd: string;
  dataDo: string;
  numerEzla: string; // opcjonalny

  // Dane osoby nad ktora sprawujesz opieke
  imieChory: string;
  nazwiskoChory: string;
  peselChory: string;
  dataUrodzChory: string;
  relacjaDoMnie: RelacjaOpiekun;

  // Oswiadczenia
  jestDomownik: 'tak' | 'nie'; // czy jest ktos inny w domu mogacy sprawowac opieke
  domownikDni: string; // jesli tak -- w jakich dniach
  wspolneGospodarstwo: 'tak' | 'nie'; // czy mieszkasz wspolnie z chorym
  zmianaPlatnika: 'tak' | 'nie' | 'nie-zmienialem'; // czy zmieniles platnika w tym roku

  // Dane malzonka
  brakMalzonka: boolean;
  imieNazwiskoMalzonka: string;
  peselMalzonka: string;
  malzonekPracuje: 'tak' | 'nie';
  malzonekZasilek: 'tak' | 'nie';
  malzonekDniDorosli: string; // dni zasilku na chorych doroslych przez malzonka
}

type Step = 'wnioskodawca' | 'platnik' | 'ezla' | 'chory' | 'oswiadczenia' | 'malzonek' | 'podglad' | 'done';

const EMPTY: Z15bData = {
  imie: '',
  nazwisko: '',
  pesel: '',
  ulica: '',
  nrDomu: '',
  nrLokalu: '',
  kodPocztowy: '',
  miejscowosc: '',
  telefon: '',
  nazwaPlatinika: '',
  nipPlatnika: '',
  regonPlatnika: '',
  nrKonta: '',
  dataOd: '',
  dataDo: '',
  numerEzla: '',
  imieChory: '',
  nazwiskoChory: '',
  peselChory: '',
  dataUrodzChory: '',
  relacjaDoMnie: 'malzonek',
  jestDomownik: 'nie',
  domownikDni: '',
  wspolneGospodarstwo: 'tak',
  zmianaPlatnika: 'nie-zmienialem',
  brakMalzonka: false,
  imieNazwiskoMalzonka: '',
  peselMalzonka: '',
  malzonekPracuje: 'tak',
  malzonekZasilek: 'nie',
  malzonekDniDorosli: '',
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'wnioskodawca', label: 'Twoje dane' },
  { key: 'platnik', label: 'Pracodawca' },
  { key: 'ezla', label: 'Okres i e-ZLA' },
  { key: 'chory', label: 'Podopieczny' },
  { key: 'oswiadczenia', label: 'Oswiadczenia' },
  { key: 'malzonek', label: 'Malzonek' },
  { key: 'podglad', label: 'Podglad' },
];

const RELACJA_LABELS: Record<RelacjaOpiekun, string> = {
  malzonek: 'Malzonek / malzonka',
  rodzic: 'Rodzic (ojciec / matka)',
  tesciowie: 'Tesciowie',
  rodzenstwo: 'Rodzenstwo',
  dziecko: 'Dziecko powyzej 14 lat',
  dziadek: 'Dziadek / babcia',
  wnuk: 'Wnuk / wnuczka',
  inne: 'Inny czlonek rodziny',
};

// ---- COMPONENT ----

export default function ZusZ15bPage() {
  const [step, setStep] = useState<Step>('wnioskodawca');
  const [data, setData] = useState<Z15bData>(EMPTY);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const update = (key: keyof Z15bData, value: string | boolean) =>
    setData(prev => ({ ...prev, [key]: value }));

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const downloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'zus-z15b', data }),
      });
      if (!res.ok) throw new Error('PDF error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Z-15b-${(data.imie + '-' + data.nazwisko).replace(/\s+/g, '-') || 'wniosek'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Blad generowania PDF. Uzyj opcji kopiowania do schowka.');
    }
    setDownloadingPdf(false);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(buildOutput(data)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // helper for downloadPdf -- needs imieNazwisko as one string
  const dataWithCombined = { ...data, imieNazwisko: `${data.imie} ${data.nazwisko}`.trim() };

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
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>Z-15b</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Zaklad Ubezpieczen Spolecznych</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>Zasilek opiekuńczy</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>Opieka nad chorym czlonkiem rodziny powyzej 14 lat (innym niz dziecko)</p>

        {/* Info block */}
        <div style={{
          marginBottom: 32, padding: '20px 24px',
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: 12, fontSize: 13,
          color: 'var(--color-text-2)', lineHeight: 1.7,
          boxShadow: 'var(--shadow-1)',
        }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Komu przysluguje</p>
          <p style={{ marginBottom: 14 }}>Pracownicy i zleceniobiorcy oplacajacy skladke chorobowa, opiekujacy sie chorym malzonkiem, rodzicem, rodzicem dziecka, dziadkiem, wnukiem lub rodzenstwem -- prowadzacym z nimi wspolne gospodarstwo domowe. Zasilek 80% wynagrodzenia. Limit: 14 dni w roku (30 dni dla niepelnosprawnych doroslych).</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jak zlozyc</p>
          <p>Wniosek skladasz u pracodawcy (platnika skladek), nie bezposrednio w ZUS. Pracodawca przesyla go elektronicznie przez PUE ZUS.</p>
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

        {step === 'wnioskodawca' && <StepWnioskodawca data={data} update={update} onNext={() => setStep('platnik')} />}
        {step === 'platnik' && <StepPlatnik data={data} update={update} onBack={() => setStep('wnioskodawca')} onNext={() => setStep('ezla')} />}
        {step === 'ezla' && <StepEzla data={data} update={update} onBack={() => setStep('platnik')} onNext={() => setStep('chory')} />}
        {step === 'chory' && <StepChory data={data} update={update} onBack={() => setStep('ezla')} onNext={() => setStep('oswiadczenia')} />}
        {step === 'oswiadczenia' && <StepOswiadczenia data={data} update={update} onBack={() => setStep('chory')} onNext={() => setStep('malzonek')} />}
        {step === 'malzonek' && <StepMalzonek data={data} update={update} onBack={() => setStep('oswiadczenia')} onNext={() => setStep('podglad')} />}
        {step === 'podglad' && (
          <StepPodglad
            data={data}
            onBack={() => setStep('malzonek')}
            onDone={() => setStep('done')}
            onDownloadPdf={() => { void downloadPdf(); }}
            downloadingPdf={downloadingPdf}
            onCopy={copyAll}
            copied={copied}
          />
        )}
        {step === 'done' && (
          <StepDone
            onDownloadPdf={() => { void downloadPdf(); }}
            downloadingPdf={downloadingPdf}
            onCopy={copyAll}
            copied={copied}
            onRestart={() => { setData(EMPTY); setStep('wnioskodawca'); }}
          />
        )}
      </div>
    </div>
  );

  // suppress unused warning
  void dataWithCombined;
}

// ---- STEP COMPONENTS ----

function StepWnioskodawca({ data, update, onNext }: { data: Z15bData; update: (k: keyof Z15bData, v: string | boolean) => void; onNext: () => void }) {
  const valid = data.imie.trim().length > 0 && data.nazwisko.trim().length > 0 && data.pesel.trim().length === 11;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Twoje dane</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Imie *">
            <input className={IC} value={data.imie} onChange={e => update('imie', e.target.value)} placeholder="Jan" />
          </Field>
          <Field label="Nazwisko *">
            <input className={IC} value={data.nazwisko} onChange={e => update('nazwisko', e.target.value)} placeholder="Kowalski" />
          </Field>
        </div>
        <Field label="PESEL *" hint="Wpisywany tylko lokalnie w przegladarce, nie wysylany na serwer">
          <input className={IC} value={data.pesel} onChange={e => update('pesel', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10 }}>
          <Field label="Ulica">
            <input className={IC} value={data.ulica} onChange={e => update('ulica', e.target.value)} placeholder="Kwiatowa" />
          </Field>
          <Field label="Nr domu">
            <input className={IC} style={{ width: 80 }} value={data.nrDomu} onChange={e => update('nrDomu', e.target.value)} placeholder="1" />
          </Field>
          <Field label="Nr lokalu">
            <input className={IC} style={{ width: 80 }} value={data.nrLokalu} onChange={e => update('nrLokalu', e.target.value)} placeholder="2" />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12 }}>
          <Field label="Kod pocztowy">
            <input className={IC} style={{ width: 100 }} value={data.kodPocztowy} onChange={e => update('kodPocztowy', e.target.value)} placeholder="00-001" maxLength={6} />
          </Field>
          <Field label="Miejscowosc">
            <input className={IC} value={data.miejscowosc} onChange={e => update('miejscowosc', e.target.value)} placeholder="Warszawa" />
          </Field>
        </div>
        <Field label="Numer telefonu" hint="Opcjonalnie -- ulatwia kontakt ZUS w Twojej sprawie">
          <input className={IC} value={data.telefon} onChange={e => update('telefon', e.target.value)} placeholder="+48 600 000 000" />
        </Field>
      </div>
      <NavButtons onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepPlatnik({ data, update, onBack, onNext }: { data: Z15bData; update: (k: keyof Z15bData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Dane platnika skladek</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Twoj pracodawca lub zleceniodawca. Znajdziesz na umowie lub pasku wynagrodzenia.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Nazwa albo imie i nazwisko platnika">
          <input className={IC} value={data.nazwaPlatinika} onChange={e => update('nazwaPlatinika', e.target.value)} placeholder="XYZ Sp. z o.o." />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="NIP platnika">
            <input className={IC} value={data.nipPlatnika} onChange={e => update('nipPlatnika', e.target.value)} placeholder="0000000000" maxLength={10} />
          </Field>
          <Field label="REGON platnika">
            <input className={IC} value={data.regonPlatnika} onChange={e => update('regonPlatnika', e.target.value)} placeholder="000000000" maxLength={9} />
          </Field>
        </div>
        <Field label="Numer rachunku bankowego do wyplaty" hint="Opcjonalne. Jesli nie podasz -- ZUS wypłaci przekazem pocztowym">
          <input className={IC} value={data.nrKonta} onChange={e => update('nrKonta', e.target.value)} placeholder="PL00 0000 0000 0000 0000 0000 0000" />
        </Field>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepEzla({ data, update, onBack, onNext }: { data: Z15bData; update: (k: keyof Z15bData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  const valid = data.dataOd.trim().length > 0 && data.dataDo.trim().length > 0;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Okres opieki i zaswiadczenie lekarskie</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Opieka od *" hint="DD.MM.RRRR">
            <input className={IC} value={data.dataOd} onChange={e => update('dataOd', e.target.value)} placeholder="01.05.2026" />
          </Field>
          <Field label="Opieka do *" hint="DD.MM.RRRR">
            <input className={IC} value={data.dataDo} onChange={e => update('dataDo', e.target.value)} placeholder="07.05.2026" />
          </Field>
        </div>
        <Field label="Seria i numer e-ZLA" hint="Opcjonalne. Jesli lekarz wystawil elektroniczne zwolnienie (e-ZLA) -- podaj serie i numer jesli go pamietasz. Trafia automatycznie do ZUS.">
          <input className={IC} value={data.numerEzla} onChange={e => update('numerEzla', e.target.value)} placeholder="np. K/12345678" />
        </Field>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 4 }}>e-ZLA</p>
          <p>Zaswiadczenie lekarskie wystawione elektronicznie trafia do ZUS automatycznie. Jesli masz papierowe zaswiadczenie -- dolacz oryginał do wniosku. Limit zasilku Z-15b: 14 dni w roku kalendarzowym.</p>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepChory({ data, update, onBack, onNext }: { data: Z15bData; update: (k: keyof Z15bData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  const valid = data.imieChory.trim().length > 0 && data.nazwiskoChory.trim().length > 0;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Dane osoby, nad ktora sprawujesz opieke</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Stopien pokrewienstwa">
          <select className={IC} value={data.relacjaDoMnie} onChange={e => update('relacjaDoMnie', e.target.value as RelacjaOpiekun)}>
            {(Object.entries(RELACJA_LABELS) as [RelacjaOpiekun, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Imie *">
            <input className={IC} value={data.imieChory} onChange={e => update('imieChory', e.target.value)} placeholder="Maria" />
          </Field>
          <Field label="Nazwisko *">
            <input className={IC} value={data.nazwiskoChory} onChange={e => update('nazwiskoChory', e.target.value)} placeholder="Kowalska" />
          </Field>
        </div>
        <Field label="PESEL osoby chorej" hint="Jesli posiada">
          <input className={IC} value={data.peselChory} onChange={e => update('peselChory', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <Field label="Data urodzenia" hint="DD.MM.RRRR -- podaj jesli brak PESEL">
          <input className={IC} value={data.dataUrodzChory} onChange={e => update('dataUrodzChory', e.target.value)} placeholder="15.03.1950" />
        </Field>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          Czlonkami rodziny objety wnioskiem Z-15b sa: malzonek, rodzice, rodzic dziecka, ojczym, macocha, rodzice adopcyjni, tesciowie, dziadkowie, wnuki, rodzenstwo. Muszą prowadzic z Toba wspolne gospodarstwo domowe w okresie sprawowania opieki.
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepOswiadczenia({ data, update, onBack, onNext }: { data: Z15bData; update: (k: keyof Z15bData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Oswiadczenia</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Obowiazkowe pytania z formularza Z-15b.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Oswiadczenie 1: Domownik */}
        <OswiadczenieBlock
          label="1. Czy jest domownik, ktory moze zapewnic opieke nad chorym czlonkiem rodziny w tym okresie?"
          hint="Domownikiem nie jest osoba calkowicie niezdolna do pracy, chora, niesprawna fizycznie lub psychicznie ze wzgledu na wiek."
          value={data.jestDomownik}
          onChange={v => update('jestDomownik', v)}
        />
        {data.jestDomownik === 'tak' && (
          <Field label="Podaj w jakich dniach inny domownik moze sprawowac opieke">
            <input className={IC} value={data.domownikDni} onChange={e => update('domownikDni', e.target.value)} placeholder="np. 3-5 maja 2026" />
          </Field>
        )}

        {/* Oswiadczenie 2: Wspolne gospodarstwo */}
        <OswiadczenieBlock
          label="2. Czy pozostajesz we wspolnym gospodarstwie domowym z chorym czlonkiem rodziny w okresie sprawowania opieki?"
          hint="Warunek: wspolne gospodarstwo domowe w czasie trwania opieki."
          value={data.wspolneGospodarstwo}
          onChange={v => update('wspolneGospodarstwo', v)}
        />

        {/* Oswiadczenie 3: Zmiana platnika */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8 }}>
            3. Czy w tym roku kalendarzowym zmieniles platnika skladek i otrzymales od poprzedniego platnika zasilek opiekuńczy?
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { v: 'nie-zmienialem', label: 'Nie zmienialem platnika w tym roku' },
              { v: 'nie', label: 'Tak, zmienialem, ale nie otrzymalem zasilku od poprzedniego' },
              { v: 'tak', label: 'Tak, zmienialem i otrzymalem zasilek od poprzedniego platnika' },
            ].map(opt => (
              <label key={opt.v} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '12px 14px',
                background: data.zmianaPlatnika === opt.v ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
                border: `1px solid ${data.zmianaPlatnika === opt.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 8, cursor: 'pointer',
              }}>
                <input type="radio" name="zmianaPlatnika" value={opt.v} checked={data.zmianaPlatnika === opt.v} onChange={() => update('zmianaPlatnika', opt.v)} style={{ accentColor: 'var(--color-accent)' }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepMalzonek({ data, update, onBack, onNext }: { data: Z15bData; update: (k: keyof Z15bData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Dane Twojego malzonka</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Formularz wymaga podania danych malzonka i informacji czy pobierał zasilek opiekuńczy w tym roku.</p>

      <label style={{
        display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24,
        padding: '14px 16px',
        background: data.brakMalzonka ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
        border: `1px solid ${data.brakMalzonka ? 'var(--color-accent)' : 'var(--color-border)'}`,
        borderRadius: 8, cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={data.brakMalzonka}
          onChange={e => update('brakMalzonka', e.target.checked)}
          style={{ accentColor: 'var(--color-accent)', width: 15, height: 15 }}
        />
        <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Nie mam malzonka</span>
      </label>

      {!data.brakMalzonka && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Field label="Imie i nazwisko malzonka">
            <input className={IC} value={data.imieNazwiskoMalzonka} onChange={e => update('imieNazwiskoMalzonka', e.target.value)} placeholder="Anna Kowalska" />
          </Field>
          <Field label="PESEL malzonka">
            <input className={IC} value={data.peselMalzonka} onChange={e => update('peselMalzonka', e.target.value)} placeholder="00000000000" maxLength={11} />
          </Field>

          <OswiadczenieBlock
            label="Czy malzonek pracuje?"
            value={data.malzonekPracuje}
            onChange={v => update('malzonekPracuje', v)}
          />

          <OswiadczenieBlock
            label="Czy malzonek w tym roku kalendarzowym otrzymal zasilek opiekuńczy?"
            value={data.malzonekZasilek}
            onChange={v => update('malzonekZasilek', v)}
          />

          {data.malzonekZasilek === 'tak' && (
            <Field label="Ile dni zasilku opiekuńczego na chorych doroslych pobierał malzonek?" hint="Podaj liczbe dni z tytulu opieki nad chorymi powyzej 14 lat lub innymi chorymi czlonkami rodziny">
              <input className={IC} value={data.malzonekDniDorosli} onChange={e => update('malzonekDniDorosli', e.target.value)} placeholder="np. 7" type="number" min="0" max="60" />
            </Field>
          )}
        </div>
      )}
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Podglad wniosku" />
    </div>
  );
}

function StepPodglad({ data, onBack, onDone, onDownloadPdf, downloadingPdf, onCopy, copied }: {
  data: Z15bData; onBack: () => void; onDone: () => void;
  onDownloadPdf: () => void; downloadingPdf: boolean;
  onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Podglad wniosku Z-15b</h2>
      <div className="mono" style={{
        background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
        borderRadius: 10, padding: '20px 24px',
        fontSize: 12, color: 'var(--color-text-2)',
        lineHeight: 1.8, whiteSpace: 'pre-wrap',
        boxShadow: 'var(--shadow-1)',
        maxHeight: 480, overflowY: 'auto',
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
        <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 12, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Co zrobic dalej</p>
        <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.65 }}>
          <li>Pobierz oryginalny formularz Z-15b ze strony <a href="https://www.zus.pl/wzory-formularzy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>zus.pl/wzory-formularzy</a> i przepisz dane</li>
          <li>Dolacz zaswiadczenie lekarskie (e-ZLA lub papierowe)</li>
          <li>Zloz wniosek u pracodawcy -- nie bezposrednio w ZUS</li>
          <li>Pracodawca przesle do ZUS przez PUE ZUS</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-3)' }}>Limit zasilku Z-15b: 14 dni w roku (30 dni dla niepelnosprawnych doroslych ze znacznym stopniem). Limit wspolny z zasilkiem na dzieci: max 60 dni lacznie.</p>
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
      <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)', marginBottom: 12 }}>Wniosek przygotowany</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 32, lineHeight: 1.7 }}>
        PDF zawiera wszystkie Twoje dane, instrukcje zlozenia i wskazowki. Pobierz oryginalny formularz Z-15b z zus.pl, przepisz dane i zloz u pracodawcy.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="btn btn-primary"
          style={{ width: '100%', height: 50, borderRadius: 10, fontSize: 14, opacity: downloadingPdf ? 0.6 : 1, cursor: downloadingPdf ? 'wait' : 'pointer' }}
        >
          {downloadingPdf ? 'Generuje PDF...' : 'Pobierz Z-15b (PDF)'}
        </button>
        <button onClick={onCopy} className="btn btn-outline" style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13 }}>
          {copied ? 'Skopiowano!' : 'Kopiuj dane do schowka'}
        </button>
        <a
          href="https://www.zus.pl/wzory-formularzy"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13, color: 'var(--color-accent)', border: '1px solid var(--color-accent)', justifyContent: 'center' }}
        >
          Oryginalny formularz Z-15b na zus.pl
        </a>
      </div>
      <button onClick={onRestart} style={{ fontSize: 13, color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
        Wypelnij nowy wniosek
      </button>
    </div>
  );
}

// ---- HELPERS ----

function buildOutput(d: Z15bData): string {
  const adres = [d.ulica, d.nrDomu, d.nrLokalu ? `/${d.nrLokalu}` : '', d.kodPocztowy, d.miejscowosc].filter(Boolean).join(' ');
  const relacja = RELACJA_LABELS[d.relacjaDoMnie];

  return `WNIOSEK Z-15B
Wniosek o zasilek opiekuńczy z powodu sprawowania opieki nad chorym czlonkiem rodziny

Wypelnic WIELKIMI LITERAMI. Pola wyboru zaznaczyc X.
Pobierz oryginalny formularz: https://www.zus.pl/wzory-formularzy

========================================
TWOJE DANE

Imie: ${d.imie.toUpperCase()}
Nazwisko: ${d.nazwisko.toUpperCase()}
PESEL: ${d.pesel}
Ulica: ${d.ulica.toUpperCase()}
Nr domu: ${d.nrDomu}   Nr lokalu: ${d.nrLokalu || '--'}
Kod pocztowy: ${d.kodPocztowy}
Miejscowosc: ${d.miejscowosc.toUpperCase()}
Numer telefonu: ${d.telefon || '-- (pole dobrowolne)'}

========================================
DANE PLATNIKA SKLADEK

Nazwa: ${d.nazwaPlatinika}
NIP: ${d.nipPlatnika}
REGON: ${d.regonPlatnika}

Rachunek bankowy (dobrowolnie): ${d.nrKonta || '-- brak -- zasilek przekazem pocztowym'}

========================================
OKRES OPIEKI

Od: ${d.dataOd}
Do: ${d.dataDo}
Seria i numer e-ZLA: ${d.numerEzla || '-- (nie podano lub brak)'}

========================================
DANE OSOBY NAD KTORA SPRAWUJESZ OPIEKE

Stopien pokrewienstwa: ${relacja}
Imie: ${d.imieChory.toUpperCase()}
Nazwisko: ${d.nazwiskoChory.toUpperCase()}
PESEL: ${d.peselChory || '-- brak'}
Data urodzenia: ${d.dataUrodzChory || '-- brak'}

========================================
OSWIADCZAM, ZE

1. Czy jest domownik mogacy sprawowac opieke:
   ${d.jestDomownik === 'tak' ? 'TAK -- Inny domownik moze sprawowac opieke w dniach: ' + (d.domownikDni || 'nie podano') : 'NIE'}

2. Czy pozostaje we wspolnym gospodarstwie domowym z chorym w tym okresie:
   ${d.wspolneGospodarstwo === 'tak' ? 'TAK' : 'NIE'}

3. Zmiana platnika skladek:
   ${d.zmianaPlatnika === 'nie-zmienialem' ? 'Nie zmienialem platnika w tym roku' : d.zmianaPlatnika === 'nie' ? 'Tak, zmienialem, ale nie otrzymalem zasilku od poprzedniego' : 'TAK -- otrzymalem zasilek od poprzedniego platnika'}

========================================
DANE MALZONKA

${d.brakMalzonka ? 'Brak malzonka -- zaznaczone w formularzu' : `Imie i nazwisko: ${d.imieNazwiskoMalzonka}
PESEL: ${d.peselMalzonka}
Malzonek pracuje: ${d.malzonekPracuje === 'tak' ? 'TAK' : 'NIE'}
Malzonek pobierał zasilek opiekuńczy w tym roku: ${d.malzonekZasilek === 'tak' ? 'TAK -- dni na chorych doroslych: ' + (d.malzonekDniDorosli || 'nie podano') : 'NIE'}`}

========================================

Oswiadczam, ze dane podane we wniosku podaiem zgodnie z prawda.

Data: .........................
Podpis: .........................

========================================
INSTRUKCJA:
1. Pobierz oryginalny Z-15b z: https://www.zus.pl/wzory-formularzy
2. Przepisz dane WIELKIMI LITERAMI
3. Dolacz zaswiadczenie lekarskie (e-ZLA lub papierowe)
4. Zloz u pracodawcy -- nie w ZUS

Wygenerowano: wezmezadarmo.com/wnioski/zus-z15b
Adres do korespondencji: ${adres}
`;
}

// ---- SHARED ----

function OswiadczenieBlock({ label, hint, value, onChange }: {
  label: string; hint?: string;
  value: 'tak' | 'nie'; onChange: (v: 'tak' | 'nie') => void;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: hint ? 4 : 8 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginBottom: 8, lineHeight: 1.5 }}>{hint}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {(['tak', 'nie'] as const).map(v => (
          <label key={v} style={{
            display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center',
            padding: '12px',
            background: value === v ? 'color-mix(in srgb, var(--color-accent) 10%, var(--color-bg-1))' : 'var(--color-bg-1)',
            border: `1px solid ${value === v ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 8, cursor: 'pointer', fontSize: 13,
            color: value === v ? 'var(--color-text-1)' : 'var(--color-text-2)',
            fontWeight: value === v ? 600 : 400,
          }}>
            <input type="radio" name={label} value={v} checked={value === v} onChange={() => onChange(v)} style={{ accentColor: 'var(--color-accent)' }} />
            {v === 'tak' ? 'TAK' : 'NIE'}
          </label>
        ))}
      </div>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Dalej', nextDisabled = false }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
      {onBack ? (
        <button onClick={onBack} className="btn btn-ghost" style={{ borderRadius: 8, fontSize: 13 }}>Wstecz</button>
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

