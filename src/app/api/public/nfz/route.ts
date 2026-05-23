import { NextRequest, NextResponse } from 'next/server';
import { getQueues, searchBenefits, searchProviders, searchDrugs, NFZ_PROVINCE_CODES, type NfzCase } from '@/lib/sources/nfz';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

/**
 * NFZ public API gateway.
 * Use ?type=queues|benefits|providers|drugs (default: queues)
 */

export async function GET(request: NextRequest) {
  const limit = rateLimit('nfz', request, 30, 60_000);
  if (!limit.ok) return limit.response;

  const url = new URL(request.url);
  const type = url.searchParams.get('type') ?? 'queues';

  try {
    if (type === 'benefits') {
      const q = url.searchParams.get('q') ?? '';
      if (q.length < 3) {
        return NextResponse.json({ error: 'Podaj co najmniej 3 znaki' }, { status: 400 });
      }
      const benefits = await searchBenefits(q, 20);
      return NextResponse.json({ benefits });
    }

    if (type === 'providers') {
      const wojRaw = url.searchParams.get('province')?.toLowerCase().trim();
      const province = wojRaw && NFZ_PROVINCE_CODES[wojRaw] ? NFZ_PROVINCE_CODES[wojRaw] : undefined;
      const data = await searchProviders({
        name: url.searchParams.get('name') ?? undefined,
        nip: url.searchParams.get('nip') ?? undefined,
        province,
        page: parseInt(url.searchParams.get('page') ?? '1', 10),
        limit: Math.min(50, parseInt(url.searchParams.get('limit') ?? '20', 10)),
      });
      return NextResponse.json({
        count: data.meta.count,
        providers: data.data.map(p => ({
          code: p.attributes.code,
          name: p.attributes.name,
          nip: p.attributes.nip,
          regon: p.attributes['regon-14'],
          address: p.attributes['street-address'],
          city: p.attributes['place-of-business'],
          postCode: p.attributes['post-code'],
          phone: p.attributes['phone-pin'],
          www: p.attributes.www,
          email: p.attributes.email,
        })),
      });
    }

    if (type === 'drugs') {
      const name = url.searchParams.get('name');
      if (!name || name.length < 3) {
        return NextResponse.json({ error: 'Podaj nazwe leku (min 3 znaki)' }, { status: 400 });
      }
      const data = await searchDrugs({
        name,
        page: parseInt(url.searchParams.get('page') ?? '1', 10),
        limit: Math.min(50, parseInt(url.searchParams.get('limit') ?? '20', 10)),
      });
      return NextResponse.json({
        count: data.meta.count,
        drugs: data.data.map(d => ({
          name: d.attributes.name,
          commonName: d.attributes['common-name'],
          power: d.attributes.power,
          pack: d.attributes.pack,
          refund: d.attributes.refund,
          lumpSumFee: d.attributes['lump-sum-fee'],
          hundred: d.attributes.hundred,
          thirty: d.attributes.thirty,
          fifty: d.attributes.fifty,
          free: d.attributes.free,
          validFrom: d.attributes.validFrom,
          validTo: d.attributes.validTo,
        })),
      });
    }

    // Default: queues
    const benefit = url.searchParams.get('benefit');
    if (!benefit) {
      return NextResponse.json({ error: 'Brakuje parametru "benefit"' }, { status: 400 });
    }
    const caseParam = url.searchParams.get('case');
    const caseType: NfzCase = caseParam === '2' ? 2 : 1;
    const wojRaw = url.searchParams.get('province')?.toLowerCase().trim();
    const province = wojRaw && NFZ_PROVINCE_CODES[wojRaw] ? NFZ_PROVINCE_CODES[wojRaw] : undefined;
    const locality = url.searchParams.get('locality') ?? undefined;

    const data = await getQueues({
      benefit, caseType, province, locality,
      page: parseInt(url.searchParams.get('page') ?? '1', 10),
      limit: Math.min(50, parseInt(url.searchParams.get('limit') ?? '25', 10)),
    });

    const results = data.data.map(item => ({
      provider: item.attributes.provider,
      providerCode: item.attributes['provider-code'],
      locality: item.attributes.locality,
      address: item.attributes.address,
      phone: item.attributes.phone,
      benefit: item.attributes.benefit,
      awaiting: item.attributes.statistics?.['provider-data']?.awaiting ?? null,
      averageDays: item.attributes.statistics?.['provider-data']?.['average-period'] ?? null,
      firstAvailable: item.attributes.dates?.date ?? null,
      dataAsOf: item.attributes.dates?.['date-situation-as-at'] ?? null,
    }));

    return NextResponse.json({
      count: data.meta.count,
      page: data.meta.page,
      limit: data.meta.limit,
      results,
    });
  } catch (err) {
    return publicError(err, 'nfz');
  }
}
