<template>
  <div class="home">
    <letter-grid />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import LetterGrid from '@/components/LetterGrid.vue';

export default Vue.extend({
  name: 'home',
  components: {
    LetterGrid,
  },
});
</script>
