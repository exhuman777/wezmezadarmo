'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ── Option button ── */
function Opt({ label, sub, active, onClick }: { label: string; sub?: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      padding: '14px 20px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
      border: active ? '2px solid #22A06B' : '1px solid var(--color-border)',
      background: active ? 'rgba(34,160,107,0.08)' : 'var(--color-bg-1)',
      color: active ? '#22A06B' : 'var(--color-text-2)',
      fontWeight: active ? 600 : 400, fontSize: 14,
      transition: 'all 150ms', minWidth: 120,
    }}>
      {label}
      {sub && <span style={{ fontSize: 11, opacity: 0.7, marginTop: 2, fontWeight: 400, color: 'var(--color-text-3)' }}>{sub}</span>}
    </button>
  );
}

/* ── Number input ── */
function NumInput({ value, onChange, placeholder, unit }: { value: string; onChange: (v: string) => void; placeholder: string; unit?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 240 }}>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1, padding: '14px 18px', fontSize: 22, fontWeight: 500,
          border: '2px solid var(--color-border)', borderRadius: 12,
          background: 'var(--color-bg-1)', color: 'var(--color-text-1)',
          outline: 'none', fontFamily: 'var(--font-mono)',
          transition: 'border-color 150ms',
        }}
        onFocus={e => { e.target.style.borderColor = '#22A06B'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
      />
      {unit && <span style={{ fontSize: 14, color: 'var(--color-text-3)', fontFamily: 'var(--font-mono)' }}>{unit}</span>}
    </div>
  );
}

/* ── Private steps ── */
const PRIVATE_STEPS = [
  {
    title: 'Ile masz lat?',
    sub: 'Potrzebujemy do dopasowania progów wiekowych świadczeń.',
    field: 'wiek', type: 'number', placeholder: 'np. 35',
  },
  {
    title: 'Płeć',
    sub: 'Część świadczeń zależy od płci.',
    field: 'plec', type: 'options',
    options: [{ v: 'K', l: 'Kobieta' }, { v: 'M', l: 'Mężczyzna' }],
  },
  {
    title: 'Stan cywilny',
    sub: null,
    field: 'stan_cywilny', type: 'options',
    options: [
      { v: 'wolny', l: 'Wolny/a' },
      { v: 'malzenstwo', l: 'Małżeństwo' },
      { v: 'rozwiedziony', l: 'Rozwiedziony/a' },
      { v: 'wdowiec', l: 'Wdowiec/Wdowa' },
    ],
  },
  {
    title: 'Ile masz dzieci?',
    sub: 'Dzieci poniżej 18 lat.',
    field: 'liczba_dzieci', type: 'options',
    options: [
      { v: '0', l: 'Brak' },
      { v: '1', l: '1' },
      { v: '2', l: '2' },
      { v: '3', l: '3' },
      { v: '4', l: '4 i więcej' },
    ],
  },
  {
    title: 'Forma zatrudnienia',
    sub: 'Twoja główna forma pracy.',
    field: 'zatrudnienie', type: 'options',
    options: [
      { v: 'umowa_o_prace', l: 'Umowa o pracę' },
      { v: 'zlecenie', l: 'Zlecenie / dzieło' },
      { v: 'b2b', l: 'B2B / działalność' },
      { v: 'bezrobotny', l: 'Bezrobotny/a' },
      { v: 'emeryt', l: 'Emeryt/Rencista' },
    ],
  },
  {
    title: 'Dochód netto miesięcznie',
    sub: 'Łączny dochód w Twoim gospodarstwie domowym.',
    field: 'dochod_miesiecznie', type: 'number', placeholder: 'np. 5000', unit: 'PLN',
  },
  {
    title: 'Województwo',
    sub: 'Część dopłat jest wypłacana przez gminy.',
    field: 'wojewodztwo', type: 'select',
    options: [
      { v: 'dolnoslaskie', l: 'Dolnośląskie' },
      { v: 'kujawsko-pomorskie', l: 'Kujawsko-pomorskie' },
      { v: 'lubelskie', l: 'Lubelskie' },
      { v: 'lubuskie', l: 'Lubuskie' },
      { v: 'lodzkie', l: 'Łódzkie' },
      { v: 'malopolskie', l: 'Małopolskie' },
      { v: 'mazowieckie', l: 'Mazowieckie' },
      { v: 'opolskie', l: 'Opolskie' },
      { v: 'podkarpackie', l: 'Podkarpackie' },
      { v: 'podlaskie', l: 'Podlaskie' },
      { v: 'pomorskie', l: 'Pomorskie' },
      { v: 'slaskie', l: 'Śląskie' },
      { v: 'swietokrzyskie', l: 'Świętokrzyskie' },
      { v: 'warminsko-mazurskie', l: 'Warmińsko-mazurskie' },
      { v: 'wielkopolskie', l: 'Wielkopolskie' },
      { v: 'zachodniopomorskie', l: 'Zachodniopomorskie' },
    ],
  },
  {
    title: 'Sytuacja mieszkaniowa',
    sub: null,
    field: 'wlasnosc', type: 'options',
    options: [
      { v: 'mieszkanie', l: 'Własne mieszkanie' },
      { v: 'dom', l: 'Własny dom' },
      { v: 'wynajem', l: 'Wynajem' },
      { v: 'rodzina', l: 'U rodziny' },
    ],
  },
  {
    title: 'Niepełnosprawność',
    sub: 'Orzeczenie o stopniu niepełnosprawności.',
    field: 'niepelnosprawnosc', type: 'options',
    options: [
      { v: 'brak', l: 'Brak' },
      { v: 'lekki', l: 'Lekki stopień' },
      { v: 'umiarkowany', l: 'Umiarkowany' },
      { v: 'znaczny', l: 'Znaczny' },
    ],
  },
  {
    title: 'Dodatkowe informacje',
    sub: 'Zaznacz wszystkie które dotyczą Twojej sytuacji.',
    field: '_extra', type: 'multi',
    options: [
      { v: 'ciaza', l: 'Ciąża' },
      { v: 'student', l: 'Student' },
      { v: 'rolnik', l: 'Rolnik (KRUS)' },
      { v: 'bezrobotny_zarejestrowany', l: 'Zarejestrowany bezrobotny' },
    ],
  },
];

