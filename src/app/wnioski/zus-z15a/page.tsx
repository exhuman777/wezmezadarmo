'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DateInput } from '@/components/DateInput';
import { FormChatWidget } from '@/components/FormChatWidget';

// ---- TYPES ----

interface Z15aData {
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
  nipPlatnika: string;
  regonPlatnika: string;
  nazwaPlatnika: string;

  // Rachunek bankowy
  nrKonta: string;

  // Okres i e-ZLA
  dataOd: string;
  dataDo: string;
  numerEzla: string;

  // Dane dziecka
  peselDziecka: string;
  imieDziecka: string;
  nazwiskoDziecka: string;
  dataUrodzDziecka: string;
  dzieckoNiepelnosprawne: 'tak' | 'nie';

  // Oswiadczenia
  jestDomownik: 'tak' | 'nie';
  domownikDni: string;
  pracaZmianowa: 'tak' | 'nie';
  zmianaPlatnika: 'tak' | 'nie' | 'nie-zmienialem';
  wspolneGospodarstwo: 'tak' | 'nie';

  // Dane drugiego rodzica
  brakDrugiegoRodzica: boolean;
  peselRodzic2: string;
  imieNazwiskoRodzic2: string;
  rodzic2Pracuje: 'tak' | 'nie';
  rodzic2Zasilek: 'tak' | 'nie';
  rodzic2DniDzieci: string;
  rodzic2DniDorosli: string;

  // Dane malzonka
  brakMalzonka: boolean;
  malzonekJestRodzic2: boolean;
  peselMalzonka: string;
  imieNazwiskoMalzonka: string;
  malzonekPracuje: 'tak' | 'nie';
  malzonekZasilek: 'tak' | 'nie';
}

type Step = 'wnioskodawca' | 'platnik' | 'ezla' | 'dziecko' | 'oswiadczenia' | 'rodzic2' | 'podglad' | 'done';

const EMPTY: Z15aData = {
  imie: '',
  nazwisko: '',
  pesel: '',
  ulica: '',
  nrDomu: '',
  nrLokalu: '',
  kodPocztowy: '',
  miejscowosc: '',
  telefon: '',
  nipPlatnika: '',
  regonPlatnika: '',
  nazwaPlatnika: '',
  nrKonta: '',
  dataOd: '',
  dataDo: '',
  numerEzla: '',
  peselDziecka: '',
  imieDziecka: '',
  nazwiskoDziecka: '',
  dataUrodzDziecka: '',
  dzieckoNiepelnosprawne: 'nie',
  jestDomownik: 'nie',
  domownikDni: '',
  pracaZmianowa: 'nie',
  zmianaPlatnika: 'nie-zmienialem',
  wspolneGospodarstwo: 'tak',
  brakDrugiegoRodzica: false,
  peselRodzic2: '',
  imieNazwiskoRodzic2: '',
  rodzic2Pracuje: 'tak',
  rodzic2Zasilek: 'nie',
  rodzic2DniDzieci: '',
  rodzic2DniDorosli: '',
  brakMalzonka: false,
  malzonekJestRodzic2: false,
  peselMalzonka: '',
  imieNazwiskoMalzonka: '',
  malzonekPracuje: 'tak',
  malzonekZasilek: 'nie',
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'wnioskodawca', label: 'Twoje dane' },
  { key: 'platnik', label: 'Pracodawca' },
  { key: 'ezla', label: 'Okres i e-ZLA' },
  { key: 'dziecko', label: 'Dziecko' },
  { key: 'oswiadczenia', label: 'Oswiadczenia' },
  { key: 'rodzic2', label: 'Drugi rodzic' },
  { key: 'podglad', label: 'Podglad' },
];

// ---- COMPONENT ----

