WIEDZA O SYSTEMIE NFZ I ZDROWIU (stan: maj 2026):

=== NFZ (NARODOWY FUNDUSZ ZDROWIA) ===

Portal: zip.nfz.gov.pl (Zintegrowany Informator Pacjenta)
Infolinia NFZ: 800 190 590 (bezpłatna)

Rodzaje świadczeń NFZ:
- POZ (Podstawowa Opieka Zdrowotna) -- lekarz rodzinny, pielęgniarka, położna. Bez skierowania.
- AOS (Ambulatoryjna Opieka Specjalistyczna) -- specjaliści, wymaga skierowania z POZ (z wyjątkami: psychiatra, ginekolog, onkolog, dermatolog, stomatolog -- bez skierowania)
- Leczenie szpitalne -- wymaga skierowania (z wyjątkiem SOR)
- Rehabilitacja -- wymaga skierowania i orzeczenia

REFUNDACJA LEKÓW:
- Bezpłatne dla dzieci do 18 lat (lista B) -- od 2017
- Bezpłatne dla kobiet w ciąży (lista W) -- od 2017
- Bezpłatne dla seniorów 75+ (lista S) -- od 2016
- Dla pozostałych: dopłata ryczałtowa (3,20 PLN), 30% lub 50% ceny limitu
- Lista refundacyjna aktualizowana co 3 miesiące
- e-recepta: wystawiana przez lekarzy POZ i specjalistów NFZ

KOLEJKI DO SPECJALISTÓW:
- Tryb stabilny -- standardowe oczekiwanie
- Tryb pilny -- wymaga adnotacji lekarza «pilne» lub «przypadek pilny»
- Dane kolejek: api.nfz.gov.pl (oficjalne, live)
- Wyszukiwarka: /nfz (filtruj po województwie, specjalności, trybie)

ORIENTACYJNE CZASY OCZEKIWANIA (dane przybliżone, wg statystyk NFZ -- zawsze zaznacz że mogą się różnić):
Podawaj gdy brak danych live. Zawsze zaznacz "orientacyjnie" i odeślij do /nfz po aktualne dane.

Specjalność              | Stabilny          | Pilny
-------------------------|-------------------|----------------
Kardiolog                | 2-5 miesięcy      | 1-3 tygodnie
Endokrynolog             | 3-8 miesięcy      | 2-4 tygodnie
Ortopeda                 | 2-6 miesięcy      | 1-3 tygodnie
Neurolog                 | 2-5 miesięcy      | 1-3 tygodnie
Dermatolog               | 1-4 miesiące      | 1-2 tygodnie
Okulista                 | 1-3 miesiące      | 1-2 tygodnie
Urolog                   | 2-5 miesięcy      | 1-3 tygodnie
Gastrolog/gastroenterolog| 2-6 miesięcy      | 2-4 tygodnie
Psychiatra               | 1-4 miesiące      | 1-2 tygodnie
Ginekolog                | 2-8 tygodni       | kilka dni
Reumatolog               | 3-9 miesięcy      | 2-4 tygodnie
Pulmonolog               | 2-6 miesięcy      | 1-3 tygodnie
Onkolog                  | 2-6 tygodni       | tydzień lub mniej

Uwaga: woj. lubelskie, podkarpackie, świętokrzyskie -- czasy powyżej średniej krajowej.
Woj. mazowieckie (poza Warszawą) -- silne zróżnicowanie między powiatami.

ŚWIADCZENIA ZDROWOTNE W BAZIE (kategoria ZDROWIE):
- Refundacja leków (ogólna zasada -- j.w.)
- Fizjoterapia / rehabilitacja ambulatoryjna
- Rehabilitacja dzienna / lecznicza
- Turnusy rehabilitacyjne (PFRON + NFZ)
- Fundusz Kompensacyjny Zdarzeń Medycznych
- Dofinansowanie aparatów słuchowych (PFRON)
- Dofinansowanie protez i wózków (PFRON)
- Badania przesiewowe (noworodek, mammografia, cytologia, kolonoskopia)

SZCZEPIENIA (wybrane, refundowane NFZ):
- Dzieci wg Programu Szczepień Ochronnych -- bezpłatne
- Seniorzy 65+: grypa, pneumokoki -- refundowane
- Ciąża: krztusiec (whooping cough) -- refundowany

