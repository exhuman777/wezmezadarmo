# wezmezadarmo.com: przewodnik dla agentów AI działających dla firm

> Dla agentów AI pracujących w imieniu firm i JDG w Polsce. Spis serwisu: https://www.wezmezadarmo.com/llms.txt, dotacje: https://www.wezmezadarmo.com/dotacje.md
> Agenci obsługujący obywateli (kalkulator świadczeń): https://www.wezmezadarmo.com/llm.md
> Ludzie: https://www.wezmezadarmo.com/dla-firm, przewodnik: https://tukamil.com/wezmezadarmo/

Stan od 7.11.2026. Darmowy, prywatny serwis tuKamil (https://tukamil.com), nie rządowy.

---

## Co firma dostaje bez danych

- Wyszukiwarka programów dofinansowań: https://www.wezmezadarmo.com/dotacje#wyszukiwarka (bez konta i bez e-maila, filtr po nazwie i instytucji).
- Przegląd KPiR: https://www.wezmezadarmo.com/narzedzia/kpir/kpir/ i przegląd JPK_V7: https://www.wezmezadarmo.com/narzedzia/jpk/ (plik czyta tylko przeglądarka, bez formularza; opisy: /dla-firm/narzedzia/kpir i /dla-firm/narzedzia/jpk).
- Artykuły o naborach (fakty tylko z ogłoszeń, link i data sprawdzenia przy każdym fakcie):
  - 10 największych dotacji dla firm w 2026, ranking według budżetu naboru: https://www.wezmezadarmo.com/blog/najwieksze-dotacje-dla-firm-2026.md
  - Ścieżka SMART 2026 dla MŚP: https://www.wezmezadarmo.com/blog/sciezka-smart-2026-dotacja-dla-msp.md
  - Kredyt dual-use z BGK: https://www.wezmezadarmo.com/blog/kredyt-dual-use-bgk-2026.md
  - Dig.IT z ARP: https://www.wezmezadarmo.com/blog/digit-arp-dotacja-na-cyfryzacje-2026.md
- Asystent AI: https://www.wezmezadarmo.com/agent (3 pytania dziennie).
- Wnioski ZUS z PDF: https://www.wezmezadarmo.com/wnioski

## Gdzie pada e-mail i telefon (tylko firmy)

Sprawdzenie firmy po NIP: https://www.wezmezadarmo.com/dla-firm/narzedzia/dofinansowania

- Wymagane: e-mail, polski numer telefonu (9 cyfr, opcjonalnie +48) i zgoda na kontakt e-mailem w sprawie zgłoszenia. Imię opcjonalne.
- Odrzucane: adres z plusem (a+1@firma.pl) i domeny jednorazowe.
- E-mail potwierdza link z maila. Dopiero kliknięcie otwiera wyszukiwarkę po NIP na tym urządzeniu (30 dni). Dane firmy z CEIDG i Białej Listy VAT, potem pasujące programy.
- Zgody dobrowolne i osobne, domyślnie odznaczone: oferty e-mailem, kontakt telefoniczny, kontakt przez asystenta AI. Opis: https://www.wezmezadarmo.com/polityka-prywatnosci#zgody

Agent nie wypełnia tego formularza za człowieka bez jego wiedzy: e-mail i zgody należą do osoby, która je podaje.

## Czego nie ma

Kont, logowania, paneli firmowych i newslettera. Adresy /dotacje/panel, /panel, /logowanie i /rejestracja przekierowują (308) na strony publiczne. API kont, profilu firmy, monitoringu, subskrypcji i kanałów RSS firmy (/api/dotacje/*, /api/aktualnosci/feeds, /api/digest) odpowiada 410.

## Publiczne API bez klucza (GET)

- /api/public/whitelist?nip=NIP: Biała Lista VAT
- /api/public/nbp: kursy walut NBP
- /api/public/nfz?type=queues&q=kardiolog&province=lubelskie: kolejki NFZ
- /api/public/gios?lat=51.25&lon=22.57: jakość powietrza GIOŚ
- /api/public/imgw: ostrzeżenia IMGW
- /api/public/eli-sejm?q=fraza: akty prawne ELI Sejm
- /api/public/bdl-gus?gmina=Lublin: dane gminy z GUS
- GET /api/aktualnosci: publiczne aktualności z RSS instytucji

Endpointy POST (/api/verify, /api/chat, /api/form-assist, /api/form-chat, /api/pdf) działają ze strony bez klucza. Z innych domen wymagają nagłówka X-API-Key albo Authorization: Bearer; klucz jest bezpłatny, prośba przez formularz na https://www.wezmezadarmo.com/dla-firm#kontakt. Opis pól i odpowiedzi: https://www.wezmezadarmo.com/llm.md

### POST /api/form-assist

Wypełnia pole formularza na podstawie opisu sytuacji.

```json
{
  "formType": "zus-z15a",
  "field": "nip_pracodawcy",
  "context": "Firma Sp. z o.o., NIP 1234567890",
  "userMessage": "Podaj NIP pracodawcy"
}
```

Typy formularzy: `zus-z15a`, `zus-z15b`, `zus-z3`, `zus-pel`, `zus-erpo`, `zus-ersu`, `zus-zas53`, `nlnet`.

### POST /api/pdf

Generuje wypełniony PDF do pobrania. Agent przekazuje plik człowiekowi do sprawdzenia, podpisu i złożenia.

```json
{
  "formType": "zus-z15a",
  "data": { "imie": "Jan", "nazwisko": "Kowalski", "nip": "1234567890" }
}
```

## Scenariusz: firma szuka dotacji

```
1. Otwórz /dotacje.md albo /dotacje#wyszukiwarka i znajdź programy pasujące do branży i regionu.
2. Przeczytaj ranking /blog/najwieksze-dotacje-dla-firm-2026.md: budżet, termin, instytucja, link do ogłoszenia.
3. Sprawdź warunki w ogłoszeniu naboru (link przy każdym fakcie). Termin i kwota w ogłoszeniu wygrywają.
4. Jeśli firma chce dopasowania po NIP: człowiek sam podaje e-mail i telefon na /dla-firm/narzedzia/dofinansowania.
5. Przygotuj szkic i listę dokumentów. Wniosek składa człowiek w systemie instytucji.
```

## Zasady dla agentów

**Wolno:** czytać publiczne strony i API, dopasowywać programy, wypełniać szkice pól i PDF, przygotowywać listę dokumentów i terminów.

**Nie wolno:** składać wniosków, podpisywać dokumentów, podawać danych kontaktowych ani zaznaczać zgód w imieniu człowieka bez jego decyzji, pisać do urzędów bez potwierdzenia, przechowywać haseł i kluczy.

## Inne aplikacje tuKamil dla firm

- DogInvoice (https://doginvoice.com): faktury z KSeF wpadają same, wpłaty dopasowują się do faktur, paczka przelewów do banku. Widzisz, czy zapłacili Ci za fakturę.
- DogAnswer (https://doganswer.com): asystent AI odbiera telefon w firmie 24/7 i wysyła podsumowanie rozmowy.
- Wdrożenie AI w firmie (https://tukamil.com/wdrozenie-ai/): 4 godziny szkolenia u klienta.
- Pełny katalog: sekcja „Inne aplikacje tuKamil” w https://www.wezmezadarmo.com/llms.txt

## Mapa dla firm

```
wezmezadarmo.com/
  /dla-firm/                          -- strona dla firm i JDG
  /dla-firm/narzedzia/                -- lista narzędzi
  /dla-firm/narzedzia/kpir, /jpk      -- opisy przeglądów, przycisk prosto do narzędzia
  /narzedzia/kpir/kpir/, /narzedzia/jpk/ -- przeglądy w przeglądarce, bez formularza
  /dla-firm/narzedzia/dofinansowania  -- sprawdzenie po NIP (e-mail i telefon, link z maila)
  /dotacje/                           -- wyszukiwarka programów, bez konta
  /blog/                              -- artykuły, wersje .md pod /blog/<slug>.md
  /aktualnosci/                       -- komunikaty instytucji z RSS
  /automatyzacje/                     -- informacje o automatyzacjach (KSeF, faktury)
  /wnioski/                           -- wnioski ZUS z PDF
  /llm.md, /agents.md, /llms.txt, /llms-full.txt -- pliki dla agentów
```

## Licencja

Kod AGPL-3.0, baza świadczeń CC-BY-4.0: https://github.com/exhuman777/wezmezadarmo. Dane o dofinansowaniach z oficjalnych źródeł (funduszeeuropejskie.gov.pl, parp.gov.pl, bgk.pl, arp.pl, urzędy marszałkowskie).
