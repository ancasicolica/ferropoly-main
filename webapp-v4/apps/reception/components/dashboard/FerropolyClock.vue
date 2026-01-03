<!---
  A clock for Ferropoly
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 31.12.2025
-->

<template>
  <div>
    <FerroCard
        title="Spieluhr"
        condensed
    >
      <h1 style="text-align: center;">{{ currentTime }}</h1>
      <div> Nächstes Ereignis: {{ nextType }}</div>
      <div>{{ nextTimeRelative }}: {{ nextTime }}</div>
    </FerroCard>
  </div>
</template>

<script setup>
import {DateTime} from 'luxon';
import {ref, onMounted, onBeforeUnmount, computed} from 'vue';
import FerroCard from '../../../../common/components/FerroCard.vue';
import {useCronJobStore} from '../../../../lib/store/CronJobStore';

const cronJobStore     = useCronJobStore();
const currentTime      = ref('');
const nextTimeRelative = ref('');
let intervalId         = null;

const formatTime = () => {
  const now = DateTime.now();
  return now.toLocaleString(DateTime.TIME_WITH_SECONDS);
};

const nextType           = computed(() => {
  const next = cronJobStore.getNextCronJob();
  if (next) {
    return next.type;
  }
  return '';
})
const formatTimeRelative = () => {
  const next = cronJobStore.getNextCronJob();
  if (next) {
    return next.timestamp.toRelative({style: 'long', unit: ['minutes', 'seconds']});
  }
  return '';
}

const nextTime = computed(() => {
  const next = cronJobStore.getNextCronJob();
  if (next) {
    console.log('next', next);
    return next.timestamp.toLocaleString(DateTime.TIME_SIMPLE);
  }
  return '';
})
onMounted(() => {
  currentTime.value = formatTime();
  intervalId        = setInterval(() => {
    currentTime.value      = formatTime();
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

</style>
