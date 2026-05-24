import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wezmezadarmo.com';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token || token.length !== 32) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirm?status=invalid`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !key) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirm?status=error`);
  }

  const supabase = createClient(supabaseUrl, key);

  // Znajdz subskrybenta po tokenie
  const { data: sub, error: selectErr } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, confirmed, unsubscribed_at')
    .eq('confirmation_token', token)
    .maybeSingle();

  if (selectErr) {
    console.error('[newsletter/confirm] select error:', selectErr);
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirm?status=error`);
  }

  if (!sub) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirm?status=invalid`);
  }

  if (sub.confirmed) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirm?status=already`);
  }

  if (sub.unsubscribed_at) {
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirm?status=unsubscribed`);
  }

  // Potwierdz
  const { error: updateErr } = await supabase
    .from('newsletter_subscribers')
    .update({
      confirmed: true,
      confirmed_at: new Date().toISOString(),
      confirmation_token: null, // jednorazowy token
    })
    .eq('id', sub.id);

  if (updateErr) {
    console.error('[newsletter/confirm] update error:', updateErr);
    return NextResponse.redirect(`${SITE_URL}/newsletter/confirm?status=error`);
  }

  return NextResponse.redirect(`${SITE_URL}/newsletter/confirm?status=ok`);
}
