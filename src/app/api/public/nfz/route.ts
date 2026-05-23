import { NextRequest, NextResponse } from 'next/server';
import { getQueues, searchBenefits, searchProviders, NFZ_PROVINCE_CODES, type NfzCase } from '@/lib/sources/nfz';
import { rateLimit, publicError } from '@/lib/sources/_helpers';

/**
 * NFZ public API gateway.
 * Use ?type=queues|benefits|providers (default: queues)
 *
 * NOTE: refundacja leków nie jest dostępna jako REST API NFZ
 * (lista refundacyjna to PDF/Excel publikowane przez Min. Zdrowia).
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
      const branch = wojRaw && NFZ_PROVINCE_CODES[wojRaw] ? NFZ_PROVINCE_CODES[wojRaw] : undefined;
      const name = url.searchParams.get('name')?.trim();
      // Min length 3 for name; or province must be provided
      if ((!name || name.length < 3) && !branch) {
        return NextResponse.json({ error: 'Podaj nazwę (min 3 znaki) lub województwo' }, { status: 400 });
      }
      const yearParam = parseInt(url.searchParams.get('year') ?? String(new Date().getFullYear()), 10);
      const data = await searchProviders({
        name,
        nip: url.searchParams.get('nip') ?? undefined,
        branch,
        year: yearParam,
        page: parseInt(url.searchParams.get('page') ?? '1', 10),
        limit: Math.min(50, parseInt(url.searchParams.get('limit') ?? '20', 10)),
      });
      const entries = data.data?.entries ?? [];
      return NextResponse.json({
        count: data.meta?.count ?? 0,
        providers: entries.map(p => ({
          code: p.attributes.code,
          name: p.attributes.name,
          nip: p.attributes.nip,
          regon: p.attributes.regon,
          street: p.attributes.street,
          place: p.attributes.place,
          postCode: p.attributes['post-code'],
          phone: p.attributes.phone,
          branch: p.attributes.branch,
        })),
      });
    }

    if (type === 'drugs') {
      // Drug refundation is not available via public NFZ REST API.
      // The Ministry of Health publishes lista refundacyjna as PDF/Excel.
      return NextResponse.json({
        error: 'Refundacja leków nie jest dostępna w API NFZ',
        info: 'Aktualna lista refundacyjna: https://www.gov.pl/web/zdrowie/obwieszczenia-ministra-zdrowia-w-sprawie-wykazu-refundowanych-lekow-srodkow-spozywczych',
      }, { status: 410 });
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
