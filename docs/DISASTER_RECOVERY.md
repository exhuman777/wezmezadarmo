# Disaster Recovery & Backup Strategy

**Ostatnia aktualizacja:** 2026-05-24
**Owner:** Mooning Charts Research Kamil Sobkowicz (NIP 7133061369)

## Co jest do uratowania

| Zasób | Krytyczność | Gdzie | Co tracimy |
|---|---|---|---|
| **Baza świadczeń** (`src/engine/benefits/*.ts`) | HIGH | Git repo | Nic - źródło prawdy w kodzie |
| **Baza dotacji B2B** (`src/data/programs-b2b.ts`) | HIGH | Git repo | Nic - źródło prawdy w kodzie |
| **Konta agenta** (Supabase `agent_user_profiles`) | HIGH | Supabase | Profile użytkowników + preferencje digestu |
| **Konta dotacje B2B** (Supabase `companies`, `subscriptions`) | HIGH | Supabase | Dane firm + historia matchingu |
| **Newsletter subscribers** (Supabase `newsletter_subscribers`) | MEDIUM | Supabase | Lista mailingowa |
| **RSS cache** (Supabase `rss_cache`) | LOW | Supabase | 1-30 dni cache, można odbudować z RSS |
| **Logi digestu** (Supabase `digest_log`) | LOW | Supabase | Historia wysyłek email |
| **Hostowane assety** (zdjęcia, fonts) | LOW | Vercel + Git | Pliki w `/public` w git |
| **Środowiskowe** (env vars Vercel) | HIGH | Vercel + lokalny backup | API tokens (CEIDG, Resend, Supabase) |
| **DNS records** (GoDaddy) | HIGH | GoDaddy panel | SPF/DKIM/DMARC dla Resend |

## Strategia kopii zapasowych

### 1. Kod (Git)
- **Source of truth**: GitHub `exhuman777/wezmezadarmo` (private repo)
- **Lokalne kopie**: kilka maszyn dev (Macbook, ewentualnie inne)
- **Vercel = mirror**: deployments z każdego commita
- **RPO**: zero (każdy push to backup)
- **RTO**: ~3 min (revert do poprzedniego commita + redeploy)

### 2. Baza Supabase
- **Wbudowane backupy Supabase**: 
  - Free tier: brak backupów automatycznych ⚠️
  - **Pro tier (25$/mies)**: PITR (Point-In-Time Recovery) na 7 dni
  - **Team tier**: PITR 14 dni + replikacja regionalna
- **Aktualnie**: prawdopodobnie Free tier - **TO DO: upgrade na Pro przed launch**
- **Manualne dumpy**: 
  ```bash
  # Co tydzień (TODO: zautomatyzować w GitHub Actions)
  PGPASSWORD=$SUPABASE_DB_PASSWORD pg_dump \
    -h db.PROJECT_REF.supabase.co \
    -U postgres -d postgres \
    -Fc -f backup-$(date +%Y%m%d).dump
  ```
- **RPO**: 24h (manualnie), 1min (PITR Pro)
- **RTO**: ~30 min (restore z dumpa) lub <5 min (PITR)

### 3. Env vars Vercel
- **Lokalny backup**: pełna lista w `.env.local` (gitignored)
- **Vercel UI export**: brak automatu, manualnie:
  - Settings → Environment Variables → ... → Export
- **Bitwarden/1Password**: zachować kopię CEIDG_API_TOKEN, RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_* (jeśli kiedyś dodane)
- **RPO**: manualnie po każdej zmianie env
- **RTO**: 10 min (re-paste do Vercel + redeploy)

### 4. DNS (GoDaddy)
- **Zrzut DNS records**: screenshoty + tekstowa kopia w `/docs/dns-backup.md`
  ```
  TXT @ "v=spf1 include:_spf.resend.com -all"
  CNAME resend._domainkey.wezmezadarmo.com → resend._domainkey.amazonses.com
  TXT _dmarc "v=DMARC1; p=none; rua=mailto:sobkowicz.kamil@gmail.com"
  A @ → Vercel IP
  CNAME www → cname.vercel-dns.com
  ```
- **RPO**: manualnie po każdej zmianie DNS
- **RTO**: ~30 min (re-edit DNS + propagacja)

### 5. RSS cache (low priority)
- **Strategia**: odbudowa z RSS feeds, akceptujemy utratę cache
- **Backup**: brak (cache się sam odbudowuje co 12h przez GitHub Actions cron)
- **RTO**: ~2h (czekamy na następny cron run + Firecrawl fallback)

## Scenariusze awarii

### A) Vercel deployment failed (build error)
1. **Symptom**: production zwraca 500 lub stara wersja
2. **Akcja**: 
   - Vercel Dashboard → Deployments → Promote ostatni działający deployment do production
   - Lub: `git revert <bad-commit>` + push
