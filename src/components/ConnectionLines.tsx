'use client';

import React from 'react';
import { Cell } from '@/types/game';

interface ConnectionLinesProps {
  path: Cell[];
  size: number;
  isReversedMode: boolean;
}

export const ConnectionLines: React.FC<ConnectionLinesProps> = ({
  path,
  size,
  isReversedMode,
}) => {
  if (path.length <= 1) return null;

  // 各セルの中心座標を 0〜100 のパーセンテージ空間で算出
  const stepSize = 100 / size;
  const points = path
    .map((c) => {
      const x = (c.c + 0.5) * stepSize;
      const y = (c.r + 0.5) * stepSize;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = isReversedMode ? '#e879f9' : '#22d3ee';
  const glowColor = isReversedMode ? 'rgba(217, 70, 239, 0.35)' : 'rgba(34, 211, 238, 0.35)';

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 外側グローライン（半透明で背後から光る） */}
      <polyline
        points={points}
        fill="none"
        stroke={glowColor}
        strokeWidth={stepSize * 0.16}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#neon-glow)"
      />

      {/* 内側ソリッドライン */}
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth={stepSize * 0.05}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.85"
      />
    </svg>
  );
};
