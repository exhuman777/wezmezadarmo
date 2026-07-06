-- Audyt zrodel: zapisuj notatke diagnostyczna (np. "Miekki 404 -- przekierowanie
-- na strone glowna") razem z wynikiem. Wczesniej notatka byla tylko w mailu,
-- panel admina jej nie pokazywal. Teraz panel jest samowystarczalny.

ALTER TABLE benefits_url_audit
  ADD COLUMN IF NOT EXISTS last_note text;
