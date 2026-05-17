import { createServerClient as _createServerClient } from '@supabase/ssr';
import { createBrowserClient as _createBrowserClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface DBUser {
  id: string;
  email: string;
  stripe_customer_id: string | null;
  subscription_status: 'trial' | 'active' | 'inactive';
  trial_ends_at: string;
  created_at: string;
}

export interface DBCompanyProfile {
  user_id: string;
  nip: string;
  name: string;
  pkd_codes: string[];
  voivodeship: string;
  size: 'micro' | 'small' | 'medium' | 'large';
  employee_count_range: string;
  flags: Record<string, boolean>;
  updated_at: string;
}

export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll called from a Server Component -- session refresh only, safe to ignore
          }
        },
      },
    },
  );
}

export function createSupabaseBrowser() {
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
