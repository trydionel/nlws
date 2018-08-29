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
import { readWordList, readLetterGrid, dispatchCreateWordSearch, readWordPaths } from '@/store';
import { Store } from 'vuex';
import { GridState, WordList, LetterGrid, WordPath, WordPathPosition } from '@/types';
import WordPathComponent from './WordPath.vue';
import some from 'lodash/some';
import find from 'lodash/find';

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
    }
  },
  mounted() {
    dispatchCreateWordSearch(this.$store);
  },
  methods: {
    startPath(char: string, x: number, y: number) {
      console.log('startPath', char, x, y);

      this.pathing = true;
      this.path.push({ x, y, char });
    },
    updatePath(char: string, x: number, y: number) {
      if (this.pathing) {
        console.log('appendToPath', char, x, y);

        if (this.path.length > 1) {
          const prev = this.path[this.path.length - 2];
          const isPreviousPosition = prev.x == x && prev.y == y;
          if (isPreviousPosition) {
            this.path.pop();
            return;
          }

          const last = this.path[this.path.length - 1];
          const isOutOfReach = Math.abs(last.x - x) > 1 || Math.abs(last.y - y) > 1;
          if (isOutOfReach) {
            return;
          }

          const inPath = some(this.path, p => p.x == x && p.y == y);
          if (inPath) {
            return;
          }
        }

        this.path.push({ x, y, char });
      }
    },
    closePath() {
      console.log('closePath', this.path);

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
        return solution.map(p => p.char).join() === candidate.map(p => p.char).join();
      };

      const foundPath = find(this.paths, solution => checkCandidateSimple(solution, this.path));
      if (foundPath) {
        console.log('found', foundPath);
      }

      this.pathing = false;
      this.path = [];
    },
    cellClass(x: number, y: number): string | undefined {
      if (this.pathing) {
        const inPath = some(this.path, p => p.x == x && p.y == y);
        if (inPath) {
          return 'letter-grid--active';
        }
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
