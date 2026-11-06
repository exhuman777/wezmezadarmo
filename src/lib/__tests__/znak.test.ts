import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ZNAK, ZNAK_KOLORY, znakSvg } from '@/lib/znak';

describe('znak marki', () => {
  it('siatka 16 x 16 i każdy znak ma kolor', () => {
    expect(ZNAK).toHaveLength(16);
    for (const wiersz of ZNAK) {
      expect(wiersz).toHaveLength(16);
      for (const c of wiersz) if (c !== '.') expect(ZNAK_KOLORY[c]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('public/press/znak.svg odpowiada znakowi z kodu', () => {
    const plik = readFileSync(path.join(process.cwd(), 'public/press/znak.svg'), 'utf8');
    expect(plik).toBe(znakSvg());
  });
});
