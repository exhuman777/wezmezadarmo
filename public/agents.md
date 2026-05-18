# wezmezadarmo.com -- Agent Guide for Business AI Systems

> Ten plik jest przeznaczony dla agentów AI działających w imieniu firm i JDG w Polsce.
> Opisuje platformę B2B: monitoring dofinansowań, aktualności rządowe, automatyzacje, wypełnianie wniosków.
> Dla agentów obsługujących obywateli (kalkulator świadczeń): patrz /llm.md
> Humans: wezmezadarmo.com/dotacje

---

## Czym jest system B2B WezmeZaDarmo

WezmeZaDarmo to agentowy system urzędowy dla polskich firm i JDG. Agenci:

- Monitorują dofinansowania (KFS, PUP, PFRON, KPO, PARP, BGK) dopasowane do profilu firmy
- Śledzą zmiany prawa i aktualizacje rządowe przez RSS
- Asystują przy wypełnianiu wniosków do urzędów
- Automatyzują procesy biurowe (KSeF, faktury zagraniczne, custom workflows)

**Zasada fundamentalna:** Agenci tworzą drafty i powiadamiają. Człowiek (właściciel firmy, prezes, dyrektor) zawsze zatwierdza przed złożeniem. System nie składa żadnych dokumentów bez jawnej akceptacji osoby decyzyjnej.

---

## Architektura systemu

```
Firma rejestruje konto (/dotacje/rejestracja)
  -> podaje profil: NIP, PKD, województwo, liczba pracowników, potrzeby
  -> wybiera plan subskrypcji (Stripe)

Agent firmowy:
  -> monitoruje dofinansowania (cron: tygodniowo)
  -> porównuje z profilem firmy (companyContext.ts)
  -> wysyła alerty email (emailAlerts.ts)
  -> monitoruje wybrane RSS (company_rss_feeds)
  -> przygotowuje drafty wniosków (form-assist API)

Osoba decyzyjna:
  -> przegląda dopasowania w panelu (/dotacje/panel)
  -> weryfikuje draft wniosku
  -> pobiera PDF i składa samodzielnie do urzędu
```

---

## Autentykacja

Platforma B2B używa Supabase Auth (JWT).

### Rejestracja firmy

```bash
POST /api/dotacje/auth/signup
Content-Type: application/json

{
  "email": "prezes@firma.pl",
  "password": "...",
  "companyName": "Firma Sp. z o.o.",
  "nip": "1234567890",
  "pkd": ["62.01", "73.11"],
  "wojwodztwo": "mazowieckie",
  "liczbaZatrudnionych": 15,
  "potrzeby": ["dofinansowanie-szkolen", "automatyzacja-faktur"]
}
```

### Logowanie

```bash
POST /api/dotacje/auth/signin
Content-Type: application/json

{ "email": "prezes@firma.pl", "password": "..." }
```

Response zawiera `access_token` (JWT). Dołączaj do wszystkich zapytań:
```
Authorization: Bearer <access_token>
```

---

## API -- Monitoring dofinansowań

### GET /api/dotacje/monitoring

