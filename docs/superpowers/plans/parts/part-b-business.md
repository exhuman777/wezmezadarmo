# Part B: Business Logic + APIs (Tasks 7-13)

Project: `/Users/trading/cyfrowy-pomocnik/`
Scope: Company profile API, reminders API, brief generation, Firecrawl news scraping, cron endpoints, action items API, vercel.json.

---

### Task 7: Company Profile API

**Files:**
- Create: `src/app/api/cp/company/route.ts`

- [ ] **Step 1: Create company CRUD route**

```typescript
// src/app/api/cp/company/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: company, error } = await supabase
    .from('cp_companies')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ company });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, nip, branza, opis, pain_points } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Pole "name" jest wymagane' }, { status: 400 });
  }
  if (!branza || typeof branza !== 'string' || branza.trim().length === 0) {
    return NextResponse.json({ error: 'Pole "branza" jest wymagane' }, { status: 400 });
  }

  const payload = {
    user_id: session.user.id,
    name: name.trim(),
    nip: nip?.trim() ?? null,
    branza: branza.trim(),
    opis: opis?.trim() ?? null,
    pain_points: pain_points?.trim() ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: company, error } = await supabase
    .from('cp_companies')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ company });
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/api/cp/company/route.ts && git commit -m "feat: company profile GET/POST API (cp_companies upsert)"
```

---

### Task 8: Reminders API

**Files:**
- Create: `src/app/api/cp/reminders/route.ts`
- Create: `src/app/api/cp/reminders/[id]/route.ts`

- [ ] **Step 1: Create reminders list + create route**

```typescript
// src/app/api/cp/reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: reminders, error } = await supabase
    .from('cp_reminders')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('status', 'active')
    .order('due_date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminders });
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, due_date, type } = body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Pole "title" jest wymagane' }, { status: 400 });
  }
  if (!due_date || typeof due_date !== 'string') {
    return NextResponse.json({ error: 'Pole "due_date" jest wymagane (YYYY-MM-DD)' }, { status: 400 });
  }
  if (!type || typeof type !== 'string') {
    return NextResponse.json({ error: 'Pole "type" jest wymagane' }, { status: 400 });
  }

  const { data: reminder, error } = await supabase
    .from('cp_reminders')
    .insert({
      user_id: session.user.id,
      title: title.trim(),
      due_date,
      type,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminder }, { status: 201 });
}
```

- [ ] **Step 2: Create reminder update + delete route**

```typescript
// src/app/api/cp/reminders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !['done', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'status musi być "done" lub "dismissed"' }, { status: 400 });
  }

  // Verify ownership first
  const { data: existing } = await supabase
    .from('cp_reminders')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Nie znaleziono przypomnienia' }, { status: 404 });
  }

  const { data: reminder, error } = await supabase
    .from('cp_reminders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminder });
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const { data: existing } = await supabase
    .from('cp_reminders')
    .select('id')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Nie znaleziono przypomnienia' }, { status: 404 });
  }

  const { error } = await supabase
    .from('cp_reminders')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/api/cp/reminders/ && git commit -m "feat: reminders API GET/POST/PATCH/DELETE"
```

---

### Task 9: Brief Generation Lib + API

**Files:**
- Create: `src/lib/brief.ts`
- Create: `src/app/api/cp/brief/route.ts`

- [ ] **Step 1: Create brief generation library**

```typescript
// src/lib/brief.ts
import { createSupabaseServer } from '@/lib/supabase';
import { getAI, MODEL } from '@/lib/ai';

export interface ActionItem {
  id: string;
  brief_id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  priority: 'urgent' | 'warn' | 'info' | 'running';
  status: 'pending' | 'approved' | 'dismissed';
  created_at: string;
}

interface RawAction {
  type: string;
  priority: 'urgent' | 'warn' | 'info';
  title: string;
  description: string;
}

interface BriefResult {
  briefId: string;
  summary: string;
  actions: ActionItem[];
}

const BRIEF_PROMPT = `Jesteś Cyfrowym Pomocnikiem dla firmy: {companyName} (branża: {branza}).

Opis firmy: {opis}
Pain points: {painPoints}

Na podstawie poniższych danych wygeneruj dzienny brief z listą akcji do zatwierdzenia.

NEWSY BRANŻOWE (ostatnie 24h):
{newsItems}

