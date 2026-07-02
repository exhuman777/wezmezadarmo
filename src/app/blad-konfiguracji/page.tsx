import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usługa chwilowo niedostępna | wezmezadarmo',
  robots: { index: false, follow: false },
};

// Strona pokazywana przez middleware, gdy warstwa logowania (Supabase) nie jest
// poprawnie skonfigurowana na serwerze. Zamiast surowego bledu 500 uzytkownik
// widzi zrozumiale wyjasnienie i wie, co robic.
export default function BladKonfiguracji() {
  return (
    <div style={{ minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--color-text-3)', letterSpacing: '0.1em', marginBottom: 14 }}>
          503 · USŁUGA CHWILOWO NIEDOSTĘPNA
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--color-text-1)', margin: '0 0 16px' }}>
          Logowanie jest teraz niedostępne
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--color-text-2)', margin: '0 0 24px' }}>
          Panel wymaga zalogowania, ale usługa logowania chwilowo nie odpowiada z powodu
          problemu z konfiguracją serwera. To nie jest błąd po Twojej stronie i nie musisz nic robić.
        </p>

        <div style={{
          textAlign: 'left',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 10,
          padding: '18px 20px',
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-1)', marginBottom: 10 }}>Co się dzieje?</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-2)' }}>
            <li>Twoje dane i konto są bezpieczne, nic nie zostało utracone.</li>
            <li>Publiczna część serwisu (kalkulator, baza świadczeń, wnioski) działa normalnie.</li>
            <li>Zwykle wraca do działania w ciągu kilku minut. Spróbuj odświeżyć stronę później.</li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: 'var(--color-text-1)',
            color: 'var(--color-bg-0)',
            borderRadius: 10,
            fontSize: 15, fontWeight: 500,
            textDecoration: 'none',
          }}>
            ← Strona główna
          </Link>
          <Link href="/swiadczenia" style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: 'var(--color-surface)',
            color: 'var(--color-text-1)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            fontSize: 15, fontWeight: 500,
            textDecoration: 'none',
          }}>
            Przeglądaj świadczenia
          </Link>
        </div>

        <p style={{ fontSize: 13, color: 'var(--color-text-3)', margin: '24px 0 0' }}>
          Problem nie znika? Napisz na <a href="mailto:hello@wezmezadarmo.com" style={{ color: 'var(--color-text-2)' }}>hello@wezmezadarmo.com</a>
        </p>
      </div>
    </div>
  );
}
