import React from 'react';

interface SparklineProps {
  data: number[];
  color?: 'teal' | 'purple' | 'emerald' | 'amber';
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = 'teal',
  width = 80,
  height = 24,
  className = '',
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 4) + 2;
      const y = height - ((val - min) / range) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColors = {
    teal: '#119A94',
    purple: '#6E4A9E',
    emerald: '#4F8F68',
    amber: '#C28A35',
  };

  const stroke = strokeColors[color] || strokeColors.teal;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible shrink-0 ${className}`}
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* End pulse dot */}
      {data.length > 0 && (
        <circle
          cx={(width - 2).toFixed(1)}
          cy={(height - ((data[data.length - 1] - min) / range) * (height - 6) - 3).toFixed(1)}
          r="2.5"
          fill={stroke}
        />
      )}
    </svg>
  );
}
