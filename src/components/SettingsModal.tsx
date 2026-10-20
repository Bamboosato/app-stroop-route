'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { X, Volume2, VolumeX, Eye, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl flex flex-col gap-5">
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>ゲーム設定</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 設定リスト */}
        <div className="space-y-4 text-xs">
          {/* CUDモード */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-800">
            <div className="flex flex-col pr-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-cyan-400" />
                CUD (色覚配慮) 表示
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                マスの右下にインク色名バッジを表示します
              </span>
            </div>
            <button
              onClick={() => updateSettings({ isCudMode: !settings.isCudMode })}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.isCudMode ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                  settings.isCudMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* ルート候補アシスト */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-800">
            <div className="flex flex-col pr-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                ルート候補アシスト
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                進める隣接マスをリングハイライトで表示します
              </span>
            </div>
            <button
              onClick={() => updateSettings({ isMoveAssist: !settings.isMoveAssist })}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                settings.isMoveAssist ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                  settings.isMoveAssist ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* サウンド設定 */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                {settings.isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-purple-400" />
                )}
                効果音 (Web Audio)
              </span>
              <button
                onClick={() => updateSettings({ isMuted: !settings.isMuted })}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                  settings.isMuted
                    ? 'border-rose-500 text-rose-400 bg-rose-950/30'
                    : 'border-slate-700 text-slate-300 bg-slate-800'
                }`}
              >
                {settings.isMuted ? '消音中' : '有効'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                disabled={settings.isMuted}
                onChange={(e) =>
                  updateSettings({ soundVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-purple-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer disabled:opacity-30"
              />
              <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition active:scale-95"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
