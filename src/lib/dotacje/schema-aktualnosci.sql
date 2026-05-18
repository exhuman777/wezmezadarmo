-- Schemat B2B dla systemu aktualności
-- Tabele przypisane do konta firmowego (user_id = auth.uid())
-- Uruchom w Supabase SQL Editor

-- Kanały RSS przypisane do firmy
CREATE TABLE IF NOT EXISTS company_rss_feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feed_url TEXT NOT NULL,
  feed_name TEXT NOT NULL,
  aktywna BOOLEAN DEFAULT true,
  kategoria TEXT CHECK (kategoria IN ('dofinansowania', 'zus', 'podatki', 'prawo', 'inne')),
  sprawdzaj_co_godziny INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, feed_url)
);

-- Powiadomienia dla firmy
CREATE TABLE IF NOT EXISTS company_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tytul TEXT NOT NULL,
  tresc TEXT,
  zrodlo_url TEXT,
  feed_id UUID REFERENCES company_rss_feeds(id) ON DELETE SET NULL,
  przeczytana BOOLEAN DEFAULT false,
  priorytet TEXT DEFAULT 'normalny' CHECK (priorytet IN ('wysoki', 'normalny', 'niski')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_company_rss_feeds_user_id ON company_rss_feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_company_rss_feeds_aktywna ON company_rss_feeds(user_id, aktywna);
CREATE INDEX IF NOT EXISTS idx_company_notifications_user_id ON company_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_company_notifications_przeczytana ON company_notifications(user_id, przeczytana);

-- Row Level Security
ALTER TABLE company_rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_notifications ENABLE ROW LEVEL SECURITY;

-- Polityki RLS: firma widzi tylko swoje dane
CREATE POLICY "Firma widzi swoje feedy"
  ON company_rss_feeds
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Firma widzi swoje powiadomienia"
  ON company_notifications
  FOR ALL
  USING (user_id = auth.uid());
