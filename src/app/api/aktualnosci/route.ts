import { fetchAllFeeds } from '@/app/aktualnosci/rss';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
// Cache at Vercel edge for 30 minutes
export const revalidate = 1800;

export async function GET() {
  const result = await fetchAllFeeds();
  return NextResponse.json({
    ...result,
    fetchedAt: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  });
}
