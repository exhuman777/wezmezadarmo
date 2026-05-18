import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';

export async function POST(request: NextRequest) {
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wezmezadarmo.com';
  const supabase = await createSupabaseServer();

  await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${siteUrl}/agent/auth/callback?next=/agent/nowe-haslo`,
  });

  return NextResponse.json({ success: true });
}
