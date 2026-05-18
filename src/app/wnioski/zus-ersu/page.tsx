'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DateInput } from '@/components/DateInput';
import { FormChatWidget } from '@/components/FormChatWidget';

// ---- TYPES ----

type Plec = 'K' | 'M';

interface Okres {
  od: string;
  do: string;
}

interface PrzerwaPraca {
  od: string;
  do: string;
  przyczyna: string;
}

interface EruData {
  // Dane identyfikacyjne
  pesel: string;
  imie: string;
  nazwisko: string;
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowosc: string;
  telefon: string;
  plec: Plec;

  // Informacje o dzieciach
  liczbaUrodzonych: string;
  liczbaWychowanych: string;

  // Areszt
  blyAreszt: boolean;
  okresy_areszt: Okres[];

  // Rolnicy
  ubezpieczenieRolnikow: boolean;

  // Zamieszkanie w RP
  zamieszkaWrp: boolean;
  okresy_poza_rp: Okres[];

  // Przerwy w wychowywaniu
  przerwy: PrzerwaPraca[];

  // Dodatkowe dla ojca
  ojciec_smierc: boolean;
  ojciec_smierc_data: string;
  ojciec_porzucenie: boolean;
  ojciec_porzucenie_data: string;
  ojciec_zaprzestanie: boolean;
  ojciec_zaprzestanie_data: string;
  matka_imie: string;
  matka_nazwisko: string;
  matka_dataUrodzenia: string;
}

type Step = 'wnioskodawca' | 'dzieci' | 'sytuacja' | 'przerwy' | 'ojciec' | 'podglad' | 'done';

const EMPTY_OKRES: Okres = { od: '', do: '' };
const EMPTY_PRZERWA: PrzerwaPraca = { od: '', do: '', przyczyna: '' };

const EMPTY: EruData = {
  pesel: '',
  imie: '',
  nazwisko: '',
  ulica: '',
  nrDomu: '',
  nrLokalu: '',
  kodPocztowy: '',
  miejscowosc: '',
  telefon: '',
  plec: 'K',
  liczbaUrodzonych: '',
  liczbaWychowanych: '',
  blyAreszt: false,
  okresy_areszt: [{ ...EMPTY_OKRES }, { ...EMPTY_OKRES }, { ...EMPTY_OKRES }],
  ubezpieczenieRolnikow: false,
  zamieszkaWrp: true,
  okresy_poza_rp: [{ ...EMPTY_OKRES }, { ...EMPTY_OKRES }, { ...EMPTY_OKRES }],
  przerwy: [
    { ...EMPTY_PRZERWA },
    { ...EMPTY_PRZERWA },
    { ...EMPTY_PRZERWA },
    { ...EMPTY_PRZERWA },
  ],
  ojciec_smierc: false,
  ojciec_smierc_data: '',
  ojciec_porzucenie: false,
  ojciec_porzucenie_data: '',
  ojciec_zaprzestanie: false,
  ojciec_zaprzestanie_data: '',
  matka_imie: '',
  matka_nazwisko: '',
  matka_dataUrodzenia: '',
};

// ---- HELPERS ----

const IC = 'class="mono"';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 6 }}>{hint}</p>}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 8,
  border: '1px solid var(--color-border)', background: 'var(--color-bg-1)',
  color: 'var(--color-text-1)', fontSize: 14, fontFamily: 'inherit',
  boxSizing: 'border-box',
};

function NavButtons({ onBack, onNext, nextLabel = 'Dalej' }: { onBack?: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
      {onBack && (
        <button onClick={onBack} style={{
          flex: 1, padding: '12px 24px', borderRadius: 8, border: '1px solid var(--color-border)',
          background: 'transparent', color: 'var(--color-text-2)', fontSize: 14, cursor: 'pointer',
        }}>Wstecz</button>
      )}
      <button onClick={onNext} style={{
        flex: 2, padding: '12px 24px', borderRadius: 8, border: 'none',
        background: 'var(--color-accent)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
      }}>{nextLabel}</button>
    </div>
  );
}

