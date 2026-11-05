/* Pikselowe ikony-akcenty 16 x 16 z kitu scen pixelkamil (dist-sceny/ikony): prostokąty [x, y, szer., wys.] na siatce 16 x 16.
   Rysowane w kolorze tekstu (currentColor), bez rozmycia (crispEdges). Rozmiar zawsze wielokrotnością 16 px, żeby piksele były równe. */
const IKONY: Record<string, number[][]> = {
  gwiazdka: [[7, 0, 1, 1], [7, 1, 1, 1], [6, 2, 3, 1], [6, 3, 3, 1], [0, 4, 14, 1], [1, 5, 12, 1], [3, 6, 8, 1], [3, 7, 9, 1], [2, 8, 5, 1], [8, 8, 5, 1], [2, 9, 3, 1], [10, 9, 3, 1], [1, 10, 2, 1], [12, 10, 2, 1]],
  czat: [[1, 1, 12, 1], [0, 2, 1, 1], [13, 2, 1, 1], [0, 3, 1, 1], [2, 3, 10, 1], [13, 3, 1, 1], [0, 4, 1, 1], [13, 4, 1, 1], [0, 5, 1, 1], [2, 5, 7, 1], [13, 5, 1, 1], [0, 6, 1, 1], [13, 6, 1, 1], [1, 7, 12, 1], [3, 8, 2, 1], [3, 9, 1, 1], [2, 10, 1, 1]],
  dokument: [[2, 0, 10, 1], [2, 1, 1, 1], [11, 1, 2, 1], [2, 2, 1, 1], [11, 2, 1, 1], [13, 2, 1, 1], [2, 3, 1, 1], [11, 3, 4, 1], [2, 4, 1, 1], [14, 4, 1, 1], [2, 5, 1, 1], [4, 5, 6, 1], [14, 5, 1, 1], [2, 6, 1, 1], [14, 6, 1, 1], [2, 7, 1, 1], [4, 7, 8, 1], [14, 7, 1, 1], [2, 8, 1, 1], [14, 8, 1, 1], [2, 9, 1, 1], [4, 9, 7, 1], [14, 9, 1, 1], [2, 10, 1, 1], [14, 10, 1, 1], [2, 11, 1, 1], [4, 11, 8, 1], [14, 11, 1, 1], [2, 12, 1, 1], [14, 12, 1, 1], [2, 13, 1, 1], [14, 13, 1, 1], [2, 14, 12, 1]],
};

export type NazwaIkony = 'gwiazdka' | 'czat' | 'dokument';

export function PixelIcon({ nazwa, rozmiar = 32 }: { nazwa: NazwaIkony; rozmiar?: 16 | 32 }) {
  return (
    <svg className="px-ikona" width={rozmiar} height={rozmiar} viewBox="0 0 16 16" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      {IKONY[nazwa].map(([x, y, w, h]) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />)}
    </svg>
  );
}
