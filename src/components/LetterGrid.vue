<template>
  <div class="letter-grid">
    <div class="letter-grid--header">
      <span v-for="position in path" :key="position.char">
        {{ position.char }}
      </span>
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
        <li v-for="(word, index) in words" :key="word + '-' + index">
          {{ word }}
          <word-path :path="paths[index]" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { readWordList, readLetterGrid, dispatchCreateWordSearch, readWordPaths, dispatchStartPath, dispatchUpdatePath, readCandidatePath, dispatchClosePath } from '@/store';
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
      const inPath = some(this.candidate, p => p.x == x && p.y == y);
      if (inPath) {
        return 'letter-grid--active';
      }
    }
  }
});
</script>

<style lang="scss" scoped>
.letter-grid {
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-template-rows: 50px auto;

  .letter-grid--header {
    grid-column: span 2;
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

    }

    .letter-grid--active {
      background-color: red;
    }
  }
}

</style>
