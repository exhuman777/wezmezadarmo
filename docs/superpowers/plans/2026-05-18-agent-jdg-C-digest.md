# Agent JDG/Prywatny -- Plan C: Digest System (Builder + Email + Cron)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dzienny e-mail digest: builder agregujacy dane, template HTML, endpoint cron, aktualizacja vercel.json i nawigacji.

**Architecture:** `src/lib/digest.ts` buduje payload (RSS + swiadczenia). `src/emails/digest.html.ts` generuje HTML. `src/app/api/digest/route.ts` odpala cron Vercel i wysyla przez Resend. Cron trigger: `0 6 * * *` (8:00 PL).

**Tech Stack:** Resend SDK, Supabase service role, fetchFeeds() z src/app/aktualnosci/rss.ts, matchBenefits() z src/engine/matcher.ts

**Wymaga:** Plan A i Plan B ukonczone.

**Spec:** `docs/superpowers/specs/2026-05-18-agent-jdg-prywatny-design.md`

---

### Task 1: Digest builder (src/lib/digest.ts)

**Files:**
- Create: `src/lib/digest.ts`
- Create: `src/lib/__tests__/digest.test.ts`

- [ ] **Krok 1: Napisz testy (powinny nie przejsc)**

```typescript
// src/lib/__tests__/digest.test.ts
import { filterRecentItems, buildPrivateDigestPayload, buildJdgDigestPayload } from '../digest';

const NOW = new Date('2026-05-18T08:00:00Z');
const YESTERDAY = new Date('2026-05-17T10:00:00Z').toISOString();
const OLD = new Date('2026-05-16T10:00:00Z').toISOString();

const makeItem = (id: string, pubDate: string | null) => ({
  id, title: `Tytul ${id}`, link: `https://example.com/${id}`,
  description: 'opis', pubDate, source: 'ZUS', sourceId: 'zus',
  audiences: ['wszyscy' as const],
});

