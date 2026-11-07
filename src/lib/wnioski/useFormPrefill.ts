'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export type PrefillStatus = 'loading' | 'idle' | 'localStorage' | 'profile' | 'mixed';

export interface PrefillResult<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  prefillStatus: PrefillStatus;
  prefillCount: number;
  isLoggedIn: boolean;
  clearSaved: () => void;
}

/**
 * Hook do persystencji + prefill formularzy wnioskow.
 *
 * Strategia:
 * 1. Mount: odczytaj szkic z sessionStorage (klucz `wnioski_<slug>_v1`), tylko ta karta przeglądarki.
 * 2. Od 7.11.2026 nie ma kont, więc nie pobieramy profilu (status 'profile' już nie występuje).
 * 3. Merge: szkic wypełnia puste pola initialState.
 * 4. Każda zmiana data -> zapis szkicu w sessionStorage po 500 ms; zamknięcie karty kasuje szkic.
 *
 * fieldMap: mapa kluczy formularza na klucze profilu (snake_case w DB).
 * Np. { imie: 'imie', miejscowość: 'miejscowosc', nrKonta: 'nr_konta' }
 *
 * "Prefilled" = pole ktore bylo puste w initialState i zostalo wypelnione (z profilu lub localStorage).
 */
export function useFormPrefill<T extends object>(
  slug: string,
  initialState: T,
  fieldMap: Partial<Record<keyof T, string>>,
): PrefillResult<T> {
  const [data, setData] = useState<T>(initialState);
  const [prefillStatus, setPrefillStatus] = useState<PrefillStatus>('loading');
  const [prefillCount, setPrefillCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const storageKey = `wnioski_${slug}_v1`;
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  // Helper: czy wartosc jest "pusta" w sensie prefillowania.
  // Boolean defaults sa ignorowane (nie liczymy ich w prefillu).
  const isEmpty = (v: unknown): boolean => v === '' || v === null || v === undefined;

  // Mount: load from localStorage + profile
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      let fromLocal: Partial<T> = {};
      const fromProfile: Partial<T> = {};
      let hasLocal = false;
      const hasProfile = false;
      const loggedIn = false;

      // 1) szkic z tej karty (sessionStorage); stary szkic z localStorage usuwamy, żeby PESEL nie leżał w przeglądarce
      try {
        if (typeof window !== 'undefined') window.localStorage.removeItem(storageKey);
      } catch {
        // brak dostępu do pamięci przeglądarki
      }
      try {
        const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(storageKey) : null;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<T>;
          if (parsed && typeof parsed === 'object') {
            fromLocal = parsed;
            hasLocal = Object.keys(parsed).length > 0;
          }
        }
      } catch {
        // Cichy fallback - corrupted localStorage
      }

      // 2) profil z konta: wyłączony od 7.11.2026 (bez kont). fieldMap zostaje dla zgodności wywołań.
      void fieldMap;

      if (cancelled) return;

      // 3) merge: localStorage wygrywa nad profile, profile nad initialState.
      const merged: T = { ...initialState };
      let count = 0;
      for (const k of Object.keys(initialState) as (keyof T)[]) {
        const initial = initialState[k];
        const profileVal = (fromProfile as Record<string, unknown>)[k as string];
        const localVal = (fromLocal as Record<string, unknown>)[k as string];

        let next: unknown = initial;
        let prefilled = false;

        if (!isEmpty(profileVal) && isEmpty(initial)) {
          next = profileVal;
          prefilled = true;
        }
        if (!isEmpty(localVal)) {
          // localStorage moze nadpisac initialState lub profile, ale liczymy jako prefill
          // tylko jesli initialState bylo puste (zeby nie liczyc np. ustawien typu 'tak'/'nie' jako prefilled)
          next = localVal;
          if (isEmpty(initial)) prefilled = true;
        }

        (merged as Record<string, unknown>)[k as string] = next;
        if (prefilled) count++;
      }

      setData(merged);
      setPrefillCount(count);
      setIsLoggedIn(loggedIn);

      if (count === 0) {
        setPrefillStatus('idle');
      } else if (hasLocal && hasProfile) {
        setPrefillStatus('mixed');
      } else if (hasProfile) {
        setPrefillStatus('profile');
      } else {
        setPrefillStatus('localStorage');
      }

      // pozwol na save dopiero po pierwszym mount-merge
      mounted.current = true;
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save do localStorage
  useEffect(() => {
    if (!mounted.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(storageKey, JSON.stringify(data));
        }
      } catch {
        // QuotaExceeded lub private mode - ignoruj
      }
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [data, storageKey]);

  const clearSaved = useCallback(() => {
    try {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { data, setData, prefillStatus, prefillCount, isLoggedIn, clearSaved };
}
