<template>
  <div class="container">
    <table>
      <tr v-for="y in range" :key="y">
        <td v-for="x in range" :key="`${y}-${x}`">
          A
        </td>
      </tr>
    </table>

    <path-visualization :path="path" />
  </div>
</template>

<script lang="ts">
import range from 'lodash/range';
import PathVisualization from '@/components/PathVisualization.vue';

export default {
  components: {
    PathVisualization,
  },
  data() {
    return {
      range: range(6),
      path: [
        { x: 2, y: 2, char: 'a' },
        { x: 3, y: 2, char: 'b' },
        { x: 4, y: 3, char: 'c' },
        { x: 4, y: 4, char: 'd' },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.container {
  position: relative;

  background-color: #eee;
  width: 326px;
  height: 326px;
  margin: 40px auto;
}

table {
  position: absolute;
  pointer-events: none;
  border-collapse: collapse;

  td {
    text-align: center;
    width: 50px;
    height: 50px;
    border: 1px solid #ddd;
  }
}
</style>
