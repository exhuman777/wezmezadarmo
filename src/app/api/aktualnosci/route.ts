import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { createClient } from '@supabase/supabase-js';
import { fetchAllFeeds, fetchFeeds, FEEDS, type FeedMeta, type FeedItem } from '@/app/aktualnosci/rss';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Źródła które działają bezpośrednio z Vercel (nie potrzebują cache)
const LIVE_SOURCE_IDS = new Set(['zus', 'gus']);

// Pobiera artykuły z Supabase rss_cache dla zablokowanych źródeł
async function fetchFromCache(sourceIds: string[]): Promise<FeedItem[]> {
  if (sourceIds.length === 0) return [];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  // Anon key first - publiczny endpoint, RLS policy rss_cache_public_read pozwala anon na SELECT
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!url || !key) {
    console.error('[rss-cache] BRAK env: NEXT_PUBLIC_SUPABASE_URL lub NEXT_PUBLIC_SUPABASE_ANON_KEY');
    return [];
  }

  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await client
      .from('rss_cache')
      .select('id, source_id, source_name, title, link, description, pub_date, audiences')
      .in('source_id', sourceIds)
      .order('fetched_at', { ascending: false })
      .limit(150);

    if (error) {
      console.error('[rss-cache] Supabase error:', error.code, error.message, error.details);
      return [];
    }
    if (!data || data.length === 0) {
      console.warn('[rss-cache] brak wpisow dla source_ids:', sourceIds.join(','));
      return [];
    }

    console.log(`[rss-cache] OK: ${data.length} wpisow z ${new Set(data.map(d => d.source_id)).size} zrodel`);

    return data.map(row => ({
      id: row.id as string,
      title: row.title as string,
      link: row.link as string,
      description: row.description as string,
      pubDate: row.pub_date as string | null,
      source: row.source_name as string,
      sourceId: row.source_id as string,
      audiences: row.audiences as FeedItem['audiences'],
    }));
  } catch (e) {
    console.error('[rss-cache] EXCEPTION:', (e as Error).message);
    return [];
  }
}

// GET /api/aktualnosci
// Live: ZUS, GUS (działają bezpośrednio)
// Cache: NBP, Sejm, UOKiK, Fundusze EU, e-Zdrowie, ARiMR (GitHub Actions 2x/dzień)
// Zalogowany: + własne feedy firmy
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();

    // Źródła live (ZUS, GUS)
    const liveFeeds = FEEDS.filter(f => LIVE_SOURCE_IDS.has(f.id));
    // Źródła przez cache
    const cachedSourceIds = FEEDS
      .filter(f => !LIVE_SOURCE_IDS.has(f.id))
      .map(f => f.id);

    // Pobieraj live i cache równolegle
    const [liveResult, cachedItems] = await Promise.all([
      fetchFeeds(liveFeeds),
      fetchFromCache(cachedSourceIds),
    ]);

    const active = [
      ...liveResult.active,
      ...cachedSourceIds.filter(id => cachedItems.some(i => i.sourceId === id)),
    ];
    const failed = [
      ...liveResult.failed,
      ...cachedSourceIds.filter(id => !cachedItems.some(i => i.sourceId === id)),
    ];

    let allItems: FeedItem[] = [...liveResult.items, ...cachedItems];

    // Własne feedy firmy (jeśli zalogowany)
    if (session) {
      const { data: companyFeeds } = await supabase
        .from('company_rss_feeds')
        .select('id, feed_url, feed_name, kategoria')
        .eq('user_id', session.user.id)
        .eq('aktywna', true);

      if (companyFeeds && companyFeeds.length > 0) {
        const customMetas: FeedMeta[] = companyFeeds.map(f => ({
          id: f.id as string,
          name: f.feed_name as string,
          fullName: f.feed_name as string,
          url: f.feed_url as string,
          audiences: ['firmy'],
          tags: f.kategoria ? [f.kategoria as string] : [],
        }));
        const customResult = await fetchFeeds(customMetas);
        allItems = [...allItems, ...customResult.items];
      }
    }

    // Sortuj po dacie malejąco
    allItems.sort((a, b) => {
      if (!a.pubDate && !b.pubDate) return 0;
      if (!a.pubDate) return 1;
      if (!b.pubDate) return -1;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    return NextResponse.json({
      items: allItems,
      active,
      failed,
      fetchedAt: new Date().toISOString(),
      cacheEnabled: true,
    });
  } catch (err) {
    console.error('[aktualnosci/GET] błąd:', err);
    return NextResponse.json({ error: 'Błąd pobierania aktualności.' }, { status: 500 });
  }
}

// POST /api/aktualnosci
// Wymaga zalogowania. Dodaje nowy feed RSS dla firmy.
// Body: { feed_url: string, feed_name: string, kategoria?: string, sprawdzaj_co_godziny?: number }
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
    }

    let body: {
      feed_url?: unknown;
      feed_name?: unknown;
      kategoria?: unknown;
      sprawdzaj_co_godziny?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
    }

    const { feed_url, feed_name, kategoria, sprawdzaj_co_godziny } = body;

    if (!feed_url || typeof feed_url !== 'string' || !feed_url.trim()) {
      return NextResponse.json({ error: 'Pole feed_url jest wymagane.' }, { status: 400 });
    }
    if (!feed_name || typeof feed_name !== 'string' || !feed_name.trim()) {
      return NextResponse.json({ error: 'Pole feed_name jest wymagane.' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(feed_url.trim());
    } catch {
      return NextResponse.json({ error: 'Nieprawidłowy adres URL.' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return NextResponse.json({ error: 'Adres URL musi używać protokołu http lub https.' }, { status: 400 });
    }

    const dozwoloneKategorie = ['dofinansowania', 'zus', 'podatki', 'prawo', 'inne'];
    const kategoriaVal = typeof kategoria === 'string' && dozwoloneKategorie.includes(kategoria)
      ? kategoria
      : null;

    const godzinyVal = typeof sprawdzaj_co_godziny === 'number' && sprawdzaj_co_godziny > 0
      ? Math.min(Math.floor(sprawdzaj_co_godziny), 168)
      : 24;

    const { data, error } = await supabase
      .from('company_rss_feeds')
      .insert({
        user_id: session.user.id,
        feed_url: parsedUrl.toString(),
        feed_name: feed_name.trim(),
        kategoria: kategoriaVal,
        sprawdzaj_co_godziny: godzinyVal,
        aktywna: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Ten feed jest już dodany do Twojego konta.' }, { status: 409 });
      }
      console.error('[aktualnosci/POST] błąd zapisu feeda:', error);
      return NextResponse.json({ error: 'Błąd dodawania feeda.' }, { status: 500 });
    }

    return NextResponse.json({ feed: data }, { status: 201 });
  } catch (err) {
    console.error('[aktualnosci/POST] nieoczekiwany błąd:', err);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}
