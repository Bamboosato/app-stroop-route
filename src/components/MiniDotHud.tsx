'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { soundService } from '@/lib/sound';
import { Compass } from 'lucide-react';

export const MiniDotHud: React.FC = () => {
  const { currentStage, camR, camC, setCamPos } = useGameStore();

  if (!currentStage.isScrollable) {
    return null;
  }

  // 区画数計算
  // 7x7: 2x2 (オフセット 0, 3)
  // 10x10: 3x3 (オフセット 0, 3, 6)
  const is10x10 = currentStage.size === 10;
  const is5x5 = currentStage.size === 5;
  const numDivisions = is10x10 ? 3 : 2;
  const offsets = is10x10 ? [0, 3, 6] : is5x5 ? [0, 1] : [0, 3];

  // 現在の区画インデックス (0, 1, 2)
  const activeRowIdx = offsets.indexOf(camR);
  const activeColIdx = offsets.indexOf(camC);

  // 九方位テキストの判定
  let quadrantName = '中央';
  if (is10x10) {
    const names = [
      ['北西', '北', '北東'],
      ['西', '中央', '東'],
      ['南西', '南', '南東'],
    ];
    quadrantName = names[activeRowIdx]?.[activeColIdx] || '中央';
  } else {
    // 2x2
    const names = [
      ['北西', '北東'],
      ['南西', '南東'],
    ];
    quadrantName = names[activeRowIdx]?.[activeColIdx] || '北西';
  }

  const handleDotClick = (rOffset: number, cOffset: number) => {
    if (rOffset !== camR || cOffset !== camC) {
      soundService.playSlide();
      setCamPos(rOffset, cOffset);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-1.5 flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-2xl text-xs select-none">
      {/* 凡例アイコン */}
      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          START
        </span>
        <span className="flex items-center gap-1 text-purple-400">
          <span className="w-2 h-2 rounded-full bg-purple-500" />
          ⚡GATE
        </span>
        <span className="flex items-center gap-1 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          GOAL
        </span>
      </div>

      {/* ミニドットピクト ＆ 九方位バッジ */}
      <div className="flex items-center gap-3">
        {/* 2x2 または 3x3 ドットピクト */}
        <div
          className="grid gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800"
          style={{
            gridTemplateColumns: `repeat(${numDivisions}, minmax(0, 1fr))`,
          }}
          title="区画選択"
        >
          {offsets.map((rOff, rIdx) =>
            offsets.map((cOff, cIdx) => {
              const isActive = rIdx === activeRowIdx && cIdx === activeColIdx;
              return (
                <button
                  key={`${rOff}-${cOff}`}
                  onClick={() => handleDotClick(rOff, cOff)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isActive
                      ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)] scale-125'
                      : 'bg-slate-700 hover:bg-slate-500'
                  }`}
                  aria-label={`区画 (${rOff}, ${cOff}) へ移動`}
                />
              );
            })
          )}
        </div>

        {/* 九方位バッジ */}
        <div className="flex items-center gap-1 bg-slate-800/90 border border-cyan-500/50 px-2 py-1 rounded-xl text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.2)]">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-xs tracking-wider">[{quadrantName}]</span>
        </div>
      </div>
    </div>
  );
};
