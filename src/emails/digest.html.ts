import type { DigestPayload } from '@/lib/digest';
import { emailHash } from '@/lib/newsletter';

export function buildDigestSubject(payload: DigestPayload): string {
  const count = payload.rssItems.length + payload.benefits.length;
  return `Agent znalazł ${count} ${count === 1 ? 'aktualizację' : 'aktualizacje'} - ${payload.date}`;
}

export function buildDigestHtml(payload: DigestPayload): string {
  const accentColor = '#e6993a';
  const bgColor = '#faf8f2';
  const textColor = '#1a1814';
  const mutedColor = '#8c7b6b';
  const borderColor = '#e8e0d4';

  const benefitsSection = payload.benefits.length > 0 ? `
    <tr><td style="padding: 24px 32px 0;">
      <div style="font-family: monospace; font-size: 11px; color: ${mutedColor}; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
        Co Ci przysługuje
      </div>
      ${payload.benefits.map(r => `
        <div style="border: 1px solid ${r.status === 'PRZYSLUGUJE' ? accentColor : borderColor}; border-radius: 6px; padding: 14px 16px; margin-bottom: 8px; background: #fff;">
          <div style="font-family: monospace; font-size: 13px; font-weight: 600; color: ${textColor}; margin-bottom: 4px;">
            ${escHtml(r.benefit.nazwa)}
          </div>
          ${r.benefit.kwota ? `<div style="font-family: monospace; font-size: 12px; color: ${accentColor}; margin-bottom: 6px;">${escHtml(r.benefit.kwota)}</div>` : ''}
          ${r.benefit.zrodloUrl ? `<a href="${escHtml(r.benefit.zrodloUrl)}" style="font-size: 12px; color: ${accentColor}; text-decoration: none;">Oficjalne źródło &rarr;</a>` : ''}
        </div>
      `).join('')}
    </td></tr>
  ` : '';

  const rssSection = payload.rssItems.length > 0 ? `
    <tr><td style="padding: 24px 32px 0;">
      <div style="font-family: monospace; font-size: 11px; color: ${mutedColor}; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px;">
        Aktualności i zmiany w prawie
      </div>
      ${payload.rssItems.map(item => `
        <div style="border-bottom: 1px solid ${borderColor}; padding: 12px 0;">
          <a href="${escHtml(item.link)}" style="font-size: 13px; font-weight: 500; color: ${textColor}; text-decoration: none; display: block; margin-bottom: 4px;">
            ${escHtml(item.title)}
          </a>
          <div style="font-size: 11px; color: ${mutedColor};">
            ${escHtml(item.source)}${item.pubDate ? ` &bull; ${new Date(item.pubDate).toLocaleDateString('pl-PL')}` : ''}
          </div>
        </div>
      `).join('')}
    </td></tr>
  ` : '';

  const greeting = payload.companyName
    ? `Raport dla: <strong>${escHtml(payload.companyName)}</strong>`
    : 'Twój dzienny raport od agenta AI';

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Digest agenta - ${escHtml(payload.date)}</title>
</head>
<body style="margin: 0; padding: 0; background: ${bgColor}; font-family: -apple-system, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding: 32px 16px;">
      <table role="presentation" width="100%" style="max-width: 600px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; overflow: hidden;">

        <!-- Header -->
        <tr><td style="background: #0d0b0a; padding: 24px 32px;">
          <div style="font-family: monospace; font-size: 13px; color: ${accentColor}; font-weight: 500;">
            wezmezadarmo<span style="color: #4a4540;">.com</span>
          </div>
          <div style="font-family: monospace; font-size: 18px; color: #faf8f2; font-weight: 500; margin-top: 8px; letter-spacing: -0.02em;">
            ${greeting}
          </div>
          <div style="font-family: monospace; font-size: 11px; color: #8c7b6b; margin-top: 6px;">
            ${escHtml(payload.date)}
          </div>
        </td></tr>

        ${benefitsSection}
        ${rssSection}

        <!-- Footer -->
        <tr><td style="padding: 24px 32px; border-top: 1px solid ${borderColor}; background: #f5f0e8;">
          <div style="font-size: 11px; color: ${mutedColor}; line-height: 1.6;">
            <a href="https://wezmezadarmo.com/agent/panel/powiadomienia" style="color: ${accentColor}; text-decoration: none;">Zarządzaj ustawieniami</a>
            &nbsp;&bull;&nbsp;
            <a href="https://wezmezadarmo.com/agent/panel" style="color: ${accentColor}; text-decoration: none;">Panel agenta</a>
            &nbsp;&bull;&nbsp;
            <a href="https://wezmezadarmo.com/api/newsletter/unsubscribe?email=${encodeURIComponent(payload.to)}&hash=${emailHash(payload.to)}" style="color: ${mutedColor}; text-decoration: underline;">Wypisz się</a>
          </div>
          <div style="font-size: 10px; color: ${mutedColor}; margin-top: 8px; line-height: 1.5;">
            Ten e-mail nie zawiera Twoich danych osobowych.
            Dane przetwarzamy zgodnie z RODO. Nie sprzedajemy danych.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
