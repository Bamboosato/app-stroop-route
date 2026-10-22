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

  // 文字数およびグリッドサイズに応じたフォントサイズの動的最適化
  const charCount = wordDisplay.length;
  let dynamicFontSize = 'text-2xl md:text-3xl';
  let trackingClass = 'tracking-normal';

  if (gridSize >= 7) {
    if (charCount >= 4) {
      dynamicFontSize = 'text-[9px] md:text-[10px] leading-tight';
      trackingClass = 'tracking-tighter';
    } else if (charCount === 3) {
      dynamicFontSize = 'text-[11px] md:text-xs';
      trackingClass = 'tracking-tight';
    } else if (charCount === 2) {
      dynamicFontSize = 'text-sm md:text-base';
    } else {
      dynamicFontSize = 'text-base md:text-lg';
    }
  } else if (gridSize === 5) {
    if (charCount >= 4) {
      dynamicFontSize = 'text-xs md:text-sm leading-tight';
      trackingClass = 'tracking-tighter';
    } else if (charCount === 3) {
      dynamicFontSize = 'text-sm md:text-base';
      trackingClass = 'tracking-tight';
    } else if (charCount === 2) {
      dynamicFontSize = 'text-lg md:text-xl';
    } else {
      dynamicFontSize = 'text-xl md:text-2xl';
    }
  } else {
    // 4x4
    if (charCount >= 4) {
      dynamicFontSize = 'text-base sm:text-lg md:text-xl leading-tight';
      trackingClass = 'tracking-tighter';
    } else if (charCount === 3) {
      dynamicFontSize = 'text-xl sm:text-2xl md:text-2xl';
      trackingClass = 'tracking-tight';
    } else if (charCount === 2) {
      dynamicFontSize = 'text-2xl sm:text-3xl md:text-3xl';
    } else {
      dynamicFontSize = 'text-3xl sm:text-4xl md:text-4xl';
    }
  }

  // 上枠線バッジのサイズクラス
  const badgeSizeClass =
    gridSize >= 7
      ? 'text-[7px] px-1 py-0'
      : gridSize === 5
      ? 'text-[8px] px-1 py-0.2'
      : 'text-[9px] px-1.5 py-0.5';

  const iconSizeClass =
    gridSize >= 7 ? 'w-2 h-2' : gridSize === 5 ? 'w-2 h-2' : 'w-2.5 h-2.5';

  // セルの背景スタイル
  let bgStyle = 'bg-slate-900/60';
  let borderStyle = 'border-slate-800';

  if (cell.type === 'GATE') {
    bgStyle = 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/50 via-slate-900/70 to-slate-950/80';
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
    bgStyle = 'bg-slate-800/50';
    borderStyle = 'border-slate-700/80';
  }

  return (
    <div
      onClick={() => onSelect(cell)}
      className={`relative flex flex-col items-center justify-center rounded-2xl cursor-pointer select-none transition-all duration-150 active:scale-95 aspect-square border ${bgStyle} ${borderStyle} ${
        isVisited && !isTip ? 'opacity-90' : 'opacity-100'
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

      {/* パネル上部の枠線の上に配置されるフローティングバッジ（START / GOAL / GATE） */}
      {cell.type === 'START' && (
        <div className={`absolute -top-2.5 left-2 flex items-center gap-0.5 font-black uppercase tracking-tighter bg-slate-950 border border-emerald-500/80 text-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)] z-20 ${badgeSizeClass}`}>
          <Flag className={iconSizeClass} />
          <span>START</span>
        </div>
      )}
      {cell.type === 'GOAL' && (
        <div className={`absolute -top-2.5 right-2 flex items-center gap-0.5 font-black uppercase tracking-tighter bg-slate-950 border border-amber-400/90 text-amber-300 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.45)] z-20 ${badgeSizeClass}`}>
          <Star className={`${iconSizeClass} fill-current`} />
          <span>GOAL</span>
        </div>
      )}
      {cell.type === 'GATE' && (
        <div className={`absolute -top-2.5 left-2 flex items-center gap-0.5 font-black tracking-tighter bg-slate-950 border border-purple-400/90 text-purple-300 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.4)] z-20 ${badgeSizeClass}`}>
          <Zap className={`${iconSizeClass} fill-current`} />
          <span>反転</span>
        </div>
      )}

      {/* 単語文字（インク色で描画） - パネル内部の全領域を使って堂々と中央配置 */}
      <span
        className={`relative z-10 w-full text-center flex items-center justify-center font-black whitespace-nowrap select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] filter drop-shadow-[0_0_8px_currentColor] transition-transform ${dynamicFontSize} ${trackingClass}`}
        style={{ color: inkDef.hex }}
      >
        {wordDisplay}
      </span>

      {/* CUDモード時のインク色名バッジ - z-10 */}
      {isCudMode && (
        <div className="absolute bottom-1 right-1.5 flex items-center gap-0.5 bg-black/75 backdrop-blur-sm px-1 py-0.2 rounded text-[8px] font-bold text-slate-200 border border-slate-700/60 z-10">
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
