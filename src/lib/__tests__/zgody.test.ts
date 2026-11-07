import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { ZGODY, ZGODY_PUSTE, ZGODY_WERSJA, odczytajZgody, trescZgod } from '@/lib/zgody';

describe('zgody na kontakt', () => {
  it('cztery osobne zgody, wymagana tylko e-mail w sprawie zgłoszenia, telefon tylko z telefonem', () => {
    expect(ZGODY.map(z => z.id)).toEqual(['email', 'emailOferty', 'telefon', 'ai']);
    expect(ZGODY.filter(z => z.wymagana).map(z => z.id)).toEqual(['email']);
    expect(ZGODY.find(z => z.id === 'telefon')?.tylkoZTelefonem).toBe(true);
    expect(ZGODY.find(z => z.id === 'ai')?.tresc).toMatch(/asystenta AI/);
    expect(Object.keys(trescZgod(false))).toEqual(['email', 'emailOferty', 'ai']);
    expect(ZGODY_WERSJA).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('liczy się tylko true; zgoda telefoniczna przepada w formularzu bez telefonu', () => {
    expect(odczytajZgody({ email: 'tak', ai: 1 }, true)).toEqual({ email: false, emailOferty: false, telefon: false, ai: false });
    expect(odczytajZgody({ email: true, telefon: true }, false)).toEqual({ email: true, emailOferty: false, telefon: false, ai: false });
    expect(odczytajZgody(null, true)).toEqual({ email: false, emailOferty: false, telefon: false, ai: false });
  });
  it('domyślnie wszystkie zgody odznaczone', () => {
    expect(Object.values(ZGODY_PUSTE).every(v => v === false)).toBe(true);
    expect(Object.keys(ZGODY_PUSTE).sort()).toEqual(ZGODY.map(z => z.id).sort());
  });
  it('walidacja formularza NIP odrzuca a+1@x.pl i domenę jednorazową', async () => {
    const { walidujLead } = await import('@/lib/narzedzia/walidacja');
    const z = { email: true };
    const plus = walidujLead({ email: 'a+1@x.pl', telefon: '600100200', zgody: z });
    expect(plus.ok).toBe(false);
    expect(!plus.ok && !plus.pulapka && plus.blad).toMatch(/plus/);
    const jedn = walidujLead({ email: 'jan@mailinator.com', telefon: '600100200', zgody: z });
    expect(!jedn.ok && !jedn.pulapka && jedn.blad).toMatch(/jednorazowe/);
    expect(walidujLead({ email: 'jan@firma.pl', telefon: '600100200', zgody: z }).ok).toBe(true);
  });
  it('formularz kontaktowy bez zgody e-mail dostaje 400 (nic nie wychodzi)', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const r = await POST(new NextRequest('http://localhost/api/contact', {
      method: 'POST', body: JSON.stringify({ email: 'a@b.pl', wiadomosc: 'hej', zgody: { ai: true } }),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.9.9.9' },
    }));
    expect(r.status).toBe(400);
  });
  it('formularz kontaktowy z domeną jednorazową dostaje 400', async () => {
    const { POST } = await import('@/app/api/contact/route');
    const r = await POST(new NextRequest('http://localhost/api/contact', {
      method: 'POST', body: JSON.stringify({ email: 'a@mailinator.com', wiadomosc: 'hej', zgody: { email: true } }),
      headers: { 'content-type': 'application/json', 'x-forwarded-for': '10.9.9.8' },
    }));
    expect(r.status).toBe(400);
  });
});
