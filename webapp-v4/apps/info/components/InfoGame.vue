<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <!-- Container uses flexbox for responsive layout -->
  <!-- On mobile: blocks stack vertically (flex-wrap default behavior) -->
  <!-- On md and larger: blocks appear side by side -->
  <div class="flex flex-wrap">
    <div class="basis-full md:basis-1/2 md:pr-1">
      <game-info />
      <pricelist-info class="mt-4 mb-4" />
    </div>
    <div class="basis-full md:basis-1/2 md:pl-1">
      <registered-teams />
    </div>
  </div>
</template>

<script setup>
import GameInfo from './game/GameInfo.vue';
import PricelistInfo from './game/PricelistInfo.vue';
import RegisteredTeams from './game/RegisteredTeams.vue';

</script>

<style scoped lang="scss">

</style>
