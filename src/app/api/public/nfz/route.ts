import { NextRequest, NextResponse } from 'next/server';
import { getQueues, NFZ_PROVINCE_CODES, type NfzCase } from '@/lib/sources/nfz';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

export async function GET(request: NextRequest) {
  const limit = rateLimit('nfz', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const benefit = url.searchParams.get('benefit');
  if (!benefit) {
    return NextResponse.json({ error: 'Brakuje parametru "benefit"' }, { status: 400 });
  }
  const caseParam = url.searchParams.get('case');
  const caseType: NfzCase = caseParam === '2' ? 2 : 1;
  const wojRaw = url.searchParams.get('province')?.toLowerCase().trim();
  const province = wojRaw && NFZ_PROVINCE_CODES[wojRaw] ? NFZ_PROVINCE_CODES[wojRaw] : undefined;
  const locality = url.searchParams.get('locality') ?? undefined;

  try {
    const data = await getQueues({ benefit, caseType, province, locality, limit: 10 });
    const results = data.data.map(item => ({
      provider: item.attributes.provider,
      locality: item.attributes.locality,
      address: item.attributes.address,
      phone: item.attributes.phone,
      benefit: item.attributes.benefit,
      awaiting: item.attributes.statistics?.['provider-data']?.awaiting ?? null,
      averageDays: item.attributes.statistics?.['provider-data']?.['average-period'] ?? null,
      firstAvailable: item.attributes.dates?.date ?? null,
    }));
    return NextResponse.json({ count: data.meta.count, results });
  } catch (err) {
    return publicError(err, 'nfz');
  }
}
