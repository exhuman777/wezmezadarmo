import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Zweryfikowana sesja po stronie serwera.
 *
 * `auth.getSession()` na serwerze czyta sesję z ciasteczka bez sprawdzania podpisu,
 * więc podrobione ciasteczko z cudzym `user.id` przeszłoby dalej (a trasy używają
 * klucza serwisowego z pominięciem RLS). `auth.getUser()` pyta serwer Auth i zwraca
 * tylko prawdziwego użytkownika. Kształt `{ user }` zgadza się z `session.user`.
 */
export async function zweryfikowanaSesja(supabase: SupabaseClient): Promise<{ user: User } | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return { user: data.user };
  } catch {
    return null;
  }
}
