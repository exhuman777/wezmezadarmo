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

function checkAdminAuth(request: NextRequest): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false; // brak env -> blokujemy

  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Basic ')) return false;

  try {
    const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf-8');
    const [, pass] = decoded.split(':');
    return pass === password;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/* i /api/admin/* -- Basic Auth gate (przed Supabase auth check)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!checkAdminAuth(request)) {
      return basicAuthChallenge();
    }
    return NextResponse.next({ request });
  }

  // Standardowy Supabase auth dla /panel, /dotacje/panel, /agent/panel
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
}

export const config = {
  matcher: ['/panel/:path*', '/dotacje/panel/:path*', '/agent/panel/:path*', '/admin/:path*', '/api/admin/:path*'],
};
