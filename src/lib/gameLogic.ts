import { Cell } from '@/types/game';
import { DIRECTIONS } from '@/lib/constants';

export type InvalidMoveReason = 'NOT_ADJACENT' | 'ALREADY_VISITED' | 'STROOP_MISMATCH';

export interface MoveValidationResult {
  isValid: boolean;
  reason?: InvalidMoveReason;
}

/**
 * 2つのセルが直交隣接（Manhattan距離 = 1）しているかを判定
 */
export function isAdjacent(
  a: { r: number; c: number },
  b: { r: number; c: number }
): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

/**
 * 現在のパスに含まれるGATEマスの数から、現在の反転モード状態を評価
 * GATE通過数が奇数なら反転モード（true）、偶数なら通常モード（false）
 */
export function evaluateCurrentMode(path: Cell[]): boolean {
  const gateCount = path.filter((cell) => cell.type === 'GATE').length;
  return gateCount % 2 === 1;
}

/**
 * 移動先セルがルールに則っているかを判定
 * 
 * @param prevCell 直前のパス先端セル
 * @param targetCell 移動しようとしているセル
 * @param currentReversedMode 現在の反転モード状態
 * @param currentPath 現在のプレイヤー移動経路
 */
export function checkValidMove(
  prevCell: Cell,
  targetCell: Cell,
  currentReversedMode: boolean,
  currentPath: Cell[]
): MoveValidationResult {
  // 1. 直交隣接移動チェック
  if (!isAdjacent(prevCell, targetCell)) {
    return { isValid: false, reason: 'NOT_ADJACENT' };
  }

  // 2. 自己交差禁止チェック（一筆書き）
  const isAlreadyVisited = currentPath.some(
    (c) => c.r === targetCell.r && c.c === targetCell.c
  );
  if (isAlreadyVisited) {
    return { isValid: false, reason: 'ALREADY_VISITED' };
  }

  // 3. ストループ条件判定
  // 通常モード: 直前マスの「文字の意味（word）」と、移動先マスの「インク色（ink）」が一致
  // 反転モード: 直前マスの「インク色（ink）」と、移動先マスの「文字の意味（word）」が一致
  const isStroopMatch = !currentReversedMode
    ? targetCell.ink === prevCell.word
    : targetCell.word === prevCell.ink;

  if (!isStroopMatch) {
    return { isValid: false, reason: 'STROOP_MISMATCH' };
  }

  return { isValid: true };
}

/**
 * 座標からセルを取得するヘルパー
 */
export function getCellAt(
  cells: Cell[],
  r: number,
  c: number
): Cell | undefined {
  return cells.find((cell) => cell.r === r && cell.c === c);
}

/**
 * 現在の先端マスから合法的（ルールに適合）に進入できる隣接セルの一覧を取得
 */
export function getValidNextMoves(
  tipCell: Cell,
  currentReversedMode: boolean,
  currentPath: Cell[],
  cells: Cell[]
): Cell[] {
  const validMoves: Cell[] = [];

  for (const dir of DIRECTIONS) {
    const targetR = tipCell.r + dir.r;
    const targetC = tipCell.c + dir.c;
    const targetCell = getCellAt(cells, targetR, targetC);

    if (targetCell) {
      const validation = checkValidMove(
        tipCell,
        targetCell,
        currentReversedMode,
        currentPath
      );
      if (validation.isValid) {
        validMoves.push(targetCell);
      }
    }
  }

  return validMoves;
}

/**
 * 手詰まり（Dead End）状態かを検知
 * ※先端がGOALセルの場合はクリア状態なので手詰まりではない
 */
export function checkDeadEnd(
  tipCell: Cell,
  currentReversedMode: boolean,
  currentPath: Cell[],
  cells: Cell[]
): boolean {
  if (tipCell.type === 'GOAL') {
    return false;
  }

  const validMoves = getValidNextMoves(
    tipCell,
    currentReversedMode,
    currentPath,
    cells
  );
  return validMoves.length === 0;
}