describe('filterRecentItems', () => {
  it('zwraca tylko items z ostatnich 24h', () => {
    const items = [makeItem('a', YESTERDAY), makeItem('b', OLD), makeItem('c', null)];
    const result = filterRecentItems(items, NOW);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('zwraca pusty array gdy brak nowych', () => {
    const result = filterRecentItems([makeItem('x', OLD)], NOW);
    expect(result).toHaveLength(0);
  });
});

describe('buildPrivateDigestPayload', () => {
  it('zwraca payload z rssItems i benefits', () => {
    const items = [makeItem('a', YESTERDAY)];
    const benefits = [
      { benefit: { id: '800-plus', nazwa: 'Swiadczenie 800+', kategoria: 'RODZINA', kwota: '800 PLN/mies.', zrodloUrl: 'https://gov.pl' }, status: 'PRZYSLUGUJE' as const, confidence: 'WYSOKA' as const, matchedCriteria: ['Ma dzieci'], failedCriteria: [], warnings: [] },
    ];
    const payload = buildPrivateDigestPayload('jan@test.pl', items, benefits);
    expect(payload.to).toBe('jan@test.pl');
    expect(payload.rssItems).toHaveLength(1);
    expect(payload.benefits).toHaveLength(1);
    expect(payload.hasContent).toBe(true);
  });

  it('hasContent false gdy brak items i benefits', () => {
    const payload = buildPrivateDigestPayload('jan@test.pl', [], []);
    expect(payload.hasContent).toBe(false);
  });
});

describe('buildJdgDigestPayload', () => {
  it('zwraca payload z rssItems dla JDG', () => {
    const items = [makeItem('a', YESTERDAY)];
    const payload = buildJdgDigestPayload('firma@test.pl', 'Kowalski JDG', items);
    expect(payload.to).toBe('firma@test.pl');
    expect(payload.rssItems).toHaveLength(1);
    expect(payload.companyName).toBe('Kowalski JDG');
    expect(payload.hasContent).toBe(true);
  });
});
```

- [ ] **Krok 2: Uruchom test -- powinien FAIL**

```bash
npx jest src/lib/__tests__/digest.test.ts --no-coverage
```

Oczekiwany wynik: `Cannot find module '../digest'`.

- [ ] **Krok 3: Implementuj src/lib/digest.ts**

```typescript
// src/lib/digest.ts
import type { FeedItem } from '@/app/aktualnosci/rss';
import type { MatchResult } from '@/engine/types';

export interface DigestPayload {
  to: string;
  hasContent: boolean;
  rssItems: FeedItem[];
  benefits: MatchResult[];
  companyName?: string;
  date: string;
}

/**
 * Filtruje FeedItem do tych opublikowanych w ciagu ostatnich 24h od `now`.
 * Items bez pubDate sa pomijane.
 */
export function filterRecentItems(items: FeedItem[], now: Date = new Date()): FeedItem[] {
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return items.filter(item => {
    if (!item.pubDate) return false;
    const d = new Date(item.pubDate);
    return !isNaN(d.getTime()) && d >= cutoff;
  });
}

/**
 * Buduje payload digestu dla osoby prywatnej.
 * benefits: wynik matchBenefits() przefiltrowany do PRZYSLUGUJE + MOZLIWE, max 5.
 * rssItems: juz przefiltrowane przez filterRecentItems(), max 8.
 */
export function buildPrivateDigestPayload(
  email: string,
  rssItems: FeedItem[],
  benefits: MatchResult[],
): DigestPayload {
  const topBenefits = benefits
    .filter(r => r.status === 'PRZYSLUGUJE' || r.status === 'MOZLIWE')
    .slice(0, 5);
  const topRss = rssItems.slice(0, 8);

  return {
    to: email,
    hasContent: topRss.length > 0 || topBenefits.length > 0,
    rssItems: topRss,
    benefits: topBenefits,
    date: new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

/**
 * Buduje payload digestu dla JDG.
 * Brak sekcji swiadczen -- tylko RSS przefiltrowane do audytorium jdg/wszyscy.
 */
export function buildJdgDigestPayload(
  email: string,
  companyName: string,
  rssItems: FeedItem[],
): DigestPayload {
  const topRss = rssItems
    .filter(item => item.audiences.includes('wszyscy') || item.audiences.includes('jdg'))
    .slice(0, 8);

  return {
    to: email,
    hasContent: topRss.length > 0,
    rssItems: topRss,
    benefits: [],
    companyName,
    date: new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}
```

- [ ] **Krok 4: Uruchom testy -- powinny PASS**

```bash
npx jest src/lib/__tests__/digest.test.ts --no-coverage
```

Oczekiwany wynik: `6 passed`.

- [ ] **Krok 5: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/lib/digest.ts src/lib/__tests__/digest.test.ts
git commit -m "feat: digest builder -- filterRecentItems, buildPrivateDigestPayload, buildJdgDigestPayload"
```

---

### Task 2: Email template (src/emails/digest.html.ts)

**Files:**
- Create: `src/emails/digest.html.ts`

- [ ] **Krok 1: Sprawdz czy katalog istnieje**

```bash
mkdir -p src/emails
```

- [ ] **Krok 2: Napisz test**

```typescript
// src/emails/__tests__/digest.html.test.ts
import { buildDigestHtml } from '../digest.html';

const BASE_PAYLOAD = {
  to: 'jan@test.pl',
  hasContent: true,
  rssItems: [{
    id: 'a', title: 'Nowe stawki ZUS 2026', link: 'https://zus.pl/artykul',
    description: 'opis', pubDate: '2026-05-17T10:00:00Z',
    source: 'ZUS', sourceId: 'zus', audiences: ['wszyscy' as const],
  }],
  benefits: [],
  date: '17 maja 2026',
};

describe('buildDigestHtml', () => {
  it('zawiera tytul RSS w HTML', () => {
    const html = buildDigestHtml(BASE_PAYLOAD);
    expect(html).toContain('Nowe stawki ZUS 2026');
    expect(html).toContain('https://zus.pl/artykul');
  });

  it('zawiera date', () => {
    const html = buildDigestHtml(BASE_PAYLOAD);
    expect(html).toContain('17 maja 2026');
  });

  it('zawiera swiadczenie gdy dostarczone', () => {
    const payload = {
      ...BASE_PAYLOAD,
      benefits: [{
        benefit: { id: '800-plus', nazwa: 'Swiadczenie 800+', kategoria: 'RODZINA', kwota: '800 PLN/mies.', zrodloUrl: 'https://gov.pl', wniosek: { kanal: [], kroki: [], dokumenty: [], terminRealizacji: '' }, dataWeryfikacji: '' },
        status: 'PRZYSLUGUJE' as const,
        confidence: 'WYSOKA' as const,
        matchedCriteria: ['Ma dzieci'],
        failedCriteria: [],
        warnings: [],
      }],
    };
    const html = buildDigestHtml(payload);
    expect(html).toContain('Swiadczenie 800+');
    expect(html).toContain('800 PLN/mies.');
  });

  it('nie zawiera danych osobowych', () => {
    const html = buildDigestHtml(BASE_PAYLOAD);
    expect(html).not.toContain('jan@test.pl');
    expect(html).not.toContain('PESEL');
    expect(html).not.toContain('dochod');
  });
});
```

- [ ] **Krok 3: Uruchom test -- powinien FAIL**

```bash
npx jest src/emails/__tests__/digest.html.test.ts --no-coverage
```

- [ ] **Krok 4: Implementuj template**

```typescript
// src/emails/digest.html.ts
import type { DigestPayload } from '@/lib/digest';

export function buildDigestSubject(payload: DigestPayload): string {
  const count = payload.rssItems.length + payload.benefits.length;
  return `Agent znalazl ${count} ${count === 1 ? 'aktualizacje' : 'aktualizacje'} -- ${payload.date}`;
}

export function buildDigestHtml(payload: DigestPayload): string {
  const accentColor = '#e6993a';
  const bgColor = '#faf8f2';
  const textColor = '#1a1814';
  const mutedColor = '#8c7b6b';
  const borderColor = '#e8e0d4';

  const benefitsSection = payload.benefits.length > 0 ? `
    <tr><td style="padding: 24px 32px 0;">
      <div style="font-family: monospace; font-size: 11px; color: ${mutedColor}; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
        Co Ci przysluguje
      </div>
      ${payload.benefits.map(r => `
        <div style="border: 1px solid ${r.status === 'PRZYSLUGUJE' ? accentColor : borderColor}; border-radius: 6px; padding: 14px 16px; margin-bottom: 8px; background: #fff;">
          <div style="font-family: monospace; font-size: 13px; font-weight: 600; color: ${textColor}; margin-bottom: 4px;">
            ${escHtml(r.benefit.nazwa)}
          </div>
          ${r.benefit.kwota ? `<div style="font-family: monospace; font-size: 12px; color: ${accentColor}; margin-bottom: 6px;">${escHtml(r.benefit.kwota)}</div>` : ''}
          ${r.benefit.zrodloUrl ? `<a href="${r.benefit.zrodloUrl}" style="font-size: 12px; color: ${accentColor}; text-decoration: none;">Oficjalne zrodlo &rarr;</a>` : ''}
        </div>
      `).join('')}
    </td></tr>
  ` : '';

  const rssSection = payload.rssItems.length > 0 ? `
    <tr><td style="padding: 24px 32px 0;">
      <div style="font-family: monospace; font-size: 11px; color: ${mutedColor}; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
        Aktualnosci i zmiany w prawie
      </div>
      ${payload.rssItems.map(item => `
        <div style="border-bottom: 1px solid ${borderColor}; padding: 12px 0;">
          <a href="${escHtml(item.link)}" style="font-size: 13px; font-weight: 500; color: ${textColor}; text-decoration: none; display: block; margin-bottom: 4px;">
            ${escHtml(item.title)}
          </a>
          <div style="font-size: 11px; color: ${mutedColor};">
            ${escHtml(item.source)}${item.pubDate ? ` &bull; ${new Date(item.pubDate).toLocaleDateString('pl-PL')}` : ''}
          </div>
        </div>
      `).join('')}
    </td></tr>
  ` : '';

  const greeting = payload.companyName
    ? `Raport dla: <strong>${escHtml(payload.companyName)}</strong>`
    : 'Twoj dzienny raport od agenta AI';

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Digest agenta -- ${escHtml(payload.date)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${bgColor}; font-family: -apple-system, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding: 32px 16px;">
      <table role="presentation" width="100%" style="max-width: 600px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; overflow: hidden;">

        <!-- Header -->
        <tr><td style="background: #0d0b0a; padding: 24px 32px;">
          <div style="font-family: monospace; font-size: 13px; color: ${accentColor}; font-weight: 500;">
            wezmezadarmo<span style="color: #4a4540;">.com</span>
          </div>
          <div style="font-family: monospace; font-size: 18px; color: #faf8f2; font-weight: 500; margin-top: 8px; letter-spacing: -0.02em;">
            ${greeting}
          </div>
          <div style="font-family: monospace; font-size: 11px; color: #8c7b6b; margin-top: 6px;">
            ${escHtml(payload.date)}
          </div>
        </td></tr>

        ${benefitsSection}
        ${rssSection}

        <!-- Footer -->
        <tr><td style="padding: 24px 32px; border-top: 1px solid ${borderColor}; background: #f5f0e8;">
          <div style="font-size: 11px; color: ${mutedColor}; line-height: 1.6;">
            <a href="https://wezmezadarmo.com/agent/panel/powiadomienia" style="color: ${accentColor}; text-decoration: none;">Zarzadzaj ustawieniami</a>
            &nbsp;&bull;&nbsp;
            <a href="https://wezmezadarmo.com/agent/panel" style="color: ${accentColor}; text-decoration: none;">Panel agenta</a>
          </div>
          <div style="font-size: 10px; color: ${mutedColor}; margin-top: 8px; line-height: 1.5;">
            Ten e-mail nie zawiera Twoich danych osobowych.
            Dane przetwarzamy zgodnie z RODO. Nie sprzedajemy danych.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

- [ ] **Krok 5: Uruchom testy -- powinny PASS**

```bash
npx jest src/emails/__tests__/digest.html.test.ts --no-coverage
```

Oczekiwany wynik: `4 passed`.

- [ ] **Krok 6: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/emails/digest.html.ts src/emails/__tests__/digest.html.test.ts
git commit -m "feat: email template digest.html.ts"
```

---

### Task 3: Digest cron endpoint

**Files:**
- Create: `src/app/api/digest/route.ts`

- [ ] **Krok 1: Sprawdz ze Resend jest zainstalowany**

```bash
npm list resend
```

Jesli brak: `npm install resend` i commit package.json (patrz Plan A Task 3).

- [ ] **Krok 2: Utworz endpoint**

```typescript
// src/app/api/digest/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { FEEDS, fetchFeeds, type FeedMeta } from '@/app/aktualnosci/rss';
import { matchBenefits } from '@/engine/matcher';
import type { UserProfile } from '@/engine/types';
import { filterRecentItems, buildPrivateDigestPayload, buildJdgDigestPayload } from '@/lib/digest';
import { buildDigestHtml, buildDigestSubject } from '@/emails/digest.html';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  // Weryfikacja sekretu crona
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Pobierz wszystkich uzytkownikow z digest_enabled = true
  const { data: prefRows, error: prefError } = await supabaseAdmin
    .from('email_preferences')
    .select('user_id, categories, last_digest_sent_at')
    .eq('digest_enabled', true);

  if (prefError || !prefRows) {
    console.error('[digest/cron] blad pobierania preferencji:', prefError);
    return NextResponse.json({ error: 'Blad bazy danych.' }, { status: 500 });
  }

  // Pobierz wspolne RSS dla wszystkich uzytkownikow (jeden fetch, reuzywamy)
  const defaultFeedResult = await fetchFeeds(FEEDS).catch(() => ({ items: [], active: [], failed: [] }));
  const recentDefaultItems = filterRecentItems(defaultFeedResult.items);

  const results = { sent: 0, skipped: 0, errors: 0 };

  // Przetworz kazdego uzytkownika
  await Promise.allSettled(prefRows.map(async pref => {
    try {
      // Pobierz email i profil
      const [userRes, profileRes] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(pref.user_id),
        supabaseAdmin.from('agent_user_profiles').select('*').eq('user_id', pref.user_id).single(),
      ]);

      const email = userRes.data?.user?.email;
      const profile = profileRes.data;

      if (!email || !profile) {
        results.errors++;
        return;
      }

      // Pobierz wlasne feedy uzytkownika
      const { data: userFeeds } = await supabaseAdmin
        .from('company_rss_feeds')
        .select('id, feed_url, feed_name, kategoria')
        .eq('user_id', pref.user_id)
        .eq('aktywna', true);

      const customMetas: FeedMeta[] = (userFeeds ?? []).map(f => ({
        id: f.id as string,
        name: f.feed_name as string,
        fullName: f.feed_name as string,
        url: f.feed_url as string,
        audiences: ['wszyscy'],
        tags: f.kategoria ? [f.kategoria as string] : [],
      }));

      // Pobierz wlasne feedy jesli sa, potem polacz z domyslnymi
      let allRecentItems = [...recentDefaultItems];
      if (customMetas.length > 0) {
        const customResult = await fetchFeeds(customMetas).catch(() => ({ items: [] as typeof defaultFeedResult.items, active: [], failed: [] }));
        allRecentItems = [...allRecentItems, ...filterRecentItems(customResult.items)];
      }

      // Filtruj po kategoriach preferencji uzytkownika
      const userCategories: string[] = (pref.categories as string[]) ?? [];
      const filteredItems = userCategories.length > 0
        ? allRecentItems.filter(item =>
            item.audiences.includes('wszyscy') ||
            item.tags?.some((tag: string) => userCategories.includes(tag))
          )
        : allRecentItems;

      let payload;

      if (profile.type === 'jdg') {
        payload = buildJdgDigestPayload(email, profile.company_name ?? 'Twoja firma', filteredItems);
      } else {
        // Przelicz swiadczenia z profilu prywatnego
        const userProfile: UserProfile = {
          wiek: profile.wiek ?? 30,
          plec: profile.plec ?? 'M',
          stanCywilny: profile.stan_cywilny ?? 'wolny',
          liczbaDzieci: profile.liczba_dzieci ?? 0,
          wiekDzieci: (profile.wiek_dzieci as number[]) ?? [],
          dochodMiesiecznie: profile.dochod_miesiecznie ?? 0,
          dochodNaOsobe: profile.dochod_na_osobe ?? 0,
          zatrudnienie: profile.zatrudnienie ?? 'umowa_o_prace',
          niepelnosprawnosc: profile.niepelnosprawnosc ?? 'brak',
          wlasnosc: profile.wlasnosc ?? 'wynajem',
          wojewodztwo: profile.wojewodztwo ?? 'mazowieckie',
          prowadzDzialalnosc: false,
          pierwszaDzialalnosc: false,
          ciaza: profile.ciaza ?? false,
          student: profile.student ?? false,
          emeryt: profile.emeryt ?? false,
          rolnik: profile.rolnik ?? false,
          bezrobotnyZarejestrowany: profile.bezrobotny_zarejestrowany ?? false,
        };
        const benefitResults = matchBenefits(userProfile);
        payload = buildPrivateDigestPayload(email, filteredItems, benefitResults);
      }

      // Pomijn jesli brak nowej tresci
      if (!payload.hasContent) {
        await supabaseAdmin.from('digest_log').insert({
          user_id: pref.user_id, skipped: true, skip_reason: 'no_new_content', items_count: 0,
        });
        results.skipped++;
        return;
      }

      // Wyslij przez Resend
      const subject = buildDigestSubject(payload);
      const html = buildDigestHtml(payload);

      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'agent@wezmezadarmo.com',
        to: email,
        subject,
        html,
      });

      if (sendError) {
        console.error(`[digest/cron] blad wysylki do ${email}:`, sendError);
        results.errors++;
        return;
      }

      // Zaktualizuj last_digest_sent_at i zapisz log
      await Promise.all([
        supabaseAdmin.from('email_preferences')
          .update({ last_digest_sent_at: new Date().toISOString() })
          .eq('user_id', pref.user_id),
        supabaseAdmin.from('digest_log').insert({
          user_id: pref.user_id,
          subject,
          items_count: payload.rssItems.length + payload.benefits.length,
          skipped: false,
        }),
      ]);

      results.sent++;
    } catch (err) {
      console.error(`[digest/cron] nieoczekiwany blad dla user ${pref.user_id}:`, err);
      results.errors++;
    }
  }));

  console.log(`[digest/cron] wynik: sent=${results.sent} skipped=${results.skipped} errors=${results.errors}`);
  return NextResponse.json({ ...results, total: prefRows.length });
}
```

- [ ] **Krok 3: TypeScript**

```bash
npx tsc --noEmit
```

Jesli blad z `item.tags` (FeedItem nie ma pola tags): sprawdz typ FeedItem w `src/app/aktualnosci/rss.ts`. Jesli brak pola `tags`, zmien filtr na:

```typescript
const filteredItems = userCategories.length > 0
  ? allRecentItems.filter(item => item.audiences.includes('wszyscy'))
  : allRecentItems;
```

- [ ] **Krok 4: Commit**

```bash
git add src/app/api/digest/route.ts
git commit -m "feat: digest cron endpoint -- agreguje RSS + swiadczenia, wysyla przez Resend"
```

---

### Task 4: Aktualizacja vercel.json

**Files:**
- Modify: `vercel.json`

- [ ] **Krok 1: Przeczytaj aktualny vercel.json**

Aktualna zawartosc:
```json
{
  "crons": [
    { "path": "/api/dotacje/cron/weekly-check", "schedule": "0 8 * * 1" },
    { "path": "/api/dotacje/cron/daily-scrape", "schedule": "0 6 * * *" }
  ]
}
```

- [ ] **Krok 2: Dodaj nowy cron**

```json
{
  "crons": [
    { "path": "/api/dotacje/cron/weekly-check", "schedule": "0 8 * * 1" },
    { "path": "/api/dotacje/cron/daily-scrape", "schedule": "0 6 * * *" },
    { "path": "/api/digest", "schedule": "0 6 * * *" }
  ]
}
```

Uwaga: Vercel Cron na darmowym planie (Hobby) dozwolony jest 1 cron. Na planie Pro -- bez limitu. Jesli na Hobby, polacz daily-scrape i digest w jeden endpoint lub zmigruj na Pro.

- [ ] **Krok 3: Commit**

```bash
git add vercel.json
git commit -m "feat: vercel.json -- cron dla digest agenta (0 6 * * *)"
```

---

### Task 5: Aktualizacja SiteHeader i AGENTS.md

**Files:**
- Modify: `src/components/SiteHeader.tsx`
- Modify: `AGENTS.md`

- [ ] **Krok 1: Dodaj /agent do nawigacji SiteHeader**

Aktualna lista w SiteHeader.tsx:
```typescript
{ href: '/automatyzacje', label: 'Automatyzacje' },
{ href: '/dotacje', label: 'Dotacje' },
```

Nowa lista:
```typescript
{ href: '/automatyzacje', label: 'Automatyzacje' },
{ href: '/dotacje', label: 'Dotacje' },
{ href: '/agent', label: 'Agent AI' },
```

Edytuj `src/components/SiteHeader.tsx` -- zmien tablice linków.

- [ ] **Krok 2: Zaktualizuj mape projektu w AGENTS.md**

Dodaj do sekcji "Strony publiczne":
```
- `/agent/` -- Agent AI dla JDG i osob prywatnych (swiadczenia, RSS, dzienny e-mail digest)
```

Dodaj do sekcji "Panel firmowy" nowa sekcje:
```
Panel osobisty (/agent/panel/):
- `/agent/panel/` -- dashboard agenta
- `/agent/panel/swiadczenia/` -- dopasowane swiadczenia i ulgi
- `/agent/panel/aktualnosci/` -- RSS aktualnosci i zmiany w prawie
- `/agent/panel/powiadomienia/` -- ustawienia digestu e-mail
- `/agent/panel/profil/` -- edycja profilu uzytkownika
```

Dodaj do sekcji "API":
```
- `/api/agent/` -- auth i profil dla modulu agent
- `/api/digest/` -- cron endpoint digestu (wywolywany przez Vercel Cron)
```

- [ ] **Krok 3: TypeScript + commit**

```bash
npx tsc --noEmit
git add src/components/SiteHeader.tsx AGENTS.md
git commit -m "feat: SiteHeader link /agent, aktualizacja AGENTS.md"
```

---

### Task 6: Weryfikacja end-to-end

- [ ] **Krok 1: Uruchom wszystkie testy**

```bash
npx jest --no-coverage
```

Oczekiwany wynik: wszystkie testy PASS (w tym z Planu A).

- [ ] **Krok 2: Sprawdz TypeScript**

```bash
npx tsc --noEmit
```

Oczekiwany wynik: 0 bledow.

- [ ] **Krok 3: Zweryfikuj lokalne serwery RSS nie blokuja buildu**

```bash
npm run build 2>&1 | tail -20
```

Oczekiwany wynik: brak bledow kompilacji.

- [ ] **Krok 4: Sprawdz pelny log commitow**

```bash
git log --oneline -20
```

Oczekiwany: commity z Planu A (7), Planu B (8), Planu C (6) = 21 commitow.

- [ ] **Krok 5: Podaj Exhuman komende do push**

```
git push origin main
```

Z podsumowaniem:
- Nowy modul /agent dla JDG i osob prywatnych
- 3 nowe tabele Supabase: agent_user_profiles, email_preferences, digest_log
- Rejestracja 3-krokowa z autouzupelnianiem NIP przez CEIDG
- Panel: swiadczenia, aktualnosci, powiadomienia, profil
- Dzienny e-mail digest przez Resend (cron 6:00 UTC)
- Fix: CEIDG parsuje teraz wojewodztwo
- Bezpieczenstwo: zero danych osobowych w treści maila

---

## Polskie znaki -- ostatni sprawdzian

Przed push przejdz przez nowe pliki i sprawdz wszystkie stringi widoczne dla uzytkownika:

| Plik | Sprawdz |
|------|---------|
| `src/app/agent/page.tsx` | "Twój", "działalność", "żyjest" (blad! powinno byc "żyjesz") |
| `src/app/agent/rejestracja/page.tsx` | "Załóż konto", "działalność", "województwo" |
| `src/app/agent/panel/swiadczenia/page.tsx` | "Świadczenia", "przysługuje" |
| `src/emails/digest.html.ts` | "aktualności", "zgodnie z RODO" |

Znajdz i popraw wszystkie braki diakrytykow przed commitem finalnym.

---

## Kompletna lista plikow systemu /agent

```
src/
  app/
    agent/
      layout.tsx
      page.tsx
      logowanie/page.tsx
      rejestracja/page.tsx
      panel/
        page.tsx
        swiadczenia/page.tsx
        aktualnosci/page.tsx
        powiadomienia/page.tsx
        profil/page.tsx
    api/
      agent/
        auth/
          signup/route.ts
          signin/route.ts
        profile/route.ts
      digest/
        route.ts
        preferences/route.ts
  components/
    AgentNav.tsx
  emails/
    digest.html.ts
    __tests__/digest.html.test.ts
  lib/
    ceidg.ts          (zmodyfikowany)
    digest.ts
    __tests__/
      ceidg.test.ts
      digest.test.ts
supabase/
  migrations/
    20260518000000_agent_tables.sql
vercel.json           (zmodyfikowany)
AGENTS.md             (zmodyfikowany)
```
