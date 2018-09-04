<template>
  <div class="letter-grid">
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
      <ul>
        <li v-for="(word, index) in words" :key="word + '-' + index" :class="listClass(word)">
          {{ word }}
          <!-- <path-visualization :path="paths[index]" /> -->
        </li>
      </ul>
    </div>
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
} from '@/store';
import { Store } from 'vuex';
import { GridState, WordList, LetterGrid, WordPath, WordPathPosition } from '@/types';
import PathVisualization from './PathVisualization.vue';
import some from 'lodash/some';

interface ComponentData {
  pathing: boolean;
  path: WordPath;
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
  },
  mounted() {
    dispatchCreateWordSearch(this.$store);
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
    listClass(word: string): string | undefined {
      const found = some(this.found, (path, foundWord) => foundWord === word);
      if (found) {
        return 'letter-grid--found';
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.letter-grid {
  font-family: 'Nunito', sans-serif;
  font-size: 24px;

  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 50px auto;

  .letter-grid--header {
    grid-column: span 2;

    .letter-grid--header-char {
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
    user-select: none;
    margin: 0 auto;
    position: relative;

    table {
      border-collapse: collapse;
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

  .letter-grid--active {
    // background-color: red;
  }

  .letter-grid--found {
    background-color: green;
    color: white;
  }
}

</style>
