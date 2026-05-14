# wezmezadarmo.com -- LLM Agent Guide

> Ten plik jest przeznaczony dla agentów AI i modeli językowych.
> Opisuje bazę 117 polskich świadczeń, ulg i dotacji oraz jak z niej korzystać.
> Humans: see wezmezadarmo.com

---

## Co to jest

**wezmezadarmo.com** to niezależne narzędzie, które przeszukuje bazę 117 polskich świadczeń socjalnych, ulg podatkowych i dotacji, dopasowuje je do profilu użytkownika i wyświetla instrukcje krok po kroku jak złożyć wniosek.

Dane: oficjalne źródła rządowe (gov.pl), zweryfikowane 2026-05-09.
Brak bazy danych użytkowników -- wszystko przetwarzane lokalnie lub na serwerze bez zapisu.

---

## API dla agentów AI

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
      "benefit": { "id": "800-plus", "nazwa": "Świadczenie wychowawcze 800+", ... },
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

Czat z AI w kontekście profilu i wyników.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Jak złożyć wniosek na 800+?" }
  ],
  "profile": { ... },
  "verifiedResults": [ ... ]
}
```

**Response:** SSE stream -- `data: {"content": "..."}` chunks, kończy się `data: [DONE]`

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
  benefit: Benefit;          // pełne dane świadczenia
  status: "PRZYSLUGUJE"     // pewne -- spełnia kryteria
         | "MOZLIWE"        // możliwe -- część kryteriów niejasna
         | "NIE_PRZYSLUGUJE"; // nie spełnia (filtrowane, nie zwracane)
  confidence: "WYSOKA" | "SREDNIA" | "NISKA";
  matchedCriteria: string[]; // które kryteria pasują
  failedCriteria: string[];  // które nie pasują
  warnings: string[];        // ostrzeżenia do sprawdzenia
}
```

### Benefit -- świadczenie

```typescript
{
  id: string;               // unikalny identyfikator, np. "800-plus"
  nazwa: string;            // nazwa, np. "Świadczenie wychowawcze 800+"
  opis?: string;            // opis
  kategoria: BenefitCategory;
  kwota: string;            // kwota w PLN jako string, np. "800 PLN miesięcznie na dziecko"
  kwotaMin?: number;        // minimalna kwota (liczba)
  kwotaMax?: number;        // maksymalna kwota (liczba)
  czestotliwosc: string;    // "miesięcznie", "jednorazowo", "rocznie"
  wymagania: BenefitRequirements;
  wykluczenia: Exclusion[];
  wniosek: ApplicationGuide;
  zrodloUrl: string;        // oficjalny link gov.pl
  zrodloNazwa: string;      // nazwa źródła
  dataWeryfikacji: string;  // data ostatniej weryfikacji
  dataWaznosci: string;     // data ważności danych
}
```

---

## Kategorie świadczeń (13 kategorii, 117 świadczeń)

| Kategoria | Opis | Przykładowe świadczenia |
|-----------|------|-------------------------|
| RODZINA | Świadczenia rodzinne | 800+, becikowe, rodzinny kapitał opiekuńczy |
| ZDROWIE | Opieka zdrowotna, leki | Refundacja leków, rehabilitacja NFZ, bon na okulary, zasiłek opiekuńczy KRUS |
| PODATKI | Ulgi podatkowe | Ulga na dziecko, ulga rehabilitacyjna, ulga termomodernizacyjna |
| BIZNES | Wsparcie przedsiębiorców | Dofinansowanie z PUP, ulgi ZUS dla nowej firmy, tarczowy |
| MIESZKANIE | Pomoc mieszkaniowa | Dodatek mieszkaniowy, dofinansowanie z funduszu remontowego, Fundusz Wsparcia Kredytobiorców |
| NIEPELNOSPRAWNOSC | Wsparcie osób z niepełnosprawnością | Świadczenie pielęgnacyjne, PFRON, ulga na samochód |
| ENERGIA | Pomoc energetyczna | Bon energetyczny, dodatek węglowy, dofinansowanie OZE |
| ZUS | Świadczenia ZUS | Zasiłek chorobowy, macierzyński, ojcowski, opiekuńczy |
| PRACA | Wsparcie dla bezrobotnych i rolników | Zasiłek dla bezrobotnych, szkolenia z PUP, staż, dopłaty bezpośrednie ARiMR, zwrot akcyzy paliwa, premia dla młodego rolnika |
| EDUKACJA | Wsparcie edukacyjne | Stypendium socjalne, Erasmus+, wsparcie dla studentów |
| SENIOR | Świadczenia dla seniorów | 13. emerytura, 14. emerytura, senior+, opieka długoterminowa, bon senioralny, dodatek pielęgnacyjny KRUS |
| POMOC_SPOLECZNA | Pomoc społeczna | Zasiłek stały, celowy, pomoc rzeczowa z MOPS, opieka wytchnieniowa |
| EKOLOGIA | Dotacje ekologiczne | Czyste Powietrze, Mój Prąd, dofinansowanie fotowoltaiki |

### Świadczenia dla rolników (ubezpieczeni w KRUS / ARiMR)

