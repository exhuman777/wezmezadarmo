import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/dotacje/supabase';

export async function POST() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Mark account as deleted (soft delete -- data removed after 30 days via DB job)
  await supabase
    .from('users')
    .update({ subscription_status: 'inactive', deleted_at: new Date().toISOString() })
    .eq('id', userId);

  // Sign out current session
  await supabase.auth.signOut();

  // Revoke all auth sessions via admin API
  await adminClient.auth.admin.deleteUser(userId);

  return NextResponse.json({ ok: true });
}
