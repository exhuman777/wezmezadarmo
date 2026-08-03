import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Resend zanim zaimportujemy moduł, żeby wysyłka nie uderzała w prawdziwe API.
const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}));

import {
  confirmEmailHtml,
  unsubscribeFooter,
  generateToken,
  emailHash,
  verifyEmailHash,
  sendConfirmEmail,
} from '../newsletter';

beforeEach(() => {
  sendMock.mockReset();
  sendMock.mockResolvedValue({ data: { id: 'msg-1' }, error: null });
  vi.stubEnv('RESEND_API_KEY', 'test-key');
});

describe('confirmEmailHtml - treść', () => {
  it('zawiera poprawny polski nagłówek i link potwierdzenia', () => {
    const html = confirmEmailHtml('abc123', 'private');
    expect(html).toContain('Potwierdź zapis na newsletter');
    expect(html).toContain('/api/newsletter/confirm?token=abc123');
    expect(html).toContain('osobę prywatną');
  });

  it('rozróżnia profil firmowy (JDG)', () => {
    const html = confirmEmailHtml('abc123', 'jdg');
    expect(html).toContain('firmę / JDG');
  });

  it('nie zawiera zakazanego "-- " ani emoji', () => {
    const html = confirmEmailHtml('abc123', 'private');
    expect(html).not.toMatch(/ -- /);
    expect(html).not.toMatch(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
  });

  it('escapuje token w URL (bezpieczeństwo)', () => {
    const html = confirmEmailHtml('a b&c', 'private');
    expect(html).toContain('token=a%20b%26c');
  });
});

describe('unsubscribeFooter', () => {
  it('generuje link wypisu z podpisem hash', () => {
    const { html, text } = unsubscribeFooter('user@example.com');
    expect(html).toContain('/api/newsletter/unsubscribe?email=user%40example.com');
    expect(html).toContain('Wypisz się');
    expect(text).toContain('Wypisz się:');
  });
});

describe('tokeny i hash', () => {
  it('generateToken zwraca 32 znaki hex', () => {
    expect(generateToken()).toMatch(/^[0-9a-f]{32}$/);
  });

  it('emailHash jest stabilny i case-insensitive', () => {
    expect(emailHash('User@Example.com')).toBe(emailHash('user@example.com'));
  });

  it('verifyEmailHash potwierdza właściwy hash', () => {
    const h = emailHash('user@example.com');
    expect(verifyEmailHash('user@example.com', h)).toBe(true);
    expect(verifyEmailHash('inny@example.com', h)).toBe(false);
  });
});

describe('sendConfirmEmail - wysyłka', () => {
  it('woła Resend z poprawnym odbiorcą, tematem i treścią', async () => {
    await sendConfirmEmail('nowy@example.com', 'tok-xyz', 'private');
    expect(sendMock).toHaveBeenCalledTimes(1);
    const arg = sendMock.mock.calls[0][0] as { to: string; subject: string; html: string };
    expect(arg.to).toBe('nowy@example.com');
    expect(arg.subject).toContain('Potwierdź zapis na newsletter');
    expect(arg.html).toContain('tok-xyz');
  });
});
