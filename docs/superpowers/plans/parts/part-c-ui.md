# Part C: UI + Frontend (Tasks 14-25)

**Project:** `/Users/trading/cyfrowy-pomocnik/`
**Scope:** Root layout, auth pages, onboarding, panel layout, all components, dashboard

---

### Task 14: Root layout + globals.css

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Write `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyfrowy Pomocnik — AI dla Twojej firmy',
  description: 'Poranny brief, aktualności branżowe i centrum dowodzenia dla JDG i małych firm.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Write `src/app/globals.css`**

```css
:root {
  --green: #16a34a;
  --green-dark: #15803d;
  --green-light: #dcfce7;
  --green-bg: #f0fdf4;
  --green-border: #86efac;
  --bg: #f8fffe;
  --border-structural: #111;
  --border-card: #9ca3af;
  --text: #111;
  --text-2: #374151;
  --text-3: #6b7280;
  --text-4: #9ca3af;
  --urgent: #dc2626;
  --warn: #d97706;
  --blue: #1d4ed8;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  height: 100%;
}

body {
  height: 100%;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input,
textarea,
select {
  font-family: inherit;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/layout.tsx src/app/globals.css && git commit -m "feat: root layout and design system globals"
```

---

### Task 15: Landing page

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/app/page.module.css`

- [ ] **Step 1: Write `src/app/page.tsx`**

```tsx
import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.root}>
      {/* Topnav */}
      <nav className={styles.nav}>
        <span className={styles.logo}>
          Cyfrowy <span className={styles.logoAccent}>Pomocnik</span>
        </span>
        <div className={styles.navActions}>
          <Link href="/logowanie" className={styles.navLink}>Zaloguj się</Link>
          <Link href="/rejestracja" className={styles.navBtn}>Zacznij za darmo</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Twój Cyfrowy Pracownik.<br />
            Działa kiedy Ty śpisz.
          </h1>
          <p className={styles.heroSub}>
            Każdego ranka dostajesz gotową listę akcji: przeterminowane faktury,
            okazje dotacyjne, zmiany przepisów i wpisy do kalendarza.
            Zero przeglądania, zero przegapionych terminów.
          </p>
          <div className={styles.heroCtaRow}>
            <Link href="/rejestracja" className={styles.heroCta}>Zacznij bezpłatnie</Link>
            <Link href="/logowanie" className={styles.heroCtaSecondary}>Mam już konto</Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>07:00</div>
          <h3 className={styles.featureTitle}>Poranny Brief</h3>
          <p className={styles.featureDesc}>
            AI generuje listę konkretnych akcji na dziś: co zatwierdzić, co pilne,
            co można poczekać. Wchodzisz na panel i wiesz dokładnie, co robić.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>RSS</div>
          <h3 className={styles.featureTitle}>Aktualności branżowe</h3>
          <p className={styles.featureDesc}>
            Firecrawl monitoruje strony Twojej branży, MF, ZUS, PARP.
            Dostajesz tylko to, co dotyczy Twojej firmy — bez szumu informacyjnego.
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>AI</div>
          <h3 className={styles.featureTitle}>Centrum dowodzenia</h3>
          <p className={styles.featureDesc}>
            Faktury, terminy, marketing, dotacje i prawo w jednym miejscu.
            Siedmiu specjalistycznych agentów AI, jeden interfejs.
          </p>
        </div>
      </section>

      {/* CTA section */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Gotowy na cyfrowego pracownika?</h2>
        <p className={styles.ctaDesc}>
          Bezpłatna rejestracja, bez karty kredytowej. Konfiguracja w 3 minuty.
        </p>
        <Link href="/rejestracja" className={styles.heroCta}>Zacznij bezpłatnie</Link>
      </section>

      <footer className={styles.footer}>
        <span>Cyfrowy Pomocnik &copy; 2025</span>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/page.module.css`**

```css
.root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Nav */
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 56px;
  border-bottom: 2px solid var(--border-structural);
  background: #fff;
  flex-shrink: 0;
}

.logo {
  font-size: 17px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
}

.logoAccent {
  color: var(--green);
}

.navActions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navLink {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-2);
  padding: 6px 12px;
  border-radius: 6px;
  transition: background 0.15s;
}

.navLink:hover {
  background: var(--green-bg);
  color: var(--green-dark);
}

.navBtn {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  padding: 7px 16px;
  border-radius: 7px;
  transition: opacity 0.15s;
}

.navBtn:hover {
  opacity: 0.9;
}

/* Hero */
.hero {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 72px 32px 48px;
  text-align: center;
}

.heroInner {
  max-width: 640px;
}

.heroTitle {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 900;
  line-height: 1.1;
  color: var(--text);
  letter-spacing: -1px;
  margin-bottom: 20px;
}

.heroSub {
  font-size: 17px;
  color: var(--text-2);
  line-height: 1.65;
  margin-bottom: 32px;
}

.heroCtaRow {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.heroCta {
  display: inline-block;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  padding: 12px 28px;
  border-radius: 8px;
  transition: opacity 0.15s, transform 0.1s;
}

.heroCta:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.heroCtaSecondary {
  display: inline-block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-2);
  background: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  border: 1.5px solid var(--border-card);
  transition: border-color 0.15s, background 0.15s;
}

.heroCtaSecondary:hover {
  border-color: var(--green-border);
  background: var(--green-bg);
  color: var(--green-dark);
}

/* Features */
.features {
  display: flex;
  gap: 0;
  border-top: 2px solid var(--border-structural);
  border-bottom: 2px solid var(--border-structural);
}

.featureCard {
  flex: 1;
  padding: 32px 28px;
  border-right: 2px solid var(--border-structural);
  background: #fff;
}

.featureCard:last-child {
  border-right: none;
}

.featureIcon {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  color: var(--green-dark);
  background: var(--green-light);
  border: 1.5px solid var(--green-border);
  border-radius: 6px;
  padding: 4px 10px;
  letter-spacing: 0.5px;
  margin-bottom: 14px;
}

.featureTitle {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 10px;
}

.featureDesc {
  font-size: 14px;
  color: var(--text-3);
  line-height: 1.65;
}

/* CTA section */
.ctaSection {
  padding: 64px 32px;
  text-align: center;
  background: var(--green-bg);
  border-bottom: 2px solid var(--border-structural);
}

.ctaTitle {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 12px;
}

.ctaDesc {
  font-size: 15px;
  color: var(--text-3);
  margin-bottom: 24px;
}

/* Footer */
.footer {
  padding: 16px 32px;
  font-size: 12px;
  color: var(--text-4);
  text-align: center;
  background: #fff;
  border-top: 2px solid var(--border-structural);
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/page.tsx src/app/page.module.css && git commit -m "feat: landing page"
```

---

### Task 16: Logowanie page

**Files:**
- Create: `src/app/logowanie/page.tsx`
- Create: `src/app/logowanie/page.module.css`

- [ ] **Step 1: Write `src/app/logowanie/page.tsx`**

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function LogowanieePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: haslo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Błąd logowania. Spróbuj ponownie.');
      } else {
        router.push('/panel');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.logo}>
          Cyfrowy <span className={styles.logoAccent}>Pomocnik</span>
        </div>
        <h1 className={styles.heading}>Zaloguj się</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Adres e-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="jan@firma.pl"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="haslo" className={styles.label}>Hasło</label>
            <input
              id="haslo"
              type="password"
              autoComplete="current-password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={haslo}
              onChange={e => setHaslo(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Nie masz konta?{' '}
          <Link href="/rejestracja" className={styles.switchA}>Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/logowanie/page.module.css`**

```css
.root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 2px solid var(--border-structural);
  border-radius: 12px;
  padding: 36px 32px 28px;
}

.logo {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
  letter-spacing: -0.2px;
}

.logoAccent {
  color: var(--green);
}

.heading {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.input {
  height: 40px;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.input:focus {
  border-color: var(--green);
  background: #fff;
}

.error {
  font-size: 13px;
  color: var(--urgent);
  background: #fff5f5;
  border: 1.5px solid #fca5a5;
  border-radius: 6px;
  padding: 8px 12px;
}

.btn {
  height: 42px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 4px;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switchLink {
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-3);
  text-align: center;
}

.switchA {
  color: var(--green-dark);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/logowanie/ && git commit -m "feat: logowanie page"
```

---

### Task 17: Rejestracja page

**Files:**
- Create: `src/app/rejestracja/page.tsx`
- Create: `src/app/rejestracja/page.module.css`

- [ ] **Step 1: Write `src/app/rejestracja/page.tsx`**

```tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function RejestracjaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [haslo, setHaslo] = useState('');
  const [haslo2, setHaslo2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (haslo.length < 6) return 'Hasło musi mieć co najmniej 6 znaków.';
    if (haslo !== haslo2) return 'Hasła nie są identyczne.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: haslo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Błąd rejestracji. Spróbuj ponownie.');
      } else {
        router.push('/panel');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.logo}>
          Cyfrowy <span className={styles.logoAccent}>Pomocnik</span>
        </div>
        <h1 className={styles.heading}>Utwórz konto</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Adres e-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className={styles.input}
              placeholder="jan@firma.pl"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="haslo" className={styles.label}>Hasło</label>
            <input
              id="haslo"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              placeholder="Min. 6 znaków"
              value={haslo}
              onChange={e => setHaslo(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="haslo2" className={styles.label}>Powtórz hasło</label>
            <input
              id="haslo2"
              type="password"
              autoComplete="new-password"
              required
              className={styles.input}
              placeholder="••••••••"
              value={haslo2}
              onChange={e => setHaslo2(e.target.value)}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Tworzenie konta...' : 'Utwórz konto'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Masz już konto?{' '}
          <Link href="/logowanie" className={styles.switchA}>Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/rejestracja/page.module.css`**

```css
.root {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 2px solid var(--border-structural);
  border-radius: 12px;
  padding: 36px 32px 28px;
}

.logo {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
  letter-spacing: -0.2px;
}

.logoAccent {
  color: var(--green);
}

.heading {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 24px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.input {
  height: 40px;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.input:focus {
  border-color: var(--green);
  background: #fff;
}

.error {
  font-size: 13px;
  color: var(--urgent);
  background: #fff5f5;
  border: 1.5px solid #fca5a5;
  border-radius: 6px;
  padding: 8px 12px;
}

.btn {
  height: 42px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 4px;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switchLink {
  margin-top: 20px;
  font-size: 13px;
  color: var(--text-3);
  text-align: center;
}

.switchA {
  color: var(--green-dark);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/rejestracja/ && git commit -m "feat: rejestracja page with client-side validation"
```

---

### Task 18: Onboarding wizard

**Files:**
- Create: `src/components/OnboardingWizard.tsx`
- Create: `src/components/OnboardingWizard.module.css`

- [ ] **Step 1: Write `src/components/OnboardingWizard.tsx`**

```tsx
'use client';

import { useState } from 'react';
import styles from './OnboardingWizard.module.css';

const BRANZE = [
  'IT/SaaS',
  'E-commerce',
  'Usługi profesjonalne',
  'Produkcja',
  'Handel detaliczny',
  'Budownictwo',
  'Gastronomia/HoReCa',
  'Marketing/Agencja',
  'Finanse/Księgowość',
  'Inne',
];

const AGENTS = [
  { id: 'ag-00', code: 'AG-00', name: 'Asystent ogólny', desc: 'Routing i pytania ogólne' },
  { id: 'ag-01', code: 'AG-01', name: 'Faktury', desc: 'Przeterminowane płatności, szkice maili' },
  { id: 'ag-02', code: 'AG-02', name: 'Marketing', desc: 'Kalendarz social media, propozycje postów' },
  { id: 'ag-03', code: 'AG-03', name: 'Terminarz', desc: 'Umowy, OC, ZUS, deadliny' },
  { id: 'ag-04', code: 'AG-04', name: 'Dotacje', desc: 'Nabory PARP, BGK, programy regionalne' },
  { id: 'ag-05', code: 'AG-05', name: 'Świadczenia', desc: 'Ulgi i świadczenia ZUS dla JDG' },
  { id: 'ag-06', code: 'AG-06', name: 'Prawo', desc: 'Zmiany przepisów, interpretacje podatkowe' },
];

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);

  // Step 1
  const [nazwa, setNazwa] = useState('');
  const [nip, setNip] = useState('');
  const [branza, setBranza] = useState('');

  // Step 2
  const [opis, setOdpis] = useState('');
  const [wyzwania, setWyzwania] = useState('');

  // Step 3
  const [activeAgents, setActiveAgents] = useState<string[]>(AGENTS.map(a => a.id));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleAgent(id: string) {
    setActiveAgents(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }

  async function handleFinish() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/cp/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nazwa,
          nip: nip || null,
          branza,
          opis,
          pain_points: wyzwania,
          active_agents: activeAgents,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Błąd zapisu danych firmy.');
        return;
      }
      await fetch('/api/cp/brief', { method: 'POST' });
      window.location.reload();
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.wizard}>
        {/* Progress */}
        <div className={styles.progress}>
          <span className={styles.stepLabel}>Krok {step} z 3</span>
          <div className={styles.dots}>
            {[1, 2, 3].map(n => (
              <div
                key={n}
                className={n <= step ? styles.dotActive : styles.dot}
              />
            ))}
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Dane firmy</h2>
            <p className={styles.stepDesc}>Skonfigurujemy agentów pod Twoją działalność.</p>

            <div className={styles.field}>
              <label className={styles.label}>Nazwa firmy *</label>
              <input
                className={styles.input}
                type="text"
                required
                placeholder="np. Kowalski Digital sp. z o.o."
                value={nazwa}
                onChange={e => setNazwa(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>NIP (opcjonalne)</label>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                pattern="[0-9]{10}"
                placeholder="0000000000"
                value={nip}
                onChange={e => setNip(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Branża *</label>
              <select
                className={styles.select}
                value={branza}
                onChange={e => setBranza(e.target.value)}
                required
              >
                <option value="">Wybierz branżę...</option>
                {BRANZE.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <button
              className={styles.nextBtn}
              disabled={!nazwa || !branza}
              onClick={() => setStep(2)}
            >
              Dalej
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Opis działalności</h2>
            <p className={styles.stepDesc}>Im więcej wiesz, tym lepiej agenci dopasują pomoc.</p>

            <div className={styles.field}>
              <label className={styles.label}>Opisz swoją działalność</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Np. Tworzymy oprogramowanie dla firm e-commerce, specjalizujemy się w integracji systemów..."
                value={opis}
                onChange={e => setOdpis(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Główne wyzwania / czego oczekujesz od AI?</label>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="Np. Chcę monitorować konkurencję, pilnować faktur, znajdować dotacje..."
                value={wyzwania}
                onChange={e => setWyzwania(e.target.value)}
              />
            </div>

            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(1)}>Wstecz</button>
              <button className={styles.nextBtn} onClick={() => setStep(3)}>Dalej</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className={styles.stepBody}>
            <h2 className={styles.stepTitle}>Wybierz agentów AI</h2>
            <p className={styles.stepDesc}>Wszyscy aktywni domyślnie. Odznacz tych, których nie potrzebujesz.</p>

            <div className={styles.agentList}>
              {AGENTS.map(agent => (
                <label key={agent.id} className={styles.agentRow}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={activeAgents.includes(agent.id)}
                    onChange={() => toggleAgent(agent.id)}
                  />
                  <div className={styles.agentInfo}>
                    <span className={styles.agentCode}>{agent.code}</span>
                    <span className={styles.agentName}>{agent.name}</span>
                    <span className={styles.agentDesc}>{agent.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(2)}>Wstecz</button>
              <button
                className={styles.nextBtn}
                onClick={handleFinish}
                disabled={submitting || activeAgents.length === 0}
              >
                {submitting ? 'Konfigurowanie...' : 'Zakończ i uruchom'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/OnboardingWizard.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 24px;
}

.wizard {
  background: #fff;
  border: 2px solid var(--border-structural);
  border-radius: 14px;
  width: 100%;
  max-width: 520px;
  overflow: hidden;
}

.progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 2px solid var(--border-structural);
  background: var(--green-bg);
}

.stepLabel {
  font-size: 12px;
  font-weight: 700;
  color: var(--green-dark);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-border);
}

.dotActive {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
}

.stepBody {
  padding: 28px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stepTitle {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.stepDesc {
  font-size: 13px;
  color: var(--text-3);
  margin-top: -8px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

.input {
  height: 40px;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s;
}

.input:focus {
  border-color: var(--green);
  background: #fff;
}

.select {
  height: 40px;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  transition: border-color 0.15s;
  appearance: none;
  cursor: pointer;
}

.select:focus {
  border-color: var(--green);
  background: #fff;
}

.textarea {
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  padding: 10px 12px;
  font-size: 14px;
  color: var(--text);
  background: #fafafa;
  outline: none;
  resize: vertical;
  transition: border-color 0.15s;
  line-height: 1.5;
}

.textarea:focus {
  border-color: var(--green);
  background: #fff;
}

.agentList {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.agentRow {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1.5px solid var(--border-card);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.agentRow:hover {
  background: var(--green-bg);
  border-color: var(--green-border);
}

.checkbox {
  margin-top: 2px;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  accent-color: var(--green);
  cursor: pointer;
}

.agentInfo {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.agentCode {
  font-size: 10px;
  font-weight: 800;
  color: var(--green-dark);
  letter-spacing: 0.8px;
}

.agentName {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.agentDesc {
  font-size: 12px;
  color: var(--text-3);
}

.error {
  font-size: 13px;
  color: var(--urgent);
  background: #fff5f5;
  border: 1.5px solid #fca5a5;
  border-radius: 6px;
  padding: 8px 12px;
}

.btnRow {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.backBtn {
  height: 40px;
  padding: 0 20px;
  background: #fff;
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: background 0.15s;
}

.backBtn:hover {
  background: var(--bg);
}

.nextBtn {
  height: 40px;
  padding: 0 24px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.nextBtn:hover:not(:disabled) {
  opacity: 0.9;
}

.nextBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/OnboardingWizard.tsx src/components/OnboardingWizard.module.css && git commit -m "feat: onboarding wizard 3-step"
```

---

### Task 19: Panel layout (protected)

**Files:**
- Create: `src/app/panel/layout.tsx`
- Create: `src/app/panel/layout.module.css`

- [ ] **Step 1: Write `src/app/panel/layout.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import ChatPanel from '@/components/ChatPanel';
import styles from './layout.module.css';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/logowanie');

  return (
    <div className={styles.panelRoot}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
      <ChatPanel />
    </div>
  );
}
```

- [ ] **Step 2: Write `src/app/panel/layout.module.css`**

```css
.panelRoot {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 2px solid var(--border-structural);
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/app/panel/layout.tsx src/app/panel/layout.module.css && git commit -m "feat: panel layout with auth guard"
```

---

### Task 20: Sidebar component

**Files:**
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Sidebar.module.css`

- [ ] **Step 1: Write `src/components/Sidebar.tsx`**

```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Sidebar.module.css';

type AgentStatus = 'active' | 'urgent' | 'waiting' | 'idle';

interface Agent {
  id: string;
  code: string;
  name: string;
  defaultStatus: AgentStatus;
}

interface HistoryItem {
  id: string;
  title: string;
  date: string;
}

const AGENTS: Agent[] = [
  { id: 'ag-00', code: 'AG-00', name: 'Asystent ogólny', defaultStatus: 'active' },
  { id: 'ag-01', code: 'AG-01', name: 'Faktury', defaultStatus: 'idle' },
  { id: 'ag-02', code: 'AG-02', name: 'Marketing', defaultStatus: 'idle' },
  { id: 'ag-03', code: 'AG-03', name: 'Terminarz', defaultStatus: 'idle' },
  { id: 'ag-04', code: 'AG-04', name: 'Dotacje', defaultStatus: 'idle' },
  { id: 'ag-05', code: 'AG-05', name: 'Świadczenia', defaultStatus: 'idle' },
  { id: 'ag-06', code: 'AG-06', name: 'Prawo', defaultStatus: 'idle' },
];

const DOT_COLORS: Record<AgentStatus, string> = {
  active: '#16a34a',
  urgent: '#dc2626',
  waiting: '#d97706',
  idle: '#d1d5db',
};

export default function Sidebar() {
  const [activeAgentId, setActiveAgentId] = useState<string>('ag-00');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('cp_history');
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[];
        setHistory(parsed.slice(0, 5));
      }
    } catch {
      // ignore malformed data
    }
  }, []);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoRow}>
        <span className={styles.logo}>
          Cyfrowy <span className={styles.logoAccent}>Pomocnik</span>
        </span>
      </div>

      <button
        className={styles.newChatBtn}
        onClick={() => {
          setActiveAgentId('ag-00');
          window.dispatchEvent(new CustomEvent('cp:new-chat'));
        }}
      >
        + Nowa rozmowa
      </button>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>Agenci AI</div>
        {AGENTS.map(agent => (
          <button
            key={agent.id}
            className={activeAgentId === agent.id ? styles.agentItemActive : styles.agentItem}
            onClick={() => {
              setActiveAgentId(agent.id);
              window.dispatchEvent(new CustomEvent('cp:select-agent', { detail: agent.id }));
            }}
          >
            <span
              className={styles.agentDot}
              style={{ background: DOT_COLORS[agent.defaultStatus] }}
            />
            <span className={styles.agentCode}>{agent.code}</span>
            <span className={styles.agentName}>{agent.name}</span>
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Historia</div>
          {history.map(item => (
            <div key={item.id} className={styles.historyItem}>
              <span className={styles.historyTitle}>{item.title}</span>
              <span className={styles.historyDate}>{item.date}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <Link href="/" className={styles.backLink}>
          &larr; Wróć na stronę
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Write `src/components/Sidebar.module.css`**

```css
.sidebar {
  width: 224px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: linear-gradient(180deg, #fff 0%, var(--bg) 100%);
  border-right: 2px solid var(--border-structural);
}

.logoRow {
  padding: 14px 14px 10px;
  border-bottom: 2px solid var(--border-structural);
  flex-shrink: 0;
}

.logo {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.2px;
}

.logoAccent {
  color: var(--green);
}

.newChatBtn {
  margin: 10px 10px 4px;
  padding: 8px 12px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  width: calc(100% - 20px);
  text-align: left;
  transition: opacity 0.15s;
}

.newChatBtn:hover {
  opacity: 0.9;
}

.section {
  padding: 6px 0;
  border-bottom: 1.5px solid #f3f4f6;
}

.sectionLabel {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-4);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 6px 14px 3px;
}

.agentItem {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 14px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  border-radius: 0;
  transition: background 0.12s;
}

.agentItem:hover {
  background: var(--green-bg);
}

.agentItemActive {
  display: flex;
  align-items: center;
  gap: 7px;
  width: 100%;
  padding: 7px 14px;
  background: var(--green-bg);
  border: none;
  border-left: 3px solid var(--green);
  cursor: pointer;
  text-align: left;
  border-radius: 0;
}

.agentDot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.agentCode {
  font-size: 9px;
  font-weight: 800;
  color: var(--text-4);
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.agentName {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.historyItem {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 6px 14px;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.12s;
}

.historyItem:hover {
  background: var(--bg);
}

.historyTitle {
  font-size: 12px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.historyDate {
  font-size: 10px;
  color: var(--text-4);
}

.footer {
  margin-top: auto;
  padding: 12px 14px;
  border-top: 1.5px solid #f3f4f6;
  flex-shrink: 0;
}

.backLink {
  font-size: 12px;
  color: var(--text-3);
  display: inline-block;
  transition: color 0.12s;
}

.backLink:hover {
  color: var(--green-dark);
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/Sidebar.tsx src/components/Sidebar.module.css && git commit -m "feat: sidebar with agent list and history"
```

---

### Task 21: BriefBar component

**Files:**
- Create: `src/components/BriefBar.tsx`
- Create: `src/components/BriefBar.module.css`

- [ ] **Step 1: Write `src/components/BriefBar.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import styles from './BriefBar.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface Props {
  actions: ActionItem[];
}

function formatDate(d: Date): string {
  const days = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  const months = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export default function BriefBar({ actions }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const urgent = actions.filter(a => a.priority === 'urgent');
  const warn = actions.filter(a => a.priority === 'warn');
  const info = actions.filter(a => a.priority === 'info');

  return (
    <div className={styles.bar}>
      <span className={styles.label}>BRIEF</span>

      {urgent.length > 0 && (
        <div className={styles.pill}>
          <span className={styles.dot} style={{ background: '#dc2626' }} />
          <span>
            {urgent.length > 1
              ? `${urgent.length} pilnych akcji`
              : urgent[0].title}
          </span>
        </div>
      )}

      {warn.length > 0 && (
        <div className={styles.pill}>
          <span className={styles.dot} style={{ background: '#d97706' }} />
          <span>
            {warn.length > 1
              ? `${warn.length} ważnych`
              : warn[0].title}
          </span>
        </div>
      )}

      {info.length > 0 && (
        <div className={styles.pill}>
          <span className={styles.dot} style={{ background: '#16a34a' }} />
          <span>{info.length} informacji</span>
        </div>
      )}

      {urgent.length === 0 && warn.length === 0 && info.length === 0 && (
        <div className={styles.pill}>
          <span className={styles.dot} style={{ background: '#d1d5db' }} />
          <span>Brak nowych akcji</span>
        </div>
      )}

      <div className={styles.spacer} />
      <div className={styles.datetime}>
        <span className={styles.date}>{formatDate(now)}</span>
        <span className={styles.time}>{formatTime(now)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/BriefBar.module.css`**

```css
.bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: #fff;
  border-bottom: 2px solid var(--border-structural);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-4);
  letter-spacing: 1.2px;
  margin-right: 4px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 500;
  color: var(--text);
  background: #f9fafb;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  padding: 3px 9px;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}

.pill:hover {
  background: var(--green-bg);
  border-color: var(--green-border);
}

.dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.spacer {
  flex: 1;
}

.datetime {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.date {
  font-size: 11px;
  color: var(--text-3);
  font-weight: 500;
}

.time {
  font-size: 13px;
  color: var(--text);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/BriefBar.tsx src/components/BriefBar.module.css && git commit -m "feat: BriefBar with priority pills and live clock"
```

---

### Task 22: ActionCard component

**Files:**
- Create: `src/components/ActionCard.tsx`
- Create: `src/components/ActionCard.module.css`

- [ ] **Step 1: Write `src/components/ActionCard.tsx`**

```tsx
'use client';

import { useState } from 'react';
import styles from './ActionCard.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface Props {
  action: ActionItem;
  onStatusChange: (id: string, status: 'approved' | 'dismissed') => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'teraz';
  if (m < 60) return `${m}m temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h temu`;
  return `${Math.floor(h / 24)}d temu`;
}

const PRIORITY_STYLES: Record<string, { border: string; gradient: string }> = {
  urgent: {
    border: '#dc2626',
    gradient: 'linear-gradient(135deg, #fff 60%, #fff5f5)',
  },
  warn: {
    border: '#d97706',
    gradient: 'linear-gradient(135deg, #fff 60%, #fffbf0)',
  },
  info: {
    border: '#16a34a',
    gradient: 'linear-gradient(135deg, #fff 60%, #f0fdf4)',
  },
  running: {
    border: '#16a34a',
    gradient: '#f0fdf4',
  },
};

function TagBadge({ priority, type }: { priority: string; type: string }) {
  if (priority === 'urgent') {
    return <span className={`${styles.tag} ${styles.tagUrgent}`}>PILNE</span>;
  }
  if (priority === 'warn') {
    return <span className={`${styles.tag} ${styles.tagWarn}`}>UWAGA</span>;
  }
  if (priority === 'running') {
    return <span className={`${styles.tag} ${styles.tagRunning}`}>AGENT DZIALA</span>;
  }
  // info — derive from type
  const label = type === 'marketing'
    ? 'MARKETING'
    : type === 'dotacje'
    ? 'DOTACJE'
    : 'OGOLNY';
  return <span className={`${styles.tag} ${styles.tagInfo}`}>{label}</span>;
}

export default function ActionCard({ action, onStatusChange }: Props) {
  const [loading, setLoading] = useState<'approved' | 'dismissed' | null>(null);
  const ps = PRIORITY_STYLES[action.priority] ?? PRIORITY_STYLES.info;

  async function handleAction(newStatus: 'approved' | 'dismissed') {
    setLoading(newStatus);
    try {
      await fetch(`/api/cp/actions/${action.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onStatusChange(action.id, newStatus);
    } catch {
      setLoading(null);
    }
  }

  return (
    <div
      className={styles.card}
      style={{
        borderLeft: `3px solid ${ps.border}`,
        background: ps.gradient,
      }}
    >
      <div className={styles.topRow}>
        <TagBadge priority={action.priority} type={action.type} />
        <span className={styles.timeAgo}>{timeAgo(action.created_at)}</span>
      </div>
      <p className={styles.title}>{action.title}</p>
      <p className={styles.desc}>{action.description}</p>
      <div className={styles.btnRow}>
        <button
          className={styles.approveBtn}
          disabled={loading !== null}
          onClick={() => handleAction('approved')}
        >
          {loading === 'approved' ? 'Zatwierdzanie...' : 'Zatwierdź →'}
        </button>
        <button
          className={styles.dismissBtn}
          disabled={loading !== null}
          onClick={() => handleAction('dismissed')}
        >
          Odrzuć
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/ActionCard.module.css`**

```css
.card {
  border: 1.5px solid var(--border-card);
  border-radius: 9px;
  padding: 12px 14px;
  margin-bottom: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.topRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tag {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  border-radius: 4px;
  padding: 2px 7px;
}

.tagUrgent {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.tagWarn {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.tagInfo {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #93c5fd;
}

.tagRunning {
  background: var(--green-light);
  color: var(--green-dark);
  border: 1px solid var(--green-border);
}

.timeAgo {
  font-size: 10px;
  color: var(--text-4);
}

.title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}

.desc {
  font-size: 12px;
  color: var(--text-3);
  line-height: 1.5;
}

.btnRow {
  display: flex;
  gap: 7px;
  margin-top: 4px;
}

.approveBtn {
  flex: 1;
  height: 32px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s;
}

.approveBtn:hover:not(:disabled) {
  opacity: 0.9;
}

.approveBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.dismissBtn {
  height: 32px;
  padding: 0 14px;
  background: #fff;
  color: var(--text-3);
  font-size: 12px;
  font-weight: 600;
  border: 1.5px solid var(--border-card);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.dismissBtn:hover:not(:disabled) {
  background: #f9fafb;
  color: var(--text);
}

.dismissBtn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/ActionCard.tsx src/components/ActionCard.module.css && git commit -m "feat: ActionCard with approve/dismiss and optimistic feedback"
```

---

### Task 23: NewsItem + CalendarItem components

**Files:**
- Create: `src/components/NewsItem.tsx`
- Create: `src/components/NewsItem.module.css`
- Create: `src/components/CalendarItem.tsx`
- Create: `src/components/CalendarItem.module.css`

- [ ] **Step 1: Write `src/components/NewsItem.tsx`**

```tsx
'use client';

import styles from './NewsItem.module.css';

interface NewsItemData {
  id: string;
  source: string;
  title: string;
  url: string | null;
  relevance_tags: string[];
  scraped_at: string;
}

interface Props {
  item: NewsItemData;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'teraz';
  if (m < 60) return `${m}m temu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h temu`;
  return `${Math.floor(h / 24)}d temu`;
}

export default function NewsItem({ item }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span className={styles.source}>{item.source.toUpperCase()}</span>
        <span className={styles.time}>{timeAgo(item.scraped_at)}</span>
      </div>

      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.titleLink}
        >
          {item.title}
        </a>
      ) : (
        <p className={styles.title}>{item.title}</p>
      )}

      {item.relevance_tags.length > 0 && (
        <div className={styles.tags}>
          {item.relevance_tags.slice(0, 2).map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/NewsItem.module.css`**

```css
.card {
  border: 1.5px solid var(--border-card);
  border-radius: 8px;
  padding: 11px 13px;
  margin-bottom: 7px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 5px;
  transition: border-color 0.12s;
}

.card:hover {
  border-color: var(--green-border);
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.source {
  font-size: 9px;
  font-weight: 800;
  color: var(--green-dark);
  letter-spacing: 0.8px;
}

.time {
  font-size: 10px;
  color: var(--text-4);
}

.titleLink {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  text-decoration: none;
  transition: color 0.12s;
}

.titleLink:hover {
  color: var(--green-dark);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
}

.tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.tag {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-3);
  background: var(--bg);
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 1px 6px;
}
```

- [ ] **Step 3: Write `src/components/CalendarItem.tsx`**

```tsx
'use client';

import styles from './CalendarItem.module.css';

interface ReminderData {
  id: string;
  title: string;
  due_date: string;
  type: string;
  status: string;
}

interface Props {
  reminder: ReminderData;
}

const MONTHS = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

function Badge({ type }: { type: string }) {
  if (type === 'zus') return <span className={`${styles.badge} ${styles.badgeZus}`}>ZUS</span>;
  if (type === 'oc') return <span className={`${styles.badge} ${styles.badgeOc}`}>OC</span>;
  if (type === 'ai') return <span className={`${styles.badge} ${styles.badgeAi}`}>AI</span>;
  return <span className={`${styles.badge} ${styles.badgeOther}`}>!</span>;
}

export default function CalendarItem({ reminder }: Props) {
  const d = new Date(reminder.due_date);
  const day = d.getUTCDate();
  const month = MONTHS[d.getUTCMonth()];

  return (
    <div className={styles.card}>
      <div className={styles.dateBox}>
        <span className={styles.day}>{day}</span>
        <span className={styles.month}>{month}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.topRow}>
          <p className={styles.title}>{reminder.title}</p>
          <Badge type={reminder.type} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Write `src/components/CalendarItem.module.css`**

```css
.card {
  display: flex;
  gap: 10px;
  border: 1.5px solid var(--border-card);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 7px;
  background: #fff;
  align-items: center;
  transition: border-color 0.12s;
}

.card:hover {
  border-color: var(--green-border);
}

.dateBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 38px;
}

.day {
  font-size: 22px;
  font-weight: 900;
  color: var(--green);
  line-height: 1;
}

.month {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.content {
  flex: 1;
  min-width: 0;
}

.topRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}

.title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.35;
  flex: 1;
}

.badge {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-radius: 4px;
  padding: 2px 6px;
  flex-shrink: 0;
}

.badgeZus {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.badgeOc {
  background: #faf5ff;
  color: #7c3aed;
  border: 1px solid #c4b5fd;
}

.badgeAi {
  background: var(--green-light);
  color: var(--green-dark);
  border: 1px solid var(--green-border);
}

.badgeOther {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}
```

- [ ] **Step 5: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**
```bash
git add src/components/NewsItem.tsx src/components/NewsItem.module.css src/components/CalendarItem.tsx src/components/CalendarItem.module.css && git commit -m "feat: NewsItem and CalendarItem components"
```

---

### Task 24: ChatPanel component

**Files:**
- Create: `src/components/ChatPanel.tsx`
- Create: `src/components/ChatPanel.module.css`

- [ ] **Step 1: Write `src/components/ChatPanel.tsx`**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatPanel.module.css';

type AgentId = 'ag-00' | 'ag-01' | 'ag-02' | 'ag-03' | 'ag-04' | 'ag-05' | 'ag-06';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AGENT_LABELS: Record<AgentId, string> = {
  'ag-00': 'Asystent ogólny',
  'ag-01': 'Faktury',
  'ag-02': 'Marketing',
  'ag-03': 'Terminarz',
  'ag-04': 'Dotacje',
  'ag-05': 'Świadczenia',
  'ag-06': 'Prawo',
};

const QUICK_CHIPS: { label: string; agentId: AgentId; text: string }[] = [
  { label: 'Przeterminowane faktury', agentId: 'ag-01', text: 'Pokaż przeterminowane faktury' },
  { label: 'Mail do klienta', agentId: 'ag-00', text: 'Napisz mail do klienta' },
  { label: 'Dotacje dla mnie', agentId: 'ag-04', text: 'Jakie dotacje mi pasują?' },
  { label: 'Post LinkedIn', agentId: 'ag-02', text: 'Przygotuj post na LinkedIn' },
  { label: 'Terminy ZUS', agentId: 'ag-03', text: 'Pilnuj moich terminów ZUS' },
];

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentId>('ag-00');
  const [agentLabel, setAgentLabel] = useState<string>('Asystent ogólny');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleSelectAgent(e: Event) {
      const id = (e as CustomEvent<string>).detail as AgentId;
      if (id in AGENT_LABELS) {
        setActiveAgent(id);
        setAgentLabel(AGENT_LABELS[id]);
      }
    }
    function handleNewChat() {
      setMessages([]);
      setActiveAgent('ag-00');
      setAgentLabel('Asystent ogólny');
    }
    window.addEventListener('cp:select-agent', handleSelectAgent);
    window.addEventListener('cp:new-chat', handleNewChat);
    return () => {
      window.removeEventListener('cp:select-agent', handleSelectAgent);
      window.removeEventListener('cp:new-chat', handleNewChat);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text: string, overrideAgent?: AgentId) {
    const agent = overrideAgent ?? activeAgent;
    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    const assistantPlaceholder: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantPlaceholder]);

    try {
      const res = await fetch('/api/cp/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          agentId: agent,
        }),
      });

      if (!res.body) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: 'Brak odpowiedzi z serwera.' };
          return updated;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const { text: chunk } = JSON.parse(line.slice(6)) as { text: string };
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, content: last.content + chunk };
                return updated;
              });
            } catch {
              // skip malformed chunk
            }
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: 'Błąd połączenia z agentem.' };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !streaming) {
        sendMessage(input.trim());
      }
    }
  }

  return (
    <aside className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.agentDot} />
          <span className={styles.agentName}>{agentLabel}</span>
        </div>
        <span className={styles.agentId}>{activeAgent.toUpperCase()}</span>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.welcome}>
            <p className={styles.welcomeTitle}>Jak mogę pomóc?</p>
            <p className={styles.welcomeSub}>Szybkie akcje:</p>
            <div className={styles.chips}>
              {QUICK_CHIPS.map(chip => (
                <button
                  key={chip.label}
                  className={styles.chip}
                  onClick={() => {
                    setActiveAgent(chip.agentId);
                    setAgentLabel(AGENT_LABELS[chip.agentId]);
                    sendMessage(chip.text, chip.agentId);
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? styles.msgUser : styles.msgAssistant}
          >
            {msg.content || (streaming && i === messages.length - 1 ? '...' : '')}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        Twoje dane nie są zapisywane na serwerze. Każda rozmowa znika po zamknięciu karty.
      </div>

      {/* Attachment bar */}
      <div className={styles.attachBar}>
        <button className={styles.attachBtn}>+ Faktura</button>
        <button className={styles.attachBtn}>+ Dokument</button>
        <button className={styles.attachBtn}>+ Profil firmy</button>
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          placeholder="Napisz do agenta..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={streaming}
        />
        <button
          className={styles.sendBtn}
          disabled={!input.trim() || streaming}
          onClick={() => sendMessage(input.trim())}
        >
          {streaming ? '...' : '→'}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Write `src/components/ChatPanel.module.css`**

```css
.panel {
  width: 340px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-left: 2px solid var(--border-structural);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 2px solid var(--border-structural);
  flex-shrink: 0;
  background: linear-gradient(180deg, #fff 0%, var(--green-bg) 100%);
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 7px;
}

.agentDot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
}

.agentName {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.agentId {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-4);
  letter-spacing: 0.5px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.messages::-webkit-scrollbar {
  width: 3px;
}

.messages::-webkit-scrollbar-thumb {
  background: var(--border-card);
  border-radius: 2px;
}

.welcome {
  padding: 8px 4px;
}

.welcomeTitle {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}

.welcomeSub {
  font-size: 11px;
  color: var(--text-3);
  margin-bottom: 10px;
}

.chips {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.chip {
  padding: 7px 11px;
  background: var(--bg);
  border: 1.5px solid var(--border-card);
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.chip:hover {
  background: var(--green-bg);
  border-color: var(--green-border);
  color: var(--green-dark);
}

.msgUser {
  align-self: flex-end;
  background: var(--green);
  color: #fff;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 10px 10px 2px 10px;
  max-width: 85%;
  line-height: 1.45;
  word-break: break-word;
}

.msgAssistant {
  align-self: flex-start;
  background: var(--bg);
  border: 1.5px solid var(--border-card);
  color: var(--text);
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 10px 10px 10px 2px;
  max-width: 90%;
  line-height: 1.45;
  word-break: break-word;
  white-space: pre-wrap;
}

.disclaimer {
  font-size: 10px;
  color: var(--text-4);
  padding: 4px 12px;
  text-align: center;
  flex-shrink: 0;
  border-top: 1px solid #f3f4f6;
}

.attachBar {
  display: flex;
  gap: 5px;
  padding: 6px 10px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.attachBtn {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-3);
  background: var(--bg);
  border: 1px solid #e5e7eb;
  border-radius: 5px;
  padding: 3px 8px;
  cursor: pointer;
  transition: background 0.12s;
}

.attachBtn:hover {
  background: var(--green-bg);
  color: var(--green-dark);
  border-color: var(--green-border);
}

.inputRow {
  display: flex;
  gap: 6px;
  padding: 8px 10px 10px;
  border-top: 2px solid var(--border-structural);
  flex-shrink: 0;
  align-items: flex-end;
}

.input {
  flex: 1;
  border: 1.5px solid var(--border-card);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 13px;
  color: var(--text);
  background: var(--bg);
  resize: none;
  outline: none;
  transition: border-color 0.15s;
  line-height: 1.4;
}

.input:focus {
  border-color: var(--green);
  background: #fff;
}

.input:disabled {
  opacity: 0.6;
}

.sendBtn {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}

.sendBtn:hover:not(:disabled) {
  opacity: 0.9;
}

.sendBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**
```bash
git add src/components/ChatPanel.tsx src/components/ChatPanel.module.css && git commit -m "feat: ChatPanel with streaming and quick chips"
```

---

### Task 25: Main dashboard page

**Files:**
- Create: `src/app/panel/page.tsx`
- Create: `src/app/panel/page.module.css`
- Create: `src/components/DashboardClient.tsx`

- [ ] **Step 1: Write `src/components/DashboardClient.tsx`**

```tsx
'use client';

import { useState } from 'react';
import ActionCard from './ActionCard';
import styles from '../app/panel/page.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface Props {
  initialActions: ActionItem[];
}

export default function DashboardClient({ initialActions }: Props) {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);

  function handleStatusChange(id: string, status: 'approved' | 'dismissed') {
    setActions(prev => prev.filter(a => a.id !== id));
  }

  return (
    <>
      {actions.map(action => (
        <ActionCard
          key={action.id}
          action={action}
          onStatusChange={handleStatusChange}
        />
      ))}
      {actions.length === 0 && (
        <div className={styles.emptyCol}>
          <span className={styles.emptyIcon}>✓</span>
          <p className={styles.emptyText}>Wszystko zatwierdzone</p>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Write `src/app/panel/page.tsx`**

```tsx
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase';
import OnboardingWizard from '@/components/OnboardingWizard';
import BriefBar from '@/components/BriefBar';
import DashboardClient from '@/components/DashboardClient';
import NewsItem from '@/components/NewsItem';
import CalendarItem from '@/components/CalendarItem';
import styles from './page.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface NewsItemData {
  id: string;
  source: string;
  title: string;
  url: string | null;
  relevance_tags: string[];
  scraped_at: string;
}

interface ReminderData {
  id: string;
  title: string;
  due_date: string;
  type: string;
  status: string;
}

export default async function PanelPage() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/logowanie');

  const { data: company } = await supabase
    .from('cp_companies')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!company) {
    return <OnboardingWizard />;
  }

  const { data: actionsRaw } = await supabase
    .from('cp_action_items')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: newsRaw } = await supabase
    .from('cp_news_items')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('scraped_at', new Date(Date.now() - 86400000).toISOString())
    .order('scraped_at', { ascending: false })
    .limit(10);

  const { data: remindersRaw } = await supabase
    .from('cp_reminders')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .lte('due_date', new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
    .order('due_date', { ascending: true })
    .limit(10);

  const actions = (actionsRaw ?? []) as ActionItem[];
  const news = (newsRaw ?? []) as NewsItemData[];
  const reminders = (remindersRaw ?? []) as ReminderData[];

  return (
    <>
      <BriefBar actions={actions} />
      <div className={styles.columns}>
        <div className={styles.col}>
          <div className={styles.colHeader}>
            Akcje do zatwierdzenia
            <span className={styles.colCount}>{actions.length}</span>
          </div>
          <div className={styles.colBody}>
            <DashboardClient initialActions={actions} />
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.colHeader}>
            Aktualności branżowe
            <span className={styles.colCount}>{news.length}</span>
          </div>
          <div className={styles.colBody}>
            {news.map(item => (
              <NewsItem key={item.id} item={item} />
            ))}
            {news.length === 0 && (
              <div className={styles.emptyCol}>
                <p className={styles.emptyText}>Brak nowych aktualności</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.col}>
          <div className={styles.colHeader}>
            Kalendarz AI
            <span className={styles.colCount}>{reminders.length}</span>
          </div>
          <div className={styles.colBody}>
            {reminders.map(r => (
              <CalendarItem key={r.id} reminder={r} />
            ))}
            {reminders.length === 0 && (
              <div className={styles.emptyCol}>
                <p className={styles.emptyText}>Brak terminów w ciągu 30 dni</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Write `src/app/panel/page.module.css`**

```css
.columns {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.col {
  flex: 1;
  border-right: 2px solid var(--border-structural);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.col:last-child {
  border-right: none;
}

.colHeader {
  padding: 9px 14px 8px;
  border-bottom: 2px solid var(--border-structural);
  font-size: 11px;
  font-weight: 800;
  color: var(--text-2);
  text-transform: uppercase;
  letter-spacing: 1px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, #fff 0%, #f9fafb 100%);
}

.colCount {
  background: var(--border-structural);
  border-radius: 10px;
  padding: 1px 8px;
  font-size: 10px;
  color: #fff;
  font-weight: 700;
}

.colBody {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: var(--bg);
}

.colBody::-webkit-scrollbar {
  width: 3px;
}

.colBody::-webkit-scrollbar-thumb {
  background: var(--border-card);
  border-radius: 2px;
}

.emptyCol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 6px;
  color: var(--text-4);
}

.emptyIcon {
  font-size: 20px;
  color: var(--green);
}

.emptyText {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-4);
  text-align: center;
}
```

- [ ] **Step 4: Fix `DashboardClient.tsx` import path**

The `DashboardClient.tsx` in `src/components/` references `'../app/panel/page.module.css'` which is a cross-boundary import. Move the empty state styles inline or extract shared styles. Replace the import in `DashboardClient.tsx` with a local module.

Create `src/components/DashboardClient.module.css`:

```css
.emptyCol {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  gap: 6px;
}

.emptyIcon {
  font-size: 20px;
  color: var(--green);
}

.emptyText {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-4);
  text-align: center;
}
```

Update `src/components/DashboardClient.tsx` to use `./DashboardClient.module.css` instead:

```tsx
'use client';

import { useState } from 'react';
import ActionCard from './ActionCard';
import styles from './DashboardClient.module.css';

interface ActionItem {
  id: string;
  type: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface Props {
  initialActions: ActionItem[];
}

export default function DashboardClient({ initialActions }: Props) {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);

  function handleStatusChange(id: string, _status: 'approved' | 'dismissed') {
    setActions(prev => prev.filter(a => a.id !== id));
  }

  return (
    <>
      {actions.map(action => (
        <ActionCard
          key={action.id}
          action={action}
          onStatusChange={handleStatusChange}
        />
      ))}
      {actions.length === 0 && (
        <div className={styles.emptyCol}>
          <span className={styles.emptyIcon}>&#10003;</span>
          <p className={styles.emptyText}>Wszystko zatwierdzone</p>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 5: Verify types**
Run: `cd /Users/trading/cyfrowy-pomocnik && npx tsc --noEmit`
Expected: no errors

- [ ] **Step 6: Commit**
```bash
git add src/app/panel/page.tsx src/app/panel/page.module.css src/components/DashboardClient.tsx src/components/DashboardClient.module.css && git commit -m "feat: dashboard page with 3-column layout and server-side data fetching"
```
