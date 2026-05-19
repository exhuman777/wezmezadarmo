'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DateInput } from '@/components/DateInput';
import { FormChatWidget } from '@/components/FormChatWidget';

// ---- TYPES ----

type KtoUdziela = 'własne' | 'firma' | 'podmiot';
type ZakresPelnomocnictwa = 'wszystkie' | 'pit' | 'konkretna' | 'ezus';

interface PelData {
  // Mocodawca (osoba udzielajaca)
  imie: string;
  nazwisko: string;
  pesel: string;
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowość: string;
  telefon: string;
  ktoUdziela: KtoUdziela;
  nipFirmy: string; // jeśli firma

  // Pełnomocnik
  imiePeln: string;
  nazwiskoPeln: string;
  peselPeln: string;
  ulicaPeln: string;
  nrDomuPeln: string;
  nrLokoluPeln: string;
  kodPocztowyPeln: string;
  miejscowośćPeln: string;
  telefonPeln: string;

  // Zakres
  zakres: ZakresPelnomocnictwa;
  konkretnaCzynnosc: string;
  rolEzusUbezpieczony: boolean;
  rolEzusSwiadzeniobiorca: boolean;
  rolEzusPłatnik: boolean;

  // Daty
  dataOd: string;
  dataDo: string;
}

type Step = 'mocodawca' | 'pełnomocnik' | 'zakres' | 'podgląd' | 'done';

const EMPTY: PelData = {
  imie: '', nazwisko: '', pesel: '',
  ulica: '', nrDomu: '', nrLokalu: '', kodPocztowy: '', miejscowość: '', telefon: '',
  ktoUdziela: 'własne', nipFirmy: '',
  imiePeln: '', nazwiskoPeln: '', peselPeln: '',
  ulicaPeln: '', nrDomuPeln: '', nrLokoluPeln: '', kodPocztowyPeln: '', miejscowośćPeln: '', telefonPeln: '',
  zakres: 'wszystkie', konkretnaCzynnosc: '',
  rolEzusUbezpieczony: false, rolEzusSwiadzeniobiorca: false, rolEzusPłatnik: false,
  dataOd: '', dataDo: '',
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'mocodawca', label: 'Twoje dane' },
  { key: 'pełnomocnik', label: 'Pełnomocnik' },
  { key: 'zakres', label: 'Zakres' },
  { key: 'podgląd', label: 'Podgląd' },
];

// ---- COMPONENT ----

