# wezmezadarmo.com -- LLM Agent Guide

> Ten plik jest przeznaczony dla agentów AI i modeli językowych.
> Opisuje bazie 117 polskich swiadczen, ulg i dotacji oraz jak z niej korzystac.
> Humans: see wezmezadarmo.com

---

## Co to jest

**wezmezadarmo.com** to niezalezne narzedzie, które przeszukuje bazie 117 polskich swiadczen socjalnych, ulg podatkowych i dotacji, dopasowuje je do profilu uzytkownika i wyswietla instrukcje krok po kroku jak zlozyc wniosek.

Dane: oficjalne zrodla rzadowe (gov.pl), zweryfikowane 2026-05-09.
Brak bazy danych uzytkownikow -- wszystko przetwarzane lokalnie lub na serwerze bez zapisu.

---

## API dla agentów AI

### POST /api/verify

Dopasowuje profile uzytkownika do bazy 117 swiadczen.

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
      "benefit": { "id": "800-plus", "nazwa": "Swiadczenie wychowawcze 800+", ... },
      "status": "PRZYSLUGUJE",
      "confidence": "WYSOKA",
      "matchedCriteria": ["Ma dzieci ponizej 18 lat"],
      "failedCriteria": [],
      "warnings": []
    }
  ],
  "aiVerified": true
}
```

### POST /api/chat

Czat z AI w kontekscie profilu i wynikow.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Jak zlozyc wniosek na 800+?" }
  ],
  "profile": { ... },
  "verifiedResults": [ ... ]
}
```

**Response:** SSE stream -- `data: {"content": "..."}` chunks, konczy sie `data: [DONE]`

---

## Schema danych

### UserProfile -- profil uzytkownika

| Pole | Typ | Opis | Przykladowe wartosci |
|------|-----|------|----------------------|
| wiek | number | Wiek w latach | 18-100 |
| plec | "K" lub "M" | Plec | "K" = kobieta, "M" = mezczyzna |
| stanCywilny | string | Stan cywilny | "wolny", "malzenstwo", "rozwiedziony", "wdowiec" |
| liczbaDzieci | number | Liczba dzieci ponizej 18 lat | 0, 1, 2, 3+ |
| wiekDzieci | number[] | Wiek kazdego dziecka | [3, 7, 15] |
| dochodMiesiecznie | number | Miesieczny dochod netto gospodarstwa (PLN) | 1500-20000 |
| dochodNaOsobe | number | Dochod netto na osobe (PLN) | oblicz: dochodMiesiecznie / liczbaOsob |
| zatrudnienie | string | Status zatrudnienia | "umowa_o_prace", "dzialalnosc", "umowa_zlecenie", "bezrobotny", "emeryt" |
| niepelnosprawnosc | string | Orzeczenie o niepelnosprawnosci | "brak", "lekki", "umiarkowany", "znaczny" |
| wlasnosc | string | Sytuacja mieszkaniowa | "mieszkanie", "dom", "wynajem", "rodzina" |
| wojewodztwo | string | Wojewodztwo | "mazowieckie", "malopolskie", "slaskie", "wielkopolskie", "dolnoslaskie", "inne" |
| prowadzDzialalnosc | boolean | Czy prowadzi dzialalnosc gospodarcza | true/false |
| pierwszaDzialalnosc | boolean | Czy to pierwsza dzialalnosc | true/false |
| dataDzialalnosci | string? | Data rejestracji dzialalnosci (ISO) | "2023-01-15" |
| pkd | string[]? | Kody PKD dzialalnosci | ["62.01", "73.11"] |
| ciaza | boolean? | Ciaza w gospodarstwie domowym | true/false |
| student | boolean? | Czy jest studentem | true/false |
| emeryt | boolean? | Czy jest emerytem/rencista | true/false |
| rolnik | boolean? | Czy ubezpieczony w KRUS | true/false |
| bezrobotnyZarejestrowany | boolean? | Czy zarejestrowany w PUP | true/false |

