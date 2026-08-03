import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';
import type { AuditResult } from '@/lib/benefits-audit';

// --- Mocki zależności zewnętrznych: baza, wysyłka maili, właściwy audyt sieci ---
const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => Promise.resolve({ data: [] }),
      upsert: () => Promise.resolve({ error: null }),
    }),
    rpc: () => Promise.resolve({ error: null }),
  }),
}));

vi.mock('@/lib/newsletter', async (orig) => {
  const actual = await orig<typeof import('@/lib/newsletter')>();
  return { ...actual, getResend: () => ({ emails: { send: sendMock } }) };
});

vi.mock('@/lib/benefits-audit', async (orig) => {
  const actual = await orig<typeof import('@/lib/benefits-audit')>();
  return { ...actual, auditAll: vi.fn() };
});

import { GET } from '../route';
import { auditAll } from '@/lib/benefits-audit';

const SECRET = 's3cret';

function makeReq(withSecret: boolean): NextRequest {
  const url = withSecret
    ? `http://localhost/api/cron/benefits-audit?secret=${SECRET}`
    : 'http://localhost/api/cron/benefits-audit';
  return new Request(url) as unknown as NextRequest;
}

function alert(over: Partial<AuditResult> = {}): AuditResult {
  return {
    benefitId: 'b1', benefitName: 'Dodatek energetyczny', category: 'MIESZKANIE',
    url: 'https://gov.pl/x', httpStatus: 200, status: 'CHANGED', contentHash: 'h',
    contentLength: 100, changePct: 0.9, needsReview: true,
    note: 'Treść skurczyła się - sprawdź', ...over,
  };
}

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: 'm1' }, error: null });
  vi.stubEnv('CRON_SECRET', SECRET);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://dummy.supabase.co');
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'dummy-key');
  vi.stubEnv('RESEND_API_KEY', 'test-key');
});

describe('GET /api/cron/benefits-audit - wysyłka maila alertowego', () => {
  it('bez sekretu zwraca 401 i nie wysyła maila', async () => {
    const res = await GET(makeReq(false));
    expect(res.status).toBe(401);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('gdy są alerty - wysyła mail z poprawnym tematem', async () => {
    vi.mocked(auditAll).mockResolvedValue([alert()]);
    const res = await GET(makeReq(true));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);

    const arg = sendMock.mock.calls[0][0] as { subject: string; html: string; to: string };
    expect(arg.subject).toContain('[audyt]');
    expect(arg.subject).toContain('świadczenie wymaga sprawdzenia');
    expect(arg.html).toContain('Dodatek energetyczny');
    expect(arg.html).toContain('Treść skurczyła się - sprawdź');
    expect(arg.html).not.toMatch(/ -- /);
  });

  it('gdy brak alertów - nie wysyła żadnego maila', async () => {
    vi.mocked(auditAll).mockResolvedValue([alert({ needsReview: false, status: 'OK' })]);
    const res = await GET(makeReq(true));

    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
