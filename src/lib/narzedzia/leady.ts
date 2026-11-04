/**
 * Zapis leadów narzędzi dla firm. Produkcja: Supabase (service role, tabela leady_narzedzia).
 * Tryb testowy (NARZEDZIA_TRYB_TESTOWY=1 poza Vercelem): pamięć procesu, do testów e2e.
 */
import { createClient } from '@supabase/supabase-js';
import { trybTestowy } from './dostep';
import { ZGODA_TRESC, type LeadWejscie } from './walidacja';

export interface Lead {
  id: string;
  email: string;
  imie: string | null;
  telefon: string | null;
  potwierdzony_at: string | null;
  created_at: string;
  zrodlo: string | null;
}

export type WynikPotwierdzenia = { ok: true; id: string } | { ok: false; powod: 'brak' | 'wygasl' };

export interface MagazynLeadow {
  /** Zapis albo aktualizacja leada (po e-mailu) z tokenem potwierdzenia. Zwraca id leada (do ciasteczka dostępu). */
  zapiszOczekujacy(dane: LeadWejscie, tokenHash: string, wygasa: Date, zrodlo: string, ipHash: string): Promise<string>;
  potwierdz(tokenHash: string, teraz?: number): Promise<WynikPotwierdzenia>;
  lista(limit?: number): Promise<Lead[]>;
}

// ---------- pamięć (tryb testowy)
interface Wiersz extends Lead { token_hash: string | null; token_wygasa: string | null }
const pamiec = new Map<string, Wiersz>();

export const magazynPamiec: MagazynLeadow = {
  async zapiszOczekujacy(dane, tokenHash, wygasa, zrodlo) {
    const stary = pamiec.get(dane.email);
    const id = stary?.id ?? `test-${pamiec.size + 1}`;
    pamiec.set(dane.email, {
      id,
      email: dane.email,
      imie: dane.imie ?? stary?.imie ?? null,
      telefon: dane.telefon ?? stary?.telefon ?? null,
      potwierdzony_at: stary?.potwierdzony_at ?? null,
      created_at: stary?.created_at ?? new Date().toISOString(),
      zrodlo,
      token_hash: tokenHash,
      token_wygasa: wygasa.toISOString(),
    });
    return id;
  },
  async potwierdz(tokenHash, teraz = Date.now()) {
    for (const w of pamiec.values()) {
      if (w.token_hash !== tokenHash) continue;
      if (!w.token_wygasa || new Date(w.token_wygasa).getTime() <= teraz) return { ok: false, powod: 'wygasl' };
      w.token_hash = null;
      w.token_wygasa = null;
      w.potwierdzony_at = w.potwierdzony_at ?? new Date(teraz).toISOString();
      return { ok: true, id: w.id };
    }
    return { ok: false, powod: 'brak' };
  },
  async lista() {
    return [...pamiec.values()].map(({ token_hash: _t, token_wygasa: _w, ...l }) => l);
  },
};

export function wyczyscPamiec(): void {
  pamiec.clear();
}

// ---------- Supabase
function klient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('brak konfiguracji Supabase');
  return createClient(url, key, { auth: { persistSession: false } });
}

export const magazynSupabase: MagazynLeadow = {
  async zapiszOczekujacy(dane, tokenHash, wygasa, zrodlo, ipHash) {
    const db = klient();
    const wiersz: Record<string, unknown> = {
      email: dane.email,
      zgoda_kontakt: true,
      zgoda_tresc: ZGODA_TRESC,
      zgoda_at: new Date().toISOString(),
      token_hash: tokenHash,
      token_wygasa: wygasa.toISOString(),
      zrodlo,
      ip_hash: ipHash,
    };
    // Puste pola nie nadpisują wcześniej podanych danych.
    if (dane.imie) wiersz.imie = dane.imie;
    if (dane.telefon) wiersz.telefon = dane.telefon;
    const { data, error } = await db.from('leady_narzedzia').upsert(wiersz, { onConflict: 'email' }).select('id').single();
    if (error || !data) throw new Error('zapis leada nie powiódł się');
    return String((data as { id: string | number }).id);
  },
  async potwierdz(tokenHash, teraz = Date.now()) {
    const db = klient();
    const { data, error } = await db
      .from('leady_narzedzia')
      .select('id, token_wygasa, potwierdzony_at')
      .eq('token_hash', tokenHash)
      .maybeSingle();
    if (error) throw new Error('odczyt leada nie powiódł się');
    if (!data) return { ok: false, powod: 'brak' };
    if (!data.token_wygasa || new Date(data.token_wygasa).getTime() <= teraz) return { ok: false, powod: 'wygasl' };
    const { error: e2 } = await db
      .from('leady_narzedzia')
      .update({ token_hash: null, token_wygasa: null, potwierdzony_at: data.potwierdzony_at ?? new Date(teraz).toISOString() })
      .eq('id', data.id)
      .eq('token_hash', tokenHash);
    if (e2) throw new Error('potwierdzenie leada nie powiodło się');
    return { ok: true, id: String(data.id) };
  },
  async lista(limit = 500) {
    const db = klient();
    const { data, error } = await db
      .from('leady_narzedzia')
      .select('id, email, imie, telefon, potwierdzony_at, created_at, zrodlo')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error('odczyt leadów nie powiódł się');
    return (data ?? []) as Lead[];
  },
};

export function magazyn(): MagazynLeadow {
  return trybTestowy() ? magazynPamiec : magazynSupabase;
}
