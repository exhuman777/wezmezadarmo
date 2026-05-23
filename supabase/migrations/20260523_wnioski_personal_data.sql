-- Personal data fields dla pre-fill formularzy ZUS/grant
-- Dodawane do agent_user_profiles, nullable (opcjonalne).
-- Same dane co user wpisuje w wniosku - storage pozwala skipnac ponowne wpisywanie.

ALTER TABLE agent_user_profiles
  ADD COLUMN IF NOT EXISTS imie text,
  ADD COLUMN IF NOT EXISTS nazwisko text,
  ADD COLUMN IF NOT EXISTS pesel text,
  ADD COLUMN IF NOT EXISTS telefon text,
  ADD COLUMN IF NOT EXISTS ulica text,
  ADD COLUMN IF NOT EXISTS nr_domu text,
  ADD COLUMN IF NOT EXISTS nr_lokalu text,
  ADD COLUMN IF NOT EXISTS kod_pocztowy text,
  ADD COLUMN IF NOT EXISTS miejscowosc text,
  ADD COLUMN IF NOT EXISTS nr_konta text;

COMMENT ON COLUMN agent_user_profiles.pesel IS 'PESEL - chronione przez RLS, uzywane tylko do prefill wnioskow';
COMMENT ON COLUMN agent_user_profiles.nr_konta IS 'Numer konta bankowego do wyplaty swiadczen';
