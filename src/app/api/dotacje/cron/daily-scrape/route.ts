/**
 * Daily grant scraper -- fetches B2B RSS sources, stores nabory in DB.
 * Triggered by Vercel Cron at 06:00 UTC daily.
 *
 * Required Supabase tables (run once in Supabase SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS grant_scrape_log (
 *     id TEXT PRIMARY KEY,
 *     source_id TEXT NOT NULL,
 *     source_name TEXT NOT NULL,
 *     title TEXT NOT NULL,
 *     link TEXT NOT NULL,
 *     description TEXT,
 *     pub_date TIMESTAMPTZ,
 *     is_nabor BOOLEAN DEFAULT FALSE,
 *     is_close BOOLEAN DEFAULT FALSE,
 *     matched_program_id TEXT,
 *     scraped_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   CREATE INDEX IF NOT EXISTS grant_scrape_log_scraped_at
 *     ON grant_scrape_log (scraped_at DESC);
 *   CREATE INDEX IF NOT EXISTS grant_scrape_log_matched
 *     ON grant_scrape_log (matched_program_id, scraped_at DESC);
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapeGrantSources } from '@/lib/dotacje/grantScraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro: 60s; Hobby: capped at 10s

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Nieautoryzowany.' }, { status: 401 });
  }

  const admin = getAdminClient();

  let scraped = 0;
  let upserted = 0;
  let errors = 0;

  try {
    const items = await scrapeGrantSources();
    scraped = items.length;

    if (items.length === 0) {
      return Response.json({ scraped: 0, upserted: 0, errors: 0, message: 'Brak nowych wpisów naboru.' });
    }

    // Upsert in batches of 50 to stay within Supabase limits
    const BATCH = 50;
    for (let i = 0; i < items.length; i += BATCH) {
      const batch = items.slice(i, i + BATCH).map(item => ({
        id: item.id,
        source_id: item.sourceId,
        source_name: item.sourceName,
        title: item.title,
        link: item.link,
        description: item.description ?? null,
        pub_date: item.pubDate ?? null,
        is_nabor: item.isNabor,
        is_close: item.isClose,
        matched_program_id: item.matchedProgramId ?? null,
        scraped_at: item.scrapedAt,
      }));

      const { error } = await admin
        .from('grant_scrape_log')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: true });

      if (error) {
        console.error('[daily-scrape] upsert error:', error.message);
        errors++;
      } else {
        upserted += batch.length;
      }
    }

    // Prune old entries -- keep only last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    await admin
      .from('grant_scrape_log')
      .delete()
      .lt('scraped_at', cutoff.toISOString());

  } catch (err) {
    console.error('[daily-scrape] unexpected error:', err);
    return Response.json(
      { error: 'Nieoczekiwany błąd podczas scrapowania.', detail: String(err) },
      { status: 500 },
    );
  }

  console.log(`[daily-scrape] done: scraped=${scraped} upserted=${upserted} errors=${errors}`);
  return Response.json({
    scraped,
    upserted,
    errors,
    runAt: new Date().toISOString(),
  });
}
