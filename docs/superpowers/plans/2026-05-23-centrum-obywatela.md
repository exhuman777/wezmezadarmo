# Centrum Obywatela - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dokończyć Centrum Obywatela: 5 nowych integracji (IMGW, ELI/Sejm, BDL GUS, ARiMR link, PKP link), reorganizacja huba per grupa docelowa, dopięcie do AI chatu (3 prefetchery + BASE_LIVE_SOURCES) i UI landingu (VAT chip).

**Architecture:** Kopia istniejących wzorców z `src/lib/sources/{nbp,gios,nfz,whitelist}` + `/api/public/*` + `/centrum-obywatela/*`. Nowe integracje używają `_helpers.ts` (rateLimit, publicError). Parser XML/RSS regex (zero nowych zależności). Hub przebudowany z płaskiej listy na sekcje per audience (registry z polem `audiences: string[]`).

**Tech Stack:** Next.js 16.2.6, React 19, TypeScript strict, vitest, Supabase, zero nowych deps.

**Spec:** `docs/superpowers/specs/2026-05-23-centrum-obywatela-design.md`

---

## File Structure

**Nowe pliki:**

```
src/lib/sources/
  imgw.ts           # fetch + parse RCB RSS, eksport fetchWarnings()
  eli-sejm.ts       # fetch ELI JSON, eksport fetchRecentChanges()
  bdl-gus.ts        # fetch BDL JSON, eksport searchUnit() + fetchUnitData()

src/lib/__tests__/
  imgw.test.ts      # parser RSS RCB
  eli-sejm.test.ts  # filter keyword
  bdl-gus.test.ts   # mapper response

src/app/api/public/
  imgw/route.ts     # GET, rate 30/min/IP, cache 15 min
  eli-sejm/route.ts # GET ?q=, rate 30/min/IP, cache 30 min
  bdl-gus/route.ts  # GET ?gmina= lub ?terytId=, rate 30/min/IP, cache 24h

src/app/centrum-obywatela/
  pogoda/page.tsx       # IMGW alerty - lista kart
  prawo/page.tsx        # ELI - search + lista
  gus/page.tsx          # BDL - search gmina + tabela
  dzialki/page.tsx      # ARiMR static link + instrukcja
  transport/page.tsx    # PKP static tabela ulg

src/components/
  ImgwAlertWidget.tsx   # client, top 3 alerty
  EliChangesWidget.tsx  # client, top 5 zmian w prawie
```

**Modyfikowane pliki:**

```
src/app/centrum-obywatela/page.tsx     # reorg na sekcje per audience
src/app/api/agent/chat/route.ts        # +3 prefetchery (Imgw, Eli, BdlGus)
src/agents/base-prompt.ts              # +5 pozycji w BASE_LIVE_SOURCES
src/app/page.tsx                       # banner-success VAT po CEIDG
src/app/aktualnosci/page.tsx           # +ImgwAlertWidget +EliChangesWidget
src/app/o-projekcie/page.tsx           # update desc Centrum + SOURCES
```

---

## Task 1: IMGW source library + parser tests

**Files:**
- Create: `src/lib/sources/imgw.ts`
- Create: `src/lib/__tests__/imgw.test.ts`

- [ ] **Step 1: Write failing parser test**

`src/lib/__tests__/imgw.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { parseRcbRss } from '@/lib/sources/imgw';

const SAMPLE_RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>RCB</title>
<item>
<title>Ostrzeżenie: silne opady deszczu - mazowieckie, łódzkie</title>
<link>https://rcb.gov.pl/alert-deszcz</link>
<pubDate>Sat, 23 May 2026 12:00:00 +0000</pubDate>
<description>IMGW prognozuje opady do 50mm.</description>
</item>
<item>
<title>Burze z gradem - małopolska</title>
<link>https://rcb.gov.pl/burze</link>
<pubDate>Sat, 23 May 2026 10:00:00 +0000</pubDate>
<description>Burze z opadami gradu.</description>
</item>
</channel></rss>`;

describe('parseRcbRss', () => {
  it('parses items with title, link, pubDate, description', () => {
    const items = parseRcbRss(SAMPLE_RSS);
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('Ostrzeżenie: silne opady deszczu - mazowieckie, łódzkie');
    expect(items[0].link).toBe('https://rcb.gov.pl/alert-deszcz');
    expect(items[0].pubDate).toBe('Sat, 23 May 2026 12:00:00 +0000');
    expect(items[0].description).toContain('50mm');
  });

  it('returns empty array when no items', () => {
    expect(parseRcbRss('<rss><channel></channel></rss>')).toEqual([]);
  });

  it('handles CDATA in description', () => {
    const rss = `<rss><channel><item><title>T</title><link>L</link><pubDate>D</pubDate><description><![CDATA[Tekst z <b>HTML</b>]]></description></item></channel></rss>`;
    expect(parseRcbRss(rss)[0].description).toContain('Tekst z');
  });
});
```

- [ ] **Step 2: Run test, expect FAIL "parseRcbRss is not a function"**

```bash
npx vitest run src/lib/__tests__/imgw.test.ts
```

- [ ] **Step 3: Implement parser + fetch**

`src/lib/sources/imgw.ts`:
```typescript
/**
 * IMGW / RCB (Rządowe Centrum Bezpieczeństwa) - oficjalne ostrzeżenia meteo i kryzysowe.
 * Źródło: rcb.gov.pl/feed (RSS 2.0, XML).
 * Use case: alerty pogodowe dla rolników KRUS, alergików, prac polowych.
 */

const RCB_FEED = 'https://rcb.gov.pl/feed/';

export interface RcbWarning {
  title: string;
  link: string;
  pubDate: string | null;
  description: string;
}

export function parseRcbRss(xml: string): RcbWarning[] {
  const out: RcbWarning[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    out.push({
      title: extractTag(block, 'title') ?? '',
      link: extractTag(block, 'link') ?? '',
      pubDate: extractTag(block, 'pubDate'),
      description: extractTag(block, 'description') ?? '',
    });
  }
  return out;
}

function extractTag(block: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  if (!m) return null;
  return stripCdata(m[1]).replace(/<[^>]+>/g, '').trim();
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

export async function fetchWarnings(): Promise<RcbWarning[]> {
  const res = await fetch(RCB_FEED, {
    headers: { Accept: 'application/rss+xml,text/xml,*/*', 'User-Agent': 'wezmezadarmo/1.0' },
    next: { revalidate: 900 }, // 15 min
  });
  if (!res.ok) throw new Error(`RCB feed error: ${res.status}`);
  const xml = await res.text();
  return parseRcbRss(xml);
}
```

- [ ] **Step 4: Run test, expect PASS**

```bash
npx vitest run src/lib/__tests__/imgw.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/sources/imgw.ts src/lib/__tests__/imgw.test.ts
git commit -m "feat: IMGW/RCB source lib + RSS parser z testami"
```

---

## Task 2: IMGW public API endpoint

**Files:**
- Create: `src/app/api/public/imgw/route.ts`

- [ ] **Step 1: Implement endpoint**

`src/app/api/public/imgw/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchWarnings } from '@/lib/sources/imgw';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('imgw', request, 30, 60_000); // 30/min/IP
  if (!limit.ok) return limit.response;

  try {
    const warnings = await fetchWarnings();
    return NextResponse.json({
      count: warnings.length,
      warnings: warnings.slice(0, 20),
    });
  } catch (err) {
    return publicError(err, 'imgw');
  }
}
```

- [ ] **Step 2: Verify endpoint zwraca JSON**

```bash
npx tsc --noEmit
# dev server zaraz testujemy razem ze stroną w Task 3
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/public/imgw/route.ts
git commit -m "feat: /api/public/imgw endpoint z rate-limit 30/min"
```

---

## Task 3: IMGW podstrona + widget

**Files:**
- Create: `src/app/centrum-obywatela/pogoda/page.tsx`
- Create: `src/components/ImgwAlertWidget.tsx`

- [ ] **Step 1: Stworzyć widget client component**

`src/components/ImgwAlertWidget.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';

interface Warning {
  title: string;
  link: string;
  pubDate: string | null;
  description: string;
}