### MatchResult -- wynik dopasowania

```typescript
{
  benefit: Benefit;          // pelne dane swiadczenia
  status: "PRZYSLUGUJE"     // pewne -- spelnia kryteria
         | "MOZLIWE"        // mozliwe -- czesc kryteriow niejasna
         | "NIE_PRZYSLUGUJE"; // nie spelnia (filtrowane, nie zwracane)
  confidence: "WYSOKA" | "SREDNIA" | "NISKA";
  matchedCriteria: string[]; // ktore kryteria pasuja
  failedCriteria: string[];  // ktore nie pasuja
  warnings: string[];        // ostrzezenia do sprawdzenia
}
```

### Benefit -- swiadczenie

```typescript
{
  id: string;               // unikalny identyfikator, np. "800-plus"
  nazwa: string;            // nazwa, np. "Swiadczenie wychowawcze 800+"
  opis?: string;            // opis
  kategoria: BenefitCategory;
  kwota: string;            // kwota w PLN jako string, np. "800 PLN miesieczne na dziecko"
  kwotaMin?: number;        // minimalna kwota (liczba)
  kwotaMax?: number;        // maksymalna kwota (liczba)
  czestotliwosc: string;    // "miesieczne", "jednorazowo", "roczne"
  wymagania: BenefitRequirements;
  wykluczenia: Exclusion[];
  wniosek: ApplicationGuide;
  zrodloUrl: string;        // oficjalny link gov.pl
  zrodloNazwa: string;      // nazwa zrodla
  dataWeryfikacji: string;  // data ostatniej weryfikacji
  dataWaznosci: string;     // data waznosci danych
}
```

---

## Kategorie swiadczen (13 kategorii, 118 swiadczen)

| Kategoria | Opis | Przykladowe swiadczenia |
|-----------|------|-------------------------|
| RODZINA | Swiadczenia rodzinne | 800+, becikowe, rodzinny kapital opiekunczy |
| ZDROWIE | Opieka zdrowotna, leki | Refundacja lekow, rehabilitacja NFZ, bon na okulary, zasilek opiekunczy KRUS |
| PODATKI | Ulgi podatkowe | Ulga na dziecko, ulga rehabilitacyjna, ulga termomodernizacyjna |
| BIZNES | Wsparcie przedsiebiorcow | Dofinansowanie z PUP, ulgi ZUS dla nowej firmy, tarczowy |
| MIESZKANIE | Pomoc mieszkaniowa | Dodatek mieszkaniowy, dofinansowanie z funduszu remontowego, Fundusz Wsparcia Kredytobiorcow |
| NIEPELNOSPRAWNOSC | Wsparcie osob z niepelnosprawnoscia | Swiadczenie pielegnacyjne, PFRON, ulga na samochod |
| ENERGIA | Pomoc energetyczna | Bon energetyczny, dodatek weglowy, dofinansowanie OZE |
| ZUS | Swiadczenia ZUS | Zasilek chorobowy, macierzynski, ojcowski, opiekunczy |
| PRACA | Wsparcie dla bezrobotnych i rolnikow | Zasilek dla bezrobotnych, szkolenia z PUP, staz, doplaty bezposrednie ARiMR, zwrot akcyzy paliwa, premia dla mlodego rolnika |
| EDUKACJA | Wsparcie edukacyjne | Stypendium socjalne, Erasmus+, wparcie dla studentow |
| SENIOR | Swiadczenia dla seniorow | 13. emerytura, 14. emerytura, senior+, opieka dlugoterminowa, bon senioralny, dodatek pielegnacyjny KRUS |
| POMOC_SPOLECZNA | Pomoc spoleczna | Zasilek staly, celowy, pomoc rzeczowa z MOPS, opieka wytchnieniowa |
| EKOLOGIA | Dotacje ekologiczne | Czyste Powietrze, Moj Prad, dofinansowanie fotowoltaiki |

### Swiadczenia dla rolnikow (ubezpieczeni w KRUS / ARiMR)

