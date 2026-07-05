-- Trwaly rate limit czatu AI (3 zapytania / 24h na IP).
-- Dotychczasowy limit byl w pamieci procesu -- na Vercel kazda instancja
-- funkcji ma wlasny licznik, a deploy zeruje wszystkie. Ten stan trzyma
-- licznik w Postgres, wspolny dla wszystkich instancji.
--
-- Prywatnosc: przechowujemy wylacznie hash SHA-256 adresu IP, nie surowy IP.

CREATE TABLE IF NOT EXISTS chat_rate_limits (
  ip_hash      text PRIMARY KEY,
  request_count int NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_rate_limits ENABLE ROW LEVEL SECURITY;
-- Brak polityk = dostep tylko przez service role (API serwera).

-- Atomowa inkrementacja z oknem 24h: resetuje licznik gdy okno minelo,
-- zwraca aktualny stan po inkrementacji. Jedno wywolanie = brak wyscigow.
CREATE OR REPLACE FUNCTION increment_chat_rate_limit(p_ip_hash text, p_max int DEFAULT 3)
RETURNS TABLE (allowed boolean, remaining int)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count int;
BEGIN
  INSERT INTO chat_rate_limits (ip_hash, request_count, window_start)
  VALUES (p_ip_hash, 1, now())
  ON CONFLICT (ip_hash) DO UPDATE SET
    request_count = CASE
      WHEN chat_rate_limits.window_start < now() - interval '24 hours' THEN 1
      ELSE chat_rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN chat_rate_limits.window_start < now() - interval '24 hours' THEN now()
      ELSE chat_rate_limits.window_start
    END
  RETURNING request_count INTO v_count;

  RETURN QUERY SELECT v_count <= p_max, greatest(0, p_max - v_count);
END;
$$;

-- Sprzatanie starych wpisow (wolane okazjonalnie z crona audytu lub recznie).
CREATE OR REPLACE FUNCTION cleanup_chat_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM chat_rate_limits WHERE window_start < now() - interval '48 hours';
$$;
