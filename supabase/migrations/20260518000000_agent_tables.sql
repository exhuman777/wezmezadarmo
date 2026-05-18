-- supabase/migrations/20260518000000_agent_tables.sql

-- Profil uzytkownika (JDG lub osoba prywatna)
CREATE TABLE IF NOT EXISTS agent_user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('jdg', 'private')),

  -- JDG only
  nip text,
  company_name text,
  pkd_codes text[],
  company_voivodeship text,
  company_registration_date date,
  company_status text,
  company_size text CHECK (company_size IN ('mikro', 'mala', 'srednia', 'duza')),

  -- Private only
  wiek smallint,
  plec text CHECK (plec IN ('K', 'M')),
  stan_cywilny text,
  liczba_dzieci smallint DEFAULT 0,
  wiek_dzieci smallint[] DEFAULT '{}',
  dochod_miesiecznie numeric,
  dochod_na_osobe numeric,
  zatrudnienie text,
  niepelnosprawnosc text DEFAULT 'brak',
  wlasnosc text,
  wojewodztwo text,
  ciaza boolean DEFAULT false,
  student boolean DEFAULT false,
  emeryt boolean DEFAULT false,
  rolnik boolean DEFAULT false,
  bezrobotny_zarejestrowany boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Preferencje e-mail
CREATE TABLE IF NOT EXISTS email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  digest_enabled boolean DEFAULT true,
  digest_hour smallint DEFAULT 6 CHECK (digest_hour BETWEEN 0 AND 23),
  categories text[] DEFAULT ARRAY['dofinansowania','zus','podatki','prawo'],
  last_digest_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Log wyslanych digestow
CREATE TABLE IF NOT EXISTS digest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sent_at timestamptz DEFAULT now(),
  items_count smallint DEFAULT 0,
  subject text,
  skipped boolean DEFAULT false,
  skip_reason text
);

-- RLS
ALTER TABLE agent_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_profile_owner" ON agent_user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "email_pref_owner" ON email_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "digest_log_read" ON digest_log
  FOR SELECT USING (auth.uid() = user_id);

-- Service role omija RLS (cron digest potrzebuje dostep do wszystkich uzytkownikow)
CREATE POLICY "digest_log_service_insert" ON digest_log
  FOR INSERT WITH CHECK (true);
