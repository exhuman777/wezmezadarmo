/**
 * GET  /api/agent/chat/conversations - lista rozmow uzytkownika (max 50, sortowane po updated_at)
 * POST /api/agent/chat/conversations - utworz nowa rozmowe
 *
 * Limit free tier: 10 rozmow per user (oprocznie tej tworzonej).
 * Po przekroczeniu - error z linkiem do upgrade'a.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/dotacje/supabase';

export const dynamic = 'force-dynamic';

const FREE_LIMIT = 10;
const VALID_MODES = new Set(['ogolny', 'swiadczenie', 'wniosek', 'nabor', 'faktura', 'termin']);

export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('id, title, mode, message_count, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    conversations: data ?? [],
    limit: FREE_LIMIT,
    count: data?.length ?? 0,
    isOverLimit: (data?.length ?? 0) >= FREE_LIMIT,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: { title?: string; mode?: string; firstMessage?: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }

  // Sprawdz limit (free tier)
  const { count } = await supabase
    .from('chat_conversations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if ((count ?? 0) >= FREE_LIMIT) {
    return NextResponse.json({
      error: 'limit_reached',
      message: `Darmowy serwis ma limit ${FREE_LIMIT} rozmów. Usuń starszą rozmowę albo poczekaj na wersję płatną bez limitów.`,
      limit: FREE_LIMIT,
    }, { status: 403 });
  }

  const mode = VALID_MODES.has(body.mode ?? '') ? body.mode! : 'ogolny';
  const titleSrc = body.title?.trim() || body.firstMessage?.trim() || 'Nowa rozmowa';
  const title = titleSrc.slice(0, 80);

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: user.id,
      title,
      mode,
      messages: [],
      message_count: 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ conversation: data });
}
