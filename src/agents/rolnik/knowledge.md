WIEDZA O WSPARCIU DLA ROLNIKÓW W POLSCE (stan: maj 2026):

=== ARiMR -- PROGRAMY DLA ROLNIKÓW ===

Źródło: arimr.gov.pl

Młody Rolnik: premia 200 000 PLN (standard) lub 300 000 PLN (produkcja zwierzęca)
- Wiek: do 40 lat, prowadzenie działalności rolniczej max 24 miesiące
- Nabór: 1.06 -- 31.07.2026
- Wypłata: 80% po podpisaniu umowy + 20% po realizacji biznesplanu (~24 mies.)
- Wniosek: eWniosekPlus ARiMR (arimr.gov.pl)

Modernizacja gospodarstw rolnych:
- Obszar A (produkcja zwierzęca): do 1 000 000 PLN -- nabór kwiecień-czerwiec 2026
- Obszar B (produkcja roślinna): do 500 000 PLN -- nabór maj-lipiec 2026
- Warunek: biznesplan, minimalna żywotność ekonomiczna gospodarstwa

Dopłaty bezpośrednie (kampania 2026):
- Jednolita Płatność Obszarowa (JPO): stawka ogłaszana po zakończeniu kampanii
- Płatność za praktyki rolnicze (zazielenienie): wymogi: dywersyfikacja upraw, utrzymanie TUZ, obszary proekologiczne
- Terminy składania wniosków: do 15 maja każdego roku (kampania 2026: do 15.05.2026, późne złożenie z redukcją do 15.06.2026)
- Wniosek: eWniosekPlus ARiMR

KRUS (Kasa Rolniczego Ubezpieczenia Społecznego):
- Obowiązkowe ubezpieczenie dla rolników prowadzących gospodarcze powyżej 1 ha przeliczeniowego
- Emerytury KRUS: niższe składki niż ZUS, ale też niższe emerytury
- Zasiłek chorobowy KRUS: ryczałt dzienny za czasową niezdolność do pracy
- Jednorazowe odszkodowanie za wypadek przy pracy rolniczej
- Renta rolnicza z tytułu niezdolności do pracy

Geoportal ARiMR:
- URL: geoportal.arimr.gov.pl
- Brak API (geoportal blokuje embedy)
- Dostęp pełny po zalogowaniu profilem zaufanym (login.gov.pl)
- Warstwy dostępne: granice działek, użytki rolne, ONW, Natura 2000, ortofotomapa
- Instrukcja: 1. Wejdź na geoportal.arimr.gov.pl | 2. Zaloguj się profilem zaufanym | 3. Wpisz numer ewidencyjny działki | 4. Wybierz warstwy

=== IMGW/RCB -- ALERTY POGODOWE (LIVE) ===

Dostęp w platformie: /centrum-obywatela/pogoda
Backend API: /api/public/imgw (30 req/min/IP)
Źródło: rcb.gov.pl/feed (oficjalne alerty RCB)
Aktualizacja: co 15 minut

Typy alertów istotnych dla rolników:
- Stopień 1 (żółty): zachowaj ostrożność, monitoruj sytuację
- Stopień 2 (pomarańczowy): bądź przygotowany, ogranicz aktywność na zewnątrz
- Stopień 3 (czerwony): bardzo niebezpieczne, zrezygnuj z prac polowych

Zjawiska:
- Burze z gradem -- zagrożenie dla upraw
- Przymrozki (mróz nocny < 0°C) -- zagrożenie dla sadów, warzyw gruntowych
- Silny wiatr -- zagrożenie przy opryskach, silosach
- Intensywne opady deszczu / powódź -- zagrożenie dla pól w dolinach rzecznych
- Susza -- alerty IMGW od maja 2026

=== BDL GUS -- DANE GMINY (LIVE) ===

Dostęp w platformie: /centrum-obywatela/gus
Backend API: /api/public/bdl-gus?gmina= albo ?terytId= (30 req/min/IP)
Źródło: bdl.stat.gov.pl

Dane dostępne per gmina/powiat:
- Ludność ogółem, w wieku przedprodukcyjnym/produkcyjnym/poprodukcyjnym
- Stopa bezrobocia rejestrowanego (%)
- Przeciętne miesięczne wynagrodzenie brutto
- Liczba podmiotów gospodarczych per 10 000 mieszkańców

Zastosowanie dla rolników:
- Kontekst lokalny przy ubieganiu się o dotacje
- Ocena rynku pracy w okolicy (istotne przy zatrudnieniu sezonowym)
- Planowanie biznesu rolnego (popyt lokalny, demografia)
- Weryfikacja danych do biznesplanu ARiMR

=== ŚWIADCZENIA KRUS W BAZIE (kategoria KRUS) ===

- Ubezpieczenie wypadkowe, chorobowe i macierzyńskie KRUS
- Zasiłek chorobowy KRUS (ryczałt: wypłacany od 4. dnia niezdolności)
- Jednorazowe odszkodowanie za wypadek przy pracy rolniczej
- Emerytura rolnicza KRUS: część składkowa + część uzupełniająca
- Renta rolnicza z tytułu niezdolności do pracy w gospodarstwie
- Zasiłek macierzyński KRUS: jednorazowy, dla ubezpieczonych KRUS
- Renta rodzinna KRUS: po śmierci ubezpieczonego rolnika
- Domownicy w KRUS: osoby pomagające stale w gospodarstwie
