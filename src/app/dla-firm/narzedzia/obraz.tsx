import { ImageResponse } from 'next/og';

export const OG_ROZMIAR = { width: 1200, height: 630 };

/** Obraz OG dla stron narzędzi: papier, tusz, rdza (tokeny strony), bez gradientów. */
export function obrazNarzedzia(nazwa: string, podpis: string): ImageResponse {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f6f0e4', color: '#2b2420', padding: '64px 72px', border: '16px solid #2b2420' }}>
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>wezmezadarmo.com / dla firm</div>
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
