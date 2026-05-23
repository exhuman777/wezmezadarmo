-- ===========================================================================
-- rss_subscriptions: user-defined nasluch na zrodla i kategorie
-- Alerty wysylane TYLKO po automatycznym cron-ie (2x/dzien), nigdy on-demand
-- ===========================================================================

create table if not exists public.rss_subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  email               text not null,
  source_ids          text[] not null default '{}',   -- [] = wszystkie zrodla
  audiences           text[] not null default '{}',   -- [] = wszystkie audiences
  keywords            text[] not null default '{}',   -- [] = bez filtra keywords
  active              boolean not null default true,
  last_sent_at        timestamptz,
  last_sent_item_ids  text[] not null default '{}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id)  -- jedna subskrypcja per user (mozna rozszerzyc pozniej)
);

create index if not exists rss_subscriptions_active_idx
  on public.rss_subscriptions (active, last_sent_at)
  where active = true;

create index if not exists rss_subscriptions_user_idx
  on public.rss_subscriptions (user_id);

alter table public.rss_subscriptions enable row level security;

-- User widzi i edytuje wlasne
create policy "rss_subs_own_read"
  on public.rss_subscriptions for select to authenticated
  using (user_id = auth.uid());

create policy "rss_subs_own_insert"
  on public.rss_subscriptions for insert to authenticated
  with check (user_id = auth.uid());

create policy "rss_subs_own_update"
  on public.rss_subscriptions for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "rss_subs_own_delete"
  on public.rss_subscriptions for delete to authenticated
  using (user_id = auth.uid());

-- Service role moze wszystko (cron wysylajacy alerty)
create policy "rss_subs_service_all"
  on public.rss_subscriptions for all to service_role
  using (true) with check (true);

-- ===========================================================================
-- rss_alert_log: historia wysylek alertow per user
-- ===========================================================================

create table if not exists public.rss_alert_log (
  id              bigserial primary key,
  run_id          text not null,
  subscription_id uuid references public.rss_subscriptions(id) on delete set null,
  user_id         uuid,
  email           text,
  items_count     int not null default 0,
  status          text not null,                -- sent, error, no-items, skipped-throttled
  error_message   text,
  created_at      timestamptz not null default now()
);

create index if not exists rss_alert_log_created_idx
  on public.rss_alert_log (created_at desc);

create index if not exists rss_alert_log_user_idx
  on public.rss_alert_log (user_id, created_at desc);

alter table public.rss_alert_log enable row level security;

create policy "rss_alert_log_own_read"
  on public.rss_alert_log for select to authenticated
  using (user_id = auth.uid());

create policy "rss_alert_log_service_all"
  on public.rss_alert_log for all to service_role
  using (true) with check (true);
