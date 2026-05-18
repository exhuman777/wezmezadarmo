import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const OWNER_EMAIL = 'sobkowicz.kamil@gmail.com';

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');
  return new Resend(key);
}

export async function POST(req: NextRequest) {
  let body: { imie?: string; firma?: string; email?: string; wiadomosc?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Nieprawidłowy format danych.' }, { status: 400 });
  }

  const { imie, firma, email, wiadomosc } = body;

  if (!imie || !email || !wiadomosc) {
    return NextResponse.json({ error: 'Uzupełnij wymagane pola.' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Podaj poprawny adres e-mail.' }, { status: 400 });
  }

  if (wiadomosc.length > 5000) {
    return NextResponse.json({ error: 'Wiadomość jest za długa.' }, { status: 400 });
  }

  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'WezmeZaDarmo <hello@wezmezadarmo.com>',
      to: OWNER_EMAIL,
      replyTo: email,
      subject: `Zapytanie o automatyzację: ${firma ?? imie}`,
      html: `
        <div style="font-family:monospace;max-width:600px;margin:0 auto;background:#0d0b0a;color:#c4a882;padding:32px;border-radius:12px;">
          <h2 style="color:#e6993a;margin:0 0 24px;">Nowe zapytanie o automatyzację</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#888;width:130px;">Imię i nazwisko:</td>
              <td style="padding:8px 0;color:#c4a882;">${escapeHtml(imie)}</td>
            </tr>
            ${firma ? `<tr>
              <td style="padding:8px 0;color:#888;">Firma:</td>
              <td style="padding:8px 0;color:#c4a882;">${escapeHtml(firma)}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:8px 0;color:#888;">E-mail:</td>
              <td style="padding:8px 0;color:#e6993a;">${escapeHtml(email)}</td>
            </tr>
          </table>
          <div style="margin-top:24px;padding-top:24px;border-top:1px solid #2a2420;">
            <div style="color:#888;font-size:13px;margin-bottom:12px;">Wiadomość:</div>
            <div style="color:#c4a882;line-height:1.7;white-space:pre-wrap;">${escapeHtml(wiadomosc)}</div>
          </div>
          <div style="margin-top:32px;font-size:12px;color:#555;">
            Wysłano przez formularz na wezmezadarmo.com/automatyzacje
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('contact send error:', err);
    return NextResponse.json({ error: 'Błąd wysyłania. Spróbuj ponownie.' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
