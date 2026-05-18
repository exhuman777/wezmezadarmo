import { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { createClient } from '@supabase/supabase-js';
import { getTokenBalance, TOKEN_COSTS, TOKEN_PACKAGES } from '@/lib/tokens';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function GET(_request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
  }

  const admin = getAdminClient();
  const balance = await getTokenBalance(admin, session.user.id);

  const { data: recent } = await admin
    .from('token_transactions')
    .select('delta, type, description, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return Response.json({
    balance,
    transactions: recent ?? [],
    packages: TOKEN_PACKAGES,
    costs: TOKEN_COSTS,
  });
}
