'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageContent } from '@/components/MessageContent';

interface Wiadomosc { rola: 'user' | 'assistant'; tresc: string }

/**
 * Czat z asystentem AI bez konta (POST /api/chat, 3 pytania dziennie, odpowiedź strumieniem SSE).
 * Pytanie z adresu (/agent?q=...) trafia do pola. Wysyła się samo tylko wtedy, gdy ktoś przyszedł
 * z tej strony (np. pole „Zapytaj” na stronie głównej), żeby roboty z linkiem nie zużywały limitu.
 * Historia zostaje tylko w pamięci karty.
 */
export function CzatPubliczny() {
  const q = useSearchParams().get('q') ?? '';
  const [pole, setPole] = useState(q);
  const [rozmowa, setRozmowa] = useState<Wiadomosc[]>([]);
  const [pisze, setPisze] = useState(false);
  const wyslane = useRef(false);

  async function zapytaj(tekst: string) {
    const pytanie = tekst.trim();
    if (!pytanie || pisze) return;
    const historia: Wiadomosc[] = [...rozmowa, { rola: 'user', tresc: pytanie }];
    setRozmowa([...historia, { rola: 'assistant', tresc: '' }]);
    setPole('');
    setPisze(true);
    const ustaw = (tresc: string) => setRozmowa(r => [...r.slice(0, -1), { rola: 'assistant', tresc }]);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historia.map(m => ({ role: m.rola, content: m.tresc })), profile: null, verifiedResults: null }),
      });
      if (res.status === 429) {
        const d = (await res.json().catch(() => ({}))) as { message?: string };
        ustaw(d.message ?? 'Dzienny limit 3 pytań minął. Wróć jutro albo poszukaj w bazie świadczeń.');
        return;
      }
      if (!res.ok || !res.body) {
        ustaw('Asystent jest chwilowo niedostępny. Spróbuj za chwilę albo poszukaj w bazie świadczeń.');
        return;
      }
      const czytnik = res.body.getReader();
      const dekoder = new TextDecoder();
      let calosc = '';
      let bufor = '';
      for (;;) {
        const { done, value } = await czytnik.read();
        if (done) break;
        bufor += dekoder.decode(value, { stream: true });
        const linie = bufor.split('\n');
        bufor = linie.pop() ?? '';
        for (const linia of linie) {
          if (!linia.startsWith('data: ')) continue;
          const dane = linia.slice(6);
          if (dane === '[DONE]') continue;
          try {
            const p = JSON.parse(dane) as { content?: string };
            if (p.content) { calosc += p.content; ustaw(calosc); }
          } catch { /* niepełny fragment */ }
        }
      }
      if (!calosc) ustaw('Brak odpowiedzi. Spróbuj zadać pytanie inaczej.');
    } catch {
      ustaw('Brak połączenia. Spróbuj ponownie.');
    } finally {
      setPisze(false);
    }
  }

  useEffect(() => {
    if (!q || wyslane.current) return;
    let zTejStrony = false;
    try { zTejStrony = !!document.referrer && new URL(document.referrer).origin === window.location.origin; } catch { /* brak referrera */ }
    if (zTejStrony) {
      wyslane.current = true;
      void zapytaj(q);
    }
    // jednorazowo po wejściu z pytaniem w adresie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div data-testid="czat-publiczny">
      {rozmowa.length > 0 && (
        <ul className="lista" aria-live="polite">
          {rozmowa.map((m, i) => (
            <li key={i}>
              <p className="etykieta" style={{ margin: '0 0 4px' }}>{m.rola === 'user' ? 'Ty' : 'Asystent'}</p>
              {m.rola === 'user' ? <p style={{ margin: 0 }}>{m.tresc}</p> : (m.tresc ? <MessageContent text={m.tresc} /> : <p className="mala" style={{ margin: 0 }}>Piszę odpowiedź...</p>)}
            </li>
          ))}
        </ul>
      )}
      <form
        className="pytaj"
        style={{ marginTop: 16 }}
        onSubmit={(e) => { e.preventDefault(); void zapytaj(pole); }}
      >
        <label htmlFor="czat-pytanie" className="sr-only">Twoje pytanie</label>
        <input
          id="czat-pytanie"
          type="text"
          value={pole}
          onChange={(e) => setPole(e.target.value)}
          placeholder="Jakie świadczenia mi przysługują?"
          maxLength={500}
        />
        <button type="submit" className="btn btn-primary" disabled={pisze}>{pisze ? 'Czekaj...' : 'Zapytaj'}</button>
      </form>
      <p className="mala" style={{ marginTop: 8 }}>Bez konta: 3 pytania dziennie. Nie podawaj PESEL ani danych kontaktowych.</p>
    </div>
  );
}
