import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/aktualnosci/feeds
// Zwraca listę feedów RSS przypisanych do zalogowanej firmy
export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('company_rss_feeds')
      .select('id, feed_url, feed_name, aktywna, kategoria, sprawdzaj_co_godziny, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[feeds/GET] błąd pobierania feedów:', error);
      return NextResponse.json({ error: 'Błąd pobierania listy feedów.' }, { status: 500 });
    }

    return NextResponse.json({ feeds: data ?? [] });
  } catch (err) {
    console.error('[feeds/GET] nieoczekiwany błąd:', err);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}

// DELETE /api/aktualnosci/feeds
// Usuwa feed RSS firmy
// Body: { id: string }
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
    }

    let body: { id?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
    }

    const { id } = body;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ error: 'Pole id jest wymagane.' }, { status: 400 });
    }

    const { error, count } = await supabase
      .from('company_rss_feeds')
      .delete({ count: 'exact' })
      .eq('id', id.trim())
      .eq('user_id', session.user.id);

    if (error) {
      console.error('[feeds/DELETE] błąd usuwania feeda:', error);
      return NextResponse.json({ error: 'Błąd usuwania feeda.' }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: 'Feed nie istnieje lub nie należy do Twojego konta.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[feeds/DELETE] nieoczekiwany błąd:', err);
    return NextResponse.json({ error: 'Błąd serwera.' }, { status: 500 });
  }
}
