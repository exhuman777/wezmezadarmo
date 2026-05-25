# Templates -- wnioski o dostęp do API instytucji państwowych

Gotowe szablony do wysłania mailem/papierem. Wypełnij wartości w `{nawiasach}`.

---

## 1. GUS BDL (Bank Danych Lokalnych) -- klucz API

**Do:** Centrum Informatyki Statystycznej GUS
**Email:** bdl@stat.gov.pl
**Temat:** Wniosek o dostęp do API BDL -- portal wezmezadarmo.com

```
Dzień dobry,

Reprezentuję projekt wezmezadarmo.com -- bezpłatny portal informacyjny
agregujący dane o świadczeniach, ulgach i dotacjach państwowych dla
obywateli i firm w Polsce.

Proszę o wydanie klucza API do Banku Danych Lokalnych GUS w celu
prezentacji wybranych wskaźników społeczno-gospodarczych na stronie
publicznej /statystyki:

ZAKRES PLANOWANEGO WYKORZYSTANIA:
1. Średnie wynagrodzenie brutto w gospodarce narodowej (rocznie)
2. Stopa bezrobocia rejestrowanego (miesięcznie, ogółem + województwa)
3. CPI -- wskaźnik cen towarów i usług konsumpcyjnych (rok/rok)
4. Cena 1 m² powierzchni użytkowej mieszkania (kwartalnie, 1999-)
5. Liczba mieszkań oddanych do użytkowania (kwartalnie, ogółem + miasta)
6. Przeciętna emerytura ZUS i KRUS (kwartalnie)
7. PKB per capita (rocznie, województwa)
8. Demografia: ludność, urodzenia, zgony, saldo migracji (rocznie)

SPOSÓB PREZENTACJI:
- Dashboard publiczny z wykresami liniowymi i porównawczymi
- Cross-reference (np. cena m² vs średnie wynagrodzenie w czasie)
- Atrybucja: "Źródło: GUS BDL" przy każdym wskaźniku + link do bdl.stat.gov.pl
- Cache 24h zgodnie z dobrymi praktykami API

PRZEWIDYWANY WOLUMEN: max. 200 zapytań dziennie (cache server-side)

PROFIL ORGANIZACJI:
- Domena: wezmezadarmo.com
- Kontakt: {imie nazwisko}, {email}, {telefon}
- NIP/REGON: {jeśli dotyczy, organizacja non-profit/JDG}
- Licencja oprogramowania: AGPL-3.0 (open source)
- Polityka prywatności: https://www.wezmezadarmo.com/polityka-prywatnosci

Z góry dziękuję za rozpatrzenie wniosku.

Z poważaniem,
{imie nazwisko}
wezmezadarmo.com
```

---

## 2. REGON -- dostęp do API rejestru podmiotów gospodarki

**Do:** Główny Urząd Statystyczny, Departament Standardów i Rejestrów
**Email:** regon@stat.gov.pl
**Temat:** Wniosek o klucz API REGON

```
Dzień dobry,

W ramach projektu wezmezadarmo.com (publiczny portal informacyjny o
świadczeniach i dotacjach) proszę o wydanie klucza API do rejestru
REGON w celu weryfikacji firm pod kątem prawa do programów dotacyjnych.

ZAKRES:
1. Wyszukiwanie podmiotu po NIP/REGON
2. Pobranie danych: nazwa, PKD, wielkość zatrudnienia, status działalności
3. Walidacja czy firma jest aktywna przed prezentacją dopasowanych dotacji

KONTEKST UŻYCIA:
Użytkownik wpisuje NIP swojej firmy → system pobiera profil z REGON →
dopasowuje dofinansowania B2B (PARP, NCBR, BGK, KPO, regionalne)
zgodnie z PKD i wielkością firmy. Wszystkie dane prezentowane wyłącznie
zalogowanym właścicielom firmy, nie udostępniamy publicznie.

POLITYKA PRZECHOWYWANIA:
- Dane firmy zapisywane tylko w sesji użytkownika (24h)
- Brak masowego scrappingu, max. 1 zapytanie per login użytkownika
- Pełna zgodność z RODO, zob. https://www.wezmezadarmo.com/polityka-prywatnosci

DANE ORGANIZACJI:
{wypełnij jak w pkt. 1}

Pozdrawiam,
{imie nazwisko}
```

---

## 3. TERYT -- dostęp do rejestru terytorialnego

**Do:** GUS, Departament Standardów i Rejestrów
**Email:** teryt@stat.gov.pl

```
Dzień dobry,

Proszę o wydanie klucza API TERYT dla projektu wezmezadarmo.com w celu:
- Mapowania nazw miast/gmin/województw na kody TERYT
- Geocoding adresów świadczeniobiorców (anonimowo, do dopasowania
  programów samorządowych po lokalizacji)
- Walidacji wprowadzonych przez użytkowników danych adresowych

Wolumen: max. 50 zapytań/dzień.

{dane organizacji}
```

---

## 4. STRATEG (Strategiczna Baza Danych)

**Do:** GUS, Departament Studiów Makroekonomicznych
**Email:** strateg@stat.gov.pl

```
Dzień dobry,

Wnioskuję o dostęp do bazy STRATEG (strateg.stat.gov.pl) w celu
prezentacji wskaźników strategii rozwoju Polski (SOR, Strategia Sprawne
Państwo, KPO) na publicznym dashboardzie wezmezadarmo.com/statystyki.

Cel: pokazywanie postępu realizacji celów strategicznych Polski w
przystępnej formie dla obywateli.

{dane organizacji}
```

---

## 5. NFZ -- rozszerzony dostęp (jeśli wymagany)

**Do:** Centrala NFZ, Departament IT
**Email:** kontakt@nfz.gov.pl

```
Dzień dobry,

Korzystamy z publicznego API NFZ (api.nfz.gov.pl) do wyszukiwania
placówek i kolejek w portalu wezmezadarmo.com. Bez rate-limiting
ograniczeń, wszystko działa.

Pytanie: czy istnieje sposób na podwyższenie limitu zapytań (jeśli w
przyszłości skalujemy ruch >1000 zapytań/dzień) lub czy mamy dostęp do
endpointów beta (np. listy refundowanych leków po EAN)?

Atrybucja źródła: "Dane: NFZ" przy każdej liście świadczeniodawców.

{dane}
```

---

## 6. CEIDG -- już mamy dostęp publiczny

CEIDG udostępnia publiczne datastore.ceidg.gov.pl/api/ce bez klucza.
**Nie ma potrzeby wnioskować -- używamy już w produkcji.**

---

## Wskazówki przy wysyłce

1. **Zawsze załącz:** politykę prywatności (link), regulamin (link), zrzut ekranu strony /statystyki lub /nfz
2. **Podkreśl:** bezpłatność, brak komercjalizacji, atrybucja źródła
3. **Wolumen:** nie strasz dużymi liczbami -- max. 200 req/dzień brzmi rozsądnie
4. **Cache:** wymień że cache'ujesz odpowiedzi 24h żeby nie obciążać API
5. **Odpowiedź:** typowo 14-30 dni roboczych

## Po otrzymaniu klucza

1. Dodaj klucz do Vercel env: `GUS_BDL_KEY`, `REGON_KEY`, `TERYT_KEY`
2. Zaktualizuj `src/lib/sources/{api}.ts` o nową integrację
3. Włącz źródło w `/statystyki` page (zmień status z `pending` na `live`)
4. Test: `curl -H "Authorization: Bearer $GUS_BDL_KEY" https://bdl.stat.gov.pl/api/v1/...`
