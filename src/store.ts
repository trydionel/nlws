import Vue from 'vue';
import Vuex, { ActionContext } from 'vuex';
import { getStoreAccessors } from 'vuex-typescript';

import { GridState, Puzzle, WordPathPosition, WordPath } from './types';
import { WordlistBuilder } from '@/api/wordlistBuilder';
import { PuzzleBuilder } from '@/api/puzzleBuilder';

import find from 'lodash/find';
import some from 'lodash/some';

Vue.use(Vuex);

type GridContext = ActionContext<GridState, GridState>;

const storeOptions = {
  state: {
    puzzle: null,
    candidate: [],
    found: {},
    pathing: false,
    errored: false,
    building: false,
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
  },
  mutations: {
    buildingPuzzle(state: GridState) {
      state.building = true;
      state.errored = false;
    },
    setPuzzle(state: GridState, payload: Puzzle) {
      state.puzzle = payload;
      state.building = false;
      state.errored = false;
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
    },
  },
  actions: {
    async createWordSearch(context: GridContext): Promise<void> {
      commitBuildingPuzzle(context);

      const words = await new WordlistBuilder().get(10);
      const puzzle = new PuzzleBuilder(words).build();

      if (puzzle) {
        commitPuzzle(context, puzzle);
      } else {
        commitBuildingFailed(context);
      }
    },
    startPath(context: GridContext, payload: WordPathPosition) {
      commitStartPath(context);
      commitAddToPath(context, payload);
    },
    updatePath(context: GridContext, payload: WordPathPosition) {
      const state = context.state;
      const { x, y, char } = payload;

      if (state.pathing) {
        if (state.candidate.length > 1) {
          const prev = state.candidate[state.candidate.length - 2];
          const isPreviousPosition = prev.x === x && prev.y === y;
          if (isPreviousPosition) {
            commitRemoveFromPath(context);
            return;
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
        return solution.map((p) => p.char.toLowerCase()).join() === candidate.map((p) => p.char.toLowerCase()).join();
      };

      const foundPath = find(puzzle.paths, (solution: WordPath) => checkCandidateSimple(solution, state.candidate));
      if (foundPath) {
        commitFoundWord(context, foundPath);
      }

      commitClosePath(context);
    },
  },
};

export default new Vuex.Store<GridState>(storeOptions);

const { commit, read, dispatch } = getStoreAccessors<GridState, GridState>('');
const getters = storeOptions.getters;
export const readWordList = read(getters.getWords);
export const readLetterGrid = read(getters.getGrid);
export const readWordPaths = read(getters.getPaths);
export const readCandidatePath = read(getters.getCandidate);
export const readFoundWords = read(getters.getFoundWords);
export const readBuildingPuzzle = read(getters.getBuildingPuzzle);
export const readErrored = read(getters.getErrored);

const mutations = storeOptions.mutations;
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