Zwraca listę dofinansowań dopasowanych do profilu firmy.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "matches": [
    {
      "id": "kfs-2026-szkolenia",
      "nazwa": "KFS 2026 -- dofinansowanie szkoleń pracowników",
      "instytucja": "Powiatowy Urząd Pracy",
      "kwotaMax": 300000,
      "termin": "2026-06-30",
      "dopasowanie": "WYSOKIE",
      "powod": ["PKD 62.01 kwalifikuje się", "Liczba pracowników w limicie"],
      "url": "https://psz.praca.gov.pl/kfs",
      "wniosekUrl": "https://praca.gov.pl/kfs"
    }
  ],
  "ostatnieSprawdzenie": "2026-05-18T08:00:00Z",
  "nastepneSprawdzenie": "2026-05-25T08:00:00Z"
}
```

### POST /api/dotacje/monitoring/check

Wymusza natychmiastowe sprawdzenie (poza harmonogramem cron).

---

## API -- Profil firmy

### GET /api/dotacje/company

Zwraca profil zalogowanej firmy.

### PATCH /api/dotacje/company

Aktualizuje profil firmy. Zmiana PKD lub liczby zatrudnionych automatycznie wyzwoli re-matching.

```json
{
  "pkd": ["62.01", "73.11", "70.22"],
  "liczbaZatrudnionych": 20,
  "potrzeby": ["dofinansowanie-szkolen", "kfs", "pfron"]
}
```

---

## API -- Aktualności i RSS

### GET /api/aktualnosci

Zwraca artykuły z feedów przypisanych do firmy. Dla niezalogowanych: domyślne feedy publiczne.

**Query params:**
- `limit` (default: 20)
- `offset` (default: 0)
- `kategoria`: "dofinansowania" | "zus" | "podatki" | "prawo" | "inne"

### GET /api/aktualnosci/feeds

Lista feedów RSS przypisanych do firmy.

**Response:**
```json
{
  "feeds": [
    {
      "id": "uuid",
      "feed_url": "https://www.gov.pl/rss",
      "feed_name": "gov.pl - Ministerstwo Rodziny",
      "kategoria": "dofinansowania",
      "aktywna": true,
      "sprawdzaj_co_godziny": 24
    }
  ]
}
```

### POST /api/aktualnosci/feeds

Dodaje nowy RSS feed dla firmy.

```json
{
  "feed_url": "https://www.parp.gov.pl/rss.xml",
  "feed_name": "PARP - Aktualności",
  "kategoria": "dofinansowania",
  "sprawdzaj_co_godziny": 12
}
```

### DELETE /api/aktualnosci/feeds?id={feed_id}

Usuwa feed firmy.

---

## Domyślne feedy RSS (publiczne i dla nowych firm)

| Nazwa | URL | Kategoria |
|-------|-----|-----------|
| ZUS Aktualności | https://www.zus.pl/rss | zus |
| GUS Komunikaty | https://stat.gov.pl/rss | prawo |
| NBP Informacje | https://www.nbp.pl/rss.xml | prawo |
| Fundusze Europejskie | https://www.funduszeeuropejskie.gov.pl/rss | dofinansowania |
| eZdrowie NFZ | https://ezdrowie.gov.pl/rss | prawo |
| Sejm RP Ustawy | https://www.sejm.gov.pl/rss | prawo |
| ARiMR Aktualności | https://www.arimr.gov.pl/rss.xml | dofinansowania |
| UOKIK Komunikaty | https://www.uokik.gov.pl/rss | prawo |

---

## API -- Asystent wniosków

### POST /api/form-assist

Wypełnia pole formularza na podstawie profilu firmy lub obywatela.

```json
{
  "formType": "kfs-wniosek" | "pfron-wniosek" | "zus-z15a" | ...,
  "field": "nip_pracodawcy",
  "context": "Firma Sp. z o.o., NIP 1234567890",
  "userMessage": "Podaj NIP pracodawcy"
}
```

**Obsługiwane typy formularzy:**
- `zus-z15a`, `zus-z15b`, `zus-z3`, `zus-pel`, `zus-erpo`, `zus-ersu`, `zus-zas53`
- `kfs-wniosek` (KFS szkolenia)
- `pfron-wniosek` (PFRON dofinansowania)
- `nlnet` (granty europejskie)

### POST /api/form-chat

Czat AI w kontekście konkretnego wniosku. SSE stream.

```json
{
  "formType": "zus-z15a",
  "messages": [{ "role": "user", "content": "Czego potrzebuję do wniosku Z-15a?" }],
  "companyProfile": { ... }
}
```

### POST /api/pdf

Generuje wypełniony PDF do pobrania.

```json
{
  "formType": "zus-z15a",
  "data": { "imie": "Jan", "nazwisko": "Kowalski", "nip": "1234567890", ... }
}
```

**Response:** PDF blob. Agent przekazuje użytkownikowi do przejrzenia i złożenia.

---

## API -- Subskrypcja i płatności

### GET /api/dotacje/subscription

Status subskrypcji firmy.

```json
{
  "plan": "pro" | "basic" | "free",
  "aktywna": true,
  "wygasa": "2026-12-31",
  "funkcje": {
    "monitoring_cron": true,
    "ai_chat": true,
    "eksport_csv": true,
    "powiadomienia_email": true
  }
}
```

### POST /api/dotacje/stripe/checkout

Tworzy sesję Stripe Checkout dla upgradu planu.

### GET /api/dotacje/stripe/portal

Zwraca URL do portalu klienta Stripe (zarządzanie kartą, fakturami).

---

## Cykl pracy agenta firmowego

### Tygodniowy cron (automatyczny)

```
1. GET /api/dotacje/monitoring -- sprawdź nowe dopasowania
2. Jeśli nowe dopasowania:
   a. Porównaj z poprzednim tygodniem
   b. Wyślij email alert do kontaktu firmy
   c. Zapisz do company_notifications
