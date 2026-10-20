import { Stage, Cell } from '@/types/game';
import { generateStage } from '@/lib/generator';

// ==========================================
// Stage 1: 入門 (ひらがな) - 4x4
// ==========================================
// 解法パス: (0,0) -> (0,1) -> (1,1) -> (1,2) -> (2,2) -> (2,1) -> (3,1) -> (3,2) -> (3,3)
const stage1Cells: Cell[] = [
  // 行 0
  { r: 0, c: 0, word: 'RED', ink: 'BLUE', type: 'START', notation: 'hiragana' },
  { r: 0, c: 1, word: 'GREEN', ink: 'RED', type: 'NORMAL', notation: 'hiragana' },
  { r: 0, c: 2, word: 'YELLOW', ink: 'PURPLE', type: 'NORMAL', notation: 'hiragana' },
  { r: 0, c: 3, word: 'BLUE', ink: 'GREEN', type: 'NORMAL', notation: 'hiragana' },
  // 行 1
  { r: 1, c: 0, word: 'PURPLE', ink: 'YELLOW', type: 'NORMAL', notation: 'hiragana' },
  { r: 1, c: 1, word: 'YELLOW', ink: 'GREEN', type: 'NORMAL', notation: 'hiragana' },
  { r: 1, c: 2, word: 'BLUE', ink: 'YELLOW', type: 'NORMAL', notation: 'hiragana' },
  { r: 1, c: 3, word: 'RED', ink: 'PURPLE', type: 'NORMAL', notation: 'hiragana' },
  // 行 2
  { r: 2, c: 0, word: 'GREEN', ink: 'RED', type: 'NORMAL', notation: 'hiragana' },
  { r: 2, c: 1, word: 'RED', ink: 'PURPLE', type: 'NORMAL', notation: 'hiragana' },
  { r: 2, c: 2, word: 'PURPLE', ink: 'BLUE', type: 'NORMAL', notation: 'hiragana' },
  { r: 2, c: 3, word: 'YELLOW', ink: 'GREEN', type: 'NORMAL', notation: 'hiragana' },
  // 行 3
  { r: 3, c: 0, word: 'BLUE', ink: 'PURPLE', type: 'NORMAL', notation: 'hiragana' },
  { r: 3, c: 1, word: 'GREEN', ink: 'RED', type: 'NORMAL', notation: 'hiragana' },
  { r: 3, c: 2, word: 'YELLOW', ink: 'GREEN', type: 'NORMAL', notation: 'hiragana' },
  { r: 3, c: 3, word: 'BLUE', ink: 'YELLOW', type: 'GOAL', notation: 'hiragana' },
];

export const STAGE_1: Stage = {
  id: 1,
  title: 'Stage 1: 入門 (ひらがな)',
  size: 4,
  isScrollable: false,
  viewportSize: 4,
  description: '文字の意味とインク色の接続ルールを覚えよう。反転ゲートなしの基本ステージ。',
  start: { r: 0, c: 0 },
  goal: { r: 3, c: 3 },
  cells: stage1Cells,
  recommendedSteps: 8,
};

// ==========================================
// Stage 2: 初級 (カナ混合) - 4x4 + GATE x 1
// ==========================================
// 解法パス: (0,0) -> (1,0) -> (2,0) -> (2,1)[GATE] -> (1,1) -> (1,2) -> (1,3) -> (2,3) -> (3,3)
const stage2Cells: Cell[] = [
  // 行 0
  { r: 0, c: 0, word: 'BLUE', ink: 'RED', type: 'START', notation: 'hiragana' },
  { r: 0, c: 1, word: 'RED', ink: 'GREEN', type: 'NORMAL', notation: 'katakana' },
  { r: 0, c: 2, word: 'YELLOW', ink: 'BLUE', type: 'NORMAL', notation: 'hiragana' },
  { r: 0, c: 3, word: 'PURPLE', ink: 'YELLOW', type: 'NORMAL', notation: 'katakana' },
  // 行 1
  { r: 1, c: 0, word: 'GREEN', ink: 'BLUE', type: 'NORMAL', notation: 'katakana' },
  { r: 1, c: 1, word: 'PURPLE', ink: 'YELLOW', type: 'NORMAL', notation: 'hiragana' },
  { r: 1, c: 2, word: 'YELLOW', ink: 'GREEN', type: 'NORMAL', notation: 'katakana' },
  { r: 1, c: 3, word: 'GREEN', ink: 'BLUE', type: 'NORMAL', notation: 'hiragana' },
  // 行 2
  { r: 2, c: 0, word: 'PURPLE', ink: 'GREEN', type: 'NORMAL', notation: 'hiragana' },
  { r: 2, c: 1, word: 'RED', ink: 'PURPLE', type: 'GATE', notation: 'katakana' },
  { r: 2, c: 2, word: 'BLUE', ink: 'RED', type: 'NORMAL', notation: 'hiragana' },
  { r: 2, c: 3, word: 'BLUE', ink: 'PURPLE', type: 'NORMAL', notation: 'katakana' },
  // 行 3
  { r: 3, c: 0, word: 'YELLOW', ink: 'RED', type: 'NORMAL', notation: 'katakana' },
  { r: 3, c: 1, word: 'PURPLE', ink: 'YELLOW', type: 'NORMAL', notation: 'hiragana' },
  { r: 3, c: 2, word: 'GREEN', ink: 'BLUE', type: 'NORMAL', notation: 'katakana' },
  { r: 3, c: 3, word: 'PURPLE', ink: 'RED', type: 'GOAL', notation: 'hiragana' },
];

