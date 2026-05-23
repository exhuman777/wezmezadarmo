import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// GET /api/aktualnosci/debug
// Zwraca raw stan polaczenia z Supabase + count w rss_cache.
// Pomocne do debugowania: dlaczego strona /aktualnosci pokazuje "2/8 aktywnych".

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    url_used: url ? url.replace(/^https?:\/\/([a-z0-9]+)\..*/, 'https://$1.supabase.co') : null,
  };

  if (!url || (!anonKey && !serviceKey)) {
    return NextResponse.json({
      ok: false,
      reason: 'Brak SUPABASE env',
      env: envStatus,
    });
  }

  // Test 1: anon key
  let anonResult: unknown = null;
  if (anonKey) {
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error, count } = await client
      .from('rss_cache')
      .select('source_id, fetched_at', { count: 'exact' })
      .limit(500);
    anonResult = error
      ? { error: { code: error.code, message: error.message, details: error.details } }
      : {
          ok: true,
          count,
          rows_returned: data?.length ?? 0,
          per_source: Object.entries(
            (data ?? []).reduce((acc: Record<string, number>, r) => {
              acc[r.source_id] = (acc[r.source_id] ?? 0) + 1;
              return acc;
            }, {})
          ).sort(),
          newest: data?.[0]?.fetched_at ?? null,
        };
  }

  // Test 2: service role key
  let serviceResult: unknown = null;
  if (serviceKey) {
    const client = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data, error, count } = await client
      .from('rss_cache')
      .select('source_id, fetched_at', { count: 'exact' })
      .limit(500);
    serviceResult = error
      ? { error: { code: error.code, message: error.message, details: error.details } }
      : {
          ok: true,
          count,
          rows_returned: data?.length ?? 0,
          per_source: Object.entries(
            (data ?? []).reduce((acc: Record<string, number>, r) => {
              acc[r.source_id] = (acc[r.source_id] ?? 0) + 1;
              return acc;
            }, {})
          ).sort(),
          newest: data?.[0]?.fetched_at ?? null,
        };
  }

  return NextResponse.json({
    env: envStatus,
    anon: anonResult,
    service: serviceResult,
    hint: 'Jesli anon ma error 42501 -> RLS policy zle. Jesli oba zero rows -> rss_cache jest pusty na tym projekcie. Jesli URL inny niz workflow -> jestes podpiety do innego projektu Supabase.',
  });
}
