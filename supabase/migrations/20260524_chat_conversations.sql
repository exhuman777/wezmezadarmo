-- Chat conversation history - tabela dla zapisanych rozmow z AI assistant
-- Limit 10 ostatnich per user w wersji free (po stronie aplikacji)

create table if not exists public.chat_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,                    -- pierwsze 40 znakow pierwszej wiadomosci
  mode        text not null default 'ogolny',   -- ogolny|swiadczenie|wniosek|nabor|faktura|termin
  messages    jsonb not null default '[]'::jsonb,  -- array {role, content, timestamp}
  message_count int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists chat_conv_user_updated_idx
  on public.chat_conversations (user_id, updated_at desc);

create index if not exists chat_conv_user_count_idx
  on public.chat_conversations (user_id, created_at desc);

-- RLS - user widzi tylko swoje rozmowy
alter table public.chat_conversations enable row level security;

create policy "chat_conv_own_select"
  on public.chat_conversations for select to authenticated
  using (user_id = auth.uid());

create policy "chat_conv_own_insert"
  on public.chat_conversations for insert to authenticated
  with check (user_id = auth.uid());

create policy "chat_conv_own_update"
  on public.chat_conversations for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "chat_conv_own_delete"
  on public.chat_conversations for delete to authenticated
  using (user_id = auth.uid());

-- Funkcja: trigger auto-update updated_at
create or replace function public.set_updated_at_now()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists chat_conv_updated_at on public.chat_conversations;
create trigger chat_conv_updated_at
  before update on public.chat_conversations
  for each row execute function public.set_updated_at_now();
