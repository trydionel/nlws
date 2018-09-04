import { WordList, LetterGrid, Puzzle, WordPath, WordPathPosition } from '@/types';
import max from 'lodash/max';
import range from 'lodash/range';
import sample from 'lodash/sample';
import some from 'lodash/some';

const Alphabet = range(65, 91).map((n) => String.fromCharCode(n));

export class PuzzleBuilder {
  private words: WordList;
  private grid: LetterGrid;
  private size: number;
  private paths: WordPath[];

  constructor(words: WordList) {
    this.words = words;
    this.size = 0;
    this.grid = [[]];
    this.paths = [];
  }

  public build(): Puzzle | null {
    const longestWord = max(this.words.map((word) => word.length));
    if (!longestWord) {
      return null;
    }

    try {
      this.initGrid(12);
      this.placeWords();
      this.fillBlanks();
    } catch (e) {
      console.error(e);
      return null;
    }

    return {
      words: this.words,
      grid: this.grid,
      paths: this.paths,
    };
  }

  private initGrid(size: number) {
    const grid: string[][] = [];

    for (let i = 0; i < size; i++) {
      const row: string[] = [];
      for (let j = 0; j < size; j++) {
        row.push('');
      }
      grid.push(row);
    }

    this.size = size;
    this.grid = grid;
  }

  private placeWords() {
    this.words.forEach((word) => {
      const path = this.placeWord(word);
      this.paths.push(path);
    });
  }

  private placeWord(word: string): WordPath {
    const maxAttempts = 250;
    let placed = false;
    let attempts = 0;
    let i = 0;
    let x: number;
    let y: number;
    let char: string;
    let theta: number;
    let angle: number;
    let path: WordPath = [];

    while (!placed && attempts < maxAttempts) {
      x = Math.floor(this.size * Math.random());
      y = Math.floor(this.size * Math.random());
      path = [];
      theta = 0;
      angle = theta * Math.PI / 4;
      i = 0;
      console.log(`Attempting to place ${word} starting at ${x},${y}`);

      while (i < word.length) {
        // Out of bounds
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
          console.log('out of bounds');
          break;
        }

        // Position already used in path
        if (path.length > 0 && some(path, (p) => p.x === x && p.y === y)) {
          console.log(`position ${x},${y} already used`);
          break;
        }

        // Space not valid
        char = word[i];
        if (this.grid[y][x] !== '' && this.grid[y][x] !== word[i]) {
          console.log('space not valid');
          break;
        }

        console.log(`placed ${char} at ${x},${y} from ${theta}`);
        path.push({ x, y, char, angle });

        // Only 60% chance of changing directions for next character
        if (Math.random() < 0.6) {
          theta = (theta + Math.floor(5 * Math.random()) + 2) % 8;
        }
        angle = theta * Math.PI / 4;
        x = Math.round(x + Math.cos(angle));
        y = Math.round(y + Math.sin(angle));

        i += 1;
      }

      if (path.length === word.length) {
        // Commit all positions
        path.forEach((position) => {
          let { x, y, char } = position;
          this.grid[y][x] = char.toUpperCase();
        });
        placed = true;
      }

      attempts += 1;
    }

    if (!placed) {
      throw new Error(`Failed to place word ${word} in ${maxAttempts} attempts`);
    }

    console.log(`Completed path in ${attempts} attempts`);
    return path;
  }

  private fillBlanks() {
    const size = this.size;
    const grid = this.grid;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const letter = grid[y][x];
        if (letter === '') {
          grid[y][x] = sample(Alphabet) as string;
        }
      }
    }
  }
}
