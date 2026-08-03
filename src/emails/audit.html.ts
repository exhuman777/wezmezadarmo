/**
 * Builder maila alertowego cotygodniowego audytu zrodloUrl (benefits-audit).
 * Czysta funkcja bez efektow ubocznych - dzieki temu tresc maila jest w pelni
 * testowalna (patrz src/emails/__tests__/audit.html.test.ts), a route jedynie
 * przekazuje wynik do Resend.
 */
import { suggestedSearchUrl, type AuditResult } from '@/lib/benefits-audit';

export interface AuditEmailStats {
  total: number;
  ok: number;
  changed: number;
  notFound: number;
  redirects: number;
  timeouts: number;
  blocked: number;
  durationMs: number;
}

/**
 * Poprawna polska odmiana rzeczownika "świadczenie" z liczebnikiem oraz
 * zgodnym orzeczeniem: 1 świadczenie wymaga, 2-4 świadczenia wymagają,
 * 5+ świadczeń wymaga (z wyjątkiem 12-14, które używają formy dopełniacza).
 */
export function swiadczeniaPhrase(n: number): string {
  if (n === 1) return '1 świadczenie wymaga sprawdzenia';
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) {
    return `${n} świadczenia wymagają sprawdzenia`;
  }
  return `${n} świadczeń wymaga sprawdzenia`;
}

export function buildAuditSubject(alertCount: number, date: string): string {
  return `[audyt] ${swiadczeniaPhrase(alertCount)} (${date})`;
}

export function buildAuditHtml(alerts: AuditResult[], stats: AuditEmailStats, date: string): string {
  const alertsByStatus = {
    NOT_FOUND: alerts.filter(a => a.status === 'NOT_FOUND'),
    REDIRECT: alerts.filter(a => a.status === 'REDIRECT'),
    CHANGED: alerts.filter(a => a.status === 'CHANGED'),
    TIMEOUT: alerts.filter(a => a.status === 'TIMEOUT'),
    BLOCKED: alerts.filter(a => a.status === 'BLOCKED'),
  };

  const section = (title: string, color: string, items: AuditResult[]) => {
    if (items.length === 0) return '';
    const dot = `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${color};margin-right:8px;vertical-align:middle;"></span>`;
    return `
      <h3 style="font-size:14px;color:${color};margin:20px 0 8px;">${dot}${title} (${items.length})</h3>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#2f3d36;line-height:1.7;">
        ${items.map(a => `<li style="margin-bottom:10px;">
          <strong>${escapeHtml(a.benefitName)}</strong> [${escapeHtml(a.category)}]<br>
          <a href="${escapeHtml(a.url)}" style="color:#0d2b1c;font-size:11px;font-family:monospace;">${escapeHtml(a.url)}</a>
          ${a.note ? `<br><span style="font-size:11px;color:#6b7a72;">${escapeHtml(a.note)}</span>` : ''}
          ${(a.status === 'NOT_FOUND' || a.status === 'REDIRECT') ? `<br><a href="${escapeHtml(suggestedSearchUrl(a.benefitName))}" style="font-size:11px;color:#22A06B;font-weight:600;">Znajdź aktualne źródło &rarr;</a>` : ''}
        </li>`).join('')}
      </ul>
    `;
  };

  return `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f6f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0c1714;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0f6f1;padding:32px 16px;">
    <tr><td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="640" style="background:#ffffff;border-radius:14px;border:1px solid #dbe2dc;">
        <tr><td style="padding:28px 32px 8px;">
          <div style="display:inline-block;padding:4px 10px;background:rgba(255,176,32,0.12);color:#a05a1a;border-radius:6px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
            Audyt źródeł
          </div>
          <h1 style="font-size:22px;font-weight:700;margin:14px 0 6px;letter-spacing:-0.01em;">
            ${swiadczeniaPhrase(alerts.length)}
          </h1>
          <p style="font-size:13px;color:#6b7a72;margin:0;">${escapeHtml(date)} - automatyczny audyt adresów źródłowych</p>
        </td></tr>

        <tr><td style="padding:8px 32px;">
          <div style="background:#f5f5f0;border:1px solid #dbe2dc;border-radius:8px;padding:14px 16px;font-size:12px;line-height:1.9;">
            <span style="display:inline-block;margin-right:18px;white-space:nowrap;">Sprawdzono: <strong>${stats.total}</strong></span>
            <span style="display:inline-block;margin-right:18px;white-space:nowrap;color:#22A06B;">OK: <strong>${stats.ok}</strong></span>
            ${stats.notFound > 0 ? `<span style="display:inline-block;margin-right:18px;white-space:nowrap;color:#c0392b;">404: <strong>${stats.notFound}</strong></span>` : ''}
            ${stats.changed > 0 ? `<span style="display:inline-block;margin-right:18px;white-space:nowrap;color:#a05a1a;">Zmiana: <strong>${stats.changed}</strong></span>` : ''}
            ${stats.redirects > 0 ? `<span style="display:inline-block;margin-right:18px;white-space:nowrap;color:#a05a1a;">Redirect: <strong>${stats.redirects}</strong></span>` : ''}
            ${stats.timeouts > 0 ? `<span style="display:inline-block;margin-right:18px;white-space:nowrap;color:#6b7a72;">Timeout: <strong>${stats.timeouts}</strong></span>` : ''}
            ${stats.blocked > 0 ? `<span style="display:inline-block;margin-right:18px;white-space:nowrap;color:#6b7a72;">Blocked: <strong>${stats.blocked}</strong></span>` : ''}
          </div>
        </td></tr>

        <tr><td style="padding:8px 32px 24px;">
          ${section('404 - strona nie istnieje', '#c0392b', alertsByStatus.NOT_FOUND)}
          ${section('Redirect - URL się zmienił', '#a05a1a', alertsByStatus.REDIRECT)}
          ${section('Zmiana treści', '#a05a1a', alertsByStatus.CHANGED)}
          ${section('Timeout (>3 razy)', '#6b7a72', alertsByStatus.TIMEOUT)}
          ${section('Blokada (>3 razy)', '#6b7a72', alertsByStatus.BLOCKED)}
        </td></tr>

        <tr><td style="padding:16px 32px 24px;border-top:1px solid #dbe2dc;font-size:12px;color:#6b7a72;line-height:1.6;">
          <p style="margin:0 0 6px;">
            Audyt wykonany automatycznie. Sprawdzono ${stats.total} URLi w ${(stats.durationMs / 1000).toFixed(1)}s.
          </p>
          <p style="margin:0;">
            <a href="https://www.wezmezadarmo.com/admin/benefits-audit" style="color:#0d2b1c;font-weight:500;">Otwórz panel admin</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
