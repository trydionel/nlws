export type WordList = string[];
export type LetterGrid = string[][];
export type WordPath = WordPathPosition[];
export interface WordPathPosition {
  x: number;
  y: number;
  char: string
  angle?: number;
}

export interface Puzzle {
  words: WordList;
  grid: LetterGrid;
  paths: WordPath[];
}

export interface GridState {
  puzzle: Puzzle | null;
  candidate: WordPath;
  found: { [key: string]: WordPath };
  pathing: Boolean;
}