import Vue from 'vue';
import Vuex, { ActionContext } from 'vuex';
import { getStoreAccessors } from "vuex-typescript";
import { GridState, Puzzle } from './types';
import { WordlistBuilder } from '@/api/wordlistBuilder';
import { GridBuilder } from '@/api/gridBuilder';

Vue.use(Vuex);

type GridContext = ActionContext<GridState, GridState>;

const storeOptions = {
  state: {
    puzzle: null
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
        return [[]]
      }
    },
    getPaths(state: GridState) {
      const puzzle = state.puzzle;
      if (puzzle) {
        return puzzle.paths;
      } else {
        return []
      }
    },
  },
  mutations: {
    setPuzzle(state: GridState, payload: Puzzle) {
      state.puzzle = payload;
    },
  },
  actions: {
    async createWordSearch(context: GridContext): Promise<void> {
      const words = new WordlistBuilder().get(10);
      const puzzle = new GridBuilder(words).build();

      if (puzzle) {
        commitPuzzle(context, puzzle);
      }
    }
  },
};

export default new Vuex.Store<GridState>(storeOptions);

const { commit, read, dispatch } = getStoreAccessors<GridState, GridState>('');
const getters = storeOptions.getters;
export const readWordList = read(getters.getWords);
export const readLetterGrid = read(getters.getGrid);
export const readWordPaths = read(getters.getPaths);

const mutations = storeOptions.mutations;
export const commitPuzzle = commit(mutations.setPuzzle);

const actions = storeOptions.actions;
export const dispatchCreateWordSearch = dispatch(actions.createWordSearch);