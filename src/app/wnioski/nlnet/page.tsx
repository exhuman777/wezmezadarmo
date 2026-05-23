'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { FormProfile } from '@/app/api/form-assist/route';
import { useFormPrefill } from '@/lib/wnioski/useFormPrefill';
import { PrefillBanner } from '@/components/PrefillBanner';

// ---- FORM FIELDS DEFINITION ----

interface NLnetField {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  isFixed?: boolean;
  fixedValue?: (p: FormProfile, amount: string) => string;
}

const NLNET_FIELDS: NLnetField[] = [
  {
    key: 'proposal_name',
    label: 'Proposal name',
    description: 'Short, clear name for your project proposal.',
    placeholder: '',
    isFixed: true,
    fixedValue: (p) => p.projectName,
  },
  {
    key: 'website',
    label: 'Website / wiki URL',
    description: 'Project website or repository.',
    placeholder: '',
    isFixed: true,
    fixedValue: (p) => p.websiteUrl,
  },
  {
    key: 'abstract',
    label: 'Abstract',
    description: 'Explain the entire project and its expected outcomes (300-400 words). This is the most important field.',
    placeholder: 'AI wygeneruje ten tekst...',
  },
  {
    key: 'prior_involvement',
    label: 'Prior involvement',
    description: 'Any prior involvement with NLnet, NGI programs, or related organisations.',
    placeholder: 'AI wygeneruje ten tekst...',
  },
  {
    key: 'amount',
    label: 'Amount requested (EUR)',
    description: 'Between €5,000 and €50,000. NLnet does not penalise ambitious but justified requests.',
    placeholder: '',
    isFixed: true,
    fixedValue: (_, amount) => amount,
  },
  {
    key: 'budget_breakdown',
    label: 'Budget breakdown',
    description: 'Detailed breakdown with tasks, hours, hourly rate, and totals.',
    placeholder: 'AI wygeneruje ten tekst...',
  },
  {
    key: 'other_funding',
    label: 'Other funding sources',
    description: 'All past, current, and pending funding for this project.',
    placeholder: 'AI wygeneruje ten tekst...',
  },
  {
    key: 'comparison',
    label: 'Comparison with existing efforts',
    description: 'How does this project compare to existing or historical alternatives?',
    placeholder: 'AI wygeneruje ten tekst...',
  },
  {
    key: 'technical_challenges',
    label: 'Expected technical challenges',
    description: 'Concrete engineering challenges and how you will address them.',
    placeholder: 'AI wygeneruje ten tekst...',
  },
  {
    key: 'ecosystem',
    label: 'Ecosystem and stakeholder engagement',
    description: 'Who are your stakeholders and how will you engage the broader ecosystem?',
    placeholder: 'AI wygeneruje ten tekst...',
  },
  {
    key: 'ai_disclosure',
    label: 'Generative AI disclosure',
    description: 'Declare whether and how you used AI in writing this proposal.',
    placeholder: 'AI wygeneruje ten tekst...',
  },
];

const AI_FIELDS = NLNET_FIELDS.filter((f) => !f.isFixed).map((f) => f.key);

// ---- TYPES ----

type Step = 'profile' | 'generating' | 'review' | 'done';

interface FieldState {
  value: string;
  status: 'idle' | 'generating' | 'done' | 'error';
  editing: boolean;
}

// ---- COMPONENT ----

const EMPTY_PROFILE: FormProfile = {
  projectName: '',
  websiteUrl: '',
  projectDescription: '',
  problemSolved: '',
  targetUsers: '',
  fundingGoals: '',
  isOpenSource: true,
  license: 'AGPL-3.0',
  amountRequested: '50000',
  organizationName: '',
  country: '',
  priorFunding: '',
  teamDescription: '',
};

// FormProfile NLnet nie ma bezposrednich odpowiednikow w polskim profilu wnioski-data.
// Country i organizationName ustawiamy ponizej w useEffect z imie+nazwisko/staly 'Poland'.
const NLNET_FIELD_MAP: Partial<Record<keyof FormProfile, string>> = {};

