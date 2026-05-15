'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import type { FormProfile } from '@/app/api/form-assist/route';

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
  organizationName: 'individual developer',
  country: 'Poland',
  priorFunding: '',
  teamDescription: '',
};

export default function NLnetWizardPage() {
  const [step, setStep] = useState<Step>('profile');
  const [profile, setProfile] = useState<FormProfile>(EMPTY_PROFILE);
  const [amountRequested, setAmountRequested] = useState('50000');
  const [fields, setFields] = useState<Record<string, FieldState>>({});
  const [generatingIdx, setGeneratingIdx] = useState(0);
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

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
            value: data.result ?? 'Blad generowania -- wpisz recznie.',
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

  if (step === 'profile') return <ProfileStep profile={profile} amountRequested={amountRequested} updateProfile={updateProfile} setAmount={setAmountRequested} onNext={generateAll} valid={profileValid} />;
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

function ProfileStep({ profile, amountRequested, updateProfile, setAmount, onNext, valid }: {
  profile: FormProfile;
  amountRequested: string;
  updateProfile: (k: keyof FormProfile, v: string | boolean) => void;
  setAmount: (v: string) => void;
  onNext: () => void;
  valid: boolean;
}) {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/wnioski" className="text-[13px] text-accent hover:underline mb-6 inline-block">
          &larr; Wróć do listy formularzy
        </Link>
        <div className="mb-2 text-[12px] text-text-3 font-mono">NLnet NGI Zero Commons Fund</div>
        <h1 className="text-[22px] sm:text-[26px] font-bold text-text-1 mb-2">Opisz swój projekt</h1>
        <p className="text-[13px] text-text-3 mb-8">
          Deadline: <span className="text-amber-400 font-medium">1 czerwca 2026, 12:00 CEST</span>. Wypełnij pola ponizej -- AI wygeneruje wszystkie sekcje formularza.
        </p>

        <div className="space-y-6">
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

          <Field label="Co zrobisz z grantem? *" hint="Konkretne funkcje, rozszerzenia, dokumentacja, API -- co sfinansujesz?">
            <textarea
              className={TEXTAREA_CLS}
              rows={3}
              value={profile.fundingGoals}
              onChange={(e) => updateProfile('fundingGoals', e.target.value)}
              placeholder="Open-source the codebase under AGPL-3.0, expand the benefits database from 117 to 200+ entries, build an open REST API for NGOs..."
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
              placeholder="None -- self-funded since inception"
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

          <div className="grid grid-cols-2 gap-4">
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

        <div className="mt-10 flex items-center gap-4">
          <button
            onClick={onNext}
            disabled={!valid}
            className="px-6 py-3 bg-accent text-bg-0 font-medium rounded-[6px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-colors text-[14px]"
          >
            Generuj wniosek z AI
          </button>
          {!valid && (
            <span className="text-[12px] text-text-3">Wypelnij pola oznaczone *</span>
          )}
        </div>
      </div>
    </div>
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
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-2 text-[12px] text-text-3 font-mono">NLnet NGI Zero Commons Fund</div>
        <h1 className="text-[22px] font-bold text-text-1 mb-6">Generuje wniosek...</h1>

        <div className="w-full bg-bg-1 rounded-full h-2 mb-6">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-2">
          {NLNET_FIELDS.map((f) => {
            const state = fields[f.key];
            const status = state?.status ?? 'idle';
            return (
              <div key={f.key} className="flex items-center gap-3 py-2">
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {status === 'done' && <span className="text-green-400 text-[16px]">+</span>}
                  {status === 'generating' && <span className="text-accent text-[16px] animate-pulse">...</span>}
                  {status === 'idle' && <span className="text-text-3 text-[12px]">--</span>}
                  {status === 'error' && <span className="text-red-400 text-[16px]">!</span>}
                </div>
                <span className={`text-[13px] ${status === 'done' ? 'text-text-2' : status === 'generating' ? 'text-text-1 font-medium' : 'text-text-3'}`}>
                  {f.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-[12px] text-text-3">
          Generuje pole {generatingIdx + 1} z {total}. Prosze czekac...
        </p>
      </div>
    </div>
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
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[12px] text-text-3 font-mono">NLnet NGI Zero -- Przeglad</div>
          <div className="text-[12px] text-text-3">
            {currentIdx + 1} / {NLNET_FIELDS.length}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mb-6">
          {NLNET_FIELDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={`h-1.5 rounded-full transition-all ${i === currentIdx ? 'bg-accent w-6' : 'bg-border w-3 hover:bg-text-3'}`}
            />
          ))}
        </div>

        {/* Current field */}
        <div className="mb-6">
          <h2 className="text-[18px] font-bold text-text-1 mb-1">{currentField.label}</h2>
          <p className="text-[12px] text-text-3 mb-4">{currentField.description}</p>

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
                className="mt-2 text-[13px] text-accent hover:underline"
              >
                Zapisz zmiany
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-bg-1 border border-border rounded-[8px] p-4 text-[13px] text-text-2 leading-[1.8] whitespace-pre-wrap min-h-[120px]">
                {currentState.value || <span className="text-text-3 italic">Brak treści</span>}
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setEditing(currentField.key, true)}
                  className="text-[12px] text-text-3 hover:text-text-1 border border-border rounded-[5px] px-3 py-1.5 transition-colors"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => onCopy(currentField.key, currentState.value)}
                  className="text-[12px] text-text-3 hover:text-text-1 border border-border rounded-[5px] px-3 py-1.5 transition-colors"
                >
                  {copied === currentField.key ? 'Skopiowano!' : 'Kopiuj'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="text-[13px] text-text-3 hover:text-text-1 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 border border-border rounded-[6px]"
          >
            Poprzednie
          </button>

          {isLast ? (
            <button
              onClick={onDone}
              className="text-[13px] font-medium text-bg-0 bg-accent hover:bg-accent/90 px-6 py-2 rounded-[6px] transition-colors"
            >
              Pobierz wniosek
            </button>
          ) : (
            <button
              onClick={() => setCurrentIdx(currentIdx + 1)}
              className="text-[13px] font-medium text-bg-0 bg-accent hover:bg-accent/90 px-6 py-2 rounded-[6px] transition-colors"
            >
              Nastepne pole
            </button>
          )}
        </div>

        {/* All fields overview */}
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-medium text-text-1">Wszystkie pola</h3>
            <div className="flex gap-2">
              <button
                onClick={onCopyAll}
                className="text-[12px] text-text-3 hover:text-text-1 border border-border rounded-[5px] px-3 py-1.5"
              >
                Kopiuj wszystko
              </button>
              <button
                onClick={onDownload}
                className="text-[12px] text-text-3 hover:text-text-1 border border-border rounded-[5px] px-3 py-1.5"
              >
                Pobierz .txt
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {NLNET_FIELDS.map((f, i) => {
              const state = fields[f.key];
              return (
                <button
                  key={f.key}
                  onClick={() => setCurrentIdx(i)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-[6px] border transition-colors ${i === currentIdx ? 'border-accent/50 bg-accent/5' : 'border-border hover:border-border/80 hover:bg-bg-1'}`}
                >
                  <span className="text-[11px] text-text-3 font-mono w-5 shrink-0">{i + 1}</span>
                  <span className="text-[13px] text-text-2 flex-1 truncate">{f.label}</span>
                  <span className="text-[11px] text-text-3 shrink-0">
                    {state?.value ? `${state.value.length} zn.` : '--'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DoneStep({ onDownload, onCopyAll, copied, onRestart }: {
  onDownload: () => void;
  onCopyAll: () => void;
  copied: boolean;
  onRestart: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg-0 py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-2 text-[12px] text-text-3 font-mono">NLnet NGI Zero Commons Fund</div>
        <h1 className="text-[22px] font-bold text-text-1 mb-3">Wniosek gotowy</h1>
        <p className="text-[14px] text-text-2 mb-8 leading-[1.7]">
          Pobierz plik .txt lub skopiuj wszystko do schowka. Nastepnie przejdz na <a href="https://nlnet.nl/propose/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">nlnet.nl/propose</a> i wklej kazde pole z osobna.
        </p>

        <div className="space-y-3 mb-10">
          <button
            onClick={onDownload}
            className="w-full py-3 text-[14px] font-medium bg-accent text-bg-0 rounded-[8px] hover:bg-accent/90 transition-colors"
          >
            Pobierz wniosek (.txt)
          </button>
          <button
            onClick={onCopyAll}
            className="w-full py-3 text-[13px] text-text-2 bg-bg-1 border border-border rounded-[8px] hover:border-accent/40 transition-colors"
          >
            {copied ? 'Skopiowano!' : 'Kopiuj wszystko do schowka'}
          </button>
        </div>

        <div className="bg-bg-1 border border-border rounded-[8px] p-5 mb-8">
          <h3 className="text-[13px] font-medium text-text-1 mb-3">Checklist przed zlozeniem</h3>
          <ul className="space-y-2 text-[13px] text-text-2">
            {[
              'Repozytorium GitHub otwarte z licencja AGPL-3.0',
              'README.md po angielsku widoczny publicznie',
              'Strona projektu dziala (wezmezadarmo.com lub inna)',
              'Abstract przeczytany na glos -- brzmi przekonujaco?',
              'Budget breakdown sumuje sie do wnioskowanej kwoty',
              'Generative AI disclosure wypelniony uczciwie',
              'Formularz wyslany przed 1 czerwca 2026, 12:00 CEST',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-text-3 shrink-0 mt-0.5">[ ]</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="https://nlnet.nl/propose/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2.5 text-[13px] font-medium bg-accent text-bg-0 rounded-[6px] hover:bg-accent/90 transition-colors"
          >
            Przejdz do formularza NLnet
          </Link>
          <button
            onClick={onRestart}
            className="px-4 py-2.5 text-[13px] text-text-3 border border-border rounded-[6px] hover:text-text-1 transition-colors"
          >
            Zacznij od nowa
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- SHARED STYLES ----

const INPUT_CLS = 'w-full bg-bg-1 border border-border rounded-[6px] px-3 py-2 text-[13px] text-text-1 placeholder:text-text-3 focus:outline-none focus:border-accent/50 transition-colors';
const TEXTAREA_CLS = `${INPUT_CLS} resize-vertical`;

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-text-1 mb-1">{label}</label>
      {hint && <p className="text-[11px] text-text-3 mb-2">{hint}</p>}
      {children}
    </div>
  );
}
