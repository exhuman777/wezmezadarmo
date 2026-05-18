import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format.' }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return NextResponse.json({ error: 'Email i hasło są wymagane.' }, { status: 400 });
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    return NextResponse.json({ error: 'Nieprawidłowy email lub hasło.' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
