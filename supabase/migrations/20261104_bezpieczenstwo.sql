-- Audyt 4.11.2026 (zastosowane w projekcie przez Supabase MCP jako bezpieczenstwo_2026_11_04).
-- Funkcje SECURITY DEFINER tylko dla serwera, stały search_path, digest_log tylko dla serwera, indeksy na kluczach obcych.
revoke execute on function public.increment_chat_rate_limit(text, integer) from public, anon, authenticated;
revoke execute on function public.cleanup_chat_rate_limits() from public, anon, authenticated;
grant execute on function public.increment_chat_rate_limit(text, integer) to service_role;
grant execute on function public.cleanup_chat_rate_limits() to service_role;

alter function public.increment_chat_rate_limit(text, integer) set search_path = public, pg_temp;
alter function public.cleanup_chat_rate_limits() set search_path = public, pg_temp;
alter function public.touch_newsletter_updated_at() set search_path = public, pg_temp;
alter function public.set_updated_at_now() set search_path = public, pg_temp;
alter function public.touch_benefits_audit_updated_at() set search_path = public, pg_temp;

alter policy digest_log_service_insert on public.digest_log to service_role;

create index if not exists idx_company_notifications_feed_id on public.company_notifications (feed_id);
create index if not exists idx_digest_log_user_id on public.digest_log (user_id);
create index if not exists idx_rss_alert_log_subscription_id on public.rss_alert_log (subscription_id);
