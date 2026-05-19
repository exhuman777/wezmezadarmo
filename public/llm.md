# wezmezadarmo.com -- LLM Agent Guide

> Ten plik jest przeznaczony dla agentów AI i modeli językowych.
> Opisuje bazę 117 polskich świadczeń, ulg i dotacji oraz jak z niej korzystać.
> Dla agentów działających w imieniu firm: patrz /agents.md
> Humans: see wezmezadarmo.com

---

## Co to jest

**wezmezadarmo.com** to niezależne narzędzie dla obywateli i firm, które:

- Przeszukuje bazę 117 polskich świadczeń socjalnych, ulg podatkowych i dotacji
- Dopasowuje świadczenia do profilu użytkownika i wyświetla instrukcje krok po kroku
- Asystuje przy wypełnianiu wniosków ZUS (Z-15a, Z-15b, Z-3, PEL, ERPO, ERSU, ZAS-53)
- Monitoruje dofinansowania i aktualności rządowe dla firm (platforma B2B /dotacje)
- Automatyzuje procesy biurowe dla firm (KSeF, faktury zagraniczne, własne workflow)

Dane: oficjalne źródła rządowe (gov.pl), zweryfikowane 2026-05-09.
Kalkulator świadczeń: brak bazy danych, dane przetwarzane na serwerze jednorazowo bez zapisu.
Panel agenta (/agent/panel): wymaga konta, profil demograficzny przechowywany w Supabase (UE).
Platforma B2B (/dotacje): wymaga konta, profil firmy i historia monitorowania przechowywane w Supabase (UE).

Przewodnik dla agentów działających jako asystenci firm: **/agents.md**

---

## Dwa tryby pracy

### 1. Kalkulator świadczeń (obywatele)

Bezstanowy. Użytkownik podaje profil, system zwraca dopasowane świadczenia. Brak logowania.
Endpointy: `/api/verify`, `/api/chat`, `/api/form-assist`, `/api/pdf`

### 2. Platforma B2B -- dotacje i monitoring (firmy)

Stanowy. Firmy rejestrują konto, podają profil (NIP, PKD, lokalizacja, potrzeby).
Agent monitoruje dofinansowania, aktualności RSS, asystuje przy wnioskach.
Ludzie zawsze zatwierdzają przed złożeniem.
Endpointy: `/api/dotacje/*`, `/api/aktualnosci/*`
Szczegoly: **/agents.md**

---

## API dla agentów -- kalkulator świadczeń

### POST /api/verify

Dopasowuje profil użytkownika do bazy 117 świadczeń.

**Request:**
```json
{
  "profile": {
    "wiek": 35,
    "plec": "K",
    "stanCywilny": "malzenstwo",
    "liczbaDzieci": 2,
    "wiekDzieci": [3, 7],
    "dochodMiesiecznie": 4500,
    "dochodNaOsobe": 1500,
    "zatrudnienie": "umowa_o_prace",
    "niepelnosprawnosc": "brak",
    "wlasnosc": "mieszkanie",
    "wojewodztwo": "mazowieckie",
    "prowadzDzialalnosc": false,
    "pierwszaDzialalnosc": false,
    "ciaza": false,
    "student": false,
    "emeryt": false,
    "rolnik": false,
    "bezrobotnyZarejestrowany": false
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "benefit": { "id": "800-plus", "nazwa": "Świadczenie wychowawcze 800+", "kwota": "800 PLN miesięcznie na dziecko" },
      "status": "PRZYSLUGUJE",
      "confidence": "WYSOKA",
      "matchedCriteria": ["Ma dzieci poniżej 18 lat"],
      "failedCriteria": [],
      "warnings": []
    }
  ],
  "aiVerified": true
}
```

### POST /api/chat

