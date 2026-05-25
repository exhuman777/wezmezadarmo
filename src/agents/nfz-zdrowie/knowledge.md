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
- Tryb pilny -- wymaga adnotacji lekarza "pilne" lub "przypadek pilny"
- Dane kolejek: api.nfz.gov.pl (oficjalne, live)
- Wyszukiwarka: /nfz (filtruj po województwie, specjalności, trybie)

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
