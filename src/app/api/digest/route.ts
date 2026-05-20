import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { FEEDS, fetchFeeds } from '@/app/aktualnosci/rss';
import type { FeedMeta } from '@/app/aktualnosci/rss';
import { matchBenefits } from '@/engine/matcher';
import type { UserProfile } from '@/engine/types';
import { filterRecentItems, buildPrivateDigestPayload, buildJdgDigestPayload } from '@/lib/digest';
import { buildDigestHtml, buildDigestSubject } from '@/emails/digest.html';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!authHeader || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseAdmin = getAdminClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: prefRows, error: prefError } = await supabaseAdmin
    .from('email_preferences')
    .select('user_id, categories, last_digest_sent_at')
    .eq('digest_enabled', true);

  if (prefError || !prefRows) {
    console.error('[digest/cron] błąd pobierania preferencji:', prefError);
    return NextResponse.json({ error: 'Błąd bazy danych.' }, { status: 500 });
  }

  const defaultFeedResult = await fetchFeeds(FEEDS).catch(() => ({
    items: [] as Awaited<ReturnType<typeof fetchFeeds>>['items'],
    active: [] as string[],
    failed: [] as string[],
  }));
  const recentDefaultItems = filterRecentItems(defaultFeedResult.items);

  const results = { sent: 0, skipped: 0, errors: 0 };

  await Promise.allSettled(
    prefRows.map(async pref => {
      try {
        const [userRes, profileRes] = await Promise.all([
          supabaseAdmin.auth.admin.getUserById(pref.user_id as string),
          supabaseAdmin
            .from('agent_user_profiles')
            .select('*')
            .eq('user_id', pref.user_id)
            .single(),
        ]);

        const email = userRes.data?.user?.email;
        const profile = profileRes.data;

        if (!email || !profile) {
          results.errors++;
          return;
        }

        const { data: userFeeds } = await supabaseAdmin
          .from('company_rss_feeds')
          .select('id, feed_url, feed_name, kategoria')
          .eq('user_id', pref.user_id)
          .eq('aktywna', true);

        const customMetas: FeedMeta[] = (userFeeds ?? []).map(f => ({
          id: f.id as string,
          name: f.feed_name as string,
          fullName: f.feed_name as string,
          url: f.feed_url as string,
          audiences: ['wszyscy' as const],
          tags: f.kategoria ? [f.kategoria as string] : [],
        }));

        let allRecentItems = [...recentDefaultItems];
        if (customMetas.length > 0) {
          const customResult = await fetchFeeds(customMetas).catch(() => ({
            items: [] as typeof recentDefaultItems,
            active: [] as string[],
            failed: [] as string[],
          }));
          allRecentItems = [...allRecentItems, ...filterRecentItems(customResult.items)];
        }

        const userCategories: string[] = (pref.categories as string[]) ?? [];
        // Build sourceId -> tags lookup from FEEDS registry
        const feedTagsMap = new Map<string, string[]>(FEEDS.map(f => [f.id, f.tags]));
        const filteredItems = userCategories.length > 0
          ? allRecentItems.filter(item => {
              const feedTags = feedTagsMap.get(item.sourceId) ?? [];
              return userCategories.some(cat =>
                item.sourceId === cat || feedTags.includes(cat)
              );
            })
          : allRecentItems;

        let payload;

        if (profile.type === 'jdg') {
          payload = buildJdgDigestPayload(
            email,
            (profile.company_name as string | null) ?? 'Twoja firma',
            filteredItems,
          );
        } else {
          const userProfile: UserProfile = {
            wiek: (profile.wiek as number | null) ?? 30,
            plec: (profile.plec as 'K' | 'M' | null) ?? 'M',
            stanCywilny: (profile.stan_cywilny as string | null) ?? 'wolny',
            liczbaDzieci: (profile.liczba_dzieci as number | null) ?? 0,
            wiekDzieci: (profile.wiek_dzieci as number[] | null) ?? [],
            dochodMiesiecznie: (profile.dochod_miesiecznie as number | null) ?? 0,
            dochodNaOsobe: (profile.dochod_na_osobe as number | null) ?? 0,
            zatrudnienie: (profile.zatrudnienie as string | null) ?? 'umowa_o_prace',
            niepelnosprawnosc: (profile.niepelnosprawnosc as string | null) ?? 'brak',
            wlasnosc: (profile.wlasnosc as string | null) ?? 'wynajem',
            wojewodztwo: (profile.wojewodztwo as string | null) ?? 'mazowieckie',
            prowadzDzialalnosc: false,
            pierwszaDzialalnosc: false,
            ciaza: (profile.ciaza as boolean | null) ?? false,
            student: (profile.student as boolean | null) ?? false,
            emeryt: (profile.emeryt as boolean | null) ?? false,
            rolnik: (profile.rolnik as boolean | null) ?? false,
            bezrobotnyZarejestrowany: (profile.bezrobotny_zarejestrowany as boolean | null) ?? false,
          };
          const benefitResults = matchBenefits(userProfile);
          payload = buildPrivateDigestPayload(email, filteredItems, benefitResults);
        }

        if (!payload.hasContent) {
          await supabaseAdmin.from('digest_log').insert({
            user_id: pref.user_id,
            skipped: true,
            skip_reason: 'no_new_content',
            items_count: 0,
          });
          results.skipped++;
          return;
        }

        const subject = buildDigestSubject(payload);
        const html = buildDigestHtml(payload);

        const { error: sendError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'agent@wezmezadarmo.com',
          to: email,
          subject,
          html,
        });

        if (sendError) {
          console.error(`[digest/cron] błąd wysyłki dla user ${pref.user_id}:`, sendError);
          results.errors++;
          return;
        }

        await Promise.all([
          supabaseAdmin
            .from('email_preferences')
            .update({ last_digest_sent_at: new Date().toISOString() })
            .eq('user_id', pref.user_id),
          supabaseAdmin.from('digest_log').insert({
            user_id: pref.user_id,
            subject,
            items_count: payload.rssItems.length + payload.benefits.length,
            skipped: false,
          }),
        ]);

        results.sent++;
      } catch (err) {
        console.error(`[digest/cron] nieoczekiwany błąd dla user ${pref.user_id}:`, err);
        results.errors++;
      }
    })
  );

  console.log(
    `[digest/cron] wynik: sent=${results.sent} skipped=${results.skipped} errors=${results.errors}`
  );
  return NextResponse.json({ ...results, total: prefRows.length });
}
