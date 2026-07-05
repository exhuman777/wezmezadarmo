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
import { checkRateLimitDurable } from '@/lib/rateLimit';

export async function OPTIONS() {
  return optionsResponse();
}

/**
 * Per-form knowledge injected as runtime context.
 * The wniosek agent provides persona, rules, boundaries.
 * This dict provides form-specific details.
 */
const FORM_KNOWLEDGE: Record<string, string> = {
  'zus-zas53': `Formularz ZAS-53: Wniosek o wypłatę zasiłku chorobowego.
Komu przysługuje: osobie ubezpieczonej chorobowo (pracownik, zleceniobiorca, przedsiębiorca) która stała się niezdolna do pracy z powodu choroby.
Podstawowe dokumenty: zaświadczenie lekarskie e-ZLA (wystawione elektronicznie przez lekarza), PESEL, dane pracodawcy (NIP, REGON).
Termin złożenia: do 6 miesięcy od pierwszego dnia zwolnienia. Po upływie zasiłek przepada.
Wysokość zasiłku: zazwyczaj 80% podstawy wymiaru (średnie wynagrodzenie z 12 miesięcy). 100% jeśli niezdolność z powodu wypadku przy pracy, choroby zawodowej, w czasie ciąży lub hospitalizacji powyżej 14 dni.
PESEL płatnika: jeśli pracodawca to osoba fizyczna, w polu NIP płatnika wpisz jej PESEL.
Numer konta: można podać, jeśli chcesz otrzymać wypłatę bezpośrednio na konto (opcjonalne).
Gdzie złożyć: do pracodawcy (jeśli ma co najmniej 20 ubezpieczonych) lub bezpośrednio do ZUS.`,

  'zus-z15a': `Formularz Z-15A: Wniosek o zasiłek opiekuńczy na dziecko.
Komu przysługuje: rodzicowi lub opiekunowi prawnemu opiekującemu się chorym dzieckiem do 14 lat (lub niepełnosprawnym do 18 lat) albo dzieckiem do 8 lat jeśli zamknięto placówkę opiekuńczą.
Warunek: konieczne zaświadczenie lekarskie e-ZLA wystawione na dziecko. Dziecko musi być chore lub placówka zamknięta.
Limit dni: 60 dni w roku kalendarzowym (wspólny limit dla obojga rodziców na dzieci do 8 lat i chore dzieci do 14 lat). 14 dni na dzieci niepełnosprawne.
Wysokość zasiłku: 80% podstawy wymiaru.
Drugi rodzic: jeśli drugi rodzic także pracuje, w oświadczeniu należy podać jego dane i potwierdzić że nie skorzystał z zasiłku.
Płatnik składek: pracodawca lub ZUS (jeśli samozatrudniony).
Termin: wnioskuj jak najszybciej po zakończeniu opieki.`,

  'zus-z15b': `Formularz Z-15B: Wniosek o zasiłek opiekuńczy na członka rodziny.
Komu przysługuje: osobie ubezpieczonej sprawującej opiekę nad chorym dorosłym członkiem rodziny (małżonek, rodzice, teściowie, dziadkowie, wnuki, rodzeństwo, rodzice/dzieci adopcyjni, ojczym/macocha).
Warunek: chory musi mieszkać we wspólnym gospodarstwie domowym z wnioskodawca w czasie sprawowania opieki. Konieczne zaświadczenie lekarskie e-ZLA.
Limit dni: 14 dni w roku kalendarzowym (wspólny limit z Z-15a).
Wysokość zasiłku: 80% podstawy wymiaru.
Relacja pokrewieństwa: należy podać dokładną relację do chorego (np. małżonek, rodzic, teść).
Termin: wnioskuj jak najszybciej po zakończeniu opieki.`,

  'zus-pel': `Formularz PEL: Pełnomocnictwo ogólne do spraw ZUS.
Do czego służy: upoważnienie innej osoby do reprezentowania Cię w sprawach ZUS (np. mąż, żona, księgowa, adwokat).
Kto udziela: osoba fizyczna we własnym imieniu lub reprezentant firmy.
Zakres pełnomocnictwa: wszystkie sprawy w ZUS, tylko PIT-y, lub konkretna czynność.
Pełnomocnik: musi mieć pełna zdolność do czynności prawnych. Może być dowolna osoba, nie musi być prawnikiem.
Gdzie złożyć: w dowolnej jednostce ZUS. Można też przez eZUS z profilem zaufanym.
Odwołanie: pełnomocnictwo można odwołać w dowolnym czasie składając oświadczenie w ZUS.
Podpis: formularz musi być podpisany własnoręczne przez mocodawcę.`,

  'zus-erpo': `Formularz ERPO: Wniosek o emeryturę.
Wiek emerytalny: mężczyźni 65 lat, kobiety 60 lat.
Gdzie złożyć: do ZUS przez eZUS, poczta lub osobiście.
Termin: wnioskuj najwcześniej 30 dni przed planowanym przejściem na emeryturę.
Podstawowe dokumenty: dowód osobisty/paszport, świadectwa pracy, książeczka ubezpieczeniowa.
Emerytura kapitalowa: dla urodzonych po 31.12.1948, część z ZUS, część z OFE lub ZUS.
Staż pracy: nie ma minimalnego stażu, wystarczy osiągnięcie wieku emerytalnego.`,

  'zus-ersu': `Formularz ERU/ERSU: Wniosek Mama 4+ (lub Tata 4+).
Świadczenie Mama 4+: przysługuje matce (lub ojcu w szczególnych przypadkach) która urodziła i wychowała co najmniej 4 dzieci.
Wysokość: równa najniższej emeryturze (w 2026 r. ok. 1900 PLN brutto).
Warunki: osiągnięcie wieku emerytalnego (60 lat kobieta, 65 lat mężczyzna), brak własnych środków utrzymania lub emerytura/renta niższa niż minimum.
Tata 4+: ojciec może ubiegać się jeżeli matka zmarła, porzuciła dzieci lub trwale zaprzestała ich wychowywania.
Gdzie złożyć: do ZUS przez eZUS, poczta lub osobiście.
ERU to formularz oświadczenia o sytuacji rodzinnej składany razem z wnioskiem ERSU.`,

  'zus-z3': `Formularz Z-3: Zaświadczenie płatnika składek.
Do czego służy: pracodawca (płatnik składek) wystawia to zaświadczenie na potrzeby ZUS gdy pracownik ubiega się o zasiłek chorobowy.
Kto wystawia: pracodawca (płatnik składek), NIE pracownik.
Co zawiera: dane pracodawcy, wynagrodzenie pracownika z ostatnich 12 miesięcy, informacje o ubezpieczeniu.
Kiedy potrzebne: gdy pracownik jest ubezpieczony u pracodawcy a zasiłek wypłaca ZUS (pracodawca ma mniej niż 20 ubezpieczonych).
Termin: pracodawca musi wystawić niezwłocznie po otrzymaniu wniosku od pracownika.`,
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ error: 'Brak klucza API' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  // Rate limiting -- shared IP pool
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown';
  const { allowed } = await checkRateLimitDurable(ip);
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

  const knowledge = FORM_KNOWLEDGE[formType] ?? `Pomagasz użytkownikowi wypełnić formularz ZUS. Odpowiadaj po polsku, zwięźle i praktycznie.`;
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
