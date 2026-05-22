import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  const { data, error } = await supabase
    .from('agent_user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  // Profil nie istnieje - auto-utwórz domyślny (user zarejestrował się przez unified auth)
  if (error && (error.code === 'PGRST116' || !data)) {
    const { data: newProfile, error: createErr } = await supabase
      .from('agent_user_profiles')
      .insert({ user_id: session.user.id, type: 'private' })
      .select()
      .single();
    if (createErr) {
      console.error('[agent/profile GET] auto-create error:', createErr);
      return NextResponse.json({ error: 'Błąd tworzenia profilu.' }, { status: 500 });
    }
    return NextResponse.json({ profile: newProfile });
  }

  if (error) {
    console.error('[agent/profile GET]', error);
    return NextResponse.json({ error: 'Błąd pobierania profilu.' }, { status: 500 });
  }
  return NextResponse.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format.' }, { status: 400 });
  }

  // Zabraniam zmiany type i user_id
  const { type: _type, user_id: _uid, id: _id, created_at: _ca, ...updateData } = body;

  const { data, error } = await supabase
    .from('agent_user_profiles')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    console.error('[agent/profile PUT]', error);
    return NextResponse.json({ error: 'Błąd aktualizacji profilu.' }, { status: 500 });
  }
  return NextResponse.json({ profile: data });
}
