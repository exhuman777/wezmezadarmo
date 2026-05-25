'use client';

interface Point { x: number | string; y: number }

export function LineChart({ data, xLabel, yLabel, color = '#22A06B' }: {
  data: Point[];
  xLabel?: string;
  yLabel?: string;
  color?: string;
}) {
  if (!data.length) return <div>Brak danych</div>;

  const W = 800;
  const H = 280;
  const padL = 60, padR = 20, padT = 20, padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const ys = data.map(d => d.y);
  const minY = Math.min(...ys) * 0.9;
  const maxY = Math.max(...ys) * 1.05;
  const rangeY = maxY - minY || 1;

  const points = data.map((d, i) => {
    const x = padL + (i / Math.max(data.length - 1, 1)) * plotW;
    const y = padT + plotH - ((d.y - minY) / rangeY) * plotH;
    return { x, y, raw: d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Y-axis ticks (4)
  const yTicks = [0, 1, 2, 3, 4].map(i => {
    const val = minY + (rangeY * i) / 4;
    const y = padT + plotH - (i / 4) * plotH;
    return { val, y };
  });

  // X-axis labels (max ~8)
  const xStep = Math.max(1, Math.ceil(data.length / 8));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      {/* Y grid + labels */}
      {yTicks.map((t, i) => (
        <g key={`y${i}`}>
          <line x1={padL} y1={t.y} x2={W - padR} y2={t.y} stroke="currentColor" strokeOpacity={0.08} strokeWidth={1} />
          <text x={padL - 8} y={t.y + 4} textAnchor="end" fontSize={11} fill="currentColor" opacity={0.6}>
            {t.val.toLocaleString('pl', { maximumFractionDigits: 0 })}
          </text>
        </g>
      ))}

      {/* X labels */}
      {points.map((p, i) => i % xStep === 0 ? (
        <text key={`x${i}`} x={p.x} y={H - padB + 16} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>
          {String(p.raw.x)}
        </text>
      ) : null)}

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={`p${i}`} cx={p.x} cy={p.y} r={3} fill={color}>
          <title>{`${p.raw.x}: ${p.raw.y.toLocaleString('pl')}`}</title>
        </circle>
      ))}

      {/* Axis labels */}
      {xLabel && <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.5}>{xLabel}</text>}
      {yLabel && (
        <text x={14} y={H / 2} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.5} transform={`rotate(-90 14 ${H / 2})`}>
          {yLabel}
        </text>
      )}
    </svg>
  );
}
