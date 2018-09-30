<template>
  <div class="game">
    <canvas class="game--canvas" :class="{ visible: won }" id="confetti-holder" />

    <div class="game--header">
      <span v-if="building">Building puzzle...</span>
      <span v-if="errored">Failed to build puzzle!</span>

      <transition-group name="pop" tag="div">
        <span v-for="(position, index) in candidate" :key="`candidate-${index}`" class="game--header-char">
          {{ position.char }}
        </span>
      </transition-group>
    </div>

    <div class="game--table" v-on="listeners" touch-action="none">
      <table>
        <tr v-for="(row, y) in grid" :key="'row-' + y">
          <td v-for="(letter, x) in row" :key="'col-' + x">
            <div class="game--letter"
              :class="cellClass(x, y)"
              :style="transitionDelay(x, y)">
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

      <play-timer class="game--timer" :started-at="startedAt" :live="!won" />
    </div>

    <a class="game--github" href="https://github.com/trydionel/nlws" title="View source on GitHub" target="_blank">
      <img alt="GitHub logo" src="../assets/GitHub-Mark-Light-64px.png">
    </a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import 'pepjs';

import {
  commitFoundWord,
  dispatchClosePath,
  dispatchCreateWordSearch,
  dispatchStartPath,
  dispatchUpdatePath,
  readBuildingPuzzle,
  readCandidatePath,
  readErrored,
  readFoundWords,
  readLetterGrid,
  readPuzzle,
  readStartedAt,
  readWon,
  readWordList,
  readWordPaths,
} from '@/store';
import { Store } from 'vuex';
import { GridState, WordList, LetterGrid, WordPath, WordPathPosition, Puzzle } from '@/game';
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
  tileSize: number;
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
      tileSize: 52
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
    },
    listeners(): object {
      return {
        pointerdown: this.startPath,
        pointermove: this.updatePath,
        pointerup: this.closePath,
        // touchdown: this.startPath,
        // touchmove: this.updatePath,
        // touchup: this.closePath,
      }
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
    eventToCoordinate(event: PointerEvent) {
      // Get indexed position (x, y) relative to top-left of game table
      //
      const tileSize = this.tileSize;
      const { offsetX, offsetY } = event;
      const x = Math.floor(offsetX / tileSize);
      const y = Math.floor(offsetY / tileSize);

      // Check that the cursor is within a circle of radius R around the
      // center of the tile at indexed position (x, y)
      //
      const tileX = x * tileSize;
      const tileY = y * tileSize;
      const centerX = tileX + 0.5 * tileSize;
      const centerY = tileY + 0.5 * tileSize;
      const distance = Math.sqrt(Math.pow(centerX - offsetX, 2) + Math.pow(centerY - offsetY, 2));

      if (distance < 0.5 * tileSize) {
        return { x, y };
      }
    },
    startPath(event: PointerEvent) {
      event.preventDefault();

      const coordinates = this.eventToCoordinate(event);
      if (coordinates) {
        const { x, y } = coordinates;
        const char = this.grid[y][x];
        dispatchStartPath(this.$store, { x, y, char });
      }
    },
    updatePath(event: PointerEvent) {
      event.preventDefault();

      const coordinates = this.eventToCoordinate(event);
      if (coordinates) {
        const { x, y } = coordinates;
        const char = this.grid[y][x];
        dispatchUpdatePath(this.$store, { x, y, char });
      }
    },
    closePath(event: PointerEvent) {
      event.preventDefault();

      dispatchClosePath(this.$store);
    },
    cellClass(x: number, y: number): string | undefined {
      const inPath = (path: WordPath) => some(path, p => p.x == x && p.y == y);
      const isFound = some(this.found, (path, foundWord) => inPath(path));

      if (isFound) {
        return 'game--found-char';
      }
    },
    transitionDelay(x: number, y: number): object | undefined {
      const inPath = (path: WordPath) => some(path, p => p.x == x && p.y == y);
      const foundWord = find(this.found, (path, foundWord) => inPath(path));
      const index = findIndex(foundWord, (p) => p.x == x && p.y == y);

      if (foundWord) {
        return {
          animationDelay: `${index * 50}ms`
        }
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
      // Determine puzzle size based on UA dimensions. Work around Cypress' handling of pixel ratio.
      //
      const pixelRatio = 1;
      const maxCells = (size: number) => Math.min(Math.floor((size - 40) / this.tileSize), 12); // upper cap at 12x12
      const width = maxCells(window.innerWidth / pixelRatio);
      const height = maxCells(window.innerHeight / pixelRatio - 200); // 200px buffer for header and word list
      const wordCount = 3 + Math.floor(width * height / 15);

      dispatchCreateWordSearch(this.$store, {
        seed: this.seed,
        width,
        height,
        wordCount
      });
    }
  },
});
</script>

<style lang="scss" scoped>
.game {
  font-family: 'Nunito', sans-serif;
  font-size: 24px;
  padding: 20px;

  display: grid;
  grid-gap: 20px;
  grid-template-areas:
    "header"
    "table"
    "sidebar";
  justify-content: center;

  @media screen and (min-width: 900px) {
    grid-template-areas:
      "header header"
      "table sidebar";
  }

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
    grid-area: header;
    text-align: center;
    align-content: center;
    color: white;
    line-height: 30px;
    height: 30px;

    @media screen and (min-width: 900px) {
      line-height: 100px;
      height: 100px;
    }

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
    position: relative;

    table {
      user-select: none;
      border-radius: 4px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25), 0 3px 6px rgba(0, 0, 0, 0.12);
      background-color: white;
      touch-action: none;
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

    table, tr, th, td, .game--letter {
      pointer-events: none;
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
    display: grid;
    grid-auto-rows: min-content min-content auto;
    grid-template-areas:
      "topic words"
      "progress words"
      "timer words";

    @media screen and (min-width: 900px) {
      grid-template-areas:
        "topic"
        "progress"
        "words"
        "timer";
    }

    .game--topic {
      grid-area: topic;
      margin: 0;
      letter-spacing: 0.5px;
      line-height: 1;
    }

    .game--progress {
      grid-area: progress;
      margin: 0;
      margin-bottom: 1em;
      font-size: 0.85rem;
    }

    ul {
      grid-area: words;
      list-style-type: none;
      padding: 0;
      margin: 0;

      column-count: 2;
      @media screen and (min-width: 900px) {
        column-count: 1;
      }
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

    .game--timer {
      grid-area: timer;
      align-self: end;
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
