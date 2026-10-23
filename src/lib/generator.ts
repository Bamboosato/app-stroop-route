import { Cell, ColorId, NotationType, Stage } from '@/types/game';
import { COLOR_IDS, DIRECTIONS } from '@/lib/constants';
import { createPRNG, hashStringToSeed } from '@/lib/prng';

export interface GenerateOptions {
  id: number;
  title: string;
  size: number;
  isScrollable?: boolean;
  viewportSize?: number;
  description: string;
  gateCount: number;
  targetLength: number;
  notationRule: 'hiragana' | 'mixed_kana' | 'mixed_all' | 'english' | 'mixed_global';
  seed: number | string;
}

/**
 * 自己交差のないスタート(0,0)からゴール(size-1, size-1)へのパスを探索生成
 * 探索ステップ数上限（500）を設けてハング・無限再帰を完全防止
 */
function findPath(
  size: number,
  targetLength: number,
  rng: () => number
): { r: number; c: number }[] | null {
  const visited = new Set<string>();
  const path: { r: number; c: number }[] = [];
  let stepCount = 0;
  const MAX_STEPS = 500;

  function toKey(r: number, c: number) {
    return `${r},${c}`;
  }

  function dfs(r: number, c: number): boolean {
    stepCount++;
    if (stepCount > MAX_STEPS) return false;

    path.push({ r, c });
    visited.add(toKey(r, c));

    // ゴール到達チェック
    if (r === size - 1 && c === size - 1) {
      if (path.length >= Math.min(targetLength, (size - 1) * 2)) {
        return true;
      }
    }

    // 移動候補（シャッフル）
    const candidateDirs = [...DIRECTIONS].sort(() => rng() - 0.5);

    for (const dir of candidateDirs) {
      const nr = r + dir.r;
      const nc = c + dir.c;

      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      if (visited.has(toKey(nr, nc))) continue;

      if (dfs(nr, nc)) {
        return true;
      }
    }

    visited.delete(toKey(r, c));
    path.pop();
    return false;
  }

  // 複数回試行（リトライ）
  for (let attempt = 0; attempt < 20; attempt++) {
    visited.clear();
    path.length = 0;
    stepCount = 0;
    if (dfs(0, 0)) {
      return [...path];
    }
  }

  return null;
}

/**
 * 表記法をルールと乱数に基づいて決定
 */
function pickNotation(
  rule: 'hiragana' | 'mixed_kana' | 'mixed_all' | 'english' | 'mixed_global',
  rng: () => number
): NotationType {
  if (rule === 'hiragana') return 'hiragana';
  if (rule === 'english') return 'english';
  if (rule === 'mixed_kana') {
    return rng() < 0.5 ? 'hiragana' : 'katakana';
  }
  if (rule === 'mixed_all') {
    const r = rng();
    if (r < 0.33) return 'hiragana';
    if (r < 0.66) return 'katakana';
    return 'kanji';
  }
  // mixed_global: 4表記（ひらがな・カタカナ・漢字・英語）均等混合 (各25%)
  const r = rng();
  if (r < 0.25) return 'hiragana';
  if (r < 0.5) return 'katakana';
  if (r < 0.75) return 'kanji';
  return 'english';
}

/**
 * 自身と異なるランダムな色を選択
 */
function pickDifferentColor(exclude: ColorId, rng: () => number): ColorId {
  const choices = COLOR_IDS.filter((c) => c !== exclude);
  return choices[Math.floor(rng() * choices.length)];
}

/**
 * 解法保証型のパズルステージを自動生成
 */
export function generateStage(opts: GenerateOptions): Stage {
  const numericSeed =
    typeof opts.seed === 'string' ? hashStringToSeed(opts.seed) : opts.seed;
  const rng = createPRNG(numericSeed);

  // 1. パス探索生成
  let path = findPath(opts.size, opts.targetLength, rng);
  if (!path) {
    // 高速フォールバック: ジグザグ進行パス（確実に解が存在）
    path = [];
    let curR = 0;
    let curC = 0;
    path.push({ r: curR, c: curC });
    while (curR < opts.size - 1 || curC < opts.size - 1) {
      if (curR < opts.size - 1 && (curC === opts.size - 1 || rng() < 0.5)) {
        curR++;
      } else {
        curC++;
      }
      path.push({ r: curR, c: curC });
    }
  }

  // 2. ゲートの配置
  const gateIndices = new Set<number>();
  if (opts.gateCount === 1 && path.length >= 5) {
    const mid = Math.floor(path.length * 0.45);
    gateIndices.add(mid);
  } else if (opts.gateCount >= 2 && path.length >= 8) {
    const first = Math.floor(path.length * 0.3);
    const second = Math.floor(path.length * 0.7);
    gateIndices.add(first);
    gateIndices.add(second);
  }

  // 3. ストループ制約の逆算
  const cellMap = new Map<string, Cell>();
  let currentReversed = false;

  for (let i = 0; i < path.length; i++) {
    const { r, c } = path[i];
    const isStart = i === 0;
    const isGoal = i === path.length - 1;
    const isGate = gateIndices.has(i);

    const type = isStart ? 'START' : isGoal ? 'GOAL' : isGate ? 'GATE' : 'NORMAL';
    const notation = pickNotation(opts.notationRule, rng);

    let word: ColorId;
    let ink: ColorId;

    if (i === 0) {
      word = COLOR_IDS[Math.floor(rng() * COLOR_IDS.length)];
      ink = pickDifferentColor(word, rng);
    } else {
      const prev = cellMap.get(`${path[i - 1].r},${path[i - 1].c}`)!;

      if (!currentReversed) {
        // 通常モード: 目標インク = 直前単語
        ink = prev.word;
        word = pickDifferentColor(ink, rng);
      } else {
        // 反転モード: 目標単語 = 直前インク
        word = prev.ink;
        ink = pickDifferentColor(word, rng);
      }
    }

    cellMap.set(`${r},${c}`, {
      r,
      c,
      word,
      ink,
      type,
      notation,
    });

    if (isGate) {
      currentReversed = !currentReversed;
    }
  }

  // 4. 妨害セル（Distractor）の充填
  const allCells: Cell[] = [];
  for (let r = 0; r < opts.size; r++) {
    for (let c = 0; c < opts.size; c++) {
      const key = `${r},${c}`;
      if (cellMap.has(key)) {
        allCells.push(cellMap.get(key)!);
      } else {
        const randWord = COLOR_IDS[Math.floor(rng() * COLOR_IDS.length)];
        const randInk = pickDifferentColor(randWord, rng);
        allCells.push({
          r,
          c,
          word: randWord,
          ink: randInk,
          type: 'NORMAL',
          notation: pickNotation(opts.notationRule, rng),
        });
      }
    }
  }

  return {
    id: opts.id,
    title: opts.title,
    size: opts.size,
    isScrollable: opts.isScrollable ?? opts.size > 5,
    viewportSize: opts.viewportSize ?? 4,
    description: opts.description,
    start: { r: 0, c: 0 },
    goal: { r: opts.size - 1, c: opts.size - 1 },
    cells: allCells,
    recommendedSteps: path.length - 1,
  };
}