Profil rolnika: ustaw `rolnik: true` w UserProfile. Zwroci swiadczenia KRUS, doplaty ARiMR i inne.

| ID | Nazwa | Kwota |
|----|-------|-------|
| emerytura-rolnicza | Emerytura rolnicza KRUS | 1978-2243 PLN/mies. |
| renta-rolnicza | Renta rolnicza (niezdolnosc do pracy) | 1978 PLN/mies. |
| zasilek-macierzynski-krus | Zasilek macierzynski KRUS | 1000 PLN/mies. (52-71 tyg.) |
| zasilek-chorobowy-krus | Zasilek chorobowy KRUS | 25 PLN/dzien (od 31. dnia) |
| odszkodowanie-krus | Jednorazowe odszkodowanie KRUS | 1431 PLN/1% uszczerbku |
| zasilek-opiekunczy-krus | Zasilek opiekunczy KRUS | 59,35 PLN/dzien (do 60 dni/rok) |
| dodatek-pielegnacyjny-krus | Dodatek pielegnacyjny KRUS | 348,22 PLN/mies. (auto dla 75+) |
| zwrot-akcyzy-paliwa-rolniczego | Zwrot akcyzy paliwa rolniczego | 1,48 PLN/litr, limit 162,80 PLN/ha |
| premia-dla-mlodego-rolnika | Premia dla mlodego rolnika | 200 000-300 000 PLN jednorazowo |
| doplaty-bezposrednie-arimr | Doplaty bezposrednie ARiMR | ~494 PLN/ha + ekoschematy |
| doplaty-do-ubezpieczen-upraw | Dofinansowanie ubezpieczen upraw | 65% skladki ubezpieczeniowej |

---

## Kanaly skladania wnioskow

| Kod | Znaczenie |
|-----|-----------|
| PUE_ZUS | Portal Uslug Elektronicznych ZUS (zus.pl) |
| ePUAP | Elektroniczna Platforma Administracji Publicznej |
| EMPATIA | System EMPATIA (MPiPS) |
| BANK | Bank (bezposrednio) |
| MOPS | Miejski/Gminny Osrodek Pomocy Spolecznej |
| URZAD_GMINY | Urzad Gminy / Urzad Miasta |
| POZ | Podstawowa Opieka Zdrowotna (lekarz POZ) |
| URZAD_SKARBOWY | Urzad Skarbowy |
| PUP | Powiatowy Urzad Pracy |
| PFRON | Panstwowy Fundusz Rehabilitacji Osob Niepelnosprawnych |
| KRUS | Kasa Rolniczego Ubezpieczenia Spolecznego |
| UCZELNIA | Uczelnia (dziekanat / biuro stypendiow) |
| WFOSIGW | Wojewodzki Fundusz Ochrony Srodowiska |
| NFZ | Narodowy Fundusz Zdrowia |
| ONLINE | Online (dedykowana strona ministerstwa) |
| ARiMR | Agencja Restrukturyzacji i Modernizacji Rolnictwa (eWniosekPlus) |
| BGK | Bank Gospodarstwa Krajowego |

---

## Jak uzywac jako agent AI

### Scenariusz 1: Dopasowanie swiadczen do uzytkownika

```
1. Zbierz profil uzytkownika (wiek, plec, stan cywilny, dzieci, dochod, zatrudnienie, itp.)
2. POST /api/verify z profilem
3. Otrzymasz liste dopasowanych swiadczen z instrukcjami
4. Przedstaw wyniki uzytkownikowi z podzialem na PEWNE / MOZLIWE
5. Dla kazdego swiadczenia: wyswietl kwote, dokumenty, kroki i link do gov.pl
```

### Scenariusz 2: Odpowiadanie na pytania o konkretne swiadczenie

