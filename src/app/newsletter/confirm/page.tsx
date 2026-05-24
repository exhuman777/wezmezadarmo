import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Potwierdzenie zapisu | wezmezadarmo',
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

const MESSAGES: Record<string, { title: string; body: string; tone: 'success' | 'error' | 'info' }> = {
  ok: {
    title: 'Potwierdzone! 🎉',
    body: 'Dziękujemy. Od następnego tygodnia będziesz dostawać cotygodniowy raport: nowe świadczenia, terminy naborów, zmiany w prawie. Wypisać się można jednym kliknięciem w stopce każdego maila.',
    tone: 'success',
  },
  already: {
    title: 'Już potwierdzone',
    body: 'Ten zapis był już aktywny. Newsletter dostajesz w każdy poniedziałek rano. Jeśli go nie widzisz, sprawdź folder Spam.',
    tone: 'info',
  },
  unsubscribed: {
    title: 'Wypisałeś się wcześniej',
    body: 'Ten email był zapisany, ale został wypisany. Jeśli chcesz wrócić, zapisz się ponownie w stopce strony.',
    tone: 'info',
  },
  invalid: {
    title: 'Link nieprawidłowy lub wygasł',
    body: 'Token potwierdzający jest nieaktualny lub niepoprawny. Zapisz się ponownie - dostaniesz nowy link na maila.',
    tone: 'error',
  },
  error: {
    title: 'Coś poszło nie tak',
    body: 'Wystąpił błąd serwera. Spróbuj za chwilę albo napisz przez formularz kontaktowy.',
    tone: 'error',
  },
};

export default async function ConfirmPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = params.status ?? 'invalid';
  const msg = MESSAGES[status] ?? MESSAGES.invalid;

  const toneColor = msg.tone === 'success' ? '#22A06B' : msg.tone === 'error' ? '#c0392b' : '#6b7a72';
  const toneBg = msg.tone === 'success' ? 'rgba(34,160,107,0.08)' : msg.tone === 'error' ? 'rgba(192,57,43,0.06)' : 'var(--color-bg-2)';

  return (
    <main style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 540, width: '100%' }}>
        <div style={{
          padding: '32px 36px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
        }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: toneBg,
            color: toneColor,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Newsletter wezmezadarmo
          </div>

          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--color-text-1)',
            margin: '0 0 14px',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            {msg.title}
          </h1>

          <p style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: 'var(--color-text-2)',
            margin: '0 0 28px',
          }}>
            {msg.body}
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/" style={{
              padding: '12px 24px',
              background: 'var(--color-text-1)',
              color: 'var(--color-bg-0)',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}>
              ← Strona główna
            </Link>
            {msg.tone !== 'success' && (
              <Link href="/o-projekcie" style={{
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--color-text-1)',
                border: '1px solid var(--color-border)',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}>
                Kontakt
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