export function ImgwAlertWidget() {
  const [data, setData] = useState<Warning[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/imgw')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => { if (!cancelled) { setData(json.warnings ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!loading && (!data || data.length === 0)) return null;

  return (
    <div style={{
      padding: 16,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em' }}>
          OSTRZEŻENIA · RCB
        </span>
        <span style={{ fontSize: 10, color: 'var(--color-muted-2)', fontFamily: 'var(--font-mono)' }}>
          {data?.length ?? 0} aktywnych
        </span>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Ładowanie...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(data ?? []).slice(0, 3).map(w => (
            <a key={w.link} href={w.link} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                textDecoration: 'none', color: 'var(--color-text-1)',
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{w.title}</div>
              {w.pubDate && (
                <div style={{ fontSize: 10, color: 'var(--color-muted-2)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                  {new Date(w.pubDate).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      <a href="/centrum-obywatela/pogoda" style={{ fontSize: 10, color: 'var(--color-muted-2)', textDecoration: 'none' }}>
        Wszystkie ostrzeżenia: /centrum-obywatela/pogoda
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Stworzyć podstronę pogoda**

`src/app/centrum-obywatela/pogoda/page.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Warning {
  title: string;
  link: string;
  pubDate: string | null;
  description: string;
}

export default function PogodaPage() {
  const [data, setData] = useState<Warning[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public/imgw')
      .then(r => r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`))
      .then(json => { setData(json.warnings ?? []); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c4841a' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          IMGW / RCB · ostrzeżenia
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Aktywne ostrzeżenia meteo i kryzysowe</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Oficjalne alerty Rządowego Centrum Bezpieczeństwa - opady, burze, mróz, powodzie, smog. Aktualizacja co 15 minut.
        Polecane dla rolników KRUS, alergików, planujących prace polowe lub wyjazdy.
      </p>

      {loading && <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Ładowanie...</div>}
      {error && <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 8, color: '#dc5050', fontSize: 13 }}>{error}</div>}

      {data && data.length === 0 && (
        <div style={{ padding: '14px 18px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 10, color: 'var(--green-900)' }}>
          Brak aktywnych ostrzeżeń. Sytuacja meteorologiczna w normie.
        </div>
      )}

      {data && data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map(w => (
            <a key={w.link} href={w.link} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: 16, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 6, lineHeight: 1.4 }}>{w.title}</div>
              {w.description && (
                <div style={{ fontSize: 13, color: 'var(--ink-600)', marginBottom: 6, lineHeight: 1.5 }}>{w.description}</div>
              )}
              {w.pubDate && (
                <div style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--f-mono)' }}>
                  {new Date(w.pubDate).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://rcb.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>rcb.gov.pl/feed</a>
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Sanity: tsc + manual smoke**

```bash
npx tsc --noEmit
npm run dev
# Otwórz http://localhost:3000/centrum-obywatela/pogoda i sprawdź render
```

- [ ] **Step 4: Commit**

```bash
git add src/app/centrum-obywatela/pogoda/page.tsx src/components/ImgwAlertWidget.tsx
git commit -m "feat: /centrum-obywatela/pogoda + ImgwAlertWidget"
```

---

## Task 4: ELI/Sejm source library + tests

**Files:**
- Create: `src/lib/sources/eli-sejm.ts`
- Create: `src/lib/__tests__/eli-sejm.test.ts`

- [ ] **Step 1: Write failing keyword filter test**

`src/lib/__tests__/eli-sejm.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { filterByKeywords, EliAct } from '@/lib/sources/eli-sejm';

const SAMPLE: EliAct[] = [
  { eli: 'DU/2026/100', title: 'Ustawa o świadczeniu 800+', publisher: 'Sejm', type: 'Ustawa', announcedAt: '2026-05-20', eliUrl: 'https://eli.gov.pl/100' },
  { eli: 'DU/2026/101', title: 'Rozporządzenie o gospodarce odpadami', publisher: 'Min. Klimatu', type: 'Rozporządzenie', announcedAt: '2026-05-21', eliUrl: 'https://eli.gov.pl/101' },
  { eli: 'DU/2026/102', title: 'Ustawa o zasiłku pogrzebowym', publisher: 'Sejm', type: 'Ustawa', announcedAt: '2026-05-22', eliUrl: 'https://eli.gov.pl/102' },
];

describe('filterByKeywords', () => {
  it('returns only acts matching any keyword (case-insensitive)', () => {
    const out = filterByKeywords(SAMPLE, ['świadczenie', 'zasiłek']);
    expect(out).toHaveLength(2);
    expect(out.map(a => a.eli)).toEqual(['DU/2026/100', 'DU/2026/102']);
  });

  it('returns all when keywords array empty', () => {
    expect(filterByKeywords(SAMPLE, [])).toHaveLength(3);
  });

  it('matches diacritics-insensitively', () => {
    const out = filterByKeywords(SAMPLE, ['swiadczenie']);
    expect(out).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

```bash
npx vitest run src/lib/__tests__/eli-sejm.test.ts
```

- [ ] **Step 3: Implement source**

`src/lib/sources/eli-sejm.ts`:
```typescript
/**
 * ELI (European Legislation Identifier) - api.sejm.gov.pl
 * Tracker zmian w polskim prawie: ustawy, rozporządzenia, obwieszczenia.
 * Public, no auth.
 */

const BASE = 'https://api.sejm.gov.pl/eli';

export interface EliAct {
  eli: string;          // ELI identifier np. DU/2026/100
  title: string;
  publisher: string;    // wydawca: Sejm, Min. X, RM
  type: string;         // Ustawa | Rozporządzenie | Obwieszczenie
  announcedAt: string;  // ISO date
  eliUrl: string;       // link do strony ELI z aktem
}

interface RawAct {
  ELI?: string;
  title?: string;
  publisher?: string;
  type?: string;
  announcementDate?: string;
  promulgation?: string;
}

const KEYWORD_DEFAULT = ['świadczenie', 'zasiłek', 'ulga', 'dodatek', 'emerytura', 'becikowe', 'KRUS', 'ZUS', 'refundacja', '800+'];

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function filterByKeywords(acts: EliAct[], keywords: string[]): EliAct[] {
  if (keywords.length === 0) return acts;
  const norms = keywords.map(normalize);
  return acts.filter(a => {
    const hay = normalize(a.title);
    return norms.some(k => hay.includes(k));
  });
}

export async function fetchRecentChanges(opts?: { keywords?: string[]; limit?: number }): Promise<EliAct[]> {
  const limit = opts?.limit ?? 50;
  // ELI search endpoint: ostatnie ogłoszone akty Dziennika Ustaw
  const res = await fetch(`${BASE}/acts/DU/2026?limit=${limit}&offset=0`, {
    headers: { Accept: 'application/json', 'User-Agent': 'wezmezadarmo/1.0' },
    next: { revalidate: 1800 }, // 30 min
  });
  if (!res.ok) throw new Error(`ELI API error: ${res.status}`);
  const data = await res.json();
  const items = (data.items ?? data ?? []) as RawAct[];

  const acts: EliAct[] = items.map((r): EliAct => ({
    eli: r.ELI ?? '',
    title: r.title ?? '',
    publisher: r.publisher ?? '',
    type: r.type ?? '',
    announcedAt: r.announcementDate ?? r.promulgation ?? '',
    eliUrl: r.ELI ? `https://eli.gov.pl/eli/${r.ELI}/ogl/` : '',
  })).filter(a => a.eli && a.title);

  return filterByKeywords(acts, opts?.keywords ?? KEYWORD_DEFAULT);
}
```

- [ ] **Step 4: Run test, expect PASS**

```bash
npx vitest run src/lib/__tests__/eli-sejm.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/sources/eli-sejm.ts src/lib/__tests__/eli-sejm.test.ts
git commit -m "feat: ELI/Sejm source lib z filtrem keyword + testy"
```

---

## Task 5: ELI/Sejm public API + podstrona + widget

**Files:**
- Create: `src/app/api/public/eli-sejm/route.ts`
- Create: `src/app/centrum-obywatela/prawo/page.tsx`
- Create: `src/components/EliChangesWidget.tsx`

- [ ] **Step 1: Implement API endpoint**

`src/app/api/public/eli-sejm/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentChanges } from '@/lib/sources/eli-sejm';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('eli-sejm', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();
  const keywords = q ? q.split(/\s+/).filter(Boolean) : undefined;

  try {
    const acts = await fetchRecentChanges({ keywords });
    return NextResponse.json({ count: acts.length, acts: acts.slice(0, 20) });
  } catch (err) {
    return publicError(err, 'eli-sejm');
  }
}
```

- [ ] **Step 2: Implement widget**

`src/components/EliChangesWidget.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';

interface Act {
  eli: string;
  title: string;
  type: string;
  publisher: string;
  announcedAt: string;
  eliUrl: string;
}

export function EliChangesWidget() {
  const [data, setData] = useState<Act[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/eli-sejm')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => { if (!cancelled) { setData(json.acts ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (!loading && (!data || data.length === 0)) return null;

  return (
    <div style={{
      padding: 16, background: 'var(--color-surface)',
      border: '1px solid var(--color-border)', borderRadius: 12,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', letterSpacing: '0.08em' }}>
          ZMIANY W PRAWIE · ELI/Sejm
        </span>
      </div>

      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>Ładowanie...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(data ?? []).slice(0, 5).map(a => (
            <a key={a.eli} href={a.eliUrl} target="_blank" rel="noopener noreferrer"
              style={{
                padding: '8px 10px', borderRadius: 8,
                background: 'var(--color-bg-2)', border: '1px solid var(--color-border)',
                textDecoration: 'none', color: 'var(--color-text-1)',
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{a.title}</div>
              <div style={{ fontSize: 10, color: 'var(--color-muted-2)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
                {a.type} · {a.announcedAt}
              </div>
            </a>
          ))}
        </div>
      )}

      <a href="/centrum-obywatela/prawo" style={{ fontSize: 10, color: 'var(--color-muted-2)', textDecoration: 'none' }}>
        Wszystkie zmiany: /centrum-obywatela/prawo
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Implement podstrona prawo**

`src/app/centrum-obywatela/prawo/page.tsx`:
```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Act {
  eli: string;
  title: string;
  type: string;
  publisher: string;
  announcedAt: string;
  eliUrl: string;
}

export default function PrawoPage() {
  const [data, setData] = useState<Act[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

  async function load(query?: string) {
    setLoading(true); setError(null);
    try {
      const url = query ? `/api/public/eli-sejm?q=${encodeURIComponent(query)}` : '/api/public/eli-sejm';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.acts ?? []);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#003874' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          ELI / Sejm · zmiany w prawie
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Ostatnie zmiany w przepisach o świadczeniach</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 20, lineHeight: 1.6 }}>
        Akty prawne z Dziennika Ustaw filtrowane po słowach: świadczenie, zasiłek, ulga, dodatek, emerytura, ZUS, KRUS, refundacja.
        Aktualizacja co 30 minut. Wpisz własne słowo kluczowe aby zawęzić.
      </p>

      <form onSubmit={e => { e.preventDefault(); load(q.trim() || undefined); }}
        style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Słowo kluczowe (np. KRUS, emerytura)"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 15 }} />
        <button type="submit" className="btn btn-primary">Szukaj</button>
      </form>

      {loading && <div style={{ fontSize: 13, color: 'var(--ink-500)' }}>Ładowanie...</div>}
      {error && <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 8, color: '#dc5050', fontSize: 13 }}>{error}</div>}
      {data && data.length === 0 && (
        <div style={{ padding: '14px 18px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 10, color: 'var(--green-900)' }}>
          Brak zmian pasujących do zapytania.
        </div>
      )}

      {data && data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map(a => (
            <a key={a.eli} href={a.eliUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: 14, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4, lineHeight: 1.4 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--f-mono)' }}>
                {a.type} · {a.publisher} · {a.announcedAt} · ELI: {a.eli}
              </div>
            </a>
          ))}
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://api.sejm.gov.pl/eli" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>api.sejm.gov.pl/eli</a>
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Sanity tsc + smoke**

```bash
npx tsc --noEmit
# dev server → http://localhost:3000/centrum-obywatela/prawo
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/public/eli-sejm/route.ts src/app/centrum-obywatela/prawo/page.tsx src/components/EliChangesWidget.tsx
git commit -m "feat: ELI/Sejm endpoint + /centrum-obywatela/prawo + widget"
```

---

## Task 6: BDL GUS source library + tests

**Files:**
- Create: `src/lib/sources/bdl-gus.ts`
- Create: `src/lib/__tests__/bdl-gus.test.ts`

- [ ] **Step 1: Write failing mapper test**

`src/lib/__tests__/bdl-gus.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { mapUnitData } from '@/lib/sources/bdl-gus';

const RAW = {
  results: [
    {
      id: '60559',
      values: [{ year: '2024', val: 38500000 }],
    },
    {
      id: '459163',
      values: [{ year: '2024', val: 5.2 }],
    },
  ],
};

describe('mapUnitData', () => {
  it('extracts variable values into named fields', () => {
    const out = mapUnitData(RAW);
    expect(out.populationTotal).toBe(38500000);
    expect(out.unemploymentRate).toBe(5.2);
  });

  it('returns nulls when missing', () => {
    const out = mapUnitData({ results: [] });
    expect(out.populationTotal).toBeNull();
    expect(out.unemploymentRate).toBeNull();
  });
});
```

- [ ] **Step 2: Run test, expect FAIL**

```bash
npx vitest run src/lib/__tests__/bdl-gus.test.ts
```

- [ ] **Step 3: Implement source**

`src/lib/sources/bdl-gus.ts`:
```typescript
/**
 * BDL GUS - Bank Danych Lokalnych Główny Urząd Statystyczny.
 * REST/JSON. Bez klucza: 10 req/min/IP. Z X-ClientId: 100 req/min.
 * Use case: dane demograficzne i ekonomiczne per gmina/powiat/województwo.
 */

const BASE = 'https://bdl.stat.gov.pl/api/v1';

export interface BdlUnit {
  id: string;       // terytId
  name: string;
  level: number;    // 5=gmina, 4=powiat, 2=województwo
  parentName?: string;
}

export interface BdlUnitData {
  populationTotal: number | null;
  populationPreproductive: number | null;
  populationPostproductive: number | null;
  unemploymentRate: number | null;
  averageGrossSalary: number | null;
  year: string | null;
}

// Wybrane variableId z BDL (znajdź własne w panelu BDL → metadane → zmienne)
export const BDL_VARS = {
  populationTotal: '60559',
  populationPreproductive: '60565',
  populationPostproductive: '60567',
  unemploymentRate: '459163',
  averageGrossSalary: '60270',
} as const;

interface RawResult {
  id: string;
  values: Array<{ year: string; val: number }>;
}

export function mapUnitData(raw: { results?: RawResult[] }): BdlUnitData {
  const byId = new Map((raw.results ?? []).map(r => [r.id, r]));
  const get = (id: string): { val: number; year: string } | null => {
    const r = byId.get(id);
    if (!r || !r.values || r.values.length === 0) return null;
    const latest = r.values[r.values.length - 1];
    return { val: latest.val, year: latest.year };
  };
  const pop = get(BDL_VARS.populationTotal);
  return {
    populationTotal: pop?.val ?? null,
    populationPreproductive: get(BDL_VARS.populationPreproductive)?.val ?? null,
    populationPostproductive: get(BDL_VARS.populationPostproductive)?.val ?? null,
    unemploymentRate: get(BDL_VARS.unemploymentRate)?.val ?? null,
    averageGrossSalary: get(BDL_VARS.averageGrossSalary)?.val ?? null,
    year: pop?.year ?? null,
  };
}

export async function searchUnit(name: string, level: number = 5): Promise<BdlUnit[]> {
  const params = new URLSearchParams({
    name, level: String(level), format: 'json', 'page-size': '20',
  });
  const res = await fetch(`${BASE}/units/search?${params}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`BDL search error: ${res.status}`);
  const data = await res.json();
  return ((data.results ?? []) as Array<{ id: string; name: string; level?: number; parentName?: string }>)
    .map(u => ({ id: u.id, name: u.name, level: u.level ?? level, parentName: u.parentName }));
}

export async function fetchUnitData(terytId: string): Promise<BdlUnitData> {
  const varIds = Object.values(BDL_VARS).join(',');
  const params = new URLSearchParams({
    'var-id': varIds, format: 'json',
  });
  const res = await fetch(`${BASE}/data/by-unit/${terytId}?${params}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`BDL data error: ${res.status}`);
  return mapUnitData(await res.json());
}
```

- [ ] **Step 4: Run test, expect PASS**

```bash
npx vitest run src/lib/__tests__/bdl-gus.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/sources/bdl-gus.ts src/lib/__tests__/bdl-gus.test.ts
git commit -m "feat: BDL GUS source lib z mapperem + testy"
```

---

## Task 7: BDL GUS public API + podstrona

**Files:**
- Create: `src/app/api/public/bdl-gus/route.ts`
- Create: `src/app/centrum-obywatela/gus/page.tsx`

- [ ] **Step 1: Implement API**

`src/app/api/public/bdl-gus/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { searchUnit, fetchUnitData } from '@/lib/sources/bdl-gus';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('bdl-gus', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const terytId = url.searchParams.get('terytId');
  const gmina = url.searchParams.get('gmina');

  try {
    if (terytId) {
      const data = await fetchUnitData(terytId);
      return NextResponse.json({ terytId, data });
    }
    if (gmina) {
      const units = await searchUnit(gmina, 5);
      return NextResponse.json({ units });
    }
    return NextResponse.json({ error: 'Podaj ?gmina= lub ?terytId=' }, { status: 400 });
  } catch (err) {
    return publicError(err, 'bdl-gus');
  }
}
```

- [ ] **Step 2: Implement podstrona**

`src/app/centrum-obywatela/gus/page.tsx`:
```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Unit { id: string; name: string; parentName?: string }
interface UnitData {
  populationTotal: number | null;
  populationPreproductive: number | null;
  populationPostproductive: number | null;
  unemploymentRate: number | null;
  averageGrossSalary: number | null;
  year: string | null;
}

export default function GusPage() {
  const [q, setQ] = useState('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [picked, setPicked] = useState<Unit | null>(null);
  const [data, setData] = useState<UnitData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setError(null); setUnits([]); setData(null); setPicked(null);
    try {
      const res = await fetch(`/api/public/bdl-gus?gmina=${encodeURIComponent(q.trim())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setUnits(json.units ?? []);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  async function pickUnit(u: Unit) {
    setPicked(u); setData(null); setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/public/bdl-gus?terytId=${u.id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.data);
    } catch (e) { setError(String(e)); }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#004B8D' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          GUS / BDL · dane gminy
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Dane demograficzne i ekonomiczne</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 20, lineHeight: 1.6 }}>
        Liczba mieszkańców, bezrobocie, średnie wynagrodzenie - dla Twojej gminy. Dane Banku Danych Lokalnych GUS.
      </p>

      <form onSubmit={search} style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input type="text" placeholder="Nazwa gminy (np. Warszawa, Kraków, Łomianki)"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: '10px 14px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 15 }} />
        <button type="submit" className="btn btn-primary" disabled={loading}>Szukaj</button>
      </form>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(220,80,80,0.05)', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 8, color: '#dc5050', fontSize: 13, marginBottom: 14 }}>{error}</div>}

      {units.length > 0 && !picked && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
            Wybierz gminę ({units.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {units.map(u => (
              <button key={u.id} onClick={() => pickUnit(u)}
                style={{ textAlign: 'left', padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 8, cursor: 'pointer' }}>
                <div style={{ fontSize: 14, color: 'var(--ink-900)', fontWeight: 500 }}>{u.name}</div>
                {u.parentName && <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{u.parentName}</div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {picked && data && (
        <div style={{ padding: 20, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 14, color: 'var(--ink-900)' }}>
            {picked.name}
            {picked.parentName && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-500)', marginLeft: 8 }}>· {picked.parentName}</span>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <Stat label="Ludność ogółem" value={data.populationTotal?.toLocaleString('pl-PL')} />
            <Stat label="Przedprodukcyjna" value={data.populationPreproductive?.toLocaleString('pl-PL')} />
            <Stat label="Poprodukcyjna" value={data.populationPostproductive?.toLocaleString('pl-PL')} />
            <Stat label="Bezrobocie" value={data.unemploymentRate != null ? `${data.unemploymentRate}%` : null} />
            <Stat label="Przeciętne wynagrodzenie" value={data.averageGrossSalary != null ? `${data.averageGrossSalary.toLocaleString('pl-PL')} PLN` : null} />
            <Stat label="Rok" value={data.year} />
          </div>
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://bdl.stat.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>bdl.stat.gov.pl</a>
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-400)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, color: 'var(--ink-900)', fontWeight: 500 }}>{value ?? 'brak danych'}</div>
    </div>
  );
}
```

- [ ] **Step 3: tsc + smoke**

```bash
npx tsc --noEmit
# dev → /centrum-obywatela/gus → search "Warszawa"
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/public/bdl-gus/route.ts src/app/centrum-obywatela/gus/page.tsx
git commit -m "feat: BDL GUS endpoint + /centrum-obywatela/gus z wyszukiwarką gminy"
```

---

## Task 8: ARiMR podstrona (link-only)

**Files:**
- Create: `src/app/centrum-obywatela/dzialki/page.tsx`

- [ ] **Step 1: Stworzyć statyczną podstronę**

`src/app/centrum-obywatela/dzialki/page.tsx`:
```typescript
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Geoportal ARiMR - mapy działek | Centrum Obywatela',
  description: 'Sprawdź działkę rolną w Geoportalu ARiMR - kontrolę agro, dopłaty bezpośrednie, granice ewidencyjne.',
};

const KROKI = [
  { n: 1, tytul: 'Otwórz Geoportal ARiMR', opis: 'Wejdź na geoportal.arimr.gov.pl - publiczny serwis Agencji Restrukturyzacji i Modernizacji Rolnictwa.' },
  { n: 2, tytul: 'Zaloguj się (opcjonalnie)', opis: 'Profil zaufany (login.gov.pl) odblokowuje dodatkowe warstwy: kontrole agro, dopłaty bezpośrednie, historię działek.' },
  { n: 3, tytul: 'Znajdź działkę', opis: 'Wpisz numer ewidencyjny, adres lub przesuń mapę do swojej działki. Możesz też wkleić koordynaty.' },
  { n: 4, tytul: 'Sprawdź warstwy', opis: 'Granice działek, użytki rolne, obszary ONW, Natura 2000, ortofotomapa.' },
];

export default function DzialkiPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#5d7c1f' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          ARiMR · Geoportal
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Mapy działek rolnych</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Geoportal ARiMR to oficjalne narzędzie do sprawdzania granic działek, kontroli agrotechnicznych i dopłat bezpośrednich.
        Wymaga przejścia do zewnętrznego portalu - integracja iframe nie jest możliwa (X-Frame-Options).
      </p>

      <a href="https://geoportal.arimr.gov.pl" target="_blank" rel="noopener noreferrer"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', background: '#5d7c1f', color: '#fff',
          borderRadius: 10, textDecoration: 'none', fontWeight: 500, fontSize: 15,
          marginBottom: 28,
        }}>
        Otwórz Geoportal ARiMR
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17l10-10M7 7h10v10"/>
        </svg>
      </a>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {KROKI.map(k => (
          <div key={k.n} style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10 }}>
            <div style={{ flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, fontFamily: 'var(--f-mono)' }}>{k.n}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>{k.tytul}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-600)', lineHeight: 1.5 }}>{k.opis}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: <a href="https://geoportal.arimr.gov.pl" target="_blank" rel="noopener noreferrer" style={{ color: '#22A06B' }}>geoportal.arimr.gov.pl</a>
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/centrum-obywatela/dzialki/page.tsx
git commit -m "feat: /centrum-obywatela/dzialki - karta ARiMR Geoportal z instrukcją"
```

---

## Task 9: PKP podstrona (tabela ulg)

**Files:**
- Create: `src/app/centrum-obywatela/transport/page.tsx`

- [ ] **Step 1: Stworzyć statyczną podstronę z tabelą**

`src/app/centrum-obywatela/transport/page.tsx`:
```typescript
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ulgi PKP - kto ile płaci za pociąg | Centrum Obywatela',
  description: 'Pełna tabela ulg PKP, Intercity, Polregio - student, senior, KDR, niepełnosprawni, dziecko.',
};

const ULGI = [
  { grupa: 'Dziecko do 4 lat', ulga: '100%', warunek: 'Bez wykupywania biletu, na rękach opiekuna' },
  { grupa: 'Dziecko 4-6 lat', ulga: '78%', warunek: 'Bilet ulgowy bez dokumentów' },
  { grupa: 'Uczeń do 24 lat', ulga: '37%', warunek: 'Legitymacja szkolna; bilety jednorazowe i miesięczne' },
  { grupa: 'Uczeń - bilety miesięczne (szkoła ↔ dom)', ulga: '49%', warunek: 'Legitymacja szkolna + bilet miesięczny imienny' },
  { grupa: 'Student do 26 lat', ulga: '51%', warunek: 'Legitymacja studencka; jednorazowe i miesięczne' },
  { grupa: 'Senior 60+', ulga: '30%', warunek: 'Bilet jednorazowy 2 klasy Intercity/EIC/EIP/TLK; dokument tożsamości' },
  { grupa: 'Emeryt/rencista (renta z tytułu niezdolności)', ulga: '37%', warunek: 'Legitymacja emeryta/rencisty; 2 jednorazowe bilety/rok' },
  { grupa: 'Karta Dużej Rodziny - rodzic', ulga: '37%', warunek: 'KDR + bilet jednorazowy' },
  { grupa: 'Karta Dużej Rodziny - dziecko', ulga: '49%', warunek: 'KDR + bilet jednorazowy' },
  { grupa: 'Niepełnosprawny - znaczny stopień + opiekun', ulga: '49%/95%', warunek: 'Niepełnosprawny 49%, opiekun 95% (jednorazowy)' },
  { grupa: 'Niewidomy + przewodnik', ulga: '37%/95%', warunek: 'Niewidomy 37%, przewodnik 95%' },
  { grupa: 'Dziecko niepełnosprawne + opiekun', ulga: '78%/95%', warunek: 'Dziecko 78%, opiekun 95%; do nauki / na rehabilitację' },
  { grupa: 'Kombatant', ulga: '37% / 51%', warunek: 'Legitymacja kombatanta; jednorazowe/miesięczne' },
  { grupa: 'Żołnierz zasadniczej służby wojskowej', ulga: '78%', warunek: 'Książeczka wojskowa' },
];

const LINKI = [
  { tytul: 'Portal Pasażera (rozkład PKP PLK)', url: 'https://portalpasazera.pl', desc: 'Oficjalny rozkład jazdy wszystkich przewoźników kolejowych' },
  { tytul: 'PKP Intercity', url: 'https://www.intercity.pl', desc: 'Bilety na pociągi dalekobieżne EIC/EIP/IC/TLK' },
  { tytul: 'Polregio', url: 'https://polregio.pl', desc: 'Pociągi regionalne (R, RE)' },
];

export default function TransportPage() {
  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px 60px' }}>
      <Link href="/centrum-obywatela" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 18, display: 'inline-block' }}>
        ← Centrum Obywatela
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a01818' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          PKP · ulgi transportowe
        </span>
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6, color: 'var(--ink-900)' }}>Ulgi PKP - kto ile płaci</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-500)', marginBottom: 24, lineHeight: 1.6 }}>
        Pełna tabela ulg ustawowych obowiązujących we wszystkich przewoźnikach kolejowych w Polsce (Intercity, Polregio, Koleje Mazowieckie i in.).
      </p>

      <div style={{ overflow: 'auto', marginBottom: 28, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--white)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--green-50)' }}>
              <th style={th}>Grupa uprawniona</th>
              <th style={{ ...th, width: 90 }}>Ulga</th>
              <th style={th}>Warunek</th>
            </tr>
          </thead>
          <tbody>
            {ULGI.map((u, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={td}>{u.grupa}</td>
                <td style={{ ...td, fontFamily: 'var(--f-mono)', fontWeight: 600, color: 'var(--green-900)' }}>{u.ulga}</td>
                <td style={{ ...td, color: 'var(--ink-600)' }}>{u.warunek}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 12 }}>Sprawdź połączenie i ceny</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {LINKI.map(l => (
          <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', padding: 14, background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 10, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 4 }}>{l.tytul}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.5 }}>{l.desc}</div>
          </a>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-400)' }}>
        Źródło: Ustawa z 20.06.1992 o uprawnieniach do ulgowych przejazdów; portalpasazera.pl.
      </p>
    </main>
  );
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, fontFamily: 'var(--f-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-500)', fontWeight: 600 };
const td: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'top' };
```

- [ ] **Step 2: Commit**

```bash
git add src/app/centrum-obywatela/transport/page.tsx
git commit -m "feat: /centrum-obywatela/transport - tabela ulg PKP + linki"
```

---

## Task 10: Hub - reorganizacja per audience

**Files:**
- Modify: `src/app/centrum-obywatela/page.tsx` (kompletne przepisanie)

- [ ] **Step 1: Przepisać hub na sekcje per audience**

`src/app/centrum-obywatela/page.tsx`:
```typescript
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Centrum Obywatela - darmowe narzędzia urzędowe | wezmezadarmo',
  description: '11 narzędzi z oficjalnych polskich API: NFZ, NBP, GIOŚ, Biała Lista VAT, IMGW/RCB, ELI/Sejm, BDL GUS, ARiMR, PKP. Bez logowania.',
};

interface Tool {
  href: string;
  icon: string;
  label: string;
  desc: string;
  badge: string;
  color: string;
  audiences: string[];
}

const TOOLS: Tool[] = [
  { href: '/nfz', icon: 'N', label: 'NFZ - kolejki i lekarze', desc: 'Czasy oczekiwania, najbliższy lekarz, refundacja leków', badge: 'na żywo', color: '#1B5E20',
    audiences: ['rolnik', 'senior', 'rodzina', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/kursy', icon: 'K', label: 'Kursy walut NBP', desc: 'Aktualne kursy + konwerter na PLN', badge: 'codziennie', color: '#CC0000',
    audiences: ['firma', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/powietrze', icon: 'A', label: 'Jakość powietrza GIOŚ', desc: 'Indeks PM10/PM2.5 dla Twojej lokalizacji', badge: 'na żywo', color: '#00695C',
    audiences: ['senior', 'rodzina', 'wszyscy'] },
  { href: '/centrum-obywatela/biala-lista', icon: 'V', label: 'Biała Lista VAT', desc: 'Sprawdź kontrahenta po NIP. Status VAT, konta, KRS', badge: 'na żywo', color: '#4527A0',
    audiences: ['firma'] },
  { href: '/centrum-obywatela/pogoda', icon: 'P', label: 'Ostrzeżenia IMGW/RCB', desc: 'Burze, powodzie, mróz, smog. Alerty RCB co 15 min', badge: 'na żywo', color: '#c4841a',
    audiences: ['rolnik', 'senior', 'rodzina', 'wszyscy'] },
  { href: '/centrum-obywatela/prawo', icon: 'P', label: 'Zmiany w prawie (ELI/Sejm)', desc: 'Tracker ustaw i rozporządzeń o świadczeniach', badge: 'co 30 min', color: '#003874',
    audiences: ['senior', 'firma', 'student', 'wszyscy'] },
  { href: '/centrum-obywatela/gus', icon: 'G', label: 'Dane gminy (BDL GUS)', desc: 'Ludność, bezrobocie, wynagrodzenia w Twojej gminie', badge: 'wyszukiwarka', color: '#004B8D',
    audiences: ['rolnik', 'firma', 'wszyscy'] },
  { href: '/centrum-obywatela/dzialki', icon: 'D', label: 'Geoportal ARiMR', desc: 'Mapy działek rolnych, dopłaty bezpośrednie', badge: 'link + instrukcja', color: '#5d7c1f',
    audiences: ['rolnik'] },
  { href: '/centrum-obywatela/transport', icon: 'T', label: 'Ulgi PKP', desc: 'Tabela ulg dla studenta, seniora, KDR, niepełnosprawnych', badge: 'tabela', color: '#a01818',
    audiences: ['senior', 'student', 'rodzina'] },
  { href: '/aktualnosci', icon: 'R', label: 'Aktualności RSS', desc: 'Agregator z 8 instytucji państwowych', badge: '2x/dzień', color: '#003874',
    audiences: ['firma', 'wszyscy'] },
  { href: '/swiadczenia', icon: 'S', label: 'Świadczenia i ulgi', desc: '117+ świadczeń ZUS, NFZ, PFRON, KRUS, MOPS', badge: 'baza wiedzy', color: '#22A06B',
    audiences: ['rolnik', 'senior', 'rodzina', 'student', 'wszyscy'] },
];

interface Audience { slug: string; label: string; desc: string }
const AUDIENCES: Audience[] = [
  { slug: 'rolnik', label: 'Rolnik (KRUS)', desc: 'Pogoda, działki, dane gminy, świadczenia KRUS' },
  { slug: 'senior', label: 'Senior i pacjent', desc: 'NFZ, GIOŚ, zmiany w przepisach, ulgi PKP' },
  { slug: 'rodzina', label: 'Rodzina z dziećmi', desc: 'NFZ dla dziecka, smog, ulgi PKP, aktualności' },
  { slug: 'student', label: 'Student', desc: 'Ulgi PKP, NFZ, kursy walut, zmiany w prawie' },
  { slug: 'firma', label: 'Przedsiębiorca / JDG', desc: 'Biała Lista, kursy NBP, dane rynku, aktualności' },
  { slug: 'wszyscy', label: 'Wszyscy obywatele', desc: 'Świadczenia, aktualności, NBP, GIOŚ' },
];

export default function CentrumObywatelaPage() {
  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 7px rgba(34,160,107,0.55)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Centrum Obywatela
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 700, marginBottom: 10, color: 'var(--ink-900)', lineHeight: 1.2 }}>
        11 darmowych narzędzi urzędowych
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-500)', marginBottom: 36, lineHeight: 1.6, maxWidth: 760 }}>
        Pogrupowane po grupach docelowych - znajdź narzędzia, których potrzebujesz. Wszystko z oficjalnych polskich API,
        bez logowania, bez opłat.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {AUDIENCES.map(aud => {
          const tools = TOOLS.filter(t => t.audiences.includes(aud.slug));
          if (tools.length === 0) return null;
          return (
            <section key={aud.slug}>
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink-900)', margin: 0, marginBottom: 4 }}>{aud.label}</h2>
                <p style={{ fontSize: 13, color: 'var(--ink-500)', margin: 0 }}>{aud.desc}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 12 }}>
                {tools.map(t => (
                  <Link key={t.href + aud.slug} href={t.href} className="card card-hover"
                    style={{ display: 'block', textDecoration: 'none', padding: 18, position: 'relative', overflow: 'hidden' }}>
                    <span style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                      background: `linear-gradient(90deg, transparent, ${t.color}, transparent)`,
                      opacity: 0.5,
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: t.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--f-mono)', fontSize: 14, fontWeight: 700, flexShrink: 0,
                      }}>{t.icon}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)', letterSpacing: '-0.01em' }}>{t.label}</div>
                        <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: t.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>{t.badge}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.5, margin: 0 }}>{t.desc}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div style={{ marginTop: 40, padding: '18px 22px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--green-900)', lineHeight: 1.6 }}>
          <strong>Wszystkie dane z oficjalnych API rządowych:</strong> api.nfz.gov.pl, api.nbp.pl, api.gios.gov.pl, wl-api.mf.gov.pl, rcb.gov.pl, api.sejm.gov.pl/eli, bdl.stat.gov.pl, geoportal.arimr.gov.pl, portalpasazera.pl.
          Bez profilowania, bez plików cookie. Dane pobierane na żądanie.
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: tsc + smoke (hub renderuje wszystkie sekcje)**

```bash
npx tsc --noEmit
# dev → /centrum-obywatela → sprawdź 6 sekcji
```

- [ ] **Step 3: Commit**

```bash
git add src/app/centrum-obywatela/page.tsx
git commit -m "feat: hub Centrum Obywatela - reorganizacja per audience (6 grup, 11 narzedzi)"
```

---

## Task 11: AI chat - 3 nowe prefetchery

**Files:**
- Modify: `src/app/api/agent/chat/route.ts`

- [ ] **Step 1: Dodać funkcje maybeFetchImgw, maybeFetchEli, maybeFetchBdlGus**

Wstawić w `src/app/api/agent/chat/route.ts` przed komentarzem `// Glowna funkcja prefetch - rownoleglie wszystkie 5 zrodel live` (linia 355):

```typescript
// Smart prefetch: IMGW/RCB ostrzezenia gdy user pyta o pogode/burze/alerty
async function maybeFetchImgw(text: string): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsWeather = /\b(pogod|burz|mr[oó]z|przymrozk|pow[oó]d[zź]|opad|wichur|alert.*pogod|rcb|ostrze[zż]eni|gradobic|smog)/.test(lc);
  if (!wantsWeather) return null;

  try {
    const res = await fetch('https://rcb.gov.pl/feed/', {
      headers: { Accept: 'application/rss+xml,text/xml,*/*', 'User-Agent': 'wezmezadarmo/1.0' },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const items: Array<{ title: string; link: string }> = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
    let m: RegExpExecArray | null;
    while ((m = itemRegex.exec(xml)) !== null && items.length < 3) {
      const titleMatch = m[1].match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch = m[1].match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const title = (titleMatch?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      const link = (linkMatch?.[1] ?? '').trim();
      if (title) items.push({ title, link });
    }
    if (items.length === 0) {
      return `IMGW/RCB: brak aktywnych ostrzezen. Sytuacja meteo w normie.`;
    }
    const lines = items.map(i => `  - ${i.title}${i.link ? ` (${i.link})` : ''}`).join('\n');
    return `IMGW/RCB OSTRZEZENIA AKTYWNE (${items.length}):\n${lines}\n  Pelna lista: https://wezmezadarmo.com/centrum-obywatela/pogoda`;
  } catch {
    return null;
  }
}

// Smart prefetch: ELI/Sejm zmiany w prawie gdy user pyta o nowelizacje
async function maybeFetchEli(text: string): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsLaw = /\b(zmian.*praw|zmian.*przepis|nowelizacj|ustawa o|nowy przepis|kiedy wejdzie w [zż]ycie|projekt ustaw)/.test(lc);
  if (!wantsLaw) return null;

  try {
    const year = new Date().getFullYear();
    const res = await fetch(`https://api.sejm.gov.pl/eli/acts/DU/${year}?limit=30&offset=0`, {
      headers: { Accept: 'application/json', 'User-Agent': 'wezmezadarmo/1.0' },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items = (data.items ?? data ?? []) as Array<{ ELI?: string; title?: string; type?: string; announcementDate?: string }>;
    const keywords = ['swiadczenie', 'zasilek', 'ulga', 'dodatek', 'emerytura', 'zus', 'krus', 'refundacj', '800+'];
    const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const matched = items.filter(it => it.title && keywords.some(k => norm(it.title!).includes(k))).slice(0, 5);
    if (matched.length === 0) return null;
    const lines = matched.map(a => `  - ${a.type ?? ''}: ${a.title}${a.announcementDate ? ` (ogl. ${a.announcementDate})` : ''}`).join('\n');
    return `OSTATNIE ZMIANY W PRZEPISACH O SWIADCZENIACH (${year}, top ${matched.length}):\n${lines}\n  Pelna lista: https://wezmezadarmo.com/centrum-obywatela/prawo`;
  } catch {
    return null;
  }
}

// Smart prefetch: BDL GUS dane gminy gdy user pyta o swoja gmine
async function maybeFetchBdlGus(text: string, userProvince: string | null): Promise<string | null> {
  const lc = text.toLowerCase();
  const wantsGmina = /\b(moja gmina|w gminie|ludno[sś][cć]|bezrobocie w|dane.*gmin|statystyk.*gmin|gus.*gmin)/.test(lc);
  if (!wantsGmina) return null;

  // Wymaga gminy w wiadomosci albo wojewodztwa z profilu
  const gminaMatch = text.match(/(?:gmin[aęy][\s:]+|w gminie\s+)([A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż-]+)/i);
  const gmina = gminaMatch?.[1];
  if (!gmina && !userProvince) {
    return `BDL GUS: aby pobrac dane, podaj nazwe gminy ("dane gminy Warszawa") lub uzupelnij wojewodztwo w profilu. Wyszukiwarka: https://wezmezadarmo.com/centrum-obywatela/gus`;
  }
  if (!gmina) return null;

  try {
    const sRes = await fetch(`https://bdl.stat.gov.pl/api/v1/units/search?name=${encodeURIComponent(gmina)}&level=5&format=json&page-size=1`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const unit = (sData.results ?? [])[0] as { id: string; name: string; parentName?: string } | undefined;
    if (!unit) return `BDL GUS: nie znaleziono gminy "${gmina}". Sprawdz pisownie na https://wezmezadarmo.com/centrum-obywatela/gus`;

    const vars = ['60559', '459163', '60270'].join(',');
    const dRes = await fetch(`https://bdl.stat.gov.pl/api/v1/data/by-unit/${unit.id}?var-id=${vars}&format=json`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!dRes.ok) return null;
    const dData = await dRes.json();
    const byId = new Map((dData.results ?? []).map((r: { id: string; values: Array<{ val: number; year: string }> }) => [r.id, r]));
    const last = (id: string) => {
      const r = byId.get(id) as { values: Array<{ val: number; year: string }> } | undefined;
      const v = r?.values?.[r.values.length - 1];
      return v ? { val: v.val, year: v.year } : null;
    };
    const pop = last('60559');
    const unemp = last('459163');
    const sal = last('60270');
    return [
      `BDL GUS - dane gminy ${unit.name}${unit.parentName ? ` (${unit.parentName})` : ''}:`,
      pop ? `  Ludnosc: ${pop.val.toLocaleString('pl-PL')} (${pop.year})` : '',
      unemp ? `  Bezrobocie: ${unemp.val}% (${unemp.year})` : '',
      sal ? `  Przecietne wynagrodzenie: ${sal.val.toLocaleString('pl-PL')} PLN brutto (${sal.year})` : '',
      `  Wiecej: https://wezmezadarmo.com/centrum-obywatela/gus`,
    ].filter(Boolean).join('\n');
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Wpiąć nowe prefetchery do `buildLivePrefetch`**

Zmodyfikować `buildLivePrefetch` (obecnie linia ~356):

```typescript
async function buildLivePrefetch(lastUserMsg: string, opts: PrefetchOpts): Promise<string | null> {
  const [nbp, whitelist, nfz, gios, ceidg, imgw, eli, bdl] = await Promise.all([
    maybeFetchNbp(lastUserMsg),
    maybeFetchWhitelist(lastUserMsg),
    maybeFetchNfz(lastUserMsg, opts.userProvince),
    maybeFetchGios(lastUserMsg, opts.userProvince),
    maybeFetchCeidg(lastUserMsg, opts.profileNip, opts.isJdg),
    maybeFetchImgw(lastUserMsg),
    maybeFetchEli(lastUserMsg),
    maybeFetchBdlGus(lastUserMsg, opts.userProvince),
  ]);
  const parts = [nbp, whitelist, nfz, gios, ceidg, imgw, eli, bdl].filter((p): p is string => p !== null);
  if (parts.length === 0) return null;
  return `DANE LIVE POBRANE NA POTRZEBY TEJ ROZMOWY:\n\n${parts.join('\n\n')}`;
}
```

- [ ] **Step 3: tsc + commit**

```bash
npx tsc --noEmit
git add src/app/api/agent/chat/route.ts
git commit -m "feat: AI chat - prefetch IMGW/ELI/BDL GUS (3 nowe handlery, total 8 zrodel live)"
```

---

## Task 12: BASE_LIVE_SOURCES - dopisać 5 narzędzi

**Files:**
- Modify: `src/agents/base-prompt.ts`

- [ ] **Step 1: Dodać 5 pozycji do BASE_LIVE_SOURCES**

W `src/agents/base-prompt.ts` po pozycji 6 (Aktualności RSS), przed `WAŻNE:` blokiem (linia ~137), wstawić:

```typescript
7. IMGW / RCB -- ostrzeżenia meteo i kryzysowe:
   - URL: /centrum-obywatela/pogoda
   - Backend API: /api/public/imgw (30 req/min/IP)
   - Źródło: rcb.gov.pl/feed (oficjalne)
   - Alerty: burze, opady, mróz, powodzie, smog, wichury. Aktualizacja co 15 min.
   - Polecaj gdy: rolnik (prace polowe), alergik (PM10/smog), planuje wyjazd, ma dziecko z astmą

8. ELI / Sejm -- tracker zmian w prawie:
   - URL: /centrum-obywatela/prawo
   - Backend API: /api/public/eli-sejm?q=keyword (30 req/min/IP)
   - Źródło: api.sejm.gov.pl/eli
   - Lista ostatnich ustaw i rozporządzeń filtrowanych po słowach: świadczenie, zasiłek, ulga, ZUS, KRUS, refundacja
   - Polecaj gdy: "co zmienia się w X", "kiedy wejdzie nowa ustawa o Y", "nowelizacja kosiniakowego"

9. BDL GUS -- dane demograficzne i ekonomiczne per gmina:
   - URL: /centrum-obywatela/gus
   - Backend API: /api/public/bdl-gus?gmina= albo ?terytId= (30 req/min/IP)
   - Źródło: bdl.stat.gov.pl
   - Pokazuje: ludność (ogółem, przed/poprodukcyjna), bezrobocie %, przeciętne wynagrodzenie
   - Polecaj gdy: user pyta o swoją gminę/powiat, kontekst lokalny dla świadczeń, planowanie biznesu

10. ARiMR Geoportal -- mapy działek rolnych:
    - URL: /centrum-obywatela/dzialki
    - Link + instrukcja (brak API - geoportal.arimr.gov.pl wymaga przejścia)
    - Granice działek, kontrole agro, dopłaty bezpośrednie, ONW, Natura 2000
    - Polecaj gdy: rolnik pyta o działki, dopłaty, kontrolę, oznaczenie działki na mapie

11. PKP - tabela ulg transportowych:
    - URL: /centrum-obywatela/transport
    - Statyczna tabela (brak API; rozkład pod portalpasazera.pl)
    - Pełna lista ulg: student 51%, senior 30%, KDR 37-49%, niepełnosprawni 49/95%, dziecko 78%
    - Polecaj gdy: senior/student/rodzic/niepełnosprawny pyta o tańszy transport, plan wyjazdu

```

I update top karty: `Wszystko dostępne pod hubem CENTRUM OBYWATELA: /centrum-obywatela` zostaje, ale w drugiej linii ("NIE udawaj że...") - bez zmian. Numerologia `11 narzędzi` (było 6).

- [ ] **Step 2: tsc + commit**

```bash
npx tsc --noEmit
git add src/agents/base-prompt.ts
git commit -m "feat: BASE_LIVE_SOURCES +5 narzedzi (IMGW, ELI, BDL, ARiMR, PKP) - razem 11"
```

---

## Task 13: VAT chip banner na landingu po CEIDG

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Dodać `companyName` + `vatStatus` do profile state**

W `src/app/page.tsx` znajdź `handleIntakeSubmit` (linia ~379) - tam już mamy `statusVat: ceidg.vat?.status`. Dodaj zapamiętanie nazwy firmy:

Zmienić blok przypisania profilu (linia ~393-399):

```typescript
if (res.ok) {
  const ceidg: CeidgBusinessData & { vat?: { status: string | null; registeredAt: string | null; removedAt: string | null } | null } = await res.json();
  setProfile((prev) => ({
    ...prev,
    prowadzDzialalnosc: ceidg.aktywna,
    dataDzialalnosci: ceidg.dataRejestracji ?? undefined,
    pkd: ceidg.pkd,
    statusVat: ceidg.vat?.status ?? undefined,
    nazwaFirmy: ceidg.nazwa ?? undefined,
  }));
}
```

Sprawdź `CeidgBusinessData` typ w `src/lib/ceidg.ts` - upewnij się że pole `nazwa` istnieje. Jeśli nie - użyj pola jakie jest (`firma`, `companyName` itp).

- [ ] **Step 2: Sprawdzić rzeczywiste pola CeidgBusinessData**

```bash
grep -n "interface CeidgBusinessData\|nazwa\|firma" src/lib/ceidg.ts
```

Dopasuj kod z kroku 1 do rzeczywistego pola.

- [ ] **Step 3: Wyrenderować banner-success ponad pierwszym pytaniem**

Znajdź miejsce w `page.tsx` gdzie renderowane jest pierwsze pytanie (phase === 'questions'). Wstaw na górze - tylko gdy `questionIndex === 0 && profile.statusVat`:

```tsx
{phase === 'questions' && questionIndex === 0 && profile.statusVat && (
  <div style={{
    maxWidth: 640, margin: '0 auto 20px',
    padding: '12px 18px',
    background: profile.statusVat === 'Czynny' ? 'var(--green-50)'
      : profile.statusVat === 'Zwolniony' ? 'rgba(196, 132, 26, 0.08)'
      : 'rgba(150, 150, 150, 0.08)',
    border: `1px solid ${profile.statusVat === 'Czynny' ? 'var(--green-200)'
      : profile.statusVat === 'Zwolniony' ? 'rgba(196, 132, 26, 0.25)'
      : 'rgba(150, 150, 150, 0.25)'}`,
    borderRadius: 12,
    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
  }}>
    <span style={{
      padding: '4px 10px', borderRadius: 999,
      background: profile.statusVat === 'Czynny' ? '#22A06B' : profile.statusVat === 'Zwolniony' ? '#c4841a' : '#888',
      color: '#fff', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      VAT: {profile.statusVat}
    </span>
    <span style={{ fontSize: 13, color: 'var(--color-text-2)' }}>
      {profile.nazwaFirmy ? `Wykryto firmę: ${profile.nazwaFirmy}` : 'Status z Białej Listy MF'}
    </span>
    <a href="/centrum-obywatela/biala-lista" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>
      Pełne dane →
    </a>
  </div>
)}
```

Wstaw tak, by banner pojawiał się NAD pierwszym pytaniem ale POD heroem. Sprawdź jak renderowane są pytania w `page.tsx` i wstaw banner odpowiednio.

- [ ] **Step 4: Rozszerzyć UserProfile o `nazwaFirmy` jeśli brak**

```bash
grep -n "nazwaFirmy\|interface UserProfile" src/engine/types.ts
```

Jeśli `nazwaFirmy` nie istnieje w UserProfile - dodać jako `nazwaFirmy?: string;`.

- [ ] **Step 5: tsc + smoke**

```bash
npx tsc --noEmit
# dev → / → wprowadź realny NIP → przejdź dalej → sprawdź banner
```

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/engine/types.ts
git commit -m "feat: landing - banner VAT po CEIDG (status z Bialej Listy)"
```

---

## Task 14: /aktualnosci - widgety IMGW + ELI

**Files:**
- Modify: `src/app/aktualnosci/page.tsx`

- [ ] **Step 1: Import + render dwóch nowych widgetów**

W `src/app/aktualnosci/page.tsx`:

1. Dodać importy obok istniejących (linia 5-6):
```typescript
import { ImgwAlertWidget } from '@/components/ImgwAlertWidget';
import { EliChangesWidget } from '@/components/EliChangesWidget';
```

2. W bloku gdzie renderuje się `<AirQualityWidget />` + `<NbpRatesWidget />` (~linia 143) zmienić grid layout na 4 widgety:

Zlokalizuj bieżący kod:
```tsx
{/* Live data widgets: air quality + currency rates */}
<...>
  <AirQualityWidget />
  <NbpRatesWidget />
</...>
```

Zmienić zewnętrzny container na `display: grid; gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'; gap: 14` (jeśli już taki - bez zmian). Dodać:

```tsx
<AirQualityWidget />
<NbpRatesWidget />
<ImgwAlertWidget />
<EliChangesWidget />
```

- [ ] **Step 2: tsc + smoke**

```bash
npx tsc --noEmit
# dev → /aktualnosci → 4 widgety w grid
```

- [ ] **Step 3: Commit**

```bash
git add src/app/aktualnosci/page.tsx
git commit -m "feat: /aktualnosci dodano widgety IMGW i ELI (razem 4 live widgety)"
```

---

## Task 15: /o-projekcie - update opisu Centrum + SOURCES

**Files:**
- Modify: `src/app/o-projekcie/page.tsx`

- [ ] **Step 1: Update karty Centrum Obywatela w MODULES**

W `src/app/o-projekcie/page.tsx` znajdź wpis dla `/centrum-obywatela` (linie 42-49) i zaktualizować `desc`:

```typescript
{
  href: '/centrum-obywatela',
  label: 'Centrum obywatela',
  badge: 'Bezpłatny',
  badgeTone: 'green',
  icon: 'C',
  desc: 'Hub 11 publicznych narzędzi: NFZ (kolejki, lekarze), NBP (kursy walut), GIOŚ (powietrze), Biała Lista VAT, IMGW/RCB (ostrzeżenia), ELI/Sejm (zmiany w prawie), BDL GUS (dane gminy), ARiMR (mapy działek), PKP (tabela ulg). Wszystko z oficjalnych polskich API, bez logowania.',
},
```

- [ ] **Step 2: Dodać nowe źródła do SOURCES**

W tej samej tablicy SOURCES (linia 68-78) dodać:

```typescript
{ id: 'rcb', name: 'rcb.gov.pl', desc: 'ostrzeżenia meteo i kryzysowe (powódź, burze, mróz, smog)' },
{ id: 'eli', name: 'api.sejm.gov.pl/eli', desc: 'zmiany w przepisach: Dziennik Ustaw, projekty ustaw' },
{ id: 'bdl', name: 'bdl.stat.gov.pl', desc: 'GUS - dane demograficzne, bezrobocie, wynagrodzenia per gmina' },
{ id: 'arimr', name: 'geoportal.arimr.gov.pl', desc: 'mapy działek rolnych, kontrole agrotechniczne, dopłaty' },
{ id: 'pkp', name: 'portalpasazera.pl', desc: 'rozkład jazdy PKP + tabela ulg ustawowych dla pasażerów' },
```

- [ ] **Step 3: tsc + smoke**

```bash
npx tsc --noEmit
# dev → /o-projekcie → sprawdź opis i listę źródeł
```

- [ ] **Step 4: Commit**

```bash
git add src/app/o-projekcie/page.tsx
git commit -m "docs: /o-projekcie - update opisu Centrum + 5 nowych zrodel"
```

---

## Task 16: E2E sanity + raport końcowy

**Files:**
- Run only

- [ ] **Step 1: TypeScript strict**

```bash
npx tsc --noEmit
```

Expected: zero błędów. Jeśli są - napraw przed dalszymi krokami.

- [ ] **Step 2: Build produkcyjny**

```bash
npx next build
```

Expected: zielony, wszystkie strony skompilowane (włącznie z `/centrum-obywatela/{pogoda,prawo,gus,dzialki,transport}`).

- [ ] **Step 3: Vitest pełny**

```bash
npx vitest run
```

Expected: passy w istniejących + 3 nowe pliki testowe (imgw, eli-sejm, bdl-gus) przechodzą.

- [ ] **Step 4: Lokalny smoke 5 URL**

```bash
npm run dev
```

Otwórz w przeglądarce każdy:
- `/centrum-obywatela` - 6 sekcji per audience, 11 kart
- `/centrum-obywatela/pogoda` - lista alertów RCB albo "brak ostrzeżeń"
- `/centrum-obywatela/prawo` - lista zmian w prawie + search
- `/centrum-obywatela/gus` - search po "Warszawa" → klik → dane
- `/centrum-obywatela/dzialki` - karta ARiMR + przycisk
- `/centrum-obywatela/transport` - tabela ulg
- `/aktualnosci` - 4 widgety w grid (AQI + NBP + IMGW + ELI)
- `/o-projekcie` - opis i nowe źródła
- `/` - wprowadź realny NIP → banner VAT na pierwszym pytaniu

- [ ] **Step 5: Raport końcowy do exHuman**

Wygenerować w czacie podsumowanie:
- Pliki utworzone (lista paths)
- Pliki zmodyfikowane (lista paths)
- 5 nowych integracji: status każdej (działa / fallback / błąd)
- Komenda do deploy (jeśli zwykle: `git push`)
- Lista do testów manualnych w produkcji (URLe + co kliknąć)

- [ ] **Step 6: Brak commitu - tylko raport**

Wszystkie commity już zrobione w poprzednich taskach. Ten task to weryfikacja.