Profil rolnika: ustaw `rolnik: true` w UserProfile. Zwróci świadczenia KRUS, dopłaty ARiMR i inne.

| ID | Nazwa | Kwota |
|----|-------|-------|
| emerytura-rolnicza | Emerytura rolnicza KRUS | 1978-2243 PLN/mies. |
| renta-rolnicza | Renta rolnicza (niezdolność do pracy) | 1978 PLN/mies. |
| zasilek-macierzynski-krus | Zasiłek macierzyński KRUS | 1000 PLN/mies. (52-71 tyg.) |
| zasilek-chorobowy-krus | Zasiłek chorobowy KRUS | 25 PLN/dzień (od 31. dnia) |
| odszkodowanie-krus | Jednorazowe odszkodowanie KRUS | 1431 PLN/1% uszczerbku |
| zasilek-opiekunczy-krus | Zasiłek opiekuńczy KRUS | 59,35 PLN/dzień (do 60 dni/rok) |
| dodatek-pielegnacyjny-krus | Dodatek pielęgnacyjny KRUS | 348,22 PLN/mies. (auto dla 75+) |
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
| ONLINE | Online (dedykowana strona ministerstwa) |
| ARiMR | Agencja Restrukturyzacji i Modernizacji Rolnictwa (eWniosekPlus) |
| BGK | Bank Gospodarstwa Krajowego |

---

## Jak używać jako agent AI

### Scenariusz 1: Dopasowanie świadczeń do użytkownika

```
1. Zbierz profil użytkownika (wiek, płeć, stan cywilny, dzieci, dochód, zatrudnienie, itp.)
2. POST /api/verify z profilem
3. Otrzymasz listę dopasowanych świadczeń z instrukcjami
4. Przedstaw wyniki użytkownikowi z podziałem na PEWNE / MOŻLIWE
5. Dla każdego świadczenia: wyświetl kwotę, dokumenty, kroki i link do gov.pl
```

### Scenariusz 2: Odpowiadanie na pytania o konkretne świadczenie

```
1. Znajdź świadczenie po ID lub nazwie w wynikach /api/verify
2. Użyj danych z pola `wniosek` aby odpowiedzieć:
   - wniosek.dokumenty -- co potrzeba
   - wniosek.kroki -- jak złożyć
   - wniosek.kanal -- gdzie złożyć
   - wniosek.terminRealizacji -- kiedy dostaniesz
   - wniosek.pulapki -- na co uważać
   - wniosek.odwolanie -- co jeśli odmówią
3. Podaj link do źródła: benefit.zrodloUrl
```

### Scenariusz 3: Czat z pełnym kontekstem (przez /api/chat)

```
POST /api/chat z:
- messages: historia czatu
- profile: profil użytkownika
- verifiedResults: wyniki z /api/verify

AI otrzymuje pełny kontekst i może odpowiadać na pytania o konkretne świadczenia.
```

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
        "kwotaMin": 800,
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
          "terminRealizacji": "30 dni od złożenia wniosku",
          "pulapki": ["Świadczenie nie jest opodatkowane", "Można pobierać równocześnie dla każdego dziecka"],
          "odwolanie": "Odwołanie do Prezesa ZUS w ciągu 14 dni od decyzji"
        },
        "zrodloUrl": "https://www.gov.pl/web/rodzina/800plus",
        "zrodloNazwa": "Ministerstwo Rodziny"
      },
      "status": "PRZYSLUGUJE",
      "confidence": "WYSOKA",
      "matchedCriteria": ["Ma dzieci poniżej 18 lat"]
    }
  ]
}
```

**Interpretacja dla użytkownika:**
```
Tak, przysługuje Ci 800+ na każde dziecko (łącznie 1600 PLN/mies.).
Aby złożyć wniosek:
1. Zaloguj się do PUE ZUS (zus.pl) lub aplikacji bankowej
2. Wypełnij formularz SW-1
3. Podaj numer konta bankowego
Decyzja w ciągu 30 dni. Źródło: gov.pl/web/rodzina/800plus
```

---

## Uwagi dla agentów

1. **Dane są orientacyjne** -- zawsze odsyłaj do oficjalnych źródeł (benefit.zrodloUrl)
2. **Brak decyzji urzędowej** -- system to narzędzie do wstępnej oceny, nie zastępcze za decyzję urzędu
3. **Dochód na osobę** -- przy obliczaniu: (dochodMiesiecznie / liczbaOsob w gospodarstwie)
4. **Progi dochodowe** -- wiele świadczeń ma progi dochodowe (`wymagania.dochodMax`). Sprawdź pole `failedCriteria` w wyniku
5. **Status MOŻLIWE** -- oznacza że nie można jednoznacznie ocenić na podstawie danych. Wymaga weryfikacji przez urząd
6. **Ważność danych** -- `dataWaznosci` to data do kiedy dane są aktualne. Sprawdź przed udzieleniem informacji

---

## Prawa autorskie i licencja

Dane pochodzą z publicznych źródeł rządowych (gov.pl, zus.pl, pfron.org.pl, itd.).
Narzędzie udostępniane bezpłatnie jako projekt społeczny.
Autor: Kamil Sobkowicz | wezmezadarmo.com | 2026