=== JAKOŚĆ POWIETRZA (GIOŚ) ===

Live API: api.gios.gov.pl
Dostęp w platformie: /centrum-obywatela/powietrze
Backend: /api/public/gios?lat=&lon= (30 req/min/IP)

Wskaźniki:
- PM10 -- pył zawieszony (cząstki do 10 mikrometrów). Szkodliwy przy > 50 µg/m3 (norma dobowa WHO)
- PM2.5 -- pył drobny (do 2,5 µm). Norma WHO: 15 µg/m3 dobowo. Penetruje głęboko do płuc.
- SO2 -- dwutlenek siarki. Norma dobowa: 125 µg/m3
- NO2 -- dwutlenek azotu. Norma roczna: 40 µg/m3
- O3 -- ozon. Norma 8h: 120 µg/m3

Grupy ryzyka wymagające szczególnej uwagi:
- Dzieci i niemowlęta
- Osoby z astmą i alergiami
- Pacjenci z POChP (Przewlekła Obturacyjna Choroba Płuc)
- Kobiety w ciąży
- Seniorzy 65+
- Osoby z chorobami sercowo-naczyniowymi

Powiązanie ze świadczeniami:
- Czyste Powietrze (dofinansowanie wymiany kopciucha) -- warto cytować dane GIOŚ przy pytaniach o program
- Dofinansowanie oczyszczacza powietrza (PFRON dla osób z niepełnosprawnością)
- Astma i alergia -- wskazówka do sprawdzenia PM10/PM2.5 przed wyjściem

=== PROCEDURY NFZ KROK PO KROKU ===

JAK WYBRAĆ/ZMIENIĆ LEKARZA POZ (lekarza rodzinnego):
  1. Wejdź na zip.nfz.gov.pl lub udaj się do wybranej przychodni
  2. Sprawdź czy przychodnia ma kontrakt z NFZ (na stronie NFZ lub telefonicznie)
  3. Wypełnij "Deklarację wyboru lekarza POZ" (formularz w przychodni lub online przez IKP)
  4. Podpisz -- przychodzi w życie od razu
  5. Możesz zmienić lekarza max 2 razy w roku bezpłatnie (3. zmiana = opłata 80 PLN)
  IKP (Internetowe Konto Pacjenta): ikp.gov.pl -- tu widzisz wybory POZ, historię wizyt, e-recepty

JAK ZAPISAĆ SIĘ DO SPECJALISTY:
  1. Idź do lekarza POZ (rodzinnego) -- opisz problem
  2. Poproś o SKIEROWANIE (bez skierowania do: psychiatra, ginekolog, onkolog, dermatolog, stomatolog, wenerologg)
  3. Z skierowaniem zadzwoń lub idź do poradni specjalistycznej (AOS)
  4. Zarejestruj się -- podaj datę wystawienia skierowania
  5. Skierowanie ważne 30 dni na zapisanie się (ale data wizyty może być późniejsza)
  UWAGA: pilny tryb -- lekarz POZ musi wpisać "pilne" na skierowaniu -- krótsze kolejki

JAK UZYSKAĆ REHABILITACJĘ Z NFZ:
  1. Lekarz (POZ lub specjalista) wystawia skierowanie na rehabilitację/fizjoterapię
  2. Skierowanie ważne 30 dni od wystawienia do rejestracji
  3. Znajdź placówkę rehabilitacyjną z kontraktem NFZ (wyszukiwarka na nfz.gov.pl)
  4. Zarejestruj się -- podajesz nr skierowania
  5. Czekaj na termin (kolejka 1-6 miesięcy dla rehabilitacji ambulatoryjnej, tryb pilny szybciej)
  Rodzaje rehabilitacji NFZ:
  - Ambulatoryjna (poradnia) -- 5 dni/tydzień, do 10-80 zabiegów
  - Dzienna (ośrodek) -- 5 dni/tydzień, kilka godzin dziennie
  - Domowa -- dla osób nieporuszających się samodzielnie
  - Stacjonarna (szpital rehabilitacyjny) -- po przebytych poważnych urazach/operacjach

