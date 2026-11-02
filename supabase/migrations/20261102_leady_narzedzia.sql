-- Leady z narzędzi dla firm (/dla-firm/narzedzia): przegląd KPiR, przegląd JPK_V7, dofinansowania po NIP.
-- Bez konta: e-mail (wymagany) + imię albo telefon (opcjonalnie) + zgoda na kontakt.
-- Dostęp do narzędzi dopiero po kliknięciu linku z maila (double opt-in).
-- Token potwierdzenia przechowywany wyłącznie jako SHA-256, jednorazowy, ważny 7 dni.

create table if not exists public.leady_narzedzia (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  imie text,
  telefon text,
  zgoda_kontakt boolean not null default false,
  zgoda_tresc text,
  zgoda_at timestamptz,
  token_hash text,
  token_wygasa timestamptz,
  potwierdzony_at timestamptz,
  zrodlo text,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leady_narzedzia_token on public.leady_narzedzia(token_hash) where token_hash is not null;
create index if not exists idx_leady_narzedzia_created on public.leady_narzedzia(created_at desc);

create or replace function public.touch_leady_narzedzia_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_leady_narzedzia_updated_at on public.leady_narzedzia;
create trigger trg_leady_narzedzia_updated_at
  before update on public.leady_narzedzia
  for each row execute function public.touch_leady_narzedzia_updated_at();

-- RLS: włączone i wymuszone, brak polityk dla anon/authenticated.
-- Zapis i odczyt wyłącznie przez backend (service role) w /api/narzedzia/* i /admin/narzedzia.
alter table public.leady_narzedzia enable row level security;
alter table public.leady_narzedzia force row level security;
revoke all on public.leady_narzedzia from anon, authenticated;
