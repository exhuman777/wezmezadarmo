import { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
  }

  const [prefsResult, logsResult] = await Promise.all([
    supabase
      .from('monitoring_prefs')
      .select('*')
      .eq('user_id', session.user.id)
      .single(),
    supabase
      .from('notification_log')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const prefs = prefsResult.error?.code === 'PGRST116' ? null : prefsResult.data;
  if (prefsResult.error && prefsResult.error.code !== 'PGRST116') {
    console.error('[monitoring/GET] prefs error:', prefsResult.error);
    return Response.json({ error: 'Błąd pobierania preferencji monitoringu.' }, { status: 500 });
  }

  if (logsResult.error) {
    console.error('[monitoring/GET] logs error:', logsResult.error);
    return Response.json({ error: 'Błąd pobierania historii powiadomień.' }, { status: 500 });
  }

  return Response.json({
    prefs,
    recentNotifications: logsResult.data ?? [],
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
  }

  let body: { programIds: string[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
  }

  if (!Array.isArray(body.programIds)) {
    return Response.json({ error: 'Pole programIds musi być tablicą.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('monitoring_prefs')
    .upsert(
      {
        user_id: session.user.id,
        program_ids: body.programIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single();

  if (error) {
    console.error('[monitoring/POST] supabase error:', error);
    return Response.json({ error: 'Błąd zapisu preferencji monitoringu.' }, { status: 500 });
  }

  return Response.json({ prefs: data });
}
