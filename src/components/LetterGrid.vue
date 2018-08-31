<template>
  <div class="letter-grid">
    <div class="letter-grid--header">
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
    </div>

    <div class="letter-grid--list">
      <ul>
        <li v-for="(word, index) in words" :key="word + '-' + index" :class="listClass(word)">
          {{ word }}
          <word-path :path="paths[index]" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { readWordList, readLetterGrid, dispatchCreateWordSearch, readWordPaths, dispatchStartPath, dispatchUpdatePath, readCandidatePath, dispatchClosePath, readFoundWords } from '@/store';
import { Store } from 'vuex';
import { GridState, WordList, LetterGrid, WordPath, WordPathPosition } from '@/types';
import WordPathComponent from './WordPath.vue';
import some from 'lodash/some';

interface ComponentData {
  pathing: boolean;
  path: WordPath;
}

export default Vue.extend({
  components: {
    WordPath: WordPathComponent
  },
  filters: {
    json(input: any) {
      return JSON.stringify(input);
    }
  },
  data(): ComponentData {
    return {
      pathing: false,
      path: []
    }
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
    }
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
    cellClass(x: number, y: number): string | undefined {
      const inPath = (path: WordPath) => some(path, p => p.x == x && p.y == y);
      const isFound = some(this.found, (path, foundWord) => inPath(path));

      if (inPath(this.candidate)) {
        return 'letter-grid--active';
      } else if (isFound) {
        return 'letter-grid--found';
      }
    },
    listClass(word: string): string | undefined {
      const found = some(this.found, (path, foundWord) => foundWord == word);
      if (found) {
        return 'letter-grid--found'
      }
    }
  }
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
    background-color: red;
  }

  .letter-grid--found {
    background-color: green;
    color: white;
  }
}

</style>
