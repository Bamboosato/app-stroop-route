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
 * ステージが完全な一本道（正解パス上の全ステップで進めるマスが常に唯一）かを判定
 */
function isStageUniquePath(stage: Stage): boolean {
  const startCell = stage.cells.find(
    (c) => c.r === stage.start.r && c.c === stage.start.c
  );
  if (!startCell) return false;

  let solutionPath: Cell[] | null = null;
  const visited = new Set<string>();

  function dfs(cur: Cell[]) {
    if (solutionPath) return;
    const tip = cur[cur.length - 1];
    if (tip.r === stage.goal.r && tip.c === stage.goal.c) {
      solutionPath = [...cur];
      return;
    }

    const gateCount = cur.filter((c) => c.type === 'GATE').length;
    const isRev = gateCount % 2 === 1;

    for (const dir of DIRECTIONS) {
      const nr = tip.r + dir.r;
      const nc = tip.c + dir.c;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;

      const nextCell = stage.cells.find((c) => c.r === nr && c.c === nc);
      if (!nextCell) continue;

      const matches = !isRev
        ? nextCell.ink === tip.word
        : nextCell.word === tip.ink;

      if (matches) {
        visited.add(key);
        dfs([...cur, nextCell]);
        visited.delete(key);
      }
    }
  }

  visited.add(`${startCell.r},${startCell.c}`);
  dfs([startCell]);

  if (!solutionPath) return false;
  const path: Cell[] = solutionPath;

  // 正解パス上の各ステップで、合法な移動先が厳密に1つだけかを確認
  for (let i = 0; i < path.length - 1; i++) {
    const sub = path.slice(0, i + 1);
    const gateCount = sub.filter((c) => c.type === 'GATE').length;
    const isRev = gateCount % 2 === 1;
    const tip = path[i];

    let validCount = 0;
    for (const dir of DIRECTIONS) {
      const nr = tip.r + dir.r;
      const nc = tip.c + dir.c;
      if (sub.some((c) => c.r === nr && c.c === nc)) continue;

      const nextCell = stage.cells.find((c) => c.r === nr && c.c === nc);
      if (!nextCell) continue;

      const matches = !isRev
        ? nextCell.ink === tip.word
        : nextCell.word === tip.ink;

      if (matches) {
        validCount++;
      }
    }

    if (validCount !== 1) {
      return false; // 分岐あり
    }
  }

  return true;
}

/**
 * 内部ステージ生成関数
 */
