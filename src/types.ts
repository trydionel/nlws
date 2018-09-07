export type WordList = string[];
export type LetterGrid = string[][];
export type WordPath = WordPathPosition[];
export interface WordPathPosition {
  x: number;
  y: number;
  char: string;
  angle?: number;
}

export interface Puzzle {
  words: WordList;
  grid: LetterGrid;
  paths: WordPath[];
}

export interface GridState {
  seed: number;
  puzzle: Puzzle | null;
  startedAt: Date;
  candidate: WordPath;
  found: { [key: string]: WordPath };
  pathing: boolean;
  errored: boolean;
  building: boolean;
  won: boolean;
}