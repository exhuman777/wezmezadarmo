import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServer } from '@/lib/dotacje/supabase';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = await createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return Response.json({ error: 'Wymagane zalogowanie.' }, { status: 401 });
  }

  const userId = session.user.id;
  const userEmail = session.user.email ?? '';
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'https://wezmezadarmo.com';

  // Get current user row to check for existing stripe_customer_id
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (userError && userError.code !== 'PGRST116') {
    console.error('[stripe/checkout] user lookup error:', userError);
    return Response.json({ error: 'Błąd pobierania danych użytkownika.' }, { status: 500 });
  }

  let stripeCustomerId: string = userRow?.stripe_customer_id ?? '';

  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      stripeCustomerId = customer.id;

      const { error: updateError } = await supabase
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);

      if (updateError) {
        console.error('[stripe/checkout] failed to save stripe_customer_id:', updateError);
        // Non-fatal -- continue, customer was created in Stripe
      }
    } catch (err) {
      console.error('[stripe/checkout] stripe customer creation error:', err);
      return Response.json({ error: 'Błąd tworzenia konta płatności.' }, { status: 502 });
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
      },
      success_url: `${baseUrl}/dotacje/panel?success=1`,
      cancel_url: `${baseUrl}/dotacje/panel/subskrypcja`,
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[stripe/checkout] session creation error:', err);
    return Response.json({ error: 'Błąd tworzenia sesji płatności.' }, { status: 502 });
  }
}
