import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/ai/openrouter';
import { buildVerifierMessages, parseVerifierResponse } from '@/ai/verifierPrompt';
import { applyVerification } from '@/ai/formatResults';
import { matchBenefits } from '@/engine/matcher';
import { UserProfile } from '@/engine/types';
import { checkApiKey, unauthorizedResponse, optionsResponse, CORS_HEADERS } from '@/lib/apiAuth';

export async function OPTIONS() {
  return optionsResponse();
}

export async function POST(request: NextRequest) {
  if (!checkApiKey(request)) return unauthorizedResponse();

  try {
    const { profile } = await request.json() as { profile: UserProfile };

    if (!profile || typeof profile.wiek !== 'number') {
      return NextResponse.json(
        { error: 'Brak profilu uzytkownika' },
        { status: 400, headers: CORS_HEADERS },
      );
    }

    // Pass 1: Deterministic matching
    const matches = matchBenefits(profile);

    if (matches.length === 0) {
      return NextResponse.json(
        { results: [], summary: 'Nie znaleziono swiadczen.' },
        { headers: CORS_HEADERS },
      );
    }

    // Pass 2: Adversarial verification (graceful degradation if no API key)
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-key-here') {
      return NextResponse.json({ results: matches, aiVerified: false }, { headers: CORS_HEADERS });
    }

    try {
      const verifierMessages = buildVerifierMessages(profile, matches);
      const verifierResponse = await chatCompletion(verifierMessages, 'verifier');
      const verifierResults = parseVerifierResponse(verifierResponse);
      const verifiedResults = applyVerification(matches, verifierResults);
      return NextResponse.json({ results: verifiedResults, aiVerified: true }, { headers: CORS_HEADERS });
    } catch {
      // Verifier failed, return unverified matches
      return NextResponse.json({ results: matches, aiVerified: false }, { headers: CORS_HEADERS });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blad weryfikacji';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS },
    );
  }
}
