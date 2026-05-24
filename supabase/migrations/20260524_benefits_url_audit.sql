-- Benefits URL audit: monitoring 118 zrodloUrl ze swiadczen
-- Cron sprawdza co tydzien, zapisuje status + hash content, alert gdy >30% zmiana lub 404

create table if not exists public.benefits_url_audit (
  id uuid primary key default gen_random_uuid(),
  benefit_id text not null unique,
  benefit_name text not null,
  category text not null,
  url text not null,

  -- Last check status
  last_status int,                    -- HTTP code (200, 404, 301, 0 = timeout/error)
  last_status_text text,              -- 'OK', 'NOT_FOUND', 'REDIRECT', 'TIMEOUT', 'BLOCKED', 'CHANGED'
  last_content_hash text,             -- SHA256 of normalized content
  last_content_length int,
  last_checked_at timestamptz,
  last_changed_at timestamptz,        -- kiedy ostatnio wykryto zmiane content
  last_change_pct numeric,            -- % zmiany vs poprzedni hash (0.0 - 1.0)

  -- Alert tracking
  needs_review boolean not null default false,
  last_alert_sent_at timestamptz,
  consecutive_errors int not null default 0,

  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_benefits_audit_benefit on public.benefits_url_audit(benefit_id);
create index if not exists idx_benefits_audit_needs_review on public.benefits_url_audit(needs_review) where needs_review = true;
create index if not exists idx_benefits_audit_status on public.benefits_url_audit(last_status_text);
create index if not exists idx_benefits_audit_last_checked on public.benefits_url_audit(last_checked_at);

-- Auto-update updated_at
create or replace function public.touch_benefits_audit_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_benefits_audit_updated_at on public.benefits_url_audit;
create trigger trg_benefits_audit_updated_at
  before update on public.benefits_url_audit
  for each row execute function public.touch_benefits_audit_updated_at();

-- RLS: tylko service_role
alter table public.benefits_url_audit enable row level security;