export const STAGE_2: Stage = {
  id: 2,
  title: 'Stage 2: 初級 (カナ混合)',
  size: 4,
  isScrollable: false,
  viewportSize: 4,
  description: 'ひらがなとカタカナが交差！⚡反転ゲートを通ると「色➔文字」にルールが逆転します。',
  start: { r: 0, c: 0 },
  goal: { r: 3, c: 3 },
  cells: stage2Cells,
  recommendedSteps: 8,
};

// ==========================================
// Stage 3: 中級 (3表記交差) - 5x5 + GATE x 1
// ==========================================
// 解法パス: (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2)[GATE] -> (2,1) -> (3,1) -> (4,1) -> (4,2) -> (3,2) -> (3,3) -> (3,4) -> (4,4)
const stage3Cells: Cell[] = [
  // 行 0
  { r: 0, c: 0, word: 'RED', ink: 'BLUE', type: 'START', notation: 'kanji' },
  { r: 0, c: 1, word: 'GREEN', ink: 'RED', type: 'NORMAL', notation: 'hiragana' },
  { r: 0, c: 2, word: 'YELLOW', ink: 'GREEN', type: 'NORMAL', notation: 'katakana' },
  { r: 0, c: 3, word: 'PURPLE', ink: 'YELLOW', type: 'NORMAL', notation: 'kanji' },
  { r: 0, c: 4, word: 'BLUE', ink: 'RED', type: 'NORMAL', notation: 'hiragana' },
  // 行 1
  { r: 1, c: 0, word: 'YELLOW', ink: 'PURPLE', type: 'NORMAL', notation: 'katakana' },
  { r: 1, c: 1, word: 'BLUE', ink: 'YELLOW', type: 'NORMAL', notation: 'kanji' },
  { r: 1, c: 2, word: 'PURPLE', ink: 'YELLOW', type: 'NORMAL', notation: 'hiragana' },
  { r: 1, c: 3, word: 'RED', ink: 'BLUE', type: 'NORMAL', notation: 'katakana' },
  { r: 1, c: 4, word: 'GREEN', ink: 'PURPLE', type: 'NORMAL', notation: 'kanji' },
  // 行 2
  { r: 2, c: 0, word: 'RED', ink: 'GREEN', type: 'NORMAL', notation: 'hiragana' },
  { r: 2, c: 1, word: 'PURPLE', ink: 'RED', type: 'NORMAL', notation: 'kanji' },
  { r: 2, c: 2, word: 'BLUE', ink: 'PURPLE', type: 'GATE', notation: 'katakana' },
  { r: 2, c: 3, word: 'GREEN', ink: 'RED', type: 'NORMAL', notation: 'hiragana' },
  { r: 2, c: 4, word: 'YELLOW', ink: 'BLUE', type: 'NORMAL', notation: 'katakana' },
  // 行 3
  { r: 3, c: 0, word: 'PURPLE', ink: 'BLUE', type: 'NORMAL', notation: 'kanji' },
  { r: 3, c: 1, word: 'RED', ink: 'GREEN', type: 'NORMAL', notation: 'katakana' },
  { r: 3, c: 2, word: 'BLUE', ink: 'RED', type: 'NORMAL', notation: 'hiragana' },
  { r: 3, c: 3, word: 'RED', ink: 'PURPLE', type: 'NORMAL', notation: 'kanji' },
  { r: 3, c: 4, word: 'PURPLE', ink: 'GREEN', type: 'NORMAL', notation: 'katakana' },
  // 行 4
  { r: 4, c: 0, word: 'BLUE', ink: 'YELLOW', type: 'NORMAL', notation: 'katakana' },
  { r: 4, c: 1, word: 'GREEN', ink: 'YELLOW', type: 'NORMAL', notation: 'kanji' },
  { r: 4, c: 2, word: 'YELLOW', ink: 'BLUE', type: 'NORMAL', notation: 'hiragana' },
  { r: 4, c: 3, word: 'GREEN', ink: 'PURPLE', type: 'NORMAL', notation: 'katakana' },
  { r: 4, c: 4, word: 'GREEN', ink: 'YELLOW', type: 'GOAL', notation: 'kanji' },
];

export const STAGE_3: Stage = {
  id: 3,
  title: 'Stage 3: 中級 (3表記交差)',
  size: 5,
  isScrollable: false,
  viewportSize: 5,
  description: '漢字・カナ・ひらがなが混在する5×5盤面。強力な読字干渉に打ち勝とう！',
  start: { r: 0, c: 0 },
  goal: { r: 4, c: 4 },
  cells: stage3Cells,
  recommendedSteps: 12,
};

// ==========================================
// Stage 4: 広大迷宮 (4区画) - 7x7 + GATE x 1
// ==========================================
export const STAGE_4: Stage = generateStage({
  id: 4,
  title: 'Stage 4: 広大迷宮 (4区画)',
  size: 7,
  isScrollable: true,
  viewportSize: 4,
  description: '4×4ファインダーで7×7の広大迷宮を探検！スワイプしてカメラをスライドさせよう。',
  gateCount: 1,
  targetLength: 18,
  notationRule: 'mixed_all',
  seed: 4210,
});

// ==========================================
// Stage 5: 超巨大迷宮 (9区画) - 10x10 + GATE x 2
// ==========================================
export const STAGE_5: Stage = generateStage({
  id: 5,
  title: 'Stage 5: 超巨大迷宮 (9区画)',
  size: 10,
  isScrollable: true,
  viewportSize: 4,
  description: '10×10マス（9区画）の最難関巨大迷宮！2箇所の反転ゲートを制覇せよ。',
  gateCount: 2,
  targetLength: 26,
  notationRule: 'mixed_all',
  seed: 9876,
});

export const PRESET_STAGES: Stage[] = [
  STAGE_1,
  STAGE_2,
  STAGE_3,
  STAGE_4,
  STAGE_5,
];
