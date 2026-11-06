// Ekran ładowania: sam napis, bez kręcącego się kółka (strona nie używa animacji).
export default function Loading() {
  return (
    <div role="status" aria-live="polite" style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <p style={{ margin: 0, fontSize: 14, fontFamily: 'var(--f-mono)', color: 'var(--szary)', letterSpacing: '0.08em' }}>
        ŁADOWANIE...
      </p>
    </div>
  );
}
