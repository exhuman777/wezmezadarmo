import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// GET /api/admin/rss-status
// Zwraca podsumowanie ostatnich runow RSS cron-a:
// - ostatnie 7 dni
// - per-source success rate
// - ostatni run per source
// - aktualna swiezosc cache (najnowszy wpis per source)

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [logsRes, cacheRes] = await Promise.all([
    supabase
      .from('rss_run_log')
      .select('source_id, status, source, count, duration_ms, error_message, created_at, run_id')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('rss_cache')
      .select('source_id, source_name, fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1000),
  ]);

  if (logsRes.error) return NextResponse.json({ error: logsRes.error.message }, { status: 500 });

  const logs = logsRes.data ?? [];
  const cache = cacheRes.data ?? [];

  // Per-source stats
  const sources: Record<string, {
    source_id: string;
    runs_7d: number;
    ok_7d: number;
    success_rate: number;
    last_run: string | null;
    last_status: string | null;
    last_count: number | null;
    last_source: string | null;
    last_error: string | null;
    cached_items: number;
    newest_cached: string | null;
    oldest_cached: string | null;
  }> = {};

  for (const log of logs) {
    if (!sources[log.source_id]) {
      sources[log.source_id] = {
        source_id: log.source_id,
        runs_7d: 0, ok_7d: 0, success_rate: 0,
        last_run: null, last_status: null, last_count: null,
        last_source: null, last_error: null,
        cached_items: 0, newest_cached: null, oldest_cached: null,
      };
    }
    const s = sources[log.source_id];
    s.runs_7d++;
    if (log.status === 'ok') s.ok_7d++;
    if (!s.last_run) {
      s.last_run = log.created_at;
      s.last_status = log.status;
      s.last_count = log.count;
      s.last_source = log.source;
      s.last_error = log.error_message;
    }
  }

  for (const item of cache) {
    if (!sources[item.source_id]) continue;
    const s = sources[item.source_id];
    s.cached_items++;
    if (!s.newest_cached || item.fetched_at > s.newest_cached) s.newest_cached = item.fetched_at;
    if (!s.oldest_cached || item.fetched_at < s.oldest_cached) s.oldest_cached = item.fetched_at;
  }

  for (const s of Object.values(sources)) {
    s.success_rate = s.runs_7d > 0 ? Math.round((s.ok_7d / s.runs_7d) * 100) : 0;
  }

  // Recent runs (grouped by run_id)
  const runs: Record<string, { run_id: string; started: string; sources: number; ok: number; total_items: number; total_duration_ms: number }> = {};
  for (const log of logs) {
    if (!runs[log.run_id]) {
      runs[log.run_id] = { run_id: log.run_id, started: log.created_at, sources: 0, ok: 0, total_items: 0, total_duration_ms: 0 };
    }
    const r = runs[log.run_id];
    r.sources++;
    if (log.status === 'ok') r.ok++;
    r.total_items += log.count;
    r.total_duration_ms += log.duration_ms ?? 0;
    if (log.created_at < r.started) r.started = log.created_at;
  }

  const recentRuns = Object.values(runs)
    .sort((a, b) => b.started.localeCompare(a.started))
    .slice(0, 20);

  return NextResponse.json({
    sources: Object.values(sources).sort((a, b) => a.source_id.localeCompare(b.source_id)),
    recent_runs: recentRuns,
    total_cached: cache.length,
    window_days: 7,
    generated_at: new Date().toISOString(),
  });
}
