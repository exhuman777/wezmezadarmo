import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') ?? '/agent/panel';

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const supabase = await createSupabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error('[agent/auth/callback] PKCE exchange failed:', error.message);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error('[agent/auth/callback] verifyOtp failed:', error.message, 'type:', type);
  }

  console.warn('[agent/auth/callback] no code or token_hash', { url: request.url });
  return NextResponse.redirect(`${origin}/agent/logowanie?error=link_wygasl`);
}
