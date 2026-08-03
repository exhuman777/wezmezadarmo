import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllBenefits } from '@/engine/benefits';
import { auditAll, type PreviousAudit, type AuditResult } from '@/lib/benefits-audit';
import { getResend } from '@/lib/newsletter';
import { buildAuditHtml, buildAuditSubject, type AuditEmailStats } from '@/emails/audit.html';

const ALERT_EMAIL = 'sobkowicz.kamil@gmail.com';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'WezmeZaDarmo <hello@wezmezadarmo.com>';

/**
 * Cron endpoint -- audit wszystkich 133 zrodloUrl ze swiadczen.
 * Vercel Cron schedule: poniedzialek 6:00 UTC (8:00 PL).
 *
 * Zabezpieczenia:
 * - CRON_SECRET header (Vercel automatically sends Authorization: Bearer <secret>)
 * - Manual run mozliwy z ?secret=<CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  // Auth: Vercel Cron sends Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  const urlSecret = new URL(request.url).searchParams.get('secret');

  if (secret && authHeader !== `Bearer ${secret}` && urlSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase config missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const benefits = getAllBenefits();

  // Pobierz poprzednie audyty
  const { data: prevAudits } = await supabase
    .from('benefits_url_audit')
    .select('benefit_id, last_content_hash, last_content_length, consecutive_errors');

  const previousMap = new Map<string, PreviousAudit>(
    (prevAudits ?? []).map(a => [a.benefit_id, a as PreviousAudit]),
  );

  // Map benefits -> audit input
  const auditInputs = benefits
    .filter(b => b.zrodloUrl && b.zrodloUrl.startsWith('http'))
    .map(b => ({
      benefitId: b.id,
      benefitName: b.nazwa,
      category: b.kategoria,
      url: b.zrodloUrl,
    }));

  const startedAt = Date.now();
  const results = await auditAll(auditInputs, previousMap);
  const durationMs = Date.now() - startedAt;

  // Upsert do bazy
  const rows = results.map(r => {
    const prev = previousMap.get(r.benefitId);
    // Miekki 404 zwraca HTTP 200 (finalna strona glowna dziala), ale to blad
    // zrodla -- liczymy go jako blad, tak samo jak twardy 404/5xx/timeout.
    const isError = r.httpStatus === 0 || r.httpStatus >= 400
      || r.status === 'NOT_FOUND' || r.status === 'TIMEOUT' || r.status === 'BLOCKED';
    const consecutiveErrors = isError ? (prev?.consecutive_errors ?? 0) + 1 : 0;
    const contentChanged = prev?.last_content_hash && r.contentHash && r.contentHash !== prev.last_content_hash;

    return {
      benefit_id: r.benefitId,
      benefit_name: r.benefitName,
      category: r.category,
      url: r.url,
      last_status: r.httpStatus,
      last_status_text: r.status,
      last_note: r.note ?? null,
      last_content_hash: r.contentHash ?? prev?.last_content_hash ?? null,
      last_content_length: r.contentLength,
      last_checked_at: new Date().toISOString(),
      ...(contentChanged && { last_changed_at: new Date().toISOString() }),
      last_change_pct: r.changePct,
      needs_review: r.needsReview,
      consecutive_errors: consecutiveErrors,
    };
  });

  const { error: upsertError } = await supabase
    .from('benefits_url_audit')
    .upsert(rows, { onConflict: 'benefit_id' });

  if (upsertError) {
    console.error('[benefits-audit] upsert error:', upsertError);
  }

  // Przy okazji cotygodniowego crona: sprzatnij stare wpisy rate limitu czatu
  // (tabela chat_rate_limits, wpisy starsze niz 48h). Fire-and-forget.
  const { error: cleanupError } = await supabase.rpc('cleanup_chat_rate_limits');
  if (cleanupError) {
    // Brak migracji 20260705_chat_rate_limits = brak funkcji; nie blokuj audytu
    console.error('[benefits-audit] rate limit cleanup skipped:', cleanupError.message);
  }

  // Wybierz alerty (needs_review = true)
  const alerts = results.filter(r => r.needsReview);

  // Statystyki
  const stats = {
    total: results.length,
    ok: results.filter(r => r.status === 'OK').length,
    changed: results.filter(r => r.status === 'CHANGED').length,
    notFound: results.filter(r => r.status === 'NOT_FOUND').length,
    redirects: results.filter(r => r.status === 'REDIRECT').length,
    timeouts: results.filter(r => r.status === 'TIMEOUT').length,
    blocked: results.filter(r => r.status === 'BLOCKED').length,
    new: results.filter(r => r.status === 'NEW').length,
    alerts: alerts.length,
    durationMs,
  };

  // Wyslij email gdy sa alerty
  if (alerts.length > 0) {
    try {
      await sendAlertEmail(alerts, stats);
    } catch (emailErr) {
      console.error('[benefits-audit] email send failed:', emailErr);
    }
  }

  return NextResponse.json({
    ok: true,
    stats,
    alerts: alerts.map(a => ({
      benefit: a.benefitName,
      url: a.url,
      status: a.status,
      note: a.note,
    })),
  });
}

async function sendAlertEmail(alerts: AuditResult[], stats: AuditEmailStats): Promise<void> {
  const resend = getResend();
  const date = new Date().toLocaleDateString('pl-PL');

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ALERT_EMAIL,
    subject: buildAuditSubject(alerts.length, date),
    html: buildAuditHtml(alerts, stats, date),
  });
}
