import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

  const { pathname } = request.nextUrl;

  if (!session) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/dotacje/logowanie';
    return NextResponse.redirect(loginUrl);
  }

  // Check subscription status from user metadata (set during signup / webhook)
  const subscriptionStatus =
    session.user.user_metadata?.subscription_status ?? 'inactive';

  const isSubscriptionPage = pathname === '/dotacje/panel/subskrypcja';

  if (subscriptionStatus === 'inactive' && !isSubscriptionPage) {
    const subUrl = request.nextUrl.clone();
    subUrl.pathname = '/dotacje/panel/subskrypcja';
    return NextResponse.redirect(subUrl);
  }

  return response;
}

export const config = {
  matcher: ['/dotacje/panel/:path*'],
};
