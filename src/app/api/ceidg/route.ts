import { NextRequest, NextResponse } from 'next/server';
import { lookupNip, validateNip } from '@/lib/ceidg';

export async function POST(request: NextRequest) {
  try {
    const { nip } = await request.json();

    if (!nip || typeof nip !== 'string') {
      return NextResponse.json(
        { error: 'Brak numeru NIP' },
        { status: 400 },
      );
    }

    const cleanNip = nip.replace(/[\s-]/g, '');

    if (!validateNip(cleanNip)) {
      return NextResponse.json(
        { error: 'Nieprawidlowy numer NIP' },
        { status: 400 },
      );
    }

    const data = await lookupNip(cleanNip);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Blad serwera';
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
