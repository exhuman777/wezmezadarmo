import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { SITE_URL } from '@/lib/seo';
import { rateLimit } from '@/lib/sources/_helpers';

export async function POST(request: NextRequest) {
  const limitIp = rateLimit('agent-reset', request, 5, 60 * 60_000);
  if (!limitIp.ok) return limitIp.response;
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
  }

  const { email } = body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Podaj prawidłowy adres e-mail.' }, { status: 400 });
  }

  const siteUrl = SITE_URL;
  const supabase = await createSupabaseServer();

  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${siteUrl}/agent/auth/callback?next=/agent/nowe-haslo`,
  });

  return NextResponse.json({ success: true });
}
