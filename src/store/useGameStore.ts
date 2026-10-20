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

export const useGameStore = create<GameState & GameActions>((set, get) => {
  const initialSettings = loadSettingsFromStorage();
  const initialStage = PRESET_STAGES[0];
  const startCell = getCellAt(initialStage.cells, initialStage.start.r, initialStage.start.c) || initialStage.cells[0];

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
      const start = getCellAt(stage.cells, stage.start.r, stage.start.c) || stage.cells[0];
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
        isDead = checkDeadEnd(targetCell, newReversed, newPath, state.currentStage.cells);
        if (isDead) {
          soundService.playDeadEnd();
        }
      }

      set({
        path: newPath,
        isReversedMode: newReversed,
        isCleared: isGoal,
        isDeadEnd: isDead,
        moveCount: state.moveCount + 1,
      });
    },

    undo: () => {
      const state = get();
      if (state.path.length <= 1 || state.isCleared) return;

      const newPath = state.path.slice(0, -1);
      const newReversed = evaluateCurrentMode(newPath);
      const tipCell = newPath[newPath.length - 1];
      const isDead = checkDeadEnd(tipCell, newReversed, newPath, state.currentStage.cells);

      soundService.playUndo();

      set({
        path: newPath,
        isReversedMode: newReversed,
        isDeadEnd: isDead,
      });
    },

    reset: () => {
      const state = get();
      const start = getCellAt(state.currentStage.cells, state.currentStage.start.r, state.currentStage.start.c) || state.currentStage.cells[0];
      soundService.playUndo();

      set({
        path: [start],
        isReversedMode: false,
        isCleared: false,
        isDeadEnd: false,
        moveCount: 0,
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
      set({ camR: r, camC: c });
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
