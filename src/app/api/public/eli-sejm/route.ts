import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentChanges } from '@/lib/sources/eli-sejm';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('eli-sejm', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim();
  const keywords = q ? q.split(/\s+/).filter(Boolean) : undefined;

  try {
    const acts = await fetchRecentChanges({ keywords });
    return NextResponse.json({ count: acts.length, acts: acts.slice(0, 20) });
  } catch (err) {
    return publicError(err, 'eli-sejm');
  }
}
