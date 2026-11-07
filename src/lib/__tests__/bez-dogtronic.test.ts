import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SCIEZKI_MD, llmsFullTxt, llmsTxt, markdownStrony } from '@/lib/llms';
import { POSTS } from '@/data/blog-posts';
import { wpisMd } from '@/lib/blog';
import { STRONY } from '@/lib/strony';

// Decyzja Kamila (7.11.2026): w aplikacjach tuKamil nie ma nazwy firmy, z którą związane są DogInvoice i DogAnswer.
// Produkty zostają z linkami do doginvoice.com i doganswer.com. Pilnujemy treści dla ludzi i dla AI.
const ZAKAZANE = /dogtronic|\bdlabs\b|hajdowska|9462765575/i;
const ROOT = path.resolve(__dirname, '../../..');

function pliki(katalog: string, rozszerzenia: RegExp): string[] {
  const wynik: string[] = [];
  for (const wpis of fs.readdirSync(katalog, { withFileTypes: true })) {
    const p = path.join(katalog, wpis.name);
    if (wpis.isDirectory()) wynik.push(...pliki(p, rozszerzenia));
    else if (rozszerzenia.test(wpis.name)) wynik.push(p);
  }
  return wynik;
}

describe('bez Dogtronic Labs', () => {
  it('llms.txt i llms-full.txt', () => {
    expect(llmsTxt()).not.toMatch(ZAKAZANE);
    expect(llmsFullTxt()).not.toMatch(ZAKAZANE);
  });

  it('wersje .md stron i wpisów', () => {
    expect(SCIEZKI_MD.length).toBeGreaterThan(5);
    for (const s of SCIEZKI_MD) expect(markdownStrony(s) ?? '', s).not.toMatch(ZAKAZANE);
    for (const p of POSTS) expect(wpisMd(p), p.slug).not.toMatch(ZAKAZANE);
  });

  it('rejestr stron: tytuły, opisy i słowa kluczowe', () => {
    expect(JSON.stringify(STRONY)).not.toMatch(ZAKAZANE);
  });

  it('kod stron i komponentów oraz pliki w public/ (poza grą)', () => {
    const kod = pliki(path.join(ROOT, 'src'), /\.(tsx?|md|json)$/).filter(p => !p.includes('__tests__') && !p.endsWith('domeny-jednorazowe.ts'));
    const pub = pliki(path.join(ROOT, 'public'), /\.(html|md|txt|json|xml|js|mjs|css|svg)$/);
    const trafienia = [...kod, ...pub].filter(p => ZAKAZANE.test(fs.readFileSync(p, 'utf8'))).map(p => path.relative(ROOT, p));
    expect(trafienia).toEqual([]);
  });
});
