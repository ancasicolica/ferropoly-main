<!---
  Round statistics, a request from Silvan
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 27.12.2025
-->

<template>
  <div class="flex w-full gap-4">
    <RoundStatisticsFilter class="w-62.5 shrink-0" />
    <RoundStatisticsGraph class="flex-1" />
  </div>
</template>

<script setup>
import RoundStatisticsFilter from './RoundStatisticFilter.vue';
import RoundStatisticsGraph from './RoundStatisticsGraph.vue';
</script>

<style scoped lang="scss">

</style>
