# Polska cyfrowa - nowa zakładka /centrum-obywatela/polska-cyfrowa

Data: 2026-06-03
Status: zatwierdzony przez Exhuman

## Cel

Publiczna, jawna zakładka pokazująca twardymi, cytowanymi danymi, że Polska jest mocno
zcyfryzowana. Dwa flagowe przykłady: ElevenLabs (polski jednorożec AI) oraz NFZ / e-zdrowie.
Plus wykresy unaoczniające zjawiska (dostępność mieszkań, realne ceny m2, wzrost e-usług)
oraz sekcja darmowych API państwowych.

## Architektura

Wszystkie dane hardcoded + cytowane (wzorzec istniejącego `CENA_M2` w `/statystyki`).
Brak nowych zależności (chart = własny SVG, jak `LineChart`). Server component.

### Nowe pliki
- `src/app/centrum-obywatela/polska-cyfrowa/page.tsx` - strona
- `src/app/centrum-obywatela/polska-cyfrowa/layout.tsx` - metadata
- `src/app/centrum-obywatela/polska-cyfrowa/MultiLineChart.tsx` - wieloseryjny wykres + legenda
- `src/data/polska-cyfrowa.ts` - wszystkie dane (newsy, serie, źródła, API)

### Edycje
- `src/app/centrum-obywatela/page.tsx` - kafelek nawigacyjny
- `src/app/statystyki/page.tsx` - rozszerzenie `STATUS_API` o nowe zweryfikowane API
- `AGENTS.md` - mapa projektu

## Sekcje strony
1. Hero - teza: e-zdrowie i e-administracja PL na poziomie światowym.
2. Newsy ElevenLabs (karty z datą + linkiem źródła).
3. Newsy NFZ / e-zdrowie (karty z datą + linkiem źródła).
4. Polska w liczbach (kafelki).
5. Wykresy: (a) ile m2 za przeciętne wynagrodzenie 2000-2025; (b) ceny m2 nominalnie vs
   realnie (deflacja CPI, zł z 2000); (c) wzrost e-usług: Profil Zaufany 2018-2022 + e-ZLA 2021-2024.
6. Darmowe API państwowe (publiczna lista, "co jeszcze podpinamy").

## Dane zweryfikowane (źródła w pliku danych)

### ElevenLabs
- 2022: założony przez Mati Staniszewskiego i Piotra Dąbkowskiego (Wikipedia/Endeavor)
- 2025-01: Series C, wycena 3,3 mld USD (TechCrunch)
- 2026-02: Series D, 500 mln USD, wycena 11 mld USD, Sequoia (TechCrunch)
- 2025: ponad 330 mln USD ARR (blog ElevenLabs)
- 2024-11: 44 mln zł / 5 lat na R&D w Polsce, centrum R&D w Warszawie - główna siedziba w UE (MamStartup)
- 2024-11: plan zatrudnienia do 100 specjalistów (MamStartup)
- 2025: polski TTS + Summit w Warszawie, Dubbing V2 (Rzeczpospolita)

### NFZ / e-zdrowie (CeZ podsumowanie 2025)
- 2,3 mld e-recept łącznie (obowiązkowe od 2020-01-08)
- 237 mln e-skierowań (NARASTAJĄCO, 94% refundowane NFZ)
- 20 mln aktywnych kont IKP (ponad połowa populacji)
- mojeIKP: 4 mln pobrań, 500 tys. użytkowników/mies.
- 2024-08: start pilotażu centralnej e-rejestracji
- 2026-01: centralna e-rejestracja obowiązkowa (kardiologia, mammografia, HPV); 1,6 mln pacjentów
- 2025-08: przetarg na Asystenta AI (VoiceBot) PL/EN/UA, finansowany z KPO
- ponad 1 mld zdarzeń medycznych w systemie

### Serie do wykresów
- Cena m2 (q1): istniejący `CENA_M2` w /statystyki (przeniosę/zreużyję)
- Wynagrodzenie brutto GUS 2000-2025 (pełna seria)
- CPI roczne GUS 2000-2024 (pełna seria; 2025 niezweryfikowany - pominięty)
- Profil Zaufany: 2018=1,3M, 2020=4,65M, 2021=8,8M, 2022=14,5M
- e-ZLA (ZUS): 2021=20,4M, 2022=21,8M, 2023=21,9M, 2024=22,1M

### Kafelki "Polska w liczbach"
- Internet w gosp. domowych: 95,9% (GUS 2024)
- e-administracja 16-74 lata: 61,1% (GUS 2025)
- mObywatel: 12 mln użytkowników (MC 2025)
- Profil Zaufany: 14,5 mln (MC 2022)

### Darmowe API (publiczna sekcja + STATUS_API)
dane.gov.pl, KRS Open API (ms.gov.pl), NFZ terminy leczenia, GUGiK ULDK (działki),
Sejm API (głosowania), Eurostat, ECB, GDOŚ Geoserwis (Natura 2000), REGON BIR (klucz),
TERYT (klucz), api.um.warszawa.pl (klucz), KSeF (token).

## Reguły uczciwości
- mObywatel: zerwana metodyka 2022/2023 → tylko kafelek, NIE wykres liniowy
- e-skierowanie 237 mln: narastająco, oznaczone osobno (nie seria roczna)
- DESI 24/27 UE: wspomniane uczciwie jako "obszar do poprawy", nie ukrywane
- Każda liczba: link do źródła + rok
- Pełne polskie diakrytyki we wszystkich stringach

## Poza zakresem
- Wykresy regionalne (GUS BDL wymaga klucza API - pending)
- Auto-odświeżanie newsów (dane curated, datowane)
