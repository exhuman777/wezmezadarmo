/**
 * POST /api/form-chat
 * Streaming AI chat assistant for ZUS form wizards.
 * Context-aware: knows which form the user is filling.
 * Uses the wniosek agent from the unified agent registry.
 */

import { NextRequest } from 'next/server';
import { chatStream } from '@/ai/openrouter';
import { buildFormChatPrompt } from '@/agents/registry';
import { CORS_HEADERS, optionsResponse } from '@/lib/apiAuth';
import { checkRateLimit } from '@/lib/rateLimit';

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * Per-form knowledge injected as runtime context.
 * The wniosek agent provides persona, rules, boundaries.
 * This dict provides form-specific details.
 */
const FORM_KNOWLEDGE: Record<string, string> = {
  'zus-zas53': `Formularz ZAS-53: Wniosek o wyplate zasilku chorobowego.
Komu przysluguje: osobie ubezpieczonej chorobowo (pracownik, zleceniobiorca, przedsiebiorca) ktora stala sie niezdolna do pracy z powodu choroby.
Podstawowe dokumenty: zaswiadczenie lekarskie e-ZLA (wystawione elektronicznie przez lekarza), PESEL, dane pracodawcy (NIP, REGON).
Termin zlozenia: do 6 miesiecy od pierwszego dnia zwolnienia. Po uplywie zasilek przepada.
Wysokosc zasilku: zazwyczaj 80% podstawy wymiaru (srednie wynagrodzenie z 12 miesiecy). 100% jesli niezdolnosc z powodu wypadku przy pracy, choroby zawodowej, w czasie ciazy lub hospitalizacji powyzej 14 dni.
PESEL platnika: jesli pracodawca to osoba fizyczna, w polu NIP platnika wpisz jej PESEL.
Numer konta: mozna podac, jesli chcesz otrzymac wyplate bezposrednio na konto (opcjonalne).
Gdzie zlozyc: do pracodawcy (jesli ma co najmniej 20 ubezpieczonych) lub bezposrednio do ZUS.`,

  'zus-z15a': `Formularz Z-15A: Wniosek o zasilek opiekunczy na dziecko.
Komu przysluguje: rodzicowi lub opiekunowi prawnemu opiekujacemu sie chorym dzieckiem do 14 lat (lub niepelnosprawnym do 18 lat) albo dzieckiem do 8 lat jesli zamknieto placowke opiekuncza.
Warunek: konieczne zaswiadczenie lekarskie e-ZLA wystawione na dziecko. Dziecko musi byc chore lub placowka zamknieta.
Limit dni: 60 dni w roku kalendarzowym (wspolny limit dla obojga rodzicow na dzieci do 8 lat i chore dzieci do 14 lat). 14 dni na dzieci niepelnosprawne.
Wysokosc zasilku: 80% podstawy wymiaru.
Drugi rodzic: jesli drugi rodzic takze pracuje, w oswiadczeniu nalezy podac jego dane i potwierdzic ze nie skorzystal z zasilku.
Platnik skladek: pracodawca lub ZUS (jesli samozatrudniony).
Termin: wnioskuj jak najszybciej po zakonczeniu opieki.`,

  'zus-z15b': `Formularz Z-15B: Wniosek o zasilek opiekunczy na czlonka rodziny.
Komu przysluguje: osobie ubezpieczonej sprawujacej opieke nad chorym doroslym czlonkiem rodziny (malzonek, rodzice, tesciowie, dziadkowie, wnuki, rodzenstwo, rodzice/dzieci adopcyjni, ojczym/macocha).
Warunek: chory musi mieszkac we wspolnym gospodarstwie domowym z wnioskodawca w czasie sprawowania opieki. Konieczne zaswiadczenie lekarskie e-ZLA.
Limit dni: 14 dni w roku kalendarzowym (wspolny limit z Z-15a).
Wysokosc zasilku: 80% podstawy wymiaru.
Relacja pokrewienstwa: nalezy podac dokladna relacje do chorego (np. malzonek, rodzic, tesc).
Termin: wnioskuj jak najszybciej po zakonczeniu opieki.`,

  'zus-pel': `Formularz PEL: Pelnomocnictwo ogolne do spraw ZUS.
Do czego sluzy: upowaznienie innej osoby do reprezentowania Cie w sprawach ZUS (np. maz, zona, ksiegowa, adwokat).
Kto udziela: osoba fizyczna we wlasnym imieniu lub reprezentant firmy.
Zakres pelnomocnictwa: wszystkie sprawy w ZUS, tylko PIT-y, lub konkretna czynnosc.
Pelnomocnik: musi miec pelna zdolnosc do czynnosci prawnych. Moze byc dowolna osoba, nie musi byc prawnikiem.
Gdzie zlozyc: w dowolnej jednostce ZUS. Mozna tez przez eZUS z profilem zaufanym.
Odwolanie: pelnomocnictwo mozna odwolac w dowolnym czasie skladajac oswiadczenie w ZUS.
Podpis: formularz musi byc podpisany wlasnoreczne przez mocodawce.`,

  'zus-erpo': `Formularz ERPO: Wniosek o emeryture.
Wiek emerytalny: mezczyzni 65 lat, kobiety 60 lat.
Gdzie zlozyc: do ZUS przez eZUS, poczta lub osobiscie.
Termin: wnioskuj najwczesniej 30 dni przed planowanym przejsciem na emeryture.
Podstawowe dokumenty: dowod osobisty/paszport, swiadectwa pracy, ksiazeczka ubezpieczeniowa.
Emerytura kapitalowa: dla urodzonych po 31.12.1948, czesc z ZUS, czesc z OFE lub ZUS.
Staz pracy: nie ma minimalnego stazu, wystarczy osiagniecie wieku emerytalnego.`,

  'zus-ersu': `Formularz ERU/ERSU: Wniosek Mama 4+ (lub Tata 4+).
Swiadczenie Mama 4+: przysluguje matce (lub ojcu w szczegolnych przypadkach) ktora urodzila i wychowala co najmniej 4 dzieci.
Wysokosc: rowna najnizszej emeryturze (w 2026 r. ok. 1900 PLN brutto).
Warunki: osiagniecie wieku emerytalnego (60 lat kobieta, 65 lat mezczyzna), brak wlasnych srodkow utrzymania lub emerytura/renta nizsza niz minimum.
Tata 4+: ojciec moze ubiegac sie jezeli matka zmarla, porzucila dzieci lub trwale zaprzestala ich wychowywania.
Gdzie zlozyc: do ZUS przez eZUS, poczta lub osobiscie.
ERU to formularz oswiadczenia o sytuacji rodzinnej skladany razem z wnioskiem ERSU.`,

  'zus-z3': `Formularz Z-3: Zaswiadczenie platnika skladek.
Do czego sluzy: pracodawca (platnik skladek) wystawia to zaswiadczenie na potrzeby ZUS gdy pracownik ubiega sie o zasilek chorobowy.
Kto wystawia: pracodawca (platnik skladek), NIE pracownik.
Co zawiera: dane pracodawcy, wynagrodzenie pracownika z ostatnich 12 miesiecy, informacje o ubezpieczeniu.
Kiedy potrzebne: gdy pracownik jest ubezpieczony u pracodawcy a zasilek wyplaca ZUS (pracodawca ma mniej niz 20 ubezpieczonych).
Termin: pracodawca musi wystawic niezwlocznie po otrzymaniu wniosku od pracownika.`,
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

  // Rate limiting -- shared IP pool
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown';
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'limit',
        message: 'Osiągnąłeś dzienny limit pytań. Limit resetuje się po 24 godzinach.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    );
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
  const systemPrompt = buildFormChatPrompt(knowledge);

  try {
    const stream = await chatStream([
      { role: 'system', content: systemPrompt },
      ...messages,
    ], 'lite');

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
