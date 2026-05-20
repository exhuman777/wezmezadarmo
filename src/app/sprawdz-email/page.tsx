import Link from 'next/link';

export default function SprawdzEmail() {
  return (
    <main>
      <section style={{ padding: '80px 0', minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '0 24px', width: '100%' }}>
          <div className="card card-glass" style={{ padding: '40px 36px', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--green-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            <div className="eyebrow green" style={{ marginBottom: 16, justifyContent: 'center' }}>Weryfikacja</div>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 28px)', marginBottom: 12 }}>
              Sprawdź skrzynkę pocztową
            </h3>
            <p style={{ fontSize: 14, color: 'var(--ink-600)', lineHeight: 1.6, marginBottom: 8 }}>
              Wysłaliśmy link aktywacyjny na Twój adres e-mail.
              Kliknij go, aby potwierdzić konto i zalogować się.
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-400)', lineHeight: 1.6, marginBottom: 28 }}>
              Jeśli nie widzisz wiadomości, sprawdź folder spam.
            </p>

            <Link href="/logowanie" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
              Wróć do logowania
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
