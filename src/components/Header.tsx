'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PRESET_STAGES } from '@/lib/stages';
import { RotateCcw, Undo2, Settings, ChevronLeft, ChevronRight, Clock, Footprints, Layers, Heart } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenStageSelect: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenStageSelect,
}) => {
  const {
    currentStageIndex,
    currentStage,
    timerSeconds,
    moveCount,
    path,
    isCleared,
    lives,
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
  const canNext =
    currentStageIndex >= 0 && currentStageIndex < PRESET_STAGES.length - 1;

  const displayTitle =
    currentStage.id === 999
      ? 'Daily'
      : currentStage.id >= 1000
      ? 'Random'
      : currentStage.title.split(':')[0];

  return (
    <header className="w-full max-w-md mx-auto px-4 py-2 flex flex-col gap-2 select-none">
      {/* 上段: タイトル ＆ ライフ（案A） ＆ ステージ選択・切り替え / 設定ボタン */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div>
            <h1 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
              Stroop Route
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">意色交差パズル</p>
          </div>

          {/* ライフ表示（案A: ❤️×3 ネオンピルバッジ） */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl border transition-all duration-300 shadow-md ${
              lives <= 1
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200 shadow-[0_0_8px_rgba(244,63,94,0.25)]'
            }`}
            title={`残りライフ: ${lives}`}
          >
            <Heart
              className={`w-3.5 h-3.5 shrink-0 ${
                lives <= 1
                  ? 'text-rose-400 fill-rose-400'
                  : 'text-rose-400 fill-rose-500/80'
              }`}
            />
            <span className="text-xs sm:text-sm font-black font-mono tracking-tight leading-none">
              ×{lives}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* ステージ名 ＆ 前後送り（統合セレクター） */}
          <div className="flex items-center bg-purple-950/60 border border-purple-500/40 rounded-xl p-0.5 shadow-md">
            <button
              onClick={prevStage}
              disabled={!canPrev}
              className="p-1 rounded-lg text-purple-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="前のステージ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenStageSelect}
              className="flex items-center gap-1 px-1.5 py-1 text-xs sm:text-sm font-black text-purple-200 hover:text-white transition whitespace-nowrap"
              title="ステージ選択"
            >
              <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span>{displayTitle}</span>
            </button>
            <button
              onClick={nextStage}
              disabled={!canNext}
              className="p-1 rounded-lg text-purple-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
              title="次のステージ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-md active:scale-95 border border-slate-700/60"
            title="設定"
            aria-label="設定"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 中段: タイマー ＆ 手数 ＆ コントロール（横幅をフル活用した大型表示） */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2 sm:py-2.5 shadow-inner">
        {/* タイマー ＆ 手数 */}
        <div className="flex items-center gap-5 sm:gap-6 font-mono">
          <div className="flex items-center gap-2 text-cyan-300 font-black" title="経過時間">
            <Clock className="w-6 h-6 text-cyan-400 shrink-0" />
            <span className="text-2xl sm:text-3xl tracking-tight tabular-nums leading-none">{formatTime(timerSeconds)}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300 font-black" title="手数">
            <Footprints className="w-6 h-6 text-purple-400 shrink-0" />
            <span className="text-2xl sm:text-3xl tracking-tight tabular-nums leading-none">{moveCount.toString().padStart(3, '0')}</span>
          </div>
        </div>

        {/* コントロール: Undo & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none transition active:scale-90 border border-slate-700/60 shadow-sm"
            title="1手戻す (Z)"
          >
            <Undo2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition active:scale-90 border border-slate-700/60 shadow-sm"
            title="リセット (R)"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
