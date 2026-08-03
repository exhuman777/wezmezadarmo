/**
 * Wspólny audyt higieny WSZYSTKICH maili wysyłanych przez serwis.
 * Reguły projektu (AGENTS.md): brak emoji, brak "--" w tekstach widocznych
 * dla użytkownika, poprawna struktura HTML. Jeśli powstanie nowy builder maila,
 * dopisz go do tablicy EMAILS poniżej, aby był objęty tymi samymi regułami.
 */
import { describe, it, expect } from 'vitest';
import { buildAuditHtml, type AuditEmailStats } from '../audit.html';
import { buildDigestHtml } from '../digest.html';
import type { DigestPayload } from '@/lib/digest';
import { confirmEmailHtml } from '@/lib/newsletter';
import { buildAlertHtml, buildWelcomeHtml, type AlertEmailData } from '@/lib/dotacje/emailAlerts';
import type { AuditResult } from '@/lib/benefits-audit';

const auditStats: AuditEmailStats = {
  total: 133, ok: 91, changed: 42, notFound: 1,
  redirects: 1, timeouts: 1, blocked: 1, durationMs: 20200,
};
const auditAlerts: AuditResult[] = [
  { benefitId: 'x', benefitName: 'Dodatek energetyczny', category: 'MIESZKANIE',
    url: 'https://gov.pl/x', httpStatus: 200, status: 'CHANGED', contentHash: 'a',
    contentLength: 227, changePct: 0.9, needsReview: true, note: 'Treść skurczyła się - sprawdź' },
  { benefitId: 'y', benefitName: 'Becikowe', category: 'RODZINA',
    url: 'https://gov.pl/y', httpStatus: 404, status: 'NOT_FOUND', contentHash: null,
    contentLength: 0, changePct: null, needsReview: true, note: 'HTTP 404 - strona źródłowa nie istnieje' },
];

const digestPayload: DigestPayload = {
  to: 'user@example.com',
  hasContent: true,
  date: '3 sierpnia 2026',
  rssItems: [{
    id: 'i1', title: 'Nowe przepisy ZUS', link: 'https://zus.pl/a', description: '',
    pubDate: '2026-08-01T10:00:00Z', source: 'ZUS', sourceId: 'zus', audiences: ['wszyscy'],
  }],
  benefits: [],
};

const alertData: AlertEmailData = {
  to: 'firma@example.com',
  programName: 'Kredyt technologiczny BGK',
  institution: 'Bank Gospodarstwa Krajowego',
  openDate: '1 września 2026',
  closeDate: '30 września 2026',
  maxAmountDesc: 'do 3 mln zł',
  url: 'https://bgk.pl/program',
  panelUrl: 'https://wezmezadarmo.com/dotacje/panel',
};

const EMAILS: Array<{ name: string; html: string }> = [
  { name: 'audyt zrodloUrl', html: buildAuditHtml(auditAlerts, auditStats, '3.08.2026') },
  { name: 'digest agenta', html: buildDigestHtml(digestPayload) },
  { name: 'newsletter (potwierdzenie, private)', html: confirmEmailHtml('tok123', 'private') },
  { name: 'newsletter (potwierdzenie, jdg)', html: confirmEmailHtml('tok123', 'jdg') },
  { name: 'dotacje - alert programu', html: buildAlertHtml(alertData) },
  { name: 'dotacje - powitanie', html: buildWelcomeHtml('ACME Sp. z o.o.', 'https://wezmezadarmo.com/dotacje/panel') },
];

// Zakres emoji + typowe symbole graficzne (piktogramy), z pominięciem &rarr; itp. encji.
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}]/u;

describe.each(EMAILS)('higiena maila: $name', ({ html }) => {
  it('nie zawiera emoji', () => {
    expect(html).not.toMatch(EMOJI_RE);
  });

  it('nie zawiera zakazanego "-- " (długi myślnik zastąpiony pojedynczym)', () => {
    // Ignorujemy komentarze HTML (<!-- -->), sprawdzamy widoczny tekst.
    const withoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
    expect(withoutComments).not.toMatch(/ -- /);
    expect(withoutComments).not.toMatch(/\w-- /);
  });

  it('ma poprawny szkielet HTML (DOCTYPE + lang="pl")', () => {
    expect(html).toMatch(/^<!DOCTYPE html>/i);
    expect(html).toContain('lang="pl"');
    expect(html).toContain('charset');
  });

  it('nie zawiera pustych placeholderów typu undefined/null/NaN', () => {
    expect(html).not.toContain('undefined');
    expect(html).not.toContain('NaN');
    expect(html).not.toMatch(/>\s*null\s*</);
  });
});

describe('prywatność: maile nie ujawniają zbędnych danych', () => {
  it('digest nie zawiera adresu e-mail odbiorcy w treści', () => {
    const html = buildDigestHtml({ ...digestPayload, to: 'tajny@example.com' });
    // adres pojawia się wyłącznie w zakodowanym linku wypisu, nie jako czysty tekst
    const visible = html.replace(/href="[^"]*"/g, '');
    expect(visible).not.toContain('tajny@example.com');
  });
});