export default function NLnetWizardPage() {
  const [step, setStep] = useState<Step>('profile');
  const { data: profile, setData: setProfile, prefillStatus, prefillCount, isLoggedIn } =
    useFormPrefill<FormProfile>('nlnet', EMPTY_PROFILE, NLNET_FIELD_MAP);
  const [amountRequested, setAmountRequested] = useState('50000');
  const [fields, setFields] = useState<Record<string, FieldState>>({});
  const [generatingIdx, setGeneratingIdx] = useState(0);
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  // NLnet: fixed defaults + soft prefill z polskiego profilu jezeli puste.
  useEffect(() => {
    let cancelled = false;
    const applyDefaults = (fullName: string) => {
      if (cancelled) return;
      setProfile(prev => ({
        ...prev,
        country: prev.country || 'Poland',
        organizationName: prev.organizationName || (fullName ? `${fullName} (individual developer)` : 'individual developer'),
      }));
    };
    fetch('/api/agent/profile', { credentials: 'include' }).then(async (res) => {
      if (res.status !== 200) { applyDefaults(''); return; }
      const { profile: dbProfile } = (await res.json()) as { profile?: Record<string, unknown> };
      const imie = String(dbProfile?.imie ?? '').trim();
      const nazwisko = String(dbProfile?.nazwisko ?? '').trim();
      applyDefaults([imie, nazwisko].filter(Boolean).join(' '));
    }).catch(() => applyDefaults(''));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfile = (key: keyof FormProfile, value: string | boolean) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  // ---- STEP 2: Generate all fields ----
  const generateAll = useCallback(async () => {
    setStep('generating');
    setGeneratingIdx(0);

    // Pre-fill fixed fields
    const initialFields: Record<string, FieldState> = {};
    NLNET_FIELDS.forEach((f) => {
      if (f.isFixed && f.fixedValue) {
        initialFields[f.key] = {
          value: f.fixedValue(profile, amountRequested),
          status: 'done',
          editing: false,
        };
      } else {
        initialFields[f.key] = { value: '', status: 'idle', editing: false };
      }
    });
    setFields(initialFields);

    // Generate AI fields sequentially
    for (let i = 0; i < AI_FIELDS.length; i++) {
      const fieldKey = AI_FIELDS[i];
      const fieldDef = NLNET_FIELDS.find((f) => f.key === fieldKey)!;
      setGeneratingIdx(i);

      setFields((prev) => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], status: 'generating' },
      }));

      try {
        const res = await fetch('/api/form-assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formType: 'nlnet',
            fieldKey,
            fieldLabel: fieldDef.label,
            fieldDescription: fieldDef.description,
            profile: { ...profile, amountRequested },
          }),
        });

        const data = await res.json();
        setFields((prev) => ({
          ...prev,
          [fieldKey]: {
            value: data.result ?? 'Blad generowania: wpisz recznie.',
            status: data.result ? 'done' : 'error',
            editing: false,
          },
        }));
      } catch {
        setFields((prev) => ({
          ...prev,
          [fieldKey]: { value: '', status: 'error', editing: false },
        }));
      }
    }

    setStep('review');
    setCurrentReviewIdx(0);
  }, [profile, amountRequested]);

  // ---- COPY helpers ----
  const copyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const copyAll = () => {
    const all = NLNET_FIELDS.map((f) => {
      const val = fields[f.key]?.value ?? '';
      return `=== ${f.label.toUpperCase()} ===\n${val}`;
    }).join('\n\n');
    navigator.clipboard.writeText(all).then(() => {
      setCopied('__all__');
      setTimeout(() => setCopied(null), 2500);
    });
  };

  const downloadAll = () => {
    const all = NLNET_FIELDS.map((f) => {
      const val = fields[f.key]?.value ?? '';
      return `=== ${f.label.toUpperCase()} ===\n\n${val}`;
    }).join('\n\n---\n\n');
    const blob = new Blob([all], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NLnet-NGI-Zero-${profile.projectName.replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- PROFILE VALID? ----
  const profileValid =
    profile.projectName.trim().length > 2 &&
    profile.projectDescription.trim().length > 20 &&
    profile.problemSolved.trim().length > 20 &&
    profile.fundingGoals.trim().length > 20;

  // ---- RENDER ----

  if (step === 'profile') return <ProfileStep profile={profile} amountRequested={amountRequested} updateProfile={updateProfile} setAmount={setAmountRequested} onNext={generateAll} valid={profileValid} banner={<PrefillBanner status={prefillStatus} count={prefillCount} isLoggedIn={isLoggedIn} english />} />;
  if (step === 'generating') return <GeneratingStep generatingIdx={generatingIdx} total={AI_FIELDS.length} fields={fields} />;
  if (step === 'review') return (
    <ReviewStep
      fields={fields}
      setFields={setFields}
      currentIdx={currentReviewIdx}
      setCurrentIdx={setCurrentReviewIdx}
      copied={copied}
      onCopy={copyField}
      onCopyAll={copyAll}
      onDownload={downloadAll}
      onDone={() => setStep('done')}
    />
  );
  return <DoneStep onDownload={downloadAll} onCopyAll={copyAll} copied={copied === '__all__'} onRestart={() => { setStep('profile'); setFields({}); }} />;
}

// ---- SUB-COMPONENTS ----

function WizardShell({ children, step, total }: { children: React.ReactNode; step?: number; total?: number }) {
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
            {step !== undefined && total !== undefined && (
              <span className="mono" style={{ fontSize: 12, color: 'var(--color-text-3)' }}>
                {step} / {total}
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
      {children}
    </div>
  );
}

function ProfileStep({ profile, amountRequested, updateProfile, setAmount, onNext, valid, banner }: {
  profile: FormProfile;
  amountRequested: string;
  updateProfile: (k: keyof FormProfile, v: string | boolean) => void;
  setAmount: (v: string) => void;
  onNext: () => void;
  valid: boolean;
  banner?: React.ReactNode;
}) {
  return (
    <WizardShell>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div style={{ marginBottom: 8 }}>
          <span className="label-eyebrow">NLnet NGI Zero Commons Fund</span>
        </div>
        <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: 12, marginTop: 16 }}>Opisz swój projekt</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 24, lineHeight: 1.65 }}>
          Deadline:{' '}
          <span style={{ color: 'var(--color-warn)', fontWeight: 600 }}>1 czerwca 2026, 12:00 CEST</span>
          {' '}. Wypełnij pola poniżej: AI wygeneruje wszystkie sekcje formularza.
        </p>

        {banner}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Field label="Nazwa projektu *" hint="np. WezmeZadarmo, OpenBudget, ClimateDashboard">
            <input
              className={INPUT_CLS}
              value={profile.projectName}
              onChange={(e) => updateProfile('projectName', e.target.value)}
              placeholder="Mój projekt"
            />
          </Field>

          <Field label="URL strony lub repozytorium" hint="np. https://example.com lub https://github.com/user/repo">
            <input
              className={INPUT_CLS}
              value={profile.websiteUrl}
              onChange={(e) => updateProfile('websiteUrl', e.target.value)}
              placeholder="https://"
            />
          </Field>

          <Field label="Opis projektu w 3-4 zdaniach (po angielsku) *" hint="Co to jest, jak dziala, co robi uzytkownik. AI uzyje tego jako bazy.">
            <textarea
              className={TEXTAREA_CLS}
              rows={4}
              value={profile.projectDescription}
              onChange={(e) => updateProfile('projectDescription', e.target.value)}
              placeholder="WezmeZadarmo is a free, anonymous web tool that helps Polish citizens discover government benefits they qualify for..."
            />
          </Field>

          <Field label="Jaki problem rozwiazuje? *" hint="Opisz problem, nie rozwiazanie. Wiecej kontekstu = lepszy wniosek.">
            <textarea
              className={TEXTAREA_CLS}
              rows={3}
              value={profile.problemSolved}
              onChange={(e) => updateProfile('problemSolved', e.target.value)}
              placeholder="Most Polish citizens are unaware of benefits they are entitled to because information is scattered across dozens of government portals..."
            />
          </Field>

          <Field label="Kto korzysta z projektu?" hint="Kim sa Twoi uzytkonicy? (obywatele, NGO, firmy, urzednicy...)">
            <textarea
              className={TEXTAREA_CLS}
              rows={2}
              value={profile.targetUsers}
              onChange={(e) => updateProfile('targetUsers', e.target.value)}
              placeholder="Polish citizens, especially low-income families, elderly people, disabled individuals, farmers..."
            />
          </Field>

          <Field label="Co zrobisz z grantem? *" hint="Konkretne funkcje, rozszerzenia, dokumentacja, API: co sfinansujesz?">
            <textarea
              className={TEXTAREA_CLS}
              rows={3}
              value={profile.fundingGoals}
              onChange={(e) => updateProfile('fundingGoals', e.target.value)}
              placeholder="Open-source the codebase under AGPL-3.0, expand the benefits database from 118 to 200+ entries, build an open REST API for NGOs..."
            />
          </Field>

          <Field label="Zespol" hint="Solo developer? Dwuosobowy team? Partnerzy? (opcjonalne)">
            <input
              className={INPUT_CLS}
              value={profile.teamDescription}
              onChange={(e) => updateProfile('teamDescription', e.target.value)}
              placeholder="Solo developer with 8 years of full-stack experience in TypeScript and Next.js"
            />
          </Field>

          <Field label="Poprzednie finansowanie" hint="VC, granty, wlasne - co bylo wczesniej? Jesli brak, zostaw puste.">
            <input
              className={INPUT_CLS}
              value={profile.priorFunding}
              onChange={(e) => updateProfile('priorFunding', e.target.value)}
              placeholder="None: self-funded since inception"
            />
          </Field>

          <Field label="Organizacja / imie i nazwisko">
            <input
              className={INPUT_CLS}
              value={profile.organizationName}
              onChange={(e) => updateProfile('organizationName', e.target.value)}
              placeholder="individual developer"
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Kraj">
              <input
                className={INPUT_CLS}
                value={profile.country}
                onChange={(e) => updateProfile('country', e.target.value)}
                placeholder="Poland"
              />
            </Field>
            <Field label="Wnioskowana kwota (EUR)" hint="max €50 000">
              <input
                className={INPUT_CLS}
                type="number"
                min={5000}
                max={50000}
                value={amountRequested}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Licencja open-source">
            <select
              className={INPUT_CLS}
              value={profile.license}
              onChange={(e) => updateProfile('license', e.target.value)}
            >
              <option value="AGPL-3.0">AGPL-3.0 (zalecana dla SaaS)</option>
              <option value="MIT">MIT</option>
              <option value="Apache-2.0">Apache 2.0</option>
              <option value="GPL-3.0">GPL-3.0</option>
              <option value="MPL-2.0">MPL-2.0</option>
              <option value="EUPL-1.2">EUPL-1.2</option>
            </select>
          </Field>
        </div>

        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onNext}
            disabled={!valid}
            className="btn btn-primary btn-lg"
            style={{ borderRadius: 999, opacity: valid ? 1 : 0.4, cursor: valid ? 'pointer' : 'not-allowed' }}
          >
            Generuj wniosek z AI
          </button>
          {!valid && (
            <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Wypełnij pola oznaczone *</span>
          )}
        </div>
      </div>
    </WizardShell>
  );
}

