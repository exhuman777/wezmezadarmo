-- Opt-in na dzienny digest e-mail: bez wyraźnej zgody użytkownika nie wysyłamy
-- żadnych maili marketingowych/informacyjnych. Zmienia domyślną wartość
-- digest_enabled na false i dodaje ślad zgody (RODO): kiedy i skąd użytkownik
-- wyraził zgodę na otrzymywanie digestu.

-- 1. Domyślnie wyłączone - nowe konta nie są zapisywane do wysyłki.
ALTER TABLE email_preferences ALTER COLUMN digest_enabled SET DEFAULT false;

-- 2. Ślad zgody: znacznik czasu i źródło (np. panel_settings).
ALTER TABLE email_preferences
  ADD COLUMN IF NOT EXISTS digest_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS digest_consent_source text;

-- 3. Defense-in-depth: wyłącz digest dla kont, które nigdy nie wyraziły
--    wyraźnej zgody (historyczne auto-zapisy z domyślnym digest_enabled = true).
--    Użytkownik może w każdej chwili włączyć digest w Panelu > Ustawienia.
UPDATE email_preferences
   SET digest_enabled = false
 WHERE digest_consent_at IS NULL
   AND digest_enabled = true;

COMMENT ON COLUMN email_preferences.digest_enabled IS
  'Dzienny digest e-mail. Domyślnie false - wymaga wyraźnej zgody w Panelu > Ustawienia.';
COMMENT ON COLUMN email_preferences.digest_consent_at IS
  'Znacznik czasu wyraźnej zgody na wysyłkę digestu (RODO). NULL = brak zgody = brak wysyłki.';
COMMENT ON COLUMN email_preferences.digest_consent_source IS
  'Źródło zgody, np. panel_settings.';
