import Vue from 'vue';
import Vuex, { ActionContext } from 'vuex';
import { getStoreAccessors } from 'vuex-typescript';
import { event } from 'vue-analytics';

import { GridState, Puzzle, WordPathPosition, WordPath, PuzzleConfiguration } from '@/game';
import { WordlistBuilder } from '@/api/wordlistBuilder';
import { PuzzleBuilder } from '@/api/puzzleBuilder';

import find from 'lodash/find';
import some from 'lodash/some';
import { Random } from '@/api/random';

Vue.use(Vuex);

type GridContext = ActionContext<GridState, GridState>;

const storeOptions = {
  state: {
    seed: 0,
    puzzle: null,
    candidate: [],
    found: {},
    pathing: false,
    errored: false,
    building: false,
    won: false,
    startedAt: new Date(0),
  },
  getters: {
    getWords(state: GridState) {
      const puzzle = state.puzzle;
      if (puzzle) {
        return puzzle.words;
      } else {
        return [];
      }
    },
    getGrid(state: GridState) {
      const puzzle = state.puzzle;
      if (puzzle) {
        return puzzle.grid;
      } else {
        return [[]];
      }
    },
    getPaths(state: GridState) {
      const puzzle = state.puzzle;
      if (puzzle) {
        return puzzle.paths;
      } else {
        return [];
      }
    },
    getPuzzle(state: GridState) {
      return state.puzzle;
    },
    getCandidate(state: GridState) {
      return state.candidate;
    },
    getFoundWords(state: GridState) {
      return state.found;
    },
    getBuildingPuzzle(state: GridState) {
      return state.building;
    },
    getErrored(state: GridState) {
      return state.errored;
    },
    getWon(state: GridState) {
      return state.won;
    },
    getStartedAt(state: GridState) {
      return state.startedAt;
    },
  },
  mutations: {
    setSeed(state: GridState, payload: number) {
      state.seed = payload;

      // Update central PRNG seed too
      Random.setSeed(state.seed);
    },
    buildingPuzzle(state: GridState) {
      state.building = true;
      state.errored = false;
    },
    setPuzzle(state: GridState, payload: Puzzle) {
      state.puzzle = payload;
      state.building = false;
      state.errored = false;
      state.startedAt = new Date();
      state.won = false;
      state.found = {};
      event('puzzle', 'new');
    },
    buildingFailed(state: GridState) {
      state.errored = true;
    },
    startPath(state: GridState) {
      state.pathing = true;
    },
    addToPath(state: GridState, payload: WordPathPosition) {
      state.candidate.push(payload);
    },
    removeFromPath(state: GridState) {
      state.candidate.pop();
    },
    closePath(state: GridState) {
      state.pathing = false;
      state.candidate = [];
    },
    foundWord(state: GridState, payload: WordPath) {
      const word = payload.map((p) => p.char).join('');
      Vue.set(state.found, word, payload);
      event('puzzle', 'found_word');

      const foundWords = Object.keys(state.found).length;
      const totalWords = state.puzzle!.words.length;
      if (foundWords === totalWords) {
        state.won = true;
        event('puzzle', 'finished');
      }
    },
  },
  actions: {
    async createWordSearch(context: GridContext, payload: PuzzleConfiguration): Promise<void> {
      commitBuildingPuzzle(context);
      commitSetSeed(context, payload.seed || +new Date());

      const MAX_ATTEMPTS = 5;
      const attempts = payload.attempts || 0;
      const failOrRetry = () => {
        if (attempts > MAX_ATTEMPTS) {
          commitBuildingFailed(context);
        } else {
          dispatchCreateWordSearch(context, {
            ...payload,
            attempts: attempts + 1,
          });
        }
      };

      const wordCount = payload.wordCount || 10;
      const wordlist = await new WordlistBuilder().get(wordCount);
      if (wordlist.error) {
        failOrRetry();
        return;
      }

      const width = payload.width || 12;
      const height = payload.height || 12;
      const puzzle = await new PuzzleBuilder(wordlist).build(width, height);
      if (!puzzle) {
        failOrRetry();
        return;
      }

      commitPuzzle(context, puzzle);
    },
    startPath(context: GridContext, payload: WordPathPosition) {
      commitStartPath(context);
      commitAddToPath(context, payload);
    },
    updatePath(context: GridContext, payload: WordPathPosition) {
      const state = context.state;
      const { x, y, char } = payload;

      if (state.pathing) {
        // FIXME: Not sure how this happens...
        if (!char) {
          return;
        }

        if (state.candidate.length > 1) {
          const prev = state.candidate[state.candidate.length - 2];
          const isPreviousPosition = prev.x === x && prev.y === y;
          if (isPreviousPosition) {
            commitRemoveFromPath(context);
            return;
          }
        }

        const last = state.candidate[state.candidate.length - 1];
        const isOutOfReach = Math.abs(last.x - x) > 1 || Math.abs(last.y - y) > 1;
        if (isOutOfReach) {
          return;
        }

        const inPath = some(state.candidate, (p) => p.x === x && p.y === y);
        if (inPath) {
          return;
        }

        commitAddToPath(context, payload);
      }
    },
    closePath(context: GridContext) {
      const state = context.state;
      const puzzle = state.puzzle;

      if (!puzzle) {
        return;
      }

      // This is the pedantic version, where users have to find the _exact_
      // placement of the word.
      //
      const checkCandidateRobust = (solution: WordPath, candidate: WordPath): boolean => {
        let found = true;
        for (let i = 0; i < solution.length; i++) {
          const sPos = solution[i];
          const cPos = candidate[i];

          if (sPos.x !== cPos.x || sPos.y !== cPos.y) {
            found = false;
            break;
          }
        }

        return found;
      };

      // This is slightly more generous version -- allow finding the word
      // _anywhere_, not just in the expected position.
      //
      const checkCandidateSimple = (solution: WordPath, candidate: WordPath): boolean => {
        // FIXME: Somehow the candidate is getting positions that don't have associated chars...
        try {
          return solution.map((p) => p.char.toLowerCase()).join() === candidate.map((p) => p.char.toLowerCase()).join();
        } catch (e) {
          return false;
        }
      };

      const foundPath = find(puzzle.paths, (solution: WordPath) => checkCandidateSimple(solution, state.candidate));
      if (foundPath) {
        commitFoundWord(context, state.candidate);
      }

      commitClosePath(context);
    },
  },
};

