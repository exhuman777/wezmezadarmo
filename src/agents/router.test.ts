import { describe, it, expect } from 'vitest';
import { routeToAgent } from './router';

describe('routeToAgent', () => {
  it('routes NFZ questions to nfz-zdrowie', () => {
    expect(routeToAgent('Ile czekam do kardiologa?')).toBe('nfz-zdrowie');
    expect(routeToAgent('Znajdź mi lekarza w Lublinie')).toBe('nfz-zdrowie');
    expect(routeToAgent('Jaka jest jakość powietrza?')).toBe('nfz-zdrowie');
  });

  it('routes benefit questions to swiadczenia', () => {
    expect(routeToAgent('Co mi się należy?')).toBe('swiadczenia');
    expect(routeToAgent('Czy przysługuje mi 800+?')).toBe('swiadczenia');
  });

  it('routes form questions to wnioski', () => {
    expect(routeToAgent('Jak wypełnić Z-15a?')).toBe('wnioski');
    expect(routeToAgent('Potrzebuję formularz PEL')).toBe('wnioski');
  });

  it('routes currency questions to finanse-jdg', () => {
    expect(routeToAgent('Ile kosztuje euro?')).toBe('finanse-jdg');
    expect(routeToAgent('Sprawdź NIP 5252548768')).toBe('finanse-jdg');
  });

  it('routes grant questions to dotacje', () => {
    expect(routeToAgent('Jakie dotacje dla JDG?')).toBe('dotacje');
    expect(routeToAgent('Dofinansowanie PARP')).toBe('dotacje');
  });

  it('routes law questions to prawo-terminy', () => {
    expect(routeToAgent('Co zmienia się w prawie?')).toBe('prawo-terminy');
    expect(routeToAgent('Kiedy termin PIT roczny?')).toBe('prawo-terminy');
  });

  it('routes farmer questions to rolnik', () => {
    expect(routeToAgent('Dopłaty ARiMR')).toBe('rolnik');
    expect(routeToAgent('Pogoda dla rolnika')).toBe('rolnik');
  });

  it('falls back to konsjerz for generic messages', () => {
    expect(routeToAgent('Cześć')).toBe('konsjerz');
    expect(routeToAgent('Dzień dobry')).toBe('konsjerz');
  });

  it('uses profile bias for JDG users on ambiguous queries', () => {
    expect(routeToAgent('Co nowego?', 'jdg')).toBe('finanse-jdg');
    expect(routeToAgent('Co nowego?', 'private')).toBe('konsjerz');
  });
});
