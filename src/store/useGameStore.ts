import { create } from 'zustand';
import { Cell, GameSettings, GameState, Stage } from '@/types/game';
import { PRESET_STAGES } from '@/lib/stages';
import {
  checkValidMove,
  evaluateCurrentMode,
  checkDeadEnd,
  getCellAt,
} from '@/lib/gameLogic';
import { soundService } from '@/lib/sound';

interface GameActions {
  initStage: (stageIndex: number) => void;
  stepTo: (cell: Cell) => void;
  undo: () => void;
  reset: () => void;
  nextStage: () => void;
  prevStage: () => void;
  tickTimer: () => void;
  setCamPos: (r: number, c: number) => void;
  shiftCamera: (dr: number, dc: number) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
}

const DEFAULT_SETTINGS: GameSettings = {
  isCudMode: false,
  isMoveAssist: true,
  soundVolume: 0.5,
  isMuted: false,
};

function loadSettingsFromStorage(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem('stroop_route_settings');
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

function saveSettingsToStorage(settings: GameSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('stroop_route_settings', JSON.stringify(settings));
  } catch {
    // ignore
  }
}

function getMaxCamOffset(size: number): number {
  if (size === 7) return 3;
  if (size === 10) return 6;
  return 0;
}

export const useGameStore = create<GameState & GameActions>((set, get) => {
  const initialSettings = loadSettingsFromStorage();
  const initialStage = PRESET_STAGES[0];
  const startCell =
    getCellAt(initialStage.cells, initialStage.start.r, initialStage.start.c) ||
    initialStage.cells[0];

  return {
    currentStageIndex: 0,
    currentStage: initialStage,
    path: [startCell],
    isReversedMode: false,
    timerSeconds: 0,
    isCleared: false,
    isDeadEnd: false,
    camR: 0,
    camC: 0,
    moveCount: 0,
    settings: initialSettings,

    initStage: (stageIndex: number) => {
      const stage = PRESET_STAGES[stageIndex] || PRESET_STAGES[0];
      const start =
        getCellAt(stage.cells, stage.start.r, stage.start.c) || stage.cells[0];
      const state = get();

      // Stage 1〜2はデフォルトでアシストON、Stage 3以降は自力モード（OFF）
      const shouldAssist = stage.id <= 2;
      const updatedSettings: GameSettings = {
        ...state.settings,
        isMoveAssist: shouldAssist,
      };

      set({
        currentStageIndex: stageIndex,
        currentStage: stage,
        path: [start],
        isReversedMode: false,
        timerSeconds: 0,
        isCleared: false,
        isDeadEnd: false,
        camR: 0,
        camC: 0,
        moveCount: 0,
        settings: updatedSettings,
      });
    },

    stepTo: (targetCell: Cell) => {
      const state = get();
      if (state.isCleared) return;

      const currentPath = state.path;
      const tipCell = currentPath[currentPath.length - 1];

      // すでに訪問済みの直前セルをクリックした場合はUndoとして処理
      if (currentPath.length > 1) {
        const prevOfTip = currentPath[currentPath.length - 2];
        if (prevOfTip.r === targetCell.r && prevOfTip.c === targetCell.c) {
          get().undo();
          return;
        }
      }

      // 移動可否判定
      const result = checkValidMove(
        tipCell,
        targetCell,
        state.isReversedMode,
        currentPath
      );

      if (!result.isValid) {
        soundService.playError();
        return;
      }

      const newPath = [...currentPath, targetCell];
      const newReversed = evaluateCurrentMode(newPath);
      const isGoal = targetCell.type === 'GOAL';

      // サウンド再生
      soundService.playStep(newPath.length);
      if (targetCell.type === 'GATE') {
        soundService.playGate();
      }

      let isDead = false;
      if (isGoal) {
        soundService.playClear();
      } else {
        isDead = checkDeadEnd(
          targetCell,
          newReversed,
          newPath,
          state.currentStage.cells
        );
        if (isDead) {
          soundService.playDeadEnd();
        }
      }

      // 自動カメラ追従 (広大迷宮時)
      let nextCamR = state.camR;
      let nextCamC = state.camC;

      if (state.currentStage.isScrollable) {
        const maxOffset = getMaxCamOffset(state.currentStage.size);
        if (targetCell.r < state.camR) {
          nextCamR = Math.max(0, state.camR - 3);
        } else if (targetCell.r >= state.camR + 4) {
          nextCamR = Math.min(maxOffset, state.camR + 3);
        }

        if (targetCell.c < state.camC) {
          nextCamC = Math.max(0, state.camC - 3);
        } else if (targetCell.c >= state.camC + 4) {
          nextCamC = Math.min(maxOffset, state.camC + 3);
        }

        if (nextCamR !== state.camR || nextCamC !== state.camC) {
          soundService.playSlide();
        }
      }

      set({
        path: newPath,
        isReversedMode: newReversed,
        isCleared: isGoal,
        isDeadEnd: isDead,
        moveCount: state.moveCount + 1,
        camR: nextCamR,
        camC: nextCamC,
      });
    },

    undo: () => {
      const state = get();
      if (state.path.length <= 1 || state.isCleared) return;

      const newPath = state.path.slice(0, -1);
      const newReversed = evaluateCurrentMode(newPath);
      const tipCell = newPath[newPath.length - 1];
      const isDead = checkDeadEnd(
        tipCell,
        newReversed,
        newPath,
        state.currentStage.cells
      );

      soundService.playUndo();

      // Undo時も必要に応じてカメラ追従
      let nextCamR = state.camR;
      let nextCamC = state.camC;
      if (state.currentStage.isScrollable && tipCell) {
        const maxOffset = getMaxCamOffset(state.currentStage.size);
        if (tipCell.r < state.camR) {
          nextCamR = Math.max(0, state.camR - 3);
        } else if (tipCell.r >= state.camR + 4) {
          nextCamR = Math.min(maxOffset, state.camR + 3);
        }
        if (tipCell.c < state.camC) {
          nextCamC = Math.max(0, state.camC - 3);
        } else if (tipCell.c >= state.camC + 4) {
          nextCamC = Math.min(maxOffset, state.camC + 3);
        }
      }

      set({
        path: newPath,
        isReversedMode: newReversed,
        isDeadEnd: isDead,
        camR: nextCamR,
        camC: nextCamC,
      });
    },

    reset: () => {
      const state = get();
      const start =
        getCellAt(
          state.currentStage.cells,
          state.currentStage.start.r,
          state.currentStage.start.c
        ) || state.currentStage.cells[0];
      soundService.playUndo();

      set({
        path: [start],
        isReversedMode: false,
        isCleared: false,
        isDeadEnd: false,
        moveCount: 0,
        camR: 0,
        camC: 0,
      });
    },

    nextStage: () => {
      const state = get();
      if (state.currentStageIndex < PRESET_STAGES.length - 1) {
        get().initStage(state.currentStageIndex + 1);
      }
    },

    prevStage: () => {
      const state = get();
      if (state.currentStageIndex > 0) {
        get().initStage(state.currentStageIndex - 1);
      }
    },

    tickTimer: () => {
      const state = get();
      if (!state.isCleared) {
        set({ timerSeconds: state.timerSeconds + 1 });
      }
    },

    setCamPos: (r: number, c: number) => {
      const state = get();
      const maxOffset = getMaxCamOffset(state.currentStage.size);
      const targetR = Math.max(0, Math.min(maxOffset, r));
      const targetC = Math.max(0, Math.min(maxOffset, c));
      set({ camR: targetR, camC: targetC });
    },

    shiftCamera: (dr: number, dc: number) => {
      const state = get();
      if (!state.currentStage.isScrollable) return;

      const maxOffset = getMaxCamOffset(state.currentStage.size);
      const nextR = Math.max(0, Math.min(maxOffset, state.camR + dr * 3));
      const nextC = Math.max(0, Math.min(maxOffset, state.camC + dc * 3));

      if (nextR !== state.camR || nextC !== state.camC) {
        soundService.playSlide();
        set({ camR: nextR, camC: nextC });
      }
    },

    updateSettings: (partial: Partial<GameSettings>) => {
      const state = get();
      const updated = { ...state.settings, ...partial };
      if (partial.isMuted !== undefined) {
        soundService.setMuted(partial.isMuted);
      }
      if (partial.soundVolume !== undefined) {
        soundService.setVolume(partial.soundVolume);
      }
      saveSettingsToStorage(updated);
      set({ settings: updated });
    },
  };
});