function OswiadczenieBlock({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 14, color: 'var(--color-text-1)', marginBottom: 10, lineHeight: 1.5 }}>{label}</p>
      <div style={{ display: 'flex', gap: 10 }}>
        {(['NIE', 'TAK'] as const).map(opt => (
          <button key={opt} onClick={() => onChange(opt === 'TAK')} style={{
            flex: 1, padding: '10px', borderRadius: 8,
            border: `1px solid ${(opt === 'TAK') === value ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: (opt === 'TAK') === value ? 'var(--color-accent-soft)' : 'var(--color-bg-1)',
            color: (opt === 'TAK') === value ? 'var(--color-accent)' : 'var(--color-text-2)',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

// ---- STEPS ----

function StepWnioskodawca({ data, update, onNext }: {
  data: EruData;
  update: (k: keyof EruData, v: string | boolean | Okres[] | PrzerwaPraca[]) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 24 }}>Twoje dane</h2>
      <Field label="PESEL"><input className={IC} style={inputStyle} value={data.pesel} onChange={e => update('pesel', e.target.value)} placeholder="00000000000" /></Field>
      <Field label="Imie"><input style={inputStyle} value={data.imie} onChange={e => update('imie', e.target.value)} placeholder="Jan" /></Field>
      <Field label="Nazwisko"><input style={inputStyle} value={data.nazwisko} onChange={e => update('nazwisko', e.target.value)} placeholder="Kowalski" /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
        <Field label="Ulica"><input style={inputStyle} value={data.ulica} onChange={e => update('ulica', e.target.value)} /></Field>
        <Field label="Nr domu"><input style={inputStyle} value={data.nrDomu} onChange={e => update('nrDomu', e.target.value)} /></Field>
        <Field label="Nr lokalu"><input style={inputStyle} value={data.nrLokalu} onChange={e => update('nrLokalu', e.target.value)} /></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
        <Field label="Kod pocztowy"><input className={IC} style={inputStyle} value={data.kodPocztowy} onChange={e => update('kodPocztowy', e.target.value)} placeholder="00-000" /></Field>
        <Field label="Miejscowosc"><input style={inputStyle} value={data.miejscowosc} onChange={e => update('miejscowosc', e.target.value)} /></Field>
      </div>
      <Field label="Telefon" hint="Pole dobrowolne: ułatwia kontakt ZUS"><input className={IC} style={inputStyle} value={data.telefon} onChange={e => update('telefon', e.target.value)} placeholder="+48 000 000 000" /></Field>
      <Field label="Plec" hint="Wplywa na tresc oswiadczenia">
        <div style={{ display: 'flex', gap: 10 }}>
          {(['K', 'M'] as const).map(p => (
            <button key={p} onClick={() => update('plec', p)} style={{
              flex: 1, padding: '10px', borderRadius: 8,
              border: `1px solid ${data.plec === p ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: data.plec === p ? 'var(--color-accent-soft)' : 'var(--color-bg-1)',
              color: data.plec === p ? 'var(--color-accent)' : 'var(--color-text-2)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>{p === 'K' ? 'Kobieta' : 'Mezczyzna'}</button>
          ))}
        </div>
      </Field>
      <NavButtons onNext={onNext} />
    </div>
  );
}

function StepDzieci({ data, update, onBack, onNext }: {
  data: EruData;
  update: (k: keyof EruData, v: string | boolean | Okres[] | PrzerwaPraca[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const gender = data.plec === 'K';
  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 24 }}>Informacje o dzieciach</h2>
      <div style={{
        padding: '16px 20px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
        borderRadius: 10, fontSize: 13, color: 'var(--color-text-2)', marginBottom: 28, lineHeight: 1.6,
      }}>
        <p>Swiadczenie przysluguje gdy {gender ? 'urodzilas' : 'urodzil'} i {gender ? 'wychowala' : 'wychowal'} {gender ? 'Pani' : 'Pan'} co najmniej <strong>4 dzieci</strong> i nie {gender ? 'nabylas' : 'nabyl'} prawa do emerytury lub masz emeryture ponizej minimum (1901 zl od marca 2024).</p>
      </div>
      <Field label={`Ile dzieci ${gender ? 'Pani urodzila' : 'Pan urodzil'}`}>
        <input className={IC} style={inputStyle} type="number" min="0" value={data.liczbaUrodzonych}
          onChange={e => update('liczbaUrodzonych', e.target.value)} placeholder="4" />
      </Field>
      <Field label={`Ile dzieci ${gender ? 'Pani wychowala' : 'Pan wychowal'}`} hint="Moze byc mniejsza liczba jesli byly przerwy lub dziecko zmarlo">
        <input className={IC} style={inputStyle} type="number" min="0" value={data.liczbaWychowanych}
          onChange={e => update('liczbaWychowanych', e.target.value)} placeholder="4" />
      </Field>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepSytuacja({ data, update, onBack, onNext }: {
  data: EruData;
  update: (k: keyof EruData, v: string | boolean | Okres[] | PrzerwaPraca[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const updateOkresAreszt = (i: number, field: keyof Okres, val: string) => {
    const arr = [...data.okresy_areszt];
    arr[i] = { ...arr[i], [field]: val };
    update('okresy_areszt', arr);
  };
  const updateOkresPozaRp = (i: number, field: keyof Okres, val: string) => {
    const arr = [...data.okresy_poza_rp];
    arr[i] = { ...arr[i], [field]: val };
    update('okresy_poza_rp', arr);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 24 }}>Sytuacja osobista</h2>

      <OswiadczenieBlock
        label="Przebywam lub przebywalam/przebywaloem w areszcie sledczym lub zakladzie karnym"
        value={data.blyAreszt}
        onChange={v => update('blyAreszt', v)}
      />
      {data.blyAreszt && (
        <div style={{ padding: '16px 20px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-2)' }}>Okresy pobytu (od / do)</p>
          {data.okresy_areszt.map((o, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Od</label>
                <DateInput className={IC} style={inputStyle} value={o.od} onChange={v => updateOkresAreszt(i, 'od', v)} placeholder="dd.mm.rrrr" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Do</label>
                <DateInput className={IC} style={inputStyle} value={o.do} onChange={v => updateOkresAreszt(i, 'do', v)} placeholder="dd.mm.rrrr" />
              </div>
            </div>
          ))}
        </div>
      )}

      <OswiadczenieBlock
        label="Mam okresy podlegania ubezpieczeniu spolecznemu rolnikow"
        value={data.ubezpieczenieRolnikow}
        onChange={v => update('ubezpieczenieRolnikow', v)}
      />

      <OswiadczenieBlock
        label="Zamieszkuje na terytorium Rzeczypospolitej Polskiej"
        value={data.zamieszkaWrp}
        onChange={v => update('zamieszkaWrp', v)}
      />
      {!data.zamieszkaWrp && (
        <div style={{ padding: '16px 20px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-2)' }}>Okresy pobytu POZA RP (od / do)</p>
          {data.okresy_poza_rp.map((o, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Od</label>
                <DateInput className={IC} style={inputStyle} value={o.od} onChange={v => updateOkresPozaRp(i, 'od', v)} placeholder="dd.mm.rrrr" />
              </div>
              <div>
                <label style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Do</label>
                <DateInput className={IC} style={inputStyle} value={o.do} onChange={v => updateOkresPozaRp(i, 'do', v)} placeholder="dd.mm.rrrr" />
              </div>
            </div>
          ))}
        </div>
      )}

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepPrzerwy({ data, update, onBack, onNext }: {
  data: EruData;
  update: (k: keyof EruData, v: string | boolean | Okres[] | PrzerwaPraca[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  const updatePrzerwa = (i: number, field: keyof PrzerwaPraca, val: string) => {
    const arr = [...data.przerwy];
    arr[i] = { ...arr[i], [field]: val };
    update('przerwy', arr);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Przerwy w wychowywaniu</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Jezeli bylyprzierwy w wychowywaniu dzieci, podaj okresy i przyczyny. Zostaw puste jezeli nie bylo przerw.</p>

      {data.przerwy.map((p, i) => (
        <div key={i} style={{ padding: '16px 20px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, marginBottom: 14 }}>
          <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Przerwa {i + 1}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Od</label>
              <DateInput className={IC} style={inputStyle} value={p.od} onChange={v => updatePrzerwa(i, 'od', v)} placeholder="dd.mm.rrrr" />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Do</label>
              <DateInput className={IC} style={inputStyle} value={p.do} onChange={v => updatePrzerwa(i, 'do', v)} placeholder="dd.mm.rrrr" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--color-text-3)' }}>Przyczyna przerwy</label>
            <input style={inputStyle} value={p.przyczyna} onChange={e => updatePrzerwa(i, 'przyczyna', e.target.value)} placeholder="np. praca zawodowa, choroba..." />
          </div>
        </div>
      ))}

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepOjciec({ data, update, onBack, onNext }: {
  data: EruData;
  update: (k: keyof EruData, v: string | boolean | Okres[] | PrzerwaPraca[]) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8 }}>Dodatkowe informacje ojca</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>
        Ojciec moze ubiegac sie o swiadczenie tylko jesli matka dzieci: zmara, porzucila dzieci lub dlugotrwale zaprzestala ich wychowywania.
      </p>

      <OswiadczenieBlock
        label="a) Smierc matki dzieci"
        value={data.ojciec_smierc}
        onChange={v => update('ojciec_smierc', v)}
      />
      {data.ojciec_smierc && (
        <Field label="Data smierci matki">
          <DateInput className={IC} style={inputStyle} value={data.ojciec_smierc_data} onChange={v => update('ojciec_smierc_data', v)} placeholder="dd.mm.rrrr" />
        </Field>
      )}

      <OswiadczenieBlock
        label="b) Porzucenie dzieci przez matke"
        value={data.ojciec_porzucenie}
        onChange={v => update('ojciec_porzucenie', v)}
      />
      {data.ojciec_porzucenie && (
        <Field label="Data porzucenia przez matke">
          <DateInput className={IC} style={inputStyle} value={data.ojciec_porzucenie_data} onChange={v => update('ojciec_porzucenie_data', v)} placeholder="dd.mm.rrrr" />
        </Field>
      )}

      <OswiadczenieBlock
        label="c) Dlugotrwale zaprzestanie wychowywania dzieci przez matke"
        value={data.ojciec_zaprzestanie}
        onChange={v => update('ojciec_zaprzestanie', v)}
      />
      {data.ojciec_zaprzestanie && (
        <Field label="Data poczatkowa zaprzestania przez matke">
          <DateInput className={IC} style={inputStyle} value={data.ojciec_zaprzestanie_data} onChange={v => update('ojciec_zaprzestanie_data', v)} placeholder="dd.mm.rrrr" />
        </Field>
      )}

      <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dane matki dzieci</p>
        <Field label="Imie matki dzieci"><input style={inputStyle} value={data.matka_imie} onChange={e => update('matka_imie', e.target.value)} /></Field>
        <Field label="Nazwisko matki dzieci"><input style={inputStyle} value={data.matka_nazwisko} onChange={e => update('matka_nazwisko', e.target.value)} /></Field>
        <Field label="Data urodzenia matki dzieci"><DateInput className={IC} style={inputStyle} value={data.matka_dataUrodzenia} onChange={v => update('matka_dataUrodzenia', v)} placeholder="dd.mm.rrrr" /></Field>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function buildOutput(d: EruData): string {
  const U = (s: string) => s.toUpperCase();
  const yn = (v: boolean) => v ? 'TAK' : 'NIE';

  const lines: string[] = [
    'ERU: OSWIADCZENIE O SYTUACJI OSOBISTEJ, RODZINNEJ, MAJATKOWEJ I MATERIALNEJ',
    '(Oswiadczenie do wniosku ERSU: Rodzicielskie swiadczenie uzupelniajace)',
    '',
    'DANE IDENTYFIKACYJNE WNIOSKODAWCY',
    `PESEL: ${d.pesel}`,
    `IMIE: ${U(d.imie)}`,
    `NAZWISKO: ${U(d.nazwisko)}`,
    `ADRES: ${U(d.ulica)} ${d.nrDomu}${d.nrLokalu ? '/' + d.nrLokalu : ''}, ${d.kodPocztowy} ${U(d.miejscowosc)}`,
  ];
  if (d.telefon) lines.push(`TELEFON: ${d.telefon}`);

  lines.push('', 'INFORMACJE O DZIECIACH');
  const g = d.plec === 'K';
  lines.push(`${g ? 'URODZILAM' : 'URODZILAM/URODZILO'}: ${d.liczbaUrodzonych} DZIECI`);
  lines.push(`${g ? 'WYCHOWALAM' : 'WYCHOWALEM'}: ${d.liczbaWychowanych} DZIECI`);

  lines.push('', 'INFORMACJE MAJACE WPLYW NA ROZPATRZENIE WNIOSKU');
  lines.push(`POBYT W ARESZCIE LUB ZAKLADZIE KARNYM: ${yn(d.blyAreszt)}`);
  if (d.blyAreszt) {
    d.okresy_areszt.filter(o => o.od || o.do).forEach(o => {
      lines.push(`  OD: ${o.od}  DO: ${o.do}`);
    });
  }
  lines.push(`UBEZPIECZENIE SPOLECZNE ROLNIKOW: ${yn(d.ubezpieczenieRolnikow)}`);
  lines.push(`ZAMIESZKUJĘ NA TERYTORIUM RP: ${yn(d.zamieszkaWrp)}`);
  if (!d.zamieszkaWrp) {
    lines.push('OKRESY POZA RP:');
    d.okresy_poza_rp.filter(o => o.od || o.do).forEach(o => {
      lines.push(`  OD: ${o.od}  DO: ${o.do}`);
    });
  }

  const aktywneprzerwy = d.przerwy.filter(p => p.od || p.do || p.przyczyna);
  if (aktywneprzerwy.length > 0) {
    lines.push('', 'PRZERWY W WYCHOWYWANIU DZIECI');
    aktywneprzerwy.forEach((p, i) => {
      lines.push(`${i + 1}. OD: ${p.od}  DO: ${p.do}`);
      if (p.przyczyna) lines.push(`   PRZYCZYNA: ${U(p.przyczyna)}`);
    });
  }

  if (d.plec === 'M') {
    lines.push('', 'DODATKOWE INFORMACJE OJCA DZIECI');
    lines.push(`a) SMIERC MATKI DZIECI: ${yn(d.ojciec_smierc)}`);
    if (d.ojciec_smierc) lines.push(`   DATA SMIERCI: ${d.ojciec_smierc_data}`);
    lines.push(`b) PORZUCENIE DZIECI PRZEZ MATKE: ${yn(d.ojciec_porzucenie)}`);
    if (d.ojciec_porzucenie) lines.push(`   DATA PORZUCENIA: ${d.ojciec_porzucenie_data}`);
    lines.push(`c) DLUGOTRWALE ZAPRZESTANIE WYCHOWYWANIA: ${yn(d.ojciec_zaprzestanie)}`);
    if (d.ojciec_zaprzestanie) lines.push(`   DATA POCZATKOWA: ${d.ojciec_zaprzestanie_data}`);
    if (d.matka_imie || d.matka_nazwisko) {
      lines.push('', 'DANE MATKI DZIECI');
      if (d.matka_imie) lines.push(`IMIE: ${U(d.matka_imie)}`);
      if (d.matka_nazwisko) lines.push(`NAZWISKO: ${U(d.matka_nazwisko)}`);
      if (d.matka_dataUrodzenia) lines.push(`DATA URODZENIA: ${d.matka_dataUrodzenia}`);
    }
  }

  lines.push('', '---', 'Formularz przygotowany przez kreator wezmezadarmo.com');
  lines.push('WAZNE: Przed zlozeniem porownaj dane z oryginalnym formularzem ZUS ERU.');

  return lines.join('\n');
}

function StepPodglad({ data, onBack, onDone, onCopy, copied }: {
  data: EruData; onBack: () => void; onDone: () => void; onCopy: () => void; copied: boolean;
}) {
  const g = data.plec === 'K';
  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 24 }}>Podglad oswiadczenia</h2>

      <div style={{ padding: '20px 24px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, marginBottom: 24 }}>
        <Row label="Imie i nazwisko" value={`${data.imie} ${data.nazwisko}`} />
        <Row label="PESEL" value={data.pesel} mono />
        <Row label="Adres" value={`${data.ulica} ${data.nrDomu}${data.nrLokalu ? '/' + data.nrLokalu : ''}, ${data.kodPocztowy} ${data.miejscowosc}`} />
        <Row label={g ? 'Urodzila dzieci' : 'Urodzil dzieci'} value={data.liczbaUrodzonych} />
        <Row label={g ? 'Wychowala dzieci' : 'Wychowal dzieci'} value={data.liczbaWychowanych} />
        <Row label="Pobyt w areszcie" value={data.blyAreszt ? 'TAK' : 'NIE'} />
        <Row label="Ubezp. rolnikow" value={data.ubezpieczenieRolnikow ? 'TAK' : 'NIE'} />
        <Row label="Zamieszkuje w RP" value={data.zamieszkaWrp ? 'TAK' : 'NIE'} />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button onClick={onCopy} style={{
          flex: 1, padding: '13px 24px', borderRadius: 8,
          border: '1px solid var(--color-accent)', background: 'transparent',
          color: 'var(--color-accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>{copied ? 'Skopiowano!' : 'Kopiuj do schowka'}</button>
      </div>

      <NavButtons onBack={onBack} onNext={onDone} nextLabel="Gotowe" />
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', gap: 16 }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-3)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--color-text-1)', fontFamily: mono ? 'monospace' : 'inherit', textAlign: 'right' }}>{value || '--'}</span>
    </div>
  );
}

function StepDone({ onCopy, copied, onRestart }: { onCopy: () => void; copied: boolean; onRestart: () => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 32 }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'var(--color-accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Oswiadczenie ERU gotowe</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-2)', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.6 }}>
        Skopiuj dane do schowka i uzyj ich do wypelnienia oficjalnego formularza ERU ze strony ZUS.
        Formularz ERSU + ERU mozna zlozyc w oddziale ZUS lub przez portal eZUS.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400, margin: '0 auto 32px' }}>
        <button onClick={onCopy} style={{
          padding: '13px 24px', borderRadius: 8,
          border: '1px solid var(--color-accent)', background: 'var(--color-accent-soft)',
          color: 'var(--color-accent)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>{copied ? 'Skopiowano!' : 'Kopiuj dane do schowka'}</button>
        <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" style={{
          display: 'block', padding: '13px 24px', borderRadius: 8,
          border: '1px solid var(--color-border)', background: 'var(--color-bg-1)',
          color: 'var(--color-text-1)', fontSize: 14, textDecoration: 'none', textAlign: 'center',
        }}>Przejdz do eZUS (logowanie)</a>
        <button onClick={onRestart} style={{
          padding: '13px 24px', borderRadius: 8,
          border: '1px solid var(--color-border)', background: 'transparent',
          color: 'var(--color-text-2)', fontSize: 14, cursor: 'pointer',
        }}>Zacznij od nowa</button>
      </div>

      <div style={{ padding: '16px 20px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13, color: 'var(--color-text-2)', maxWidth: 460, margin: '0 auto', textAlign: 'left', lineHeight: 1.6 }}>
        <p style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-text-1)', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.05em' }}>Co dalej</p>
        <p style={{ marginBottom: 6 }}>1. Pobierz oryginalny formularz ERU ze strony zus.pl/wzory-formularzy</p>
        <p style={{ marginBottom: 6 }}>2. Pobierz formularz ERSU (wniosek glowny). ERU to tylko zalacznik</p>
        <p>3. Zloz oba formularze w oddziale ZUS lub elektronicznie przez PUE eZUS</p>
      </div>
    </div>
  );
}

// ---- MAIN COMPONENT ----

export default function ZusErsuPage() {
  const [step, setStep] = useState<Step>('wnioskodawca');
  const [data, setData] = useState<EruData>(EMPTY);
  const [copied, setCopied] = useState(false);

  const update = (key: keyof EruData, value: string | boolean | Okres[] | PrzerwaPraca[]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const getSteps = (): { key: Step; label: string }[] => {
    const steps: { key: Step; label: string }[] = [
      { key: 'wnioskodawca', label: 'Twoje dane' },
      { key: 'dzieci', label: 'Dzieci' },
      { key: 'sytuacja', label: 'Sytuacja' },
      { key: 'przerwy', label: 'Przerwy' },
    ];
    if (data.plec === 'M') steps.push({ key: 'ojciec', label: 'Informacje ojca' });
    steps.push({ key: 'podglad', label: 'Podglad' });
    return steps;
  };

  const STEPS = getSteps();
  const stepIdx = STEPS.findIndex(s => s.key === step);

  const copyAll = () => {
    navigator.clipboard.writeText(buildOutput(data)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const nextAfterPrzerwy = () => data.plec === 'M' ? setStep('ojciec') : setStep('podglad');
  const backFromPodglad = () => data.plec === 'M' ? setStep('ojciec') : setStep('przerwy');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>ERSU + ERU</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Zaklad Ubezpieczen Spolecznych</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>Mama 4+ / Tata 4+</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>Rodzicielskie świadczenie uzupełniające: oświadczenie ERU</p>

        <div style={{
          marginBottom: 32, padding: '20px 24px',
          background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
          borderRadius: 12, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.7,
          boxShadow: 'var(--shadow-1)',
        }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dla kogo</p>
          <p style={{ marginBottom: 14 }}>Dla rodzicow co najmniej 4 dzieci, ktorzy zrezygnowali z pracy by wychowywac dzieci i nie maja prawa do emerytury, renty lub maja swiadczenie ponizej 1901 zl miesieczne. Wniosek glowny: ERSU. Ten kreator pomaga wypelnic zalacznik ERU (oswiadczenie o sytuacji).</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jak zlozyc</p>
          <p>W oddziale ZUS lub przez portal <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>eZUS</a> (z profilem zaufanym lub e-Dowodem).</p>
        </div>

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

        {step === 'wnioskodawca' && <StepWnioskodawca data={data} update={update} onNext={() => setStep('dzieci')} />}
        {step === 'dzieci' && <StepDzieci data={data} update={update} onBack={() => setStep('wnioskodawca')} onNext={() => setStep('sytuacja')} />}
        {step === 'sytuacja' && <StepSytuacja data={data} update={update} onBack={() => setStep('dzieci')} onNext={() => setStep('przerwy')} />}
        {step === 'przerwy' && <StepPrzerwy data={data} update={update} onBack={() => setStep('sytuacja')} onNext={nextAfterPrzerwy} />}
        {step === 'ojciec' && <StepOjciec data={data} update={update} onBack={() => setStep('przerwy')} onNext={() => setStep('podglad')} />}
        {step === 'podglad' && (
          <StepPodglad data={data} onBack={backFromPodglad} onDone={() => setStep('done')}
            onCopy={copyAll} copied={copied} />
        )}
        {step === 'done' && (
          <StepDone onCopy={copyAll} copied={copied} onRestart={() => { setData(EMPTY); setStep('wnioskodawca'); }} />
        )}
      </div>
      <FormChatWidget formType="zus-ersu" />
    </div>
  );
}
