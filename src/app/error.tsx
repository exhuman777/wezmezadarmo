'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side logging (Vercel logs będą miały to)
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 540, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#c0392b', letterSpacing: '0.1em', marginBottom: 14 }}>
          BŁĄD APLIKACJI
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--color-text-1)', margin: '0 0 16px' }}>
          Coś poszło nie tak
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-text-2)', margin: '0 0 24px' }}>
          Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub wróć na stronę główną. Jeśli problem się powtarza, skontaktuj się przez formularz.
        </p>

        {error.digest && (
          <div style={{
            display: 'inline-block',
            padding: '6px 12px',
            background: 'var(--color-bg-2)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--color-text-3)',
            marginBottom: 24,
          }}>
            ID błędu: {error.digest}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset} style={{
            padding: '12px 28px',
            background: 'var(--color-text-1)', color: 'var(--color-bg-0)',
            border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 500, cursor: 'pointer',
          }}>
            Spróbuj ponownie
          </button>
          <Link href="/" style={{
            padding: '12px 28px',
            background: 'transparent', color: 'var(--color-text-1)',
            border: '1px solid var(--color-border)', borderRadius: 10,
            fontSize: 15, fontWeight: 500, textDecoration: 'none',
            display: 'inline-block',
          }}>
            ← Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}