NADCHODZĄCE TERMINY (30 dni):
{reminders}

Odpowiedz WYŁĄCZNIE w JSON (bez markdown):
{
  "summary": "krótkie podsumowanie dnia 1-2 zdania",
  "actions": [
    {
      "type": "faktura|terminarz|marketing|prawo|dotacje|ogolny",
      "priority": "urgent|warn|info",
      "title": "konkretny tytuł akcji",
      "description": "szczegóły, co dokładnie AI proponuje zrobić"
    }
  ]
}

Generuj TYLKO realne akcje na podstawie dostarczonych danych. Maksymalnie 5 akcji. Priorytetyzuj.`;

function buildPrompt(
  companyName: string,
  branza: string,
  opis: string,
  painPoints: string,
  newsItems: string,
  reminders: string,
): string {
  return BRIEF_PROMPT
    .replace('{companyName}', companyName)
    .replace('{branza}', branza)
    .replace('{opis}', opis)
    .replace('{painPoints}', painPoints)
    .replace('{newsItems}', newsItems)
    .replace('{reminders}', reminders);
}

export async function generateBrief(userId: string): Promise<BriefResult> {
  const supabase = await createSupabaseServer();

  // 1. Fetch company profile
  const { data: company, error: companyError } = await supabase
    .from('cp_companies')
    .select('name, branza, opis, pain_points')
    .eq('user_id', userId)
    .maybeSingle();

  if (companyError) throw new Error(`Błąd pobierania profilu firmy: ${companyError.message}`);
  if (!company) throw new Error('Brak profilu firmy dla użytkownika');

  // 2. Fetch news from last 24h
  const { data: newsRows } = await supabase
    .from('cp_news_items')
    .select('title, summary, source, url')
    .eq('user_id', userId)
    .gt('scraped_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('scraped_at', { ascending: false })
    .limit(20);

  const newsText = newsRows && newsRows.length > 0
    ? newsRows.map((n, i) => `${i + 1}. [${n.source}] ${n.title}\n   ${n.summary ?? '(brak opisu)'}\n   URL: ${n.url}`).join('\n\n')
    : 'Brak nowych wiadomości w ciągu ostatnich 24 godzin.';

  // 3. Fetch upcoming reminders (30 days)
  const thirtyDaysOut = new Date();
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

  const { data: reminderRows } = await supabase
    .from('cp_reminders')
    .select('title, due_date, type')
    .eq('user_id', userId)
    .lte('due_date', thirtyDaysOut.toISOString().split('T')[0])
    .eq('status', 'active')
    .order('due_date', { ascending: true })
    .limit(10);

  const remindersText = reminderRows && reminderRows.length > 0
    ? reminderRows.map(r => `- ${r.due_date}: [${r.type}] ${r.title}`).join('\n')
    : 'Brak nadchodzących terminów.';

  // 4. Fetch pending actions from yesterday still pending
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: pendingOld } = await supabase
    .from('cp_action_items')
    .select('title, type, priority')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lt('created_at', yesterday);

  if (pendingOld && pendingOld.length > 0) {
    const pendingText = pendingOld.map(a => `- [${a.priority}] ${a.title}`).join('\n');
    // Append to reminders so Claude is aware
    const combined = remindersText + '\n\nNIEZATWIERDZONE AKCJE Z POPRZEDNIEGO DNIA:\n' + pendingText;

    return buildAndSaveBrief(userId, company, newsText, combined, supabase);
  }

  return buildAndSaveBrief(userId, company, newsText, remindersText, supabase);
}

async function buildAndSaveBrief(
  userId: string,
  company: { name: string; branza: string; opis: string | null; pain_points: string | null },
  newsText: string,
  remindersText: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>,
): Promise<BriefResult> {
  const prompt = buildPrompt(
    company.name,
    company.branza,
    company.opis ?? 'Brak opisu.',
    company.pain_points ?? 'Brak.',
    newsText,
    remindersText,
  );

  // 5. Call AI
  const ai = getAI();
  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  const rawContent = response.choices[0]?.message?.content ?? '{}';

  let parsed: { summary: string; actions: RawAction[] };
  try {
    // Strip markdown code blocks if present
    const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`AI zwróciło nieprawidłowy JSON: ${rawContent.substring(0, 200)}`);
  }

  const summary = parsed.summary ?? '';
  const rawActions: RawAction[] = Array.isArray(parsed.actions) ? parsed.actions.slice(0, 5) : [];

  // 6. Insert brief
  const { data: brief, error: briefError } = await supabase
    .from('cp_daily_briefs')
    .insert({
      user_id: userId,
      summary_text: summary,
      generated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (briefError) throw new Error(`Błąd zapisu briefu: ${briefError.message}`);

  // 7. Insert action items
  const actionInserts = rawActions.map(a => ({
    brief_id: brief.id,
    user_id: userId,
    type: a.type,
    title: a.title,
    description: a.description,
    priority: a.priority,
    status: 'pending' as const,
  }));

  let savedActions: ActionItem[] = [];

  if (actionInserts.length > 0) {
    const { data: actions, error: actionsError } = await supabase
      .from('cp_action_items')
      .insert(actionInserts)
      .select();

    if (actionsError) throw new Error(`Błąd zapisu akcji: ${actionsError.message}`);
    savedActions = (actions ?? []) as ActionItem[];
  }

  // 8. Return
  return {
    briefId: brief.id,
    summary,
    actions: savedActions,
  };
}
```

