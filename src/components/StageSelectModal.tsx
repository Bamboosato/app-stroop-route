'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { PRESET_STAGES, getDailyStage, getRandomStage } from '@/lib/stages';
import { X, Calendar, Dices, Layers, ChevronRight } from 'lucide-react';

interface StageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentStage, currentStageIndex, initStage, loadCustomStage } = useGameStore();

  if (!isOpen) return null;

  const handleSelectPreset = (idx: number) => {
    initStage(idx);
    onClose();
  };

  const handleSelectDaily = () => {
    const daily = getDailyStage();
    loadCustomStage(daily);
    onClose();
  };

  const handleSelectRandom = (size: number) => {
    const rand = getRandomStage(size);
    loadCustomStage(rand);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>ステージ選択</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* デイリーチャレンジ */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            SPECIAL
          </span>
          <button
            onClick={handleSelectDaily}
            className={`w-full mt-1.5 p-3 rounded-2xl border text-left transition flex items-center justify-between group ${
              currentStage.id === 999
                ? 'bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.3)]'
                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-black text-purple-200">
                  デイリーチャレンジ
                </div>
                <div className="text-[10px] text-slate-400">
                  本日限定・全世界共通の7×7迷宮
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-300 transition" />
          </button>
        </div>

        {/* プリセットステージ一覧 */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            CAMPAIGN STAGES
          </span>
          <div className="grid grid-cols-1 gap-2 mt-1.5">
            {PRESET_STAGES.map((stg, idx) => {
              const isSelected = currentStageIndex === idx && currentStage.id !== 999;
              return (
                <button
                  key={stg.id}
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {stg.id}
                    </span>
                    <div>
                      <div
                        className={`text-xs font-bold ${
                          isSelected ? 'text-cyan-300' : 'text-slate-200'
                        }`}
                      >
                        {stg.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {stg.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                </button>
              );
            })}
          </div>
        </div>

        {/* フリープレイ（ランダム生成） */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            FREE PLAY (無限生成)
          </span>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {[
              { label: '4×4 初級', size: 4 },
              { label: '5×5 中級', size: 5 },
              { label: '7×7 広大', size: 7 },
              { label: '10×10 巨大', size: 10 },
            ].map((item) => (
              <button
                key={item.size}
                onClick={() => handleSelectRandom(item.size)}
                className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  <Dices className="w-3.5 h-3.5 text-amber-400" />
                  <span>{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
