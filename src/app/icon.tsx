import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        {/* White top half */}
        <div style={{ flex: 1, background: '#ffffff', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 900,
              color: '#dc143c',
              letterSpacing: '-0.5px',
              lineHeight: 1,
              marginBottom: '-1px',
            }}
          >
            WZ
          </div>
        </div>
        {/* Red bottom half */}
        <div style={{ flex: 1, background: '#dc143c', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div
            style={{
              fontSize: '8px',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.5px',
              lineHeight: 1,
              marginTop: '2px',
            }}
          >
            .COM
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
