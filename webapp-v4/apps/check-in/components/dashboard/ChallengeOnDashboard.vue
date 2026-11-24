<!---
  Challenge oin
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.11.2026
-->

<template>
  <div>
    <div v-if="challengesStore.challengeActive" class="shadow-md p-4 rounded-lg bg-white max-w-md">
      <h3>Challenges</h3>
      <a href="#challenges">Es gibt aktuell mindestens eine Challenge!</a>
    </div>

  </div>
</template>

<script setup>

import {useChallengesStore} from '../../../../common/store/challengesStore';

const challengesStore = useChallengesStore();
</script>

<style scoped lang="scss">

</style>
