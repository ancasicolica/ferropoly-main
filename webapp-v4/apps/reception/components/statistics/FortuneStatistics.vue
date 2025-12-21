<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 20.12.2025
-->

<template>
  <div class="flex w-full gap-2">
    <FortuneList
        class="w-1/4"
        style="min-width: 400px"
    />
    <FortuneGraph
        class="w-3/4"
    />
  </div>
</template>

<script setup>

import FortuneList from './FortuneList.vue';
import FortuneGraph from './FortuneGraph.vue';
</script>

<style scoped lang="scss">

</style>
