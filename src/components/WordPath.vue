<template>
  <svg width="100" height="100">
    <path :d="svgPath"></path>
  </svg>
</template>

<script lang="ts">
import Vue from 'vue';
import { WordPath } from '@/types';

export default Vue.extend({
  props: {
    path: Array
  },
  computed: {
    svgPath(): string {
      const path = this.path as WordPath;
      const svgPath = ['M50,50'];

      // First theta isn't useful
      for (let i = 1; i < path.length; i++) {
        const position = path[i];
        const angle = position.angle!;
        const dx = Math.round(Math.cos(angle));
        const dy = Math.round(Math.sin(angle));
        const size = 20;
        svgPath.push(`l${size * dx},${size * dy}`);
      }

      return svgPath.join(' ');
    }
  }
})
</script>

<style lang="scss" scoped>
svg {
  path {
    fill: transparent;
    stroke: black;
  }
}

</style>
