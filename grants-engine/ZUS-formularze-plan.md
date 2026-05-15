# Plan: Formularze ZUS do dodania w /wnioski

ZUS blokuje automaty -- wszystkie PDFy trzeba pobrac recznie z:
https://www.zus.pl/wzory-formularzy

Ponizej lista priorytetowa: ktore formularze dodac, dlaczego, i jakie dane profilu
z WezmeZadarmo sa juz gotowe do auto-wypelnienia.

---

## PRIORYET 1 -- Formularze dla najczestszych uzytkownikow WezmeZadarmo

### 1. EMP -- Wniosek o emeryture

Kto sklada: osoby osiagajace wiek emerytalny (K: 60 lat, M: 65 lat)
Potencjal: duzy -- kazdy emeryt przez to przechodzi
Dane z profilu WezmeZadarmo ktore znamy: wiek, plec, forma zatrudnienia, emeryt: true
Co trzeba dobrac od uzytkownika: okresy skladkowe, historia zatrudnienia, dane osobowe

Pobierz: https://www.zus.pl/wzory-formularzy -> szukaj "EMP"
Rozmiar formularza: ok. 8 stron

Pola do auto-wypelnienia przez AI:
- Czesc I: dane wnioskodawcy (imie, PESEL, adres)
- Czesc II: rodzaj swiadczenia (emerytura / emerytura czescisciowa)
- Czesc III: okresy zatrudnienia -- AI moze podsunac format, user wypelnia daty
- Czesc IV: konto bankowe

Trudnosc implementacji: WYSOKA (wymaga historii skladkowej -- nie mamy tego)
Rozwiazanie: wizard pyta o okresy zatrudnienia rok po roku

---

### 2. Z-15a -- Wniosek o zasilek opiekunczy (opieka nad dzieckiem)

Kto sklada: rodzic/opiekun ktory nie moze pracowac bo dziecko chore lub zlobek zamkniety
Potencjal: bardzo duzy -- tysiace przypadkow rocznie
Dane z profilu ktore znamy: liczba dzieci, wiek dzieci, forma zatrudnienia

Pobierz: https://www.zus.pl/wzory-formularzy -> "Z-15a"
Rozmiar: 2 strony

Pola do auto-wypelnienia:
- Dane wnioskodawcy (imie, PESEL)
- Dane dziecka (imie, PESEL, wiek)
- Powod (choroba dziecka / zamkniecie placowki / inne)
- Okres opieki (daty od-do)
- Dane pracodawcy

Trudnosc implementacji: NISKA -- prosty formularz, mamy juz dane o dzieciach
PRIORYTET: dodac jako DRUGI po NLnet

---

### 3. Z-15b -- Wniosek o zasilek opiekunczy (chory czlonek rodziny)

Kto sklada: opiekun chorego czlonka rodziny powyzej 14 lat
Potencjal: sredni
Dane z profilu: stan cywilny, wiek (jesli opiekuje sie rodzicem)

Pobierz: https://www.zus.pl/wzory-formularzy -> "Z-15b"
Rozmiar: 2 strony -- prawie identyczny z Z-15a

Trudnosc: NISKA -- zrob razem z Z-15a

---

### 4. ESUN -- Swiadczenie uzupelniajace dla osob niezdolnych do samodzielnej egzystencji

Kto sklada: osoby z niepelnosprawnoscia powyzej 75%, niezdolne do samodzielnego zycia
Potencjal: duzy -- swiadczenie 500-1588 PLN/mies, wiele osob nie wie
Dane z profilu: niepelnosprawnosc (znaczny stopien), wiek

Pobierz: https://www.zus.pl/wzory-formularzy -> "ESUN"
Rozmiar: 4 strony

Pola do auto-wypelnienia:
- Dane osobowe wnioskodawcy
- Rodzaj orzeczenia o niepelnosprawnosci (user podaje)
- Informacja o dochodach (mamy z profilu)

Trudnosc: SREDNIA -- wymaga orzeczenia lekarskiego jako zalacznik

---

### 5. ZAS-53 -- Wniosek o zasilek chorobowy

Kto sklada: pracownik na L4, ktory nie dostaje zwolnienia przez pracodawce
Potencjal: sredni
Dane z profilu: forma zatrudnienia (pracownik etatowy)

Pobierz: https://www.zus.pl/wzory-formularzy -> "ZAS-53"
Rozmiar: 2 strony

