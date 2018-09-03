<template>
  <svg :width="size" :height="size">
    <defs>
      <filter id="svg-stroke" filterUnits="userSpaceOnUse">
        <feFlood flood-color="red" result="COLOR-RED" />

        <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="EXTRUDE" />
        <feComposite operator="out" in="EXTRUDE" in2="SourceAlpha" result="CUT" />
        <feComposite operator="in" in="COLOR-RED" in2="CUT" result="RED-STROKE" />
      </filter>
    </defs>

    <g filter="url(#svg-stroke)">
      <rect
        v-for="(r, index) in svgRects"
        :key="`rect-${index}`"
        :x="r.x"
        :y="r.y"
        :width="r.width"
        :height="r.height"
        :transform="`translate(0 ${-0.5 * r.height}) rotate(${r.angle} ${r.x} ${r.y + 0.5 * r.height})`" />

      <circle
        v-for="(p, index) in path"
        :key="`circle-${index}`"
        :cx="cell * (p.x + 0.5)"
        :cy="cell * (p.y + 0.5)"
        :r="radius" />
    </g>

  </svg>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue';
import { WordPath } from '@/types';

export default Vue.extend({
  props: {
    path: <PropOptions<WordPath>> {
      type: Array,
      required: true
    }
  },
  data(): { width: number; radius: number; cell: number } {
    return {
      width: 0,
      radius: 16,
      cell: 52
    };
  },
  mounted() {
  },
  computed: {
    svgRects(): object[] {
      const path = this.path as WordPath;
      const size = this.cell as number;
      const radius = this.radius as number;
      const rects = [];
      let previous = path[0];

      for (let i = 1; i < path.length; i++) {
        const position = path[i];
        const x = size * (previous.x + 0.5);
        const y = size * (previous.y + 0.5);
        const dx = (position.x - previous.x);
        const dy = (position.y - previous.y);
        const angle = (180 / Math.PI) * Math.atan2(dy, dx);
        const width = (angle % 90 === 0) ? size : Math.sqrt(2) * size;
        const height = 2 * radius;

        rects.push({ x, y, width, height, angle });
        previous = position;
      }

      return rects;
    }
  },
})
</script>

<style lang="scss" scoped>
svg {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
