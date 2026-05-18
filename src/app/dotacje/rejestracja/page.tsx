'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Step = 1 | 2 | 3;

interface AccountData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface CompanyData {
  nip: string;
  name: string;
  voivodeship: string;
  pkdCodes: string[];
  size: 'micro' | 'small' | 'medium' | 'large' | '';
  employeeCountRange: string;
}

interface FlagsData {
  zatrudniamNiepelnosprawnych: boolean;
  planujeSzkolenia: boolean;
  chceZatrudnicBezrobotnych: boolean;
  firmaPonizej2Lat: boolean;
  zainteresowanyInnowacjami: boolean;
  planujeEksport: boolean;
  potrzebujeCyfryzacji: boolean;
  sektor: string;
}

const VOIVODESHIPS = [
  'dolnoslaskie',
  'kujawsko-pomorskie',
  'lubelskie',
  'lubuskie',
  'lodzkie',
  'malopolskie',
  'mazowieckie',
  'opolskie',
  'podkarpackie',
  'podlaskie',
  'pomorskie',
  'slaskie',
  'swietokrzyskie',
  'warminsko-mazurskie',
  'wielkopolskie',
  'zachodniopomorskie',
];

const VOIVODESHIP_LABELS: Record<string, string> = {
  'dolnoslaskie': 'dolnośląskie',
  'kujawsko-pomorskie': 'kujawsko-pomorskie',
  'lubelskie': 'lubelskie',
  'lubuskie': 'lubuskie',
  'lodzkie': 'łódzkie',
  'malopolskie': 'małopolskie',
  'mazowieckie': 'mazowieckie',
  'opolskie': 'opolskie',
  'podkarpackie': 'podkarpackie',
  'podlaskie': 'podlaskie',
  'pomorskie': 'pomorskie',
  'slaskie': 'śląskie',
  'swietokrzyskie': 'świętokrzyskie',
  'warminsko-mazurskie': 'warmińsko-mazurskie',
  'wielkopolskie': 'wielkopolskie',
  'zachodniopomorskie': 'zachodniopomorskie',
};

const SEKTORY = [
  { value: 'produkcja', label: 'produkcja' },
  { value: 'it', label: 'IT' },
  { value: 'usluga', label: 'usługa' },
  { value: 'handel', label: 'handel' },
  { value: 'rolnictwo', label: 'rolnictwo' },
];

const SIZE_OPTIONS: { value: 'micro' | 'small' | 'medium' | 'large'; label: string; range: string }[] = [
  { value: 'micro', label: 'mikro', range: '1-9 prac.' },
  { value: 'small', label: 'mała', range: '10-49 prac.' },
  { value: 'medium', label: 'średnia', range: '50-249 prac.' },
  { value: 'large', label: 'duża', range: '250+ prac.' },
];

const SIZE_RANGES: Record<string, string> = {
  micro: '1-9',
  small: '10-49',
  medium: '50-249',
  large: '250+',
};