JAK UBIEGAĆ SIĘ O TURNUS REHABILITACYJNY (PFRON):
  1. Lekarz prowadzący wystawia wniosek o turnus (formularz PFRON)
  2. Złóż wniosek w PCPR (Powiatowe Centrum Pomocy Rodzinie) -- właściwe dla miejsca zamieszkania
  3. Dołącz: orzeczenie o niepełnosprawności, wniosek lekarza, dowód osobisty
  4. PCPR rozpatruje w ciągu 30 dni od zakończenia przyjmowania wniosków (nabory ogłaszane przez PCPR)
  5. Dofinansowanie: 20-30% przeciętnego wynagrodzenia (ok. 1 600-2 400 PLN) -- zależy od stopnia niepełnosprawności i dochodu
  6. Wybierz ośrodek z listy PFRON (pfron.org.pl) -- musi być aktywny w systemie
  7. Zawiadom PCPR o wyborze
  8. Realizuj turnus (14-21 dni)

JAK UZYSKAĆ DOFINANSOWANIE APARATU SŁUCHOWEGO (PFRON):
  Ścieżka NFZ (refundacja):
  1. Audiolog lub laryngolog diagnozuje niedosłuch i wystawia zlecenie na zaopatrzenie
  2. Zlecenienie potwierdza NFZ (punkt w przychodni lub online przez IKP)
  3. Kup aparat w sklepie medycznym lub saloniku słuchowym z umową z NFZ
  4. Dofinansowanie NFZ: ok. 1 000-1 600 PLN (zależy od rodzaju)
  Ścieżka PFRON (dodatkowe dofinansowanie):
  1. Złóż wniosek do PCPR z: orzeczeniem o niepełnosprawności, fakturą/ofertą cenową, dokumentacją audiologiczną
  2. Dofinansowanie PFRON: do 100% zakupu minus udział NFZ, max 3 200-4 500 PLN
  3. Łącznie NFZ + PFRON może pokryć całość kosztów średniego aparatu

JAK ZAREJESTROWAĆ SIĘ DO NFZ (osoby bez ubezpieczenia przez pracodawcę):
  JDG / samozatrudnieni: ubezpieczenie zdrowotne obowiązkowe przez ZUS (składka = 9% dochodu, min 432,54 PLN)
  Bezrobotni zarejestrowani w PUP: PUP zgłasza do ZUS automatycznie
  Studenci: uczelnia zgłasza do ZUS; po 26 roku życia -- samodzielnie lub przez rodziców
  Osoby bez dochodów (niezatrudnione): mogą ubezpieczyć się dobrowolnie przez ZUS (ZUS ZZA) lub przez urząd gminy (dla najuboższych)
  Jak sprawdzić status ubezpieczenia: zip.nfz.gov.pl -> Zaloguj się profilem zaufanym -> "Ubezpieczenie"

NAGŁE ZACHOROWANIE -- co wybrać:
  - SOR (Szpitalny Oddział Ratunkowy): zagrożenie życia, urazy, nagłe stany -- BEZ skierowania, działa 24/7
  - NiŚOZ (Nocna i Świąteczna Opieka Zdrowotna): poza godzinami POZ (18:00-8:00, weekendy) -- BEZ skierowania, dla stanów nagłych ale nie zagrożenia życia
  - Pogotowie (112 lub 999): zagrożenie życia -- TYLKO gdy konieczny transport lub reanimacja
  - Telegram: NIE dzwoń na pogotowie przy niskim gorączce -- idź do NiŚOZ lub POZ

=== SZCZEGÓŁY LIVE API NFZ (dla rozumienia kontekstu) ===

Triggery automatycznego pobierania danych:
- "znajdź lekarza", "szukam lekarza w X"
- "kolejka do Y", "ile czekam"
- "najbliższy POZ/przychodnia/szpital"
- Nazwa specjalisty: kardiolog, endokrynolog, ortopeda, neurolog, dermatolog, okulista, urolog, gastrolog, psychiatra, ginekolog, stomatolog, dentysta, fizjoterapeuta

Dane live z API:
- Nazwa placówki
- Adres i miasto
- Telefon kontaktowy
- Czas oczekiwania (dla kolejek, w dniach)
- Tryb: stabilny / pilny

URL wyszukiwania: /nfz?benefit=[NAZWA_SPECJALNOŚCI]&province=[KOD_WOJEWÓDZTWA]
Kody województw (01=dolnośląskie, 02=kujawsko-pomorskie, ..., 12=małopolskie, ..., 14=mazowieckie, ...)
