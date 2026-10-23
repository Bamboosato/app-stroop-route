import { ColorDef, ColorId, NotationType } from '@/types/game';

export const COLOR_DEFS: Record<ColorId, ColorDef> = {
  RED: {
    id: 'RED',
    name: 'あか',
    kana: 'あか',
    kata: 'アカ',
    kanji: '赤',
    en: 'RED',
    hex: '#f87171',
    borderHex: '#ef4444',
    label: '赤',
  },
  BLUE: {
    id: 'BLUE',
    name: 'あお',
    kana: 'あお',
    kata: 'アオ',
    kanji: '青',
    en: 'BLUE',
    hex: '#60a5fa',
    borderHex: '#3b82f6',
    label: '青',
  },
  GREEN: {
    id: 'GREEN',
    name: 'みどり',
    kana: 'みどり',
    kata: 'ミドリ',
    kanji: '緑',
    en: 'GREEN',
    hex: '#34d399',
    borderHex: '#10b981',
    label: '緑',
  },
  YELLOW: {
    id: 'YELLOW',
    name: 'きいろ',
    kana: 'きいろ',
    kata: 'キイロ',
    kanji: '黄',
    en: 'YELLOW',
    hex: '#fbbf24',
    borderHex: '#f59e0b',
    label: '黄',
  },
  PURPLE: {
    id: 'PURPLE',
    name: 'むらさき',
    kana: 'むらさき',
    kata: 'ムラサキ',
    kanji: '紫',
    en: 'PURPLE',
    hex: '#c084fc',
    borderHex: '#a855f7',
    label: '紫',
  },
};

export const COLOR_IDS: ColorId[] = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];

export const DIRECTIONS = [
  { r: -1, c: 0 }, // 上
  { r: 1, c: 0 },  // 下
  { r: 0, c: -1 }, // 左
  { r: 0, c: 1 },  // 右
] as const;

export function getWordDisplay(
  wordId: ColorId,
  notation?: NotationType
): string {
  const def = COLOR_DEFS[wordId];
  if (!def) return '';
  switch (notation) {
    case 'english':
      return def.en;
    case 'katakana':
      return def.kata;
    case 'kanji':
      return def.kanji;
    case 'hiragana':
    default:
      return def.kana;
  }
}
