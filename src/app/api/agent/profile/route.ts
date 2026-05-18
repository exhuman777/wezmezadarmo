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

  if (error || !data) {
    return NextResponse.json({ error: 'Profil nie znaleziony.' }, { status: 404 });
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
