'use client';

/**
 * Wieloseryjny wykres liniowy SVG (bez zaleznosci, ten sam styl co /statystyki LineChart).
 * Kazda seria ma wlasna skale opcjonalnie wspoldzielona os Y.
 * Punkty maja <title> (tooltip natywny przegladarki).
 */

export interface Series {
  name: string;
  color: string;
  points: Array<{ x: number | string; y: number }>;
  /** sufiks wartosci w tooltipie, np. ' mln' lub ' zl' */
  unit?: string;
}

export function MultiLineChart({ series, xLabel, yLabel }: {
  series: Series[];
  xLabel?: string;
  yLabel?: string;
}) {
  const allPoints = series.flatMap(s => s.points);
  if (allPoints.length === 0) return <div style={{ fontSize: 13, opacity: 0.6 }}>Brak danych</div>;

  const W = 800;
  const H = 300;
  const padL = 60, padR = 20, padT = 20, padB = 56;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const ys = allPoints.map(p => p.y);
  const rawMin = Math.min(...ys);
  const rawMax = Math.max(...ys);
  const minY = rawMin >= 0 ? rawMin * 0.9 : rawMin * 1.05;
  const maxY = rawMax * 1.05;
  const rangeY = (maxY - minY) || 1;

  // Wspolna os X: zbior unikalnych x w kolejnosci wystapienia
  const xs: Array<number | string> = [];
  for (const p of allPoints) if (!xs.includes(p.x)) xs.push(p.x);
  xs.sort((a, b) => Number(a) - Number(b));
  const xIndex = new Map(xs.map((x, i) => [x, i]));

  const sx = (x: number | string) => padL + ((xIndex.get(x) ?? 0) / Math.max(xs.length - 1, 1)) * plotW;
  const sy = (y: number) => padT + plotH - ((y - minY) / rangeY) * plotH;

  const yTicks = [0, 1, 2, 3, 4].map(i => {
    const val = minY + (rangeY * i) / 4;
    return { val, y: padT + plotH - (i / 4) * plotH };
  });

  const xStep = Math.max(1, Math.ceil(xs.length / 8));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
            <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
            <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.6}>
              {t.val.toLocaleString('pl', { maximumFractionDigits: 0 })}
            </text>
          </g>
        ))}

        {xs.map((x, i) => i % xStep === 0 ? (
          <text key={`x${i}`} x={sx(x)} y={H - padB + 16} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>
            {String(x)}
          </text>
        ) : null)}

        {series.map(s => {
          const pathD = s.points
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
            .join(' ');
          return (
            <g key={s.name}>
              <path d={pathD} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              {s.points.map((p, i) => (
                <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill={s.color}>
                  <title>{`${s.name} - ${p.x}: ${p.y.toLocaleString('pl', { maximumFractionDigits: 2 })}${s.unit ?? ''}`}</title>
                </circle>
              ))}
            </g>
          );
        })}

        {xLabel && <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.5}>{xLabel}</text>}
        {yLabel && (
          <text x={14} y={(padT + plotH) / 2 + padT / 2} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.5}
            transform={`rotate(-90 14 ${(padT + plotH) / 2 + padT / 2})`}>
            {yLabel}
          </text>
        )}
      </svg>

      {/* Legenda */}
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', marginTop: 6 }}>
        {series.map(s => (
          <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--ink-500)' }}>
            <span style={{ width: 14, height: 3, borderRadius: 2, background: s.color, display: 'inline-block' }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
