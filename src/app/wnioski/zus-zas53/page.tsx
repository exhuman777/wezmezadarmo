'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DateInput } from '@/components/DateInput';
import { FormChatWidget } from '@/components/FormChatWidget';
import { useFormPrefill } from '@/lib/wnioski/useFormPrefill';
import { PrefillBanner } from '@/components/PrefillBanner';

// ---- TYPES ----

type RodzajNiezdolnośći = 'nie-dotyczy' | 'choroba-zawodowa' | 'wypadek-przy-pracy' | 'wypadek-w-drodze';
type OkresUbezpieczenia = 'w-trakcie' | 'po-ustaniu';

interface Zas53Data {
  // Twoje dane
  imie: string;
  nazwisko: string;
  pesel: string;
  ulica: string;
  nrDomu: string;
  nrLokalu: string;
  kodPocztowy: string;
  miejscowość: string;
  telefon: string;

  // Dane płatnika składek
  nazwaPlatinika: string;
  nipPłatnika: string;
  regonPłatnika: string;

  // Konto bankowe (opcjonalne)
  nrKonta: string;

  // Wniosek o zasiłek
  dataOd: string;
  dataDo: string;
  numerEzla: string;
  okresUbezpieczenia: OkresUbezpieczenia;
  dataUstaniaUbezpieczenia: string; // jeśli po ustaniu
  rodzajNiezdolnośći: RodzajNiezdolnośći;
}

type Step = 'wnioskodawca' | 'platnik' | 'zasiłek' | 'podgląd' | 'done';

const EMPTY: Zas53Data = {
  imie: '',
  nazwisko: '',
  pesel: '',
  ulica: '',
  nrDomu: '',
  nrLokalu: '',
  kodPocztowy: '',
  miejscowość: '',
  telefon: '',
  nazwaPlatinika: '',
  nipPłatnika: '',
  regonPłatnika: '',
  nrKonta: '',
  dataOd: '',
  dataDo: '',
  numerEzla: '',
  okresUbezpieczenia: 'w-trakcie',
  dataUstaniaUbezpieczenia: '',
  rodzajNiezdolnośći: 'nie-dotyczy',
};

const STEPS: { key: Step; label: string }[] = [
  { key: 'wnioskodawca', label: 'Twoje dane' },
  { key: 'platnik', label: 'Płatnik składek' },
  { key: 'zasiłek', label: 'Wniosek o zasiłek' },
  { key: 'podgląd', label: 'Podgląd' },
];

const FIELD_MAP: Partial<Record<keyof Zas53Data, string>> = {
  imie: 'imie',
  nazwisko: 'nazwisko',
  pesel: 'pesel',
  ulica: 'ulica',
  nrDomu: 'nr_domu',
  nrLokalu: 'nr_lokalu',
  kodPocztowy: 'kod_pocztowy',
  miejscowość: 'miejscowosc',
  telefon: 'telefon',
  nrKonta: 'nr_konta',
};

const RODZAJ_LABELS: Record<RodzajNiezdolnośći, string> = {
  'nie-dotyczy': 'Nie dotyczy (zwykła choroba)',
  'choroba-zawodowa': 'Choroba zawodowa',
  'wypadek-przy-pracy': 'Wypadek przy pracy',
  'wypadek-w-drodze': 'Wypadek w drodze do pracy lub z pracy',
};

// ---- COMPONENT ----