- [ ] **Step 2: Create brief API route**

```typescript
// src/app/api/cp/brief/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { generateBrief } from '@/lib/brief';

export async function POST() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await generateBrief(session.user.id);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Nieznany błąd';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the latest brief
  const { data: brief, error: briefError } = await supabase
    .from('cp_daily_briefs')
    .select('*')
    .eq('user_id', session.user.id)
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  if (!brief) {
    return NextResponse.json({ brief: null, actions: [] });
  }

  // Get its action items
  const { data: actions, error: actionsError } = await supabase
    .from('cp_action_items')
    .select('*')
    .eq('brief_id', brief.id)
    .order('created_at', { ascending: true });

  if (actionsError) {
    return NextResponse.json({ error: actionsError.message }, { status: 500 });
  }

  return NextResponse.json({ brief, actions: actions ?? [] });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/brief.ts src/app/api/cp/brief/route.ts && git commit -m "feat: brief generation lib + API (generateBrief, GET latest)"
```

---

### Task 10: Firecrawl News Scraping

**Files:**
- Create: `src/lib/firecrawl.ts`
- Create: `src/app/api/cp/cron/news/route.ts`

- [ ] **Step 1: Create Firecrawl scraping library**

```typescript
// src/lib/firecrawl.ts
import FirecrawlApp from '@mendable/firecrawl-js';
import { createSupabaseServer } from '@/lib/supabase';
import { getAI, MODEL } from '@/lib/ai';
import type { CompanyContext } from '@/types';

interface ScrapedArticle {
  title: string;
  url: string;
  content: string;
  source: string;
}

const NEWS_SOURCES = [
  { url: 'https://www.parp.gov.pl/aktualnosci', source: 'PARP', keywords: ['dotacje', 'dofinansowanie', 'fundusze', 'program'] },
  { url: 'https://www.zus.pl/aktualnosci', source: 'ZUS', keywords: ['zus', 'składki', 'świadczenia', 'emerytury', 'renta'] },
  { url: 'https://www.gov.pl/web/mf/aktualnosci', source: 'MF', keywords: ['podatki', 'ksef', 'vat', 'pit', 'cit', 'faktura'] },
  { url: 'https://stat.gov.pl/aktualnosci/', source: 'GUS', keywords: ['inflacja', 'pkb', 'gospodarka', 'rynek', 'bezrobocie'] },
  { url: 'https://nbp.pl/aktualnosci/', source: 'NBP', keywords: ['stopy procentowe', 'kursy walut', 'inflacja', 'kredyt'] },
  { url: 'https://legislacja.gov.pl/', source: 'Legislacja', keywords: ['ustawa', 'rozporządzenie', 'prawo', 'przepisy', 'nowelizacja'] },
] as const;

function getFirecrawl(): FirecrawlApp {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY nie jest ustawiony');
  return new FirecrawlApp({ apiKey });
}

function isRelevant(title: string, content: string, branza: string, sourceKeywords: readonly string[]): boolean {
  const combined = (title + ' ' + content).toLowerCase();
  const branzaWords = branza.toLowerCase().split(/[\s,]+/).filter(w => w.length > 3);

  // Always include if matches source-specific keywords
  const matchesSource = sourceKeywords.some(kw => combined.includes(kw.toLowerCase()));
  if (!matchesSource) return false;

  // Bonus: matches branza — but include even without branza match (news is general)
  const matchesBranza = branzaWords.some(w => combined.includes(w));
  void matchesBranza; // relevance check is just source keywords for now

  return true;
}

async function summarizeArticle(title: string, content: string): Promise<string> {
  const ai = getAI();
  const truncated = content.substring(0, 2000);

  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `Streść poniższy artykuł w 1-2 zdaniach po polsku. Skup się na tym, co ważne dla małych firm i JDG.\n\nTytuł: ${title}\n\nTreść: ${truncated}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content?.trim() ?? title;
}

