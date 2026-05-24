# Ship Checklist -- Launch wezmezadarmo.com

Checklist przed publicznym ogłoszeniem (ProductHunt, Wykop, Twitter).

## Pre-launch (musi być done)

- [x] Domena DNS (HTTPS, www redirect, CNAMEs Vercel)
- [x] 118 świadczeń w bazie, dataWeryfikacji 2026-05-23
- [x] 23 programy dotacyjne B2B
- [x] 11 narzędzi Centrum Obywatela live
- [x] RSS cron 2x/dzień (8/8 źródeł działa)
- [x] AI chat z pełnym kontekstem (8 live API)
- [x] Auth + onboarding wizard + welcome tour
- [x] Chat conversation history (limit 10 free tier)
- [x] Empty states + error handling
- [x] Mobile responsive (iPhone 375-430px)
- [x] SEO sitemap (152 URL-i) + JSON-LD
- [x] Blog + pierwszy artykuł 2000 słów
- [x] Press kit `/press`
- [x] PWA manifest + iOS install
- [x] Vercel Analytics + Speed Insights
- [x] Funnel events (quiz_started/completed, nip_checked)
- [x] `/api/health` endpoint
- [x] Regulamin + Polityka Prywatności v3 (RODO + EU AI Act)
- [ ] **Resend SPF Verified** (czeka na user)
- [ ] **UptimeRobot setup** (5 min, instrukcja w docs/UPTIME_MONITORING.md)
- [ ] **Test e-mail rejestracji** (po Resend Verified)

## Launch day kanały promocji

### 1. ProductHunt (top traffic)

- Launch w **wtorek-czwartek**, godzina 9:00 CET (PST 00:01)
- Tytuł: "wezmezadarmo - 118 polskich świadczeń rządowych + AI agent w 10 sekund"
- Tagline: "Sprawdź na co się kwalifikujesz. Bezpłatnie, bez logowania."
- Pierwszy komentarz (autor): historia + dlaczego budujesz + jak działa
- Pierwsze 4h najważniejsze -- proś przyjaciół o upvote (nie spam ale aktywnie)
- Galeria: 5 screenshotów (landing + quiz + wyniki + chat AI + centrum obywatela)

Link gotowy: https://www.producthunt.com/products/wezmezadarmo (po claimowaniu)

### 2. Wykop.pl

- Sekcja: **Społeczeństwo** lub **Ciekawostki**
- Tytuł: "Bezpłatne narzędzie - znajdziesz 118 świadczeń, ulg i dotacji których nie znałeś"
- Tag: #poradnik #pieniadze #panstwo
- Pierwszy komentarz: TL;DR co to robi + jak działa
- Wykopcam: znajomi w pierwszych 30 min

### 3. r/Polska + r/poland

- Tytuł: "Zbudowałem narzędzie pokazujące świadczenia rządowe które Ci się należą"
- Body: krótko, link, otwartość na feedback
- Reguły reddita: trzeba być aktywnym członkiem, nie spamem
- Lepiej -- ktoś inny z karmą postuje

### 4. LinkedIn

- Post od autora osobistego konta
- Hook: "Polacy tracą średnio 2 400 PLN rocznie nie korzystając ze świadczeń"
- Body: dlaczego budujesz, co robi, link
- Tagi: #PolskaCyfrowa #Świadczenia #CivicTech
- Hashtagi: 3-5 max

### 5. Twitter/X

- Thread: 5-7 tweets
  - 1: hook (problem)
  - 2: solution (link)
  - 3: 1 konkretne świadczenie z liczbą (np. "bon ciepłowniczy do 3500 PLN")
  - 4: AI chat - przykład pytania + odpowiedzi
  - 5: open source (link do github)
  - 6: jak pomóc (upvote, share)
  - 7: dziękuję

### 6. Facebook groups (Polish)

Grupy do rozważenia (nie spam, tylko pomocnie):
- "JDG - prawda o samozatrudnieniu"
- "Mama 4+ i tematy rodzinne"
- "Emeryci i renciści"
- "Czyste Powietrze - rozmowy"
- Lokalne grupy miastowe (gdy budujesz społeczność)

### 7. Lokalne media (regional)

- Lokalne TV / gazety (np. TVP regional, Onet lokalny)
- Press kit gotowy na `/press` (logo, screenshoty, opis)
- Email do dziennikarzy: krótko, link do press kit

### 8. NGO partnerships

- Caritas Polska, PCK
- Stowarzyszenia emerytów, rodzin wielodzietnych
- Mogą promować wśród beneficjentów

### 9. SEO long-tail

Po blogu rośnie ruch organiczny. Plan: 1 artykuł tygodniowo:
- "Bon ciepłowniczy 2026 - jak złożyć wniosek"
- "KSeF dla JDG - kompletny przewodnik"
- "Czyste Powietrze - ile dostaniesz na pompę ciepła"
- "Renta wdowia - kto się kwalifikuje"
- "Mały ZUS Plus - oszczędność 15 000 PLN rocznie"

### 10. Newsletter "TLDR Polska"

Sprawdź czy istnieje (TLDR newsletter polski). Jeśli tak -- pitch jako featured tool.

## Po launch (1 tydzień)

### Daily checks

- UptimeRobot → wszystko green
- Vercel Analytics → page views, top routes
- Sentry/Axiom → 0 errors (lub jakie są)
- Supabase → user signups, chat conversations growth

### Engagement

- Odpowiadaj na komentarze na ProductHunt
- Reply na Twitter/LinkedIn
- Email od dziennikarzy / NGO → szybka odpowiedź

### Iteracje

- User feedback → fix top 3 bugów w tym samym dniu
- Featured świadczenia w blog (które najpopularniejsze w analytics)

## Pre-launch checklist final

Przed kliknięciem "Publish" na ProductHunt sprawdź:

1. **Test rejestracji** (incognito) -- email aktywacyjny przychodzi
2. **Test logowania** -- działa
3. **Test profilu wizard** -- 11 kroków, save działa
4. **Test świadczeń** -- bez profilu → empty state, z profilem → lista
5. **Test dotacji** -- wpisz NIP CD Projekt (7342867148) → 3+ dopasowane
6. **Test chat** -- "co mi się należy?" → AI odpowiada w 3-5s, z bullet pointami
7. **Test mobile iPhone** -- wszystkie strony responsive
8. **Cookie banner** -- pojawia się, zapisuje wybór
9. **`/api/health`** -- HTTP 200, wszystkie checks green
10. **UptimeRobot** -- aktywny, 5 monitorów

## Success metrics (pierwsze 7 dni)

Cele do osiągnięcia:
- 1000+ unikatowych użytkowników
- 200+ ukończonych quiz (quiz_completed event)
- 50+ rejestracji
- 30+ chat conversations
- <2s LCP, <0.1 CLS (Vercel Speed Insights)
- 0 critical errors (UptimeRobot)
- 1-3 mentions w mediach (ProductHunt top 10, Wykop hot, lokalne TV)

Po pierwszym tygodniu -- analiza co działa, double-down na najlepszy kanał.
