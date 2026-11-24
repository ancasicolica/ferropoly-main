<!---

  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 24.11.2026
-->

<template>
  <div>
    <h1>Challenges</h1>
    <div v-if="challengesStore.challenges.length === 0"> Aktuell gibt es keine Challenges, komm später wieder vorbei!
    </div>
    <div v-else>
      <check-in-challenge v-for="challenge in challengesStore.challenges" :challenge="challenge" :key="challenge._id" />
    </div>
  </div>
</template>

<script setup>

import {onMounted} from 'vue';
import {useChallengesStore} from '../../../../common/store/challengesStore';
import CheckInChallenge from './CheckInChallenge.vue';

const challengesStore = useChallengesStore();

onMounted(async () => {
  await challengesStore.fetchCurrentChallenges();
})
</script>

<style scoped lang="scss">

</style>