Trudnosc: NISKA

---

### 6. ERSU -- Rodzicielskie swiadczenie uzupelniajace (Mama 4+ / Tata 4+)

Kto sklada: rodzic 4+ dzieci bez emerytury lub z emerytura ponizej minimum
Potencjal: sredni -- specyficzna grupa ale swiadczenie wazne
Dane z profilu: liczba dzieci, wiek, emeryt

Pobierz: https://www.zus.pl/wzory-formularzy -> "ERSU"
Rozmiar: 3 strony

Trudnosc: SREDNIA

---

## PRIORYTET 2 -- Formularze dodatkowe

### 7. ERN -- Wniosek o rente z tytulu niezdolnosci do pracy

Kto sklada: osoba ktora stala sie niezdolna do pracy w wyniku choroby lub wypadku
Dane z profilu: niepelnosprawnosc, forma zatrudnienia, wiek

Pobierz: https://www.zus.pl/wzory-formularzy -> "ERN"

---

### 8. ERP-6 -- Informacja o okresach skladkowych i nieskładkowych

To nie jest wniosek o swiadczenie -- to formularz pomocniczy do EMP (emerytury).
Uzytkownik lisuje okresy pracy, studiow, wychowywania dzieci.

Priorytet: dodac razem z EMP jako zalacznik

---

### 9. RWN -- Wniosek o zaswiadczenie o niezaleganiu ze skladkami

Uzywany przez przedsiebiorcy przy ubieganiu sie o granty i kredyty.
Potencjal: B2B -- nasi klienci API to firmy, ktore moga potrzebowac tego dla swoich uzytkownikow

---

## CO ROBIC

### Krok 1: Pobierz formularze recznie (30 minut)

Wejdz na: https://www.zus.pl/wzory-formularzy
Pobierz PDFy:
- Z-15a
- Z-15b
- ZAS-53
- ESUN
- EMP
- ERSU

Wgraj do: /grants-engine/forms/ZUS/

### Krok 2: Przeanalizuj pola w kazdym PDF (2-3 godziny)

Dla kazdego formularza: wypis wszystkich pol w pliku YAML:
```yaml
formularz: Z-15a
pola:
  - id: imie
    label: "Imie i nazwisko"
    typ: text
    zrodlo_profilu: null  # user podaje
  - id: pesel
    label: "PESEL"
    typ: text
    zrodlo_profilu: null  # user podaje, nigdy nie przechowujemy
  - id: liczba_dzieci
    label: "Liczba dzieci objętych opieką"
    typ: number
    zrodlo_profilu: liczbaDzieci  # mamy z profilu WezmeZadarmo
```

### Krok 3: Dodaj do /wnioski (programowanie)

Dla kazdego formularza ZUS:
1. Dodaj karte na /wnioski/page.tsx (odblokuj z "wkrotce")
2. Stworz /wnioski/zus-[nazwaformularza]/page.tsx
3. Dodaj field prompts do /api/form-assist/route.ts
4. Zakoduj logike auto-wypelnienia z profilu WezmeZadarmo

### Krok 4: Testuj z prawdziwym uzytkownikiem

Znajdz 2-3 osoby ktore niedawno skladaly wniosek ZUS.
Przejdz z nimi przez wizard.
Popraw to co jest niejasne.

---

## PRIORYTET -- kolejnosc implementacji

1. Z-15a + Z-15b (proste, duzo uzytkownikow, dane juz mamy)
2. ZAS-53 (prosta)
3. ESUN (srednia, wazna dla niepelnosprawnych)
4. EMP + ERP-6 (trudna, ale najwazniejsza dla seniorow)
5. ERSU (srednia)
6. ERN (trudna, zostawic na koniec)

---

## WAZNA UWAGA PRAWNA

ZUS formularze musza byc finalnie podpisane przez uzytkownika profilem zaufanym
lub tradycyjnie (podpis odreczny + skan lub osobiscie w ZUS).

Wizard moze:
- Wypelnic tresc pol
- Wygenerowac PDF do wydruku
- Dac instrukcje gdzie zaniesc lub jak wyslac przez ePUAP

Wizard NIE moze:
- Podpisac wniosku za uzytkownika
- Wyslac wniosku do ZUS w imieniu uzytkownika
- Gwarantowac ze wniosek zostanie przyjety

To jest zgodne z tym co juz mamy w regulaminie (sekcja 3a.5).
