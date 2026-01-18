<!---
  Live Ticker for teams
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 18.01.2026
-->

<template>
  <div>
    <h3>Live-Ticker</h3>
    <div v-if="nextCronJobType">
      <div class="time-stamp"> {{ nextTimeRelative }} </div>
      <div class="title"> {{ nextCronJobType }}</div>
    </div>

    <div
        v-for="entry in gameLogStore.currentEntries"
        :key="entry.id"
    >
      <div class="time-stamp"> {{ formatTimestampAsAgo(entry.timestamp) }}</div>
      <div class="title"> {{ entry.title }}</div>
      <div
          v-if="entry.message"
          class="message"
      >
        {{ entry.message }}
      </div>
    </div>
  </div>
</template>

<script setup>

import {useGameLogStore} from '../../../../lib/store/GameLogStore';
import {formatTimestampAsAgo} from '../../../../common/lib/formatters';
import {useCronJobStore} from '../../../../lib/store/CronJobStore';
import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import {cronjobTypeToText} from '../../../../lib/cronJob';

const gameLogStore = useGameLogStore();
const cronJobStore = useCronJobStore();
let intervalId         = null;
const nextTimeRelative = ref('');

const nextCronJobType           = computed(() => {
  const next = cronJobStore.getNextCronJob();
  if (next) {
    return cronjobTypeToText(next.type);
  }
  return null;
})

const formatTimeRelative = () => {
  const next = cronJobStore.getNextCronJob();
  if (next) {
    return next.timestamp.toRelative({style: 'long', unit: ['minutes', 'seconds']});
  }
  return '';
}

onMounted(() => {
  intervalId        = setInterval(() => {
    nextTimeRelative.value = formatTimeRelative();
  }, 1000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped lang="scss">
.time-stamp {
  font-weight: 900;
  width: 100%;
  background-color: lightgrey;
  text-align: center;
}
.title {
  margin-bottom: 10px;
}
.message {
  margin-bottom: 10px;
}
</style>
