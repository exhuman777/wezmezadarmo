/**
 * Powiadomienie dla właściciela (Kamil) o każdym użyciu formularza na stronie.
 * Zawsze włączone, niezależne od maili do użytkowników. Nigdy nie rzuca błędem:
 * zapis zgłoszenia jest ważniejszy niż mail. Jedna ponowna próba przy błędzie sieci albo 5xx.
 * Adres odbiorcy tylko po stronie serwera (POWIADOMIENIA_EMAIL), nigdy w kodzie klienta ani w odpowiedziach API.
 */

const DOMYSLNY_ODBIORCA = 'sobkowicz.kamil@gmail.com';
const NADAWCA = process.env.RESEND_FROM_EMAIL || 'WezmeZaDarmo <hello@wezmezadarmo.com>';

export type Powiadomienie = {
  strona: string;
  formularz: string;
  pola: Record<string, string | number | boolean | null | undefined>;
  panel?: string;
  odpowiedzDo?: string;
};

export type WynikPowiadomienia = { wyslane: boolean; id?: string; blad?: string };

export function odbiorcaPowiadomien(): string {
  return (process.env.POWIADOMIENIA_EMAIL || DOMYSLNY_ODBIORCA).trim();
}

export function esc(v: unknown): string {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

const jednaLinia = (s: string) => s.replace(/[\r\n]+/g, ' ').slice(0, 150);

export function tematPowiadomienia(p: Powiadomienie): string {
  return jednaLinia(`[${p.strona}] Nowe zgłoszenie: ${p.formularz}`);
}

export function trescPowiadomienia(p: Powiadomienie, kiedy = new Date()): { html: string; text: string } {
  const data = kiedy.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
  const wiersze = Object.entries(p.pola).filter(([, v]) => v !== undefined && v !== null && v !== '');
  const html = `<!DOCTYPE html><html lang="pl"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:#2b2420;background:#ffffff;">
<h1 style="font-size:18px;margin:0 0 6px;">${esc(p.strona)}: ${esc(p.formularz)}</h1>
<p style="font-size:13px;color:#6f655b;margin:0 0 16px;">${esc(data)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;border-collapse:collapse;">
${wiersze.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#6f655b;vertical-align:top;">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap;">${esc(v)}</td></tr>`).join('\n')}
</table>
${p.panel ? `<p style="font-size:13px;margin:16px 0 0;"><a href="${esc(p.panel)}">Otwórz panel</a></p>` : ''}
</body></html>`;
  const text = [`${p.strona}: ${p.formularz}`, data, '', ...wiersze.map(([k, v]) => `${k}: ${String(v)}`), p.panel ? `\nPanel: ${p.panel}` : '']
    .join('\n');
  return { html, text };
}

type Fetch = typeof fetch;

/** Wspólny przekaźnik powiadomień (Cyfrowy Pomocnik). Uwierzytelnienie tokenem OIDC Vercela tej funkcji. */
export const PRZEKAZNIK = process.env.POWIADOMIENIA_PRZEKAZNIK || 'https://www.cyfrowypomocnik.com/api/powiadomienie';

/** Token OIDC Vercela: nagłówek żądania (route handler) albo VERCEL_OIDC_TOKEN. Brak = pusty napis. */
export async function tokenOidc(): Promise<string> {
  try {
    const { headers } = await import('next/headers');
    const t = (await headers()).get('x-vercel-oidc-token');
    if (t) return t;
  } catch {
    // poza kontekstem żądania (testy, skrypty)
  }
  return process.env.VERCEL_OIDC_TOKEN || '';
}

/** Próba przez przekaźnik. Zwraca wynik albo null, gdy przekaźnik nie odpowiedział poprawnie (wtedy wysyłka lokalna). */
export async function przezPrzekaznik(p: Powiadomienie, token: string, f: Fetch = fetch, opcje: { url?: string; cookie?: string } = {}): Promise<WynikPowiadomienia | null> {
  const etykieta = `[powiadomienie] ${p.strona} / ${p.formularz}`;
  if (!token) {
    console.error(`${etykieta}: brak tokenu OIDC, przekaźnik pominięty`);
    return null;
  }
  const body = JSON.stringify({ formularz: p.formularz, pola: p.pola, panel: p.panel, odpowiedzDo: p.odpowiedzDo });
  for (let proba = 1; proba <= 2; proba++) {
    try {
      const r = await f(opcje.url || PRZEKAZNIK, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opcje.cookie ? { Cookie: opcje.cookie } : {}) },
        body,
        signal: AbortSignal.timeout(8000),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; id?: string; powod?: string };
      if (r.ok && j.ok) {
        console.log(`${etykieta}: wysłane przez przekaźnik, id ${j.id ?? '?'}`);
        return { wyslane: true, id: j.id };
      }
      console.error(`${etykieta}: przekaźnik HTTP ${r.status}${j.powod ? ' (' + j.powod + ')' : ''}`);
      if (r.status < 500 && r.status !== 429) return null;
    } catch (e) {
      console.error(`${etykieta}: przekaźnik sieć (${e instanceof Error ? e.name : 'błąd'})`);
    }
  }
  return null;
}

/** Powiadomienie dla Kamila: najpierw przekaźnik (token OIDC), potem lokalny Resend. Nigdy nie rzuca. */
export async function powiadomKamila(p: Powiadomienie, f: Fetch = fetch, token?: string): Promise<WynikPowiadomienia> {
  const przez = await przezPrzekaznik(p, token ?? (await tokenOidc()), f);
  if (przez) return przez;
  return powiadomLokalnie(p, f);
}

/** Wysyła powiadomienie lokalnym Resend. Loguje wynik bez danych osobowych. */
export async function powiadomLokalnie(p: Powiadomienie, f: Fetch = fetch): Promise<WynikPowiadomienia> {
  const etykieta = `[powiadomienie] ${p.strona} / ${p.formularz}`;
  const klucz = process.env.RESEND_API_KEY;
  if (!klucz) {
    console.error(`${etykieta}: brak RESEND_API_KEY, mail nie wyszedł`);
    return { wyslane: false, blad: 'brak RESEND_API_KEY' };
  }
  const { html, text } = trescPowiadomienia(p);
  const body = JSON.stringify({
    from: NADAWCA,
    to: [odbiorcaPowiadomien()],
    subject: tematPowiadomienia(p),
    html,
    text,
    ...(p.odpowiedzDo && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(p.odpowiedzDo) ? { reply_to: p.odpowiedzDo } : {}),
  });
  let blad = '';
  for (let proba = 1; proba <= 2; proba++) {
    try {
      const r = await f('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${klucz}`, 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) {
        const j = (await r.json().catch(() => ({}))) as { id?: string };
        console.log(`${etykieta}: wysłane, id ${j.id ?? '?'}`);
        return { wyslane: true, id: j.id };
      }
      blad = `HTTP ${r.status}`;
      if (r.status < 500 && r.status !== 429) break;
    } catch (e) {
      blad = e instanceof Error ? e.name : 'błąd sieci';
    }
  }
  console.error(`${etykieta}: nie wyszło (${blad})`);
  return { wyslane: false, blad };
}

