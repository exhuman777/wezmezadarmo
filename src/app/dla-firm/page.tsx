'use client';

import { useState } from 'react';

/* ── Terminal code window ── */
function TerminalWindow() {
  const C = {
    cmd:    '#e06c75',
    flag:   '#56b6c2',
    method: '#e5c07b',
    url:    '#61afef',
    str:    '#98c379',
    key:    '#e06c75',
    num:    '#d19a66',
    dim:    '#6b7280',
    base:   '#abb2bf',
  };
  return (
    <div style={{ margin: '16px 0 0', border: '2px solid var(--tusz)' }}>
      <div className="mono" style={{ background: 'var(--tusz)', color: 'var(--papier)', padding: '6px 12px', fontSize: 12 }}>
        api-request.sh
      </div>
      {/* Code area */}
      <div style={{
        background: '#191510',
        padding: '16px 18px',
        overflowX: 'auto',
      }}>
        <pre style={{
          margin: 0, fontFamily: 'var(--font-mono)', fontSize: 12.5,
          lineHeight: 1.75, whiteSpace: 'pre',
        }}>
          <span style={{ color: C.cmd }}>curl</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.flag }}>-X</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.method }}>POST</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.url }}>https://wezmezadarmo.com/api/verify</span>
          <span style={{ color: C.dim }}> \{'\n'}</span>
          <span style={{ color: C.base }}>  </span>
          <span style={{ color: C.flag }}>-H</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.str }}>&quot;Content-Type: application/json&quot;</span>
          <span style={{ color: C.dim }}> \{'\n'}</span>
          <span style={{ color: C.base }}>  </span>
          <span style={{ color: C.flag }}>-H</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.str }}>&quot;X-API-Key: TWOJ_KLUCZ_API&quot;</span>
          <span style={{ color: C.dim }}> \{'\n'}</span>
          <span style={{ color: C.base }}>  </span>
          <span style={{ color: C.flag }}>-d</span>
          <span style={{ color: C.base }}> </span>
          <span style={{ color: C.dim }}>&apos;{'{ '}</span>
          <span style={{ color: C.key }}>&quot;profile&quot;</span>
          <span style={{ color: C.dim }}>: {'{ '}</span>
          <span style={{ color: C.key }}>&quot;wiek&quot;</span>
          <span style={{ color: C.dim }}>: </span>
          <span style={{ color: C.num }}>35</span>
          <span style={{ color: C.dim }}>, </span>
          <span style={{ color: C.key }}>&quot;plec&quot;</span>
          <span style={{ color: C.dim }}>: </span>
          <span style={{ color: C.str }}>&quot;K&quot;</span>
          <span style={{ color: C.dim }}>,{'\n'}    </span>
          <span style={{ color: C.key }}>&quot;liczbaDzieci&quot;</span>
          <span style={{ color: C.dim }}>: </span>
          <span style={{ color: C.num }}>2</span>
          <span style={{ color: C.dim }}>, </span>
          <span style={{ color: C.key }}>&quot;dochodNaOsobe&quot;</span>
          <span style={{ color: C.dim }}>: </span>
          <span style={{ color: C.num }}>1500</span>
          <span style={{ color: C.dim }}>{' } }'}&apos;</span>
        </pre>
      </div>
    </div>
  );
}

