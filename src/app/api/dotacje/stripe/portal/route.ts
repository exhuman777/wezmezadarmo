import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Płatności wyłączone. WezmeZadarmo jest projektem pro bono - wszystkie funkcje serwisu
// są bezpłatne (z limitami uczciwego użycia). Ten endpoint pozostaje wyłączony.
export async function POST() {
  return NextResponse.json(
    { error: 'Płatności są wyłączone. Wszystkie funkcje serwisu są bezpłatne.' },
    { status: 410 },
  );
}