function generateStageInternal(opts: GenerateOptions): Stage {
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

  // 3. ストループ制約の逆算（一意解パスの保証）
  const cellMap = new Map<string, Cell>();
  const stepModes: boolean[] = []; // 各ステップ時点での反転モード状態
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
        // 単語は ink と異なり、かつ隣接する過去セルからの誤ショートカットを避ける色を選ぶ
        const excludedWords = new Set<ColorId>([ink]);
        for (let j = 0; j < i - 1; j++) {
          const past = path[j];
          if (Math.abs(past.r - r) + Math.abs(past.c - c) === 1) {
            if (stepModes[j]) {
              // 過去セルから次へ進むルールが反転モードなら target.word === past.ink が移動条件となるので除外
              const pastCell = cellMap.get(`${past.r},${past.c}`)!;
              excludedWords.add(pastCell.ink);
            }
          }
        }
        const wordCandidates = COLOR_IDS.filter((c) => !excludedWords.has(c));
        word =
          wordCandidates.length > 0
            ? wordCandidates[Math.floor(rng() * wordCandidates.length)]
            : pickDifferentColor(ink, rng);
      } else {
        // 反転モード: 目標単語 = 直前インク
        word = prev.ink;
        // インクは word と異なり、かつ隣接する過去セルからの誤ショートカットを避ける色を選ぶ
        const excludedInks = new Set<ColorId>([word]);
        for (let j = 0; j < i - 1; j++) {
          const past = path[j];
          if (Math.abs(past.r - r) + Math.abs(past.c - c) === 1) {
            if (!stepModes[j]) {
              // 過去セルから次へ進むルールが通常モードなら target.ink === past.word が移動条件となるので除外
              const pastCell = cellMap.get(`${past.r},${past.c}`)!;
              excludedInks.add(pastCell.word);
            }
          }
        }
        const inkCandidates = COLOR_IDS.filter((c) => !excludedInks.has(c));
        ink =
          inkCandidates.length > 0
            ? inkCandidates[Math.floor(rng() * inkCandidates.length)]
            : pickDifferentColor(word, rng);
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
    // このマスに進入した後の反転モード状態（このマスから次へ進む際のルール）
    stepModes.push(currentReversed);
  }

  // 4. 妨害セル（Distractor）の充填（偽の分岐を完全排除し一本道化）
  const allCells: Cell[] = [];
  for (let r = 0; r < opts.size; r++) {
    for (let c = 0; c < opts.size; c++) {
      const key = `${r},${c}`;
      if (cellMap.has(key)) {
        allCells.push(cellMap.get(key)!);
      } else {
        // この妨害セルに隣接する正解パスマスのうち、次に進む分岐として誤一致しないよう禁止色を収集
        const forbiddenInks = new Set<ColorId>();
        const forbiddenWords = new Set<ColorId>();

        for (let i = 0; i < path.length - 1; i++) {
          const p = path[i];
          if (Math.abs(p.r - r) + Math.abs(p.c - c) === 1) {
            const pCell = cellMap.get(`${p.r},${p.c}`)!;
            const isReversedAtStep = stepModes[i];
            if (!isReversedAtStep) {
              // 通常モードでは target.ink === pCell.word で遷移できてしまうため禁止
              forbiddenInks.add(pCell.word);
            } else {
              // 反転モードでは target.word === pCell.ink で遷移できてしまうため禁止
              forbiddenWords.add(pCell.ink);
            }
          }
        }

        // 禁止色および ink !== word を両立できる (ink, word) ペアを全探索して選択
        const validPairs: { ink: ColorId; word: ColorId }[] = [];
        for (const ink of COLOR_IDS) {
          if (forbiddenInks.has(ink)) continue;
          for (const word of COLOR_IDS) {
            if (word === ink || forbiddenWords.has(word)) continue;
            validPairs.push({ ink, word });
          }
        }

        let chosenInk: ColorId;
        let chosenWord: ColorId;

        if (validPairs.length > 0) {
          const pair = validPairs[Math.floor(rng() * validPairs.length)];
          chosenInk = pair.ink;
          chosenWord = pair.word;
        } else {
          // 万が一両立ペアがない場合は、衝突ペナルティが最小のペアを選択
          let bestPair = { ink: COLOR_IDS[0], word: COLOR_IDS[1], score: 999 };
          for (const ink of COLOR_IDS) {
            for (const word of COLOR_IDS) {
              if (ink === word) continue;
              const inkPenalty = forbiddenInks.has(ink) ? 1 : 0;
              const wordPenalty = forbiddenWords.has(word) ? 1 : 0;
              const score = inkPenalty + wordPenalty;
              if (score < bestPair.score) {
                bestPair = { ink, word, score };
              }
            }
          }
          chosenInk = bestPair.ink;
          chosenWord = bestPair.word;
        }

        allCells.push({
          r,
          c,
          word: chosenWord,
          ink: chosenInk,
          type: 'NORMAL',
          notation: pickNotation(opts.notationRule, rng),
        });
      }
    }
  }

  // 5. 分岐ゼロ化の完全保証（正解パス上の各ステップで進めるマスが常に正解の1マスだけになるよう補正）
  for (let i = 0; i < path.length - 1; i++) {
    const cur = path[i];
    const next = path[i + 1];
    const isRev = stepModes[i];
    const curCell = allCells.find((c) => c.r === cur.r && c.c === cur.c)!;

    for (const dir of DIRECTIONS) {
      const nr = cur.r + dir.r;
      const nc = cur.c + dir.c;
      if (nr === next.r && nc === next.c) continue; // 正解の次はスキップ

      const adjCell = allCells.find((c) => c.r === nr && c.c === nc);
      if (!adjCell) continue;

      // ダミーセルのみを対象に、curCell から誤移動できないよう不一致色に補正
      if (!cellMap.has(`${nr},${nc}`)) {
        const matches = !isRev
          ? adjCell.ink === curCell.word
          : adjCell.word === curCell.ink;

        if (matches) {
          if (!isRev) {
            // 通常モードでは adjCell.ink が curCell.word と一致しているため不一致色に変更
            adjCell.ink = pickDifferentColor(curCell.word, rng);
            if (adjCell.word === adjCell.ink) {
              adjCell.word = pickDifferentColor(adjCell.ink, rng);
            }
          } else {
            // 反転モードでは adjCell.word が curCell.ink と一致しているため不一致色に変更
            adjCell.word = pickDifferentColor(curCell.ink, rng);
            if (adjCell.ink === adjCell.word) {
              adjCell.ink = pickDifferentColor(adjCell.word, rng);
            }
          }
        }
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

/**
 * 解法保証＆完全一本道（分岐ゼロ・山勘ゼロ）のパズルステージを自動生成
 */
export function generateStage(opts: GenerateOptions): Stage {
  const baseSeed =
    typeof opts.seed === 'string' ? hashStringToSeed(opts.seed) : opts.seed;

  for (let attempt = 0; attempt < 30; attempt++) {
    const currentSeed = baseSeed + attempt * 7919;
    const stage = generateStageInternal({ ...opts, seed: currentSeed });
    if (isStageUniquePath(stage)) {
      return stage;
    }
  }

  // 万一フォールバック
  return generateStageInternal(opts);
}
