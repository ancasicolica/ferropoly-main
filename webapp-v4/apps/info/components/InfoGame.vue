<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 25.10.2025
-->

<template>
  <!-- Container uses flexbox for responsive layout -->
  <!-- On mobile: blocks stack vertically (flex-wrap default behavior) -->
  <!-- On md and larger: blocks appear side by side -->
  <div class="flex flex-wrap">
    <div class="basis-full md:basis-1/2">
      <game-info />
      <pricelist-info />
    </div>
    <div class="basis-full md:basis-1/2">
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
