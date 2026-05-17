import { NextRequest } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('company_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return Response.json({ profile: null }, { status: 200 });
    }
    console.error('[company/GET] supabase error:', error);
    return Response.json({ error: 'Błąd pobierania profilu firmy.' }, { status: 500 });
  }

  return Response.json({ profile: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
  }

  let body: {
    name?: string;
    voivodeship?: string;
    pkdCodes?: string[];
    size?: 'micro' | 'small' | 'medium' | 'large';
    flags?: Record<string, boolean>;
    employeeCountRange?: string;
    nip?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    user_id: session.user.id,
    updated_at: new Date().toISOString(),
  };

  if (body.name !== undefined) updateData.name = body.name;
  if (body.nip !== undefined) updateData.nip = body.nip;
  if (body.voivodeship !== undefined) updateData.voivodeship = body.voivodeship;
  if (body.pkdCodes !== undefined) updateData.pkd_codes = body.pkdCodes;
  if (body.size !== undefined) updateData.size = body.size;
  if (body.flags !== undefined) updateData.flags = body.flags;
  if (body.employeeCountRange !== undefined) updateData.employee_count_range = body.employeeCountRange;

  const { data, error } = await supabase
    .from('company_profiles')
    .upsert(updateData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('[company/PUT] supabase error:', error);
    return Response.json({ error: 'Błąd zapisu profilu firmy.' }, { status: 500 });
  }

  return Response.json({ profile: data });
}