/** Test toru na podglądzie: adres przekaźnika tylko z podglądu Cyfrowego Pomocnika naszego zespołu. */
export const PRZEKAZNIK_PODGLAD = /^https:\/\/cyfrowy-pomocnik-[a-z0-9-]+-exhuman777s-projects\.vercel\.app\/api\/powiadomienie$/;

/** Ciasteczko dostępu do chronionego podglądu z linku udostępniania Vercela (tylko do testu toru). */
export async function ciasteczkoPodgladu(przekaznik: string, share: string, f: Fetch = fetch): Promise<string> {
  const r = await f(new URL(`/?_vercel_share=${encodeURIComponent(share)}`, przekaznik).toString(), { redirect: 'manual' });
  const h = r.headers as Headers & { getSetCookie?: () => string[] };
  const lista = typeof h.getSetCookie === 'function' ? h.getSetCookie() : [r.headers.get('set-cookie') || ''];
  return lista.map((c) => c.split(';')[0]).filter(Boolean).join('; ');
}

/** Jawne pola tokenu OIDC (bez podpisu): do sprawdzenia, czy projekt ma włączone OIDC. */
export function polaTokenu(token: string): Record<string, unknown> | null {
  try {
    const c = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'));
    return { iss: c.iss, aud: c.aud, owner_id: c.owner_id, project_id: c.project_id, environment: c.environment };
  } catch {
    return null;
  }
}
