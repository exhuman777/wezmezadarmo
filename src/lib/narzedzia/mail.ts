/** Mail z linkiem do narzędzi dla firm (Resend, nadawca jak newsletter). W trybie testowym nic nie wysyła. */
import { getResend } from '@/lib/newsletter';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'WezmeZaDarmo <hello@wezmezadarmo.com>';
export const SITE_URL = 'https://www.wezmezadarmo.com';

export function linkPotwierdzenia(token: string, baza = SITE_URL): string {
  return `${baza}/api/narzedzia/potwierdz?token=${encodeURIComponent(token)}`;
}

export function mailHtml(link: string, imie: string | null): string {
  const powitanie = imie ? `Dzień dobry, ${imie.replace(/[<>&"]/g, '')}!` : 'Dzień dobry!';
  return `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 16px;background:#f6f0e4;font-family:Arial,Helvetica,sans-serif;color:#2b2420;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="540" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px solid #2b2420;">
<tr><td style="padding:28px 32px 8px;font-family:'Courier New',monospace;font-weight:bold;font-size:15px;">wezmezadarmo.com</td></tr>
<tr><td style="padding:8px 32px 0;">
<h1 style="font-size:21px;margin:0 0 12px;">Potwierdź adres i otwórz narzędzia dla firm</h1>
<p style="font-size:15px;line-height:1.6;margin:0 0 8px;">${powitanie}</p>
<p style="font-size:15px;line-height:1.6;margin:0 0 20px;">Kliknij przycisk, a otworzysz za darmo przegląd księgi KPiR, przegląd pliku JPK_V7 przed 2027 i sprawdzenie dofinansowań po NIP. Link działa 7 dni.</p>
</td></tr>
<tr><td style="padding:0 32px 24px;"><a href="${link}" style="display:inline-block;padding:14px 24px;background:#2b2420;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;">Otwórz narzędzia</a></td></tr>
<tr><td style="padding:0 32px 24px;font-size:12px;line-height:1.5;color:#6f655b;word-break:break-all;">Link: ${link}</td></tr>
<tr><td style="padding:16px 32px 24px;border-top:1px solid #d9cbb2;font-size:12px;line-height:1.5;color:#6f655b;">
Jeśli to nie Ty, zignoruj tę wiadomość. Pliki, które sprawdzasz w narzędziach, czyta tylko Twoja przeglądarka.<br>
wezmezadarmo.com, Mooning Charts Research Kamil Sobkowicz (NIP 7133061369)</td></tr>
</table></td></tr></table></body></html>`;
}

export async function wyslijLink(email: string, link: string, imie: string | null): Promise<void> {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Twój link do narzędzi dla firm na wezmezadarmo.com',
    html: mailHtml(link, imie),
  });
  if (error) throw new Error('wysyłka maila nie powiodła się');
}

/** Adres Kamila: tu przychodzi każdy nowy lead z narzędzi dla firm (ten sam co raporty audytu i formularz kontaktowy). */
export const WLASCICIEL_EMAIL = 'sobkowicz.kamil@gmail.com';

const esc = (v: string) => v.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c] as string));

export function mailLeadHtml(dane: { email: string; imie: string | null; telefon: string | null }, kiedy: Date): string {
  const wiersz = (k: string, v: string | null) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6f655b;">${k}</td><td style="padding:6px 0;font-weight:bold;">${v ? esc(v) : '-'}</td></tr>`;
  return `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 16px;background:#f6f0e4;font-family:Arial,Helvetica,sans-serif;color:#2b2420;">
<h1 style="font-size:19px;margin:0 0 12px;">Nowy lead: narzędzia dla firm</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;">
${wiersz('E-mail', dane.email)}${wiersz('Imię', dane.imie)}${wiersz('Telefon', dane.telefon)}${wiersz('Kiedy', kiedy.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }))}
</table>
<p style="font-size:13px;color:#6f655b;margin:16px 0 0;">Zgoda na kontakt: tak. Adres jeszcze niepotwierdzony; status potwierdzenia: <a href="${SITE_URL}/admin/narzedzia">${SITE_URL}/admin/narzedzia</a></p>
</body></html>`;
}

/** Powiadomienie dla Kamila o nowym leadzie. Błąd nie blokuje formularza. */
export async function powiadomWlasciciela(dane: { email: string; imie: string | null; telefon: string | null }): Promise<void> {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: WLASCICIEL_EMAIL,
    replyTo: dane.email,
    subject: `[lead] Narzędzia dla firm: ${dane.email}`,
    html: mailLeadHtml(dane, new Date()),
  });
  if (error) throw new Error('powiadomienie o leadzie nie wyszło');
}
