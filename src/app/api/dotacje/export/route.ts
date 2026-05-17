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

  const userId = session.user.id;

  const [{ data: user }, { data: profile }, { data: prefs }, { data: logs }] =
    await Promise.all([
      supabase
        .from('users')
        .select('subscription_status, trial_ends_at, created_at')
        .eq('id', userId)
        .single(),
      supabase
        .from('company_profiles')
        .select('nip, name, pkd_codes, voivodeship, size, employee_count_range, flags, updated_at')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('monitoring_prefs')
        .select('categories, updated_at')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('notification_log')
        .select('category, message, sent_at')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(100),
    ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    email: session.user.email,
    account: user ?? null,
    company_profile: profile ?? null,
    monitoring_preferences: prefs ?? null,
    notification_history: logs ?? [],
    gdpr_note:
      'Eksport danych osobowych zgodnie z art. 20 RODO. Dane przechowywane są na serwerach Supabase (UE). Administrator: wezmezadarmo.com.',
  };

  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="moje-dane-dotacje.json"',
    },
  });
}
