-- rss_run_log: historia kazdego runa cronu RSS
-- pozwala monitorowac per-source success rate, sledzic ktore zrodla padaja, debugowac

create table if not exists public.rss_run_log (
  id              bigserial primary key,
  run_id          text        not null,           -- uuid per workflow run
  source_id       text        not null,           -- nbp, sejm, uokik, ...
  status          text        not null,           -- ok, blocked, empty, db-error, no-parser
  source          text,                            -- direct, firecrawl, retry
  count           int         not null default 0,
  duration_ms     int,
  error_message   text,
  created_at      timestamptz not null default now()
);

create index if not exists rss_run_log_created_idx
  on public.rss_run_log (created_at desc);

create index if not exists rss_run_log_source_created_idx
  on public.rss_run_log (source_id, created_at desc);

alter table public.rss_run_log enable row level security;

-- Tylko service_role moze pisac. Czytac moga authenticated (do admin dashboardu)
create policy "rss_run_log_service_write"
  on public.rss_run_log for all
  to service_role
  using (true) with check (true);

create policy "rss_run_log_authenticated_read"
  on public.rss_run_log for select
  to authenticated
  using (true);
