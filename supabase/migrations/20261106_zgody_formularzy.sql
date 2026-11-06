-- Zgody na kontakt z formularzy wezmezadarmo.com (od 6.11.2026): sprawdzenie firmy po NIP, „Napisz do nas”, newsletter.
-- Osobno: kontakt e-mailem w sprawie zgłoszenia (wymagany), oferty e-mailem, kontakt telefoniczny i kontakt przez asystenta AI (dobrowolne).
-- Każdy wiersz = jedno wysłanie formularza: które zgody, wersja i treść zgód, data. Nic nie usuwamy z istniejących tabel.

create table if not exists public.zgody_formularzy (
  id uuid primary key default gen_random_uuid(),
  formularz text not null check (formularz in ('dofinansowania-po-nip', 'kontakt', 'newsletter')),
  email text not null,
  zgoda_email boolean not null default false,
  zgoda_email_oferty boolean not null default false,
  zgoda_telefon boolean not null default false,
  zgoda_ai boolean not null default false,
  wersja text not null,
  tresc jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_zgody_formularzy_email on public.zgody_formularzy(email);
create index if not exists idx_zgody_formularzy_created on public.zgody_formularzy(created_at desc);

-- RLS: włączone i wymuszone, brak polityk dla anon/authenticated. Zapis wyłącznie przez backend (service role).
alter table public.zgody_formularzy enable row level security;
alter table public.zgody_formularzy force row level security;
revoke all on public.zgody_formularzy from anon, authenticated;
