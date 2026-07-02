import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllBenefits } from '@/engine/benefits';
import { auditAll, type PreviousAudit, type AuditResult } from '@/lib/benefits-audit';
import { getResend } from '@/lib/newsletter';

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
    const isError = r.httpStatus === 0 || r.httpStatus >= 400;
    const consecutiveErrors = isError ? (prev?.consecutive_errors ?? 0) + 1 : 0;
    const contentChanged = prev?.last_content_hash && r.contentHash && r.contentHash !== prev.last_content_hash;

    return {
      benefit_id: r.benefitId,
      benefit_name: r.benefitName,
      category: r.category,
      url: r.url,
      last_status: r.httpStatus,
      last_status_text: r.status,
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

async function sendAlertEmail(alerts: AuditResult[], stats: Record<string, number>): Promise<void> {
  const resend = getResend();
  const date = new Date().toLocaleDateString('pl-PL');

  const alertsByStatus = {
    NOT_FOUND: alerts.filter(a => a.status === 'NOT_FOUND'),
    REDIRECT: alerts.filter(a => a.status === 'REDIRECT'),
    CHANGED: alerts.filter(a => a.status === 'CHANGED'),
    TIMEOUT: alerts.filter(a => a.status === 'TIMEOUT'),
    BLOCKED: alerts.filter(a => a.status === 'BLOCKED'),
  };

  const section = (title: string, color: string, items: AuditResult[]) => {
    if (items.length === 0) return '';
    return `
      <h3 style="font-size:14px;color:${color};margin:20px 0 8px;">${title} (${items.length})</h3>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#2f3d36;line-height:1.7;">
        ${items.map(a => `<li>
          <strong>${escapeHtml(a.benefitName)}</strong> [${escapeHtml(a.category)}]<br>
          <a href="${escapeHtml(a.url)}" style="color:#0d2b1c;font-size:11px;font-family:monospace;">${escapeHtml(a.url)}</a>
          ${a.note ? `<br><span style="font-size:11px;color:#6b7a72;">${escapeHtml(a.note)}</span>` : ''}
        </li>`).join('')}
      </ul>
    `;
  };

  const html = `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f6f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0c1714;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0f6f1;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="640" style="background:#ffffff;border-radius:14px;border:1px solid #dbe2dc;">
        <tr><td style="padding:28px 32px 8px;">
          <div style="display:inline-block;padding:4px 10px;background:rgba(255,176,32,0.12);color:#a05a1a;border-radius:6px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
            Audyt zrodel
          </div>
          <h1 style="font-size:22px;font-weight:700;margin:14px 0 6px;letter-spacing:-0.01em;">
            ${alerts.length} ${alerts.length === 1 ? 'swiadczenie wymaga' : 'swiadczen wymaga'} sprawdzenia
          </h1>
          <p style="font-size:13px;color:#6b7a72;margin:0;">${date} -- automatyczny audyt zrodloUrl</p>
        </td></tr>

        <tr><td style="padding:8px 32px;">
          <div style="background:#f5f5f0;border:1px solid #dbe2dc;border-radius:8px;padding:14px 16px;display:flex;flex-wrap:wrap;gap:16px;font-size:12px;">
            <span>Sprawdzono: <strong>${stats.total}</strong></span>
            <span style="color:#22A06B;">OK: <strong>${stats.ok}</strong></span>
            ${stats.notFound > 0 ? `<span style="color:#c0392b;">404: <strong>${stats.notFound}</strong></span>` : ''}
            ${stats.changed > 0 ? `<span style="color:#a05a1a;">Zmiana: <strong>${stats.changed}</strong></span>` : ''}
            ${stats.redirects > 0 ? `<span style="color:#a05a1a;">Redirect: <strong>${stats.redirects}</strong></span>` : ''}
            ${stats.timeouts > 0 ? `<span style="color:#6b7a72;">Timeout: <strong>${stats.timeouts}</strong></span>` : ''}
            ${stats.blocked > 0 ? `<span style="color:#6b7a72;">Blocked: <strong>${stats.blocked}</strong></span>` : ''}
          </div>
        </td></tr>

        <tr><td style="padding:8px 32px 24px;">
          ${section('🔴 404 -- strona nie istnieje', '#c0392b', alertsByStatus.NOT_FOUND)}
          ${section('🟠 Redirect -- URL sie zmienil', '#a05a1a', alertsByStatus.REDIRECT)}
          ${section('🟡 Zmiana tresci', '#a05a1a', alertsByStatus.CHANGED)}
          ${section('⚪ Timeout (>3 razy)', '#6b7a72', alertsByStatus.TIMEOUT)}
          ${section('⚪ Blokada (>3 razy)', '#6b7a72', alertsByStatus.BLOCKED)}
        </td></tr>

        <tr><td style="padding:16px 32px 24px;border-top:1px solid #dbe2dc;font-size:12px;color:#6b7a72;line-height:1.6;">
          <p style="margin:0 0 6px;">
            Audyt wykonany automatycznie. Sprawdzono ${stats.total} URLi w ${(stats.durationMs / 1000).toFixed(1)}s.
          </p>
          <p style="margin:0;">
            <a href="https://www.wezmezadarmo.com/admin/benefits-audit" style="color:#0d2b1c;font-weight:500;">Otworz panel admin</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ALERT_EMAIL,
    subject: `[audyt] ${alerts.length} swiadczen wymaga sprawdzenia (${date})`,
    html,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