function GeneratingStep({ generatingIdx, total, fields }: {
  generatingIdx: number;
  total: number;
  fields: Record<string, FieldState>;
}) {
  const doneCount = Object.values(fields).filter((f) => f.status === 'done').length;
  const progress = Math.round((doneCount / (total + 3)) * 100); // +3 for fixed fields

  return (
    <WizardShell step={doneCount} total={total + 3}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
        <span className="label-eyebrow">NLnet NGI Zero Commons Fund</span>
        <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '16px 0 32px' }}>Generuje wniosek...</h1>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 2, marginBottom: 32, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--color-accent)', borderRadius: 2, width: `${progress}%`, transition: 'width 500ms ease' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NLNET_FIELDS.map((f) => {
            const state = fields[f.key];
            const status = state?.status ?? 'idle';
            return (
              <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: 20, flexShrink: 0, textAlign: 'center' }}>
                  {status === 'done' && <span style={{ color: 'var(--color-green)', fontSize: 14, fontWeight: 600 }}>+</span>}
                  {status === 'generating' && <span style={{ color: 'var(--color-accent)', fontSize: 14 }}>...</span>}
                  {status === 'idle' && <span style={{ color: 'var(--color-text-3)', fontSize: 10 }}>o</span>}
                  {status === 'error' && <span style={{ color: 'var(--color-red)', fontSize: 14 }}>!</span>}
                </div>
                <span style={{
                  fontSize: 13,
                  color: status === 'done' ? 'var(--color-text-2)' : status === 'generating' ? 'var(--color-text-1)' : 'var(--color-text-3)',
                  fontWeight: status === 'generating' ? 500 : 400,
                }}>
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--color-text-3)' }}>
          Generuje pole {generatingIdx + 1} z {total}. Proszę czekać...
        </p>
      </div>
    </WizardShell>
  );
}