function inputStyle(hasError = false): React.CSSProperties {
  return {
    width: '100%',
    boxSizing: 'border-box' as const,
    background: 'var(--color-bg-1)',
    border: `1px solid ${hasError ? 'rgba(220,60,60,0.5)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-sm)',
    padding: '9px 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    color: 'var(--color-text-1)',
    outline: 'none',
  };
}

function labelStyle(): React.CSSProperties {
  return {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--color-text-3)',
    marginBottom: '6px',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  };
}

export default function RejestracjaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [account, setAccount] = useState<AccountData>({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [accountErrors, setAccountErrors] = useState<Partial<Record<keyof AccountData, string>>>({});

  const [company, setCompany] = useState<CompanyData>({
    nip: '',
    name: '',
    voivodeship: '',
    pkdCodes: [],
    size: '',
    employeeCountRange: '',
  });
  const [companyErrors, setCompanyErrors] = useState<Partial<Record<keyof CompanyData, string>>>({});
  const [nipLoading, setNipLoading] = useState(false);
  const [nipError, setNipError] = useState<string | null>(null);
  const [pkdInput, setPkdInput] = useState('');

  const [flags, setFlags] = useState<FlagsData>({
    zatrudniamNiepelnosprawnych: false,
    planujeSzkolenia: false,
    chceZatrudnicBezrobotnych: false,
    firmaPonizej2Lat: false,
    zainteresowanyInnowacjami: false,
    planujeEksport: false,
    potrzebujeCyfryzacji: false,
    sektor: '',
  });

  function validateAccount(): boolean {
    const errs: Partial<Record<keyof AccountData, string>> = {};
    if (!account.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) {
      errs.email = 'Podaj poprawny adres email';
    }
    if (!account.password || account.password.length < 8) {
      errs.password = 'Hasło musi mieć minimum 8 znaków';
    }
    if (account.password !== account.confirmPassword) {
      errs.confirmPassword = 'Hasła nie są zgodne';
    }
    if (!account.acceptTerms) {
      errs.acceptTerms = 'Akceptacja regulaminu jest wymagana';
    }
    setAccountErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateCompany(): boolean {
    const errs: Partial<Record<keyof CompanyData, string>> = {};
    if (!company.nip || company.nip.replace(/\D/g, '').length !== 10) {
      errs.nip = 'Podaj poprawny NIP (10 cyfr)';
    }
    if (!company.name.trim()) {
      errs.name = 'Podaj nazwę firmy';
    }
    if (!company.voivodeship) {
      errs.voivodeship = 'Wybierz województwo';
    }
    if (!company.size) {
      errs.size = 'Wybierz wielkość firmy';
    }
    setCompanyErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function fetchCeidg() {
    const cleanNip = company.nip.replace(/\D/g, '');
    if (cleanNip.length !== 10) {
      setNipError('Wpisz 10-cyfrowy NIP przed pobraniem danych');
      return;
    }
    setNipError(null);
    setNipLoading(true);
    try {
      const res = await fetch('/api/ceidg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip: cleanNip }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNipError(data.error ?? 'Nie udało się pobrać danych z CEIDG');
        return;
      }
      setCompany(prev => ({
        ...prev,
        name: data.name ?? prev.name,
        voivodeship: data.voivodeship ?? prev.voivodeship,
        pkdCodes: data.pkdCodes ?? prev.pkdCodes,
      }));
    } catch {
      setNipError('Błąd połączenia z CEIDG');
    } finally {
      setNipLoading(false);
    }
  }

  function addPkd() {
    const code = pkdInput.trim().toUpperCase();
    if (code && !company.pkdCodes.includes(code)) {
      setCompany(prev => ({ ...prev, pkdCodes: [...prev.pkdCodes, code] }));
    }
    setPkdInput('');
  }

  function removePkd(code: string) {
    setCompany(prev => ({ ...prev, pkdCodes: prev.pkdCodes.filter(c => c !== code) }));
  }

  function handleStep1Next() {
    if (validateAccount()) setStep(2);
  }

  function handleStep2Next() {
    if (validateCompany()) setStep(3);
  }

  async function handleSubmit() {
    setGlobalError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/dotacje/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: account.email.trim(),
          password: account.password,
          companyProfile: {
            nip: company.nip.replace(/\D/g, ''),
            name: company.name.trim(),
            voivodeship: company.voivodeship,
            pkd_codes: company.pkdCodes,
            size: company.size,
            employee_count_range: company.size ? SIZE_RANGES[company.size] : '',
          },
          flags: {
            zatrudniam_niepelnosprawnych: flags.zatrudniamNiepelnosprawnych,
            planuje_szkolenia: flags.planujeSzkolenia,
            chce_zatrudnic_bezrobotnych: flags.chceZatrudnicBezrobotnych,
            firma_ponizej_2_lat: flags.firmaPonizej2Lat,
            zainteresowany_innowacjami: flags.zainteresowanyInnowacjami,
            planuje_eksport: flags.planujeEksport,
            potrzebuje_cyfryzacji: flags.potrzebujeCyfryzacji,
            sektor: flags.sektor,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGlobalError(data.error ?? 'Rejestracja nie powiodła się. Spróbuj ponownie.');
        return;
      }

      router.push('/dotacje/panel');
    } catch {
      setGlobalError('Błąd połączenia z serwerem. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  const progressPct = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div style={{
      minHeight: 'calc(100vh - 52px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '32px 24px 48px',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text-1)',
            margin: '0 0 6px 0',
            letterSpacing: '-0.02em',
          }}>
            Załóż konto
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-3)',
            margin: '0 0 16px 0',
          }}>
            Krok {step} z 3: {step === 1 ? 'dane konta' : step === 2 ? 'profil firmy' : 'profil dotacyjny'}
          </p>

          {/* Progress bar */}
          <div style={{
            height: '3px',
            background: 'var(--color-border)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'var(--color-accent)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Step 1 -- Konto */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle()}>Email</label>
              <input
                type="email"
                value={account.email}
                onChange={e => setAccount(prev => ({ ...prev, email: e.target.value }))}
                autoComplete="email"
                placeholder="jan@firma.pl"
                style={inputStyle(!!accountErrors.email)}
              />
              {accountErrors.email && <FieldError msg={accountErrors.email} />}
            </div>

            <div>
              <label style={labelStyle()}>Hasło</label>
              <input
                type="password"
                value={account.password}
                onChange={e => setAccount(prev => ({ ...prev, password: e.target.value }))}
                autoComplete="new-password"
                placeholder="minimum 8 znaków"
                style={inputStyle(!!accountErrors.password)}
              />
              {accountErrors.password && <FieldError msg={accountErrors.password} />}
            </div>

            <div>
              <label style={labelStyle()}>Potwierdź hasło</label>
              <input
                type="password"
                value={account.confirmPassword}
                onChange={e => setAccount(prev => ({ ...prev, confirmPassword: e.target.value }))}
                autoComplete="new-password"
                placeholder="powtórz hasło"
                style={inputStyle(!!accountErrors.confirmPassword)}
              />
              {accountErrors.confirmPassword && <FieldError msg={accountErrors.confirmPassword} />}
            </div>

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={account.acceptTerms}
                  onChange={e => setAccount(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  style={{ marginTop: '2px', accentColor: 'var(--color-accent)', flexShrink: 0 }}
                />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  color: 'var(--color-text-2)',
                  lineHeight: '1.5',
                }}>
                  Akceptuję{' '}
                  <Link href="/dotacje/regulamin" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                    regulamin i politykę prywatności
                  </Link>
                </span>
              </label>
              {accountErrors.acceptTerms && <FieldError msg={accountErrors.acceptTerms} />}
            </div>

            <button onClick={handleStep1Next} style={primaryButtonStyle()}>
              Dalej: profil firmy
            </button>

            <div style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--color-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--color-text-3)',
              textAlign: 'center',
            }}>
              Masz już konto?{' '}
              <Link href="/dotacje/logowanie" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
                Zaloguj się
              </Link>
            </div>
          </div>
        )}

        {/* Step 2 -- Firma */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle()}>NIP</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={company.nip}
                  onChange={e => setCompany(prev => ({ ...prev, nip: e.target.value }))}
                  placeholder="0000000000"
                  maxLength={13}
                  style={{ ...inputStyle(!!companyErrors.nip), flex: 1 }}
                />
                <button
                  type="button"
                  onClick={fetchCeidg}
                  disabled={nipLoading}
                  style={{
                    padding: '9px 14px',
                    background: 'var(--color-bg-2)',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: nipLoading ? 'var(--color-text-3)' : 'var(--color-text-1)',
                    cursor: nipLoading ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {nipLoading ? 'Pobieranie...' : 'Pobierz dane'}
                </button>
              </div>
              {companyErrors.nip && <FieldError msg={companyErrors.nip} />}
              {nipError && <FieldError msg={nipError} />}
            </div>

            <div>
              <label style={labelStyle()}>Nazwa firmy</label>
              <input
                type="text"
                value={company.name}
                onChange={e => setCompany(prev => ({ ...prev, name: e.target.value }))}
                placeholder="AUTO sp. z o.o."
                style={inputStyle(!!companyErrors.name)}
              />
              {companyErrors.name && <FieldError msg={companyErrors.name} />}
            </div>

            <div>
              <label style={labelStyle()}>Województwo</label>
              <select
                value={company.voivodeship}
                onChange={e => setCompany(prev => ({ ...prev, voivodeship: e.target.value }))}
                style={{
                  ...inputStyle(!!companyErrors.voivodeship),
                  appearance: 'none' as const,
                  cursor: 'pointer',
                }}
              >
                <option value="">-- wybierz --</option>
                {VOIVODESHIPS.map(v => (
                  <option key={v} value={v}>{VOIVODESHIP_LABELS[v]}</option>
                ))}
              </select>
              {companyErrors.voivodeship && <FieldError msg={companyErrors.voivodeship} />}
            </div>

            <div>
              <label style={labelStyle()}>Kody PKD</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={pkdInput}
                  onChange={e => setPkdInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPkd())}
                  placeholder="np. 62.01.Z"
                  style={{ ...inputStyle(), flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addPkd}
                  style={{
                    padding: '9px 14px',
                    background: 'var(--color-bg-2)',
                    border: '1px solid var(--color-border-light)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--color-text-1)',
                    cursor: 'pointer',
                  }}
                >
                  Dodaj
                </button>
              </div>
              {company.pkdCodes.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
                  {company.pkdCodes.map(code => (
                    <span
                      key={code}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '3px 8px',
                        background: 'var(--color-bg-2)',
                        border: '1px solid var(--color-border-light)',
                        borderRadius: '3px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        color: 'var(--color-text-2)',
                      }}
                    >
                      {code}
                      <button
                        type="button"
                        onClick={() => removePkd(code)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-3)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '11px',
                          lineHeight: 1,
                        }}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={labelStyle()}>Wielkość firmy</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {SIZE_OPTIONS.map(opt => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      background: company.size === opt.value ? 'rgba(230, 140, 104, 0.1)' : 'var(--color-bg-1)',
                      border: `1px solid ${company.size === opt.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={opt.value}
                      checked={company.size === opt.value}
                      onChange={() => setCompany(prev => ({ ...prev, size: opt.value }))}
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-1)' }}>
                      {opt.label}
                      <span style={{ color: 'var(--color-text-3)', marginLeft: '4px' }}>({opt.range})</span>
                    </span>
                  </label>
                ))}
              </div>
              {companyErrors.size && <FieldError msg={companyErrors.size} />}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={secondaryButtonStyle()}
              >
                Wstecz
              </button>
              <button
                type="button"
                onClick={handleStep2Next}
                style={{ ...primaryButtonStyle(), flex: 1 }}
              >
                Dalej: profil dotacyjny
              </button>
            </div>
          </div>
        )}

        {/* Step 3 -- Profil dotacyjny */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle()}>Charakterystyka firmy</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {([
                  ['zatrudniamNiepelnosprawnych', 'Zatrudniam pracowników z niepełnosprawnością'],
                  ['planujeSzkolenia', 'Planuję szkolenia pracowników'],
                  ['chceZatrudnicBezrobotnych', 'Chcę zatrudnić osoby bezrobotne z PUP'],
                  ['firmaPonizej2Lat', 'Firma istnieje poniżej 2 lat (startup)'],
                  ['zainteresowanyInnowacjami', 'Jestem zainteresowany innowacjami / B+R'],
                  ['planujeEksport', 'Planuję eksport / międzynarodową ekspansję'],
                  ['potrzebujeCyfryzacji', 'Potrzebuję cyfryzacji procesów'],
                ] as [keyof FlagsData, string][]).map(([key, text]) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={flags[key] as boolean}
                      onChange={e => setFlags(prev => ({ ...prev, [key]: e.target.checked }))}
                      style={{ marginTop: '2px', accentColor: 'var(--color-accent)', flexShrink: 0 }}
                    />
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--color-text-2)',
                      lineHeight: '1.5',
                    }}>
                      {text}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={labelStyle()}>Sektor działalności</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
                {SEKTORY.map(s => (
                  <label
                    key={s.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      background: flags.sektor === s.value ? 'rgba(230, 140, 104, 0.1)' : 'var(--color-bg-1)',
                      border: `1px solid ${flags.sektor === s.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="sektor"
                      value={s.value}
                      checked={flags.sektor === s.value}
                      onChange={() => setFlags(prev => ({ ...prev, sektor: s.value }))}
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-1)' }}>
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {globalError && (
              <div style={{
                padding: '10px 12px',
                background: 'rgba(220, 60, 60, 0.1)',
                border: '1px solid rgba(220, 60, 60, 0.3)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: '#e57373',
              }}>
                {globalError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setStep(2)}
                style={secondaryButtonStyle()}
                disabled={loading}
              >
                Wstecz
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  ...primaryButtonStyle(),
                  flex: 1,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Tworzenie konta...' : 'Generuj profil i załóż konto'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      color: '#e57373',
      margin: '4px 0 0 0',
    }}>
      {msg}
    </p>
  );
}

function primaryButtonStyle(): React.CSSProperties {
  return {
    padding: '10px',
    background: 'var(--color-accent)',
    color: 'var(--color-bg-0)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  };
}

function secondaryButtonStyle(): React.CSSProperties {
  return {
    padding: '10px 16px',
    background: 'var(--color-bg-1)',
    color: 'var(--color-text-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  };
}