export default new Vuex.Store<GridState>(storeOptions);

const { commit, read, dispatch } = getStoreAccessors<GridState, GridState>('');
const getters = storeOptions.getters;
export const readBuildingPuzzle = read(getters.getBuildingPuzzle);
export const readCandidatePath = read(getters.getCandidate);
export const readErrored = read(getters.getErrored);
export const readFoundWords = read(getters.getFoundWords);
export const readLetterGrid = read(getters.getGrid);
export const readPuzzle = read(getters.getPuzzle);
export const readStartedAt = read(getters.getStartedAt);
export const readWon = read(getters.getWon);
export const readWordList = read(getters.getWords);
export const readWordPaths = read(getters.getPaths);

const mutations = storeOptions.mutations;
export const commitSetSeed = commit(mutations.setSeed);
export const commitBuildingPuzzle = commit(mutations.buildingPuzzle);
export const commitBuildingFailed = commit(mutations.buildingFailed);
export const commitPuzzle = commit(mutations.setPuzzle);
export const commitStartPath = commit(mutations.startPath);
export const commitAddToPath = commit(mutations.addToPath);
export const commitRemoveFromPath = commit(mutations.removeFromPath);
export const commitClosePath = commit(mutations.closePath);
export const commitFoundWord = commit(mutations.foundWord);

const actions = storeOptions.actions;
export const dispatchCreateWordSearch = dispatch(actions.createWordSearch);
export const dispatchStartPath = dispatch(actions.startPath);
export const dispatchUpdatePath = dispatch(actions.updatePath);
export const dispatchClosePath = dispatch(actions.closePath);