```
1. Znajdz swiadczenie po ID lub nazwie w wynikach /api/verify
2. Uzyj danych z pola `wniosek` aby odpowiedziec:
   - wniosek.dokumenty -- co potrzeba
   - wniosek.kroki -- jak zlozyc
   - wniosek.kanal -- gdzie zlozyc
   - wniosek.terminRealizacji -- kiedy dostaniesz
   - wniosek.pulapki -- na co uwazac
   - wniosek.odwolanie -- co jesli odmowia
3. Podaj link do zrodla: benefit.zrodloUrl
```

### Scenariusz 3: Czat z pelnym kontekstem (przez /api/chat)

```
POST /api/chat z:
- messages: historia czatu
- profile: profil uzytkownika
- verifiedResults: wyniki z /api/verify

AI otrzymuje pelny kontekst i moze odpowiadac na pytania o konkretne swiadczenia.
```

---

## Przyklad -- wywolanie i interpretacja

**Pytanie:** "Czy 35-letnia mezczyzna z 2 dziecmi i dochodem 4000 PLN netto ma prawo do 800+?"

**Wywolanie:**
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

**Odpowiedz (fragment):**
```json
{
  "results": [
    {
      "benefit": {
        "id": "800-plus",
        "nazwa": "Swiadczenie wychowawcze 800+",
        "kwota": "800 PLN miesieczne na dziecko",
        "kwotaMin": 800,
        "wniosek": {
          "kanal": ["PUE_ZUS", "BANK", "EMPATIA"],
          "formularz": "SW-1",
          "dokumenty": ["PESEL dziecka", "Numer konta bankowego"],
          "kroki": [
            "Zaloguj sie do PUE ZUS lub aplikacji bankowej",
            "Wypelnij wniosek SW-1",
            "Dolacz numer konta bankowego",
            "Wyslij wniosek online",
            "Oczekuj na decyzje (do 30 dni)"
          ],
          "terminRealizacji": "30 dni od zlozenia wniosku",
          "pulapki": ["Swiadczenie nie jest opodatkowane", "Mozna pobierac rownoczesnie dla kazdego dziecka"],
          "odwolanie": "Odwolanie do Prezesa ZUS w ciagu 14 dni od decyzji"
        },
        "zrodloUrl": "https://www.gov.pl/web/rodzina/800plus",
        "zrodloNazwa": "Ministerstwo Rodziny"
      },
      "status": "PRZYSLUGUJE",
      "confidence": "WYSOKA",
      "matchedCriteria": ["Ma dzieci ponizej 18 lat"]
    }
  ]
}
```

**Interpretacja dla uzytkownika:**
```
Tak, przysluguje Ci 800+ na kazde dziecko (lacznie 1600 PLN/mies.).
Aby zlozyc wniosek:
1. Zaloguj sie do PUE ZUS (zus.pl) lub aplikacji bankowej
2. Wypelnij formularz SW-1
3. Podaj numer konta bankowego
Decyzja w ciagu 30 dni. Zrodlo: gov.pl/web/rodzina/800plus
```

---

## Uwagi dla agentow

1. **Dane sa orientacyjne** -- zawsze odsylaj do oficjalnych zrodel (benefit.zrodloUrl)
2. **Brak decyzji urzedowej** -- system to narzedzie do wstepnej oceny, nie zastepcze za decyzje urzedu
3. **Dochod na osobe** -- przy obliczaniu: (dochodMiesiecznie / liczbaOsob w gospodarstwie)
4. **Progi dochodowe** -- wiele swiadczen ma progi dochodowe (`wymagania.dochodMax`). Sprawdz pole `failedCriteria` w wyniku
5. **Status MOZLIWE** -- oznacza ze nie mozna jednoznacznie ocenic na podstawie danych. Wymaga weryfikacji przez urzad
6. **Waznosc danych** -- `dataWaznosci` to data do kiedy dane sa aktualne. Sprawdz przed udzieleniem informacji

---

## Prawa autorskie i licencja

Dane pochodzi z publicznych zrodel rzadowych (gov.pl, zus.pl, pfron.org.pl, itd.).
Narzedzie udostepniane bezplatnie jako projekt spoleczny.
Autor: Kamil Sobkowicz | wezmezadarmo.com | 2026
