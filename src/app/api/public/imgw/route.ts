import { NextRequest, NextResponse } from 'next/server';
import { fetchWarnings } from '@/lib/sources/imgw';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('imgw', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  try {
    const warnings = await fetchWarnings();
    return NextResponse.json({
      count: warnings.length,
      warnings: warnings.slice(0, 20),
    });
  } catch (err) {
    return publicError(err, 'imgw');
  }
}
