import { createSupabaseServer } from '@/lib/dotacje/supabase';

export const dynamic = 'force-dynamic';

export async function POST() {
  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[auth/signout] error:', error);
    return Response.json({ error: 'Błąd wylogowania.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