/* ── Kto korzysta z API: firmy, instytucje i organizacje wspierające ludzi ── */
const ODBIORCY = [
  {
    ikona: 'N', tytul: 'NGO i OPS',
    opis: 'Jedno zapytanie do API zamiast ręcznego przeszukiwania kilkudziesięciu rządowych stron. Doradca dostaje gotową listę świadczeń z instrukcją złożenia wniosku dla konkretnej osoby.',
  },
  {
    ikona: 'S', tytul: 'Pracownicy socjalni i doradcy obywatelscy',
    opis: 'Podczas rozmowy z podopiecznym system od razu pokazuje, co danej osobie przysługuje. Mniej biurokracji, więcej realnej pomocy, zero przechowywania danych klienta.',
  },
  {
    ikona: 'D', tytul: 'Organizacje osób z niepełnosprawnością',
    opis: 'Świadczenie wspierające, dofinansowania PFRON, ulgi i turnusy rehabilitacyjne w jednym miejscu. API pomaga dotrzeć z informacją do osób, które najczęściej zostają z niczym.',
  },
  {
    ikona: 'E', tytul: 'Organizacje senioralne i opiekunowie',
    opis: 'Trzynastka, czternastka, dodatek pielęgnacyjny, bezpłatne leki 65+, opieka 75+. Wsparcie dla seniorów i osób, które na co dzień się nimi opiekują, bez konieczności znajomości przepisów.',
  },
  {
    ikona: 'M', tytul: 'Wsparcie migrantów i osób wykluczonych cyfrowo',
    opis: 'Dla ludzi, którzy nie poruszają się swobodnie po polskich portalach urzędowych. Prosty interfejs i jasna lista uprawnień zmniejszają barierę językową i cyfrową.',
  },
  {
    ikona: 'B', tytul: 'Biblioteki i punkty pomocy cyfrowej',
    opis: 'Punkty wsparcia obywatela mogą bezpłatnie sprawdzić uprawnienia osoby, której pomagają. Inkluzja cyfrowa zamiast odsyłania na dziesiątki różnych stron.',
  },
  {
    ikona: 'R', tytul: 'Uczelnie i badacze',
    opis: 'Otwarte dane (CC-BY-4.0) i otwarty silnik (AGPL-3.0) do badań nad nieskorzystaniem ze świadczeń (benefit take-up) oraz nad dostępnością wsparcia w różnych grupach.',
  },
  {
    ikona: 'H', tytul: 'HR, kadry i fintech',
    opis: 'Przy onboardingu lub wniosku kredytowym aplikacja w tle sprawdza, jakie regularne świadczenia przysługują osobie. Pracownik lub klient nie zostaje sam z biurokracją.',
  },
];

const FEATURES = [
  '133 świadczeń w 13 kategoriach, ręcznie zweryfikowanych',
  'Odpowiedź <200ms, aktualizowana baza',
  'Brak przechowywania danych (prywatność i RODO wbudowane)',
  'Otwarte: kod AGPL-3.0, dane CC-BY-4.0 - wolno reużywać',
  'Bezpłatne; klucz API także dla NGO i instytucji publicznych',
  'Dokumentacja dla AI: wezmezadarmo.com/llm.md',
];

