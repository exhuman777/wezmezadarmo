import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyEmailHash } from '@/lib/newsletter';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wezmezadarmo.com';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim().toLowerCase() ?? '';
  const hash = url.searchParams.get('hash') ?? '';

  if (!email || !hash) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribe?status=invalid`);
  }

  if (!verifyEmailHash(email, hash)) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribe?status=invalid`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribe?status=error`);
  }

  const supabase = createClient(supabaseUrl, key);

  const { data: sub, error: selectErr } = await supabase
    .from('newsletter_subscribers')
    .select('id, unsubscribed_at')
    .eq('email', email)
    .maybeSingle();

  if (selectErr) {
    console.error('[newsletter/unsubscribe] select error:', selectErr);
    return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribe?status=error`);
  }

  if (!sub) {
    // Email nie istnieje, ale i tak pokaz sukces (privacy by design -- nie ujawniamy czy email istnieje)
    return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribe?status=ok`);
  }

  if (sub.unsubscribed_at) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribe?status=already`);
  }

  // Soft delete -- zostawiamy wpis ale unsubscribed_at != null (RODO compliance + audit trail)
  const { error: updateErr } = await supabase
    .from('newsletter_subscribers')
    .update({
      unsubscribed_at: new Date().toISOString(),
      confirmation_token: null,
    })
    .eq('id', sub.id);

  if (updateErr) {
    console.error('[newsletter/unsubscribe] update error:', updateErr);
    return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribe?status=error`);
  }

  return NextResponse.redirect(`${SITE_URL}/newsletter/unsubscribe?status=ok`);
}

/** POST: pelne usuniecie z bazy (RODO right to be forgotten -- art. 17). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; hash?: string };
    const email = body.email?.trim().toLowerCase() ?? '';
    const hash = body.hash ?? '';

    if (!email || !hash || !verifyEmailHash(email, hash)) {
      return NextResponse.json({ error: 'Nieprawidłowy hash' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !key) {
      return NextResponse.json({ error: 'Konfiguracja serwera niepełna' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, key);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('email', email);

    if (error) {
      console.error('[newsletter/unsubscribe DELETE] error:', error);
      return NextResponse.json({ error: 'Błąd usuwania' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[newsletter/unsubscribe POST] exception:', err);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
