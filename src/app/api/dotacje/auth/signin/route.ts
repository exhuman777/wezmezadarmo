import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidlowe dane wejsciowe' }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return NextResponse.json({ error: 'Podaj adres email' }, { status: 400 });
  }
  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Podaj haslo' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const response = NextResponse.json({ success: true });

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
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !data.session) {
    const msg = error?.message ?? 'Logowanie nie powiodlo sie';
    const isInvalid =
      msg.toLowerCase().includes('invalid login') ||
      msg.toLowerCase().includes('invalid credentials') ||
      msg.toLowerCase().includes('email not confirmed');

    return NextResponse.json(
      { error: isInvalid ? 'Nieprawidlowy email lub haslo' : 'Blad logowania. Sprobuj ponownie.' },
      { status: 401 },
    );
  }

  return response;
}
