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

/** API kont i paneli: wyłączone, bo serwis działa bez logowania. */
const WYLACZONE_API = [
  '/api/auth', '/api/agent/auth', '/api/agent/profile', '/api/agent/chat',
  '/api/dotacje/auth', '/api/dotacje/company', '/api/dotacje/monitoring', '/api/dotacje/subscription',
  '/api/dotacje/stripe', '/api/dotacje/tokens', '/api/dotacje/export', '/api/dotacje/chat', '/api/dotacje/cron/weekly-check',
  '/api/digest', '/api/rss/subscription', '/api/aktualnosci/feeds',
];

/** Zapis na newsletter: wyłączony od 7.11.2026 (żaden mechanizm go nie wysyłał). Potwierdzenie i wypisanie działają dalej. */
const WYLACZONE_DOKLADNIE = ['/api/newsletter'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Narzędzia dla firm (statyczne pliki w public/narzedzia): publiczne, bez formularza, konta i ciasteczka.
  // Middleware tylko zamienia katalog na jego index.html i ustawia nagłówki.
  if (pathname === '/narzedzia' || pathname.startsWith('/narzedzia/')) {
    if (pathname === '/narzedzia' || pathname === '/narzedzia/') {
      return NextResponse.redirect(new URL('/dla-firm/narzedzia', request.url));
    }
    // Katalog (np. /narzedzia/kpir/kpir/) -> jego index.html z public/.
    const ostatni = pathname.split('/').filter(Boolean).pop() ?? '';
    const plikStatyczny = ostatni.includes('.');
    let res: NextResponse;
    if (!plikStatyczny) {
      const plik = request.nextUrl.clone();
      plik.pathname = `${pathname.replace(/\/$/, '')}/index.html`;
      res = NextResponse.rewrite(plik);
    } else {
      res = NextResponse.next();
    }
    // Opis i adres kanoniczny narzędzia są na /dla-firm/narzedzia/kpir i /jpk, sama aplikacja poza indeksem.
    res.headers.set('X-Robots-Tag', 'noindex, follow');
    res.headers.set('Cache-Control', plikStatyczny && !ostatni.endsWith('.html') ? 'public, max-age=86400' : 'public, max-age=0, s-maxage=3600');
    return res;
  }

  // /admin/*, /api/admin/* i endpoint diagnostyczny: Basic Auth
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname === '/api/aktualnosci/debug') {
    if (!checkAdminAuth(request)) {
      return basicAuthChallenge();
    }
    return NextResponse.next({ request });
  }

  // Konta są wyłączone (6.11.2026): API logowania, profili, paneli i powiadomień kont odpowiada 410.
  // Strony paneli i logowania przekierowuje next.config.ts (308). Kod i tabele w bazie zostają.
  if (WYLACZONE_DOKLADNIE.includes(pathname) || WYLACZONE_API.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.json(
      { error: 'Konta na wezmezadarmo.com są wyłączone. Wszystko działa bez logowania.' },
      { status: 410, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/narzedzia', '/narzedzia/:path*', '/admin/:path*', '/api/admin/:path*', '/api/aktualnosci/debug',
    '/api/auth/:path*', '/api/agent/auth/:path*', '/api/agent/profile', '/api/agent/chat/:path*', '/api/agent/chat',
    '/api/dotacje/auth/:path*', '/api/dotacje/company', '/api/dotacje/monitoring/:path*', '/api/dotacje/monitoring', '/api/dotacje/subscription',
    '/api/dotacje/stripe/:path*', '/api/dotacje/tokens', '/api/dotacje/export', '/api/dotacje/chat', '/api/dotacje/cron/weekly-check',
    '/api/digest', '/api/digest/:path*', '/api/rss/subscription', '/api/aktualnosci/feeds', '/api/newsletter',
  ],
};
