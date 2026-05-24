-- Newsletter subscribers (footer signup)
-- Double opt-in: confirmed=false na start, confirmed=true po kliknięciu w mail potwierdzający

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  profile_type text not null check (profile_type in ('private', 'jdg')),
  confirmed boolean not null default false,
  confirmation_token text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_newsletter_email on public.newsletter_subscribers(email);
create index if not exists idx_newsletter_confirmed on public.newsletter_subscribers(confirmed) where unsubscribed_at is null;
create index if not exists idx_newsletter_profile on public.newsletter_subscribers(profile_type) where confirmed = true and unsubscribed_at is null;

-- Auto-update updated_at on UPDATE
create or replace function public.touch_newsletter_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_newsletter_updated_at on public.newsletter_subscribers;
create trigger trg_newsletter_updated_at
  before update on public.newsletter_subscribers
  for each row execute function public.touch_newsletter_updated_at();

-- Row Level Security: tylko service_role (backend) ma dostęp
alter table public.newsletter_subscribers enable row level security;

-- Brak policies dla anon/authenticated = nikt poza service_role nie widzi danych
-- (frontend wykorzystuje endpoint /api/newsletter który używa service role)
