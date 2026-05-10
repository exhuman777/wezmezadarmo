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
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0806',
          borderRadius: '6px',
        }}
      >
        <div
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#f0a860',
            letterSpacing: '-1px',
            lineHeight: 1,
          }}
        >
          W
        </div>
      </div>
    ),
    { ...size },
  );
}
