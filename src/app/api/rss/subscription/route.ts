import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const ALLOWED_SOURCES = ['zus', 'gus', 'nbp', 'sejm', 'uokik', 'fundusze', 'ezdrowie', 'arimr'];
const ALLOWED_AUDIENCES = ['wszyscy', 'jdg', 'firmy'];

async function getClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
          catch { /* ignore */ }
        },
      },
    }
  );
}

export async function GET() {
  const supabase = await getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('rss_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ subscription: data });
}

export async function PUT(request: NextRequest) {
  const supabase = await getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { source_ids?: unknown; audiences?: unknown; keywords?: unknown; active?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }

  const sourceIds = Array.isArray(body.source_ids)
    ? body.source_ids.filter((s): s is string => typeof s === 'string' && ALLOWED_SOURCES.includes(s))
    : [];
  const audiences = Array.isArray(body.audiences)
    ? body.audiences.filter((s): s is string => typeof s === 'string' && ALLOWED_AUDIENCES.includes(s))
    : [];
  const keywords = Array.isArray(body.keywords)
    ? body.keywords
        .filter((s): s is string => typeof s === 'string')
        .map(s => s.trim())
        .filter(s => s.length >= 2 && s.length <= 50)
        .slice(0, 20)
    : [];
  const active = typeof body.active === 'boolean' ? body.active : true;

  const payload = {
    user_id: user.id,
    email: user.email ?? '',
    source_ids: sourceIds,
    audiences,
    keywords,
    active,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('rss_subscriptions')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscription: data });
}

export async function DELETE() {
  const supabase = await getClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('rss_subscriptions')
    .delete()
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
