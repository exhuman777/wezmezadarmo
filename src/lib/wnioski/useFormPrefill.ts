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
 * 1. Mount: spróbuj odczytać localStorage (klucz `wnioski_<slug>_v1`)
 * 2. Mount: jesli zalogowany, fetch /api/agent/profile i zmapuj dane przez fieldMap
 * 3. Merge: profile fills empty fields, localStorage values wygrywaja (uznaje sie ze sa nowsze)
 * 4. Kazda zmiana data -> debounced save do localStorage (500ms)
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
      let fromProfile: Partial<T> = {};
      let hasLocal = false;
      let hasProfile = false;
      let loggedIn = false;

      // 1) localStorage
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
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

      // 2) profile
      try {
        const res = await fetch('/api/agent/profile', { credentials: 'include' });
        if (res.status === 200) {
          loggedIn = true;
          const json = (await res.json()) as { profile?: Record<string, unknown> };
          const profile: Record<string, unknown> = json.profile ?? {};
          for (const [formKey, profileKey] of Object.entries(fieldMap) as [string, string | undefined][]) {
            if (!profileKey) continue;
            const v = profile[profileKey];
            if (!isEmpty(v)) {
              (fromProfile as Record<string, unknown>)[formKey] = v;
            }
          }
          hasProfile = Object.keys(fromProfile).length > 0;
        }
      } catch {
        // Cichy fallback - offline / fetch error
      }

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
          window.localStorage.setItem(storageKey, JSON.stringify(data));
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
      if (typeof window !== 'undefined') window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { data, setData, prefillStatus, prefillCount, isLoggedIn, clearSaved };
}
