/**
 * Token service -- saldo i transakcje.
 *
 * SQL (run once in Supabase SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS user_tokens (
 *     user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 *     balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
 *     lifetime_purchased INTEGER NOT NULL DEFAULT 0,
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 *   CREATE TABLE IF NOT EXISTS token_transactions (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 *     delta INTEGER NOT NULL,
 *     type TEXT NOT NULL,
 *     description TEXT,
 *     stripe_payment_intent_id TEXT,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   CREATE INDEX IF NOT EXISTS token_transactions_user_id ON token_transactions (user_id, created_at DESC);
 */

import { SupabaseClient } from '@supabase/supabase-js';

export type TokenActionType =
  | 'purchase'
  | 'agent_chat'
  | 'form_fill'
  | 'pdf_generate'
  | 'newsletter_month'
  | 'rss_monitor_month'
  | 'api_chat'
  | 'manual_credit';

export const TOKEN_COSTS: Record<Exclude<TokenActionType, 'purchase' | 'manual_credit'>, number> = {
  agent_chat:          2,
  form_fill:          10,
  pdf_generate:        5,
  newsletter_month:    5,
  rss_monitor_month:   3,
  api_chat:            1,
};

export const TOKEN_PACKAGES = {
  personal: { tokens: 100,  pricePLN: 25,  label: 'Pakiet Osobisty' },
  business: { tokens: 1000, pricePLN: 199, label: 'Pakiet Firmowy' },
} as const;

export type TokenPackage = keyof typeof TOKEN_PACKAGES;

// ---------------------------------------------------------------------------
// Read balance
// ---------------------------------------------------------------------------

export async function getTokenBalance(
  admin: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data } = await admin
    .from('user_tokens')
    .select('balance')
    .eq('user_id', userId)
    .single();
  return data?.balance ?? 0;
}

// ---------------------------------------------------------------------------
// Credit tokens (on purchase)
// ---------------------------------------------------------------------------

export async function creditTokens(
  admin: SupabaseClient,
  userId: string,
  amount: number,
  stripePaymentIntentId: string,
  description: string,
): Promise<void> {
  // Upsert balance row
  const { error: upsertErr } = await admin.rpc('credit_tokens', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (upsertErr) {
    // Fallback: manual upsert if RPC not yet created
    const { data: existing } = await admin
      .from('user_tokens')
      .select('balance, lifetime_purchased')
      .eq('user_id', userId)
      .single();

    if (existing) {
      await admin
        .from('user_tokens')
        .update({
          balance: existing.balance + amount,
          lifetime_purchased: existing.lifetime_purchased + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      await admin
        .from('user_tokens')
        .insert({
          user_id: userId,
          balance: amount,
          lifetime_purchased: amount,
        });
    }
  }

  // Log transaction
  await admin.from('token_transactions').insert({
    user_id: userId,
    delta: amount,
    type: 'purchase',
    description,
    stripe_payment_intent_id: stripePaymentIntentId,
  });
}

// ---------------------------------------------------------------------------
// Deduct tokens (on action) -- returns false if insufficient balance
// ---------------------------------------------------------------------------

export async function deductTokens(
  admin: SupabaseClient,
  userId: string,
  action: Exclude<TokenActionType, 'purchase' | 'manual_credit'>,
  description?: string,
): Promise<{ ok: boolean; balance: number }> {
  const cost = TOKEN_COSTS[action];

  const { data: row } = await admin
    .from('user_tokens')
    .select('balance')
    .eq('user_id', userId)
    .single();

  const current = row?.balance ?? 0;

  if (current < cost) {
    return { ok: false, balance: current };
  }

  const newBalance = current - cost;

  await admin
    .from('user_tokens')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  await admin.from('token_transactions').insert({
    user_id: userId,
    delta: -cost,
    type: action,
    description: description ?? action,
  });

  return { ok: true, balance: newBalance };
}
