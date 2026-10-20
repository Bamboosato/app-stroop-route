'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CellItem } from './CellItem';
import { ConnectionLines } from './ConnectionLines';
import { getValidNextMoves } from '@/lib/gameLogic';
import { Cell } from '@/types/game';

export const GameBoard: React.FC = () => {
  const {
    currentStage,
    path,
    isReversedMode,
    isDeadEnd,
    settings,
    stepTo,
    undo,
  } = useGameStore();

  const boardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const tipCell = path[path.length - 1];

  // 次に移動可能な合法マスの一覧（アシスト用）
  const nextCandidateMoves = React.useMemo(() => {
    if (!tipCell || !settings.isMoveAssist) return [];
    return getValidNextMoves(
      tipCell,
      isReversedMode,
      path,
      currentStage.cells
    );
  }, [tipCell, isReversedMode, path, currentStage.cells, settings.isMoveAssist]);

  const isCandidate = useCallback(
    (cell: Cell) => {
      return nextCandidateMoves.some((c) => c.r === cell.r && c.c === cell.c);
    },
    [nextCandidateMoves]
  );

  const isVisited = useCallback(
    (cell: Cell) => {
      return path.some((c) => c.r === cell.r && c.c === cell.c);
    },
    [path]
  );

  // ポインタードラッグ操作
  const handlePointerDown = (e: React.PointerEvent) => {
    const target = (e.target as HTMLElement).closest('[data-r]');
    if (!target) return;

    const r = parseInt(target.getAttribute('data-r') || '-1', 10);
    const c = parseInt(target.getAttribute('data-c') || '-1', 10);

    if (tipCell && tipCell.r === r && tipCell.c === c) {
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    // 現在のポインター直下にあるセル要素を探索
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-r]');
    if (!el) return;

    const r = parseInt(el.getAttribute('data-r') || '-1', 10);
    const c = parseInt(el.getAttribute('data-c') || '-1', 10);
    if (r === -1 || c === -1) return;

    const targetCell = currentStage.cells.find((cell) => cell.r === r && cell.c === c);
    if (!targetCell) return;

    // 現在の先端マスと異なる場合のみステップ試行
    if (!tipCell || (targetCell.r !== tipCell.r || targetCell.c !== tipCell.c)) {
      stepTo(targetCell);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  const gridColsClass = currentStage.size === 5 ? 'grid-cols-5 gap-1.5' : 'grid-cols-4 gap-2';

  return (
    <div className="w-full max-w-md mx-auto px-4 py-2 select-none flex flex-col items-center justify-center">
      <div
        ref={boardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={`relative w-full aspect-square p-2.5 rounded-3xl bg-slate-950/80 backdrop-blur-md border-[4px] border-purple-500/80 shadow-[0_0_24px_rgba(168,85,247,0.35)] transition-transform ${
          isDeadEnd ? 'animate-shake' : ''
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* SVG コネクションライン */}
        <ConnectionLines
          path={path}
          size={currentStage.size}
          isReversedMode={isReversedMode}
        />

        {/* グリッドマス */}
        <div className={`grid ${gridColsClass} w-full h-full relative z-0`}>
          {currentStage.cells.map((cell) => {
            const isTip = tipCell?.r === cell.r && tipCell?.c === cell.c;
            return (
              <CellItem
                key={`${cell.r}-${cell.c}`}
                cell={cell}
                isTip={isTip}
                isVisited={isVisited(cell)}
                isNextCandidate={isCandidate(cell)}
                isCudMode={settings.isCudMode}
                onSelect={(selectedCell) => stepTo(selectedCell)}
                gridSize={currentStage.size}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
