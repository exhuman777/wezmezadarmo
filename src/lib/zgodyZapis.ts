/**
 * Zapis zgód z formularzy (tabela zgody_formularzy, migracja supabase/migrations/20261106_zgody_formularzy.sql):
 * formularz, e-mail, które zgody, wersja i treść zgód, data. Tylko serwer (service role).
 * Bez konfiguracji Supabase albo w trybie testowym zapis trafia do pamięci procesu (testy).
 */
import { createClient } from '@supabase/supabase-js';
import { ZGODY_WERSJA, trescZgod, type Zgody } from '@/lib/zgody';

export interface ZapisZgod {
  formularz: 'dofinansowania-po-nip' | 'kontakt' | 'newsletter';
  email: string;
  zgody: Zgody;
  zTelefonem: boolean;
  /** Inna treść wymaganej zgody (newsletter). */
  trescEmail?: string;
}

export const zgodyWPamieci: (ZapisZgod & { wersja: string; at: string })[] = [];

export async function zapiszZgody(z: ZapisZgod): Promise<void> {
  const wiersz = {
    formularz: z.formularz,
    email: z.email.toLowerCase(),
    zgoda_email: z.zgody.email,
    zgoda_email_oferty: z.zgody.emailOferty,
    zgoda_telefon: z.zgody.telefon,
    zgoda_ai: z.zgody.ai,
    wersja: ZGODY_WERSJA,
    tresc: trescZgod(z.zTelefonem, z.trescEmail),
  };
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const testowy = process.env.NARZEDZIA_TRYB_TESTOWY === '1' && process.env.VERCEL !== '1';
  if (testowy || !url || !key) {
    zgodyWPamieci.push({ ...z, wersja: ZGODY_WERSJA, at: new Date().toISOString() });
    return;
  }
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await db.from('zgody_formularzy').insert(wiersz);
  if (error) throw new Error('zapis zgód nie powiódł się');
}
