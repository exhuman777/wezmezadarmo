import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/ai/openrouter';
import { buildVerifierMessages, parseVerifierResponse } from '@/ai/verifierPrompt';
import { applyVerification } from '@/ai/formatResults';
import { matchBenefits } from '@/engine/matcher';
import { UserProfile } from '@/engine/types';

export async function POST(request: NextRequest) {
  try {
    const { profile } = await request.json() as { profile: UserProfile };

    if (!profile || typeof profile.wiek !== 'number') {
      return NextResponse.json(
        { error: 'Brak profilu uzytkownika' },
        { status: 400 },
      );
    }

    // Pass 1: Deterministic matching
    const matches = matchBenefits(profile);

    if (matches.length === 0) {
      return NextResponse.json({ results: [], summary: 'Nie znaleziono swiadczen.' });
    }

    // Pass 2: Adversarial verification
    const verifierMessages = buildVerifierMessages(profile, matches);
    const verifierResponse = await chatCompletion(verifierMessages, 'verifier');
    const verifierResults = parseVerifierResponse(verifierResponse);

    // Merge verification into results
    const verifiedResults = applyVerification(matches, verifierResults);

    return NextResponse.json({ results: verifiedResults });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blad weryfikacji';
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
