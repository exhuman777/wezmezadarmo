/* Znak marki: pikselowy prezent 16 x 16 (wzór jak w public/og-2026-11.png i ikonach w src/app). Tuszowy kontur,
   kokarda i wstążka w rdzy z ciemniejszym węzłem, wieko jaśniejsze, pudełko w zieleni z jasną krawędzią z lewej
   i cieniem z prawej, pod spodem cień w kolorze linii. Stałe kolory z palety, więc znak wygląda tak samo w każdym trybie. */
export const ZNAK: readonly string[] = [
  '...TTT....TTT...',
  '..TRRRT..TRRRT..',
  '..TRPRRTTRRPRT..',
  '...TRRRrrRRRT...',
  '.TTTTTTrrTTTTTT.',
  '.TLLLLPRRLLLLLT.',
  '.TGGGGGRRGGGGGT.',
  '.TTTTTTrrTTTTTT.',
  '..TLGGGRRGGGDT..',
  '..TLGGGRRGGGDT..',
  '..TLGGGRRGGGDT..',
  '..TLGGGRRGGGDT..',
  '..TGGGGRRGGGDT..',
  '..TDDDDrrDDDDT..',
  '..TTTTTTTTTTTT..',
  '...YYYYYYYYYY...',
];
export const ZNAK_KOLORY: Record<string, string> = {
  T: '#2b2420',
  R: '#c4483a',
  r: '#9e3a2f',
  P: '#f6f0e4',
  G: '#2f7d5a',
  L: '#5a9e7e',
  D: '#245f44',
  Y: '#d9cbb2',
};

/**
 * Znak jako samodzielny plik SVG (press kit: public/press/znak.svg). Sąsiednie piksele tego samego koloru
 * w wierszu łączą się w jeden prostokąt, tło przezroczyste, crispEdges, więc znak skaluje się bez rozmycia.
 * Plik w public/ musi być równy wynikowi tej funkcji (test w src/lib/__tests__/znak.test.ts).
 */
export function znakSvg(rozmiar = 512): string {
  const prostokaty: string[] = [];
  ZNAK.forEach((wiersz, y) => {
    let x = 0;
    while (x < wiersz.length) {
      const c = wiersz[x];
      let dl = 1;
      while (x + dl < wiersz.length && wiersz[x + dl] === c) dl++;
      if (c !== '.') prostokaty.push(`<rect x="${x}" y="${y}" width="${dl}" height="1" fill="${ZNAK_KOLORY[c]}"/>`);
      x += dl;
    }
  });
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${rozmiar}" height="${rozmiar}" viewBox="0 0 16 16" shape-rendering="crispEdges">`,
    '<title>wezmezadarmo: znak marki (pikselowy prezent)</title>',
    ...prostokaty,
    '</svg>',
    '',
  ].join('\n');
}
