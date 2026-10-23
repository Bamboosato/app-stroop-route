import { describe, it, expect } from 'vitest';
import { PRESET_STAGES, getDailyStage, getRandomStage } from '@/lib/stages';
import { checkValidMove, evaluateCurrentMode, getCellAt } from '@/lib/gameLogic';
import { Cell } from '@/types/game';

describe('Preset Stages validation', () => {
  it('should have 7 preset stages', () => {
    expect(PRESET_STAGES.length).toBe(7);
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
        expect(result.isValid, `Step ${i} to (${cell?.r},${cell?.c}) failed: ${result.reason}`).toBe(true);
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

  it('Stage 4 should be 7x7 scrollable with 49 cells and 1 GATE', () => {
    const stage = PRESET_STAGES[3];
    expect(stage.size).toBe(7);
    expect(stage.isScrollable).toBe(true);
    expect(stage.cells.length).toBe(49);
    expect(stage.cells.filter((c) => c.type === 'GATE').length).toBe(1);
  });

  it('Stage 5 should be 10x10 scrollable with 100 cells and 2 GATEs', () => {
    const stage = PRESET_STAGES[4];
    expect(stage.size).toBe(10);
    expect(stage.isScrollable).toBe(true);
    expect(stage.cells.length).toBe(100);
    expect(stage.cells.filter((c) => c.type === 'GATE').length).toBe(2);
  });

  it('Stage 6 (English Only) should have a valid solvable path with GATE', () => {
    const stage = PRESET_STAGES[5];
    expect(stage.id).toBe(6);
    expect(stage.cells.every((c) => c.notation === 'english')).toBe(true);

    const pathCoords = [
      [0, 0], [0, 1], [1, 1], [2, 1], [2, 2], [2, 3], [3, 3],
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
    expect(gateIndex).toBe(3);
    expect(evaluateCurrentMode(path.slice(0, gateIndex + 1))).toBe(true);

    const lastCell = path[path.length - 1];
    expect(lastCell.type).toBe('GOAL');
    expect(lastCell.r).toBe(3);
    expect(lastCell.c).toBe(3);
  });

  it('Stage 7 (Global 4表記) should have a valid solvable path with GATE', () => {
    const stage = PRESET_STAGES[6];
    expect(stage.id).toBe(7);
    const notations = new Set(stage.cells.map((c) => c.notation));
    expect(notations.has('kanji')).toBe(true);
    expect(notations.has('katakana')).toBe(true);
    expect(notations.has('hiragana')).toBe(true);
    expect(notations.has('english')).toBe(true);

    const pathCoords = [
      [0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 3], [2, 4], [3, 4], [4, 4],
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
    expect(gateIndex).toBe(4);
    expect(evaluateCurrentMode(path.slice(0, gateIndex + 1))).toBe(true);

    const lastCell = path[path.length - 1];
    expect(lastCell.type).toBe('GOAL');
    expect(lastCell.r).toBe(4);
    expect(lastCell.c).toBe(4);
  });

  describe('Daily Stage and Random Generator', () => {
    it('getDailyStage should be deterministic for the same date and include english in mixed_global', () => {
      const fixedDate = new Date(2026, 9, 20); // 2026-10-20
      const daily1 = getDailyStage(fixedDate);
      const daily2 = getDailyStage(fixedDate);

      expect(daily1.title).toBe('Daily: 2026/10/20');
      expect(daily1.cells.length).toBe(49);
      expect(daily1.cells[0].word).toBe(daily2.cells[0].word);
      expect(daily1.cells[0].ink).toBe(daily2.cells[0].ink);
      
      const notations = new Set(daily1.cells.map((c) => c.notation));
      expect(notations.has('english')).toBe(true);
    });

    it('getRandomStage should generate valid stages with appropriate size', () => {
      const rand4 = getRandomStage(4);
      expect(rand4.size).toBe(4);
      expect(rand4.cells.length).toBe(16);

      const rand10 = getRandomStage(10);
      expect(rand10.size).toBe(10);
      expect(rand10.cells.length).toBe(100);
      expect(rand10.isScrollable).toBe(true);
      const notations = new Set(rand10.cells.map((c) => c.notation));
      expect(notations.has('english')).toBe(true);
    });
  });
});
