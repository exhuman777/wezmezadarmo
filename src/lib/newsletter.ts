/**
 * Newsletter helpers: token generation, email templates, send via Resend.
 */

import { Resend } from 'resend';
import { createHash, randomBytes } from 'crypto';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'WezmeZaDarmo <hello@wezmezadarmo.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wezmezadarmo.com';

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  return new Resend(key);
}

/** Generate cryptographically random token (32 chars hex). */
export function generateToken(): string {
  return randomBytes(16).toString('hex');
}

/** Stable hash dla unsubscribe linkow (email + secret) -- niereversibalne. */
export function emailHash(email: string): string {
  const secret = process.env.NEWSLETTER_SECRET || 'wzd-default-secret-replace-in-prod';
  return createHash('sha256').update(`${email.toLowerCase()}:${secret}`).digest('hex').slice(0, 24);
}

export function verifyEmailHash(email: string, hash: string): boolean {
  return emailHash(email) === hash;
}

// ============================================================
// EMAIL TEMPLATES
// ============================================================

export function confirmEmailHtml(token: string, profileType: 'private' | 'jdg'): string {
  const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const profileLabel = profileType === 'jdg' ? 'firmę / JDG' : 'osobę prywatną';

  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f0f6f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0c1714;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f0f6f1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="540" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dbe2dc;">
        <tr><td style="padding:32px 36px 8px;">
          <div style="display:inline-block;width:10px;height:10px;background:#22A06B;border-radius:50%;vertical-align:middle;"></div>
          <span style="font-size:15px;font-weight:600;color:#0c1714;margin-left:8px;">wezmezadarmo<span style="color:#888;font-weight:400;font-size:12px;">.com</span></span>
        </td></tr>
        <tr><td style="padding:16px 36px 8px;">
          <h1 style="font-size:22px;font-weight:700;color:#0c1714;margin:0 0 12px;letter-spacing:-0.01em;">Potwierdź zapis na newsletter</h1>
          <p style="font-size:15px;line-height:1.6;color:#2f3d36;margin:0 0 8px;">
            Cześć! Zarejestrowałeś się do newslettera wezmezadarmo jako <strong>${profileLabel}</strong>.
          </p>
          <p style="font-size:15px;line-height:1.6;color:#2f3d36;margin:0 0 24px;">
            Aby zacząć otrzymywać cotygodniowy raport (nowe świadczenia, zmiany w prawie, otwarte nabory), kliknij przycisk:
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 36px 24px;">
          <a href="${confirmUrl}" style="display:inline-block;padding:14px 28px;background:#0d2b1c;color:#ffffff;border-radius:10px;text-decoration:none;font-size:15px;font-weight:600;">Potwierdź zapis</a>
        </td></tr>
        <tr><td style="padding:0 36px 24px;">
          <p style="font-size:13px;line-height:1.6;color:#6b7a72;margin:0 0 8px;">
            Albo skopiuj link do przeglądarki:
          </p>
          <p style="font-size:12px;line-height:1.5;color:#0d2b1c;word-break:break-all;background:#f0f6f1;padding:10px 12px;border-radius:6px;margin:0;font-family:monospace;">
            ${confirmUrl}
          </p>
        </td></tr>
        <tr><td style="padding:16px 36px 28px;border-top:1px solid #dbe2dc;">
          <p style="font-size:12px;line-height:1.5;color:#97a39b;margin:0 0 6px;">
            Jeśli to nie Ty się zapisałeś, zignoruj tę wiadomość. Nic się nie stanie -- konto bez potwierdzenia jest usuwane w ciągu 7 dni.
          </p>
          <p style="font-size:12px;line-height:1.5;color:#97a39b;margin:0;">
            wezmezadarmo.com -- Mooning Charts Research Kamil Sobkowicz (NIP 7133061369)
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function unsubscribeFooter(email: string): { html: string; text: string } {
  const hash = emailHash(email);
  const url = `${SITE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&hash=${hash}`;
  return {
    html: `<p style="font-size:11px;color:#97a39b;text-align:center;margin:24px 0 0;line-height:1.5;">
      Otrzymujesz tę wiadomość bo zapisałeś się do newslettera wezmezadarmo.com.<br>
      <a href="${url}" style="color:#6b7a72;text-decoration:underline;">Wypisz się jednym klikiem</a> &middot;
      <a href="${SITE_URL}/polityka-prywatnosci" style="color:#6b7a72;text-decoration:underline;">Polityka prywatności</a>
    </p>`,
    text: `\n\n---\nWypisz się: ${url}\nPolityka prywatności: ${SITE_URL}/polityka-prywatnosci\n`,
  };
}

export async function sendConfirmEmail(email: string, token: string, profileType: 'private' | 'jdg'): Promise<void> {
  const resend = getResend();
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Potwierdź zapis na newsletter wezmezadarmo',
    html: confirmEmailHtml(token, profileType),
  });
}
