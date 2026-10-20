'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Header } from '@/components/Header';
import { ModeBanner } from '@/components/ModeBanner';
import { GameBoard } from '@/components/GameBoard';
import { DeadEndToast } from '@/components/DeadEndToast';
import { ClearModal } from '@/components/ClearModal';
import { SettingsModal } from '@/components/SettingsModal';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { HelpCircle } from 'lucide-react';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  const { tickTimer, isCleared } = useGameStore();

  // キーボード操作の有効化
  useKeyboardControls();

  // タイマーインターバル
  useEffect(() => {
    if (isCleared) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isCleared, tickTimer]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-3 px-2 sm:px-4 max-w-lg mx-auto">
      {/* 上部ヘッダー（タイトル、ステージ、タイマー、操作ボタン） */}
      <div className="flex flex-col gap-1 w-full">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />
        <ModeBanner />
      </div>

      {/* 中央メイン盤面 */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto w-full">
        <GameBoard />
      </div>

      {/* 下部フッター ＆ ヘルプ案内 */}
      <footer className="w-full max-w-md mx-auto px-4 py-1 flex flex-col items-center gap-1.5 text-center">
        <button
          onClick={() => setShowHowTo(!showHowTo)}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>遊び方・ルールのヒント</span>
        </button>

        {showHowTo && (
          <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3 text-left text-xs text-slate-300 space-y-1.5 animate-fade-in shadow-xl">
            <p className="font-bold text-cyan-300">💡 基本ルール</p>
            <p>1. <strong>通常モード</strong>: 直前のマスの<strong>「文字の意味」</strong>と同じ<strong>「インク色」</strong>の隣接マスへ進みます。</p>
            <p>2. <strong>反転ゲート（⚡）</strong>: 通過するとルールが反転！直前のマスの<strong>「インク色」</strong>と同じ<strong>「文字の意味」</strong>へ進むようになります。</p>
            <p>3. <strong>自己交差禁止</strong>: すでに通ったマスへは戻れません（Undoで取り消すことは可能）。</p>
            <p className="text-[11px] text-slate-400 pt-1">
              ※ PCでは矢印キー / WASD / Z(Undo) / R(リセット) でも操作可能です。
            </p>
          </div>
        )}

        <div className="text-[10px] text-slate-600">
          Stroop Route - Cognitive Puzzle Game
        </div>
      </footer>

      {/* モーダル・トースト群 */}
      <DeadEndToast />
      <ClearModal />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
