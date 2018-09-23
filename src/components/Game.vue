<template>
  <div class="game">
    <canvas class="game--canvas" :class="{ visible: won }" id="confetti-holder" />

    <div class="game--header">
      <span v-if="building">Building puzzle...</span>
      <span v-if="errored">Failed to build puzzle!</span>

      <transition-group name="pop" tag="div">
        <span v-for="position in candidate" :key="position.char" class="game--header-char">
          {{ position.char }}
        </span>
      </transition-group>
    </div>

    <div class="game--table">
      <table>
        <tr v-for="(row, y) in grid" :key="'row-' + y">
          <td v-for="(letter, x) in row" :key="'col-' + x">
            <div class="game--letter"
              :class="cellClass(x, y)"
              @mousedown="startPath(letter, x, y)"
              @mouseover="updatePath(letter, x, y)"
              @mouseup="closePath()">
              {{ letter }}
            </div>
          </td>
        </tr>
      </table>

      <div class="game--paths">
        <path-visualization
          v-for="(path, index) in found"
          :key="`path-${index}`"
          :path="path" />
        <path-visualization
          :path="candidate"
          v-if="candidate.length > 0" />
      </div>
    </div>

    <div class="game--list" v-if="words.length > 0">
      <h3 class="game--topic">{{ puzzle.topic }}</h3>
      <p class="game--progress">{{ totalFound }} / {{ words.length }} found</p>
      <ul>
        <li
          v-for="(word, index) in words"
          :key="word + '-' + index"
          :class="listClass(word)">
          {{ word }}
        </li>
      </ul>

      <button v-if="won" @click="newPuzzle">
        Play again
      </button>

      <play-timer :started-at="startedAt" :live="!won" />
    </div>

    <a class="game--github" href="https://github.com/trydionel/nlws" title="View source on GitHub" target="_blank">
      <img alt="GitHub logo" src="../assets/GitHub-Mark-Light-64px.png">
    </a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  dispatchClosePath,
  dispatchCreateWordSearch,
  dispatchStartPath,
  dispatchUpdatePath,
  readBuildingPuzzle,
  readCandidatePath,
  readErrored,
  readFoundWords,
  readLetterGrid,
  readWordList,
  readWordPaths,
  readWon,
  readPuzzle,
  readStartedAt,
commitFoundWord,
} from '@/store';
import { Store } from 'vuex';
import { GridState, WordList, LetterGrid, WordPath, WordPathPosition, Puzzle } from '@/types';
import PathVisualization from './PathVisualization.vue';
import PlayTimer from './PlayTimer.vue';
import some from 'lodash/some';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';

declare var ConfettiGenerator: any;
import 'confetti-js';

interface ComponentData {
  pathing: boolean;
  path: WordPath;
  confetti: any;
}

export default Vue.extend({
  name: 'Game',
  components: {
    PathVisualization,
    PlayTimer
  },
  props: {
    seed: {
      type: Number,
      required: false
    }
  },
  filters: {
    json(input: any) {
      return JSON.stringify(input);
    },
  },
  data(): ComponentData {
    return {
      pathing: false,
      path: [],
      confetti: null,
    };
  },
  computed: {
    puzzle(): Puzzle | null {
      return readPuzzle(this.$store);
    },
    words(): WordList {
      return readWordList(this.$store);
    },
    grid(): LetterGrid {
      return readLetterGrid(this.$store);
    },
    paths(): WordPath[] {
      return readWordPaths(this.$store);
    },
    candidate(): WordPath {
      return readCandidatePath(this.$store);
    },
    found(): { [key: string]: WordPath } {
      return readFoundWords(this.$store);
    },
    totalFound(): number {
      return Object.keys(this.found).length;
    },
    building(): boolean {
      return readBuildingPuzzle(this.$store);
    },
    errored(): boolean {
      return readErrored(this.$store);
    },
    won(): boolean {
      return readWon(this.$store);
    },
    candidateWord(): string {
      return this.candidate && this.candidate.map(p => p.char).join('');
    },
    startedAt(): Date {
      return readStartedAt(this.$store);
    }
  },
  mounted() {
    this.newPuzzle();
  },
  watch: {
    won: {
      handler() {
        if (this.won) {
          this.confetti = new ConfettiGenerator({
            target: 'confetti-holder',
            max: 200
          });
          this.confetti.render();
        } else {
          if (this.confetti) {
            this.confetti.clear();
          }
        }
      }
    }
  },
  methods: {
    startPath(char: string, x: number, y: number) {
      dispatchStartPath(this.$store, { x, y, char });
    },
    updatePath(char: string, x: number, y: number) {
      dispatchUpdatePath(this.$store, { x, y, char });
    },
    closePath() {
      dispatchClosePath(this.$store);
    },
    cellClass(x: number, y: number): string | undefined {
      const inPath = (path: WordPath) => some(path, p => p.x == x && p.y == y);
      const isFound = some(this.found, (path, foundWord) => inPath(path));

      if (isFound) {
        return 'game--found-char';
      }
    },
    listClass(word: string): string[] {
      const classes = [
        'game--word'
      ];
      const found = some(this.found, (path, foundWord) => foundWord.toLowerCase() === word.toLowerCase());
      if (found) {
        classes.push('game--found-word');
      }

      return classes;
    },
    newPuzzle(): void {
      dispatchCreateWordSearch(this.$store, { seed: this.seed });
    }
  },
});
</script>

