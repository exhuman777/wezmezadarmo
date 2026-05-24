import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import type { EmailOtpType } from '@supabase/supabase-js';

/**
 * Auth callback - 2 flowy:
 * 1. PKCE (?code=xxx) - OAuth providery + nowy magic link
 * 2. OTP (?token_hash=xxx&type=signup|email|recovery|invite) - email confirmation z generateLink
 */

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') ?? '/panel';

  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const supabase = await createSupabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('[auth/callback] PKCE exchange failed:', error.message);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('[auth/callback] verifyOtp failed:', error.message, 'type:', type);
  }

  console.warn('[auth/callback] no code or token_hash', { url: request.url });
  return NextResponse.redirect(`${origin}/logowanie?error=link_wygasl`);
}
