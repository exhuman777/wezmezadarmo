import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { fetchAllFeeds, fetchFeeds, FEEDS, type FeedMeta } from '@/app/aktualnosci/rss';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/aktualnosci
// Niezalogowany: zwraca artykuły z domyślnych feedów
// Zalogowany: zwraca artykuły z domyślnych feedów + własnych feedów firmy
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const result = await fetchAllFeeds();
      return NextResponse.json({ ...result, fetchedAt: new Date().toISOString() });
    }

    // Pobierz własne feedy firmy
    const { data: companyFeeds, error: feedsError } = await supabase
      .from('company_rss_feeds')
      .select('id, feed_url, feed_name, kategoria')
      .eq('user_id', session.user.id)
      .eq('aktywna', true);

    if (feedsError) {
      console.error('[aktualnosci/GET] błąd pobierania feedów firmy:', feedsError);
      // Fallback do domyślnych
      const result = await fetchAllFeeds();
      return NextResponse.json({ ...result, fetchedAt: new Date().toISOString() });
    }

    // Buduj listę feedów: domyślne + własne firmy
    const customMetas: FeedMeta[] = (companyFeeds ?? []).map(f => ({
      id: f.id as string,
      name: f.feed_name as string,
      fullName: f.feed_name as string,
      url: f.feed_url as string,
      audiences: ['firmy'],
      tags: f.kategoria ? [f.kategoria as string] : [],
    }));

    const allFeeds = [...FEEDS, ...customMetas];
    const result = await fetchFeeds(allFeeds);

    return NextResponse.json({
      ...result,
      fetchedAt: new Date().toISOString(),
      customFeedsCount: customMetas.length,
    });
  } catch (err) {
    console.error('[aktualnosci/GET] nieoczekiwany błąd:', err);
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
