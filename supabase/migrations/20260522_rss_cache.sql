-- RSS cache: artykuły pobierane przez GitHub Actions 2x dziennie
-- dla źródeł blokowanych przez Vercel IP (NBP, Sejm, Fundusze EU, e-Zdrowie, ARiMR)

create table if not exists public.rss_cache (
  id          text primary key,            -- simpleHash(link + sourceId)
  source_id   text        not null,
  source_name text        not null,
  title       text        not null,
  link        text        not null,
  description text        not null default '',
  pub_date    timestamptz,
  audiences   text[]      not null default '{}',
  fetched_at  timestamptz not null default now()
);

-- Szybkie zapytania po źródle + dacie
create index if not exists rss_cache_source_date
  on public.rss_cache (source_id, fetched_at desc);

-- RLS: publiczny odczyt (aktualności są publiczne), zapis tylko service role
alter table public.rss_cache enable row level security;

create policy "rss_cache_public_read"
  on public.rss_cache for select
  to anon, authenticated
  using (true);

create policy "rss_cache_service_write"
  on public.rss_cache for all
  to service_role
  using (true)
  with check (true);
