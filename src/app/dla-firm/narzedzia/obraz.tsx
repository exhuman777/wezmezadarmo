import { ImageResponse } from 'next/og';
import { ZNAK, ZNAK_KOLORY } from '@/lib/znak';

/** Znak marki z pikseli (te same dane co PixelMark), bo ImageResponse nie rysuje SVG z komponentu klienta. */
function Znak({ piksel }: { piksel: number }) {
  return (
    <div style={{ display: 'flex', position: 'relative', width: 16 * piksel, height: 16 * piksel }}>
      {ZNAK.flatMap((wiersz, y) =>
        wiersz.split('').map((c, x) =>
          c === '.' ? null : <div key={`${x}-${y}`} style={{ position: 'absolute', left: x * piksel, top: y * piksel, width: piksel, height: piksel, background: ZNAK_KOLORY[c] }} />,
        ),
      )}
    </div>
  );
}

export const OG_ROZMIAR = { width: 1200, height: 630 };

/** Obraz OG dla stron narzędzi: papier, tusz, rdza (tokeny strony), bez gradientów. */
export function obrazNarzedzia(nazwa: string, podpis: string): ImageResponse {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f6f0e4', color: '#2b2420', padding: '64px 72px', border: '16px solid #2b2420' }}>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 32, fontWeight: 700 }}><Znak piksel={3} /><div style={{ display: 'flex', marginLeft: 16 }}>wezmezadarmo.com / dla firm</div></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>{nazwa}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#6f655b', marginTop: 24 }}>{podpis}</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', background: '#c4483a', color: '#ffffff', fontSize: 30, fontWeight: 700, padding: '14px 26px' }}>Za darmo, bez konta</div>
        </div>
      </div>
    ),
    OG_ROZMIAR,
  );
}
