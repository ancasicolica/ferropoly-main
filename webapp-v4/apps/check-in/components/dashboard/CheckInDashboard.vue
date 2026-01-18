<!---
  The Check-in Dashboard
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 16.01.2026
-->

<template>
  <div>
    <h1> {{ teamName }}</h1>
    <team-overview class="mb-2" />
    <current-gps class="mb-2" />
    <game-live-ticker />
  </div>
</template>

<script setup>

import {useCheckInStore} from '../../store/CheckInStore';
import {computed} from 'vue';
import TeamOverview from './TeamOverview.vue';
import CurrentGps from './CurrentGps.vue';
import GameLiveTicker from './GameLiveTicker.vue';

const checkInStore = useCheckInStore();

const teamName = computed(() => checkInStore.team.data.name);

</script>

<style scoped lang="scss">

</style>