export default function DlaFirmPage() {
  const [form, setForm] = useState({ imie: '', firma: '', email: '', wiadomosc: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Błąd wysyłania.');
        setStatus('error');
      } else {
        setStatus('ok');
      }
    } catch {
      setErrorMsg('Błąd połączenia. Spróbuj ponownie.');
      setStatus('error');
    }
  }

  const pole: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', minHeight: 48,
    padding: '10px 14px', fontSize: 16,
    background: 'var(--surface)', color: 'var(--tusz)',
    border: '2px solid var(--tusz)', borderRadius: 0,
  };

  return (
    <main className="prosta">

      <section className="prosta-blok" style={{ padding: 0 }}>
        <p className="mono mala" style={{ margin: '0 0 8px' }}>Otwarte API dla firm, NGO i instytucji</p>
        <h1>Jedno API do świadczeń, które należą się ludziom</h1>
        <p className="pod">Bezpłatna baza zweryfikowanych świadczeń jako REST API. Nie przechowujemy danych osób.</p>
        <div className="przyciski">
          <a href="#api" className="btn btn-primary btn-lg">Zobacz API</a>
          <a href="#kontakt" className="btn btn-lg">Napisz po klucz API</a>
        </div>
      </section>

      <section id="api" className="prosta-blok" style={{ padding: '32px 0 0', scrollMarginTop: 80 }}>
        <h2>API bazy świadczeń</h2>
        <p className="pod">Jeden endpoint REST. Otwarty kod i otwarte dane, bezpłatnie także dla NGO i instytucji publicznych.</p>
        <TerminalWindow />
        <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
          {FEATURES.map(item => (
            <li key={item} style={{ padding: '10px 0', borderTop: '1px solid var(--linia)' }}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Kto korzysta z API</h2>
        <p className="pod">Przede wszystkim ci, którzy pomagają ludziom: NGO, pracownicy socjalni, instytucje i punkty wsparcia.</p>
        <ul style={{ margin: '16px 0 0', padding: 0, listStyle: 'none' }}>
          {ODBIORCY.map(k => (
            <li key={k.tytul} style={{ padding: '14px 0', borderTop: '1px solid var(--linia)' }}>
              <h3 style={{ fontSize: 18, margin: '0 0 4px' }}>{k.tytul}</h3>
              <p className="pod" style={{ margin: 0 }}>{k.opis}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="prosta-blok" style={{ padding: '32px 0 0' }}>
        <h2>Więcej dla firm</h2>
        <ul className="linki">
          <li><a href="/dotacje"><span>Dotacje dla firm<small>Agent AI śledzi nabory dla Twojej firmy.</small></span><span aria-hidden="true">&rarr;</span></a></li>
          <li><a href="/za-darmo-dla-biznesu"><span>Za darmo dla biznesu<small>Bezpłatne narzędzia i programy.</small></span><span aria-hidden="true">&rarr;</span></a></li>
          <li><a href="/automatyzacje"><span>Automatyzacje<small>KSeF, faktury zagraniczne i własne procesy.</small></span><span aria-hidden="true">&rarr;</span></a></li>
        </ul>
      </section>

      <section id="kontakt" className="prosta-blok" style={{ padding: '32px 0 0', scrollMarginTop: 80 }}>
        <h2>Porozmawiajmy o współpracy</h2>
        <p className="pod">Wszystkie funkcje są bezpłatne. Napisz, jeśli chcesz klucz API albo integrację bazy świadczeń.</p>

        <div style={{ marginTop: 20, padding: 20, background: 'var(--surface)', border: '2px solid var(--tusz)' }}>
          {status === 'ok' ? (
            <div role="status">
              <h3 style={{ fontSize: 20, margin: '0 0 8px', color: 'var(--green-800)' }}>Wiadomość wysłana</h3>
              <p style={{ margin: 0 }}>Odpiszemy w ciągu jednego dnia roboczego na podany adres e-mail.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {([
                { key: 'imie', label: 'Imię i nazwisko', placeholder: 'Jan Kowalski', type: 'text', autocomplete: 'name', required: true },
                { key: 'firma', label: 'Organizacja lub firma (opcjonalnie)', placeholder: 'Fundacja / firma', type: 'text', autocomplete: 'organization', required: false },
                { key: 'email', label: 'Adres e-mail', placeholder: 'jan@przyklad.pl', type: 'email', autocomplete: 'email', required: true },
              ] as const).map(f => (
                <div key={f.key}>
                  <label htmlFor={`kontakt-${f.key}`} className="mono" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{f.label}</label>
                  <input
                    id={`kontakt-${f.key}`}
                    type={f.type}
                    autoComplete={f.autocomplete}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={pole}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="kontakt-wiadomosc" className="mono" style={{ display: 'block', fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Opisz swój przypadek użycia</label>
                <textarea
                  id="kontakt-wiadomosc"
                  required
                  rows={4}
                  placeholder="Np. jesteśmy fundacją i chcemy sprawdzać uprawnienia podopiecznych przez API..."
                  value={form.wiadomosc}
                  onChange={e => setForm(prev => ({ ...prev, wiadomosc: e.target.value }))}
                  style={{ ...pole, resize: 'vertical' }}
                />
              </div>
              {status === 'error' && (
                <p role="alert" style={{ fontSize: 15, color: 'var(--red-600)', margin: 0 }}>{errorMsg}</p>
              )}
              <div>
                <button type="submit" disabled={status === 'sending'} className="btn btn-rdza btn-lg">
                  {status === 'sending' ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                </button>
                <p className="mala" style={{ marginTop: 10 }}>Odpiszemy w ciągu jednego dnia roboczego.</p>
              </div>
            </form>
          )}
        </div>
      </section>

    </main>
  );
}
