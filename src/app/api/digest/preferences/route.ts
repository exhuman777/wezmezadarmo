import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  const { data, error } = await supabase
    .from('email_preferences')
    .select('digest_enabled, digest_hour, categories, last_digest_sent_at')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({
      prefs: { digest_enabled: false, digest_hour: 6, categories: [], last_digest_sent_at: null }
    });
  }
  return NextResponse.json({ prefs: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  let body: { digest_enabled?: boolean; categories?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format.' }, { status: 400 });
  }

  const allowed = ['dofinansowania', 'zus', 'podatki', 'prawo', 'inne'];
  const update: Record<string, unknown> = {};
  if (typeof body.digest_enabled === 'boolean') update.digest_enabled = body.digest_enabled;
  if (Array.isArray(body.categories)) {
    update.categories = body.categories.filter(c => allowed.includes(c));
  }

  const { error } = await supabase
    .from('email_preferences')
    .upsert({ user_id: session.user.id, ...update }, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ error: 'Błąd zapisu preferencji.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
