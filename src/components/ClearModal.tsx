'use client';

import React, { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PRESET_STAGES } from '@/lib/stages';
import confetti from 'canvas-confetti';
import { Trophy, Share2, ArrowRight, RotateCcw, Check, Sparkles } from 'lucide-react';

export const ClearModal: React.FC = () => {
  const {
    isCleared,
    currentStageIndex,
    currentStage,
    timerSeconds,
    moveCount,
    path,
    reset,
    nextStage,
  } = useGameStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isCleared) {
      // 紙吹雪を打ち上げる
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#c084fc', '#f43f5e', '#34d399', '#fbbf24'],
      });
    }
  }, [isCleared]);

  if (!isCleared) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const hasNext = currentStageIndex < PRESET_STAGES.length - 1;

  // Wordle風絵文字共有テキスト生成
  const handleShare = () => {
    // パス中のGATEの有無などから絵文字を生成
    const pathEmojis = path
      .map((c) => {
        if (c.type === 'START') return '🟢';
        if (c.type === 'GATE') return '⚡';
        if (c.type === 'GOAL') return '★';
        return '🟩';
      })
      .join('');

    const text = `Stroop Route 【${currentStage.title}】 クリア！
⏱ Time: ${formatTime(timerSeconds)} | 🚶 Steps: ${moveCount}
🧠 抑制制御: +35pt | 認知的柔軟性: +30pt
${pathEmojis}
#StroopRoute #意色交差パズル #脳トレ
https://github.com/Bamboosato/app-stroop-route`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-purple-500/80 p-6 shadow-[0_0_30px_rgba(168,85,247,0.4)] flex flex-col items-center text-center">
        {/* トロフィーアイコン */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-3 animate-bounce">
          <Trophy className="w-9 h-9 fill-current" />
        </div>

        <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400">
          STAGE CLEAR!
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{currentStage.title}</p>

        {/* リザルト統計 */}
        <div className="grid grid-cols-2 gap-3 w-full my-4">
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              CLEAR TIME
            </span>
            <span className="text-lg font-mono font-black text-cyan-400 mt-0.5">
              {formatTime(timerSeconds)}
            </span>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700/60 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              TOTAL MOVES
            </span>
            <span className="text-lg font-mono font-black text-purple-400 mt-0.5">
              {moveCount} 手
            </span>
          </div>
        </div>

        {/* 認知機能スコアカード */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-3 border border-purple-900/50 mb-5 text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>脳科学スコア獲得</span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>抑制制御（読字自動化ブロック）</span>
              <span className="font-bold text-emerald-400">+35 pt</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>認知的柔軟性（ルール切り替え）</span>
              <span className="font-bold text-cyan-400">+30 pt</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>先読み空間ワーキングメモリ</span>
              <span className="font-bold text-amber-400">+28 pt</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col gap-2.5 w-full">
          {hasNext ? (
            <button
              onClick={nextStage}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <span>次のステージへ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-xs font-bold text-emerald-400 py-1">
              🎉 プリセットステージ全制覇！
            </div>
          )}

          <div className="flex gap-2 w-full">
            <button
              onClick={handleShare}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700/80 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">コピー完了！</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>結果を共有</span>
                </>
              )}
            </button>

            <button
              onClick={reset}
              className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700/80 flex items-center justify-center gap-1 transition active:scale-95"
              title="もう一度プレイ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>再挑戦</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
