'use client';

import React, { useState } from 'react';

export interface ChartDataPoint {
  label: string; // e.g. "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"
  quotedValue: number; // e.g. 1450000
  signedRevenue: number; // e.g. 980000
  previousPeriod?: number; // e.g. 1100000
}

interface AreaLineChartProps {
  data: ChartDataPoint[];
  height?: number;
  className?: string;
  showPreviousPeriod?: boolean;
}

export function AreaLineChart({
  data,
  height = 240,
  className = '',
  showPreviousPeriod = true,
}: AreaLineChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-text-muted">
        No sales performance data available for this range
      </div>
    );
  }

  const svgWidth = 600;
  const svgHeight = height;
  const padding = { top: 20, right: 25, bottom: 35, left: 55 };

  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  // Compute maximum value for scaling
  const allValues = data.flatMap(d => [
    d.quotedValue,
    d.signedRevenue,
    showPreviousPeriod && d.previousPeriod ? d.previousPeriod : 0,
  ]);
  const rawMax = Math.max(...allValues, 100000);
  // Round max up to neat ceiling
  const maxVal = Math.ceil(rawMax / 500000) * 500000 || 1000000;

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + chartW / 2;
    return padding.left + (index / (data.length - 1)) * chartW;
  };

  const getY = (val: number) => {
    return padding.top + chartH - (val / maxVal) * chartH;
  };

  // Build SVG Path strings
  const quotedPoints = data.map((d, i) => `${getX(i)},${getY(d.quotedValue)}`);
  const signedPoints = data.map((d, i) => `${getX(i)},${getY(d.signedRevenue)}`);
  const prevPoints = data.map((d, i) => `${getX(i)},${getY(d.previousPeriod || 0)}`);

  const quotedArea = `${quotedPoints.join(' ')} ${getX(data.length - 1)},${padding.top + chartH} ${getX(0)},${padding.top + chartH}`;
  const signedArea = `${signedPoints.join(' ')} ${getX(data.length - 1)},${padding.top + chartH} ${getX(0)},${padding.top + chartH}`;

  const formatMur = (val: number) => {
    if (val >= 1000000) {
      return `Rs ${(val / 1000000).toFixed(2)}M`;
    }
    return `Rs ${(val / 1000).toFixed(0)}k`;
  };

  const yTicks = [0, maxVal * 0.33, maxVal * 0.66, maxVal];

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible select-none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="tealAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#119A94" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#119A94" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6E4A9E" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#6E4A9E" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Axis Grid lines */}
        {yTicks.map((tickVal, i) => {
          const y = getY(tickVal);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={svgWidth - padding.right}
                y2={y}
                stroke="#E2E8E5"
                strokeDasharray={i === 0 ? undefined : '3 3'}
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-text-muted text-[10px] font-mono font-medium"
              >
                {formatMur(tickVal)}
              </text>
            </g>
          );
        })}

        {/* Previous Period Dotted Line */}
        {showPreviousPeriod && (
          <polyline
            fill="none"
            stroke="#A3B1AC"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            points={prevPoints.join(' ')}
          />
        )}

        {/* Quoted Value Area + Line (Teal) */}
        <polygon fill="url(#tealAreaGrad)" points={quotedArea} />
        <polyline
          fill="none"
          stroke="#119A94"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={quotedPoints.join(' ')}
        />

        {/* Signed Revenue Area + Line (Purple) */}
        <polygon fill="url(#purpleAreaGrad)" points={signedArea} />
        <polyline
          fill="none"
          stroke="#6E4A9E"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={signedPoints.join(' ')}
        />

        {/* Data points & Interactive Hover Hit Areas */}
        {data.map((d, i) => {
          const x = getX(i);
          const yQuoted = getY(d.quotedValue);
          const ySigned = getY(d.signedRevenue);
          const isHovered = hoverIndex === i;

          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
            >
              {/* Invisible Hit Bar */}
              <rect
                x={x - chartW / (data.length * 2)}
                y={padding.top}
                width={chartW / data.length}
                height={chartH}
                fill="transparent"
              />

              {/* Hover vertical guide */}
              {isHovered && (
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + chartH}
                  stroke="#119A94"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              )}

              {/* Quoted dot */}
              <circle
                cx={x}
                cy={yQuoted}
                r={isHovered ? 5 : 3.5}
                fill="#FFFFFF"
                stroke="#119A94"
                strokeWidth={isHovered ? 2.5 : 2}
                className="transition-all"
              />

              {/* Signed dot */}
              <circle
                cx={x}
                cy={ySigned}
                r={isHovered ? 5 : 3.5}
                fill="#FFFFFF"
                stroke="#6E4A9E"
                strokeWidth={isHovered ? 2.5 : 2}
                className="transition-all"
              />

              {/* X Axis Month Label */}
              <text
                x={x}
                y={svgHeight - 12}
                textAnchor="middle"
                className={`text-[11px] font-medium transition-colors ${
                  isHovered ? 'fill-brand-primary font-bold' : 'fill-text-secondary'
                }`}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Interactive Tooltip */}
      {hoverIndex !== null && data[hoverIndex] && (
        <div
          className="absolute z-20 pointer-events-none bg-bg-card border border-border-strong rounded-lg shadow-lg p-3 text-xs min-w-[190px] animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${((getX(hoverIndex) - padding.left) / chartW) * 80 + 10}%`,
            top: '15px',
          }}
        >
          <div className="font-bold text-text-primary border-b border-border-subtle pb-1.5 mb-2 flex justify-between items-center">
            <span>{data[hoverIndex].label} 2026</span>
            <span className="text-[10px] text-text-muted font-normal">Monthly Performance</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#119A94]" /> Quoted Value:
              </span>
              <strong className="font-mono text-[#119A94]">
                Rs {data[hoverIndex].quotedValue.toLocaleString()}
              </strong>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#6E4A9E]" /> Signed Revenue:
              </span>
              <strong className="font-mono text-[#6E4A9E]">
                Rs {data[hoverIndex].signedRevenue.toLocaleString()}
              </strong>
            </div>

            {showPreviousPeriod && data[hoverIndex].previousPeriod && (
              <div className="flex items-center justify-between gap-2 text-text-muted pt-1 border-t border-border-subtle/50 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-0.5 bg-[#A3B1AC]" /> Prior Period:
                </span>
                <span className="font-mono">
                  Rs {data[hoverIndex].previousPeriod.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
