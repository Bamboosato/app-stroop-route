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
    camR,
    camC,
    settings,
    stepTo,
    shiftCamera,
  } = useGameStore();

  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const tipCell = path[path.length - 1];
  const isScrollable = !!currentStage.isScrollable;

  // 次に移動可能な合法マス一覧（アシスト用）
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

  // ポインター操作（スワイプとドラッグの排他制御）
  const handlePointerDown = (e: React.PointerEvent) => {
    touchStartRef.current = { x: e.clientX, y: e.clientY };

    const targetEl = (e.target as HTMLElement).closest('[data-r]');
    if (!targetEl) {
      setIsDrawingPath(false);
      return;
    }

    const r = parseInt(targetEl.getAttribute('data-r') || '-1', 10);
    const c = parseInt(targetEl.getAttribute('data-c') || '-1', 10);

    // 先端セルから始まった場合のみドラッグ描画モードをON
    if (tipCell && tipCell.r === r && tipCell.c === c) {
      setIsDrawingPath(true);
    } else {
      setIsDrawingPath(false);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingPath) return;

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

  const handlePointerUp = (e: MouseEvent | TouchEvent | PointerEvent) => {
    if (isDrawingPath) {
      setIsDrawingPath(false);
      touchStartRef.current = null;
      return;
    }

    // スワイプ移動判定
    if (touchStartRef.current && isScrollable) {
      const clientX = 'clientX' in e ? e.clientX : (e as TouchEvent).changedTouches?.[0]?.clientX ?? 0;
      const clientY = 'clientY' in e ? e.clientY : (e as TouchEvent).changedTouches?.[0]?.clientY ?? 0;

      const dx = clientX - touchStartRef.current.x;
      const dy = clientY - touchStartRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist >= 32) {
        if (Math.abs(dx) > Math.abs(dy)) {
          // 水平スワイプ: 指を左に動かしたら右の視界へ (dx < 0 -> shift +1)
          if (dx < -32) {
            shiftCamera(0, 1);
          } else if (dx > 32) {
            shiftCamera(0, -1);
          }
        } else {
          // 垂直スワイプ: 指を上に動かしたら下の視界へ (dy < 0 -> shift +1)
          if (dy < -32) {
            shiftCamera(1, 0);
          } else if (dy > 32) {
            shiftCamera(-1, 0);
          }
        }
      }
    }

    touchStartRef.current = null;
    setIsDrawingPath(false);
  };

  useEffect(() => {
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDrawingPath, isScrollable, shiftCamera]);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-1 select-none flex flex-col items-center justify-center">
      {/* 4x4 ファインダービューポート (外枠: どのステージでも縦横4マスが完全にピッタリ収まる基準窓) */}
      <div
        id="gridWrapper"
        ref={boardWrapperRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className={`relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-950/90 backdrop-blur-md border-[4px] border-purple-500/80 shadow-[0_0_24px_rgba(168,85,247,0.35)] transition-transform ${
          isDeadEnd ? 'animate-shake' : ''
        }`}
        style={{
          touchAction: 'none',
          // 4x4 ビューポートを基準とした精密グリッド寸法
          // 1マスのサイズ = (ビューポート全幅100% - パディング左右16px - 3つのギャップ24px) / 4
          ['--gap' as any]: '8px',
          ['--pad' as any]: '8px',
          containerType: 'inline-size',
          ['--cell-size' as any]: 'calc((100cqw - 16px - 24px) / 4)',
        }}
      >
        {/* スライディング迷宮フレーム (.labyrinth-frame) */}
        <div
          className="relative transition-transform duration-300 ease-out"
          style={{
            // 迷宮全体の幅 = size個のセル + (size - 1)個のギャップ + パディング左右16px
            width: isScrollable
              ? `calc(var(--cell-size) * ${currentStage.size} + var(--gap) * ${currentStage.size - 1} + var(--pad) * 2)`
              : '100%',
            height: isScrollable
              ? `calc(var(--cell-size) * ${currentStage.size} + var(--gap) * ${currentStage.size - 1} + var(--pad) * 2)`
              : '100%',
            transform: isScrollable
              ? `translate3d(calc(-1 * ${camC} * (var(--cell-size) + var(--gap))), calc(-1 * ${camR} * (var(--cell-size) + var(--gap))), 0)`
              : 'none',
          }}
        >
          {/* 動的SVGコネクションライン */}
          <ConnectionLines
            path={path}
            size={currentStage.size}
            isReversedMode={isReversedMode}
          />

          {/* 全マスグリッド (4x4セルサイズで完全均一配置) */}
          <div
            className="grid w-full h-full p-2"
            style={{
              gridTemplateColumns: `repeat(${currentStage.size}, var(--cell-size))`,
              gridTemplateRows: `repeat(${currentStage.size}, var(--cell-size))`,
              gap: 'var(--gap)',
            }}
          >
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
    </div>
  );
};
