import { NextResponse } from 'next/server';

/** Zwraca 401 z WWW-Authenticate header -- przeglądarka pokazuje natywny popup auth. */
export async function GET() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="wezmezadarmo admin", charset="UTF-8"',
    },
  });
}
