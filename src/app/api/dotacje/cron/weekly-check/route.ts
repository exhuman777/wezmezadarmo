import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PROGRAMS } from '@/data/programs-b2b';
import { sendProgramAlert } from '@/lib/dotacje/emailAlerts';

export const dynamic = 'force-dynamic';

const NOTIFY_COOLDOWN_DAYS = 30;

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
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://wezmezadarmo.com';

  // Get all active subscribers with monitoring prefs
  const { data: activeUsers, error: usersError } = await admin
    .from('users')
    .select('id, email')
    .in('subscription_status', ['active', 'trial']);

  if (usersError || !activeUsers) {
    console.error('[cron/weekly-check] users fetch error:', usersError);
    return Response.json({ error: 'Błąd pobierania użytkowników.' }, { status: 500 });
  }

  if (activeUsers.length === 0) {
    return Response.json({ checked: 0, sent: 0 });
  }

  const userIds = activeUsers.map((u) => u.id);

  const { data: allPrefs, error: prefsError } = await admin
    .from('monitoring_prefs')
    .select('user_id, program_ids')
    .in('user_id', userIds);

  if (prefsError) {
    console.error('[cron/weekly-check] prefs fetch error:', prefsError);
    return Response.json({ error: 'Błąd pobierania preferencji.' }, { status: 500 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - NOTIFY_COOLDOWN_DAYS);

  const { data: recentLogs, error: logsError } = await admin
    .from('notification_log')
    .select('user_id, program_id')
    .in('user_id', userIds)
    .gte('created_at', cutoff.toISOString());

  if (logsError) {
    console.error('[cron/weekly-check] logs fetch error:', logsError);
    return Response.json({ error: 'Błąd pobierania logów powiadomień.' }, { status: 500 });
  }

  // Build a Set of "userId:programId" combos already notified recently
  const recentlyNotified = new Set<string>(
    (recentLogs ?? []).map((l) => `${l.user_id}:${l.program_id}`),
  );

  // Index users by id for email lookup
  const userMap = new Map(activeUsers.map((u) => [u.id, u.email as string]));

  // Index prefs by user_id
  const prefsMap = new Map(
    (allPrefs ?? []).map((p) => [p.user_id, p.program_ids as string[]]),
  );

  // Index programs by id for quick lookup
  const programMap = new Map(PROGRAMS.map((p) => [p.id, p]));

  let checked = 0;
  let sent = 0;

  for (const user of activeUsers) {
    const watchedIds = prefsMap.get(user.id);
    if (!watchedIds || watchedIds.length === 0) continue;

    for (const programId of watchedIds) {
      checked++;
      const program = programMap.get(programId);
      if (!program) continue;

      if (program.status !== 'open' && program.status !== 'expected') continue;

      const key = `${user.id}:${programId}`;
      if (recentlyNotified.has(key)) continue;

      const email = userMap.get(user.id);
      if (!email) continue;

      try {
        await sendProgramAlert({
          to: email,
          programName: program.name,
          institution: program.institution,
          openDate: program.openDate ?? 'Brak danych',
          closeDate: program.closeDate,
          maxAmountDesc: program.maxAmountDesc,
          url: program.url,
          panelUrl: `${baseUrl}/dotacje/panel`,
        });

        await admin.from('notification_log').insert({
          user_id: user.id,
          program_id: programId,
          created_at: new Date().toISOString(),
        });

        recentlyNotified.add(key);
        sent++;
      } catch (err) {
        console.error(`[cron/weekly-check] failed to notify ${user.id} for ${programId}:`, err);
      }
    }
  }

  return Response.json({ checked, sent });
}
