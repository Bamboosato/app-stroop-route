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
  gridSize?: number;
}

export const CellItem: React.FC<CellItemProps> = ({
  cell,
  isTip,
  isVisited,
  isNextCandidate,
  isCudMode,
  onSelect,
}) => {
  const inkDef = COLOR_DEFS[cell.ink];
  const wordDisplay = getWordDisplay(cell.word, cell.notation);

  // パネル内の文字サイズおよびバッジサイズはステージ・文字数にかかわらず完全に統一
  const isLongWord = wordDisplay.length >= 6;
  const dynamicFontSize = isLongWord
    ? 'text-xs sm:text-sm md:text-base leading-tight'
    : 'text-base sm:text-lg md:text-xl leading-tight';
  const trackingClass = 'tracking-tighter';
  const labelSizeClass = 'text-[10px]';

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

      {/* セルバッジ（START / GOAL / GATE: アイコン＋文字を上部に表示） - z-10で常に前面 */}
      {cell.type === 'START' && (
        <span className={`absolute top-1 left-1.5 flex items-center gap-0.5 font-black uppercase tracking-tighter z-10 ${labelSizeClass}`}>
          <Flag className="w-2.5 h-2.5 text-white fill-current" />
          <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">START</span>
        </span>
      )}
      {cell.type === 'GOAL' && (
        <span className={`absolute top-1 right-1.5 flex items-center gap-0.5 font-black uppercase tracking-tighter z-10 ${labelSizeClass}`}>
          <Star className="w-2.5 h-2.5 text-white fill-current" />
          <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">GOAL</span>
        </span>
      )}
      {cell.type === 'GATE' && (
        <span className={`absolute top-1 left-1.5 flex items-center gap-0.5 font-black tracking-tighter z-10 ${labelSizeClass}`}>
          <Zap className="w-2.5 h-2.5 text-white fill-current" />
          <span className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">反転</span>
        </span>
      )}

      {/* 単語文字（インク色で描画） - 全ステージで一律に4文字サイズで統一 */}
      <span
        className={`relative z-10 w-full text-center flex items-center justify-center font-black whitespace-nowrap select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] filter drop-shadow-[0_0_8px_currentColor] transition-transform ${dynamicFontSize} ${trackingClass}`}
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
