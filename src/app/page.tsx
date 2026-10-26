'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Header } from '@/components/Header';
import { ModeBanner } from '@/components/ModeBanner';
import { GameBoard } from '@/components/GameBoard';
import { MiniDotHud } from '@/components/MiniDotHud';
import { DeadEndToast } from '@/components/DeadEndToast';
import { ClearModal } from '@/components/ClearModal';
import { GameOverModal } from '@/components/GameOverModal';
import { SettingsModal } from '@/components/SettingsModal';
import { StageSelectModal } from '@/components/StageSelectModal';
import { HowToModal } from '@/components/HowToModal';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { HelpCircle, Trophy } from 'lucide-react';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStageSelectOpen, setIsStageSelectOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const { tickTimer, isCleared, isGameOver, isClearModalOpen, openClearModal, initStage } = useGameStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stg = params.get("stage");
    if (stg !== null) {
      initStage(parseInt(stg, 10));
    }
  }, [initStage]);

  // キーボード操作の有効化
  useKeyboardControls();

  // タイマーインターバル
  useEffect(() => {
    if (isCleared || isGameOver) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isCleared, isGameOver, tickTimer]);

  return (
    <main className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-2 px-2 sm:px-4 max-w-lg mx-auto">
      {/* 上部ヘッダー（タイトル、ステージ、タイマー、操作ボタン） */}
      <div className="flex flex-col gap-1 w-full">
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStageSelect={() => setIsStageSelectOpen(true)}
        />
        <ModeBanner />
      </div>

      {/* 中央メイン盤面 ＆ HUD */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto w-full gap-1">
        <GameBoard />
        <MiniDotHud />

        {/* ゴール後にモーダルを閉じた場合の「結果を見る」ボタン */}
        {isCleared && !isClearModalOpen && (
          <div className="w-full max-w-md px-4 mt-2 animate-fade-in">
            <button
              onClick={openClearModal}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition active:scale-95 animate-pulse"
            >
              <Trophy className="w-4 h-4 fill-current" />
              <span>クリア達成！結果・スコアを見る</span>
            </button>
          </div>
        )}
      </div>

      {/* 下部フッター ＆ ヘルプ案内 */}
      <footer className="w-full max-w-md mx-auto px-4 py-1 flex flex-col items-center gap-1.5 text-center">
        <button
          onClick={() => setShowHowTo(true)}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition active:scale-95 py-1 px-2.5 rounded-full hover:bg-slate-900"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>遊び方・ルールのヒント</span>
        </button>

        <div className="text-[10px] text-slate-600">
          Stroop Route - Cognitive Puzzle Game
        </div>
      </footer>

      {/* モーダル・トースト群 */}
      <DeadEndToast />
      <ClearModal />
      <GameOverModal onOpenStageSelect={() => setIsStageSelectOpen(true)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <StageSelectModal
        isOpen={isStageSelectOpen}
        onClose={() => setIsStageSelectOpen(false)}
      />
      <HowToModal
        isOpen={showHowTo}
        onClose={() => setShowHowTo(false)}
      />
    </main>
  );
}
