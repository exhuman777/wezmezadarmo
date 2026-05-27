-- Deduplication: track what was sent in each digest
ALTER TABLE digest_log
  ADD COLUMN IF NOT EXISTS sent_benefit_ids text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sent_rss_links    text[] DEFAULT '{}';
