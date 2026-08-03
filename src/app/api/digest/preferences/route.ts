import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_CATEGORIES = ['dofinansowania', 'zus', 'podatki', 'prawo', 'inne'];

export interface PreferencesBody {
  digest_enabled?: boolean;
  categories?: string[];
}

/**
 * Buduje obiekt aktualizacji preferencji e-mail z zapisem WYRAŹNEJ ZGODY.
 * Czysta funkcja (testowalna): włączenie digestu stempluje digest_consent_at
 * oraz źródło zgody - to nasz dowód, że użytkownik świadomie wyraził zgodę
 * (RODO). Wyłączenie zeruje zgodę, więc ponowne włączenie wymaga nowej zgody.
 */
export function buildPreferencesUpdate(body: PreferencesBody, nowISO: string): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (typeof body.digest_enabled === 'boolean') {
    update.digest_enabled = body.digest_enabled;
    if (body.digest_enabled) {
      update.digest_consent_at = nowISO;
      update.digest_consent_source = 'panel_settings';
    } else {
      // Cofnięcie zgody - kasujemy jej ślad, cron nie wyśle bez ponownej zgody.
      update.digest_consent_at = null;
      update.digest_consent_source = null;
    }
  }

  if (Array.isArray(body.categories)) {
    update.categories = body.categories.filter(c => ALLOWED_CATEGORIES.includes(c));
  }

  return update;
}

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  const { data, error } = await supabase
    .from('email_preferences')
    .select('digest_enabled, digest_hour, categories, last_digest_sent_at, digest_consent_at')
    .eq('user_id', session.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({
      prefs: {
        digest_enabled: false,
        digest_hour: 6,
        categories: [],
        last_digest_sent_at: null,
        digest_consent_at: null,
      },
    });
  }
  return NextResponse.json({ prefs: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });

  let body: PreferencesBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format.' }, { status: 400 });
  }

  const update = buildPreferencesUpdate(body, new Date().toISOString());

  const { error } = await supabase
    .from('email_preferences')
    .upsert({ user_id: session.user.id, ...update }, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ error: 'Błąd zapisu preferencji.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
