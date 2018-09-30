export type WordList = string[];
export type LetterGrid = string[][];
export type WordPath = WordPathPosition[];
export interface WordPathPosition {
  x: number;
  y: number;
  char: string;
  angle?: number;
}

export interface WordlistResult {
  words?: WordList;
  error?: string;
  topic: string;
  count: number;
}

export interface Puzzle {
  topic: string;
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

export interface PuzzleConfiguration {
  seed?: number;
  width: number;
  height: number;
  wordCount: number;
}