export async function scrapeNewsForUser(userId: string, company: CompanyContext): Promise<void> {
  const firecrawl = getFirecrawl();
  const supabase = await createSupabaseServer();

  const scraped: ScrapedArticle[] = [];

  for (const source of NEWS_SOURCES) {
    try {
      const result = await firecrawl.scrapeUrl(source.url, {
        formats: ['markdown'],
        onlyMainContent: true,
        timeout: 15000,
      });

      if (!result.success || !result.markdown) continue;

      const markdown = result.markdown;

      // Extract individual news items: lines that look like article titles (links or headings)
      const lines = markdown.split('\n');
      const articleLines = lines.filter(l => {
        const cleaned = l.trim();
        return (
          (cleaned.startsWith('#') || cleaned.startsWith('[') || cleaned.startsWith('**')) &&
          cleaned.length > 20 &&
          cleaned.length < 300
        );
      });

      // Take top 5 most recent-looking items per source
      const candidates = articleLines.slice(0, 5);

      for (const line of candidates) {
        // Extract URL if present
        const urlMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
        const title = urlMatch ? urlMatch[1] : line.replace(/^#+\s*/, '').replace(/\*\*/g, '').trim();
        const url = urlMatch ? urlMatch[2] : source.url;

        if (!isRelevant(title, markdown.substring(0, 500), company.branza, source.keywords)) continue;

        scraped.push({ title, url, content: markdown.substring(0, 3000), source: source.source });
      }
    } catch {
      // Skip failed sources silently - don't break entire pipeline
      continue;
    }
  }

  if (scraped.length === 0) return;

  // Summarize and insert each article
  for (const article of scraped) {
    try {
      const summary = await summarizeArticle(article.title, article.content);

      // Check for duplicates by URL
      const { data: existing } = await supabase
        .from('cp_news_items')
        .select('id')
        .eq('user_id', userId)
        .eq('url', article.url)
        .maybeSingle();

      if (existing) continue;

      await supabase.from('cp_news_items').insert({
        user_id: userId,
        source: article.source,
        title: article.title,
        url: article.url,
        summary,
        relevance_tags: [company.branza],
        scraped_at: new Date().toISOString(),
      });
    } catch {
      continue;
    }
  }

  // Delete items older than 48h
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  await supabase
    .from('cp_news_items')
    .delete()
    .eq('user_id', userId)
    .lt('scraped_at', cutoff);
}
```

- [ ] **Step 2: Create news cron endpoint**

```typescript
// src/app/api/cp/cron/news/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { scrapeNewsForUser } from '@/lib/firecrawl';

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServer();

  // Get all users who have a company profile
  const { data: companies, error } = await supabase
    .from('cp_companies')
    .select('user_id, name, branza, opis, pain_points');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!companies || companies.length === 0) {
    return NextResponse.json({ processed: 0, message: 'Brak firm do przetworzenia' });
  }

  let processed = 0;
  const errors: string[] = [];

  for (const company of companies) {
    try {
      await scrapeNewsForUser(company.user_id, {
        name: company.name,
        branza: company.branza,
        opis: company.opis,
        pain_points: company.pain_points,
      });
      processed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nieznany błąd';
      errors.push(`${company.user_id}: ${msg}`);
    }
  }

  return NextResponse.json({ processed, errors: errors.length > 0 ? errors : undefined });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/firecrawl.ts src/app/api/cp/cron/news/route.ts && git commit -m "feat: Firecrawl news scraping + cron/news endpoint"
