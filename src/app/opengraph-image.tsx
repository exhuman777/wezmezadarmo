import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'wezmezadarmo: sprawdź, co Ci się należy';

/** Obraz OG serwisu w tokenach strony (papier, tusz, rdza), bez gradientów i rozmyć. Hasło jak w h1 strony głównej. */
export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f6f0e4', color: '#2b2420', padding: '64px 72px', border: '16px solid #2b2420' }}>
        <div style={{ display: 'flex', fontSize: 32, fontWeight: 700 }}>wezmezadarmo.com</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 80, fontWeight: 800, lineHeight: 1.05 }}>Należy Ci się więcej, niż myślisz.</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#6f655b', marginTop: 24 }}>Świadczenia, ulgi i dotacje w jednym miejscu, ze źródłami.</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ display: 'flex', background: '#c4483a', color: '#ffffff', fontSize: 30, fontWeight: 700, padding: '14px 26px' }}>Za darmo, bez konta</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