const JDG_STEPS = [
  { title: 'NIP firmy', field: 'nip', type: 'text', placeholder: 'np. 1234567890' },
  { title: 'Nazwa firmy', field: 'company_name', type: 'text', placeholder: 'np. Kowalski Jan' },
  {
    title: 'Województwo',
    field: 'company_voivodeship', type: 'select',
    options: [
      { v: 'dolnoslaskie', l: 'Dolnośląskie' },
      { v: 'kujawsko-pomorskie', l: 'Kujawsko-pomorskie' },
      { v: 'lubelskie', l: 'Lubelskie' },
      { v: 'lubuskie', l: 'Lubuskie' },
      { v: 'lodzkie', l: 'Łódzkie' },
      { v: 'malopolskie', l: 'Małopolskie' },
      { v: 'mazowieckie', l: 'Mazowieckie' },
      { v: 'opolskie', l: 'Opolskie' },
      { v: 'podkarpackie', l: 'Podkarpackie' },
      { v: 'podlaskie', l: 'Podlaskie' },
      { v: 'pomorskie', l: 'Pomorskie' },
      { v: 'slaskie', l: 'Śląskie' },
      { v: 'swietokrzyskie', l: 'Świętokrzyskie' },
      { v: 'warminsko-mazurskie', l: 'Warmińsko-mazurskie' },
      { v: 'wielkopolskie', l: 'Wielkopolskie' },
      { v: 'zachodniopomorskie', l: 'Zachodniopomorskie' },
    ],
  },
  {
    title: 'Wielkość firmy',
    field: 'company_size', type: 'options',
    options: [
      { v: 'mikro', l: 'Mikro', sub: 'do 10 osób' },
      { v: 'mala', l: 'Mała', sub: '10–49 osób' },
      { v: 'srednia', l: 'Średnia', sub: '50–249 osób' },
      { v: 'duza', l: 'Duża', sub: '250+ osób' },
    ],
  },
];

