export type ColorId = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'PURPLE';
export type NotationType = 'hiragana' | 'katakana' | 'kanji';

export interface ColorDef {
  id: ColorId;
  name: string;
  kana: string;
  kata: string;
  kanji: string;
  hex: string;
  borderHex: string;
  label: string;
}

export type CellType = 'NORMAL' | 'START' | 'GOAL' | 'GATE';

export interface Cell {
  r: number;               // 行インデックス (0 〜 size-1)
  c: number;               // 列インデックス (0 〜 size-1)
  word: ColorId;           // 単語の意味
  ink: ColorId;            // 文字のインク色
  type: CellType;          // セルの役割
  notation?: NotationType; // 表記法指定（省略時はステージルールに準拠）
}

export interface Stage {
  id: number;
  title: string;
  size: number;            // 盤面サイズ (4, 5, 7, 10)
  isScrollable?: boolean;  // 画面スクロールが必要か (7, 10 のみ true)
  viewportSize?: number;   // 画面内に表示するマス数 (通常 4)
  description: string;
  start: { r: number; c: number };
  goal: { r: number; c: number };
  cells: Cell[];
  recommendedSteps?: number;
}

export interface GameSettings {
  isCudMode: boolean;        // カラーユニバーサルデザイン表示 (デフォルト false)
  isMoveAssist: boolean;     // 移動可能マスハイライト (Stage 1-2: true, Stage 3+: false)
  soundVolume: number;       // 0.0 〜 1.0
  isMuted: boolean;
}

export interface GameState {
  currentStageIndex: number;
  currentStage: Stage;
  path: Cell[];              // プレイヤーの移動軌跡
  isReversedMode: boolean;   // 現在反転中かどうか
  timerSeconds: number;
  isCleared: boolean;
  isDeadEnd: boolean;        // 手詰まり状態フラグ
  camR: number;              // 現在のカメラ行オフセット (0, 3, 6)
  camC: number;              // 現在のカメラ列オフセット (0, 3, 6)
  moveCount: number;
  settings: GameSettings;
}