3. **RTO**: < 5 min

### B) Supabase database down lub stracone dane
1. **Symptom**: `/agent/panel/*`, `/dotacje/panel/*` zwracają 500 / auth fails
2. **Akcja (Pro tier z PITR)**:
   - Supabase Dashboard → Project Settings → Database → Point in Time Recovery
   - Wybrać timestamp przed incydentem
   - Restore (creates new branch lub restore in place)
3. **Akcja (Free tier - brak PITR)**:
   - Restore z ostatniego manualnego dumpa: `pg_restore -h ... -d postgres backup-X.dump`
   - Komunikat do userów: data utraty + przeprosiny
4. **Mitygacja**: wyświetl "Panel chwilowo niedostępny, kalkulator działa" - kalkulator nie zależy od Supabase

### C) CEIDG token expired/revoked
1. **Symptom**: `/api/ceidg` zwraca 500, formularz NIP nie wzbogaca profilu
2. **Akcja**: 
   - Zaloguj się na biznes.gov.pl → Hurtownia Danych → wygeneruj nowy token
   - Vercel → env var `CEIDG_API_TOKEN` → update → redeploy
3. **Fallback w kodzie**: `/api/ceidg` graceful zwraca empty data + status 200
4. **RTO**: ~15 min (gov.pl ma kolejkę przy generacji tokena)

### D) Resend account suspended / SPF broken
1. **Symptom**: digesty nie idą, formularz kontakt nie dochodzi
2. **Akcja**:
   - Sprawdź Resend dashboard → status DKIM/SPF
   - Sprawdź DNS w GoDaddy (TXT i CNAME records)
   - Fallback: tymczasowo skierować maile na Gmail SMTP
3. **Dokumentacja**: `docs/RESEND_DNS_SETUP.md`

### E) GoDaddy DNS panel hacked / DNS zmieniony
1. **Symptom**: domena prowadzi gdzie indziej / SSL invalid
2. **Akcja**:
   - GoDaddy support (+48 22 zwracać uwagę)
   - 2FA na GoDaddy MUST być aktywne
   - Zmienić hasło + sprawdzić DNS przeciwko `/docs/dns-backup.md`
3. **Mitygacja preventive**: TURN ON 2FA na GoDaddy + użyj sprzętowego klucza

### F) GitHub account compromised
1. **Symptom**: malicious commits, secrets w repo
2. **Akcja**:
   - Rotate **wszystkie** tokeny w env vars Vercel (CEIDG, Resend, Supabase, OpenRouter, GA)
   - GitHub Settings → Sessions → Sign out all + change password
   - Revert podejrzane commity
   - Audit `git log` za 24h
3. **Mitygacja preventive**: 2FA + sprzętowy klucz na GitHub

## Tygodniowy checklist

Co poniedziałek (max 15 min):

- [ ] Sprawdź Vercel Analytics - czy ruch normalny?
- [ ] Sprawdź Supabase Dashboard - storage usage, query performance
- [ ] Sprawdź E2E: `node scripts/e2e-check.mjs` - czy wszystkie API żyją?
- [ ] Sprawdź `/api/aktualnosci` w przeglądarce - czy RSS feed świeży?
- [ ] Sprawdź daily digest - czy poszedł wczoraj? (Vercel Cron logs)
- [ ] Eksportuj env vars (jeśli były zmiany)
- [ ] Eksportuj DNS (jeśli były zmiany)

## Miesięczny checklist

- [ ] Manualny dump Supabase: `pg_dump > backup-YYYY-MM.dump` → Google Drive
- [ ] Rotuj CEIDG_API_TOKEN jeśli >6 miesięcy (proaktywnie)
- [ ] Sprawdź expire dates SSL (Vercel auto-renew, ale verify)
- [ ] Audit `npm audit` + `git log` za miesiąc
- [ ] Sprawdź uptime Vercel Status

## Punkt kontaktowy

- **Vercel support**: vercel.com/help (Pro tier ma email support)
- **Supabase support**: supabase.com/dashboard/support
- **GoDaddy support**: pl. (22) 397 03 50 (24/7)
- **Resend support**: support@resend.com
- **Twoja maszyna dev**: backup hasła w Bitwarden

## Roadmap (TODO)

1. **Upgrade Supabase do Pro tier** - PITR backupy włączone
2. **GitHub Actions weekly backup** - `pg_dump` → wrzucenie do prywatnego bucketu
3. **Status page** - publiczna strona statusu (Vercel ma `vercel-status.com`, można dodać swoją)
4. **Monitoring uptime** - UptimeRobot / Better Stack, alert na maila gdy site down
5. **Sentry error tracking** - dla wczesnego wykrywania problemów
6. **Runbook na incydent** - krok po kroku co robić w pierwszych 15 min awarii
