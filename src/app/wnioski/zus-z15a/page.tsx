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
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <Link href="/wnioski" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróc do listy formularzy
        </Link>

        <div className="mb-1 flex items-center gap-2">
          <span className="text-[11px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded-[4px]">Z-15a</span>
          <span className="text-[12px] text-text-3">Zakład Ubezpieczen Społecznych</span>
        </div>
        <h1 className="text-[20px] sm:text-[24px] font-bold text-text-1 mb-1">
          Zasiłek opiekuńczy
        </h1>
        <p className="text-[13px] text-text-3 mb-6">Opieka nad chorym dzieckiem lub zamkniecie placowki</p>

        {/* Info block */}
        <div className="mb-6 p-4 bg-bg-1 border border-border rounded-[8px] text-[13px] text-text-2 leading-[1.7]">
          <p className="font-medium text-text-1 mb-1">Komu przysługuje</p>
          <p>Pracownicy i zleceniobiorcy opłacający składkę chorobową, gdy opiekują się chorym dzieckiem do 14 lat lub gdy zamknięto żłobek, przedszkole albo szkołę dziecka do lat 8. Zasiłek wynosi 80% wynagrodzenia, wypłacany przez ZUS lub pracodawcę. Limit: 60 dni w roku na chore dziecko do 14 lat.</p>
          <p className="mt-2 font-medium text-text-1 mb-1">Jak złożyć</p>
          <p>Ten wniosek składasz u pracodawcy (nie bezposrednio w ZUS). Pracodawca przesyła go do ZUS elektronicznie przez PUE ZUS. Jesli nie masz pracodawcy (działalność gospodarcza), złoz bezposrednio w ZUS.</p>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="flex gap-1 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.key} className={`h-1 flex-1 rounded-full transition-colors ${i < stepIdx ? 'bg-accent' : i === stepIdx ? 'bg-accent/60' : 'bg-border'}`} />
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
      <h2 className="text-[16px] font-bold text-text-1 mb-5">Twoje dane</h2>
      <div className="space-y-4">
        <Field label="Imię i nazwisko *">
          <input className={IC} value={data.imieNazwisko} onChange={e => update('imieNazwisko', e.target.value)} placeholder="Jan Kowalski" />
        </Field>
        <Field label="PESEL *" hint="Wpisywany tylko lokalnie w przegladarce, nie wysyłany na serwer">
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
      <h2 className="text-[16px] font-bold text-text-1 mb-5">Dane dziecka</h2>
      <div className="space-y-4">
        <Field label="Imię i nazwisko dziecka *">
          <input className={IC} value={data.imieNazwiskoDziecka} onChange={e => update('imieNazwiskoDziecka', e.target.value)} placeholder="Anna Kowalska" />
        </Field>
        <Field label="PESEL dziecka *">
          <input className={IC} value={data.peselDziecka} onChange={e => update('peselDziecka', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <Field label="Data urodzenia dziecka" hint="W formacie DD.MM.RRRR">
          <input className={IC} value={data.dataUrodzeniaDziecka} onChange={e => update('dataUrodzeniaDziecka', e.target.value)} placeholder="15.03.2018" />
        </Field>
        <div className="p-3 bg-bg-1 border border-border rounded-[6px] text-[12px] text-text-3 leading-[1.6]">
          Zasilek opiekuńczy przysluguje na dziecko do 14 lat (lub do 18 lat przy niepelnosprawnosci). Po ukonczeniu 14 lat dziecka nalezy zlozyc formularz Z-15b.
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
      <h2 className="text-[16px] font-bold text-text-1 mb-5">Szczegoly opieki</h2>
      <div className="space-y-4">
        <Field label="Powod sprawowania opieki *">
          <select className={IC} value={data.powodOpieki} onChange={e => update('powodOpieki', e.target.value as Powod)}>
            {(Object.entries(POWOD_LABELS) as [Powod, string][]).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data od *" hint="DD.MM.RRRR">
            <input className={IC} value={data.dataOd} onChange={e => update('dataOd', e.target.value)} placeholder="01.05.2026" />
          </Field>
          <Field label="Data do *" hint="DD.MM.RRRR">
            <input className={IC} value={data.dataDo} onChange={e => update('dataDo', e.target.value)} placeholder="05.05.2026" />
          </Field>
        </div>
        <Field label="Dlaczego drugi rodzic nie moze sprawowac opieki?" hint="Krotkie oswiadczenie. Mozesz wygenerowac z AI lub wpisac samodzielnie.">
          <div className="space-y-2">
            <textarea
              className={`${IC} min-h-[80px] resize-none`}
              value={data.drugirodzicNieMoze}
              onChange={e => update('drugirodzicNieMoze', e.target.value)}
              placeholder="Drugi rodzic nie moze sprawowac opieki poniewaz..."
            />
            <button
              onClick={onGenerate}
              disabled={generating}
              className="text-[12px] text-accent hover:underline disabled:opacity-50 disabled:cursor-wait"
            >
              {generating ? 'Generuje...' : 'Wygeneruj z AI'}
            </button>
          </div>
        </Field>
        <div className="p-3 bg-bg-1 border border-border rounded-[6px] text-[12px] text-text-3 leading-[1.6]">
          <p className="font-medium text-text-2 mb-1">Przykladowe uzasadnienia</p>
          <p>Pracuje zawodowo i nie moze wziąc urlopu bez waznej przyczyny. / Przebywa w delegacji sluzbowej. / Nie ma prawa do zasilku opiekuńczego (prowadzi działalnosc gospodarcza bez ubezpieczenia chorobowego).</p>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepPracodawca({ data, update, onBack, onNext }: { data: Z15aData; update: (k: keyof Z15aData, v: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 className="text-[16px] font-bold text-text-1 mb-2">Dane pracodawcy</h2>
      <p className="text-[13px] text-text-3 mb-5">Znajdziesz na umowie o prace lub pasku wynagrodzenia.</p>
      <div className="space-y-4">
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
        <div className="p-3 bg-bg-1 border border-border rounded-[6px] text-[12px] text-text-3 leading-[1.6]">
          Jesli pracujesz u małego pracodawcy (do 20 osob), zasilek wypłaca ZUS bezposrednio. Jesli u duzego (ponad 20 osob), wypłaca pracodawca i rozlicza sie z ZUS. W obu przypadkach wniosek składasz u pracodawcy.
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Podglad wniosku" />
    </div>
  );
}

function StepPodglad({ data, onBack, onDone, onDownload, onCopy, copied }: {
  data: Z15aData; onBack: () => void; onDone: () => void;
  onDownload: () => void; onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <h2 className="text-[16px] font-bold text-text-1 mb-5">Podglad wniosku Z-15a</h2>
      <div className="bg-bg-1 border border-border rounded-[8px] p-5 text-[13px] text-text-2 leading-[1.8] whitespace-pre-wrap font-mono">
        {buildOutput(data)}
      </div>
      <div className="mt-4 flex gap-3 flex-wrap">
        <button onClick={onDownload} className="text-[13px] font-medium px-4 py-2 bg-accent text-bg-0 rounded-[6px] hover:bg-accent/90 transition-colors">
          Pobierz .txt
        </button>
        <button onClick={onCopy} className="text-[13px] px-4 py-2 border border-border rounded-[6px] text-text-2 hover:border-accent/40 transition-colors">
          {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-bg-1 border border-border rounded-[8px] text-[13px] text-text-2">
        <p className="font-medium text-text-1 mb-2">Co zrobic dalej</p>
        <ol className="space-y-1.5 list-decimal list-inside text-text-2">
          <li>Pobierz oryginalny formularz Z-15a ze strony <a href="https://www.zus.pl/wzory-formularzy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">zus.pl/wzory-formularzy</a></li>
          <li>Przepisz dane z pobranego pliku do oryginalnego formularza PDF</li>
          <li>Dołącz zwolnienie lekarskie dziecka (e-ZLA) lub zaswiadczenie o zamknieciu placowki</li>
          <li>Złoz wniosek u swojego pracodawcy (nie bezposrednio w ZUS)</li>
          <li>Pracodawca przesle wniosek do ZUS przez PUE ZUS</li>
          <li>Zasilek zostanie wypłacony w terminie wynagrodzenia lub przez ZUS (do 30 dni)</li>
        </ol>
        <p className="mt-3 text-text-3">Potrzebne dokumenty: e-ZLA (zwolnienie lekarskie wystawione elektronicznie przez lekarza) lub zaswiadczenie ze zamkniecia placowki.</p>
      </div>

      <NavButtons onBack={onBack} onNext={onDone} nextLabel="Gotowe" />
    </div>
  );
}

function StepDone({ onDownload, onCopy, copied, onRestart }: { onDownload: () => void; onCopy: () => void; copied: boolean; onRestart: () => void }) {
  return (
    <div>
      <h2 className="text-[20px] font-bold text-text-1 mb-3">Wniosek przygotowany</h2>
      <p className="text-[14px] text-text-2 mb-6 leading-[1.7]">
        Oryginalny formularz Z-15a pobierz ze strony zus.pl, przepisz dane z pliku i zlozone go u pracodawcy. Do wniosku dolacz e-ZLA od lekarza lub zaswiadczenie o zamknieciu placowki.
      </p>
      <div className="space-y-3 mb-8">
        <button onClick={onDownload} className="w-full py-3 text-[14px] font-medium bg-accent text-bg-0 rounded-[8px] hover:bg-accent/90 transition-colors">
          Pobierz Z-15a (.txt)
        </button>
        <button onClick={onCopy} className="w-full py-3 text-[13px] text-text-2 bg-bg-1 border border-border rounded-[8px] hover:border-accent/40 transition-colors">
          {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
        </button>
        <a
          href="https://www.zus.pl/wzory-formularzy"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 text-[13px] text-accent border border-accent/40 rounded-[8px] hover:bg-accent/5 transition-colors block text-center"
        >
          Oryginalny formularz Z-15a na zus.pl
        </a>
      </div>
      <button onClick={onRestart} className="text-[13px] text-text-3 hover:text-text-1">
        Wypelnij nowy wniosek
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
    <div className="flex justify-between mt-8">
      {onBack ? (
        <button onClick={onBack} className="text-[13px] px-4 py-2 border border-border rounded-[6px] text-text-3 hover:text-text-1 transition-colors">
          Wstecz
        </button>
      ) : <div />}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className="text-[13px] font-medium px-5 py-2 bg-accent text-bg-0 rounded-[6px] hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {nextLabel}
        </button>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-text-1 mb-1">{label}</label>
      {hint && <p className="text-[11px] text-text-3 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

const IC = 'w-full bg-bg-0 border border-border rounded-[6px] px-3 py-2 text-[13px] text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent/50 transition-colors';
