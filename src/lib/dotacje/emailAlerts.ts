import { Resend } from 'resend';

interface AlertEmailData {
  to: string;
  programName: string;
  institution: string;
  openDate: string;
  closeDate: string | null;
  maxAmountDesc: string;
  url: string;
  panelUrl: string;
}

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  return new Resend(apiKey);
}

function buildAlertHtml(data: AlertEmailData): string {
  const closeDateLine = data.closeDate
    ? `<tr><td style="padding:6px 0;color:#888;font-size:14px;">Termin składania wniosków:</td><td style="padding:6px 0;font-size:14px;color:#c4a882;">${data.closeDate}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nowy nabór: ${data.programName}</title>
</head>
<body style="margin:0;padding:0;background:#0d0b0a;font-family:'Courier New',monospace;color:#c4a882;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111009;border:1px solid #2a2218;border-radius:4px;max-width:600px;width:100%;">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #2a2218;">
              <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;">wezmezadarmo.com -- alert dotacyjny</p>
              <h1 style="margin:12px 0 0;font-size:20px;color:#e6993a;line-height:1.3;">Nowy nabór: ${data.programName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;color:#888;font-size:14px;width:220px;">Instytucja:</td>
                  <td style="padding:6px 0;font-size:14px;color:#c4a882;">${data.institution}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;color:#888;font-size:14px;">Data otwarcia naboru:</td>
                  <td style="padding:6px 0;font-size:14px;color:#c4a882;">${data.openDate}</td>
                </tr>
                ${closeDateLine}
                <tr>
                  <td style="padding:6px 0;color:#888;font-size:14px;">Dofinansowanie:</td>
                  <td style="padding:6px 0;font-size:14px;color:#c4a882;">${data.maxAmountDesc}</td>
                </tr>
              </table>

              <div style="margin:24px 0;padding:16px;background:#1a1510;border-left:3px solid #e6993a;border-radius:2px;">
                <p style="margin:0;font-size:13px;color:#888;">
                  Spełniasz wstępne kryteria formalne tego programu. Nie gwarantujemy przyznania dofinansowania -- decyzja należy do instytucji prowadzącej nabór.
                </p>
              </div>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;">
                    <a href="${data.url}" style="display:inline-block;padding:12px 24px;background:#e6993a;color:#0d0b0a;text-decoration:none;font-size:14px;font-weight:bold;border-radius:2px;">
                      Przejdź do strony programu
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <a href="${data.panelUrl}" style="display:inline-block;padding:12px 24px;background:transparent;color:#e6993a;text-decoration:none;font-size:14px;border:1px solid #e6993a;border-radius:2px;">
                      Twój panel dotacji
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #2a2218;">
              <p style="margin:0;font-size:11px;color:#555;line-height:1.6;">
                Stan wiedzy: maj 2026. Weryfikuj terminy i wymagania bezpośrednio w instytucji przed złożeniem wniosku.
                <br>
                Nie chcesz otrzymywać powiadomień?
                <a href="${data.panelUrl}/monitoring" style="color:#888;">Zarządzaj alertami</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeHtml(companyName: string, panelUrl: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Witamy w wezmezadarmo.com</title>
</head>
<body style="margin:0;padding:0;background:#0d0b0a;font-family:'Courier New',monospace;color:#c4a882;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0b0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111009;border:1px solid #2a2218;border-radius:4px;max-width:600px;width:100%;">
          <tr>
            <td style="padding:24px 32px;border-bottom:1px solid #2a2218;">
              <p style="margin:0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:2px;">wezmezadarmo.com / dotacje</p>
              <h1 style="margin:12px 0 0;font-size:22px;color:#e6993a;line-height:1.3;">Konto aktywne</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#c4a882;">
                Witamy, <strong>${companyName}</strong>.
              </p>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#a08060;">
                Twój profil firmy został utworzony. Od teraz będziesz otrzymywać powiadomienia o nowych naborach dotacyjnych, które pasują do Twojego profilu działalności.
              </p>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#a08060;">
                Obejmujemy programy: KFS, PUP dla pracodawców, PFRON, KPO, programy samorządowe, PARP/FENG oraz BGK.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;">
                    <a href="${panelUrl}" style="display:inline-block;padding:12px 24px;background:#e6993a;color:#0d0b0a;text-decoration:none;font-size:14px;font-weight:bold;border-radius:2px;">
                      Przejdź do panelu
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #2a2218;">
              <p style="margin:0;font-size:11px;color:#555;line-height:1.6;">
                Stan wiedzy: maj 2026. Weryfikuj terminy i wymagania bezpośrednio w instytucji przed złożeniem wniosku.
                <br>
                Zarządzaj preferencjami alertów:
                <a href="${panelUrl}/monitoring" style="color:#888;">ustawienia monitoringu</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendProgramAlert(data: AlertEmailData): Promise<void> {
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: 'wezmezadarmo.com <alerty@wezmezadarmo.com>',
    to: data.to,
    subject: `Nowy nabór: ${data.programName}`,
    html: buildAlertHtml(data),
  });

  if (error) {
    throw new Error(`Failed to send program alert email: ${error.message}`);
  }
}

export async function sendWelcomeEmail(to: string, companyName: string): Promise<void> {
  const resend = getResendClient();

  const panelUrl = `${process.env.NEXT_PUBLIC_URL ?? 'https://wezmezadarmo.com'}/dotacje/panel`;

  const { error } = await resend.emails.send({
    from: 'wezmezadarmo.com <hello@wezmezadarmo.com>',
    to,
    subject: 'Konto aktywne -- wezmezadarmo.com/dotacje',
    html: buildWelcomeHtml(companyName, panelUrl),
  });

  if (error) {
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
}
