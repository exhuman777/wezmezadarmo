/**
 * Rate limit czatu AI: 3 zapytania / 24h na IP.
 *
 * Wersja trwala (Supabase RPC increment_chat_rate_limit) -- licznik wspolny
 * dla wszystkich instancji funkcji i odporny na deploy. Gdy Supabase jest
 * niedostepny lub brak env, spada do limitu w pamieci procesu (lepszy taki
 * niz zaden). Prywatnosc: do bazy trafia wylacznie SHA-256 hash IP.
 */

import { createHash } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const ipRequests = new Map<string, number[]>();

const MAX_REQUESTS = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/** In-memory fallback -- per instancja, zeruje sie przy deploy. */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const timestamps = ipRequests.get(ip) ?? [];

  // Remove expired entries
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= MAX_REQUESTS) {
    ipRequests.set(ip, valid);
    return { allowed: false, remaining: 0 };
  }

  valid.push(now);
  ipRequests.set(ip, valid);
  return { allowed: true, remaining: MAX_REQUESTS - valid.length };
}

let serviceClient: SupabaseClient | null | undefined;

function getServiceClient(): SupabaseClient | null {
  if (serviceClient !== undefined) return serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  serviceClient = url && key ? createClient(url, key) : null;
  return serviceClient;
}

function hashIp(ip: string): string {
  // Staly salt aplikacji: hash nieodwracalny slownikowo dla pojedynczych IP,
  // a nie wymaga dodatkowego env. Nie przechowujemy surowych IP (RODO).
  return createHash('sha256').update(`wezmezadarmo-rl:${ip}`).digest('hex');
}

/**
 * Trwaly rate limit (Supabase). Fallback do pamieci procesu przy braku
 * konfiguracji lub bledzie bazy -- czat ma dzialac nawet gdy limit kuleje.
 */
export async function checkRateLimitDurable(ip: string): Promise<RateLimitResult> {
  const supabase = getServiceClient();
  if (!supabase) return checkRateLimit(ip);

  try {
    const { data, error } = await supabase
      .rpc('increment_chat_rate_limit', { p_ip_hash: hashIp(ip), p_max: MAX_REQUESTS })
      .single<{ allowed: boolean; remaining: number }>();
    if (error || !data) return checkRateLimit(ip);
    return { allowed: data.allowed, remaining: data.remaining };
  } catch {
    return checkRateLimit(ip);
  }
}

// Cleanup old entries every 10 minutes
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    for (const [ip, timestamps] of ipRequests.entries()) {
      const valid = timestamps.filter((t) => now - t < WINDOW_MS);
      if (valid.length === 0) {
        ipRequests.delete(ip);
      } else {
        ipRequests.set(ip, valid);
      }
    }
  };
  setInterval(cleanup, 10 * 60 * 1000);
}
