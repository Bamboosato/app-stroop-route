import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/store/useGameStore';
import { PRESET_STAGES } from '@/lib/stages';
import { getCellAt } from '@/lib/gameLogic';

describe('useGameStore rewindTo and stepTo past cell', () => {
  beforeEach(() => {
    // Stage 2 (4x4, GATEあり) で初期化
    useGameStore.getState().initStage(1);
  });

  it('rewinds to past cell when clicking a visited cell across GATE', () => {
    const stage = PRESET_STAGES[1]; // Stage 2
    // 解法パス: (0,0) -> (1,0) -> (2,0) -> (2,1)[GATE] -> (1,1) -> (1,2)
    const stepCoords = [
      [1, 0], // NORMAL
      [2, 0], // NORMAL
      [2, 1], // GATE (反転モードON)
      [1, 1], // NORMAL (反転モード中)
      [1, 2], // NORMAL (反転モード中)
    ];

    for (const [r, c] of stepCoords) {
      const cell = getCellAt(stage.cells, r, c)!;
      useGameStore.getState().stepTo(cell);
    }

    const stateAfterSteps = useGameStore.getState();
    expect(stateAfterSteps.path.length).toBe(6); // (0,0) + 5 steps
    expect(stateAfterSteps.isReversedMode).toBe(true);

    // 1. GATEより手前の過去マス (1,0) をタップ
    const cellAt10 = getCellAt(stage.cells, 1, 0)!;
    useGameStore.getState().stepTo(cellAt10);

    const stateAfterRewind = useGameStore.getState();
    // パスは (0,0) と (1,0) の2マスになる
    expect(stateAfterRewind.path.length).toBe(2);
    expect(stateAfterRewind.path[1].r).toBe(1);
    expect(stateAfterRewind.path[1].c).toBe(0);
    // GATEを跨いで戻ったため、通常モード (false) に復元されていること！
    expect(stateAfterRewind.isReversedMode).toBe(false);

    // 2. 現在の先端マス (1,0) をタップしても変化しないこと
    useGameStore.getState().stepTo(cellAt10);
    expect(useGameStore.getState().path.length).toBe(2);
  });

  it('undo() still works as single-step rewind', () => {
    const stage = PRESET_STAGES[1];
    const cell1 = getCellAt(stage.cells, 1, 0)!;
    const cell2 = getCellAt(stage.cells, 2, 0)!;

    useGameStore.getState().stepTo(cell1);
    useGameStore.getState().stepTo(cell2);
    expect(useGameStore.getState().path.length).toBe(3);

    useGameStore.getState().undo();
    expect(useGameStore.getState().path.length).toBe(2);
    expect(useGameStore.getState().path[1]).toEqual(cell1);
  });

  it('adjusts camera viewport when rewinding to distant past cell in scrollable stage', () => {
    // Stage 5 (10x10) で初期化
    useGameStore.getState().initStage(4);
    const stage = PRESET_STAGES[4];

    // (1,0) へ移動してパス長を 2 にする
    const nextCell = getCellAt(stage.cells, 1, 0)!;
    useGameStore.getState().stepTo(nextCell);
    expect(useGameStore.getState().path.length).toBe(2);

    // カメラ位置を強制的に (6, 6) に移動
    useGameStore.setState({ camR: 6, camC: 6 });
    expect(useGameStore.getState().camR).toBe(6);

    // スタート地点 (0, 0) へ巻き戻し
    useGameStore.getState().rewindTo(0);
    const state = useGameStore.getState();
    expect(state.path.length).toBe(1);
    // カメラが (0,0) を視野に含む位置（0, 0）に戻っていること
    expect(state.camR).toBe(0);
    expect(state.camC).toBe(0);
  });

  it('handles lives deduction and game over on 3 mistakes', () => {
    const stage = PRESET_STAGES[1]; // Stage 2
    expect(useGameStore.getState().lives).toBe(3);
    expect(useGameStore.getState().isGameOver).toBe(false);

    // 不正なセル (0,3) をタップ (隣接していない/ルール不一致)
    const invalidCell = getCellAt(stage.cells, 0, 3)!;

    // 1回目のミス
    useGameStore.getState().stepTo(invalidCell);
    expect(useGameStore.getState().lives).toBe(2);
    expect(useGameStore.getState().isGameOver).toBe(false);

    // 2回目のミス
    useGameStore.getState().stepTo(invalidCell);
    expect(useGameStore.getState().lives).toBe(1);
    expect(useGameStore.getState().isGameOver).toBe(false);

    // 3回目のミス -> ゲームオーバー
    useGameStore.getState().stepTo(invalidCell);
    expect(useGameStore.getState().lives).toBe(0);
    expect(useGameStore.getState().isGameOver).toBe(true);

    // ゲームオーバー後は移動が無効
    const validCell = getCellAt(stage.cells, 1, 0)!;
    useGameStore.getState().stepTo(validCell);
    expect(useGameStore.getState().path.length).toBe(1); // スタートのみ

    // reset() でライフが3に復帰
    useGameStore.getState().reset();
    expect(useGameStore.getState().lives).toBe(3);
    expect(useGameStore.getState().isGameOver).toBe(false);
  });
});