function ReviewStep({ fields, setFields, currentIdx, setCurrentIdx, copied, onCopy, onCopyAll, onDownload, onDone }: {
  fields: Record<string, FieldState>;
  setFields: React.Dispatch<React.SetStateAction<Record<string, FieldState>>>;
  currentIdx: number;
  setCurrentIdx: (n: number) => void;
  copied: string | null;
  onCopy: (key: string, value: string) => void;
  onCopyAll: () => void;
  onDownload: () => void;
  onDone: () => void;
}) {
  const currentField = NLNET_FIELDS[currentIdx];
  const currentState = fields[currentField?.key] ?? { value: '', status: 'idle', editing: false };
  const isLast = currentIdx === NLNET_FIELDS.length - 1;

  const setEditing = (key: string, editing: boolean) => {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], editing } }));
  };
  const setValue = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
  };

  return (
    <WizardShell step={currentIdx + 1} total={NLNET_FIELDS.length}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32 }}>
          {NLNET_FIELDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              style={{
                height: 4, borderRadius: 2, border: 'none', cursor: 'pointer', transition: 'all 200ms',
                background: i === currentIdx ? 'var(--color-accent)' : 'var(--color-border)',
                width: i === currentIdx ? 24 : 12,
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Current field */}
        <div style={{ marginBottom: 32 }}>
          <span className="label-eyebrow" style={{ display: 'block', marginBottom: 12 }}>Pole {currentIdx + 1} z {NLNET_FIELDS.length}</span>
          <h2 style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-text-1)', marginBottom: 8 }}>
            {currentField.label}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-3)', marginBottom: 20, lineHeight: 1.6 }}>{currentField.description}</p>

          {currentState.editing ? (
            <div>
              <textarea
                className={`${TEXTAREA_CLS} min-h-[240px]`}
                value={currentState.value}
                onChange={(e) => setValue(currentField.key, e.target.value)}
                autoFocus
              />
              <button
                onClick={() => setEditing(currentField.key, false)}
                style={{ marginTop: 8, fontSize: 13, color: 'var(--color-accent)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Zapisz zmiany
              </button>
            </div>
          ) : (
            <div>
              <div style={{
                background: 'var(--color-bg-1)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                padding: '16px 20px',
                fontSize: 13,
                color: 'var(--color-text-2)',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                minHeight: 120,
                boxShadow: 'var(--shadow-1)',
              }}>
                {currentState.value || <span style={{ color: 'var(--color-text-3)', fontStyle: 'italic' }}>Brak treści</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button
                  onClick={() => setEditing(currentField.key, true)}
                  className="btn btn-outline"
                  style={{ height: 34, padding: '0 14px', borderRadius: 6, fontSize: 12 }}
                >
                  Edytuj
                </button>
                <button
                  onClick={() => onCopy(currentField.key, currentState.value)}
                  className="btn btn-outline"
                  style={{ height: 34, padding: '0 14px', borderRadius: 6, fontSize: 12 }}
                >
                  {copied === currentField.key ? 'Skopiowano!' : 'Kopiuj'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="btn btn-ghost"
            style={{ borderRadius: 6, opacity: currentIdx === 0 ? 0.3 : 1, fontSize: 13 }}
          >
            Poprzednie
          </button>

          {isLast ? (
            <button onClick={onDone} className="btn btn-primary" style={{ borderRadius: 999, fontSize: 13 }}>
              Pobierz wniosek
            </button>
          ) : (
            <button onClick={() => setCurrentIdx(currentIdx + 1)} className="btn btn-primary" style={{ borderRadius: 999, fontSize: 13 }}>
              Następne pole
            </button>
          )}
        </div>

        {/* All fields overview */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span className="label-eyebrow">Wszystkie pola</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onCopyAll}
                className="btn btn-ghost"
                style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 6 }}
              >
                Kopiuj wszystko
              </button>
              <button
                onClick={onDownload}
                className="btn btn-outline"
                style={{ height: 32, padding: '0 12px', fontSize: 12, borderRadius: 6 }}
              >
                Pobierz .txt
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {NLNET_FIELDS.map((f, i) => {
              const state = fields[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => setCurrentIdx(i)}
                  style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${i === currentIdx ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    background: i === currentIdx ? 'var(--color-accent-soft)' : 'transparent',
                    cursor: 'pointer', transition: 'all 150ms',
                  }}
                >
                  <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', width: 20, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.label}</span>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--color-text-3)', flexShrink: 0 }}>
                    {state?.value ? `${state.value.length} zn.` : 'brak'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </WizardShell>
  );
}

function DoneStep({ onDownload, onCopyAll, copied, onRestart }: {
  onDownload: () => void;
  onCopyAll: () => void;
  copied: boolean;
  onRestart: () => void;
}) {
  return (
    <WizardShell>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px 80px' }}>
        <span className="label-eyebrow">NLnet NGI Zero Commons Fund</span>
        <h1 className="display" style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '16px 0 12px' }}>Wniosek gotowy</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-2)', marginBottom: 40, lineHeight: 1.65 }}>
          Pobierz plik .txt lub skopiuj wszystko do schowka. Następnie przejdź na{' '}
          <a href="https://nlnet.nl/propose/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>
            nlnet.nl/propose
          </a>{' '}
          i wklej każde pole z osobna.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 40 }}>
          <button
            onClick={onDownload}
            className="btn btn-primary"
            style={{ width: '100%', height: 50, borderRadius: 10, fontSize: 14 }}
          >
            Pobierz wniosek (.txt)
          </button>
          <button
            onClick={onCopyAll}
            className="btn btn-outline"
            style={{ width: '100%', height: 44, borderRadius: 10, fontSize: 13 }}
          >
            {copied ? 'Skopiowano!' : 'Kopiuj wszystko do schowka'}
          </button>
        </div>

        <div style={{
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '24px 28px',
          marginBottom: 32,
          boxShadow: 'var(--shadow-1)',
        }}>
          <span className="label-eyebrow" style={{ display: 'block', marginBottom: 16 }}>Checklist przed złożeniem</span>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', padding: 0, margin: 0 }}>
            {[
              'Repozytorium GitHub otwarte z licencją AGPL-3.0',
              'README.md po angielsku widoczny publicznie',
              'Strona projektu działa (wezmezadarmo.com lub inna)',
              'Abstract przeczytany na głos: brzmi przekonująco?',
              'Budget breakdown sumuje się do wnioskowanej kwoty',
              'Generative AI disclosure wypełniony uczciwie',
              'Formularz wysłany przed 1 czerwca 2026, 12:00 CEST',
            ].map((item) => (
              <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--color-text-2)' }}>
                <span className="mono" style={{ color: 'var(--color-text-3)', flexShrink: 0, marginTop: 2 }}>[ ]</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            href="https://nlnet.nl/propose/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ flex: 1, borderRadius: 999, fontSize: 13 }}
          >
            Przejdź do formularza NLnet
          </Link>
          <button
            onClick={onRestart}
            className="btn btn-ghost"
            style={{ fontSize: 13, borderRadius: 999 }}
          >
            Zacznij od nowa
          </button>
        </div>
      </div>
    </WizardShell>
  );
}

// ---- SHARED STYLES ----

const INPUT_CLS = [
  'w-full',
  'bg-bg-1 border border-border rounded-[8px] px-3 py-2.5',
  'text-[13px] text-text-1 placeholder:text-text-3',
  'focus:outline-none focus:border-accent/60 transition-colors',
].join(' ');
const TEXTAREA_CLS = `${INPUT_CLS} resize-vertical`;

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--color-text-1)', marginBottom: 4 }}>{label}</label>
      {hint && <p style={{ fontSize: 11, color: 'var(--color-text-3)', marginBottom: 8, lineHeight: 1.5 }}>{hint}</p>}
      {children}
    </div>
  );
}
