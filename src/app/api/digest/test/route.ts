import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { FEEDS, fetchFeeds } from '@/app/aktualnosci/rss';
import { matchBenefits } from '@/engine/matcher';
import type { UserProfile } from '@/engine/types';
import { buildPrivateDigestPayload, buildJdgDigestPayload } from '@/lib/digest';
import { buildDigestHtml, buildDigestSubject } from '@/emails/digest.html';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function getResend() { return new Resend(process.env.RESEND_API_KEY); }

export async function POST() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Nieautoryzowany.' }, { status: 401 });
  }

  const email = session.user.email;
  if (!email) {
    return NextResponse.json({ error: 'Brak adresu e-mail.' }, { status: 400 });
  }

  const supabaseAdmin = getAdminClient();
  const { data: profile } = await supabaseAdmin
    .from('agent_user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profil nie istnieje.' }, { status: 400 });
  }

  const feedResult = await fetchFeeds(FEEDS).catch(() => ({
    items: [] as Awaited<ReturnType<typeof fetchFeeds>>['items'],
    active: [] as string[],
    failed: [] as string[],
  }));

  const items = feedResult.items.slice(0, 10);

  let payload;

  if (profile.type === 'jdg') {
    const base = buildJdgDigestPayload(
      email,
      (profile.company_name as string | null) ?? 'Twoja firma',
      items,
    );
    payload = { ...base, hasContent: true, rssItems: items.slice(0, 5) };
  } else {
    const userProfile: UserProfile = {
      wiek: (profile.wiek as number | null) ?? 30,
      plec: (profile.plec as 'K' | 'M' | null) ?? 'M',
      stanCywilny: (profile.stan_cywilny as string | null) ?? 'wolny',
      liczbaDzieci: (profile.liczba_dzieci as number | null) ?? 0,
      wiekDzieci: (profile.wiek_dzieci as number[] | null) ?? [],
      dochodMiesiecznie: (profile.dochod_miesiecznie as number | null) ?? 0,
      dochodNaOsobe: (profile.dochod_na_osobe as number | null) ?? 0,
      zatrudnienie: (profile.zatrudnienie as string | null) ?? 'umowa_o_prace',
      niepelnosprawnosc: (profile.niepelnosprawnosc as string | null) ?? 'brak',
      wlasnosc: (profile.wlasnosc as string | null) ?? 'wynajem',
      wojewodztwo: (profile.wojewodztwo as string | null) ?? 'mazowieckie',
      prowadzDzialalnosc: false,
      pierwszaDzialalnosc: false,
      ciaza: (profile.ciaza as boolean | null) ?? false,
      student: (profile.student as boolean | null) ?? false,
      emeryt: (profile.emeryt as boolean | null) ?? false,
      rolnik: (profile.rolnik as boolean | null) ?? false,
      bezrobotnyZarejestrowany: (profile.bezrobotny_zarejestrowany as boolean | null) ?? false,
    };
    const benefitResults = matchBenefits(userProfile);
    const base = buildPrivateDigestPayload(email, items, benefitResults);
    payload = { ...base, hasContent: true, rssItems: items.slice(0, 5) };
  }

  const subject = `[TEST] ${buildDigestSubject(payload)}`;
  const html = buildDigestHtml(payload);

  const resend = getResend();
  const { error: sendError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'agent@wezmezadarmo.com',
    to: email,
    subject,
    html,
  });

  if (sendError) {
    console.error('[digest/test] błąd wysyłki:', sendError);
    return NextResponse.json({ error: 'Błąd wysyłki e-mail.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
