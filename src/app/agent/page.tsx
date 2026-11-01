'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const CECHY = [
  { label: 'Zna Twoją sytuację', desc: 'Po uzupełnieniu profilu odpowiada pod Twój wiek, rodzinę, dochód i firmę.' },
  { label: '133 świadczenia', desc: 'Pokazuje te, które pasują, z linkiem do źródła.' },
  { label: 'Dane na żywo', desc: 'Kurs w NBP, kolejka w NFZ, NIP na Białej Liście VAT, powietrze z GIOŚ.' },
  { label: 'Komunikaty urzędów', desc: 'Cytuje komunikaty ZUS, PFRON, GUS, Sejmu i ministerstw, z linkiem.' },
  { label: 'Wnioski ZUS', desc: 'Podpowiada, co wpisać w 7 formularzach, i przygotowuje PDF.' },
  { label: 'Bez zmyślania', desc: 'Gdy czegoś nie ma w bazie, mówi to wprost i odsyła do urzędu.' },
];

const PRZYKLADY = [
  'Jakie świadczenia mi przysługują?',
  'Czy mogę dostać 800+ na dziecko?',
  'Ile czekam do kardiologa?',
  'Sprawdź NIP 7342867148',
  'Jak złożyć wniosek o zasiłek chorobowy?',
  'Jakie ulgi podatkowe mam jako JDG?',
];

function AgentContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  // Zalogowany -> /panel, niezalogowany -> /rejestracja (bez starych przekierowań /agent/*).
  const primaryHref = loggedIn ? '/panel' : '/rejestracja';
  const secondaryHref = loggedIn ? '/panel/chat' : '/logowanie';
  const primaryLabel = loggedIn ? 'Przejdź do panelu' : 'Załóż darmowe konto';
  const secondaryLabel = loggedIn ? 'Otwórz czat AI' : 'Mam już konto';

  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Asystent AI</p>
        <h1>Zapytaj o świadczenia, ZUS i urzędy</h1>
        <p className="pod">Asystent odpowiada z bazy świadczeń i danych urzędów. Bez konta zadasz 3 pytania dziennie.</p>
        <div className="przyciski">
          <Link href={primaryHref} className="btn btn-primary btn-lg">{primaryLabel}</Link>
          <Link href={secondaryHref} className="btn btn-lg">{secondaryLabel}</Link>
        </div>
      </section>

      {q && (
        <section className="prosta-blok" aria-live="polite">
          <h2>Twoje pytanie</h2>
          <p style={{ fontFamily: 'var(--f-mono)', fontWeight: 700 }}>&bdquo;{q}&rdquo;</p>
          <p className="pod">
            {loggedIn
              ? 'Otwórz czat, a asystent odpowie z dostępem do Twojego profilu.'
              : 'Zaloguj się, a asystent odpowie z dostępem do Twojego profilu. Możesz też poszukać w bazie bez logowania.'}
          </p>
          <div className="przyciski">
            <Link
              href={loggedIn ? `/panel/chat?q=${encodeURIComponent(q)}` : `/logowanie?next=${encodeURIComponent('/panel/chat?q=' + q)}`}
              className="btn btn-rdza btn-lg"
            >
              {loggedIn ? 'Otwórz czat AI' : 'Zaloguj się i zapytaj'}
            </Link>
            {!loggedIn && (
              <Link href={`/swiadczenia?q=${encodeURIComponent(q)}`} className="btn btn-lg">Szukaj w bazie</Link>
            )}
          </div>
        </section>
      )}

      <section className="prosta-blok">
        <h2>Przykładowe pytania</h2>
        <ul className="linki">
          {PRZYKLADY.map(text => {
            const href = loggedIn ? `/panel/chat?q=${encodeURIComponent(text)}` : `/agent?q=${encodeURIComponent(text)}`;
            return (
              <li key={text}>
                <Link href={href}><span>{text}</span><span aria-hidden="true">→</span></Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="prosta-blok">
        <h2>Co potrafi</h2>
        <ul className="lista">
          {CECHY.map(c => <li key={c.label}><b>{c.label}.</b> {c.desc}</li>)}
        </ul>
        <p className="mala" style={{ marginTop: 16 }}>
          Asystent ma charakter informacyjny i nie składa wniosków za Ciebie. Działa na modelu Google Gemini przez OpenRouter, pytania nie służą do trenowania modeli.
        </p>
      </section>
    </main>
  );
}

export default function AgentLanding() {
  return (
    <Suspense>
      <AgentContent />
    </Suspense>
  );
}
