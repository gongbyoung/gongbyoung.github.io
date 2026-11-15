import React from 'react';

interface SparklinePoint {
  hour: string;
  cartons: number;
}

interface SparklineChartProps {
  data: SparklinePoint[];
  strokeColor?: string;
}

export const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  strokeColor = '#2563EB',
}) => {
  if (data.length === 0) return null;

  const width = 180;
  const height = 40;
  const padX = 6;
  const padY = 6;

  const values = data.map((d) => d.cartons);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const coords = data.map((d, i) => {
    const x = padX + (i / Math.max(data.length - 1, 1)) * (width - padX * 2);
    const y = height - padY - ((d.cartons - minVal) / range) * (height - padY * 2);
    return { x, y, ...d };
  });

  const polylinePoints = coords.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-10 overflow-visible"
      role="img"
      aria-label="Hourly carton throughput trend"
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={polylinePoints}
      />
      {coords.map((pt) => (
        <circle
          key={pt.hour}
          cx={pt.x}
          cy={pt.y}
          r={2.75}
          fill="#FFFFFF"
          stroke={strokeColor}
          strokeWidth={2}
        >
          <title>{`${pt.hour}: ${pt.cartons} cartons`}</title>
        </circle>
      ))}
    </svg>
  );
};

interface LinearProgressBarProps {
  value: number;
  max: number;
  tone?: 'navy' | 'cobalt' | 'green' | 'orange' | 'red';
  heightClass?: string;
}

const FILL_COLORS: Record<NonNullable<LinearProgressBarProps['tone']>, string> = {
  navy: 'bg-[#1E3A8A]',
  cobalt: 'bg-[#2563EB]',
  green: 'bg-[#16A34A]',
  orange: 'bg-[#EA580C]',
  red: 'bg-[#DC2626]',
};

export const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  max,
  tone = 'cobalt',
  heightClass = 'h-1.5',
}) => {
  const pct = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;

  return (
    <div
      className={`w-full bg-[#E2E8F0] rounded-sm overflow-hidden ${heightClass}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full transition-all duration-200 ${FILL_COLORS[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};
