import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServer } from '@/lib/dotacje/supabase';
import { TOKEN_PACKAGES, type TokenPackage } from '@/lib/tokens';

export const dynamic = 'force-dynamic';

const PRICE_IDS: Record<TokenPackage, string> = {
  personal: process.env.STRIPE_PRICE_ID_PERSONAL!,
  business: process.env.STRIPE_PRICE_ID_BUSINESS!,
};

export async function POST(request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
  }

  let body: { package: TokenPackage };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Nieprawidłowy format żądania.' }, { status: 400 });
  }

  const pkg = body.package;
  if (!pkg || !PRICE_IDS[pkg]) {
    return Response.json({ error: 'Nieprawidłowy pakiet. Wybierz "personal" lub "business".' }, { status: 400 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email ?? '';
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://wezmezadarmo.com';
  const packageInfo = TOKEN_PACKAGES[pkg];

  // Get or create Stripe customer
  const { data: userRow } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  let stripeCustomerId: string = userRow?.stripe_customer_id ?? '';

  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      stripeCustomerId = customer.id;

      await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    } catch (err) {
      console.error('[stripe/checkout] customer creation error:', err);
      return Response.json({ error: 'Błąd tworzenia konta płatności.' }, { status: 502 });
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card', 'blik', 'p24'],
      line_items: [{ price: PRICE_IDS[pkg], quantity: 1 }],
      mode: 'payment',
      metadata: {
        supabase_user_id: userId,
        package: pkg,
        tokens: String(packageInfo.tokens),
      },
      success_url: `${baseUrl}/dotacje/panel?tokens_added=${packageInfo.tokens}`,
      cancel_url: `${baseUrl}/dotacje/panel/tokeny`,
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[stripe/checkout] session creation error:', err);
    return Response.json({ error: 'Błąd tworzenia sesji płatności.' }, { status: 502 });
  }
}
