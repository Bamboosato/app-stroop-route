'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PRESET_STAGES } from '@/lib/stages';
import { RotateCcw, Undo2, Settings, ChevronLeft, ChevronRight, Clock, Footprints } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const {
    currentStageIndex,
    currentStage,
    timerSeconds,
    moveCount,
    path,
    isCleared,
    undo,
    reset,
    nextStage,
    prevStage,
  } = useGameStore();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const canUndo = path.length > 1 && !isCleared;
  const canPrev = currentStageIndex > 0;
  const canNext = currentStageIndex < PRESET_STAGES.length - 1;

  return (
    <header className="w-full max-w-md mx-auto px-4 py-2 flex flex-col gap-2 select-none">
      {/* 上段: タイトル ＆ 設定ボタン */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
            Stroop Route
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">意色交差パズル</p>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 border border-slate-700/60"
          title="設定"
          aria-label="設定"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* 中段: ステージセレクター ＆ ステータス */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-2 shadow-inner">
        {/* ステージ送り */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevStage}
            disabled={!canPrev}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition"
            title="前のステージ"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-200 px-1 whitespace-nowrap">
            {currentStage.title.split(':')[0]}
          </span>
          <button
            onClick={nextStage}
            disabled={!canNext}
            className="p-1 rounded-lg text-slate-400 hover:text-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition"
            title="次のステージ"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* タイマー ＆ 手数 */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(timerSeconds)}</span>
          </div>
          <div className="flex items-center gap-1 text-purple-300">
            <Footprints className="w-3.5 h-3.5" />
            <span>{moveCount}手</span>
          </div>
        </div>

        {/* コントロール: Undo & Reset */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none transition active:scale-90"
            title="1手戻す (Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={reset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition active:scale-90"
            title="リセット (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