export default function ZusZ15aPage() {
  const [step, setStep] = useState<Step>('wnioskodawca');
  const [data, setData] = useState<Z15aData>(EMPTY);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const update = (key: keyof Z15aData, value: string | boolean) =>
    setData(prev => ({ ...prev, [key]: value }));

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const downloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'zus-z15a', data }),
      });
      if (!res.ok) throw new Error('PDF error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Z-15a-${(data.imie + '-' + data.nazwisko).replace(/\s+/g, '-') || 'wniosek'}.pdf`;
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
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Zaklad Ubezpieczen Spolecznych</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>Zasilek opiekuńczy</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>Opieka nad dzieckiem -- choroba, kwarantanna lub zamkniecie placowki</p>

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
          <p style={{ marginBottom: 14 }}>Pracownicy i zleceniobiorcy oplacajacy skladke chorobowa, gdy opiekuja sie chorym dzieckiem do 14 lat lub gdy zamknieto zlobek, przedszkole, szkole dziecka do lat 8. Zasilek 80% wynagrodzenia. Limit: 60 dni/rok na dzieci do 8 lat i chore do 14 lat; 14 dni na inne dzieci.</p>
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
        {step === 'ezla' && <StepEzla data={data} update={update} onBack={() => setStep('platnik')} onNext={() => setStep('dziecko')} />}
        {step === 'dziecko' && <StepDziecko data={data} update={update} onBack={() => setStep('ezla')} onNext={() => setStep('oswiadczenia')} />}
        {step === 'oswiadczenia' && <StepOswiadczenia data={data} update={update} onBack={() => setStep('dziecko')} onNext={() => setStep('rodzic2')} />}
        {step === 'rodzic2' && <StepRodzic2 data={data} update={update} onBack={() => setStep('oswiadczenia')} onNext={() => setStep('podglad')} />}
        {step === 'podglad' && (
          <StepPodglad
            data={data}
            onBack={() => setStep('rodzic2')}
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
      <FormChatWidget formType="zus-z15a" />
    </div>
  );
}

// ---- STEP COMPONENTS ----

function StepWnioskodawca({ data, update, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string | boolean) => void; onNext: () => void }) {
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
        <Field label="Numer telefonu" hint="Opcjonalnie: ułatwia kontakt ZUS w Twojej sprawie">
          <input className={IC} value={data.telefon} onChange={e => update('telefon', e.target.value)} placeholder="+48 600 000 000" />
        </Field>
      </div>
      <NavButtons onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepPlatnik({ data, update, onBack, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Dane platnika skladek</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Twoj pracodawca lub zleceniodawca. Znajdziesz na umowie lub pasku wynagrodzenia.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Nazwa albo imie i nazwisko platnika">
          <input className={IC} value={data.nazwaPlatnika} onChange={e => update('nazwaPlatnika', e.target.value)} placeholder="XYZ Sp. z o.o." />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="NIP platnika">
            <input className={IC} value={data.nipPlatnika} onChange={e => update('nipPlatnika', e.target.value)} placeholder="0000000000" maxLength={10} />
          </Field>
          <Field label="REGON platnika">
            <input className={IC} value={data.regonPlatnika} onChange={e => update('regonPlatnika', e.target.value)} placeholder="000000000" maxLength={9} />
          </Field>
        </div>
        <Field label="Numer rachunku bankowego do wyplaty" hint="Opcjonalne. Jesli nie podasz, ZUS wypłaci przekazem pocztowym">
          <input className={IC} value={data.nrKonta} onChange={e => update('nrKonta', e.target.value)} placeholder="PL00 0000 0000 0000 0000 0000 0000" />
        </Field>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepEzla({ data, update, onBack, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  const valid = data.dataOd.trim().length > 0 && data.dataDo.trim().length > 0;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Okres, za ktory ubiegasz sie o zasilek</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Data od *" hint="DD.MM.RRRR">
            <DateInput className={IC} value={data.dataOd} onChange={v => update('dataOd', v)} placeholder="01.05.2026" />
          </Field>
          <Field label="Data do *" hint="DD.MM.RRRR">
            <DateInput className={IC} value={data.dataDo} onChange={v => update('dataDo', v)} placeholder="07.05.2026" />
          </Field>
        </div>
        <Field label="Seria i numer e-ZLA" hint="Opcjonalne: jeśli pamiętasz. Zaświadczenie lekarskie wystawione elektronicznie trafia do ZUS automatycznie.">
          <input className={IC} value={data.numerEzla} onChange={e => update('numerEzla', e.target.value)} placeholder="np. K/12345678" />
        </Field>
        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 4 }}>Limit dni zasilku Z-15a</p>
          <p>60 dni w roku kalendarzowym na dzieci do 8 lat i chore dzieci do 14 lat. 14 dni na inne dzieci niepelnosprawne powyzej 8 lat (bez choroby). Limit wspolny z zasilkiem Z-15b.</p>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepDziecko({ data, update, onBack, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  const valid = data.imieDziecka.trim().length > 0 && data.nazwiskoDziecka.trim().length > 0 && data.dataUrodzDziecka.trim().length > 0;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Dane dziecka, nad ktorym sprawujesz opieke</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="PESEL dziecka" hint="Opcjonalne: jeśli dziecko nie ma jeszcze PESEL">
          <input className={IC} value={data.peselDziecka} onChange={e => update('peselDziecka', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Imie dziecka *">
            <input className={IC} value={data.imieDziecka} onChange={e => update('imieDziecka', e.target.value)} placeholder="Anna" />
          </Field>
          <Field label="Nazwisko dziecka *">
            <input className={IC} value={data.nazwiskoDziecka} onChange={e => update('nazwiskoDziecka', e.target.value)} placeholder="Kowalska" />
          </Field>
        </div>
        <Field label="Data urodzenia dziecka *" hint="DD.MM.RRRR">
          <DateInput className={IC} value={data.dataUrodzDziecka} onChange={v => update('dataUrodzDziecka', v)} placeholder="15.03.2020" />
        </Field>

        <OswiadczenieBlock
          label="Dziecko ma orzeczenie o znacznym stopniu niepelnosprawnosci albo orzeczenie o niepelnosprawnosci ze wskazaniem koniecznosci stalej lub dlugotwalej opieki lub pomocy innej osoby"
          hint="Jesli tak, zasilek przysluguje do 18. roku zycia dziecka."
          value={data.dzieckoNiepelnosprawne}
          onChange={v => update('dzieckoNiepelnosprawne', v)}
        />

        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          Zasilek na dziecko chore do 14 lat lub zamkniecie placowki (dziecko do 8 lat). Przy orzeczeniu o niepelnosprawnosci: do 18 lat.
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepOswiadczenia({ data, update, onBack, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Oswiadczenia</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Obowiazkowe pytania z formularza Z-15a.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Oswiadczenie 1: Domownik */}
        <OswiadczenieBlock
          label="1. Czy jest domownik, ktory moze zapewnic opieke dziecku w okresie, za ktory ubiegam sie o zasilek opiekuńczy?"
          hint="Domownikiem nie jest osoba calkowicie niezdolna do pracy, chora, niesprawna fizycznie lub psychicznie ze wzgledu na wiek."
          value={data.jestDomownik}
          onChange={v => update('jestDomownik', v)}
        />
        {data.jestDomownik === 'tak' && (
          <Field label="Podaj w jakich dniach inny domownik moze sprawowac opieke">
            <input className={IC} value={data.domownikDni} onChange={e => update('domownikDni', e.target.value)} placeholder="np. 3-5 maja 2026" />
          </Field>
        )}

        {/* Oswiadczenie 2: Praca zmianowa */}
        <OswiadczenieBlock
          label="2. Jesli zasilek bedzie wyplacal Ci ZUS: czy jestes zatrudniony w systemie pracy zmianowej?"
          hint="Dotyczy tylko sytuacji gdy zasilek wyplaca bezposrednio ZUS (pracodawcy do 20 pracownikow)."
          value={data.pracaZmianowa}
          onChange={v => update('pracaZmianowa', v)}
        />

        {/* Oswiadczenie 3: Zmiana platnika */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8 }}>
            3. Czy w tym roku kalendarzowym zmieniles platnika skladek i otrzymales zasilek od poprzedniego platnika?
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

        {/* Oswiadczenie 4: Wspolne gospodarstwo */}
        <OswiadczenieBlock
          label="4. Czy pozostajesz we wspolnym gospodarstwie z chorym dzieckiem w okresie sprawowania opieki?"
          hint="Dotyczy szczegolnie opieki nad chorym dzieckiem dorosłym."
          value={data.wspolneGospodarstwo}
          onChange={v => update('wspolneGospodarstwo', v)}
        />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepRodzic2({ data, update, onBack, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Dane drugiego rodzica dziecka</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Matka lub ojciec dziecka (wymagane przez formularz Z-15a).</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
        <label style={{
          display: 'flex', gap: 10, alignItems: 'center',
          padding: '14px 16px',
          background: data.brakDrugiegoRodzica ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
          border: `1px solid ${data.brakDrugiegoRodzica ? 'var(--color-accent)' : 'var(--color-border)'}`,
          borderRadius: 8, cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={data.brakDrugiegoRodzica}
            onChange={e => update('brakDrugiegoRodzica', e.target.checked)}
            style={{ accentColor: 'var(--color-accent)', width: 15, height: 15 }}
          />
          <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Brak drugiego rodzica (samotny rodzic, brak danych)</span>
        </label>
      </div>

      {!data.brakDrugiegoRodzica && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          <Field label="PESEL drugiego rodzica">
            <input className={IC} value={data.peselRodzic2} onChange={e => update('peselRodzic2', e.target.value)} placeholder="00000000000" maxLength={11} />
          </Field>
          <Field label="Imie i nazwisko drugiego rodzica">
            <input className={IC} value={data.imieNazwiskoRodzic2} onChange={e => update('imieNazwiskoRodzic2', e.target.value)} placeholder="Anna Kowalska" />
          </Field>

          <OswiadczenieBlock
            label="Czy drugi rodzic pracuje?"
            value={data.rodzic2Pracuje}
            onChange={v => update('rodzic2Pracuje', v)}
          />

          <OswiadczenieBlock
            label="Czy drugi rodzic w tym roku otrzymal zasilek opiekuńczy?"
            value={data.rodzic2Zasilek}
            onChange={v => update('rodzic2Zasilek', v)}
          />

          {data.rodzic2Zasilek === 'tak' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Liczba dni zasilku na dzieci do lat 14" hint="Podaj ile dni zasilku opiekuńczego pobral drugi rodzic na dzieci do 14 lat w tym roku">
                <input className={IC} value={data.rodzic2DniDzieci} onChange={e => update('rodzic2DniDzieci', e.target.value)} placeholder="np. 14" type="number" min="0" max="60" />
              </Field>
              <Field label="Liczba dni zasilku na chorych doroslych" hint="Dni zasilku Z-15b na chorych czlonkow rodziny powyzej 14 lat">
                <input className={IC} value={data.rodzic2DniDorosli} onChange={e => update('rodzic2DniDorosli', e.target.value)} placeholder="np. 7" type="number" min="0" max="14" />
              </Field>
            </div>
          )}
        </div>
      )}

      {/* Malzonek -- jesli inny niz drugi rodzic */}
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 28, marginTop: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8 }}>Dane Twojego malzonka</h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 20 }}>Podaj jesli malzonek jest inna osoba niz drugi rodzic dziecka.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <label style={{
            display: 'flex', gap: 10, alignItems: 'center',
            padding: '14px 16px',
            background: data.brakMalzonka ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
            border: `1px solid ${data.brakMalzonka ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 8, cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={data.brakMalzonka}
              onChange={e => { update('brakMalzonka', e.target.checked); if (e.target.checked) update('malzonekJestRodzic2', false); }}
              style={{ accentColor: 'var(--color-accent)', width: 15, height: 15 }}
            />
            <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Nie mam malzonka</span>
          </label>

          {!data.brakMalzonka && (
            <label style={{
              display: 'flex', gap: 10, alignItems: 'center',
              padding: '14px 16px',
              background: data.malzonekJestRodzic2 ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
              border: `1px solid ${data.malzonekJestRodzic2 ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 8, cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={data.malzonekJestRodzic2}
                onChange={e => update('malzonekJestRodzic2', e.target.checked)}
                style={{ accentColor: 'var(--color-accent)', width: 15, height: 15 }}
              />
              <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>Malzonek jest jednoczesnie drugim rodzicem dziecka (dane juz podane powyzej)</span>
            </label>
          )}
        </div>

        {!data.brakMalzonka && !data.malzonekJestRodzic2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="PESEL malzonka">
              <input className={IC} value={data.peselMalzonka} onChange={e => update('peselMalzonka', e.target.value)} placeholder="00000000000" maxLength={11} />
            </Field>
            <Field label="Imie i nazwisko malzonka">
              <input className={IC} value={data.imieNazwiskoMalzonka} onChange={e => update('imieNazwiskoMalzonka', e.target.value)} placeholder="Anna Kowalska" />
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
          </div>
        )}
      </div>

      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Podglad wniosku" />
    </div>
  );
}

function StepPodglad({ data, onBack, onDone, onDownloadPdf, downloadingPdf, onCopy, copied }: {
  data: Z15aData; onBack: () => void; onDone: () => void;
  onDownloadPdf: () => void; downloadingPdf: boolean;
  onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Podglad wniosku Z-15a</h2>
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
          <li>Pobierz oryginalny formularz Z-15a ze strony <a href="https://www.zus.pl/wzory-formularzy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>zus.pl/wzory-formularzy</a> i przepisz dane</li>
          <li>Dolacz zaswiadczenie lekarskie e-ZLA lub zaswiadczenie o zamknieciu placowki</li>
          <li>Złóż wniosek u pracodawcy (nie bezpośrednio w ZUS)</li>
          <li>Pracodawca przesle do ZUS przez PUE ZUS. Mozesz rowniez sprawdzic status przez <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>eZUS</a></li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-3)' }}>Limit zasilku Z-15a: 60 dni/rok na dzieci do 8 lat i chore do 14 lat; 14 dni na inne. Wniosek skladasz u pracodawcy, nie w ZUS.</p>
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
        PDF zawiera wszystkie Twoje dane, instrukcje zlozenia i wskazowki. Pobierz oryginalny formularz Z-15a z zus.pl, przepisz dane i zloz u pracodawcy.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <button
          onClick={onDownloadPdf}
          disabled={downloadingPdf}
          className="btn btn-primary"
          style={{ width: '100%', height: 50, borderRadius: 10, fontSize: 14, opacity: downloadingPdf ? 0.6 : 1, cursor: downloadingPdf ? 'wait' : 'pointer' }}
        >
          {downloadingPdf ? 'Generuje PDF...' : 'Pobierz Z-15a (PDF)'}
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
          Oryginalny formularz Z-15a na zus.pl
        </a>
        <a
          href="https://www.zus.pl/ezus/logowanie?jezyk=pl"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13, color: 'var(--color-text-2)', border: '1px solid var(--color-border)', justifyContent: 'center' }}
        >
          Sprawdz status wniosku przez eZUS
        </a>
      </div>
      <button onClick={onRestart} style={{ fontSize: 13, color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
        Wypelnij nowy wniosek
      </button>
    </div>
  );
}

// ---- HELPERS ----

function buildOutput(d: Z15aData): string {
  const adres = [d.ulica, d.nrDomu, d.nrLokalu ? `/${d.nrLokalu}` : '', d.kodPocztowy, d.miejscowosc].filter(Boolean).join(' ');

  const rodzic2Block = d.brakDrugiegoRodzica
    ? 'Brak drugiego rodzica (zaznaczone w formularzu)'
    : `PESEL: ${d.peselRodzic2 || '-- brak'}
Imie i nazwisko: ${d.imieNazwiskoRodzic2 ? d.imieNazwiskoRodzic2.toUpperCase() : '-- brak'}
Drugi rodzic pracuje: ${d.rodzic2Pracuje === 'tak' ? 'TAK' : 'NIE'}
Otrzymal zasilek opiekuńczy w tym roku: ${d.rodzic2Zasilek === 'tak'
    ? `TAK: dni na dzieci do lat 14: ${d.rodzic2DniDzieci || 'nie podano'}, dni na chorych doroslych: ${d.rodzic2DniDorosli || 'nie podano'}`
    : 'NIE'}`;

  const malzonekBlock = d.brakMalzonka
    ? 'Brak malzonka (zaznaczone w formularzu)'
    : d.malzonekJestRodzic2
      ? 'Malzonek jest jednoczesnie drugim rodzicem dziecka: dane podane powyzej'
      : `PESEL: ${d.peselMalzonka || '-- brak'}
Imie i nazwisko: ${d.imieNazwiskoMalzonka ? d.imieNazwiskoMalzonka.toUpperCase() : '-- brak'}
Malzonek pracuje: ${d.malzonekPracuje === 'tak' ? 'TAK' : 'NIE'}
Malzonek pobierał zasilek opiekuńczy w tym roku: ${d.malzonekZasilek === 'tak' ? 'TAK' : 'NIE'}`;

  return `WNIOSEK Z-15A
Wniosek o zasilek opiekuńczy z powodu sprawowania opieki nad dzieckiem

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

Nazwa: ${d.nazwaPlatnika}
NIP: ${d.nipPlatnika}
REGON: ${d.regonPlatnika}

Rachunek bankowy (dobrowolnie): ${d.nrKonta || '(brak - zasiłek przekazem pocztowym)'}

========================================
OKRES, ZA KTORY UBIEGAM SIE O ZASILEK

Od: ${d.dataOd}
Do: ${d.dataDo}
Seria i numer e-ZLA: ${d.numerEzla || '-- (nie podano lub brak)'}

========================================
DANE DZIECKA

PESEL dziecka: ${d.peselDziecka || '-- brak'}
Imie: ${d.imieDziecka.toUpperCase()}
Nazwisko: ${d.nazwiskoDziecka.toUpperCase()}
Data urodzenia: ${d.dataUrodzDziecka}
Orzeczenie o niepelnosprawnosci: ${d.dzieckoNiepelnosprawne === 'tak' ? 'TAK' : 'NIE'}

========================================
OSWIADCZAM, ZE

1. Czy jest domownik mogacy zapewnic opieke dziecku:
   ${d.jestDomownik === 'tak' ? 'TAK, domownik moze sprawowac opieke w dniach: ' + (d.domownikDni || 'nie podano') : 'NIE'}

2. Czy jestes zatrudniony w systemie pracy zmianowej:
   ${d.pracaZmianowa === 'tak' ? 'TAK' : 'NIE'}

3. Zmiana platnika skladek:
   ${d.zmianaPlatnika === 'nie-zmienialem' ? 'Nie zmienialem platnika w tym roku' : d.zmianaPlatnika === 'nie' ? 'Tak, zmienialem, ale nie otrzymalem zasilku od poprzedniego' : 'TAK: otrzymalem zasilek od poprzedniego platnika'}

4. Pozostaje we wspolnym gospodarstwie z chorym dzieckiem:
   ${d.wspolneGospodarstwo === 'tak' ? 'TAK' : 'NIE'}

========================================
DANE DRUGIEGO RODZICA DZIECKA

${rodzic2Block}

========================================
DANE MALZONKA

${malzonekBlock}

========================================

Oswiadczam, ze dane podane we wniosku podaiem zgodnie z prawda.

Data: .........................
Podpis: .........................

========================================
INSTRUKCJA:
1. Pobierz oryginalny Z-15a z: https://www.zus.pl/wzory-formularzy
2. Przepisz dane WIELKIMI LITERAMI
3. Dolacz e-ZLA (zwolnienie lekarskie) lub zaswiadczenie o zamknieciu placowki
4. Złóż u pracodawcy (nie w ZUS)
5. Status wniosku: https://www.zus.pl/ezus/logowanie?jezyk=pl

Wygenerowano: wezmezadarmo.com/wnioski/zus-z15a
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
