/**
 * GET /api/health
 * Endpoint zwraca status krytycznych systemow.
 * Uzywany przez UptimeRobot, status page, debug.
 *
 * Cache: no-store (zawsze swieze).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CheckResult {
  ok: boolean;
  latency_ms?: number;
  detail?: string;
  count?: number;
  newest?: string | null;
}

async function checkSupabase(): Promise<CheckResult> {
  const t0 = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !key) return { ok: false, detail: 'missing env' };
  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { count, error } = await client
      .from('rss_cache')
      .select('id', { count: 'exact', head: true });
    if (error) return { ok: false, detail: error.message, latency_ms: Date.now() - t0 };
    return { ok: true, count: count ?? 0, latency_ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, detail: (e as Error).message, latency_ms: Date.now() - t0 };
  }
}

async function checkRssCache(): Promise<CheckResult> {
  const t0 = Date.now();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  if (!url || !key) return { ok: false, detail: 'missing env' };
  try {
    const res = await fetch(`${url}/rest/v1/rss_cache?select=fetched_at&order=fetched_at.desc&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}`, latency_ms: Date.now() - t0 };
    const data = await res.json() as Array<{ fetched_at: string }>;
    return {
      ok: true,
      newest: data[0]?.fetched_at ?? null,
      latency_ms: Date.now() - t0,
    };
  } catch (e) {
    return { ok: false, detail: (e as Error).message, latency_ms: Date.now() - t0 };
  }
}

async function checkNbp(): Promise<CheckResult> {
  const t0 = Date.now();
  try {
    const res = await fetch('https://api.nbp.pl/api/exchangerates/tables/A?format=json', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    return { ok: res.ok, latency_ms: Date.now() - t0 };
  } catch (e) {
    return { ok: false, detail: (e as Error).message, latency_ms: Date.now() - t0 };
  }
}

async function checkOpenRouter(): Promise<CheckResult> {
  if (!process.env.OPENROUTER_API_KEY) return { ok: false, detail: 'missing api key' };
  // Tylko check ze klucz jest, brak faktycznego callu zeby nie zabijac quoty
  return { ok: true, detail: 'configured' };
}

async function checkResend(): Promise<CheckResult> {
  if (!process.env.RESEND_API_KEY) return { ok: false, detail: 'missing api key' };
  return { ok: true, detail: 'configured' };
}

export async function GET() {
  const t0 = Date.now();

  const [supabase, rssCache, nbp, openrouter, resend] = await Promise.all([
    checkSupabase(),
    checkRssCache(),
    checkNbp(),
    checkOpenRouter(),
    checkResend(),
  ]);

  const allOk = [supabase, rssCache, nbp, openrouter, resend].every(c => c.ok);

  return NextResponse.json({
    status: allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    total_latency_ms: Date.now() - t0,
    checks: { supabase, rss_cache: rssCache, nbp_api: nbp, openrouter, resend },
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
  }, {
    status: allOk ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  });
}
