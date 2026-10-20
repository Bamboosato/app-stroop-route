import { describe, it, expect } from 'vitest';
import { PRESET_STAGES } from '@/lib/stages';
import { checkValidMove, evaluateCurrentMode, getCellAt } from '@/lib/gameLogic';
import { Cell } from '@/types/game';

describe('Preset Stages validation', () => {
  it('should have 3 preset stages', () => {
    expect(PRESET_STAGES.length).toBe(3);
  });

  it('Stage 1 should have a valid solvable path to goal', () => {
    const stage = PRESET_STAGES[0];
    const pathCoords = [
      [0, 0], [0, 1], [1, 1], [1, 2], [2, 2], [2, 1], [3, 1], [3, 2], [3, 3],
    ];

    const path: Cell[] = [];
    for (let i = 0; i < pathCoords.length; i++) {
      const [r, c] = pathCoords[i];
      const cell = getCellAt(stage.cells, r, c);
      expect(cell).toBeDefined();

      if (i === 0) {
        expect(cell?.type).toBe('START');
        path.push(cell!);
      } else {
        const prev = path[path.length - 1];
        const isReversed = evaluateCurrentMode(path);
        const result = checkValidMove(prev, cell!, isReversed, path);
        expect(result.isValid, `Step ${i} from (${prev.r},${prev.c}) to (${cell?.r},${cell?.c}) failed: ${result.reason}`).toBe(true);
        path.push(cell!);
      }
    }

    const lastCell = path[path.length - 1];
    expect(lastCell.type).toBe('GOAL');
    expect(lastCell.r).toBe(stage.goal.r);
    expect(lastCell.c).toBe(stage.goal.c);
  });

  it('Stage 2 should have a valid solvable path with GATE triggering reversed mode', () => {
    const stage = PRESET_STAGES[1];
    const pathCoords = [
      [0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [1, 2], [1, 3], [2, 3], [3, 3],
    ];

    const path: Cell[] = [];
    for (let i = 0; i < pathCoords.length; i++) {
      const [r, c] = pathCoords[i];
      const cell = getCellAt(stage.cells, r, c);
      expect(cell).toBeDefined();

      if (i === 0) {
        expect(cell?.type).toBe('START');
        path.push(cell!);
      } else {
        const prev = path[path.length - 1];
        const isReversed = evaluateCurrentMode(path);
        const result = checkValidMove(prev, cell!, isReversed, path);
        expect(result.isValid, `Step ${i} to (${cell?.r},${cell?.c}) failed: ${result.reason}`).toBe(true);
        path.push(cell!);
      }
    }

    const gateIndex = path.findIndex((c) => c.type === 'GATE');
    expect(gateIndex).toBeGreaterThan(0);
    // After entering GATE, path contains 1 GATE, so reversed mode is true
    expect(evaluateCurrentMode(path.slice(0, gateIndex + 1))).toBe(true);

    const lastCell = path[path.length - 1];
    expect(lastCell.type).toBe('GOAL');
  });

  it('Stage 3 should have a valid solvable path in 5x5 grid', () => {
    const stage = PRESET_STAGES[2];
    const pathCoords = [
      [0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [3, 1], [4, 1], [4, 2], [3, 2], [3, 3], [3, 4], [4, 4],
    ];

    const path: Cell[] = [];
    for (let i = 0; i < pathCoords.length; i++) {
      const [r, c] = pathCoords[i];
      const cell = getCellAt(stage.cells, r, c);
      expect(cell).toBeDefined();

      if (i === 0) {
        expect(cell?.type).toBe('START');
        path.push(cell!);
      } else {
        const prev = path[path.length - 1];
        const isReversed = evaluateCurrentMode(path);
        const result = checkValidMove(prev, cell!, isReversed, path);
        expect(result.isValid, `Step ${i} to (${cell?.r},${cell?.c}) failed: ${result.reason}`).toBe(true);
        path.push(cell!);
      }
    }

    const lastCell = path[path.length - 1];
    expect(lastCell.type).toBe('GOAL');
    expect(lastCell.r).toBe(4);
    expect(lastCell.c).toBe(4);
  });
});
