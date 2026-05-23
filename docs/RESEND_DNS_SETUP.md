# Resend DNS Setup -- naprawa "Partially Failed" SPF/DKIM

## Stan obecny

- DKIM (TXT `resend._domainkey`): **Verified**
- SPF (TXT `@`): **Invalid** -- istniejacy rekord SPF nie zawiera `include:_spf.resend.com`
- Domain overall status: **Partially Failed**

## Konsekwencje

Resend NIE wysyla emaili z domeny `wezmezadarmo.com`. Bez SPF/DKIM emaile sa:
- Odrzucane przez Gmail/Outlook (jako spoofing)
- Wpadaja do spamu (jak nie odrzucone)

Wszystko co probuje wyslac email tym kanalem **nie dziala**:
- Daily digest dla zalogowanych userow (`/api/digest`)
- Alerty RSS 2x/dzien (po cronie GHA `fetch-rss-cache.mjs`)
- Email weryfikacyjny przy rejestracji (jesli uzywa Resend zamiast Supabase Auth SMTP)

## Naprawa - 5 minut

### 1. Wejdz do GoDaddy DNS Manager
1. Zaloguj sie na https://account.godaddy.com
2. **My Products -> Domains** -> klik `wezmezadarmo.com`
3. **DNS** w lewym menu (albo "Manage DNS")

### 2. Znajdz istniejacy SPF
Filtruj typ rekordu = **TXT**, host = **@**. Wartosc zaczyna sie od `v=spf1`.

Typowo wyglada tak (przyklady):
```
v=spf1 include:_spf.google.com ~all
v=spf1 a mx ~all
v=spf1 ~all
```

### 3. Zaktualizuj SPF - dodaj Resend

Klik **olowek (edit)** przy rekordzie TXT z `v=spf1`. Zmien wartosc na (zachowaj istniejace include-y):

**Jesli masz Google Workspace:**
```
v=spf1 include:_spf.resend.com include:_spf.google.com ~all
```

**Jesli nie masz innych providerow email:**
```
v=spf1 include:_spf.resend.com ~all
```

**Jesli masz inne (np. Microsoft 365):**
```
v=spf1 include:_spf.resend.com include:spf.protection.outlook.com ~all
```

**KRYTYCZNE:** w jednej domenie moze byc TYLKO JEDEN rekord SPF (TXT z `v=spf1`). Jesli sa 2 -- usun starszy.

Klik **Save**.

### 4. Sprawdz MX (opcjonalne, dla email forwarding)
Resend nie wymaga MX zmian (nie odbiera maili). Pomin.

### 5. Reset weryfikacji w Resend

1. Wejdz na https://resend.com/domains
2. Klik `wezmezadarmo.com`
3. Prawy gorny rog -> **Restart** (lub "Verify DNS")
4. Czekaj 5-30 min (DNS propagacja, GoDaddy zwykle szybko)

## Weryfikacja po naprawie

```bash
# SPF check
dig +short TXT wezmezadarmo.com | grep spf
# Powinno zwrocic: "v=spf1 include:_spf.resend.com ..."

# DKIM check (juz dziala, ale dla pewnosci)
dig +short TXT resend._domainkey.wezmezadarmo.com
# Powinno zwrocic: "p=MIGfMA0..."
```

W Resend dashboard status powinien zmienic sie na **Verified** (zielony).

## Po naprawie

Wszystkie kanale email zaczna dzialac:
- Daily digest -- nastepny wieczor o 19:00 (cron Vercel)
- Alerty RSS -- nastepny cron GHA o 10:00 lub 15:00 PL
- Rejestracja -- email weryfikacyjny od razu

## Troubleshooting

**"DNS still propagating" po 1h:**
- Sprawdz w https://mxtoolbox.com/spf.aspx -- wpisz wezmezadarmo.com
- Jesli wynik pokazuje stary SPF -- DNS jeszcze sie propaguje (max 24h)

**"Invalid SPF: too many lookups (>10)":**
- Skroc SPF, usuwajac niepotrzebne include-y
- Lub uzyj SPF flattening servicow (np. dmarcian.com)

**Nadal nie wysyla po naprawie:**
- Sprawdz RESEND_API_KEY w Vercel env (i GHA secrets)
- Sprawdz `RESEND_FROM_EMAIL` -- musi byc `something@wezmezadarmo.com` (nie inny domain)
- Logs Resend dashboard -> Logs zakladka, zobacz konkretne emaile
