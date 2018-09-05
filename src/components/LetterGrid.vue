<template>
  <div class="letter-grid">
    <canvas class="letter-grid--canvas" :class="{ visible: won }" id="confetti-holder" />

    <div class="letter-grid--header">
      <span v-if="building">Building puzzle...</span>
      <span v-if="errored">Failed to build puzzle!</span>

      <transition-group name="pop" tag="div">
        <span v-for="position in candidate" :key="position.char" class="letter-grid--header-char">
          {{ position.char }}
        </span>
      </transition-group>
    </div>

    <div class="letter-grid--table">
      <table>
        <tr v-for="(row, y) in grid" :key="'row-' + y">
          <td v-for="(letter, x) in row" :key="'col-' + x">
            <div class="letter-grid--letter"
              :class="cellClass(x, y)"
              @mousedown="startPath(letter, x, y)"
              @mouseover="updatePath(letter, x, y)"
              @mouseup="closePath()">
              {{ letter }}
            </div>
          </td>
        </tr>
      </table>

      <div class="letter-grid--paths">
        <path-visualization
          v-for="(path, index) in found"
          :key="`path-${index}`"
          :path="path" />
        <path-visualization :path="candidate" />
      </div>
    </div>

    <div class="letter-grid--list">
      <h3 v-if="words.length > 0">Word list</h3>
      <ul>
        <li v-for="(word, index) in words" :key="word + '-' + index" :class="listClass(word)">
          {{ word }}
        </li>
      </ul>

      <button v-if="won" @click="newPuzzle">
        Play again
      </button>
    </div>

    <a class="letter-grid--github" href="https://github.com/trydionel/nlws" title="View source on GitHub" target="_blank">
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
} from '@/store';
import { Store } from 'vuex';
import { GridState, WordList, LetterGrid, WordPath, WordPathPosition } from '@/types';
import PathVisualization from './PathVisualization.vue';
import some from 'lodash/some';

declare var ConfettiGenerator: any;
import 'confetti-js';

interface ComponentData {
  pathing: boolean;
  path: WordPath;
  confetti: any;
}

export default Vue.extend({
  components: {
    PathVisualization,
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
    building(): boolean {
      return readBuildingPuzzle(this.$store);
    },
    errored(): boolean {
      return readErrored(this.$store);
    },
    won(): boolean {
      return readWon(this.$store);
    }
  },
  mounted() {
    this.confetti = new ConfettiGenerator({
      target: 'confetti-holder',
      max: 200
    });

    this.newPuzzle();
  },
  watch: {
    won: {
      handler() {
        if (this.won) {
          this.confetti.render();
        } else {
          this.confetti.clear();
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
        return 'letter-grid--found-char';
      }
    },
    listClass(word: string): string | undefined {
      const found = some(this.found, (path, foundWord) => foundWord.toLowerCase() === word.toLowerCase());
      if (found) {
        return 'letter-grid--found-word';
      }
    },
    newPuzzle(): void {
      dispatchCreateWordSearch(this.$store);
    }
  },
});
</script>

<style lang="scss" scoped>
.letter-grid {
  font-family: 'Nunito', sans-serif;
  font-size: 24px;

  display: grid;
  grid-template-columns: [main-start] 1fr [table-start] 3fr [table-end sidebar-start ]1fr [sidebar-end] 1fr [main-end];
  grid-template-rows: 100px auto;
  grid-gap: 0 20px;

  .letter-grid--canvas {
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

  .letter-grid--header {
    grid-column: main-start / main-end;
    text-align: center;
    align-content: center;
    color: white;
    line-height: 100px;

    .letter-grid--header-char {
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

  .letter-grid--table {
    grid-area: table;
    user-select: none;
    margin: 0 auto;
    position: relative;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25), 0 3px 6px rgba(0, 0, 0, 0.12);

    table {
      border-collapse: collapse;
      text-align: center;
    }

    /deep/ svg {
      position: absolute;
      top: 0;
      z-index: 10;
    }

    .letter-grid--letter {
      $area: 50px;
      $hit: 20px;

      padding: ($area - $hit) / 2;
      width: $hit;
      height: $hit;
      line-height: $hit;
      border-radius: 100%;
    }
  }

  .letter-grid--found-char {
    animation: jitter 350ms linear;
  }

  .letter-grid--found-word {
    text-decoration: line-through;
  }

  .letter-grid--list {
    grid-area: sidebar;
    color: white;
    text-shadow: 0 1px rgba(0, 0, 0, 0.25);

    h3 {
      margin-top: 10px;
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

  .letter-grid--github {
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
