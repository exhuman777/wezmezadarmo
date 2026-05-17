/**
 * POST /api/form-chat
 * Streaming AI chat assistant for ZUS form wizards.
 * Context-aware: knows which form the user is filling.
 */

import { NextRequest } from 'next/server';
import { chatStream } from '@/ai/openrouter';
import { CORS_HEADERS, optionsResponse } from '@/lib/apiAuth';

export async function OPTIONS() {
  return optionsResponse();
}

const FORM_KNOWLEDGE: Record<string, string> = {
  'zus-zas53': `Pomagasz uzytkownikowi wypelnic formularz ZAS-53 -- Wniosek o wyplate zasilku chorobowego.
Kluczowe informacje o ZAS-53:
- Komu przysluguje: osobie ubezpieczonej chorobowo (pracownik, zleceniobiorca, przedsiebiorca) ktora stala sie niezdolna do pracy z powodu choroby
- Podstawowe dokumenty: zaswiadczenie lekarskie e-ZLA (wystawione elektronicznie przez lekarza), PESEL, dane pracodawcy (NIP, REGON)
- Termin zloze: do 6 miesiecy od pierwszego dnia zwolnienia. Po uplywie -- zasilek przepada.
- Wysokosc zasilku: zazwyczaj 80% podstawy wymiaru (srednie wynagrodzenie z 12 miesiecy). 100% jesli niezdolnosc z powodu wypadku przy pracy, choroby zawodowej, w czasie ciazy lub hospitalizacji powyzej 14 dni.
- PESEL platnika: jesli pracodawca to osoba fizyczna, w polu NIP platnika wpisz jej PESEL
- Numer konta: mozna podac, jesli chcesz otrzymac wyplate bezposrednio na konto (opcjonalne)
- Gdzie zlozyc: do pracodawcy (jesli ma co najmniej 20 ubezpieczonych) lub bezposrednio do ZUS`,

  'zus-z15a': `Pomagasz uzytkownikowi wypelnic formularz Z-15A -- Wniosek o zasilek opiekunczy na dziecko.
Kluczowe informacje o Z-15A:
- Komu przysluguje: rodzicowi lub opiekunowi prawnemu opiekujacemu sie chorym dzieckiem do 14 lat (lub niepelnosprawnym do 18 lat) albo dzieckiem do 8 lat jesli zamknieto placowke opiekurcza
- Warunek: konieczne zaswiadczenie lekarskie e-ZLA wystawione na dziecko. Dziecko musi byc chore lub placowka zamknieta.
- Limit dni: 60 dni w roku kalendarzowym (wspolny limit dla obojga rodzicow na dzieci do 8 lat i chore dzieci do 14 lat). 14 dni na dzieci niepelnosprawne.
- Wysokosc zasilku: 80% podstawy wymiaru
- Drugi rodzic: jesli drugi rodzic takze pracuje, w oswiadczeniu nalezy podac jego dane i potwierdzic ze nie skorzystal z zasilku
- Platnik skladek: pracodawca lub ZUS (jesli samozatrudniony)
- Termin: wnioskuj jak najszybciej po zakonczeniu opieki`,

  'zus-z15b': `Pomagasz uzytkownikowi wypelnic formularz Z-15B -- Wniosek o zasilek opiekunczy na czlonka rodziny.
Kluczowe informacje o Z-15B:
- Komu przysluguje: osobie ubezpieczonej sprawujacej opieke nad chorym dorosłym czlonkiem rodziny (malzonek, rodzice, tesciowie, dziadkowie, wnuki, rodzenstwo, rodzice/dzieci adopcyjni, ojczym/macocha)
- Warunek: chory musi mieszkac we wspolnym gospodarstwie domowym z wnioskodawca w czasie sprawowania opieki. Konieczne zaswiadczenie lekarskie e-ZLA.
- Limit dni: 14 dni w roku kalendarzowym (wspolny limit z Z-15a)
- Wysokosc zasilku: 80% podstawy wymiaru
- Relacja pokrewienstwa: nalezy podac dokladna relacje do chorego (np. malzonek, rodzic, tesc)
- Termin: wnioskuj jak najszybciej po zakonczeniu opieki`,

  'zus-pel': `Pomagasz uzytkownikowi wypelnic formularz PEL -- Pelnomocnictwo ogolne do spraw ZUS.
Kluczowe informacje o PEL:
- Do czego sluzy: upowaznienie innej osoby do reprezentowania Cie w sprawach ZUS (np. maz, zona, ksiegowa, adwokat)
- Kto udziela: osoba fizyczna we wlasnym imieniu lub reprezentant firmy
- Zakres pelnomocnictwa: wszystkie sprawy w ZUS, tylko PIT-y, lub konkretna czynnosc
- Pelnomocnik: musi miec pelna zdolnosc do czynniosci prawnych. Moze byc dowolna osoba, nie musi byc prawnikiem.
- Gdzie zlozyc: w dowolnej jednostce ZUS. Mozna tez przez eZUS z profilem zaufanym (wtedy nie potrzeba papierowego formularza).
- Odwolanie: pelnomocnictwo mozna odwolac w dowolnym czasie skladajac oswiadczenie w ZUS
- Podpis: formularz musi byc podpisany wlasnorecznie przez mocodawce (osobiscie w ZUS lub wyslany listem z podpisem)`,

  'zus-erpo': `Pomagasz uzytkownikowi przygotowac wniosek ERPO -- Wniosek o emeryture (ERO/ERPO).
Kluczowe informacje o emeryturze:
- Wiek emerytalny: mezczyzni -- 65 lat, kobiety -- 60 lat (wiek obowiazujacy od 2017r.)
- Wiek emerytalny dla urodzonych przed 1 stycznia 1949: bedzie inny -- wyliczany indywidualnie
- Gdzie zlozyc: do ZUS przez eZUS, pocztą, osobiscie
- Termin: wnioskuj najwczesniej 30 dni przed planowanym przejsciem na emeryture
- Podstawowe dokumenty: dowod osobisty/paszport, swiadectwa pracy, ksiazeczka ubezpieczeniowa
- Emerytura kapitałowa: dla urodzonych po 31.12.1948 -- czesc z ZUS, czesc z OFE lub ZUS
- Staz pracy: nie ma minimalnego stazu -- wystarczy osiagniecie wieku emerytalnego`,

  'zus-ersu': `Pomagasz uzytkownikowi przygotowac oswiadczenie ERU/ERSU do wniosku Mama 4+ (lub Tata 4+).
Kluczowe informacje o swiadczeniu 500+ dla rodzicow:
- Swiadczenie Mama 4+: przysluguje matce (lub ojcu w szczegolnych przypadkach) ktora urodzila i wychowala co najmniej 4 dzieci
- Wysokosc: rowna najnizszej emeryturze (w 2026r. ok. 1900 PLN brutto)
- Warunki: osiagniecie wieku emerytalnego (60 lat kobieta, 65 lat mezczyzna), brak własnych srodkow utrzymania lub emerytura/renta nizsza niz minimum
- Tata 4+: ojciec moze ubiega sie jezeli matka zmara, porzucila dzieci lub trwale zaprzestala ich wychowywania
- Gdzie zlozyc: do ZUS przez eZUS, pocztą lub osobiscie
- ERU to formularz oswiadczenia o sytuacji rodzinnej skladany razem z wnioskiem ERSU`,

  'zus-z3': `Pomagasz uzytkownikowi przygotowac formularz Z-3 -- Zaswiadczenie platnika skladek.
Kluczowe informacje o Z-3:
- Do czego sluzy: pracodawca (platnik skladek) wystawia to zaswiadczenie na potrzeby ZUS gdy pracownik ubiega sie o zasilek chorobowy
- Kto wystawia: pracodawca (platnik skladek), NIE pracownik
- Co zawiera: dane pracodawcy, wynagrodzenie pracownika z ostatnich 12 miesiecy, informacje o ubezpieczeniu
- Kiedy potrzebne: gdy pracownik jest ubezpieczony u pracodawcy a zasilek wyplaca ZUS (pracodawca ma mniej niz 20 ubezpieczonych)
- Termin: pracodawca musi wystawic niezwlocznie po otrzymaniu wniosku od pracownika`,
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Brak klucza API' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  let body: { formType: string; messages: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const { formType, messages } = body;
  if (!formType || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Missing formType or messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const knowledge = FORM_KNOWLEDGE[formType] ?? `Pomagasz uzytkownikowi wypelnic formularz ZUS. Odpowiadaj po polsku, zwiezle i praktycznie.`;

  const systemPrompt = `Jestes asystentem pomagajacym wypelnic formularze ZUS. Odpowiadaj po polsku.
Zasady:
- Odpowiadaj krótko i konkretnie. Maksymalnie 3-4 zdania na odpowiedz.
- Jesli pytanie jest proste -- jedno zdanie wystarczy.
- Nie dawaj porad prawnych. Jesli pytanie dotyczy indywidualnej sytuacji prawnej -- odeslij do ZUS lub prawnika.
- Bądz przyjazny ale rzeczowy. Bez zbednych formalnosci.

${knowledge}`;

  try {
    const stream = await chatStream([
      { role: 'system', content: systemPrompt },
      ...messages,
    ]);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content ?? '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    console.error('[form-chat] error:', err);
    return new Response(JSON.stringify({ error: 'AI error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
