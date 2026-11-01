import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
  matcher: ['/panel/:path*', '/dotacje/panel/:path*', '/agent/panel/:path*', '/admin/:path*', '/api/admin/:path*', '/api/aktualnosci/debug'],
};