```

---

### Task 11: Daily Brief Cron + Email

**Files:**
- Create: `src/app/api/cp/cron/brief/route.ts`
- Create: `src/lib/email.ts`

- [ ] **Step 1: Create email library**

```typescript
// src/lib/email.ts
import { Resend } from 'resend';
import type { ActionItem } from '@/lib/brief';

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY nie jest ustawiony');
  return new Resend(apiKey);
}

const PRIORITY_LABEL: Record<string, string> = {
  urgent: 'PILNE',
  warn: 'WAŻNE',
  info: 'INFO',
  running: 'W TOKU',
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: '#dc2626',
  warn: '#d97706',
  info: '#2563eb',
  running: '#7c3aed',
};

function buildActionHtml(action: ActionItem): string {
  const label = PRIORITY_LABEL[action.priority] ?? action.priority.toUpperCase();
  const color = PRIORITY_COLOR[action.priority] ?? '#6b7280';

  return `
    <div style="border-left: 4px solid ${color}; padding: 12px 16px; margin-bottom: 12px; background: #f9f9f9; border-radius: 0 4px 4px 0;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="background: ${color}; color: white; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; font-family: monospace;">${label}</span>
        <strong style="font-size: 15px; color: #111;">${escapeHtml(action.title)}</strong>
      </div>
      <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.5;">${escapeHtml(action.description)}</p>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmailHtml(companyName: string, summary: string, actions: ActionItem[]): string {
  const today = new Date().toLocaleDateString('pl-PL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const actionsHtml = actions.map(buildActionHtml).join('');

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Twój dzienny brief</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111; background: #fff;">
  <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
    <h1 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 700;">Cyfrowy Pomocnik</h1>
    <p style="margin: 0; color: #6b7280; font-size: 14px;">${escapeHtml(companyName)} &middot; ${today}</p>
  </div>

  <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #0c4a6e;">${escapeHtml(summary)}</p>
  </div>

  <h2 style="font-size: 16px; font-weight: 600; margin: 0 0 12px 0; color: #374151;">Akcje do zatwierdzenia (${actions.length})</h2>

  ${actionsHtml}

  <div style="border-top: 1px solid #e5e7eb; margin-top: 24px; padding-top: 16px;">
    <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center;">
      Cyfrowy Pomocnik &middot; Zatwierdź lub odrzuć akcje w panelu
    </p>
  </div>
</body>
</html>
  `.trim();
}

export async function sendDailyBriefEmail(
  to: string,
  companyName: string,
  summary: string,
  actions: ActionItem[],
): Promise<void> {
  const resend = getResend();
  const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });

  await resend.emails.send({
    from: 'Cyfrowy Pomocnik <noreply@cyfrowypomocnik.pl>',
    to,
    subject: `Twój brief na ${today}: ${actions.length} ${actions.length === 1 ? 'akcja' : actions.length < 5 ? 'akcje' : 'akcji'}`,
    html: buildEmailHtml(companyName, summary, actions),
  });
}
```

- [ ] **Step 2: Create daily brief cron endpoint**

```typescript
// src/app/api/cp/cron/brief/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { generateBrief } from '@/lib/brief';
import { sendDailyBriefEmail } from '@/lib/email';

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createSupabaseServer();

  // Get all users with company profiles
  const { data: companies, error } = await supabase
    .from('cp_companies')
    .select('user_id, name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!companies || companies.length === 0) {
    return NextResponse.json({ generated: 0, message: 'Brak firm do przetworzenia' });
  }

  let generated = 0;
  const errors: string[] = [];

  for (const company of companies) {
    try {
      const { summary, actions } = await generateBrief(company.user_id);

      // Attempt to send email if user has an email (via auth.users)
      // We use service role to read auth.users
      const { data: authUser } = await supabase.auth.admin.getUserById(company.user_id);
      const email = authUser?.user?.email;

      if (email && actions.length > 0) {
        try {
          await sendDailyBriefEmail(email, company.name, summary, actions);
        } catch {
          // Email failure doesn't break the cron
        }
      }

      generated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Nieznany błąd';
      errors.push(`${company.user_id}: ${msg}`);
    }
  }

  return NextResponse.json({ generated, errors: errors.length > 0 ? errors : undefined });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/lib/email.ts src/app/api/cp/cron/brief/route.ts && git commit -m "feat: daily brief cron + Resend email digest"
