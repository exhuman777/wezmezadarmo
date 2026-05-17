import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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

async function updateUserSubscription(
  customerId: string,
  status: 'active' | 'inactive',
) {
  const admin = getAdminClient();

  const { error: tableError } = await admin
    .from('users')
    .update({ subscription_status: status })
    .eq('stripe_customer_id', customerId);

  if (tableError) {
    console.error('[webhook] users table update error:', tableError);
  }

  // Also mirror into auth user_metadata so client reads are consistent
  const { data: userData, error: lookupError } = await admin
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (lookupError || !userData) {
    console.error('[webhook] user lookup for metadata update failed:', lookupError);
    return;
  }

  const { error: metaError } = await admin.auth.admin.updateUserById(userData.id, {
    user_metadata: { subscription_status: status },
  });

  if (metaError) {
    console.error('[webhook] user_metadata update error:', metaError);
  }
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

  try {
    switch (event.type) {
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const isActive =
          subscription.status === 'active' || subscription.status === 'trialing';
        await updateUserSubscription(customerId, isActive ? 'active' : 'inactive');
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        await updateUserSubscription(customerId, 'inactive');
        break;
      }

      default:
        // Unhandled event type -- ignore
        break;
    }
  } catch (err) {
    console.error('[webhook] handler error:', err);
    return Response.json({ error: 'Błąd przetwarzania zdarzenia.' }, { status: 500 });
  }

  return Response.json({ received: true });
}
