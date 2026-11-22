'use client';

import React, { useState } from 'react';

export interface DonutSegment {
  label: string;
  count: number;
  color: string;
  stageKey?: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  centerLabel?: string;
  size?: number;
  thickness?: number;
  className?: string;
  onSegmentClick?: (stageKey?: string) => void;
}

export function DonutChart({
  data,
  centerLabel = 'Projects',
  size = 180,
  thickness = 24,
  className = '',
  onSegmentClick,
}: DonutChartProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const total = data.reduce((acc, d) => acc + d.count, 0);
  const radius = size / 2;
  const innerRadius = radius - thickness;
  const circumference = 2 * Math.PI * (innerRadius + thickness / 2);

  let accumulatedPercent = 0;

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-6 ${className}`}>
      {/* SVG DONUT */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] overflow-visible"
        >
          {/* Base track */}
          <circle
            cx={radius}
            cy={radius}
            r={innerRadius + thickness / 2}
            fill="none"
            stroke="#EEF2F0"
            strokeWidth={thickness}
          />

          {total > 0 &&
            data.map((seg, idx) => {
              const pct = seg.count / total;
              const strokeDasharray = `${pct * circumference} ${circumference}`;
              const strokeDashoffset = -(accumulatedPercent * circumference);
              accumulatedPercent += pct;

              const isHovered = activeIdx === idx;

              return (
                <circle
                  key={seg.label}
                  cx={radius}
                  cy={radius}
                  r={innerRadius + thickness / 2}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? thickness + 4 : thickness}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setActiveIdx(idx)}
                  onMouseLeave={() => setActiveIdx(null)}
                  onClick={() => onSegmentClick && onSegmentClick(seg.stageKey)}
                />
              );
            })}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-mono text-2xl font-bold text-text-primary leading-none">
            {activeIdx !== null ? data[activeIdx].count : total}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-1">
            {activeIdx !== null ? data[activeIdx].label : centerLabel}
          </span>
        </div>
      </div>

      {/* LEGEND WITH PERCENTAGES */}
      <div className="flex-1 w-full space-y-2 text-xs">
        {data.map((seg, idx) => {
          const pct = total > 0 ? Math.round((seg.count / total) * 100) : 0;
          const isHovered = activeIdx === idx;

          return (
            <div
              key={seg.label}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
              onClick={() => onSegmentClick && onSegmentClick(seg.stageKey)}
              className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                isHovered ? 'bg-bg-secondary' : 'hover:bg-bg-secondary/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="font-medium text-text-secondary truncate text-[11px]">
                  {seg.label}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                <span className="font-bold text-text-primary">{seg.count}</span>
                <span className="text-[10px] text-text-muted w-8 text-right">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
