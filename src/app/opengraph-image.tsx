import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'wezmezadarmo, Sprawdz co Ci sie nalezy';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A120A 0%, #121A12 50%, #1A241A 100%)',
          position: 'relative',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '200px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,125,79,0.15), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            right: '150px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,125,79,0.10), transparent 70%)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#6DC08A',
              letterSpacing: '8px',
              marginBottom: '16px',
              fontFamily: 'monospace',
            }}
          >
            WEZMEZADARMO
          </div>

          {/* Divider */}
          <div
            style={{
              width: '120px',
              height: '3px',
              background: 'linear-gradient(90deg, transparent, #6DC08A, transparent)',
              marginBottom: '24px',
              borderRadius: '2px',
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#f0f0f0',
              marginBottom: '12px',
              fontFamily: 'monospace',
            }}
          >
            Sprawdz co Ci sie nalezy
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: '22px',
              color: '#C2D4C2',
              fontFamily: 'monospace',
              marginBottom: '32px',
            }}
          >
            Zasilki, ulgi, dotacje, badania, w 2 minuty
          </div>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 32px',
                borderRadius: '12px',
                border: '1px solid rgba(46,125,79,0.3)',
                background: 'rgba(46,125,79,0.08)',
              }}
            >
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#6DC08A', fontFamily: 'monospace' }}>
                117
              </div>
              <div style={{ fontSize: '14px', color: '#C2D4C2', fontFamily: 'monospace', letterSpacing: '2px' }}>
                SWIADCZEN
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 32px',
                borderRadius: '12px',
                border: '1px solid rgba(46,125,79,0.3)',
                background: 'rgba(46,125,79,0.08)',
              }}
            >
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#6DC08A', fontFamily: 'monospace' }}>
                15
              </div>
              <div style={{ fontSize: '14px', color: '#C2D4C2', fontFamily: 'monospace', letterSpacing: '2px' }}>
                KATEGORII
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 32px',
                borderRadius: '12px',
                border: '1px solid rgba(200,48,46,0.3)',
                background: 'rgba(200,48,46,0.08)',
              }}
            >
              <div style={{ fontSize: '36px', fontWeight: 800, color: '#F07060', fontFamily: 'monospace' }}>
                2 min
              </div>
              <div style={{ fontSize: '14px', color: '#C2D4C2', fontFamily: 'monospace', letterSpacing: '2px' }}>
                SPRAWDZENIE
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
