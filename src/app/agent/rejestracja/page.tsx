'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 1 | 2 | 3;

interface FormState {
  email: string;
  password: string;
  acceptTerms: boolean;
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
      set('nipError', 'NIP musi mieć dokładnie 10 cyfr.');
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
      set('nipError', 'Błąd połączenia z CEIDG.');
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
        setError(data.error ?? 'Błąd rejestracji.');
        return;
      }

      if (data.requiresEmailVerification) {
        router.push('/agent/sprawdz-email');
        return;
      }

      await fetch('/api/agent/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      router.push('/agent/panel');
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.');
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
        <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: n <= step ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <div style={sectionLabel}>Krok 1 z 3</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
              Załóż konto
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Adres e-mail</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="jan@kowalski.pl" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Hasło (min. 8 znaków)</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                  style={inputStyle} />
              </div>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontSize: 13, color: 'var(--color-text-2)' }}>
                <input type="checkbox" checked={form.acceptTerms} onChange={e => set('acceptTerms', e.target.checked)} />
                Akceptuję{' '}
                <a href="/regulamin" target="_blank" style={{ color: 'var(--color-accent)' }}>regulamin serwisu</a>
              </label>
              {error && <p style={{ fontSize: 13, color: '#e05c5c', margin: 0 }}>{error}</p>}
              <button
                onClick={() => {
                  if (!form.email || !form.password || form.password.length < 8 || !form.acceptTerms) {
                    setError('Uzupełnij wszystkie pola i zaakceptuj regulamin.');
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

        {step === 2 && (
          <div>
            <div style={sectionLabel}>Krok 2 z 3</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 20 }}>
              Twój profil
            </h1>

            <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', marginBottom: 24, fontSize: 14, color: 'var(--color-text-2)' }}>
              <input type="checkbox" checked={form.isJdg} onChange={e => set('isJdg', e.target.checked)} />
              Prowadzę działalność gospodarczą (JDG)
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
                      {form.nipLoading ? 'Sprawdzam...' : 'Sprawdź NIP'}
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
                    <option value="mikro">Mikro (do 9 pracowników)</option>
                    <option value="mala">Mała (10-49)</option>
                    <option value="srednia">Średnia (50-249)</option>
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
                    <label style={labelStyle}>Płeć</label>
                    <select value={form.plec} onChange={e => set('plec', e.target.value)} style={inputStyle}>
                      <option value="">Wybierz...</option>
                      <option value="K">Kobieta</option>
                      <option value="M">Mężczyzna</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Stan cywilny</label>
                  <select value={form.stan_cywilny} onChange={e => set('stan_cywilny', e.target.value)} style={inputStyle}>
                    <option value="">Wybierz...</option>
                    <option value="wolny">Wolny/wolna</option>
                    <option value="malzenstwo">W małżeństwie</option>
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
                    <label style={labelStyle}>Dochód gosp. domowego (PLN/mies.)</label>
                    <input type="number" min="0" value={form.dochod_miesiecznie}
                      onChange={e => set('dochod_miesiecznie', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Dochód na osobę (PLN/mies.)</label>
                    <input type="number" min="0" value={form.dochod_na_osobe}
                      onChange={e => set('dochod_na_osobe', e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Forma zatrudnienia</label>
                  <select value={form.zatrudnienie} onChange={e => set('zatrudnienie', e.target.value)} style={inputStyle}>
                    <option value="">Wybierz...</option>
                    <option value="umowa_o_prace">Umowa o pracę</option>
                    <option value="dzialalnosc">Działalność gospodarcza</option>
                    <option value="umowa_zlecenie">Umowa zlecenie / o dzieło</option>
                    <option value="bezrobotny">Bezrobotny/a</option>
                    <option value="emeryt">Emeryt/rencista</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Niepełnosprawność</label>
                    <select value={form.niepelnosprawnosc} onChange={e => set('niepelnosprawnosc', e.target.value)} style={inputStyle}>
                      <option value="brak">Brak</option>
                      <option value="lekki">Lekki stopień</option>
                      <option value="umiarkowany">Umiarkowany</option>
                      <option value="znaczny">Znaczny</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Zamieszkanie</label>
                    <select value={form.wlasnosc} onChange={e => set('wlasnosc', e.target.value)} style={inputStyle}>
                      <option value="">Wybierz...</option>
                      <option value="mieszkanie">Własne mieszkanie</option>
                      <option value="dom">Własny dom</option>
                      <option value="wynajem">Wynajem</option>
                      <option value="rodzina">U rodziny</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Województwo</label>
                  <select value={form.wojewodztwo} onChange={e => set('wojewodztwo', e.target.value)} style={inputStyle}>
                    <option value="">Wybierz...</option>
                    {['dolnośląskie','kujawsko-pomorskie','lubelskie','lubuskie','łódzkie','małopolskie','mazowieckie','opolskie','podkarpackie','podlaskie','pomorskie','śląskie','świętokrzyskie','warmińsko-mazurskie','wielkopolskie','zachodniopomorskie'].map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  {[
                    { key: 'ciaza', label: 'W ciąży' },
                    { key: 'student', label: 'Student' },
                    { key: 'emeryt', label: 'Emeryt/rencista' },
                    { key: 'rolnik', label: 'Rolnik (KRUS)' },
                    { key: 'bezrobotny_zarejestrowany', label: 'Bezrobotny zarejestrow.' },
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

        {step === 3 && (
          <div>
            <div style={sectionLabel}>Krok 3 z 3</div>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
              Powiadomienia e-mail
            </h1>
            <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 24 }}>
              Agent będzie wysyłał Ci dzienny digest. Możesz to zmienić w panelu w dowolnym momencie.
            </p>

            <label style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.digest_enabled} onChange={e => set('digest_enabled', e.target.checked)} />
              <span style={{ fontSize: 14, color: 'var(--color-text-1)' }}>Włącz dzienny raport na e-mail (8:00 rano)</span>
            </label>

            {form.digest_enabled && (
              <div style={{ marginBottom: 24 }}>
                <div style={sectionLabel}>Kategorie do śledzenia</div>
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
                {submitting ? 'Tworzę konto...' : 'Załóż konto'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
