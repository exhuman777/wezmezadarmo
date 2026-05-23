import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRates } from '@/lib/sources/nbp';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('nbp', request, 60, 60_000); // 60/min/IP
  if (!limit.ok) return limit.response;

  try {
    const table = await getCurrentRates();
    return NextResponse.json({
      effectiveDate: table.effectiveDate,
      rates: table.rates.map(r => ({ code: r.code, currency: r.currency, mid: r.mid })),
    });
  } catch (err) {
    return publicError(err, 'nbp');
  }
}
