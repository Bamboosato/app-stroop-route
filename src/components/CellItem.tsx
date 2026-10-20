'use client';

import React from 'react';
import { Cell } from '@/types/game';
import { COLOR_DEFS, getWordDisplay } from '@/lib/constants';
import { Zap, Flag, Star } from 'lucide-react';

interface CellItemProps {
  cell: Cell;
  isTip: boolean;
  isVisited: boolean;
  isNextCandidate: boolean;
  isCudMode: boolean;
  onSelect: (cell: Cell) => void;
  gridSize: number;
}

export const CellItem: React.FC<CellItemProps> = ({
  cell,
  isTip,
  isVisited,
  isNextCandidate,
  isCudMode,
  onSelect,
  gridSize,
}) => {
  const inkDef = COLOR_DEFS[cell.ink];
  const wordDisplay = getWordDisplay(cell.word, cell.notation);

  // グリッドサイズ（4x4 vs 5x5）に応じたフォントサイズ調整
  const fontSizeClass = gridSize === 5 ? 'text-lg md:text-xl' : 'text-2xl md:text-3xl';
  const labelSizeClass = gridSize === 5 ? 'text-[9px]' : 'text-[10px]';

  // セルの背景スタイル
  let bgStyle = 'bg-slate-900/90';
  let borderStyle = 'border-slate-800';

  if (cell.type === 'GATE') {
    bgStyle = 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/60 via-slate-900 to-slate-950';
    borderStyle = 'border-4 border-double border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.4)] animate-pulse';
  } else if (cell.type === 'START') {
    borderStyle = 'border-2 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
  } else if (cell.type === 'GOAL') {
    borderStyle = 'border-2 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.35)]';
  }

  // 訪問済み状態とTip状態のスタイリング
  if (isTip) {
    borderStyle = 'border-2 border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.7)] scale-[1.03] z-20';
  } else if (isVisited) {
    bgStyle = 'bg-slate-800/80';
    borderStyle = 'border-slate-700/80';
  }

  return (
    <div
      onClick={() => onSelect(cell)}
      className={`relative flex flex-col items-center justify-center rounded-2xl cursor-pointer select-none transition-all duration-150 active:scale-95 aspect-square border ${bgStyle} ${borderStyle} ${
        isVisited && !isTip ? 'opacity-85' : 'opacity-100'
      }`}
      style={{
        touchAction: 'none',
      }}
      data-r={cell.r}
      data-c={cell.c}
    >
      {/* ルート候補アシスト（エメラルドリングハイライト） */}
      {isNextCandidate && !isVisited && (
        <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400 pointer-events-none animate-ping opacity-60" />
      )}
      {isNextCandidate && !isVisited && (
        <span className="absolute inset-0 rounded-2xl border-2 border-emerald-400 pointer-events-none shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
      )}

      {/* セルバッジ（START / GOAL / GATE） */}
      {cell.type === 'START' && (
        <span className={`absolute top-1 left-1.5 flex items-center gap-0.5 font-black text-emerald-400 uppercase tracking-tighter ${labelSizeClass}`}>
          <Flag className="w-2.5 h-2.5" />
          START
        </span>
      )}
      {cell.type === 'GOAL' && (
        <span className={`absolute top-1 right-1.5 flex items-center gap-0.5 font-black text-amber-300 uppercase tracking-tighter ${labelSizeClass}`}>
          <Star className="w-2.5 h-2.5 fill-current" />
          GOAL
        </span>
      )}
      {cell.type === 'GATE' && (
        <span className={`absolute top-1 left-1.5 flex items-center gap-0.5 font-black text-purple-300 tracking-tighter ${labelSizeClass}`}>
          <Zap className="w-2.5 h-2.5 fill-current" />
          反転
        </span>
      )}

      {/* 単語文字（インク色で描画） */}
      <span
        className={`font-black tracking-wide filter drop-shadow-[0_0_8px_currentColor] transition-transform ${fontSizeClass}`}
        style={{ color: inkDef.hex }}
      >
        {wordDisplay}
      </span>

      {/* CUDモード時のインク色名バッジ */}
      {isCudMode && (
        <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm px-1 py-0.2 rounded text-[8px] font-bold text-slate-200 border border-slate-700/60">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: inkDef.hex }}
          />
          <span>{inkDef.label}</span>
        </div>
      )}
    </div>
  );
};
