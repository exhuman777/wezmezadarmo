import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Podaj prawidłowy adres e-mail.' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ error: 'Hasło musi mieć co najmniej 8 znaków.' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const supabaseAdmin = getAdminClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: false,
  });

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'Konto z tym adresem e-mail już istnieje.' }, { status: 409 });
    }
    console.error('[auth/signup] auth error:', authError);
    return NextResponse.json({ error: 'Błąd tworzenia konta.' }, { status: 500 });
  }

  const userId = authData.user.id;

  // Wyślij e-mail weryfikacyjny
  const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: normalizedEmail,
    password: password as string,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wezmezadarmo.com'}/auth/callback`,
    },
  });

  if (linkData?.properties?.action_link) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
        to: normalizedEmail,
        subject: 'Potwierdź adres e-mail - wezmezadarmo',
        html: [
          '<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px">',
          '<h2 style="font-size:20px;font-weight:600;color:#0c1714;margin:0 0 16px">Witaj w wezmezadarmo</h2>',
          '<p style="font-size:15px;color:#2f3d36;line-height:1.6;margin:0 0 24px">',
          'Kliknij przycisk poniżej, aby potwierdzić adres e-mail i aktywować konto.</p>',
          `<a href="${linkData.properties.action_link}" style="display:inline-block;padding:12px 28px;background:#0d5036;color:#fff;border-radius:999px;text-decoration:none;font-size:15px;font-weight:500">`,
          'Potwierdź e-mail</a>',
          '<p style="font-size:13px;color:#6b7a72;line-height:1.6;margin:24px 0 0">',
          'Jeśli nie zakładałeś konta w wezmezadarmo, zignoruj tę wiadomość.</p>',
          '</div>',
        ].join(''),
      });
    } catch (emailError) {
      console.error('[auth/signup] email error:', emailError);
      // Konto już utworzone, użytkownik może poprosić o ponowne wysłanie
    }
  }

  return NextResponse.json(
    { success: true, userId, requiresEmailVerification: true },
    { status: 201 },
  );
}
