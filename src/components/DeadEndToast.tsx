'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { AlertTriangle, Undo2, RotateCcw } from 'lucide-react';

export const DeadEndToast: React.FC = () => {
  const { isDeadEnd, undo, reset } = useGameStore();

  if (!isDeadEnd) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-sm z-50 animate-bounce">
      <div className="bg-gradient-to-r from-rose-950/95 via-red-900/95 to-rose-950/95 border-2 border-rose-500 rounded-2xl p-3 shadow-[0_0_20px_rgba(244,63,94,0.6)] backdrop-blur-md flex flex-col gap-2">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="text-xs font-bold leading-tight">
            行き止まりです！進めるマスがありません。
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-800/60">
          <button
            onClick={undo}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-lg shadow-cyan-600/40 animate-pulse active:scale-95 transition"
          >
            <Undo2 className="w-3.5 h-3.5" />
            1手戻す
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold active:scale-95 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            最初から
          </button>
        </div>
      </div>
    </div>
  );
};
