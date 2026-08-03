import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}));

import {
  buildAlertHtml,
  buildWelcomeHtml,
  sendProgramAlert,
  sendWelcomeEmail,
  type AlertEmailData,
} from '../emailAlerts';

const data: AlertEmailData = {
  to: 'firma@example.com',
  programName: 'Kredyt technologiczny',
  institution: 'Bank Gospodarstwa Krajowego',
  openDate: '1 września 2026',
  closeDate: '30 września 2026',
  maxAmountDesc: 'do 3 mln zł',
  url: 'https://bgk.pl/program',
  panelUrl: 'https://wezmezadarmo.com/dotacje/panel',
};

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: 'msg-1' }, error: null });
  vi.stubEnv('RESEND_API_KEY', 'test-key');
});

describe('buildAlertHtml - treść alertu dotacyjnego', () => {
  const html = buildAlertHtml(data);

  it('zawiera nazwę programu, instytucję i kwotę', () => {
    expect(html).toContain('Kredyt technologiczny');
    expect(html).toContain('Bank Gospodarstwa Krajowego');
    expect(html).toContain('do 3 mln zł');
  });

  it('pokazuje termin składania gdy podany', () => {
    expect(html).toContain('Termin składania wniosków');
    expect(html).toContain('30 września 2026');
  });

  it('ukrywa termin składania gdy brak (closeDate = null)', () => {
    const noClose = buildAlertHtml({ ...data, closeDate: null });
    expect(noClose).not.toContain('Termin składania wniosków');
  });

  it('nie zawiera zakazanego "-- " ani emoji', () => {
    expect(html).not.toMatch(/ -- /);
    expect(html).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  it('zawiera oba przyciski CTA (program + panel)', () => {
    expect(html).toContain('https://bgk.pl/program');
    expect(html).toContain('https://wezmezadarmo.com/dotacje/panel');
  });
});

describe('buildWelcomeHtml - powitanie firmy', () => {
  const html = buildWelcomeHtml('ACME Sp. z o.o.', 'https://wezmezadarmo.com/dotacje/panel');

  it('zawiera nazwę firmy i CTA do panelu', () => {
    expect(html).toContain('ACME Sp. z o.o.');
    expect(html).toContain('Przejdź do panelu');
  });

  it('nie zawiera zakazanego "-- " ani emoji', () => {
    expect(html).not.toMatch(/ -- /);
    expect(html).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });
});

describe('sendProgramAlert - wysyłka', () => {
  it('woła Resend z tematem zawierającym nazwę programu', async () => {
    await sendProgramAlert(data);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const arg = sendMock.mock.calls[0][0] as { to: string; subject: string; html: string };
    expect(arg.to).toBe('firma@example.com');
    expect(arg.subject).toContain('Kredyt technologiczny');
    expect(arg.html).toContain('Bank Gospodarstwa Krajowego');
  });

  it('rzuca błąd gdy Resend zwraca error', async () => {
    sendMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    await expect(sendProgramAlert(data)).rejects.toThrow(/boom/);
  });
});

describe('sendWelcomeEmail - wysyłka', () => {
  it('woła Resend z tematem powitalnym bez "--"', async () => {
    await sendWelcomeEmail('firma@example.com', 'ACME');
    expect(sendMock).toHaveBeenCalledTimes(1);
    const arg = sendMock.mock.calls[0][0] as { to: string; subject: string };
    expect(arg.to).toBe('firma@example.com');
    expect(arg.subject).toContain('Konto aktywne');
    expect(arg.subject).not.toContain('--');
  });
});
