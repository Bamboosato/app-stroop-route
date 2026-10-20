'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getCellAt } from '@/lib/gameLogic';

export function useKeyboardControls() {
  const { path, currentStage, stepTo, undo, reset, isCleared } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 入力フォーム等のフォーカス時は無効化
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') {
        e.preventDefault();
        undo();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        reset();
        return;
      }

      if (isCleared) return;

      const tipCell = path[path.length - 1];
      if (!tipCell) return;

      let dr = 0;
      let dc = 0;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          dr = -1;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          dr = 1;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dc = -1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          dc = 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const targetR = tipCell.r + dr;
      const targetC = tipCell.c + dc;
      const targetCell = getCellAt(currentStage.cells, targetR, targetC);

      if (targetCell) {
        stepTo(targetCell);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [path, currentStage, stepTo, undo, reset, isCleared]);
}
