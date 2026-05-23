import { NextRequest, NextResponse } from 'next/server';
import { searchUnit, fetchUnitData } from '@/lib/sources/bdl-gus';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('bdl-gus', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const terytId = url.searchParams.get('terytId');
  const gmina = url.searchParams.get('gmina');

  try {
    if (terytId) {
      const data = await fetchUnitData(terytId);
      return NextResponse.json({ terytId, data });
    }
    if (gmina) {
      const units = await searchUnit(gmina, 5);
      return NextResponse.json({ units });
    }
    return NextResponse.json({ error: 'Podaj ?gmina= lub ?terytId=' }, { status: 400 });
  } catch (err) {
    return publicError(err, 'bdl-gus');
  }
}