export default function ZusZas53Page() {
  const [step, setStep] = useState<Step>('wnioskodawca');
  const { data, setData, prefillStatus, prefillCount, isLoggedIn } = useFormPrefill<Zas53Data>('zus-zas53', EMPTY, FIELD_MAP);
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const update = (key: keyof Zas53Data, value: string) =>
    setData(prev => ({ ...prev, [key]: value }));

  const stepIdx = STEPS.findIndex(s => s.key === step);

  const downloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType: 'zus-zas53', data }),
      });
      if (!res.ok) throw new Error('PDF error');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZAS-53-${(data.imie + '-' + data.nazwisko).replace(/\s+/g, '-') || 'wniosek'}.pdf`;
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--color-accent)', background: 'var(--color-accent-soft)', padding: '3px 8px', borderRadius: 6, fontWeight: 500 }}>ZAS-53</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Zakład Ubezpieczeń Społecznych</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: 8 }}>Zasiłek chorobowy</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 32 }}>Wniosek ZAS-53 składany bezpośrednio do ZUS</p>

        <div style={{
          marginBottom: 32, padding: '20px 24px',
          background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
          borderRadius: 12, fontSize: 13, color: 'var(--color-text-2)', lineHeight: 1.7,
          boxShadow: 'var(--shadow-1)',
        }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dla kogo jest ZAS-53</p>
          <p style={{ marginBottom: 14 }}>Ten formularz składają bezpośrednio do ZUS: przedsiębiorcy prowadzący działalność, osoby współpracujące, osoby korzystające z ulgi na start, duchowni, marynarze oraz osoby niezdolne do pracy po ustaniu zatrudnienia. Pracownicy etatowi składają wniosek przez pracodawcę (nie ZAS-53).</p>
          <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gdzie złożyć</p>
          <p>W oddziale ZUS, pocztą lub elektronicznie przez portal <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>eZUS</a> (z profilem zaufanym).</p>
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

        {step === 'wnioskodawca' && (
          <PrefillBanner status={prefillStatus} count={prefillCount} isLoggedIn={isLoggedIn} />
        )}
        {step === 'wnioskodawca' && <StepWnioskodawca data={data} update={update} onNext={() => setStep('platnik')} />}
        {step === 'platnik' && <StepPłatnik data={data} update={update} onBack={() => setStep('wnioskodawca')} onNext={() => setStep('zasiłek')} />}
        {step === 'zasiłek' && <StepZasiłek data={data} update={update} onBack={() => setStep('platnik')} onNext={() => setStep('podgląd')} />}
        {step === 'podgląd' && (
          <StepPodgląd data={data} onBack={() => setStep('zasiłek')} onDone={() => setStep('done')}
            onDownloadPdf={() => { void downloadPdf(); }} downloadingPdf={downloadingPdf}
            onCopy={copyAll} copied={copied} />
        )}
        {step === 'done' && (
          <StepDone onDownloadPdf={() => { void downloadPdf(); }} downloadingPdf={downloadingPdf}
            onCopy={copyAll} copied={copied} onRestart={() => { setData(EMPTY); setStep('wnioskodawca'); }} />
        )}
      </div>
      <FormChatWidget formType="zus-zas53" />
    </div>
  );
}

// ---- STEPS ----

function StepWnioskodawca({ data, update, onNext }: { data: Zas53Data; update: (k: keyof Zas53Data, v: string) => void; onNext: () => void }) {
  const valid = data.imie.trim().length > 0 && data.nazwisko.trim().length > 0 && data.pesel.trim().length === 11;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Twoje dane</h2>
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
        <Field label="Telefon" hint="Opcjonalnie: ułatwia kontakt ZUS">
          <input className={IC} value={data.telefon} onChange={e => update('telefon', e.target.value)} placeholder="+48 600 000 000" />
        </Field>
      </div>
      <NavButtons onNext={onNext} nextDisabled={!valid} />
    </div>
  );
}

function StepPłatnik({ data, update, onBack, onNext }: { data: Zas53Data; update: (k: keyof Zas53Data, v: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8, letterSpacing: '-0.01em' }}>Dane płatnika składek</h2>
      <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>Płatnik to firma lub osoba, która opłacała za Ciebie składki na ubezpieczenie, z którego wnioskujesz o zasiłek. Jeśli jesteś przedsiębiorcą, podaj dane swojej firmy.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Field label="Nazwa albo imię i nazwisko płatnika">
          <input className={IC} value={data.nazwaPlatinika} onChange={e => update('nazwaPlatinika', e.target.value)} placeholder="Jan Kowalski, działalność gospodarcza" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="NIP"><input className={IC} value={data.nipPłatnika} onChange={e => update('nipPłatnika', e.target.value)} placeholder="0000000000" maxLength={10} /></Field>
          <Field label="REGON"><input className={IC} value={data.regonPłatnika} onChange={e => update('regonPłatnika', e.target.value)} placeholder="000000000" maxLength={9} /></Field>
        </div>
        <Field label="Numer rachunku bankowego" hint="Opcjonalnie. Jeśli nie podasz, ZUS wypłaci przekazem pocztowym.">
          <input className={IC} value={data.nrKonta} onChange={e => update('nrKonta', e.target.value)} placeholder="PL00 0000 0000 0000 0000 0000 0000" />
        </Field>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} />
    </div>
  );
}

function StepZasiłek({ data, update, onBack, onNext }: { data: Zas53Data; update: (k: keyof Zas53Data, v: string) => void; onBack: () => void; onNext: () => void }) {
  const valid = data.dataOd.trim().length > 0 && data.dataDo.trim().length > 0;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Wniosek o przyznanie zasiłku chorobowego</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Okres */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Niezdolność od *" hint="DD.MM.RRRR">
            <DateInput className={IC} value={data.dataOd} onChange={v => update('dataOd', v)} placeholder="01.05.2026" />
          </Field>
          <Field label="Niezdolność do *" hint="DD.MM.RRRR">
            <DateInput className={IC} value={data.dataDo} onChange={v => update('dataDo', v)} placeholder="14.05.2026" />
          </Field>
        </div>

        <Field label="Seria i numer zaświadczenia lekarskiego (e-ZLA)" hint="Opcjonalnie, jeśli pamiętasz. Zaświadczenie elektroniczne trafia do ZUS automatycznie.">
          <input className={IC} value={data.numerEzla} onChange={e => update('numerEzla', e.target.value)} placeholder="np. K/12345678" />
        </Field>

        {/* Okres ubezpieczenia */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8 }}>
            Wniosek dotyczy okresu niezdolności do pracy:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { v: 'w-trakcie', label: 'W okresie ubezpieczenia chorobowego / wypadkowego' },
              { v: 'po-ustaniu', label: 'Po ustaniu tytułu ubezpieczenia chorobowego / wypadkowego' },
            ].map(opt => (
              <label key={opt.v} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '12px 14px',
                background: data.okresUbezpieczenia === opt.v ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
                border: `1px solid ${data.okresUbezpieczenia === opt.v ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 8, cursor: 'pointer',
              }}>
                <input type="radio" name="okres" value={opt.v} checked={data.okresUbezpieczenia === opt.v} onChange={() => update('okresUbezpieczenia', opt.v)} style={{ accentColor: 'var(--color-accent)' }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {data.okresUbezpieczenia === 'po-ustaniu' && (
          <Field label="Data ustania tytułu ubezpieczenia" hint="DD.MM.RRRR - data do której byłeś ubezpieczony">
            <DateInput className={IC} value={data.dataUstaniaUbezpieczenia} onChange={v => update('dataUstaniaUbezpieczenia', v)} placeholder="30.04.2026" />
          </Field>
        )}

        {/* Rodzaj niezdolności */}
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 8 }}>
            Wniosek dotyczy niezdolności z powodu:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(Object.entries(RODZAJ_LABELS) as [RodzajNiezdolnośći, string][]).map(([k, v]) => (
              <label key={k} style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '12px 14px',
                background: data.rodzajNiezdolnośći === k ? 'color-mix(in srgb, var(--color-accent) 8%, var(--color-bg-1))' : 'var(--color-bg-1)',
                border: `1px solid ${data.rodzajNiezdolnośći === k ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 8, cursor: 'pointer',
              }}>
                <input type="radio" name="rodzaj" value={k} checked={data.rodzajNiezdolnośći === k} onChange={() => update('rodzajNiezdolnośći', k)} style={{ accentColor: 'var(--color-accent)' }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>{v}</span>
              </label>
            ))}
          </div>
        </div>

        {(data.rodzajNiezdolnośći === 'choroba-zawodowa' || data.rodzajNiezdolnośći === 'wypadek-przy-pracy') && (
          <div style={{ padding: '12px 16px', background: 'color-mix(in srgb, var(--color-accent) 6%, var(--color-bg-1))', border: '1px solid var(--color-amber-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>
            {data.rodzajNiezdolnośći === 'choroba-zawodowa'
              ? 'Dołącz do wniosku: decyzje o stwierdzeniu choroby zawodowej i zaświadczenie lekarskie, ze niezdolność jest spowodowana ta choroba.'
              : 'Wyplata zasiłku z tytułu wypadku nastapi po uznaniu zdarzenia za wypadek przy pracy. Dołącz protokol powypadkowy lub karte wypadku.'}
          </div>
        )}

        <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-3)', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 600, color: 'var(--color-text-2)', marginBottom: 4 }}>Wysokość zasiłku</p>
          <p>80% podstawy wymiaru. 100% gdy: niezdolność w ciazy, wypadek przy pracy lub w drodze, choroba zawodowa, dawstwo komorek i tkanek. Maksymalny okres: 182 dni (270 dni dla gruzlicy lub w ciazy).</p>
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextDisabled={!valid} nextLabel="Podgląd wniosku" />
    </div>
  );
}

function StepPodgląd({ data, onBack, onDone, onDownloadPdf, downloadingPdf, onCopy, copied }: {
  data: Zas53Data; onBack: () => void; onDone: () => void;
  onDownloadPdf: () => void; downloadingPdf: boolean;
  onCopy: () => void; copied: boolean;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 24, letterSpacing: '-0.01em' }}>Podgląd wniosku ZAS-53</h2>
      <div className="mono" style={{
        background: 'var(--color-bg-1)', border: '1px solid var(--color-border)',
        borderRadius: 10, padding: '20px 24px',
        fontSize: 12, color: 'var(--color-text-2)',
        lineHeight: 1.8, whiteSpace: 'pre-wrap',
        boxShadow: 'var(--shadow-1)',
        maxHeight: 400, overflowY: 'auto',
      }}>
        {buildOutput(data)}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onDownloadPdf} disabled={downloadingPdf} className="btn btn-primary"
          style={{ borderRadius: 8, fontSize: 13, opacity: downloadingPdf ? 0.6 : 1, cursor: downloadingPdf ? 'wait' : 'pointer' }}>
          {downloadingPdf ? 'Generuje PDF...' : 'Pobierz PDF'}
        </button>
        <button onClick={onCopy} className="btn btn-outline" style={{ borderRadius: 8, fontSize: 13 }}>
          {copied ? 'Skopiowano!' : 'Kopiuj do schowka'}
        </button>
      </div>

      <div style={{ marginTop: 24, padding: '20px 24px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 10, fontSize: 13, color: 'var(--color-text-2)', boxShadow: 'var(--shadow-1)' }}>
        <p style={{ fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 12, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Jak złożyć ZAS-53</p>
        <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.65 }}>
          <li><strong style={{ color: 'var(--color-text-1)' }}>Online (najszybciej):</strong> Zaloguj się do <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>portalu eZUS</a> profilem zaufanym</li>
          <li><strong style={{ color: 'var(--color-text-1)' }}>Osobiście:</strong> W oddziale ZUS właściwym dla miejsca zamieszkania</li>
          <li><strong style={{ color: 'var(--color-text-1)' }}>Pocztą:</strong> Listem poleconym (zachowaj potwierdzenie nadania)</li>
          <li>Pobierz oryginalny formularz ZAS-53: <a href="https://www.zus.pl/wzory-formularzy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>zus.pl/wzory-formularzy</a></li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-3)' }}>Termin: do 6 miesięcy od ostatniego dnia zwolnienia lekarskiego.</p>
      </div>
      <NavButtons onBack={onBack} onNext={onDone} nextLabel="Gotowe" />
    </div>
  );
}

function StepDone({ onDownloadPdf, downloadingPdf, onCopy, copied, onRestart }: {
  onDownloadPdf: () => void; downloadingPdf: boolean;
  onCopy: () => void; copied: boolean; onRestart: () => void;
}) {
  return (
    <div>
      <span className="label-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Gotowe</span>
      <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)', marginBottom: 12 }}>Wniosek przygotowany</h2>
      <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 32, lineHeight: 1.7 }}>
        Pobierz oryginalny formularz ZAS-53 z zus.pl, przepisz dane i złóż w ZUS lub przez eZUS.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <button onClick={onDownloadPdf} disabled={downloadingPdf} className="btn btn-primary"
          style={{ width: '100%', height: 50, borderRadius: 10, fontSize: 14, opacity: downloadingPdf ? 0.6 : 1, cursor: downloadingPdf ? 'wait' : 'pointer' }}>
          {downloadingPdf ? 'Generuje PDF...' : 'Pobierz ZAS-53 (PDF)'}
        </button>
        <button onClick={onCopy} className="btn btn-outline" style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13 }}>
          {copied ? 'Skopiowano!' : 'Kopiuj dane do schowka'}
        </button>
        <a href="https://www.zus.pl/ezus/logowanie?jezyk=pl" target="_blank" rel="noopener noreferrer" className="btn"
          style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13, color: 'var(--color-accent)', border: '1px solid var(--color-accent)', justifyContent: 'center' }}>
          Złóż przez portal eZUS
        </a>
        <a href="https://www.zus.pl/wzory-formularzy" target="_blank" rel="noopener noreferrer" className="btn"
          style={{ width: '100%', height: 40, borderRadius: 10, fontSize: 12, color: 'var(--color-text-2)', border: '1px solid var(--color-border)', justifyContent: 'center' }}>
          Oryginalny formularz ZAS-53 na zus.pl
        </a>
      </div>
      <button onClick={onRestart} style={{ fontSize: 13, color: 'var(--color-text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
        Wypełnij nowy wniosek
      </button>
    </div>
  );
}

// ---- HELPERS ----

function buildOutput(d: Zas53Data): string {
  const rodzajLabel = RODZAJ_LABELS[d.rodzajNiezdolnośći];
  const ustanie = d.okresUbezpieczenia === 'po-ustaniu'
    ? `Po ustaniu tytułu ubezpieczenia (data ustania: ${d.dataUstaniaUbezpieczenia})`
    : 'W okresie ubezpieczenia chorobowego / wypadkowego';

  return `WNIOSEK ZAS-53
Wniosek o zasiłek chorobowy

Wypelnic WIELKIMI LITERAMI. Pola wyboru zaznaczyc X.
Pobierz oryginalny formularz: https://www.zus.pl/wzory-formularzy

========================================
TWOJE DANE

Imię: ${d.imie.toUpperCase()}
Nazwisko: ${d.nazwisko.toUpperCase()}
PESEL: ${d.pesel}
Ulica: ${d.ulica.toUpperCase()}
Nr domu: ${d.nrDomu}   Nr lokalu: ${d.nrLokalu || '--'}
Kod pocztowy: ${d.kodPocztowy}
Miejscowość: ${d.miejscowość.toUpperCase()}
Telefon: ${d.telefon || '-- (pole dobrowolne)'}

========================================
DANE PŁATNIKA SKŁADEK

Nazwa: ${d.nazwaPlatinika}
NIP: ${d.nipPłatnika}
REGON: ${d.regonPłatnika}

Rachunek bankowy: ${d.nrKonta || '(brak - zasiłek przekazem pocztowym)'}

========================================
WNIOSEK O ZASILEK CHOROBOWY

Okres niezdolności od: ${d.dataOd}
Okres niezdolności do: ${d.dataDo}
Seria i numer e-ZLA: ${d.numerEzla || '-- nie podano'}

Wniosek dotyczy okresu: ${ustanie}

Rodzaj niezdolności: ${rodzajLabel}

========================================

Oświadczam, ze dane podane we wniosku podaiem zgodnie z prawda.

Data: .........................
Podpis: .........................

========================================
INSTRUKCJA:
1. Online: zaloguj się do eZUS: https://www.zus.pl/ezus/logowanie?jezyk=pl
2. Lub pobierz oryginalny ZAS-53: https://www.zus.pl/wzory-formularzy
3. Przepisz dane WIELKIMI LITERAMI
4. Złóż w oddziale ZUS lub wyślij pocztą

Termin: do 6 miesięcy od ostatniego dnia zwolnienia.

Wygenerowano: wezmezadarmo.com/wnioski/zus-zas53
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
