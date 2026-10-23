'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { COLOR_DEFS } from '@/lib/constants';
import { Trophy } from 'lucide-react';

export const ModeBanner: React.FC = () => {
  const { isReversedMode, path, isCleared } = useGameStore();
  const tipCell = path[path.length - 1];

  const wordDef = tipCell ? COLOR_DEFS[tipCell.word] : null;
  const inkDef = tipCell ? COLOR_DEFS[tipCell.ink] : null;

  if (isCleared) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-1 select-none animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl border px-4 py-2.5 transition-all duration-300 shadow-lg bg-gradient-to-r from-amber-950/80 via-yellow-900/80 to-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl font-black text-base shadow-md bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                <Trophy className="w-5 h-5 fill-current" />
              </span>
              <div>
                <div className="text-base font-black tracking-wide text-amber-300">
                  ★ GOAL REACHED!
                </div>
                <p className="text-xs text-slate-200 font-semibold">
                  一筆書きルート完成！
                </p>
              </div>
            </div>
            <div className="text-xs font-black text-amber-300 bg-amber-950/70 px-2.5 py-1 rounded-xl border border-amber-500/50">
              クリア達成
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-1 select-none">
      <div
        className={`relative overflow-hidden rounded-2xl border px-4 py-2.5 transition-all duration-300 shadow-lg ${
          isReversedMode
            ? 'bg-gradient-to-r from-purple-950/90 via-fuchsia-950/90 to-purple-950/90 border-fuchsia-500/80 shadow-[0_0_15px_rgba(217,70,239,0.3)] animate-pulse'
            : 'bg-gradient-to-r from-slate-900/90 via-cyan-950/90 to-slate-900/90 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* 左側: アイコン廃止 ➔ 通常ルール: 文字➔色 / 反転ルール: 色➔文字 を特大1行表示 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-sm sm:text-base font-black ${
                isReversedMode
                  ? 'text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]'
                  : 'text-cyan-400'
              }`}
            >
              {isReversedMode ? '⚡ 反転ルール:' : '通常ルール:'}
            </span>
            <span
              className={`text-base sm:text-lg font-black tracking-tight whitespace-nowrap ${
                isReversedMode ? 'text-fuchsia-100' : 'text-slate-100'
              }`}
            >
              {isReversedMode ? '色 ➔ 文字' : '文字 ➔ 色'}
            </span>
          </div>

          {/* 右側: ターゲット条件（大型ピルバッジ） */}
          <div className="flex items-center">
            {!isReversedMode && wordDef && (
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all shadow-md"
                style={{
                  borderColor: `${wordDef.hex}99`,
                  backgroundColor: `${wordDef.hex}25`,
                  boxShadow: `0 0 12px ${wordDef.hex}40`,
                }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px_currentColor] shrink-0"
                  style={{ backgroundColor: wordDef.hex, color: wordDef.hex }}
                />
                <span
                  className="text-base sm:text-lg font-black tracking-wide"
                  style={{ color: wordDef.hex }}
                >
                  {wordDef.label}色
                </span>
              </div>
            )}

            {isReversedMode && inkDef && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-fuchsia-500/80 bg-fuchsia-950/80 transition-all shadow-[0_0_12px_rgba(217,70,239,0.4)]">
                <span className="text-base sm:text-lg font-black text-fuchsia-100">
                  「{inkDef.label}」
                </span>
                <span className="text-xs sm:text-sm font-bold text-fuchsia-300">の文字</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
