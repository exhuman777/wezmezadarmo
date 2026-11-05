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
