import { describe, it, expect } from 'vitest';
import { filterRecentItems, buildPrivateDigestPayload, buildJdgDigestPayload } from '../digest';
import type { FeedItem } from '@/app/aktualnosci/rss';
import type { MatchResult } from '@/engine/types';

function makeItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    id: 'test-id',
    title: 'Tytuł artykułu',
    link: 'https://example.com/artykul',
    description: 'Opis artykułu.',
    pubDate: new Date().toISOString(),
    source: 'ZUS',
    sourceId: 'zus',
    audiences: ['wszyscy'],
    ...overrides,
  };
}

function makeMatchResult(status: 'PRZYSLUGUJE' | 'MOZLIWE' | 'NIE_PRZYSLUGUJE' = 'PRZYSLUGUJE'): MatchResult {
  return {
    benefit: {
      id: 'benefit-1',
      nazwa: 'Zasiłek macierzyński',
      opis: 'Opis świadczenia',
      kategoria: 'RODZINA',
      kwota: '2000 PLN',
      kwotaMin: 1000,
      kwotaMax: 3000,
      czestotliwosc: 'miesięcznie',
      wymagania: {},
      wykluczenia: [],
      wniosek: {
        kanal: ['PUE_ZUS'],
        dokumenty: [],
        kroki: [],
        terminRealizacji: '30 dni',
        pulapki: [],
        odwolanie: '',
      },
      zrodloUrl: 'https://zus.pl',
      zrodloNazwa: 'ZUS',
      dataWeryfikacji: '2026-01-01',
      dataWaznosci: '2027-01-01',
    },
    status,
    confidence: 'WYSOKA',
    matchedCriteria: [],
    failedCriteria: [],
    warnings: [],
  };
}

describe('filterRecentItems', () => {
  it('zwraca artykuły z ostatnich 24h', () => {
    const now = new Date();
    const recent = makeItem({ pubDate: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString() });
    const old = makeItem({ id: 'old', pubDate: new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString() });
    const result = filterRecentItems([recent, old], now);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('test-id');
  });

  it('pomija artykuły bez pubDate', () => {
    const item = makeItem({ pubDate: null });
    expect(filterRecentItems([item])).toHaveLength(0);
  });

  it('zwraca pusty array gdy brak wejścia', () => {
    expect(filterRecentItems([])).toHaveLength(0);
  });

  it('pomija artykuły ze zbyt starą datą', () => {
    const now = new Date();
    const old = makeItem({ pubDate: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString() });
    expect(filterRecentItems([old], now)).toHaveLength(0);
  });
});

describe('buildPrivateDigestPayload', () => {
  it('zwraca hasContent=false gdy brak artykułów i świadczeń', () => {
    const payload = buildPrivateDigestPayload('user@example.com', [], []);
    expect(payload.hasContent).toBe(false);
    expect(payload.to).toBe('user@example.com');
  });

  it('zwraca hasContent=true gdy są artykuły', () => {
    const items = [makeItem()];
    const payload = buildPrivateDigestPayload('user@example.com', items, []);
    expect(payload.hasContent).toBe(true);
    expect(payload.rssItems).toHaveLength(1);
  });

  it('filtruje świadczenia do PRZYSLUGUJE i MOZLIWE, max 5', () => {
    const benefits = [
      makeMatchResult('PRZYSLUGUJE'),
      makeMatchResult('MOZLIWE'),
      makeMatchResult('NIE_PRZYSLUGUJE'),
      makeMatchResult('PRZYSLUGUJE'),
      makeMatchResult('PRZYSLUGUJE'),
      makeMatchResult('PRZYSLUGUJE'),
      makeMatchResult('PRZYSLUGUJE'),
    ];
    const payload = buildPrivateDigestPayload('user@example.com', [], benefits);
    expect(payload.benefits.every(b => b.status !== 'NIE_PRZYSLUGUJE')).toBe(true);
    expect(payload.benefits.length).toBeLessThanOrEqual(5);
    expect(payload.hasContent).toBe(true);
  });

  it('max 8 artykułów RSS', () => {
    const items = Array.from({ length: 12 }, (_, i) => makeItem({ id: `item-${i}` }));
    const payload = buildPrivateDigestPayload('user@example.com', items, []);
    expect(payload.rssItems).toHaveLength(8);
  });

  it('zawiera datę', () => {
    const payload = buildPrivateDigestPayload('user@example.com', [], []);
    expect(payload.date).toBeTruthy();
    expect(typeof payload.date).toBe('string');
  });
});

describe('buildJdgDigestPayload', () => {
  it('zwraca hasContent=false gdy brak artykułów', () => {
    const payload = buildJdgDigestPayload('firma@example.com', 'Moja Firma', []);
    expect(payload.hasContent).toBe(false);
  });

  it('filtruje artykuły do audytorium jdg i wszyscy', () => {
    const items = [
      makeItem({ id: 'wszyscy', audiences: ['wszyscy'] }),
      makeItem({ id: 'jdg', audiences: ['jdg'] }),
      makeItem({ id: 'firmy', audiences: ['firmy'] }),
    ];
    const payload = buildJdgDigestPayload('firma@example.com', 'Moja Firma', items);
    expect(payload.rssItems.every(i => ['wszyscy-id', 'jdg-id'].includes(i.id) === false)).toBe(true);
    // firmy-only should be excluded
    expect(payload.rssItems.find(i => i.id === 'firmy')).toBeUndefined();
    expect(payload.rssItems.find(i => i.id === 'wszyscy')).toBeDefined();
    expect(payload.rssItems.find(i => i.id === 'jdg')).toBeDefined();
  });

  it('zawiera companyName', () => {
    const payload = buildJdgDigestPayload('firma@example.com', 'Moja Firma SP. Z O.O.', [makeItem()]);
    expect(payload.companyName).toBe('Moja Firma SP. Z O.O.');
  });

  it('benefits zawsze puste dla JDG', () => {
    const payload = buildJdgDigestPayload('firma@example.com', 'Firma', [makeItem()]);
    expect(payload.benefits).toHaveLength(0);
  });

  it('max 8 artykułów', () => {
    const items = Array.from({ length: 12 }, (_, i) =>
      makeItem({ id: `item-${i}`, audiences: ['wszyscy'] })
    );
    const payload = buildJdgDigestPayload('firma@example.com', 'Firma', items);
    expect(payload.rssItems).toHaveLength(8);
  });
});
