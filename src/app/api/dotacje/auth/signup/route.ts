import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface CompanyProfileInput {
  nip: string;
  name: string;
  voivodeship: string;
  pkd_codes: string[];
  size: 'micro' | 'small' | 'medium' | 'large';
  employee_count_range: string;
}

interface FlagsInput {
  zatrudniam_niepelnosprawnych: boolean;
  planuje_szkolenia: boolean;
  chce_zatrudnic_bezrobotnych: boolean;
  firma_ponizej_2_lat: boolean;
  zainteresowany_innowacjami: boolean;
  planuje_eksport: boolean;
  potrzebuje_cyfryzacji: boolean;
  sektor: string;
}

const VALID_SIZES = new Set(['micro', 'small', 'medium', 'large']);

export async function POST(request: NextRequest) {
  let body: {
    email?: unknown;
    password?: unknown;
    companyProfile?: unknown;
    flags?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidlowe dane wejsciowe' }, { status: 400 });
  }

  const { email, password, companyProfile, flags } = body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'Podaj adres email' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Haslo musi miec minimum 8 znakow' }, { status: 400 });
  }
  if (!companyProfile || typeof companyProfile !== 'object') {
    return NextResponse.json({ error: 'Brak danych firmy' }, { status: 400 });
  }

  const profile = companyProfile as CompanyProfileInput;

  if (!profile.nip || !/^\d{10}$/.test(profile.nip)) {
    return NextResponse.json({ error: 'Nieprawidlowy NIP' }, { status: 400 });
  }
  if (!profile.name || typeof profile.name !== 'string' || !profile.name.trim()) {
    return NextResponse.json({ error: 'Podaj nazwe firmy' }, { status: 400 });
  }
  if (!profile.size || !VALID_SIZES.has(profile.size)) {
    return NextResponse.json({ error: 'Nieprawidlowa wielkosc firmy' }, { status: 400 });
  }

  const flagsData = (flags && typeof flags === 'object' ? flags : {}) as FlagsInput;

  // Use service role for signUp to bypass email confirm requirement in server context
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: signUpData, error: signUpError } = await adminClient.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: {
      // Serwis jest bezplatny (pro bono) - kazdy uzytkownik ma pelny, darmowy dostep.
      subscription_status: 'active',
    },
  });

  if (signUpError || !signUpData.user) {
    const msg = signUpError?.message ?? 'Rejestracja nie powiodla sie';
    const isDuplicate =
      msg.toLowerCase().includes('already registered') ||
      msg.toLowerCase().includes('already exists') ||
      msg.toLowerCase().includes('user already');

    return NextResponse.json(
      { error: isDuplicate ? 'Konto z tym adresem email juz istnieje' : 'Rejestracja nie powiodla sie. Sprobuj ponownie.' },
      { status: isDuplicate ? 409 : 500 },
    );
  }

  const userId = signUpData.user.id;
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  // Insert user record
  const { error: userInsertError } = await adminClient
    .from('users')
    .insert({
      id: userId,
      email: email.trim().toLowerCase(),
      // Serwis bezplatny (pro bono) - pelny, darmowy dostep dla kazdego konta.
      subscription_status: 'active',
      trial_ends_at: trialEndsAt,
    });

  if (userInsertError) {
    // Non-fatal: user is created, profile insert failed -- log and continue
    console.error('[signup] users insert error:', userInsertError.message);
  }

  // Insert company profile
  const { error: profileError } = await adminClient
    .from('company_profiles')
    .insert({
      user_id: userId,
      nip: profile.nip,
      name: profile.name.trim(),
      voivodeship: profile.voivodeship ?? '',
      pkd_codes: Array.isArray(profile.pkd_codes) ? profile.pkd_codes : [],
      size: profile.size,
      employee_count_range: profile.employee_count_range ?? '',
      flags: {
        zatrudniam_niepelnosprawnych: Boolean(flagsData.zatrudniam_niepelnosprawnych),
        planuje_szkolenia: Boolean(flagsData.planuje_szkolenia),
        chce_zatrudnic_bezrobotnych: Boolean(flagsData.chce_zatrudnic_bezrobotnych),
        firma_ponizej_2_lat: Boolean(flagsData.firma_ponizej_2_lat),
        zainteresowany_innowacjami: Boolean(flagsData.zainteresowany_innowacjami),
        planuje_eksport: Boolean(flagsData.planuje_eksport),
        potrzebuje_cyfryzacji: Boolean(flagsData.potrzebuje_cyfryzacji),
        sektor: typeof flagsData.sektor === 'string' ? flagsData.sektor : '',
      },
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('[signup] company_profiles insert error:', profileError.message);
    // Profile insert failed but user exists -- return error so client can retry
    return NextResponse.json(
      { error: 'Konto zostalo utworzone, ale nie udalo sie zapisac profilu firmy. Skontaktuj sie z pomoca techniczna.' },
      { status: 500 },
    );
  }

  // Sign in the newly created user so session cookies are set
  const cookieStore = await cookies();
  const signInResponse = NextResponse.json({ success: true });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            signInResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (signInError) {
    // User and profile created, but auto-login failed -- still success, client redirects to login
    console.error('[signup] auto signin error:', signInError.message);
    return NextResponse.json({ success: true, requiresLogin: true });
  }

  return signInResponse;
}
