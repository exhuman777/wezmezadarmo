import Link from 'next/link';

export default function SprawdzEmail() {
  return (
    <main>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--color-text-3)', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 8,
        }}>
          Weryfikacja
        </div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
          Sprawdź skrzynkę pocztową
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-2)', lineHeight: 1.6, marginBottom: 16 }}>
          Wysłaliśmy link aktywacyjny na Twój adres e-mail. Kliknij go, aby potwierdzić konto.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text-3)', lineHeight: 1.6, marginBottom: 32 }}>
          Jeśli nie widzisz wiadomości, sprawdź folder spam.
        </p>
        <Link href="/agent/logowanie" style={{
          fontFamily: 'var(--font-mono)', fontSize: 13,
          color: 'var(--color-green)', textDecoration: 'none',
        }}>
          Wróć do logowania
        </Link>
      </div>
    </main>
  );
}
