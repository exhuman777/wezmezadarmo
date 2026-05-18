import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  let body: {
    email?: unknown;
    password?: unknown;
    profile?: Record<string, unknown>;
    emailPreferences?: { digest_enabled?: boolean; categories?: string[] };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
  }

  const { email, password, profile, emailPreferences } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Podaj prawidłowy adres e-mail.' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Hasło musi mieć co najmniej 8 znaków.' }, { status: 400 });
  }
  if (!profile || !['jdg', 'private'].includes(profile.type as string)) {
    return NextResponse.json({ error: 'Typ konta (jdg lub private) jest wymagany.' }, { status: 400 });
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: false,
  });

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'Konto z tym adresem e-mail już istnieje.' }, { status: 409 });
    }
    console.error('[agent/signup] auth error:', authError);
    return NextResponse.json({ error: 'Błąd tworzenia konta.' }, { status: 500 });
  }

  const userId = authData.user.id;

  const profileRow = buildProfileInsert(userId, profile);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileError } = await supabaseAdmin
    .from('agent_user_profiles')
    .insert(profileRow as never);

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(userId);
    console.error('[agent/signup] profile error:', profileError);
    return NextResponse.json({ error: 'Błąd zapisu profilu.' }, { status: 500 });
  }

  await supabaseAdmin
    .from('email_preferences')
    .insert({
      user_id: userId,
      digest_enabled: emailPreferences?.digest_enabled ?? true,
      categories: emailPreferences?.categories ?? ['dofinansowania', 'zus', 'podatki', 'prawo'],
    });

  const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: email.trim().toLowerCase(),
    password: password as string,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wezmezadarmo.com'}/agent/auth/callback`,
    },
  });

  if (linkData?.properties?.action_link) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: email,
      subject: 'Potwierdź adres e-mail - wezmezadarmo',
      html: `<p>Kliknij link poniżej aby potwierdzić adres e-mail i aktywować konto:</p><p><a href="${linkData.properties.action_link}">${linkData.properties.action_link}</a></p>`,
    });
  }

  return NextResponse.json({ success: true, requiresEmailVerification: true }, { status: 201 });
}

function buildProfileInsert(userId: string, profile: Record<string, unknown>) {
  if (profile.type === 'jdg') {
    return {
      user_id: userId,
      type: 'jdg' as const,
      nip: profile.nip ?? null,
      company_name: profile.company_name ?? null,
      pkd_codes: profile.pkd_codes ?? [],
      company_voivodeship: profile.company_voivodeship ?? null,
      company_registration_date: profile.company_registration_date ?? null,
      company_status: profile.company_status ?? null,
      company_size: profile.company_size ?? null,
    };
  }
  return {
    user_id: userId,
    type: 'private' as const,
    wiek: profile.wiek ?? null,
    plec: profile.plec ?? null,
    stan_cywilny: profile.stan_cywilny ?? null,
    liczba_dzieci: (profile.liczba_dzieci as number) ?? 0,
    wiek_dzieci: (profile.wiek_dzieci as number[]) ?? [],
    dochod_miesiecznie: profile.dochod_miesiecznie ?? null,
    dochod_na_osobe: profile.dochod_na_osobe ?? null,
    zatrudnienie: profile.zatrudnienie ?? null,
    niepelnosprawnosc: profile.niepelnosprawnosc ?? 'brak',
    wlasnosc: profile.wlasnosc ?? null,
    wojewodztwo: profile.wojewodztwo ?? null,
    ciaza: profile.ciaza ?? false,
    student: profile.student ?? false,
    emeryt: profile.emeryt ?? false,
    rolnik: profile.rolnik ?? false,
    bezrobotny_zarejestrowany: profile.bezrobotny_zarejestrowany ?? false,
  };
}
