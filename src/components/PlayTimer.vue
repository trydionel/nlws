<template>
  <div class="play-timer">
    <span>{{ minutes }}</span>
    <span>:</span>
    <span>{{ seconds }}</span>
  </div>
</template>

<script lang="ts">
export default {
  props: {
    startedAt: Date,
    live: Boolean,
  },
  data(): { __pid: number | null; duration: number } {
    return {
      __pid: null,
      duration: 0,
    };
  },
  beforeDestroy() {
    this.stop();
  },
  watch: {
    live: {
      handler(live) {
        if (live) {
          this.start();
        } else {
          this.stop();
        }
      },
      immediate: true,
    },
  },
  computed: {
    seconds(): string {
      const seconds = Math.floor((this.duration / 1000) % 60);
      return String(seconds).padStart(2, '0');
    },
    minutes(): number {
      return Math.floor((this.duration / 1000) / 60);
    },
  },
  methods: {
    start() {
      this.stop();
      this.__pid = window.setInterval(() => {
        this.duration = +new Date() - (+this.startedAt);
      }, 500);
    },
    stop() {
      if (this.__pid) {
        window.clearInterval(this.__pid);
      }
    },
  },
};
</script>

<style>

</style>
