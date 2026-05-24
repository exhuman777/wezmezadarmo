# Uptime Monitoring Setup (UptimeRobot)

Bezpłatny monitoring stanu serwisu z alertami email/SMS gdy coś padnie.

## Dlaczego UptimeRobot?

- **Free 50 monitorów** (nam wystarczy 3-5)
- 5-minutowy interval (free tier)
- Email alerts bez limitów
- Public status page (jeśli chcesz)
- Bez karty kredytowej

## Setup (10 min)

### 1. Konto UptimeRobot

1. https://uptimerobot.com/signUp
2. Aktywuj email
3. Login → Dashboard

### 2. Dodaj monitory

Klik **+ Add New Monitor**. Konfiguracja każdego:

#### Monitor 1: Strona główna
- **Type**: HTTP(s)
- **URL**: `https://www.wezmezadarmo.com`
- **Friendly Name**: WzD - Landing
- **Interval**: 5 minut
- **Timeout**: 30s
- Click **Create**

#### Monitor 2: Health endpoint
- **Type**: Keyword
- **URL**: `https://www.wezmezadarmo.com/api/health`
- **Keyword**: `"status":"ok"`
- **Friendly Name**: WzD - API Health
- **Interval**: 5 minut
- **Alert when**: Keyword NOT exists (alert gdy nie zwróci ok)

#### Monitor 3: AI Chat endpoint (auth-gated, sprawdzamy że odpowiada 401)
- **Type**: HTTP(s)
- **URL**: `https://www.wezmezadarmo.com/api/agent/chat`
- **HTTP Method**: POST
- **Expected Status Code**: `401` (powinien wymagać logowania)
- **Interval**: 15 minut

#### Monitor 4: Świadczenia (SSR test)
- **Type**: Keyword
- **URL**: `https://www.wezmezadarmo.com/swiadczenia`
- **Keyword**: `Baza świadczeń`
- **Interval**: 30 minut

#### Monitor 5: RSS cache (sprawdza czy cron działa)
- **Type**: Keyword
- **URL**: `https://www.wezmezadarmo.com/api/aktualnosci/debug`
- **Keyword**: `"count":` (sprawdza że są wpisy w cache)
- **Interval**: 1 godzina

### 3. Alert Contacts

Settings → **Alert Contacts** → Add:

- **Type**: Email
- **Friendly Name**: Owner Email
- **Email**: twój główny email
- **Email Test**: kliknij żeby otrzymać test

(Opcjonalnie też SMS na free tier -- ograniczony do 20/mies.)

Po dodaniu kontaktu przypisz go do wszystkich monitorów (otwórz monitor → Alert Contacts → wybierz).

### 4. (Opcjonalnie) Public Status Page

Settings → **Status Pages** → Add:
- **Page Type**: Public
- **Friendly Name**: wezmezadarmo Status
- **Custom Domain**: status.wezmezadarmo.com (wymaga CNAME w GoDaddy)
- **Display monitors**: wszystkie powyższe

Daje publiczny URL typu `https://stats.uptimerobot.com/xxxxx` żeby pokazać "Operational" w realtime.

## Co dostajesz

- Email alert w 5-10 min jak coś pada
- Histogram uptime per monitor (last 7d / 30d)
- Response time chart
- Public status page (opcjonalne)

## Inne narzędzia (alternatywy)

- **Better Stack** (Logtail) -- 10 monitorów free + logi + status page
- **Cronitor** -- dla cronów (GitHub Actions, etc.)
- **Healthchecks.io** -- też dla cronów, prosty UI

## Health endpoint do debugowania

`/api/health` zwraca JSON z statusem wszystkich krytycznych systemów:

```json
{
  "status": "ok",
  "checks": {
    "supabase": { "ok": true, "latency_ms": 45, "count": 66 },
    "rss_cache": { "ok": true, "newest": "2026-05-24T10:12:00Z" },
    "nbp_api": { "ok": true, "latency_ms": 230 },
    "openrouter": { "ok": true },
    "resend": { "ok": true }
  },
  "version": "abcd1234"
}
```

HTTP 200 = wszystko OK, HTTP 503 = degraded (jeden lub więcej check failed).

Jeśli UptimeRobot zaalarmuje, otwórz `/api/health` ręcznie -- pokaże który system padł.