<style lang="scss" scoped>
.game {
  font-family: 'Nunito', sans-serif;
  font-size: 24px;

  display: grid;
  grid-template-columns: [main-start] 2fr [table-start] 624px [table-end sidebar-start] 1fr [sidebar-end] 1fr [main-end];
  grid-template-rows: 100px auto;
  grid-gap: 0 20px;

  .game--canvas {
    position: absolute;
    z-index: -1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    transition: opacity 500ms ease-in-out;
    opacity: 0.1;
    &.visible { opacity: 1; }
  }

  .game--header {
    grid-column: main-start / main-end;
    text-align: center;
    align-content: center;
    color: white;
    line-height: 100px;

    .game--header-char {
      font-size: 2.4rem;
      display: inline-block;
    }

    .pop-enter-active, .pop-leave-active {
      transition: all 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .pop-enter-to, .pop-leave {
      transform: rotateZ(0deg);
    }

    .pop-enter, .pop-leave-to {
      opacity: 0;
      transform: rotateZ(-30deg);
    }
  }

  .game--table {
    grid-area: table;
    user-select: none;
    margin: 0 auto;
    position: relative;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25), 0 3px 6px rgba(0, 0, 0, 0.12);
    margin-bottom: 100px;

    table {
      border-collapse: collapse;
      text-align: center;
    }

    /deep/ svg {
      position: absolute;
      top: 0;
      z-index: 10;
    }

    .game--letter {
      $area: 50px;
      $hit: 20px;

      padding: ($area - $hit) / 2;
      width: $hit;
      height: $hit;
      line-height: $hit;
      border-radius: 100%;
    }
  }

  .game--found-char {
    animation: jitter 350ms linear;
  }

  .game--found-word {
    text-decoration: line-through;
    opacity: 0.66;
  }

  .game--list {
    grid-area: sidebar;
    color: white;
    text-shadow: 0 1px rgba(0, 0, 0, 0.25);

    .game--topic {
      margin-top: 10px;
      margin-bottom: 0;
      letter-spacing: 0.5px;
    }

    .game--progress {
      margin: 0;
      margin-bottom: 1em;
      font-size: 0.85rem;
    }

    ul {
      list-style-type: none;
      padding: 0;
      margin: 0 0 2em;
    }

    button {
      padding: 8px 20px;
      background-color: transparent;
      color: white;
      border: 2px solid white;
      border-radius: 4px;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-weight: 500;
      font-size: 16px;

      &:focus { outline: none; }
      &:hover { background-color: rgba(255, 255, 255, 0.1); }
      &:active { background-color: rgba(255, 255, 255, 0.2); }
    }
  }

  .game--github {
    position: fixed;
    bottom: 0px;
    right: 6px;

    transition: opacity 200ms ease-in-out;
    opacity: 0.25;
    &:hover { opacity: 1.0; }

    img {
      width: 32px;
      height: 32px;
    }
  }
}

@keyframes jitter {
  0% { transform: scale(1.0) rotateZ(0deg); }
  20% { transform: scale(1.1) rotateZ(-15deg); }
  40% { transform: scale(1.2) rotateZ(15deg); }
  60% { transform: scale(1.2) rotateZ(-15deg); }
  80% { transform: scale(1.1) rotateZ(15deg); }
  100% { transform: scale(1.0) rotateZ(0deg); }
}

</style>