export default function ZusPelPage() {
  const [step, setStep] = useState<Step>('mocodawca');
  const [data, setData] = useState<PelData>(EMPTY);
  const [copied, setCopied] = useState(false);

  const update = (key: keyof PelData, value: string | boolean) =>
    setData(prev => ({ ...prev, [key]: value }));

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const downloadTxt = () => {
    const txt = buildOutput(data);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PEL-${data.imie}-${data.nazwisko}.txt`.replace(/\s+/g, '-');
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>PEL</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Zakład Ubezpieczeń Społecznych</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>Pełnomocnictwo</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>Upoważnij wybraną przez Ciebie osobę do załatwienia spraw w ZUS w Twoim imieniu</p>

        <div style={{ marginBottom: 32, padding: '20px 24px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.7, boxShadow: 'var(--shadow-1)' }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kiedy potrzebne</p>
          <p style={{ marginBottom: 12 }}>Gdy chcesz upoważnić małżonka, dzieci, prawnika lub księgowego do: składania wniosków w ZUS w Twoim imieniu, odbierania korespondencji, korzystania z portalu eZUS.</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jak złożyć</p>
          <p>Osobiście w oddziale ZUS (wymagany podpis własnoręcznie), pocztą lub przez <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>portal eZUS</a> z profilem zaufanym. Zakres PEL nie obejmuje kontroli ZUS (do tego służy PEL-K).</p>
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

        {step === 'mocodawca' && <StepMocodawca data={data} update={update} onNext={() => setStep('pełnomocnik')} />}
        {step === 'pełnomocnik' && <StepPełnomocnik data={data} update={update} onBack={() => setStep('mocodawca')} onNext={() => setStep('zakres')} />}
        {step === 'zakres' && <StepZakres data={data} update={update} onBack={() => setStep('pełnomocnik')} onNext={() => setStep('podgląd')} />}
        {step === 'podgląd' && <StepPodgląd data={data} onBack={() => setStep('zakres')} onDone={() => setStep('done')} onDownload={downloadTxt} onCopy={copyAll} copied={copied} />}
        {step === 'done' && <StepDone onDownload={downloadTxt} onCopy={copyAll} copied={copied} onRestart={() => { setData(EMPTY); setStep('mocodawca'); }} />}
      </div>
      <FormChatWidget formType="zus-pel" />
    </div>
  );
}

// ---- STEPS ----

function StepMocodawca({ data, update, onNext }: { data: PelData; update: (k: keyof PelData, v: string | boolean) => void; onNext: () => void }) {
  const valid = data.imie.trim().length > 0 && data.nazwisko.trim().length > 0 && data.pesel.trim().length === 11;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Dane osoby udzielającej pełnomocnictwa</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Imię *"><input className={IC} value={data.imie} onChange={e => update('imie', e.target.value)} placeholder="Jan" /></Field>
          <Field label="Nazwisko *"><input className={IC} value={data.nazwisko} onChange={e => update('nazwisko', e.target.value)} placeholder="Kowalski" /></Field>
        </div>
        <Field label="PESEL *" hint="Przesyłany na serwer wyłącznie do wygenerowania PDF, bez zapisu">
          <input className={IC} value={data.pesel} onChange={e => update('pesel', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10 }}>
          <Field label="Ulica"><input className={IC} value={data.ulica} onChange={e => update('ulica', e.target.value)} placeholder="Kwiatowa" /></Field>
          <Field label="Nr domu"><input className={IC} style={{ width: 80 }} value={data.nrDomu} onChange={e => update('nrDomu', e.target.value)} placeholder="1" /></Field>
          <Field label="Nr lokalu"><input className={IC} style={{ width: 80 }} value={data.nrLokalu} onChange={e => update('nrLokalu', e.target.value)} placeholder="2" /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12 }}>
          <Field label="Kod pocztowy"><input className={IC} style={{ width: 100 }} value={data.kodPocztowy} onChange={e => update('kodPocztowy', e.target.value)} placeholder="00-001" maxLength={6} /></Field>
          <Field label="Miejscowość"><input className={IC} value={data.miejscowość} onChange={e => update('miejscowość', e.target.value)} placeholder="Warszawa" /></Field>
        </div>
        <Field label="Telefon" hint="Opcjonalnie"><input className={IC} value={data.telefon} onChange={e => update('telefon', e.target.value)} placeholder="+48 600 000 000" /></Field>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8 }}>Działasz w imieniu:</label>
          {[
            { v: 'własne', label: 'Własnym (jako ubezpieczony, emeryt, rencista)' },
            { v: 'firma', label: 'Swojej firmy (jako przedsiębiorca lub komornik)' },
            { v: 'podmiot', label: 'Innego podmiotu (spółka, instytucja)' },
          ].map(opt => (
            <label key={opt.v} style={{
              display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8,
              padding: '12px 14px',
              background: data.ktoUdziela === opt.v ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
              border: `1px solid ${data.ktoUdziela === opt.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 8, cursor: 'pointer',
            }}>
              <input type="radio" name="kto" value={opt.v} checked={data.ktoUdziela === opt.v} onChange={() => update('ktoUdziela', opt.v)} style={{ accentColor: 'var(--color-accent)' }} />
              <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{opt.label}</span>
            </label>
          ))}
        </div>
        {(data.ktoUdziela === 'firma' || data.ktoUdziela === 'podmiot') && (
          <Field label="NIP firmy / podmiotu">
            <input className={IC} value={data.nipFirmy} onChange={e => update('nipFirmy', e.target.value)} placeholder="0000000000" maxLength={10} />
          </Field>
        )}
      </div>
      <NavButtons onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepPełnomocnik({ data, update, onBack, onNext }: { data: PelData; update: (k: keyof PelData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  const valid = data.imiePeln.trim().length > 0 && data.nazwiskoPeln.trim().length > 0;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Dane pełnomocnika</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Osoba, która będzie załatwiać sprawy w ZUS w Twoim imieniu.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Imię *"><input className={IC} value={data.imiePeln} onChange={e => update('imiePeln', e.target.value)} placeholder="Anna" /></Field>
          <Field label="Nazwisko *"><input className={IC} value={data.nazwiskoPeln} onChange={e => update('nazwiskoPeln', e.target.value)} placeholder="Kowalska" /></Field>
        </div>
        <Field label="PESEL pełnomocnika" hint="Jeśli posiada PESEL">
          <input className={IC} value={data.peselPeln} onChange={e => update('peselPeln', e.target.value)} placeholder="00000000000" maxLength={11} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10 }}>
          <Field label="Ulica"><input className={IC} value={data.ulicaPeln} onChange={e => update('ulicaPeln', e.target.value)} placeholder="Rózana" /></Field>
          <Field label="Nr domu"><input className={IC} style={{ width: 80 }} value={data.nrDomuPeln} onChange={e => update('nrDomuPeln', e.target.value)} placeholder="5" /></Field>
          <Field label="Nr lokalu"><input className={IC} style={{ width: 80 }} value={data.nrLokoluPeln} onChange={e => update('nrLokoluPeln', e.target.value)} placeholder="" /></Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12 }}>
          <Field label="Kod pocztowy"><input className={IC} style={{ width: 100 }} value={data.kodPocztowyPeln} onChange={e => update('kodPocztowyPeln', e.target.value)} placeholder="00-001" maxLength={6} /></Field>
          <Field label="Miejscowość"><input className={IC} value={data.miejscowośćPeln} onChange={e => update('miejscowośćPeln', e.target.value)} placeholder="Warszawa" /></Field>
        </div>
        <Field label="Telefon pełnomocnika" hint="Opcjonalnie">
          <input className={IC} value={data.telefonPeln} onChange={e => update('telefonPeln', e.target.value)} placeholder="+48 500 000 000" />
        </Field>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepZakres({ data, update, onBack, onNext }: { data: PelData; update: (k: keyof PelData, v: string | boolean) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Zakres pełnomocnictwa</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Wybierz co pełnomocnik będzie mógł robić w ZUS w Twoim imieniu.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8 }}>Udzielam pełnomocnictwa:</label>
          {[
            { v: 'wszystkie', label: 'Do zalatwienia wszystkich moich spraw w ZUS (pełny zakres)' },
            { v: 'pit', label: 'Do otrzymywania deklaracji PIT z ZUS' },
            { v: 'konkretna', label: 'Do wykonania konkretnej czynności / zalatwienia sprawy' },
            { v: 'ezus', label: 'Do zalatwiana spraw przez portal eZUS' },
          ].map(opt => (
            <label key={opt.v} style={{
              display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8,
              padding: '12px 14px',
              background: data.zakres === opt.v ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
              border: `1px solid ${data.zakres === opt.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 8, cursor: 'pointer',
            }}>
              <input type="radio" name="zakres" value={opt.v} checked={data.zakres === opt.v} onChange={() => update('zakres', opt.v)} style={{ accentColor: 'var(--color-accent)' }} />
              <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{opt.label}</span>
            </label>
          ))}
        </div>

        {data.zakres === 'konkretna' && (
          <Field label="Czego dotyczy pełnomocnictwo" hint='Np. "wypłaty zasiłku macierzyńskiego" lub "złożyćia wniosku o emeryturę ERPO"'>
            <textarea className={IC} style={{ minHeight: 70, resize: 'none' }} value={data.konkretnaCzynnosc} onChange={e => update('konkretnaCzynnosc', e.target.value)} placeholder="Zlozenia wniosku o zasiłek chorobowy ZAS-53" />
          </Field>
        )}

        {data.zakres === 'ezus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role na portalu eZUS:</label>
            {[
              { key: 'rolEzusUbezpieczony', label: 'Ubezpieczony: stan konta, zgłoszenia, składki, zwolnienia' },
              { key: 'rolEzusSwiadzeniobiorca', label: 'Świadczeniobiorca: emerytury, renty, zasiłki, PIT' },
              { key: 'rolEzusPłatnik', label: 'Płatnik składek: rozliczenia, zgłoszenia do ubezpieczeń, ePłatnik' },
            ].map(item => (
              <label key={item.key} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '12px 14px',
                background: data[item.key as keyof PelData] ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
                border: `1px solid ${data[item.key as keyof PelData] ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 8, cursor: 'pointer',
              }}>
                <input type="checkbox" checked={!!data[item.key as keyof PelData]} onChange={e => update(item.key as keyof PelData, e.target.checked)} style={{ accentColor: 'var(--color-accent)', width: 15, height: 15 }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{item.label}</span>
              </label>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Pełnomocnictwo od" hint="DD.MM.RRRR (jeśli puste: od dnia doręczenia do ZUS)">
            <DateInput className={IC} value={data.dataOd} onChange={v => update('dataOd', v)} placeholder="17.05.2026" />
          </Field>
          <Field label="Pełnomocnictwo do" hint="DD.MM.RRRR (jeśli puste: bezterminowe)">
            <DateInput className={IC} value={data.dataDo} onChange={v => update('dataDo', v)} placeholder="31.12.2026" />
          </Field>
        </div>

        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          Pełnomocnictwo wymaga wlasnoreczcznego podpisu mocodawcy. Musi być zlozone osobiście w ZUS lub przeslanego pocztą z podpisem. Mozna też udzielic pełnomocnictwa przez portal eZUS z profilem zaufanym.
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Podgląd" />
    </div>
  );
}

function StepPodgląd({ data, onBack, onDone, onDownload, onCopy, copied }: {
  data: PelData; onBack: () => void; onDone: () => void;
  onDownload: () => void; onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Podgląd pełnomocnictwa PEL</h2>
      <div className="mono" style={{
        background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
        borderRadius: 10, padding: '20px 24px', fontSize: 12, color: 'var(--color-text-2)',
        lineHeight: 1.8, whiteSpace: 'pre-wrap', boxShadow: 'var(--shadow-1)',
        maxHeight: 400, overflowY: 'auto',
      }}>
        {buildOutput(data)}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button onClick={onDownload} className="btn btn-primary" style={{ borderRadius: 8, fontSize: 13 }}>Pobierz .txt</button>
        <button onClick={onCopy} className="btn btn-outline" style={{ borderRadius: 8, fontSize: 13 }}>
          {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
        </button>
      </div>
      <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13, color: 'var(--color-text-2)', boxShadow: 'var(--shadow-1)' }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 12, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jak złożyć PEL</p>
        <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.65 }}>
          <li>Pobierz oryginalny formularz PEL: <a href="https://www.zus.pl/wzory-formularzy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>zus.pl/wzory-formularzy</a></li>
          <li>Wypełnij i podpisz własnoręcznie (wymagany oryginalny podpis)</li>
          <li>Złóż osobiście w oddziale ZUS lub wyślij pocztą</li>
          <li>Lub udziel pełnomocnictwa przez <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>portal eZUS</a> z profilem zaufanym</li>
        </ol>
      </div>
      <NavButtons onBack={onBack} onNext={onDone} nextLabel="Gotowe" />
    </div>
  );
}

function StepDone({ onDownload, onCopy, copied, onRestart }: { onDownload: () => void; onCopy: () => void; copied: boolean; onRestart: () => void }) {
  return (
    <div>
      <span className="label-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Gotowe</span>
      <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)', marginBottom: 12 }}>Pełnomocnictwo przygotowane</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 32, lineHeight: 1.7 }}>
        Przepisz dane do oryginalnego formularza PEL ze strony zus.pl i podpisz własnoręcznie. Złóż w ZUS osobiście lub pocztą.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <button onClick={onDownload} className="btn btn-primary" style={{ width: '100%', height: 50, borderRadius: 10, fontSize: 14 }}>Pobierz dane PEL (.txt)</button>
        <button onClick={onCopy} className="btn btn-outline" style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13 }}>
          {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
        </button>
        <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" className="btn"
          style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13, color: 'var(--color-accent)', border: '1px solid var(--color-accent)', justifyContent: 'center' }}>
          Udziel pełnomocnictwa przez eZUS
        </a>
        <a href="https://www.zus.pl/wzory-formularzy" target="_blank" rel="noopener noreferrer" className="btn"
          style={{ width: '100%', height: 40, borderRadius: 10, fontSize: 12, color: 'var(--color-text-2)', border: '1px solid var(--color-border)', justifyContent: 'center' }}>
          Oryginalny formularz PEL na zus.pl
        </a>
      </div>
      <button onClick={onRestart} style={{ fontSize: 13, color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>Wypełnij ponownie</button>
    </div>
  );
}

