'use client';

import React from 'react';
import { X, HelpCircle, Zap, Compass, Move } from 'lucide-react';

interface HowToModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToModal: React.FC<HowToModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4 text-xs text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span>遊び方・ルールのヒント</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ルール解説リスト */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
              1. 通常モード（文字の意味 ➔ インク色）
            </div>
            <p className="text-slate-300 leading-relaxed">
              直前のマスの<strong>「文字の意味」</strong>と同じ<strong>「インク色」</strong>を持つ隣接マスへ進みます。
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-1">
            <div className="font-bold text-purple-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-white fill-current" />
              2. 反転ゲート（インク色 ➔ 文字の意味）
            </div>
            <p className="text-slate-300 leading-relaxed">
              雷マーク（⚡）を通過するとモードが反転！直前のマスの<strong>「インク色」</strong>と同じ<strong>「文字の意味」</strong>へ進みます。
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              3. 広大迷宮（Stage 4, 5, Daily）
            </div>
            <p className="text-slate-300 leading-relaxed">
              盤面をスワイプ、または下部のミニドットをタップすると、4×4の視界窓がスライドして迷宮全体を探索できます。
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-0.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Move className="w-3 h-3 text-slate-400" /> PC操作ショートカット:
            </span>
            <span>矢印キー / WASD（移動・視界）</span>
            <span>Z（1手戻す） / R（リセット）</span>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold transition shadow-lg active:scale-95"
        >
          わかった！
        </button>
      </div>
    </div>
  );
};
