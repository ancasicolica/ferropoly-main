<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 10.01.2026
-->

<template>
  <div>
    <FerroCard
        title="Letzte Aktivitäten"
        condensed
    >
      <game-log />
    </FerroCard>
  </div>
</template>

<script setup>

import FerroCard from '../../../../common/components/FerroCard.vue';
import GameLog from './GameLog.vue';
</script>

<style scoped lang="scss">

</style>
