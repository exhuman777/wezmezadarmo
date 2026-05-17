import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServer } from '@/lib/dotacje/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const supabase = await createSupabaseServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', session.user.id)
    .single();

  if (!user?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'Brak powiązanego konta Stripe.' },
      { status: 400 },
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dotacje/panel/subskrypcja`,
  });

  return NextResponse.json({ url: portalSession.url });
}