Czat z AI w kontekście profilu i wyników. SSE stream.

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "Jak złożyć wniosek na 800+?" }],
  "profile": { ... },
  "verifiedResults": [ ... ]
}
```

**Response:** SSE stream -- `data: {"content": "..."}` chunks, kończy się `data: [DONE]`

**Rate limit:** 3 zapytania dziennie na IP dla niezalogowanych. Brak limitu dla firm z API key.

### POST /api/form-assist

Wypełnia pola formularza ZUS na podstawie profilu i pytania.

**Request:**
```json
{
  "formType": "zus-z15a",
  "field": "data_urodzenia",
  "userMessage": "Podaj datę urodzenia w formacie DD.MM.RRRR",
  "profile": { ... }
}
```

**Response:**
```json
{
  "value": "15.03.1989",
  "explanation": "Data urodzenia z podanego profilu."
}
```

### POST /api/pdf

Generuje PDF wniosku z wstrzykniętymi danymi (XFA injection do formularzy ZUS).

**Request:**
```json
{
  "formType": "zus-z15a",
  "data": { "imie": "Anna", "nazwisko": "Kowalska", ... }
}
```

**Response:** PDF blob (application/pdf)

---

## Schema danych

### UserProfile -- profil użytkownika

| Pole | Typ | Opis | Przykładowe wartości |
|------|-----|------|----------------------|
| wiek | number | Wiek w latach | 18-100 |
| plec | "K" lub "M" | Płeć | "K" = kobieta, "M" = mężczyzna |
| stanCywilny | string | Stan cywilny | "wolny", "malzenstwo", "rozwiedziony", "wdowiec" |
| liczbaDzieci | number | Liczba dzieci poniżej 18 lat | 0, 1, 2, 3+ |
| wiekDzieci | number[] | Wiek każdego dziecka | [3, 7, 15] |
| dochodMiesiecznie | number | Miesięczny dochód netto gospodarstwa (PLN) | 1500-20000 |
| dochodNaOsobe | number | Dochód netto na osobę (PLN) | oblicz: dochodMiesiecznie / liczbaOsob |
| zatrudnienie | string | Status zatrudnienia | "umowa_o_prace", "dzialalnosc", "umowa_zlecenie", "bezrobotny", "emeryt" |
| niepelnosprawnosc | string | Orzeczenie o niepełnosprawności | "brak", "lekki", "umiarkowany", "znaczny" |
| wlasnosc | string | Sytuacja mieszkaniowa | "mieszkanie", "dom", "wynajem", "rodzina" |
| wojewodztwo | string | Województwo | "mazowieckie", "malopolskie", "slaskie", "wielkopolskie", "dolnoslaskie", "inne" |
| prowadzDzialalnosc | boolean | Czy prowadzi działalność gospodarczą | true/false |
| pierwszaDzialalnosc | boolean | Czy to pierwsza działalność | true/false |
| dataDzialalnosci | string? | Data rejestracji działalności (ISO) | "2023-01-15" |
| pkd | string[]? | Kody PKD działalności | ["62.01", "73.11"] |
| ciaza | boolean? | Ciąża w gospodarstwie domowym | true/false |
| student | boolean? | Czy jest studentem | true/false |
| emeryt | boolean? | Czy jest emerytem/rencistą | true/false |
| rolnik | boolean? | Czy ubezpieczony w KRUS | true/false |
| bezrobotnyZarejestrowany | boolean? | Czy zarejestrowany w PUP | true/false |

### MatchResult -- wynik dopasowania

```typescript
{
  benefit: Benefit;
  status: "PRZYSLUGUJE"      // pewne -- spełnia kryteria
         | "MOZLIWE"         // możliwe -- część kryteriów niejasna
         | "NIE_PRZYSLUGUJE"; // nie spełnia (filtrowane, nie zwracane)
  confidence: "WYSOKA" | "SREDNIA" | "NISKA";
  matchedCriteria: string[];
  failedCriteria: string[];
  warnings: string[];
}
```

### Benefit -- świadczenie

```typescript
{
  id: string;
  nazwa: string;
  opis?: string;
  kategoria: BenefitCategory;
  kwota: string;
  kwotaMin?: number;
  kwotaMax?: number;
  czestotliwosc: string;     // "miesięcznie", "jednorazowo", "rocznie"
  wymagania: BenefitRequirements;
  wykluczenia: Exclusion[];
  wniosek: ApplicationGuide;
  zrodloUrl: string;         // oficjalny link gov.pl
  zrodloNazwa: string;
  dataWeryfikacji: string;
  dataWaznosci: string;
}
```

---

## Kategorie świadczeń (15 kategorii, 117 świadczeń)

| Kategoria | Liczba | Opis | Przykładowe świadczenia |
|-----------|--------|------|-------------------------|
| PRACA | 15 | Wsparcie zatrudnienia | Zasiłek dla bezrobotnych, szkolenia z PUP, bon na zasiedlenie |
| KRUS | 11 | Świadczenia dla rolników | Emerytura rolnicza, renta KRUS, zasiłek macierzyński KRUS |
| ZUS | 11 | Świadczenia ZUS | Zasiłek chorobowy, macierzyński, ojcowski, opiekuńczy |
| RODZINA | 10 | Świadczenia rodzinne | 800+, becikowe, rodzinny kapitał opiekuńczy |
| ZDROWIE | 10 | Opieka zdrowotna, leki | Refundacja leków, rehabilitacja NFZ, bon na okulary |
| POMOC_SPOLECZNA | 10 | Pomoc społeczna | Zasiłek stały, celowy, pomoc rzeczowa z MOPS |
| SENIOR | 8 | Świadczenia dla seniorów | 13. emerytura, 14. emerytura, bon senioralny |
| PODATKI | 8 | Ulgi podatkowe | Ulga na dziecko, ulga rehabilitacyjna, ulga termomodernizacyjna |
| EDUKACJA | 7 | Wsparcie edukacyjne | Stypendium socjalne, Erasmus+, wsparcie dla studentów |
| BIZNES | 6 | Wsparcie przedsiębiorców | Dofinansowanie z PUP, ulgi ZUS dla nowej firmy |
| EKOLOGIA | 6 | Dotacje ekologiczne | Czyste Powietrze, Mój Prąd, dofinansowanie fotowoltaiki |
| NIEPELNOSPRAWNOSC | 5 | Wsparcie osób z niepełnosprawnością | Świadczenie pielęgnacyjne, PFRON, ulga na samochód |
| MIESZKANIE | 4 | Pomoc mieszkaniowa | Dodatek mieszkaniowy, Fundusz Wsparcia Kredytobiorców |
| INNE | 4 | Pozostałe świadczenia | Karta Dużej Rodziny, Karta Polaka |
| ENERGIA | 2 | Pomoc energetyczna | Bon ciepłowniczy, bon energetyczny (zakończony) |

---

## Świadczenia dla rolników (ubezpieczeni w KRUS / ARiMR)

Profil rolnika: ustaw `rolnik: true` w UserProfile.

| ID | Nazwa | Kwota |
|----|-------|-------|
| emerytura-rolnicza | Emerytura rolnicza KRUS | 1978-2243 PLN/mies. |
| renta-rolnicza | Renta rolnicza (niezdolność do pracy) | 1978 PLN/mies. |
| zasilek-macierzynski-krus | Zasiłek macierzyński KRUS | 1000 PLN/mies. (52-71 tyg.) |
| zasilek-chorobowy-krus | Zasiłek chorobowy KRUS | 25 PLN/dzień (od 31. dnia) |
| odszkodowanie-krus | Jednorazowe odszkodowanie KRUS | 1431 PLN/1% uszczerbku |
| zasilek-opiekunczy-krus | Zasiłek opiekuńczy KRUS | 59,35 PLN/dzień (do 60 dni/rok) |
| dodatek-pielegnacyjny-krus | Dodatek pielęgnacyjny KRUS | 348,22 PLN/mies. |
| zwrot-akcyzy-paliwa-rolniczego | Zwrot akcyzy paliwa rolniczego | 1,48 PLN/litr, limit 162,80 PLN/ha |
| premia-dla-mlodego-rolnika | Premia dla młodego rolnika | 200 000-300 000 PLN jednorazowo |
| doplaty-bezposrednie-arimr | Dopłaty bezpośrednie ARiMR | ~494 PLN/ha + ekoschematy |
| doplaty-do-ubezpieczen-upraw | Dofinansowanie ubezpieczeń upraw | 65% składki ubezpieczeniowej |

---

## Kanały składania wniosków

| Kod | Znaczenie |
|-----|-----------|
| PUE_ZUS | Portal Usług Elektronicznych ZUS (zus.pl) |
| ePUAP | Elektroniczna Platforma Administracji Publicznej |
| EMPATIA | System EMPATIA (MPiPS) |
| BANK | Bank (bezpośrednio) |
| MOPS | Miejski/Gminny Ośrodek Pomocy Społecznej |
| URZAD_GMINY | Urząd Gminy / Urząd Miasta |
| POZ | Podstawowa Opieka Zdrowotna (lekarz POZ) |
| URZAD_SKARBOWY | Urząd Skarbowy |
| PUP | Powiatowy Urząd Pracy |
| PFRON | Państwowy Fundusz Rehabilitacji Osób Niepełnosprawnych |
| KRUS | Kasa Rolniczego Ubezpieczenia Społecznego |
| UCZELNIA | Uczelnia (dziekanat / biuro stypendiów) |
| WFOSIGW | Wojewódzki Fundusz Ochrony Środowiska |
| NFZ | Narodowy Fundusz Zdrowia |
| ARiMR | Agencja Restrukturyzacji i Modernizacji Rolnictwa |
| BGK | Bank Gospodarstwa Krajowego |

---

## Jak używać jako agent AI

### Scenariusz 1: Dopasowanie świadczeń do obywatela

```
1. Zbierz profil (wiek, płeć, stan cywilny, dzieci, dochód, zatrudnienie, itp.)
2. POST /api/verify z profilem
3. Podziel wyniki na PRZYSLUGUJE i MOZLIWE
4. Dla każdego: wyświetl kwotę, dokumenty, kroki i link do gov.pl
```

### Scenariusz 2: Asystowanie przy wypełnianiu wniosku ZUS

```
1. Użytkownik wybiera typ wniosku (/wnioski/zus-z15a itp.)
2. POST /api/form-assist z typem formularza i pytaniem o pole
3. AI zwraca gotową wartość pola na podstawie profilu
4. Użytkownik zatwierdza pole po polu
5. POST /api/pdf z wypełnionymi danymi -> gotowy PDF do pobrania
WAŻNE: Użytkownik pobiera i składa PDF samodzielnie. System nie wysyła wniosków.
```

### Scenariusz 3: Czat z pełnym kontekstem

```
POST /api/chat z:
- messages: historia czatu
- profile: profil użytkownika
- verifiedResults: wyniki z /api/verify

