import { NextResponse } from 'next/server';
import { BENEFITS } from '@/engine/benefits';

const KNOWN_SOURCES = [
  'https://www.gov.pl/web/rodzina',
  'https://www.gov.pl/web/finanse',
  'https://www.zus.pl/swiadczenia',
  'https://www.nfz.gov.pl',
  'https://www.gov.pl/web/klimat',
  'https://www.gov.pl/web/rozwoj-technologia',
];

export async function GET() {
  const existingIds = BENEFITS.map(b => b.id);
  const categoryCounts = new Map<string, number>();

  for (const b of BENEFITS) {
    categoryCounts.set(b.kategoria, (categoryCounts.get(b.kategoria) || 0) + 1);
  }

  const expiredBenefits = BENEFITS.filter(b => {
    const expiry = new Date(b.dataWaznosci);
    return expiry < new Date();
  });

  const staleVerifications = BENEFITS.filter(b => {
    const verified = new Date(b.dataWeryfikacji);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return verified < threeMonthsAgo;
  });

  const missingGuides = BENEFITS.filter(b =>
    b.wniosek.kroki.length === 0 || b.wniosek.dokumenty.length === 0
  );

  const emptyRequirements = BENEFITS.filter(b =>
    Object.keys(b.wymagania).length === 0
  );

  return NextResponse.json({
    summary: {
      totalBenefits: BENEFITS.length,
      categories: Object.fromEntries(categoryCounts),
      sources: KNOWN_SOURCES,
    },
    issues: {
      expired: expiredBenefits.map(b => ({ id: b.id, nazwa: b.nazwa, dataWaznosci: b.dataWaznosci })),
      staleVerifications: staleVerifications.map(b => ({ id: b.id, nazwa: b.nazwa, dataWeryfikacji: b.dataWeryfikacji })),
      missingGuides: missingGuides.map(b => ({ id: b.id, nazwa: b.nazwa })),
      emptyRequirements: emptyRequirements.map(b => ({ id: b.id, nazwa: b.nazwa })),
    },
    suggestedNewBenefits: [
      { nazwa: 'Aktywny Rodzic (Babciowe)', status: 'Do dodania', zrodlo: 'https://www.gov.pl/web/rodzina/aktywny-rodzic' },
      { nazwa: 'Konto Mieszkaniowe', status: 'Do dodania', zrodlo: 'https://www.gov.pl/web/rozwoj-technologia/konto-mieszkaniowe' },
      { nazwa: 'Kredyt na Start', status: 'Do weryfikacji', zrodlo: 'https://www.gov.pl/web/rozwoj-technologia' },
      { nazwa: 'Bon senioralny', status: 'Do weryfikacji', zrodlo: 'https://www.gov.pl/web/rodzina' },
    ],
    existingIds,
    lastCheck: new Date().toISOString(),
  });
}
