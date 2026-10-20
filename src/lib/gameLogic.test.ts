import { describe, it, expect } from 'vitest';
import { Cell } from '@/types/game';
import {
  isAdjacent,
  evaluateCurrentMode,
  checkValidMove,
  getValidNextMoves,
  checkDeadEnd,
} from '@/lib/gameLogic';

describe('gameLogic unit tests', () => {
  describe('isAdjacent', () => {
    it('should return true for directly adjacent orthogonal cells', () => {
      expect(isAdjacent({ r: 1, c: 1 }, { r: 0, c: 1 })).toBe(true); // 上
      expect(isAdjacent({ r: 1, c: 1 }, { r: 2, c: 1 })).toBe(true); // 下
      expect(isAdjacent({ r: 1, c: 1 }, { r: 1, c: 0 })).toBe(true); // 左
      expect(isAdjacent({ r: 1, c: 1 }, { r: 1, c: 2 })).toBe(true); // 右
    });

    it('should return false for diagonal or distant cells', () => {
      expect(isAdjacent({ r: 1, c: 1 }, { r: 0, c: 0 })).toBe(false); // 斜め
      expect(isAdjacent({ r: 1, c: 1 }, { r: 2, c: 2 })).toBe(false); // 斜め
      expect(isAdjacent({ r: 0, c: 0 }, { r: 0, c: 2 })).toBe(false); // 2マス離れ
      expect(isAdjacent({ r: 1, c: 1 }, { r: 1, c: 1 })).toBe(false); // 同一マス
    });
  });

  describe('evaluateCurrentMode', () => {
    const normalCell: Cell = { r: 0, c: 0, word: 'RED', ink: 'BLUE', type: 'START' };
    const gateCell1: Cell = { r: 1, c: 0, word: 'BLUE', ink: 'GREEN', type: 'GATE' };
    const normalCell2: Cell = { r: 2, c: 0, word: 'GREEN', ink: 'YELLOW', type: 'NORMAL' };
    const gateCell2: Cell = { r: 2, c: 1, word: 'YELLOW', ink: 'RED', type: 'GATE' };

    it('should return false when path contains 0 GATEs', () => {
      expect(evaluateCurrentMode([normalCell])).toBe(false);
    });

    it('should return true when path contains 1 GATE', () => {
      expect(evaluateCurrentMode([normalCell, gateCell1])).toBe(true);
      expect(evaluateCurrentMode([normalCell, gateCell1, normalCell2])).toBe(true);
    });

    it('should return false when path contains 2 GATEs (inverted back)', () => {
      expect(evaluateCurrentMode([normalCell, gateCell1, normalCell2, gateCell2])).toBe(false);
    });
  });

  describe('checkValidMove', () => {
    const startCell: Cell = {
      r: 0,
      c: 0,
      word: 'RED',
      ink: 'BLUE',
      type: 'START',
    };

    it('Normal Mode: allows move when target ink matches prev word', () => {
      const targetCell: Cell = {
        r: 0,
        c: 1,
        word: 'GREEN',
        ink: 'RED', // Matches startCell.word ('RED')
        type: 'NORMAL',
      };

      const result = checkValidMove(startCell, targetCell, false, [startCell]);
      expect(result.isValid).toBe(true);
    });

    it('Normal Mode: rejects move when target ink does not match prev word', () => {
      const targetCell: Cell = {
        r: 0,
        c: 1,
        word: 'GREEN',
        ink: 'YELLOW', // Does not match startCell.word ('RED')
        type: 'NORMAL',
      };

      const result = checkValidMove(startCell, targetCell, false, [startCell]);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('STROOP_MISMATCH');
    });

    it('Reversed Mode: allows move when target word matches prev ink', () => {
      const prevCell: Cell = {
        r: 1,
        c: 1,
        word: 'PURPLE',
        ink: 'BLUE',
        type: 'GATE',
      };
      const targetCell: Cell = {
        r: 1,
        c: 2,
        word: 'BLUE', // Matches prevCell.ink ('BLUE')
        ink: 'YELLOW',
        type: 'NORMAL',
      };

      const result = checkValidMove(prevCell, targetCell, true, [startCell, prevCell]);
      expect(result.isValid).toBe(true);
    });

    it('Reversed Mode: rejects move when target word does not match prev ink', () => {
      const prevCell: Cell = {
        r: 1,
        c: 1,
        word: 'PURPLE',
        ink: 'BLUE',
        type: 'GATE',
      };
      const targetCell: Cell = {
        r: 1,
        c: 2,
        word: 'RED', // Does not match prevCell.ink ('BLUE')
        ink: 'YELLOW',
        type: 'NORMAL',
      };

      const result = checkValidMove(prevCell, targetCell, true, [startCell, prevCell]);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('STROOP_MISMATCH');
    });

    it('rejects move if target is already visited (no self-intersection)', () => {
      const cell1: Cell = { r: 0, c: 0, word: 'RED', ink: 'BLUE', type: 'START' };
      const cell2: Cell = { r: 0, c: 1, word: 'BLUE', ink: 'RED', type: 'NORMAL' };

      // Try to move back from cell2 to cell1
      const result = checkValidMove(cell2, cell1, false, [cell1, cell2]);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('ALREADY_VISITED');
    });

    it('rejects move if target is not orthogonally adjacent', () => {
      const targetCell: Cell = {
        r: 1,
        c: 1, // diagonal
        word: 'GREEN',
        ink: 'RED',
        type: 'NORMAL',
      };

      const result = checkValidMove(startCell, targetCell, false, [startCell]);
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe('NOT_ADJACENT');
    });
  });

  describe('getValidNextMoves and checkDeadEnd', () => {
    const gridCells: Cell[] = [
      { r: 0, c: 0, word: 'RED', ink: 'BLUE', type: 'START' },
      { r: 0, c: 1, word: 'PURPLE', ink: 'RED', type: 'NORMAL' }, // Valid under normal (ink: RED)
      { r: 1, c: 0, word: 'YELLOW', ink: 'GREEN', type: 'NORMAL' }, // Invalid under normal (ink: GREEN != RED)
      { r: 1, c: 1, word: 'GREEN', ink: 'PURPLE', type: 'GOAL' },
    ];

    it('returns all valid adjacent moves', () => {
      const tip = gridCells[0]; // (0,0), word: RED, ink: BLUE
      const validMoves = getValidNextMoves(tip, false, [tip], gridCells);

      expect(validMoves.length).toBe(1);
      expect(validMoves[0].r).toBe(0);
      expect(validMoves[0].c).toBe(1);
    });

    it('detects dead end when no moves are possible', () => {
      // If (0,1) is already visited and (1,0) has wrong ink
      const tip = gridCells[0];
      const visited = [gridCells[1], tip]; // Both (0,1) and (0,0) visited

      const isDead = checkDeadEnd(tip, false, visited, gridCells);
      expect(isDead).toBe(true);
    });

    it('does not flag dead end if tip is the GOAL cell', () => {
      const goalCell = gridCells[3];
      const isDead = checkDeadEnd(goalCell, false, gridCells, gridCells);
      expect(isDead).toBe(false);
    });
  });
});
