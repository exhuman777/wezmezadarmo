import { describe, it, expect } from 'vitest';
import { buildPreferencesUpdate } from '../route';

const NOW = '2026-08-03T06:00:00.000Z';

describe('buildPreferencesUpdate - zgoda opt-in (RODO)', () => {
  it('włączenie digestu stempluje zgodę i jej źródło', () => {
    const u = buildPreferencesUpdate({ digest_enabled: true }, NOW);
    expect(u.digest_enabled).toBe(true);
    expect(u.digest_consent_at).toBe(NOW);
    expect(u.digest_consent_source).toBe('panel_settings');
  });

  it('wyłączenie digestu kasuje ślad zgody', () => {
    const u = buildPreferencesUpdate({ digest_enabled: false }, NOW);
    expect(u.digest_enabled).toBe(false);
    expect(u.digest_consent_at).toBeNull();
    expect(u.digest_consent_source).toBeNull();
  });

  it('brak pola digest_enabled nie dotyka zgody (aktualizacja tylko kategorii)', () => {
    const u = buildPreferencesUpdate({ categories: ['zus', 'podatki'] }, NOW);
    expect(u).not.toHaveProperty('digest_enabled');
    expect(u).not.toHaveProperty('digest_consent_at');
    expect(u.categories).toEqual(['zus', 'podatki']);
  });

  it('odfiltrowuje niedozwolone kategorie', () => {
    const u = buildPreferencesUpdate({ categories: ['zus', 'hack', 'prawo', ''] }, NOW);
    expect(u.categories).toEqual(['zus', 'prawo']);
  });

  it('włączenie z kategoriami zapisuje jedno i drugie', () => {
    const u = buildPreferencesUpdate({ digest_enabled: true, categories: ['inne'] }, NOW);
    expect(u.digest_enabled).toBe(true);
    expect(u.digest_consent_at).toBe(NOW);
    expect(u.categories).toEqual(['inne']);
  });

  it('puste ciało nie generuje żadnej zmiany', () => {
    expect(buildPreferencesUpdate({}, NOW)).toEqual({});
  });
});