// ---- HELPERS ----

function buildOutput(d: PelData): string {
  const ktoLabel = { własne: 'Własnym (ubezpieczony / świadczeniobiorca)', firma: 'Firmy (przedsiębiorca / komornik)', podmiot: 'Innego podmiotu' }[d.ktoUdziela];
  const zakresList = {
    wszystkie: 'Do zalatwienia wszystkich spraw w ZUS',
    pit: 'Do otrzymywania deklaracji PIT z ZUS',
    konkretna: `Do wykonania konkretnej czynności: ${d.konkretnaCzynnosc}`,
    ezus: `Do zalatwania spraw przez portal eZUS:\n  ${[d.rolEzusUbezpieczony && 'Ubezpieczony', d.rolEzusSwiadzeniobiorca && 'Świadczeniobiorca', d.rolEzusPłatnik && 'Płatnik składek'].filter(Boolean).join(', ')}`,
  }[d.zakres];

  return `PELNOMOCNICTWO PEL
Formularz pełnomocnictwa do zalatwienia spraw w ZUS

Wypelnic WIELKIMI LITERAMI. Pola wyboru zaznaczyc X.
Pobierz oryginalny formularz: https://www.zus.pl/wzory-formularzy

========================================
DANE OSOBY UDZIELAJACEJ PELNOMOCNICTWA

Imię: ${d.imie.toUpperCase()}
Nazwisko: ${d.nazwisko.toUpperCase()}
PESEL: ${d.pesel}
Ulica: ${d.ulica.toUpperCase()}
Nr domu: ${d.nrDomu}   Nr lokalu: ${d.nrLokalu || '--'}
Kod pocztowy: ${d.kodPocztowy}
Miejscowość: ${d.miejscowość.toUpperCase()}
Telefon: ${d.telefon || '--'}

Działając w imieniu: ${ktoLabel}
${d.nipFirmy ? `NIP firmy: ${d.nipFirmy}` : ''}

========================================
DANE PELNOMOCNIKA

Imię: ${d.imiePeln.toUpperCase()}
Nazwisko: ${d.nazwiskoPeln.toUpperCase()}
PESEL: ${d.peselPeln || '--'}
Ulica: ${d.ulicaPeln.toUpperCase()}
Nr domu: ${d.nrDomuPeln}   Nr lokalu: ${d.nrLokoluPeln || '--'}
Kod pocztowy: ${d.kodPocztowyPeln}
Miejscowość: ${d.miejscowośćPeln.toUpperCase()}
Telefon: ${d.telefonPeln || '--'}

========================================
ZAKRES PELNOMOCNICTWA

${zakresList}

Pełnomocnictwo obowiązuje:
Od: ${d.dataOd || 'od dnia doręczenia do ZUS'}
Do: ${d.dataDo || 'bezterminowo (do odwołania)'}

========================================

Data: .........................
Podpis osoby udzielajacej pełnomocnictwa: .........................

(wymagany wlasnorecczny podpis na oryginalnym formularzu)

========================================
INSTRUKCJA:
1. Pobierz oryginalny PEL: https://www.zus.pl/wzory-formularzy
2. Przepisz dane WIELKIMI LITERAMI i podpisz własnoręcznie
3. Złóż osobiście w ZUS lub wyślij pocztą
4. Lub udziel pełnomocnictwa elektronicznie: https://www.zus.pl/ezus/logowanie?jezyk=pl

UWAGA: Zakres PEL nie obejmuje kontroli ZUS. Do reprezentowania podczas kontroli użyj formularza PEL-K.

Wygenerowano: wezmezadarmo.com/wnioski/zus-pel
`;
}

// ---- SHARED ----

function NavButtons({ onBack, onNext, nextLabel = 'Dalej', nextDisabled = false }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
      {onBack ? <button onClick={onBack} className="btn btn-ghost" style={{ borderRadius: 8, fontSize: 13 }}>Wstecz</button> : <div />}
      {onNext && (
        <button onClick={onNext} disabled={nextDisabled} className="btn btn-primary"
          style={{ borderRadius: 999, fontSize: 13, opacity: nextDisabled ? 0.4 : 1, cursor: nextDisabled ? 'not-allowed' : 'pointer' }}>
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
