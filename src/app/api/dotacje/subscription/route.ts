import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';

export async function GET() {
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('subscription_status, trial_ends_at, email')
    .eq('id', session.user.id)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Nie znaleziono użytkownika.' }, { status: 404 });
  }

  return NextResponse.json({
    subscription_status: user.subscription_status,
    trial_ends_at: user.trial_ends_at ?? null,
    email: session.user.email,
  });
}
