import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_DOSTEP, sprawdzDostep } from '@/lib/narzedzia/dostep';
import { bramkaDla } from '@/lib/narzedzia/lista';

/** Basic Auth check dla /admin/* -- bez podanego hasla zwraca 401 z popupem przegldarki. */
function basicAuthChallenge(): NextResponse {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="wezmezadarmo admin", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

/** Porównanie w stałym czasie (działa w Edge i Node, bez modułu crypto). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function checkAdminAuth(request: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false; // brak env -> blokujemy

  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return false;

  try {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    const pass = decoded.slice(decoded.indexOf(':') + 1);
    return safeEqual(pass ?? '', password);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Narzędzia dla firm (statyczne pliki w public/narzedzia): tylko z ciasteczkiem dostępu (formularz z e-mailem i telefonem albo link z maila).
  if (pathname === '/narzedzia' || pathname.startsWith('/narzedzia/')) {
    if (await sprawdzDostep(request.cookies.get(COOKIE_DOSTEP)?.value)) {
      // Katalog (np. /narzedzia/kpir/kpir/) -> jego index.html z public/.
      const ostatni = pathname.split('/').filter(Boolean).pop() ?? '';
      let res: NextResponse;
      if (!ostatni.includes('.')) {
        const plik = request.nextUrl.clone();
        plik.pathname = `${pathname.replace(/\/$/, '')}/index.html`;
        res = NextResponse.rewrite(plik);
      } else {
        res = NextResponse.next();
      }
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
      // Strony bez pamięci podręcznej (dostęp może wygasnąć), pliki (_astro, czcionki) prywatnie na dobę.
      res.headers.set('Cache-Control', ostatni.includes('.') && !ostatni.endsWith('.html') ? 'private, max-age=86400' : 'private, no-store');
      return res;
    }
    // Bez dostępu: strona narzędzia z opisem i formularzem, po wysłaniu powrót dokładnie tutaj.
    const bramka = new URL(bramkaDla(pathname), request.url);
    bramka.searchParams.set('wymagany', '1');
    if (pathname !== '/narzedzia' && pathname !== '/narzedzia/') bramka.searchParams.set('next', pathname);
    return NextResponse.redirect(bramka);
  }

  // /admin/*, /api/admin/* i endpoint diagnostyczny -- Basic Auth gate (przed Supabase auth check)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname === '/api/aktualnosci/debug') {
    if (!checkAdminAuth(request)) {
      return basicAuthChallenge();
    }
    return NextResponse.next({ request });
  }

  // Standardowy Supabase auth dla /panel, /dotacje/panel, /agent/panel.
  // Gdy brakuje konfiguracji Supabase (zle wdrozenie), NIE wywalamy 500 --
  // pokazujemy zrozumiala strone bledu z wyjasnieniem, co sie dzieje.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = '/blad-konfiguracji';
    errorUrl.search = '';
    return NextResponse.rewrite(errorUrl);
  }

  let response = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/logowanie';
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    // Nieoczekiwany blad warstwy auth -> strona bledu zamiast 500.
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = '/blad-konfiguracji';
    errorUrl.search = '';
    return NextResponse.rewrite(errorUrl);
  }
}

export const config = {
  matcher: ['/narzedzia', '/narzedzia/:path*', '/panel/:path*', '/dotacje/panel/:path*', '/agent/panel/:path*', '/admin/:path*', '/api/admin/:path*', '/api/aktualnosci/debug'],
};
