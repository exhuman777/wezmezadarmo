# Agent JDG/Prywatny -- Plan B: Panel UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wszystkie strony uzytkownika: rejestracja, logowanie, dashboard, swiadczenia, powiadomienia, profil, landing.

**Architecture:** Kazda strona pod /agent/*. Layout z nawigacja i ThemeToggle (client component). Formularze wywoluja API z Planu A. Wzorzec: obejrzyj jak dziala /dotacje/panel/* zanim zaczniesz.

**Tech Stack:** Next.js 15 (App Router), React, TypeScript strict, Supabase auth przez cookies

**Wymaga:** Plan A ukonczony (tabele, API routes istnieja)

**Spec:** `docs/superpowers/specs/2026-05-18-agent-jdg-prywatny-design.md`

---

### Task 1: Layout /agent + nawigacja

**Files:**
- Create: `src/app/agent/layout.tsx`
- Create: `src/components/AgentNav.tsx`

- [ ] **Krok 1: Utworz AgentNav (client component)**

```typescript
// src/components/AgentNav.tsx
'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

export function AgentNav() {
  const { theme, toggle } = useTheme();

  return (
    <nav style={{
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-bg-0)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/agent" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--color-text-1)',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}>
          <span style={{ color: 'var(--color-text-3)' }}>wezmezadarmo</span>
          <span style={{ color: 'var(--color-border-light)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'var(--color-accent)' }}>agent</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThemeToggle theme={theme} onToggle={toggle} />
          <Link href="/agent/logowanie" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-text-3)',
            textDecoration: 'none',
            padding: '6px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
          }}>
            Zaloguj sie
          </Link>
          <Link href="/agent/rejestracja" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--color-bg-0)',
            textDecoration: 'none',
            padding: '6px 12px',
            background: 'var(--color-accent)',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 500,
          }}>
            Zacznij
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Krok 2: Utworz layout**

```typescript
// src/app/agent/layout.tsx
import type { Metadata } from 'next';
import { AgentNav } from '@/components/AgentNav';

export const metadata: Metadata = {
  title: 'Twoj agent AI | wezmezadarmo',
  description: 'Agent AI pilnuje Twoich swiadczen, ulg i zmian w prawie. Codziennie na e-mail.',
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-0)', color: 'var(--color-text-1)' }}>
      <AgentNav />
      {children}
    </div>
  );
}
```

- [ ] **Krok 3: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/components/AgentNav.tsx src/app/agent/layout.tsx
git commit -m "feat: /agent layout i nawigacja"
```

---

### Task 2: Strona rejestracji /agent/rejestracja

**Files:**
- Create: `src/app/agent/rejestracja/page.tsx`

Formularz 3-krokowy. Krok 2 rozgalezia sie: JDG (NIP + CEIDG) lub profil prywatny.

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/agent/rejestracja/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 1 | 2 | 3;

interface FormState {
  // Krok 1
  email: string;
  password: string;
  acceptTerms: boolean;
  // Krok 2a -- JDG
  isJdg: boolean;
  nip: string;
  company_name: string;
  pkd_codes: string[];
  company_voivodeship: string;
  company_registration_date: string;
  company_status: string;
  company_size: string;
  nipLoading: boolean;
  nipError: string;
  // Krok 2b -- prywatny
  wiek: string;
  plec: string;
  stan_cywilny: string;
  liczba_dzieci: string;
  wiek_dzieci: string;
  dochod_miesiecznie: string;
  dochod_na_osobe: string;
  zatrudnienie: string;
  niepelnosprawnosc: string;
  wlasnosc: string;
  wojewodztwo: string;
  ciaza: boolean;
  student: boolean;
  emeryt: boolean;
  rolnik: boolean;
  bezrobotny_zarejestrowany: boolean;
  // Krok 3
  digest_enabled: boolean;
  categories: string[];
}

const INITIAL: FormState = {
  email: '', password: '', acceptTerms: false,
  isJdg: false,
  nip: '', company_name: '', pkd_codes: [], company_voivodeship: '',
  company_registration_date: '', company_status: '', company_size: '',
  nipLoading: false, nipError: '',
  wiek: '', plec: '', stan_cywilny: '', liczba_dzieci: '0', wiek_dzieci: '',
  dochod_miesiecznie: '', dochod_na_osobe: '', zatrudnienie: '', niepelnosprawnosc: 'brak',
  wlasnosc: '', wojewodztwo: '',
  ciaza: false, student: false, emeryt: false, rolnik: false, bezrobotny_zarejestrowany: false,
  digest_enabled: true,
  categories: ['dofinansowania', 'zus', 'podatki', 'prawo'],
};

const KATEGORIE = [
  { value: 'dofinansowania', label: 'Dofinansowania' },
  { value: 'zus', label: 'ZUS i ubezpieczenia' },
  { value: 'podatki', label: 'Podatki' },
  { value: 'prawo', label: 'Zmiany w prawie' },
  { value: 'inne', label: 'Inne' },
];

const inputStyle = {
  width: '100%', boxSizing: 'border-box' as const,
  padding: '10px 14px', fontSize: 14,
  background: 'var(--color-bg-1)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-1)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
};

const labelStyle = {
  display: 'block' as const, fontSize: 12,
  color: 'var(--color-text-3)',
  marginBottom: 6,
  fontFamily: 'var(--font-mono)',
};

export default function AgentRejestracja() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof FormState, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function lookupNip() {
    if (!form.nip || form.nip.length !== 10) {
      set('nipError', 'NIP musi miec dokladnie 10 cyfr.');
      return;
    }
    set('nipLoading', true);
    set('nipError', '');
    try {
      const res = await fetch(`/api/ceidg?nip=${form.nip}`);
      const data = await res.json();
      if (!res.ok || !data.nazwa) {
        set('nipError', 'Nie znaleziono firmy o tym NIP w CEIDG.');
      } else {
        setForm(prev => ({
          ...prev,
          company_name: data.nazwa ?? '',
          pkd_codes: data.pkdCodes ?? [],
          company_voivodeship: data.voivodeship ?? '',
          company_registration_date: data.dataRejestracji ?? '',
          company_status: data.status ?? '',
          nipError: '',
        }));
      }
    } catch {
      set('nipError', 'Blad polaczenia z CEIDG.');
    } finally {
      set('nipLoading', false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const profile = form.isJdg
        ? {
            type: 'jdg',
            nip: form.nip,
            company_name: form.company_name,
            pkd_codes: form.pkd_codes,
            company_voivodeship: form.company_voivodeship,
            company_registration_date: form.company_registration_date || null,
            company_status: form.company_status,
            company_size: form.company_size || null,
          }
        : {
            type: 'private',
            wiek: parseInt(form.wiek) || null,
            plec: form.plec || null,
            stan_cywilny: form.stan_cywilny || null,
            liczba_dzieci: parseInt(form.liczba_dzieci) || 0,
            wiek_dzieci: form.wiek_dzieci
              ? form.wiek_dzieci.split(',').map(v => parseInt(v.trim())).filter(n => !isNaN(n))
              : [],
            dochod_miesiecznie: parseFloat(form.dochod_miesiecznie) || null,
            dochod_na_osobe: parseFloat(form.dochod_na_osobe) || null,
            zatrudnienie: form.zatrudnienie || null,
            niepelnosprawnosc: form.niepelnosprawnosc,
            wlasnosc: form.wlasnosc || null,
            wojewodztwo: form.wojewodztwo || null,
            ciaza: form.ciaza,
            student: form.student,
            emeryt: form.emeryt,
            rolnik: form.rolnik,
            bezrobotny_zarejestrowany: form.bezrobotny_zarejestrowany,
          };

      const res = await fetch('/api/agent/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          profile,
          emailPreferences: { digest_enabled: form.digest_enabled, categories: form.categories },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Blad rejestracji.');
        return;
      }

      // Zaloguj od razu po rejestracji
      await fetch('/api/agent/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      router.push('/agent/panel');
    } catch {
      setError('Blad polaczenia. Sprobuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  }

  const containerStyle = { maxWidth: 560, margin: '0 auto', padding: '48px 24px' };
  const sectionLabel = {
    fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'var(--color-text-3)', letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, marginBottom: 8,
  };

  return (
    <main>
      <div style={containerStyle}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: n <= step ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        {/* Krok 1: Email + haslo */}
        {step === 1 && (
          <div>
            <div style={sectionLabel}>Krok 1 z 3</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
              Zaloz konto
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Adres e-mail</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="jan@kowalski.pl" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Haslo (min. 8 znakow)</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  style={inputStyle} />
              </div>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-2)' }}>
                <input type="checkbox" checked={form.acceptTerms} onChange={e => set('acceptTerms', e.target.checked)} />
                Akceptuje{' '}
                <a href="/regulamin" target="_blank" style={{ color: 'var(--color-accent)' }}>regulamin serwisu</a>
              </label>
              {error && <p style={{ fontSize: 13, color: '#e05c5c', margin: 0 }}>{error}</p>}
              <button
                onClick={() => {
                  if (!form.email || !form.password || password.length < 8 || !form.acceptTerms) {
                    setError('Uzupelnij wszystkie pola i zaakceptuj regulamin.');
                    return;
                  }
                  setError('');
                  setStep(2);
                }}
                style={{
                  padding: '11px 24px', background: 'var(--color-accent)',
                  color: 'var(--color-bg-0)', fontFamily: 'var(--font-mono)',
                  fontSize: 13, fontWeight: 500, border: 'none',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                }}
              >
                Dalej
              </button>
            </div>
          </div>
        )}

        {/* Krok 2: Profil */}
        {step === 2 && (
          <div>
            <div style={sectionLabel}>Krok 2 z 3</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 20 }}>
              Twoj profil
            </h1>

            {/* Checkbox JDG */}
            <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', marginBottom: 24, fontSize: 14, color: 'var(--color-text-2)' }}>
              <input type="checkbox" checked={form.isJdg} onChange={e => set('isJdg', e.target.checked)} />
              Prowadze dzialalnosc gospodarcza (JDG)
            </label>

            {form.isJdg ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>NIP (10 cyfr)</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="text" maxLength={10} value={form.nip}
                      onChange={e => set('nip', e.target.value.replace(/\D/g, ''))}
                      placeholder="5260250274" style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={lookupNip} disabled={form.nipLoading} style={{
                      padding: '10px 16px', background: 'var(--color-bg-2)',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-accent)', fontFamily: 'var(--font-mono)',
                      fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                      {form.nipLoading ? 'Sprawdzam...' : 'Sprawdz NIP'}
                    </button>
                  </div>
                  {form.nipError && <p style={{ fontSize: 12, color: '#e05c5c', marginTop: 4 }}>{form.nipError}</p>}
                </div>
                {form.company_name && (
                  <div style={{ padding: '12px 16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4 }}>Znaleziono:</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-1)' }}>{form.company_name}</div>
                    {form.company_voivodeship && <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginTop: 2 }}>{form.company_voivodeship}</div>}
                    {form.pkd_codes.length > 0 && <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 2 }}>PKD: {form.pkd_codes.slice(0, 3).join(', ')}{form.pkd_codes.length > 3 ? ` +${form.pkd_codes.length - 3}` : ''}</div>}
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Rozmiar firmy</label>
                  <select value={form.company_size} onChange={e => set('company_size', e.target.value)} style={inputStyle}>
                    <option value="">Wybierz...</option>
                    <option value="mikro">Mikro (do 9 pracownikow)</option>
                    <option value="mala">Mala (10-49)</option>
                    <option value="srednia">Srednia (50-249)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Wiek</label>
                    <input type="number" min="18" max="99" value={form.wiek}
                      onChange={e => set('wiek', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Plec</label>
                    <select value={form.plec} onChange={e => set('plec', e.target.value)} style={inputStyle}>
                      <option value="">Wybierz...</option>
                      <option value="K">Kobieta</option>
                      <option value="M">Mezczyzna</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Stan cywilny</label>
                  <select value={form.stan_cywilny} onChange={e => set('stan_cywilny', e.target.value)} style={inputStyle}>
                    <option value="">Wybierz...</option>
                    <option value="wolny">Wolny/wolna</option>
                    <option value="malzenstwo">W malzenstwie</option>
                    <option value="rozwiedziony">Rozwiedziony/rozwiedziona</option>
                    <option value="wdowiec">Wdowiec/wdowa</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Liczba dzieci (do 18 lat)</label>
                    <input type="number" min="0" max="20" value={form.liczba_dzieci}
                      onChange={e => set('liczba_dzieci', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Wiek dzieci (np. 3,7,12)</label>
                    <input type="text" value={form.wiek_dzieci} placeholder="3,7,12"
                      onChange={e => set('wiek_dzieci', e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Dochod gosp. domowego (PLN/mies.)</label>
                    <input type="number" min="0" value={form.dochod_miesiecznie}
                      onChange={e => set('dochod_miesiecznie', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Dochod na osobe (PLN/mies.)</label>
                    <input type="number" min="0" value={form.dochod_na_osobe}
                      onChange={e => set('dochod_na_osobe', e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Forma zatrudnienia</label>
                  <select value={form.zatrudnienie} onChange={e => set('zatrudnienie', e.target.value)} style={inputStyle}>
                    <option value="">Wybierz...</option>
                    <option value="umowa_o_prace">Umowa o prace</option>
                    <option value="dzialalnosc">Dzialalnosc gospodarcza</option>
                    <option value="umowa_zlecenie">Umowa zlecenie / o dzielo</option>
                    <option value="bezrobotny">Bezrobotny/a</option>
                    <option value="emeryt">Emeryt/rencista</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Niepelnosprawnosc</label>
                    <select value={form.niepelnosprawnosc} onChange={e => set('niepelnosprawnosc', e.target.value)} style={inputStyle}>
                      <option value="brak">Brak</option>
                      <option value="lekki">Lekki stopien</option>
                      <option value="umiarkowany">Umiarkowany</option>
                      <option value="znaczny">Znaczny</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Zamieszkanie</label>
                    <select value={form.wlasnosc} onChange={e => set('wlasnosc', e.target.value)} style={inputStyle}>
                      <option value="">Wybierz...</option>
                      <option value="mieszkanie">Wlasne mieszkanie</option>
                      <option value="dom">Wlasny dom</option>
                      <option value="wynajem">Wynajem</option>
                      <option value="rodzina">U rodziny</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Wojewodztwo</label>
                  <select value={form.wojewodztwo} onChange={e => set('wojewodztwo', e.target.value)} style={inputStyle}>
                    <option value="">Wybierz...</option>
                    {['dolnoslaskie','kujawsko-pomorskie','lubelskie','lubuskie','lodzkie','malopolskie','mazowieckie','opolskie','podkarpackie','podlaskie','pomorskie','slaskie','swietokrzyskie','warminsko-mazurskie','wielkopolskie','zachodniopomorskie'].map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {[
                    { key: 'ciaza', label: 'W ciazy' },
                    { key: 'student', label: 'Student' },
                    { key: 'emeryt', label: 'Emeryt/rencista' },
                    { key: 'rolnik', label: 'Rolnik (KRUS)' },
                    { key: 'bezrobotny_zarejestrowany', label: 'Bezrobotny zarejestr.' },
                  ].map(({ key, label }) => (
                    <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-2)' }}>
                      <input type="checkbox"
                        checked={form[key as keyof FormState] as boolean}
                        onChange={e => set(key as keyof FormState, e.target.checked)} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                Wstecz
              </button>
              <button onClick={() => { setError(''); setStep(3); }} style={{ padding: '10px 24px', background: 'var(--color-accent)', color: 'var(--color-bg-0)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>
                Dalej
              </button>
            </div>
          </div>
        )}

        {/* Krok 3: Powiadomienia */}
        {step === 3 && (
          <div>
            <div style={sectionLabel}>Krok 3 z 3</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
              Powiadomienia e-mail
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>
              Agent bedzie wysylal Ci dzienny digest. Mozesz to zmienic w panelu w dowolnym momencie.
            </p>

            <label style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.digest_enabled} onChange={e => set('digest_enabled', e.target.checked)} />
              <span style={{ fontSize: 14, color: 'var(--color-text-1)' }}>Wlacz dzienny raport na e-mail (8:00 rano)</span>
            </label>

            {form.digest_enabled && (
              <div style={{ marginBottom: 24 }}>
                <div style={sectionLabel}>Kategorie do sledzenia</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {KATEGORIE.map(({ value, label }) => (
                    <label key={value} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-2)' }}>
                      <input type="checkbox"
                        checked={form.categories.includes(value)}
                        onChange={e => {
                          const next = e.target.checked
                            ? [...form.categories, value]
                            : form.categories.filter(c => c !== value);
                          set('categories', next);
                        }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && <p style={{ fontSize: 13, color: '#e05c5c', marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(2)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                Wstecz
              </button>
              <button onClick={handleSubmit} disabled={submitting} style={{ padding: '11px 28px', background: submitting ? 'var(--color-border)' : 'var(--color-accent)', color: 'var(--color-bg-0)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>
                {submitting ? 'Tworze konto...' : 'Zaloz konto'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Krok 2: Napraw blad TypeScript -- `password` nie istnieje jako zmienna (uzyj form.password)**

W funkcji `onClick` dla kroku 1, zmien `password.length` na `form.password.length`:

```typescript
if (!form.email || !form.password || form.password.length < 8 || !form.acceptTerms) {
```

- [ ] **Krok 3: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/agent/rejestracja/page.tsx
git commit -m "feat: /agent/rejestracja -- formularz 3-krokowy JDG i prywatny"
```

---

### Task 3: Strona logowania /agent/logowanie

**Files:**
- Create: `src/app/agent/logowanie/page.tsx`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/agent/logowanie/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const inputStyle = {
  width: '100%', boxSizing: 'border-box' as const,
  padding: '10px 14px', fontSize: 14,
  background: 'var(--color-bg-1)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-1)',
  outline: 'none',
};

export default function AgentLogowanie() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/agent/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Nieprawidlowy email lub haslo.');
        return;
      }
      router.push('/agent/panel');
    } catch {
      setError('Blad polaczenia. Sprobuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Logowanie
        </div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 32 }}>
          Zaloguj sie do panelu
        </h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', marginBottom: 6 }}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="jan@kowalski.pl" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', marginBottom: 6 }}>Haslo</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required style={inputStyle} />
          </div>
          {error && <p style={{ fontSize: 13, color: '#e05c5c', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            padding: '11px', background: loading ? 'var(--color-border)' : 'var(--color-accent)',
            color: 'var(--color-bg-0)', border: 'none', borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Logowanie...' : 'Zaloguj sie'}
          </button>
        </form>
        <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginTop: 20, textAlign: 'center' }}>
          Nie masz konta?{' '}
          <Link href="/agent/rejestracja" style={{ color: 'var(--color-accent)' }}>Zarejestruj sie</Link>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Krok 2: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/agent/logowanie/page.tsx
git commit -m "feat: /agent/logowanie"
```

---

### Task 4: Panel dashboard /agent/panel

**Files:**
- Create: `src/app/agent/panel/page.tsx`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/agent/panel/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
  type: 'jdg' | 'private';
  company_name?: string;
  nip?: string;
  wiek?: number;
  plec?: string;
}

interface Prefs {
  digest_enabled: boolean;
  last_digest_sent_at: string | null;
}

const QUICK_LINKS = [
  { href: '/agent/panel/swiadczenia', label: 'Swiadczenia i ulgi', desc: 'Co Ci przysluguje' },
  { href: '/agent/panel/aktualnosci', label: 'Aktualnosci', desc: 'Zmiany w prawie' },
  { href: '/agent/panel/powiadomienia', label: 'Powiadomienia', desc: 'Ustawienia e-mail' },
  { href: '/agent/panel/profil', label: 'Profil', desc: 'Edytuj dane' },
];

export default function AgentPanel() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, prefsRes] = await Promise.all([
        fetch('/api/agent/profile'),
        fetch('/api/digest/preferences'),
      ]);
      if (profileRes.status === 401) {
        router.push('/agent/logowanie');
        return;
      }
      if (profileRes.ok) {
        const d = await profileRes.json();
        setProfile(d.profile);
      }
      if (prefsRes.ok) {
        const d = await prefsRes.json();
        setPrefs(d.prefs);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ladowanie...</div>;
  }

  const name = profile?.type === 'jdg' ? profile.company_name : undefined;
  const lastDigest = prefs?.last_digest_sent_at
    ? new Date(prefs.last_digest_sent_at).toLocaleDateString('pl-PL')
    : null;

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Panel agenta
        </div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500, marginBottom: 8 }}>
          {name ? `Witaj, ${name}` : 'Twoj agent AI'}
        </h1>
        {prefs?.digest_enabled && (
          <p style={{ fontSize: 13, color: 'var(--color-text-3)' }}>
            Digest e-mail: aktywny{lastDigest ? ` -- ostatni ${lastDigest}` : ' -- jeszcze nie wyslany'}
          </p>
        )}
        {!prefs?.digest_enabled && (
          <p style={{ fontSize: 13, color: 'var(--color-accent)' }}>
            Digest e-mail jest wylaczony.{' '}
            <Link href="/agent/panel/powiadomienia" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Wlacz</Link>
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {QUICK_LINKS.map(({ href, label, desc }) => (
          <Link key={href} href={href} style={{
            display: 'block', textDecoration: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)', padding: '20px',
            background: 'var(--color-bg-1)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{desc}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Krok 2: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/agent/panel/page.tsx
git commit -m "feat: /agent/panel dashboard"
```

---

### Task 5: Panel swiadczenia /agent/panel/swiadczenia

**Files:**
- Create: `src/app/agent/panel/swiadczenia/page.tsx`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/agent/panel/swiadczenia/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Benefit {
  id: string;
  nazwa: string;
  kategoria: string;
  kwota: string;
  wniosek?: { kanal: string[]; kroki: string[] };
  zrodloUrl?: string;
}

interface MatchResult {
  benefit: Benefit;
  status: 'PRZYSLUGUJE' | 'MOZLIWE' | 'NIE_PRZYSLUGUJE';
  confidence: string;
  matchedCriteria: string[];
  warnings: string[];
}

export default function AgentSwiadczenia() {
  const router = useRouter();
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      // Pobierz profil i przelicz swiadczenia przez /api/verify
      const profileRes = await fetch('/api/agent/profile');
      if (profileRes.status === 401) { router.push('/agent/logowanie'); return; }
      if (!profileRes.ok) { setError('Blad ladowania profilu.'); setLoading(false); return; }

      const { profile } = await profileRes.json();
      if (profile.type !== 'private') {
        // JDG -- swiadczenia nie dotyca, przekieruj do aktualnosci
        setLoading(false);
        return;
      }

      // Przelicz swiadczenia
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: {
          wiek: profile.wiek,
          plec: profile.plec,
          stanCywilny: profile.stan_cywilny,
          liczbaDzieci: profile.liczba_dzieci,
          wiekDzieci: profile.wiek_dzieci ?? [],
          dochodMiesiecznie: profile.dochod_miesiecznie,
          dochodNaOsobe: profile.dochod_na_osobe,
          zatrudnienie: profile.zatrudnienie,
          niepelnosprawnosc: profile.niepelnosprawnosc,
          wlasnosc: profile.wlasnosc,
          wojewodztwo: profile.wojewodztwo,
          prowadzDzialalnosc: false,
          pierwszaDzialalnosc: false,
          ciaza: profile.ciaza,
          student: profile.student,
          emeryt: profile.emeryt,
          rolnik: profile.rolnik,
          bezrobotnyZarejestrowany: profile.bezrobotny_zarejestrowany,
        }}),
      });

      if (!verifyRes.ok) { setError('Blad obliczania swiadczen.'); setLoading(false); return; }
      const data = await verifyRes.json();
      const filtered = (data.results as MatchResult[])
        .filter(r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE')
        .sort((a, b) => (a.status === 'PRZYSLUGUJE' ? -1 : 1));
      setResults(filtered);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Obliczam swiadczenia...</div>;

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Swiadczenia i ulgi</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Co Ci przysluguje</h1>

      {error && <p style={{ color: '#e05c5c', fontSize: 14 }}>{error}</p>}

      {results.length === 0 && !error && (
        <p style={{ fontSize: 14, color: 'var(--color-text-3)' }}>
          Nie znaleziono swiadczen dla Twojego profilu lub konto jest typem JDG.{' '}
          <Link href="/agent/panel/profil" style={{ color: 'var(--color-accent)' }}>Sprawdz profil</Link>
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {results.map(({ benefit, status, matchedCriteria, warnings }) => (
          <div key={benefit.id} style={{
            border: `1px solid ${status === 'PRZYSLUGUJE' ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius)', padding: '20px',
            background: 'var(--color-bg-1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: 'var(--color-text-1)' }}>{benefit.nazwa}</div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, padding: '2px 8px',
                borderRadius: 3, border: '1px solid',
                color: status === 'PRZYSLUGUJE' ? 'var(--color-accent)' : 'var(--color-text-3)',
                borderColor: status === 'PRZYSLUGUJE' ? 'var(--color-amber-border)' : 'var(--color-border)',
                background: status === 'PRZYSLUGUJE' ? 'var(--color-amber-bg)' : 'transparent',
              }}>
                {status === 'PRZYSLUGUJE' ? 'przysluguje' : 'mozliwe'}
              </span>
            </div>
            {benefit.kwota && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-accent)', marginBottom: 8 }}>{benefit.kwota}</div>}
            {matchedCriteria.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 4 }}>
                {matchedCriteria.join(' - ')}
              </div>
            )}
            {warnings.length > 0 && (
              <div style={{ fontSize: 12, color: '#e0a830', marginTop: 4 }}>{warnings[0]}</div>
            )}
            {benefit.zrodloUrl && (
              <a href={benefit.zrodloUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none', display: 'block', marginTop: 8 }}>
                Oficjalne zrodlo &rarr;
              </a>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Krok 2: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/agent/panel/swiadczenia/page.tsx
git commit -m "feat: /agent/panel/swiadczenia -- lista dopasowanych swiadczen"
```

---

### Task 6: Panel powiadomienia /agent/panel/powiadomienia

**Files:**
- Create: `src/app/agent/panel/powiadomienia/page.tsx`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/agent/panel/powiadomienia/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const KATEGORIE = [
  { value: 'dofinansowania', label: 'Dofinansowania' },
  { value: 'zus', label: 'ZUS i ubezpieczenia' },
  { value: 'podatki', label: 'Podatki' },
  { value: 'prawo', label: 'Zmiany w prawie' },
  { value: 'inne', label: 'Inne' },
];

export default function AgentPowiadomienia() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [lastSent, setLastSent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/digest/preferences').then(async res => {
      if (res.status === 401) { router.push('/agent/logowanie'); return; }
      const { prefs } = await res.json();
      setEnabled(prefs.digest_enabled ?? false);
      setCategories(prefs.categories ?? []);
      setLastSent(prefs.last_digest_sent_at);
      setLoading(false);
    });
  }, [router]);

  async function save() {
    setSaving(true);
    await fetch('/api/digest/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ digest_enabled: enabled, categories }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ladowanie...</div>;

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Ustawienia powiadomien</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Dzienny raport e-mail</h1>

      {lastSent && <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 20 }}>Ostatni digest: {new Date(lastSent).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <label style={{ display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', fontSize: 14, color: 'var(--color-text-1)' }}>
          <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          Wlacz dzienny raport na e-mail (wysylany o 8:00)
        </label>

        {enabled && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Sledzone kategorie</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {KATEGORIE.map(({ value, label }) => (
                <label key={value} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-2)' }}>
                  <input type="checkbox"
                    checked={categories.includes(value)}
                    onChange={e => {
                      setCategories(prev => e.target.checked
                        ? [...prev, value]
                        : prev.filter(c => c !== value));
                    }} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        )}

        <button onClick={save} disabled={saving} style={{
          padding: '10px 24px', background: saved ? 'var(--color-border)' : 'var(--color-accent)',
          color: 'var(--color-bg-0)', border: 'none', borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500,
          cursor: saving ? 'not-allowed' : 'pointer', width: 'fit-content',
        }}>
          {saved ? 'Zapisano' : saving ? 'Zapisuje...' : 'Zapisz ustawienia'}
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Krok 2: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/agent/panel/powiadomienia/page.tsx
git commit -m "feat: /agent/panel/powiadomienia -- ustawienia digestu"
```

---

### Task 7: Panel aktualnosci + profil

**Files:**
- Create: `src/app/agent/panel/aktualnosci/page.tsx`
- Create: `src/app/agent/panel/profil/page.tsx`

- [ ] **Krok 1: Aktualnosci -- przekieruj do istniejacego komponentu aktualnosci**

```typescript
// src/app/agent/panel/aktualnosci/page.tsx
// Uzywa tego samego API co /dotacje/panel/aktualnosci
// Pelna implementacja wzorowana na src/app/dotacje/panel/aktualnosci/page.tsx
// Kluczowa roznica: link powrotny do /agent/panel zamiast /dotacje/panel
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FeedItem {
  id: string; title: string; link: string; description: string;
  pubDate: string | null; source: string;
}

export default function AgentAktualnosci() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/aktualnosci').then(async res => {
      if (res.status === 401) { router.push('/agent/logowanie'); return; }
      const data = await res.json();
      setItems((data.items ?? []).slice(0, 20));
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ladowanie aktualnosci...</div>;

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Aktualnosci</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Zmiany w prawie i przepisach</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {items.map(item => (
          <div key={item.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-1)' }}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', textDecoration: 'none', display: 'block', marginBottom: 4 }}>
              {item.title}
            </a>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-3)' }}>
              <span>{item.source}</span>
              {item.pubDate && <span>{new Date(item.pubDate).toLocaleDateString('pl-PL')}</span>}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Krok 2: Profil**

```typescript
// src/app/agent/panel/profil/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgentProfil() {
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agent/profile').then(async res => {
      if (res.status === 401) { router.push('/agent/logowanie'); return; }
      const { profile } = await res.json();
      setProfile(profile);
      setLoading(false);
    });
  }, [router]);

  async function save() {
    if (!profile) return;
    setSaving(true);
    await fetch('/api/agent/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>Ladowanie...</div>;
  if (!profile) return null;

  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', display: 'block', marginBottom: 24 }}>&larr; Panel</Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Profil</div>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>Twoje dane</h1>
      <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 24 }}>
        {Object.entries(profile)
          .filter(([key]) => !['id', 'user_id', 'created_at', 'updated_at'].includes(key))
          .map(([key, value], i) => (
            <div key={key} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: i % 2 === 0 ? 'var(--color-bg-1)' : 'var(--color-bg-2)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-3)', paddingTop: 2 }}>{key}</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-1)' }}>
                {Array.isArray(value) ? (value as unknown[]).join(', ') || '(brak)' : String(value ?? '(brak)')}
              </span>
            </div>
          ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 16 }}>
        Aby zaktualizowac profil, skontaktuj sie z nami lub skorzystaj z API.
        Pelny edytor profilu bedzie dostepny wkrotce.
      </p>
      <Link href="/agent/panel" style={{ fontSize: 13, color: 'var(--color-text-3)', textDecoration: 'none' }}>&larr; Wróc do panelu</Link>
    </main>
  );
}
```

- [ ] **Krok 3: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/agent/panel/aktualnosci/page.tsx src/app/agent/panel/profil/page.tsx
git commit -m "feat: /agent/panel/aktualnosci i /profil"
```

---

### Task 8: Landing page /agent

**Files:**
- Create: `src/app/agent/page.tsx`

- [ ] **Krok 1: Utworz plik**

```typescript
// src/app/agent/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Twoj agent AI -- swiadczenia i aktualnosci | wezmezadarmo',
  description: 'Agent AI pilnuje co Ci przysluguje i informuje o zmianach w prawie. Dla JDG i osob prywatnych. Dzienny raport na e-mail.',
};

const CECHY = [
  { label: 'Swiadczenia i ulgi', desc: 'Agent dopasowuje 117 swiadczen do Twojego profilu: 800+, becikowe, zasilki, ulgi podatkowe.' },
  { label: 'Zmiany w prawie', desc: 'Sledzi ZUS, podatki.gov.pl i zmiany przepisow. Informuje Cie zanim musisz dzialac.' },
  { label: 'Dzienny raport e-mail', desc: 'Co rano dostaniesz zwiezle podsumowanie co jest nowego. Bez logowania do panelu.' },
  { label: 'JDG i osoby prywatne', desc: 'Dla prowadzacych dzialalnosc (NIP + PKD) i dla osob prywatnych (profil rodzinny).' },
];

export default function AgentLanding() {
  return (
    <main>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px 56px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-3)', letterSpacing: '0.04em', marginBottom: 16 }}>
          {'// agent.wezmezadarmo.v1'}
        </div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--color-text-1)', margin: '0 0 20px', maxWidth: 700 }}>
          Twoj agent AI.<br />
          <span style={{ color: 'var(--color-accent)' }}>Pilnuje spraw, gdy Ty zyjest.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 1.65, color: 'var(--color-text-2)', margin: '0 0 32px', maxWidth: 520 }}>
          Dla JDG i osob prywatnych. Agent sprawdza co Ci przysluguje, sledzi zmiany w prawie
          i wysyla Ci codzienny raport na e-mail. Bez wchodzenia na rządowe strony.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/agent/rejestracja" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--color-bg-0)', background: 'var(--color-accent)', padding: '10px 20px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            Zacznij za darmo
          </Link>
          <Link href="/agent/logowanie" style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-2)', border: '1px solid var(--color-border-light)', padding: '10px 20px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
            Mam juz konto
          </Link>
        </div>
      </section>

      <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-1)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            {CECHY.map(({ label, desc }) => (
              <div key={label} style={{ background: 'var(--color-bg-1)', padding: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, color: 'var(--color-accent)', marginBottom: 10 }}>{label}</div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ fontSize: 11, color: 'var(--color-text-3)', fontFamily: 'var(--font-sans)', lineHeight: 1.6, maxWidth: 640 }}>
          Agent AI ma charakter wylacznie informacyjny. Nie skladamy wnioskow bez Twojej akceptacji.
          Zaden dokument nie jest wysylany do urzedu bez Twojej wiedzy i zgody.
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Krok 2: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/app/agent/page.tsx
git commit -m "feat: /agent landing page"
```

---

## Weryfikacja Planu B

```bash
npx tsc --noEmit
git log --oneline -8
```

Oczekiwany wynik: 0 bledow TypeScript, 8 nowych commitow.

Przejdz do Planu C: `docs/superpowers/plans/2026-05-18-agent-jdg-C-digest.md`