```

---

### Task 12: Action Items API

**Files:**
- Create: `src/app/api/cp/actions/route.ts`
- Create: `src/app/api/cp/actions/[id]/route.ts`

- [ ] **Step 1: Create actions list route**

```typescript
// src/app/api/cp/actions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') ?? 'pending';

  let query = supabase
    .from('cp_action_items')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    const validStatuses = ['pending', 'approved', 'dismissed'];
    const status = validStatuses.includes(statusFilter) ? statusFilter : 'pending';
    query = query.eq('status', status);
  }

  const { data: actions, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ actions: actions ?? [] });
}
```

- [ ] **Step 2: Create action update route**

```typescript
// src/app/api/cp/actions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase';
import { getAI, MODEL } from '@/lib/ai';

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function generateNextStep(title: string, description: string): Promise<string> {
  const ai = getAI();
  const response = await ai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: `Użytkownik zatwierdził akcję: "${title}". Opis: "${description}"\n\nPodaj jeden konkretny następny krok do wykonania TERAZ (maksymalnie 1 zdanie, po polsku, w formie polecenia np. "Otwórz fakturę i uzupełnij datę sprzedaży").`,
      },
    ],
    temperature: 0.3,
    max_tokens: 80,
  });

  return response.choices[0]?.message?.content?.trim() ?? 'Wykonaj zaplanowaną akcję.';
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!status || !['approved', 'dismissed'].includes(status)) {
    return NextResponse.json({ error: 'status musi być "approved" lub "dismissed"' }, { status: 400 });
  }

  // Verify ownership
  const { data: existing, error: fetchError } = await supabase
    .from('cp_action_items')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: 'Nie znaleziono akcji' }, { status: 404 });
  }

  // Update status
  const { data: action, error: updateError } = await supabase
    .from('cp_action_items')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // If approved, generate next step
  if (status === 'approved') {
    try {
      const nextStep = await generateNextStep(existing.title, existing.description);
      return NextResponse.json({ action, status: 'approved', nextStep });
    } catch {
      // Degrade gracefully if AI fails
      return NextResponse.json({ action, status: 'approved', nextStep: 'Wykonaj zaplanowaną akcję.' });
    }
  }

  return NextResponse.json({ action });
}
```

- [ ] **Step 3: Commit**
```bash
git add src/app/api/cp/actions/ && git commit -m "feat: action items API GET/PATCH with AI next-step on approve"
```

---

### Task 13: vercel.json + env setup

**Files:**
- Create: `vercel.json`
- Create: `.env.local.example`

- [ ] **Step 1: Create vercel.json with cron schedules**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cp/cron/news",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cp/cron/brief",
      "schedule": "0 7 * * *"
    }
  ]
}
```

- [ ] **Step 2: Create env example file**

```bash
# .env.local.example

# Supabase (shared with wezmezadarmo - same project, cp_* tables)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI - OpenRouter (model: google/gemini-2.0-flash-001)
OPENROUTER_API_KEY=

# Firecrawl - news scraping
FIRECRAWL_API_KEY=

# Resend - email digest
RESEND_API_KEY=

# Cron security - random secret, set same in Vercel dashboard
CRON_SECRET=
```

- [ ] **Step 3: Commit**
```bash
git add vercel.json .env.local.example && git commit -m "feat: vercel.json cron schedules + env example"
```

---

## Summary: Part B file tree

```
src/
  app/api/cp/
    company/route.ts          # Task 7: GET+POST company profile
    reminders/
      route.ts                # Task 8: GET+POST reminders
      [id]/route.ts           # Task 8: PATCH+DELETE reminder
    brief/route.ts            # Task 9: POST generate, GET latest
    actions/
      route.ts                # Task 12: GET actions list
      [id]/route.ts           # Task 12: PATCH approve/dismiss
    cron/
      news/route.ts           # Task 10: Firecrawl scrape cron
      brief/route.ts          # Task 11: Daily brief cron
  lib/
    brief.ts                  # Task 9: generateBrief() core logic
    firecrawl.ts              # Task 10: scrapeNewsForUser()
    email.ts                  # Task 11: sendDailyBriefEmail()
vercel.json                   # Task 13: cron schedule config
.env.local.example            # Task 13: required env vars
```

## Dependencies to install

```bash
npm install @mendable/firecrawl-js resend
```
