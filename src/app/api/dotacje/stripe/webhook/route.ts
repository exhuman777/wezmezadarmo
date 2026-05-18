import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { creditTokens, TOKEN_PACKAGES, type TokenPackage } from '@/lib/tokens';

export const dynamic = 'force-dynamic';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set');
    return Response.json({ error: 'Webhook not configured.' }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return Response.json({ error: 'Brak podpisu webhooka.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] signature verification failed:', err);
    return Response.json({ error: 'Nieprawidłowy podpis webhooka.' }, { status: 400 });
  }

  const admin = getAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status !== 'paid') break;

        const userId = session.metadata?.supabase_user_id;
        const pkg = session.metadata?.package as TokenPackage | undefined;
        const tokens = parseInt(session.metadata?.tokens ?? '0', 10);

        if (!userId || !pkg || !tokens) {
          console.error('[webhook] missing metadata on session:', session.id);
          break;
        }

        const packageInfo = TOKEN_PACKAGES[pkg];
        const paymentIntentId = typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id ?? session.id;

        await creditTokens(
          admin,
          userId,
          tokens,
          paymentIntentId,
          `Zakup: ${packageInfo.label} (${tokens} tokenów, ${packageInfo.pricePLN} PLN)`,
        );

        console.log(`[webhook] credited ${tokens} tokens to user ${userId} (${pkg})`);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[webhook] handler error:', err);
    return Response.json({ error: 'Błąd przetwarzania zdarzenia.' }, { status: 500 });
  }

  return Response.json({ received: true });
}
