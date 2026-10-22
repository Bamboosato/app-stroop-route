'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { COLOR_DEFS } from '@/lib/constants';
import { Zap, Trophy } from 'lucide-react';

export const ModeBanner: React.FC = () => {
  const { isReversedMode, path, isCleared } = useGameStore();
  const tipCell = path[path.length - 1];

  const wordDef = tipCell ? COLOR_DEFS[tipCell.word] : null;
  const inkDef = tipCell ? COLOR_DEFS[tipCell.ink] : null;

  if (isCleared) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-1 select-none animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl border px-3 py-2.5 transition-all duration-300 shadow-lg bg-gradient-to-r from-amber-950/80 via-yellow-900/80 to-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-xl font-black text-sm shadow-md bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                <Trophy className="w-4 h-4 fill-current" />
              </span>
              <div>
                <div className="text-xs font-black tracking-wide text-amber-300">
                  ★ GOAL REACHED!
                </div>
                <p className="text-[11px] text-slate-200 font-medium">
                  一筆書きルート完成！
                </p>
              </div>
            </div>
            <div className="text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-500/50">
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
        className={`relative overflow-hidden rounded-2xl border px-3 py-2.5 transition-all duration-300 shadow-lg ${
          isReversedMode
            ? 'bg-gradient-to-r from-purple-950/90 via-fuchsia-950/90 to-purple-950/90 border-fuchsia-500/80 shadow-[0_0_15px_rgba(217,70,239,0.3)] animate-pulse'
            : 'bg-gradient-to-r from-slate-900/90 via-cyan-950/90 to-slate-900/90 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* 左側: モードバッジ ＆ 説明 */}
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-xl font-black text-sm shadow-md transition-all ${
                isReversedMode
                  ? 'bg-fuchsia-500 text-white shadow-[0_0_10px_rgba(217,70,239,0.8)]'
                  : 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
              }`}
            >
              {isReversedMode ? <Zap className="w-4 h-4 fill-current" /> : '文'}
            </span>

            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-black tracking-wide ${
                    isReversedMode ? 'text-fuchsia-300' : 'text-cyan-300'
                  }`}
                >
                  {isReversedMode ? '⚡ ルール反転中 (リバース)' : '通常モード'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                {isReversedMode
                  ? '【インク色 ➔ 文字の意味】'
                  : '【文字の意味 ➔ インク色】'}
              </p>
            </div>
          </div>

          {/* 右側: リアルタイム条件ガイド */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              TARGET
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {!isReversedMode && wordDef && (
                <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/80">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: wordDef.hex, color: wordDef.hex }}
                  />
                  <span className="text-xs font-bold text-slate-100">
                    {wordDef.label}色インク
                  </span>
                </div>
              )}

              {isReversedMode && inkDef && (
                <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700/80">
                  <span className="text-xs font-black text-fuchsia-300">「{inkDef.label}」</span>
                  <span className="text-[11px] text-slate-300 font-medium">の文字</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