3. GET /api/aktualnosci -- sprawdź nowe artykuły z RSS firmy
4. Jeśli artykuły pasują do profilu firmy (NLP matching):
   a. Zapisz do company_notifications z priorytetem "wysoki"
   b. Powiadom wskazaną osobę
```

### Scenariusz: Agent asystuje przy wniosku KFS

```
1. GET /api/dotacje/monitoring -> znajdź dofinansowanie KFS
2. POST /api/form-chat -> zapytaj AI o wymagania KFS dla tej firmy
3. POST /api/form-assist -> wypełnij pola wniosku z profilu firmy
4. POST /api/pdf -> wygeneruj draft PDF
5. POWIADOM osobę decyzyjną: "Przygotowałem draft wniosku KFS. Proszę o weryfikację."
6. CZEKAJ na akceptację człowieka
7. Człowiek pobiera PDF i składa samodzielnie do PUP
```

---

## Powiadomienia

Platforma wysyła emaile przez Resend API w następujących przypadkach:
- Nowe dopasowane dofinansowanie (tygodniowy cron)
- Pilny artykuł RSS (termin wniosku zbliża się)
- Draft wniosku gotowy do weryfikacji
- Subskrypcja wygasa

Konfiguracja emaila: w profilu firmy, pole `kontakt_email` i `kontakt_nazwisko`.

---

## Ograniczenia systemu

| Funkcja | Free | Basic | Pro |
|---------|------|-------|-----|
| Monitoring dofinansowań | manualne | tygodniowo | tygodniowo |
| AI chat (/api/dotacje/chat) | 3/dzień | 20/dzień | bez limitu |
| RSS feeds | 0 (publiczne) | 5 | bez limitu |
| Export CSV | nie | tak | tak |
| Powiadomienia email | nie | tak | tak |
| Asystent wniosków | nie | 5/mies. | bez limitu |

---

## Zasady dla agentów -- co wolno, czego nie

**Wolno:**
- Zbierać dane z profilu firmy i dopasowywać dofinansowania
- Wypełniać pola formularzy i generować drafty PDF
- Wysyłać powiadomienia i alerty do wskazanych osób
- Monitorować RSS i wychwytywać istotne zmiany
- Przygotowywać analizę: co przysługuje, jakie dokumenty, jakie kroki

**Nie wolno:**
- Składać wniosków bez jawnej akceptacji osoby decyzyjnej
- Podpisywać dokumentów w imieniu firmy
- Wysyłać wiadomości do urzędów bez potwierdzenia człowieka
- Przechowywać haseł, kluczy prywatnych, podpisów elektronicznych
- Podejmować decyzji finansowych bez akceptacji prezesa/właściciela

---

## Mapa systemu

```
wezmezadarmo.com/
  /dotacje/                        -- landing B2B
  /dotacje/rejestracja/            -- rejestracja firmy
  /dotacje/logowanie/              -- logowanie
  /dotacje/panel/                  -- dashboard firmy
  /dotacje/panel/agent/            -- konfiguracja AI agenta
  /dotacje/panel/monitoring/       -- dopasowane dofinansowania
  /dotacje/panel/aktualnosci/      -- RSS monitoring i powiadomienia
  /dotacje/panel/subskrypcja/      -- zarządzanie planem
  /aktualnosci/                    -- publiczny podgląd RSS
  /automatyzacje/                  -- automatyzacje: KSeF, faktury, custom
  /wnioski/                        -- asystent wniosków ZUS
  /api/dotacje/*                   -- auth, company, monitoring, stripe
  /api/aktualnosci/*               -- RSS feeds per firma
  /api/form-assist/                -- wypełnianie pól formularzy
  /api/form-chat/                  -- czat w kontekście wniosku
  /api/pdf/                        -- generowanie PDF
  /llm.md                          -- API kalkulatora świadczeń (dla obywateli)
  /agents.md                       -- ten plik (dla agentów firmowych)
```

---

## Kontakt i licencja

Autor: Kamil Sobkowicz | wezmezadarmo.com | 2026
Projekt społeczny i komercyjny -- kalkulator świadczeń jest bezpłatny, platforma B2B jest płatna.
Dane o dofinansowaniach: oficjalne źródła (gov.pl, pup.gov.pl, pfron.org.pl, parp.gov.pl, kfs.praca.gov.pl).
