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
        <div className="relative overflow-hidden rounded-2xl border px-3.5 py-2.5 transition-all duration-300 shadow-lg bg-gradient-to-r from-amber-950/80 via-yellow-900/80 to-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm shadow-md bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                <Trophy className="w-4 h-4 fill-current" />
              </span>
              <div>
                <div className="text-sm font-black tracking-wide text-amber-300">
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
        className={`relative overflow-hidden rounded-2xl border px-3.5 py-2.5 transition-all duration-300 shadow-lg ${
          isReversedMode
            ? 'bg-gradient-to-r from-purple-950/90 via-fuchsia-950/90 to-purple-950/90 border-fuchsia-500/80 shadow-[0_0_15px_rgba(217,70,239,0.3)] animate-pulse'
            : 'bg-gradient-to-r from-slate-900/90 via-cyan-950/90 to-slate-900/90 border-cyan-500/70 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {/* 左側: モード ＆ ルール方針 */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-xl font-black text-sm shadow-md transition-all shrink-0 ${
                isReversedMode
                  ? 'bg-fuchsia-500 text-white shadow-[0_0_12px_rgba(217,70,239,0.8)]'
                  : 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
              }`}
            >
              {isReversedMode ? <Zap className="w-4 h-4 fill-current" /> : '文'}
            </span>

            <div className="flex flex-col">
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  isReversedMode ? 'text-fuchsia-400' : 'text-cyan-400'
                }`}
              >
                {isReversedMode ? '反転ルール' : '通常ルール'}
              </span>
              <span className="text-sm font-black text-slate-100 whitespace-nowrap">
                {isReversedMode ? '色 ➔ 文字' : '文字 ➔ 色'}
              </span>
            </div>
          </div>

          {/* 右側: ターゲット条件（ラベル省略、色チップを大型化） */}
          <div className="flex items-center">
            {!isReversedMode && wordDef && (
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all shadow-md"
                style={{
                  borderColor: `${wordDef.hex}90`,
                  backgroundColor: `${wordDef.hex}22`,
                  boxShadow: `0 0 10px ${wordDef.hex}30`,
                }}
              >
                <span
                  className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor] shrink-0"
                  style={{ backgroundColor: wordDef.hex, color: wordDef.hex }}
                />
                <span
                  className="text-sm font-black tracking-wide"
                  style={{ color: wordDef.hex }}
                >
                  {wordDef.label}色
                </span>
              </div>
            )}

            {isReversedMode && inkDef && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-fuchsia-500/70 bg-fuchsia-950/70 transition-all shadow-[0_0_10px_rgba(217,70,239,0.3)]">
                <span className="text-sm font-black text-fuchsia-200">
                  「{inkDef.label}」
                </span>
                <span className="text-xs font-bold text-fuchsia-300">の文字</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
