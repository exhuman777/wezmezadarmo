import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SiecTuKamil } from '@/components/SiecTuKamil';
import { INNE_APLIKACJE, llmsTxt } from '@/lib/llms';
import { LD_ID } from '@/lib/seo';
import { KONTAKT_SIECI, MARKA_TEJ_STRONY, SIEC_TUKAMIL, TA_STRONA } from '@/lib/siec';

// Katalog sieci tuKamil (audyt spójności 6.11.2026): pozycje z wStopce = true, w tej kolejności.
const KATALOG: [string, string][] = [
  ['wezmezadarmo.com', 'https://www.wezmezadarmo.com/'],
  ['yesno.events', 'https://yesno.events/'],
  ['thePolacy', 'https://thepolacy.com/'],
  ['tuKamil', 'https://tukamil.com/'],
  ['Dwie Strony', 'https://dwiestrony.wezmezadarmo.com/'],
  ['Cyfrowy Pomocnik', 'https://www.cyfrowypomocnik.com/'],
  ['Należy się', 'https://nalezysie.wezmezadarmo.com/'],
  ['Asystent Firmy', 'https://asystent24.com/'],
  ['Brand Agent', 'https://brand.cyfrowypomocnik.com/'],
  ['Claude Start', 'https://start.cyfrowypomocnik.com/'],
  ['Recepcja w telefonie', 'https://tukamil.com/recepcja-w-telefonie/'],
  ['pixelkamil', 'https://pixel.tukamil.com/galeria/'],
  ['DogInvoice', 'https://doginvoice.com/'],
  ['DogAnswer', 'https://doganswer.com/'],
];

describe('Sieć tuKamil', () => {
  it('katalog ma wszystkie pozycje stopki w kolejności i z nazwami z katalogu', () => {
    expect(SIEC_TUKAMIL.map(a => [a.nazwa, a.adres])).toEqual(KATALOG);
    for (const a of SIEC_TUKAMIL) expect(a.jednoZdanie.split(/\s+/).length, a.id).toBeLessThanOrEqual(12);
  });

  it('stopka ma wszystkie pozycje katalogu, ta strona bez linku, bez obrazków, kontakt na tukamil.com', () => {
    const html = renderToStaticMarkup(createElement(SiecTuKamil));
    expect(html).toContain('aria-label="Sieć tuKamil"');
    expect(html).toContain('siec-tk--tekst');
    expect(html).not.toContain('<img');
    for (const [nazwa, adres] of KATALOG) {
      if (nazwa === 'wezmezadarmo.com') {
        expect(html).toContain(`<span aria-current="page">${nazwa}</span>`);
        expect(html).not.toContain(`href="${adres}"`);
      } else {
        expect(html, nazwa).toContain(`<a href="${adres}">${nazwa}</a>`);
      }
    }
    expect(html).toContain(`href="${KONTAKT_SIECI}"`);
    expect(KONTAKT_SIECI).toBe('https://tukamil.com/#kontakt');
    expect(html).toContain(`<a href="${MARKA_TEJ_STRONY}">Marka i materiały</a>`);
  });

  it('llms.txt: Inne aplikacje tuKamil z katalogu, z Należy się i Dwiema Stronami, bez tej strony', () => {
    const sekcja = llmsTxt().split('## Inne aplikacje tuKamil\n')[1].split('\n## ')[0];
    for (const [nazwa, adres] of KATALOG) {
      if (nazwa === 'wezmezadarmo.com') expect(sekcja).not.toContain(`(${adres})`);
      else expect(sekcja, nazwa).toContain(`[${nazwa}](${adres})`);
    }
    expect(INNE_APLIKACJE).toHaveLength(KATALOG.length - 1);
    expect(sekcja).not.toContain('YESNO');
    expect(SIEC_TUKAMIL.some(a => a.id === TA_STRONA)).toBe(true);
    expect(MARKA_TEJ_STRONY).toBe('https://tukamil.com/marka/wezmezadarmo/');
    expect(sekcja).toContain(`Materiały marki: ${MARKA_TEJ_STRONY}`);
  });

  it('JSON-LD: tuKamil z @id wspólnym dla całej sieci', () => {
    expect(LD_ID.autor).toBe('https://tukamil.com/#tukamil');
  });
});
