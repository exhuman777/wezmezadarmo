import { NextRequest, NextResponse } from 'next/server';
import { searchByNip } from '@/lib/sources/whitelist';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('whitelist', request, 10, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const nip = url.searchParams.get('nip')?.replace(/\D/g, '') ?? '';
  if (nip.length !== 10) {
    return NextResponse.json({ error: 'Podaj NIP (10 cyfr)' }, { status: 400 });
  }

  try {
    const subject = await searchByNip(nip);
    if (!subject) {
      return NextResponse.json({ found: false });
    }
    return NextResponse.json({
      found: true,
      name: subject.name,
      nip: subject.nip,
      statusVat: subject.statusVat,
      regon: subject.regon,
      krs: subject.krs,
      address: subject.workingAddress ?? subject.residenceAddress,
      registeredAt: subject.registrationLegalDate,
      removedAt: subject.removalDate,
      accounts: subject.accountNumbers,
    });
  } catch (err) {
    return publicError(err, 'whitelist');
  }
}
