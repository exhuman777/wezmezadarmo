import { describe, it, expect } from 'vitest';
import { buildDigestHtml, buildDigestSubject } from '../digest.html';
import type { DigestPayload } from '@/lib/digest';
import type { Audience } from '@/app/aktualnosci/rss';

function makePayload(overrides: Partial<DigestPayload> = {}): DigestPayload {
  return {
    to: 'user@example.com',
    hasContent: true,
    rssItems: [],
    benefits: [],
    date: '18 maja 2026',
    ...overrides,
  };
}

describe('buildDigestHtml', () => {
  it('zawiera tytuł artykułu RSS', () => {
    const payload = makePayload({
      rssItems: [{
        id: 'item-1',
        title: 'Nowe przepisy ZUS od 2026',
        link: 'https://zus.pl/artykul',
        description: 'Opis artykułu.',
        pubDate: '2026-05-18T10:00:00Z',
        source: 'ZUS',
        sourceId: 'zus',
        audiences: ['wszyscy'],
      }],
    });
    const html = buildDigestHtml(payload);
    expect(html).toContain('Nowe przepisy ZUS od 2026');
  });

  it('zawiera link artykułu RSS', () => {
    const payload = makePayload({
      rssItems: [{
        id: 'item-1',
        title: 'Artykuł testowy',
        link: 'https://zus.pl/artykul-testowy',
        description: '',
        pubDate: null,
        source: 'ZUS',
        sourceId: 'zus',
        audiences: ['wszyscy'],
      }],
    });
    const html = buildDigestHtml(payload);
    expect(html).toContain('https://zus.pl/artykul-testowy');
  });

  it('zawiera datę', () => {
    const payload = makePayload({ date: '18 maja 2026' });
    const html = buildDigestHtml(payload);
    expect(html).toContain('18 maja 2026');
  });

  it('zawiera nazwę świadczenia gdy podana', () => {
    const payload = makePayload({
      benefits: [{
        benefit: {
          id: 'benefit-1',
          nazwa: 'Zasiłek macierzyński',
          kategoria: 'RODZINA',
          kwota: '2000 PLN',
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
        status: 'PRZYSLUGUJE',
        confidence: 'WYSOKA',
        matchedCriteria: [],
        failedCriteria: [],
        warnings: [],
      }],
    });
    const html = buildDigestHtml(payload);
    expect(html).toContain('Zasiłek macierzyński');
  });

  it('NIE zawiera adresu email odbiorcy', () => {
    const payload = makePayload({ to: 'tajny@example.com' });
    const html = buildDigestHtml(payload);
    expect(html).not.toContain('tajny@example.com');
  });

  it('escape HTML w tytule artykułu', () => {
    const payload = makePayload({
      rssItems: [{
        id: 'item-xss',
        title: '<script>alert("xss")</script>',
        link: 'https://example.com',
        description: '',
        pubDate: null,
        source: 'Test',
        sourceId: 'test',
        audiences: ['wszyscy'],
      }],
    });
    const html = buildDigestHtml(payload);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('buildDigestSubject', () => {
  it('pojedyncza aktualizacja -- odmiana', () => {
    const payload = makePayload({
      rssItems: [{
        id: 'i1', title: 'T', link: 'h', description: '', pubDate: null,
        source: 'S', sourceId: 's', audiences: ['wszyscy'],
      }],
      benefits: [],
      date: '18 maja 2026',
    });
    const subject = buildDigestSubject(payload);
    expect(subject).toContain('1');
    expect(subject).toContain('aktualizację');
    expect(subject).toContain('18 maja 2026');
  });

  it('wiele aktualizacji -- odmiana', () => {
    const item = { id: 'i', title: 'T', link: 'h', description: '', pubDate: null, source: 'S', sourceId: 's', audiences: ['wszyscy'] as Audience[] };
    const payload = makePayload({
      rssItems: [{ ...item, id: 'i1' }, { ...item, id: 'i2' }, { ...item, id: 'i3' }],
      benefits: [],
      date: '18 maja 2026',
    });
    const subject = buildDigestSubject(payload);
    expect(subject).toContain('3');
    expect(subject).toContain('aktualizacje');
  });
});
