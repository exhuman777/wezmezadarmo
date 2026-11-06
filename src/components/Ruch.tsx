'use client';

/**
 * Ruch na stronie (od 6.11.2026): licznik, który odlicza się przy wejściu, i rotator „Należy Ci się: …”
 * w stylu rotora z tukamil.com. Zasady: tylko tekst liczby albo transform i opacity, bez przesunięć układu,
 * bez ruchu przy prefers-reduced-motion i w karcie w tle. Liczby i pozycje przychodzą z danych strony (props).
 */
import { useEffect, useRef, useState } from 'react';

function bezRuchu(): boolean {
  return typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Liczba, która przy pierwszym pojawieniu się na ekranie odlicza się od 0 do wartości (ok. 0,9 s).
 * HTML z serwera ma od razu właściwą liczbę (roboty, brak JS); szerokość jest stała (tabular-nums, min-width w ch).
 * Klatki zmieniają tylko textContent jednego elementu, bez renderu Reacta.
 */
export function Licznik({ wartosc, czas = 900 }: { wartosc: number; czas?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || bezRuchu() || !('IntersectionObserver' in window)) return;
    let ramka = 0;
    const start = () => {
      const t0 = performance.now();
      const krok = (t: number) => {
        const p = Math.min(1, (t - t0) / czas);
        // wygaszanie: szybko na początku, wolno pod koniec
        el.textContent = String(Math.round(wartosc * (1 - Math.pow(1 - p, 3))));
        if (p < 1) ramka = requestAnimationFrame(krok);
      };
      el.textContent = '0';
      ramka = requestAnimationFrame(krok);
    };
    const obs = new IntersectionObserver((w) => {
      if (w.some(e => e.isIntersecting)) { obs.disconnect(); start(); }
    });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(ramka); el.textContent = String(wartosc); };
  }, [wartosc, czas]);
  return (
    <span ref={ref} className="licznik-liczba" data-licznik={wartosc} style={{ minWidth: `${String(wartosc).length}ch` }}>
      {wartosc}
    </span>
  );
}

/**
 * Rotator: etykieta i jedna pozycja naraz, co `co` ms od dołu wjeżdża następna (transform i opacity).
 * Bez JS i przy ograniczonym ruchu widać pierwszą pozycję; czytniki ekranu dostają pełną listę.
 */
export function Rotator({ etykieta, pozycje, co = 2400 }: { etykieta: string; pozycje: string[]; co?: number }) {
  const [i, setI] = useState(0);
  const [poprzedni, setPoprzedni] = useState<number | null>(null);
  const okno = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (pozycje.length < 2 || bezRuchu()) return;
    let widac = true;
    const obs = 'IntersectionObserver' in window && okno.current
      ? new IntersectionObserver((w) => { widac = w[w.length - 1].isIntersecting; })
      : null;
    if (obs && okno.current) obs.observe(okno.current);
    const id = window.setInterval(() => {
      if (document.hidden || !widac) return;
      setI(stary => { setPoprzedni(stary); return (stary + 1) % pozycje.length; });
    }, co);
    return () => { window.clearInterval(id); obs?.disconnect(); };
  }, [pozycje.length, co]);

  return (
    <p className="rotator" data-testid="rotator">
      <span className="rotator-etykieta">{etykieta}</span>
      <span className="rotator-okno" ref={okno} aria-hidden="true">
        {pozycje.map((p, k) => (
          <span key={p} className={`rotator-x ruch${k === i ? ' jest' : k === poprzedni ? ' bylo' : ''}`}>{p}</span>
        ))}
      </span>
      <span className="sr-only">{pozycje.join(', ')}</span>
    </p>
  );
}
