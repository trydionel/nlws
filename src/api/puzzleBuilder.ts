import { WordList, LetterGrid, Puzzle, WordPath, WordPathPosition, WordlistResult } from '@/game';
import max from 'lodash/max';
import range from 'lodash/range';
import some from 'lodash/some';
import { Random, sample } from './random';

const Alphabet = range(65, 91).map((n) => String.fromCharCode(n));

export class PuzzleBuilder {
  private topic: string;
  private words: WordList;
  private grid: LetterGrid;
  private width: number;
  private height: number;
  private paths: WordPath[];
  private debug: boolean;

  constructor(wordlist: WordlistResult, options: { debug?: boolean } = {}) {
    this.topic = wordlist.topic;
    this.words = wordlist.words!;
    this.width = 0;
    this.height = 0;
    this.grid = [[]];
    this.paths = [];
    this.debug = !!options.debug;
  }

  public async build(width: number, height: number): Promise<Puzzle | null> {
    const longestWord = max(this.words.map((word) => word.length));
    if (!longestWord) {
      return null;
    }

    try {
      this.initGrid(width, height);
      await this.placeWords();
      this.fillBlanks();
    } catch (e) {
      console.error(e);
      return null;
    }

    return {
      topic: this.topic,
      words: this.words,
      grid: this.grid,
      paths: this.paths,
    };
  }

  private initGrid(width: number, height: number) {
    const grid: string[][] = [];

    for (let i = 0; i < height; i++) {
      const row: string[] = [];
      for (let j = 0; j < width; j++) {
        row.push('');
      }
      grid.push(row);
    }

    this.width = width;
    this.height = height;
    this.grid = grid;
  }

  private async placeWords() {
    for (const word of this.words) {
      const path = await this.placeWord(word);
      this.paths.push(path);
    }
  }

  private async placeWord(word: string): Promise<WordPath> {
    const maxAttempts = 1000;
    let placed = false;
    let attempts = 0;
    let i = 0;
    let x: number;
    let y: number;
    let char: string;
    let theta: number;
    let angle: number;
    let path: WordPath = [];

    const attempt = async () => {
      x = Math.floor(this.width * Random.number());
      y = Math.floor(this.height * Random.number());
      path = [];
      theta = 0;
      angle = theta * Math.PI / 4;
      i = 0;
      this.log(`Attempting to place ${word} starting at ${x},${y}`);

      while (i < word.length) {
        // Out of bounds
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
          this.log('out of bounds');
          break;
        }

        // Position already used in path
        if (path.length > 0 && some(path, (p) => p.x === x && p.y === y)) {
          this.log(`position ${x},${y} already used`);
          break;
        }

        // Space not valid
        char = word[i];
        if (this.grid[y][x] !== '' && this.grid[y][x] !== word[i]) {
          this.log('space not valid');
          break;
        }

        this.log(`placed ${char} at ${x},${y} from ${theta}`);
        path.push({ x, y, char, angle });

        // Only 60% chance of changing directions for next character
        if (Random.number() < 0.6) {
          theta = (theta + Math.floor(5 * Random.number()) + 2) % 8;
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
    };

    while (!placed && attempts < maxAttempts) {
      await attempt();
    }

    if (!placed) {
      throw new Error(`Failed to place word ${word} in ${maxAttempts} attempts`);
    }

    this.log(`Completed path in ${attempts} attempts`);
    return path;
  }

  private fillBlanks() {
    const width = this.width;
    const height = this.height;
    const grid = this.grid;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const letter = grid[y][x];
        if (letter === '') {
          grid[y][x] = sample(Alphabet) as string;
        }
      }
    }
  }

  private log(message: any) {
    if (this.debug) {
      console.log(message);
    }
  }
}
