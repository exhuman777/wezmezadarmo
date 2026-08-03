import { describe, it, expect } from 'vitest';
import { buildAuditHtml, buildAuditSubject, swiadczeniaPhrase, type AuditEmailStats } from '../audit.html';
import type { AuditResult } from '@/lib/benefits-audit';

function makeStats(overrides: Partial<AuditEmailStats> = {}): AuditEmailStats {
  return {
    total: 133,
    ok: 91,
    changed: 42,
    notFound: 0,
    redirects: 0,
    timeouts: 0,
    blocked: 0,
    durationMs: 20200,
    ...overrides,
  };
}

function makeAlert(overrides: Partial<AuditResult> = {}): AuditResult {
  return {
    benefitId: 'dodatek-energetyczny',
    benefitName: 'Dodatek energetyczny',
    category: 'MIESZKANIE',
    url: 'https://samorzad.gov.pl/web/mops-zgierz/dodatek-energetyczny',
    httpStatus: 200,
    status: 'CHANGED',
    contentHash: 'abc',
    contentLength: 227,
    changePct: 0.95,
    needsReview: true,
    note: 'Treść skurczyła się z 4936 do 227 znaków - sprawdź',
    ...overrides,
  };
}

describe('swiadczeniaPhrase - poprawna polska odmiana', () => {
  it('1 świadczenie (liczba pojedyncza)', () => {
    expect(swiadczeniaPhrase(1)).toBe('1 świadczenie wymaga sprawdzenia');
  });

  it('2-4 świadczenia wymagają', () => {
    expect(swiadczeniaPhrase(2)).toBe('2 świadczenia wymagają sprawdzenia');
    expect(swiadczeniaPhrase(3)).toBe('3 świadczenia wymagają sprawdzenia');
    expect(swiadczeniaPhrase(4)).toBe('4 świadczenia wymagają sprawdzenia');
  });

  it('5+ świadczeń wymaga', () => {
    expect(swiadczeniaPhrase(5)).toBe('5 świadczeń wymaga sprawdzenia');
    expect(swiadczeniaPhrase(42)).toBe('42 świadczenia wymagają sprawdzenia');
    expect(swiadczeniaPhrase(21)).toBe('21 świadczeń wymaga sprawdzenia');
  });

  it('wyjątek 12-14 używa formy dopełniacza', () => {
    expect(swiadczeniaPhrase(12)).toBe('12 świadczeń wymaga sprawdzenia');
    expect(swiadczeniaPhrase(13)).toBe('13 świadczeń wymaga sprawdzenia');
    expect(swiadczeniaPhrase(14)).toBe('14 świadczeń wymaga sprawdzenia');
  });
});

describe('buildAuditSubject', () => {
  it('scenariusz ze zrzutu ekranu: 1 świadczenie', () => {
    expect(buildAuditSubject(1, '3.08.2026')).toBe(
      '[audyt] 1 świadczenie wymaga sprawdzenia (3.08.2026)',
    );
  });

  it('nie zawiera zakazanego "--"', () => {
    expect(buildAuditSubject(42, '3.08.2026')).not.toContain('--');
  });
});

describe('buildAuditHtml - treść maila', () => {
  const html = buildAuditHtml([makeAlert()], makeStats(), '3.08.2026');

  it('zawiera poprawne polskie znaki diakrytyczne', () => {
    expect(html).toContain('Audyt źródeł');
    expect(html).toContain('Zmiana treści');
    expect(html).toContain('Otwórz panel admin');
    expect(html).toContain('automatyczny audyt adresów źródłowych');
  });

  it('NIE zawiera błędnych form bez diakrytyków', () => {
    expect(html).not.toContain('Audyt zrodel');
    expect(html).not.toContain('Zmiana tresci');
    expect(html).not.toContain('Otworz panel');
    expect(html).not.toMatch(/swiadcze[nń] wymaga/);
  });

  it('NIE zawiera emoji', () => {
    expect(html).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u);
  });

  it('NIE zawiera zakazanego "-- " w tekście', () => {
    expect(html).not.toMatch(/-- /);
  });

  it('pokazuje statystyki z odstępami (nie zlepia liczb)', () => {
    expect(html).toContain('Sprawdzono: <strong>133</strong>');
    expect(html).toContain('OK: <strong>91</strong>');
    expect(html).toContain('Zmiana: <strong>42</strong>');
    // odstęp między pozycjami: margin-right zamiast flex gap
    expect(html).toContain('margin-right:18px');
    expect(html).not.toContain('display:flex');
  });

  it('zawiera nazwę i notatkę alertu ze zrzutu', () => {
    expect(html).toContain('Dodatek energetyczny');
    expect(html).toContain('[MIESZKANIE]');
    expect(html).toContain('Treść skurczyła się z 4936 do 227 znaków - sprawdź');
    expect(html).toContain('https://samorzad.gov.pl/web/mops-zgierz/dodatek-energetyczny');
  });

  it('sekcja NOT_FOUND pokazuje link "Znajdź aktualne źródło"', () => {
    const nf = buildAuditHtml(
      [makeAlert({ status: 'NOT_FOUND', note: 'HTTP 404 - strona źródłowa nie istnieje' })],
      makeStats({ notFound: 1 }),
      '3.08.2026',
    );
    expect(nf).toContain('Znajdź aktualne źródło');
    expect(nf).toContain('404 - strona nie istnieje');
    expect(nf).toContain('google.com/search');
  });

  it('escapuje HTML w nazwie świadczenia (bezpieczeństwo)', () => {
    const xss = buildAuditHtml(
      [makeAlert({ benefitName: '<script>alert(1)</script>' })],
      makeStats(),
      '3.08.2026',
    );
    expect(xss).not.toContain('<script>alert(1)</script>');
    expect(xss).toContain('&lt;script&gt;');
  });

  it('poprawny nagłówek dokumentu (DOCTYPE + lang pl)', () => {
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain('<html lang="pl">');
  });

  it('ukrywa sekcje bez alertów', () => {
    const onlyChanged = buildAuditHtml([makeAlert({ status: 'CHANGED' })], makeStats(), '3.08.2026');
    expect(onlyChanged).not.toContain('404 - strona nie istnieje');
    expect(onlyChanged).not.toContain('Timeout (>3 razy)');
  });
});