AI otrzymuje pełny kontekst i odpowiada na pytania o konkretne świadczenia.
```

### Scenariusz 4: Agent firmowy -- dotacje i monitoring

Dla agentów działających w imieniu firm: patrz **/agents.md**

---

## Przykład -- wywołanie i interpretacja

**Pytanie:** "Czy 35-letni mężczyzna z 2 dziećmi i dochodem 4000 PLN netto ma prawo do 800+?"

**Wywołanie:**
```bash
curl -X POST https://wezmezadarmo.com/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "wiek": 35, "plec": "M", "stanCywilny": "malzenstwo",
      "liczbaDzieci": 2, "wiekDzieci": [5, 10],
      "dochodMiesiecznie": 4000, "dochodNaOsobe": 1000,
      "zatrudnienie": "umowa_o_prace", "niepelnosprawnosc": "brak",
      "wlasnosc": "mieszkanie", "wojewodztwo": "mazowieckie",
      "prowadzDzialalnosc": false, "pierwszaDzialalnosc": false
    }
  }'
```

**Odpowiedź (fragment):**
```json
{
  "results": [
    {
      "benefit": {
        "id": "800-plus",
        "nazwa": "Świadczenie wychowawcze 800+",
        "kwota": "800 PLN miesięcznie na dziecko",
        "wniosek": {
          "kanal": ["PUE_ZUS", "BANK", "EMPATIA"],
          "formularz": "SW-1",
          "dokumenty": ["PESEL dziecka", "Numer konta bankowego"],
          "kroki": [
            "Zaloguj się do PUE ZUS lub aplikacji bankowej",
            "Wypełnij wniosek SW-1",
            "Dołącz numer konta bankowego",
            "Wyślij wniosek online",
            "Oczekuj na decyzję (do 30 dni)"
          ],
          "terminRealizacji": "30 dni od złożenia wniosku"
        },
        "zrodloUrl": "https://www.gov.pl/web/rodzina/800plus"
      },
      "status": "PRZYSLUGUJE",
      "confidence": "WYSOKA",
      "matchedCriteria": ["Ma dzieci poniżej 18 lat"]
    }
  ]
}
```

---

## Uwagi dla agentów

1. **Dane są orientacyjne** -- zawsze odsyłaj do oficjalnych źródeł (benefit.zrodloUrl)
2. **Brak decyzji urzędowej** -- system to narzędzie do wstępnej oceny, nie zastępcze za decyzję urzędu
3. **Dochód na osobę** -- oblicz: dochodMiesiecznie / liczba osób w gospodarstwie
4. **Progi dochodowe** -- wiele świadczeń ma progi (`wymagania.dochodMax`). Sprawdź `failedCriteria`
5. **Status MOŻLIWE** -- wymaga weryfikacji przez urząd. Nie gwarantuj przyznania
6. **Ważność danych** -- `dataWaznosci` informuje do kiedy dane są aktualne
7. **Agenci nie składają wniosków** -- system przygotowuje, człowiek zatwierdza i składa
8. **Wnioski ZUS** -- pełna lista typów: zus-z15a, zus-z15b, zus-z3, zus-pel, zus-erpo, zus-ersu, zus-zas53

---

## Mapa całego systemu

```
wezmezadarmo.com/
  /                    -- kalkulator świadczeń (117 świadczeń, dla obywateli)
  /wnioski/            -- AI-asystowane wypełnianie wniosków ZUS + PDF
  /aktualnosci/        -- monitoring RSS rządowych i branżowych (publiczny + firmowy)
  /automatyzacje/      -- AI automatyzacje dla firm (KSeF, faktury, custom workflows)
  /dotacje/            -- B2B SaaS: monitoring dofinansowań dla firm
  /dla-firm/           -- landing page dla firm i JDG
  /llm.md              -- ten plik (kalkulator świadczeń API)
  /agents.md           -- przewodnik dla agentów firmowych (dotacje, monitoring, automatyzacje)
```

---

## Prawa autorskie i licencja

Dane pochodzą z publicznych źródeł rządowych (gov.pl, zus.pl, pfron.org.pl, itd.).
Narzędzie udostępniane bezpłatnie jako projekt społeczny.
Autor: Kamil Sobkowicz | wezmezadarmo.com | 2026