/* ── Main component ── */
export default function AgentProfil() {
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [step, setStep] = useState(0);
  const [wizardMode, setWizardMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/agent/profile').then(async res => {
      if (res.status === 401) { router.push('/logowanie'); return; }
      const { profile: p } = await res.json();
      setProfile(p);
      setDraft({ ...p });
      const isEmpty = !p?.wiek && !p?.zatrudnienie && !p?.nip;
      setWizardMode(isEmpty);
      setLoading(false);
    });
  }, [router]);

  async function saveAll(finalDraft: Record<string, unknown>) {
    setSaving(true);
    setError('');
    const res = await fetch('/api/agent/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalDraft),
    });
    if (res.ok) {
      const { profile: updated } = await res.json();
      setProfile(updated);
      setDraft({ ...updated });
      setWizardMode(false);
      setSaved(true);
      setStep(0);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError('Błąd zapisu. Spróbuj ponownie.');
    }
    setSaving(false);
  }

  if (loading) return (
    <div style={{ padding: 64, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-3)' }}>
      Ładowanie...
    </div>
  );
  if (!profile) return null;

  const profileType = profile.type as string;
  const steps = profileType === 'jdg' ? JDG_STEPS : PRIVATE_STEPS;
  const total = steps.length;

  /* ─── WIZARD MODE ─── */
  if (wizardMode) {
    const currentStep = steps[step] as {
      title: string; sub?: string | null; field: string; type: string;
      placeholder?: string; unit?: string;
      options?: { v: string; l: string; sub?: string }[];
    };

    function setValue(val: unknown) {
      setDraft(prev => ({ ...prev, [currentStep.field]: val }));
    }

    const current = draft[currentStep.field];
    const isMulti = currentStep.type === 'multi';

    function toggleMulti(key: string) {
      setDraft(prev => ({
        ...prev,
        [key]: !prev[key],
      }));
    }

    async function next() {
      if (step < total - 1) {
        setStep(s => s + 1);
      } else {
        await saveAll(draft);
      }
    }

    const progress = ((step + 1) / total) * 100;

    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
        <Link href="/panel" style={{ fontSize: 13, color: 'var(--color-green)', textDecoration: 'none', display: 'block', marginBottom: 32 }}>
          ← Panel
        </Link>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--color-text-3)', textTransform: 'uppercase' as const }}>
              Profil · pytanie {step + 1} z {total}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#22A06B' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: 'linear-gradient(90deg, #22A06B, #8EEAAD)',
              width: `${progress}%`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Question */}
        <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--color-text-1)' }}>
          {currentStep.title}
        </h2>
        {currentStep.sub && (
          <p style={{ fontSize: 14, color: 'var(--color-text-3)', marginBottom: 24, lineHeight: 1.5 }}>
            {currentStep.sub}
          </p>
        )}

        {/* Input */}
        <div style={{ marginBottom: 32, marginTop: currentStep.sub ? 0 : 24 }}>
          {currentStep.type === 'number' && (
            <NumInput
              value={String(current ?? '')}
              onChange={setValue}
              placeholder={currentStep.placeholder ?? ''}
              unit={currentStep.unit}
            />
          )}

          {currentStep.type === 'text' && (
            <input
              type="text"
              value={String(current ?? '')}
              onChange={e => setValue(e.target.value)}
              placeholder={currentStep.placeholder ?? ''}
              style={{
                width: '100%', maxWidth: 360, padding: '14px 18px', fontSize: 16,
                border: '2px solid var(--color-border)', borderRadius: 12,
                background: 'var(--color-bg-1)', color: 'var(--color-text-1)',
                outline: 'none', boxSizing: 'border-box' as const,
              }}
              onFocus={e => { e.target.style.borderColor = '#22A06B'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          )}

          {currentStep.type === 'options' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {currentStep.options?.map(opt => (
                <Opt
                  key={opt.v}
                  label={opt.l}
                  sub={opt.sub}
                  active={current === opt.v || current === Number(opt.v)}
                  onClick={() => setValue(currentStep.field === 'liczba_dzieci' ? Number(opt.v) : opt.v)}
                />
              ))}
            </div>
          )}

          {currentStep.type === 'select' && (
            <select
              value={String(current ?? '')}
              onChange={e => setValue(e.target.value)}
              style={{
                width: '100%', maxWidth: 360, padding: '14px 16px', fontSize: 15,
                border: '2px solid var(--color-border)', borderRadius: 12,
                background: 'var(--color-bg-1)', color: 'var(--color-text-1)',
                outline: 'none', cursor: 'pointer',
              }}
              onFocus={e => { e.target.style.borderColor = '#22A06B'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; }}
            >
              <option value="">(wybierz)</option>
              {currentStep.options?.map(opt => (
                <option key={opt.v} value={opt.v}>{opt.l}</option>
              ))}
            </select>
          )}

          {isMulti && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {currentStep.options?.map(opt => {
                const isOn = !!draft[opt.v];
                return (
                  <button
                    key={opt.v}
                    onClick={() => toggleMulti(opt.v)}
                    style={{
                      padding: '12px 20px', borderRadius: 12, cursor: 'pointer',
                      border: isOn ? '2px solid #22A06B' : '1px solid var(--color-border)',
                      background: isOn ? 'rgba(34,160,107,0.1)' : 'var(--color-bg-1)',
                      color: isOn ? '#22A06B' : 'var(--color-text-2)',
                      fontSize: 14, fontWeight: isOn ? 600 : 400,
                      transition: 'all 150ms',
                    }}
                  >
                    {isOn ? '✓ ' : ''}{opt.l}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: 'var(--red-400)', marginBottom: 16 }}>{error}</p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            onClick={next}
            disabled={saving}
            style={{
              padding: '14px 32px', fontSize: 15, fontWeight: 600,
              background: saving ? 'var(--color-border)' : '#22A06B',
              color: '#fff', border: 'none', borderRadius: 12,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 14px rgba(34,160,107,0.35)',
              transition: 'all 150ms',
            }}
          >
            {saving ? 'Zapisuję...' : step < total - 1 ? 'Dalej →' : 'Zapisz profil →'}
          </button>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ padding: '14px 20px', fontSize: 14, background: 'none', border: '1px solid var(--color-border)', borderRadius: 12, cursor: 'pointer', color: 'var(--color-text-3)' }}
            >
              ← Wróć
            </button>
          )}
          {!profile?.wiek && (
            <button
              onClick={() => { setWizardMode(false); }}
              style={{ padding: '14px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-3)' }}
            >
              Pomiń
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ─── VIEW / SUMMARY MODE ─── */
  const PRIVATE_LABELS: Record<string, { label: string; render?: (v: unknown) => string }> = {
    wiek: { label: 'Wiek', render: v => v ? `${v} lat` : '' },
    plec: { label: 'Płeć', render: v => v === 'K' ? 'Kobieta' : v === 'M' ? 'Mężczyzna' : '' },
    stan_cywilny: { label: 'Stan cywilny', render: v => ({ wolny: 'Wolny/a', malzenstwo: 'Małżeństwo', rozwiedziony: 'Rozwiedziony/a', wdowiec: 'Wdowiec/Wdowa' } as Record<string,string>)[v as string] ?? '' },
    liczba_dzieci: { label: 'Dzieci', render: v => v != null ? String(v) : '' },
    zatrudnienie: { label: 'Zatrudnienie', render: v => ({ umowa_o_prace: 'Umowa o pracę', zlecenie: 'Zlecenie/dzieło', b2b: 'B2B', bezrobotny: 'Bezrobotny/a', emeryt: 'Emeryt' } as Record<string,string>)[v as string] ?? '' },
    dochod_miesiecznie: { label: 'Dochód miesięcznie', render: v => v ? `${v} PLN` : '' },
    dochod_na_osobe: { label: 'Dochód na osobę', render: v => v ? `${v} PLN` : '' },
    niepelnosprawnosc: { label: 'Niepełnosprawność', render: v => ({ brak: 'Brak', lekki: 'Lekki', umiarkowany: 'Umiarkowany', znaczny: 'Znaczny' } as Record<string,string>)[v as string] ?? '' },
    wlasnosc: { label: 'Mieszkanie', render: v => ({ mieszkanie: 'Własne mieszkanie', dom: 'Własny dom', wynajem: 'Wynajem', rodzina: 'U rodziny' } as Record<string,string>)[v as string] ?? '' },
    wojewodztwo: { label: 'Województwo', render: v => (v as string) ?? '' },
    ciaza: { label: 'Ciąża', render: v => v ? 'Tak' : 'Nie' },
    student: { label: 'Student', render: v => v ? 'Tak' : 'Nie' },
    rolnik: { label: 'Rolnik', render: v => v ? 'Tak' : 'Nie' },
    bezrobotny_zarejestrowany: { label: 'Zarejestrowany bezrobotny', render: v => v ? 'Tak' : 'Nie' },
  };

  const JDG_LABELS: Record<string, { label: string }> = {
    nip: { label: 'NIP' },
    company_name: { label: 'Nazwa firmy' },
    company_voivodeship: { label: 'Województwo' },
    company_size: { label: 'Wielkość firmy' },
  };

  const labelMap = profileType === 'jdg' ? JDG_LABELS : PRIVATE_LABELS;
  const hiddenKeys = ['id', 'user_id', 'created_at', 'updated_at', 'type'];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
      <Link href="/panel" style={{ fontSize: 13, color: 'var(--color-green)', textDecoration: 'none', display: 'block', marginBottom: 28 }}>
        ← Panel
      </Link>

      {saved && (
        <div style={{ padding: '12px 16px', background: 'rgba(34,160,107,0.1)', border: '1px solid #22A06B', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#22A06B', fontFamily: 'var(--font-mono)' }}>
          Profil zapisany.
        </div>
      )}

      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--color-text-3)', textTransform: 'uppercase' as const, marginBottom: 4 }}>
            Profil
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>Twoje dane</h1>
        </div>
        <button
          onClick={() => { setWizardMode(true); setStep(0); }}
          style={{
            padding: '10px 20px', fontSize: 13, fontWeight: 600,
            background: '#22A06B', color: '#fff',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(34,160,107,0.3)',
          }}
        >
          Edytuj
        </button>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '8px 14px', background: 'rgba(34,160,107,0.06)', border: '1px solid rgba(34,160,107,0.15)', borderRadius: 8, marginBottom: 20, color: 'var(--color-text-3)' }}>
        {profileType === 'jdg' ? 'JDG - działalność gospodarcza' : 'Osoba prywatna'}
      </div>

      <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
        {Object.entries(profile)
          .filter(([key]) => !hiddenKeys.includes(key) && labelMap[key])
          .map(([key, value], i) => {
            const meta = labelMap[key] as { label: string; render?: (v: unknown) => string };
            const display = meta.render ? meta.render(value) : String(value ?? '');
            if (!display) return null;
            return (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', padding: '13px 18px',
                borderBottom: i < Object.keys(labelMap).length - 1 ? '1px solid var(--color-border)' : 'none',
                background: i % 2 === 0 ? 'var(--color-bg-1)' : 'var(--color-bg-2)',
                gap: 16,
              }}>
                <span style={{ fontSize: 13, color: 'var(--color-text-3)', minWidth: 160 }}>{meta.label}</span>
                <span style={{ fontSize: 14, color: 'var(--color-text-1)', fontWeight: 500 }}>{display}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
