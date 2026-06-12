<!---
  The statistics page
  Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
  Created: 08.11.2025
-->

<template>
  <div>
    <call-active-warning-banner />
    <StatisticsTabs />
  </div>

</template>

<script setup>

import CallActiveWarningBanner from '../CallActiveWarningBanner.vue';
import StatisticsTabs from '../../../../lib/components/statistics/StatisticsTabs.vue';
import {useReceptionStore} from '../../store/ReceptionStore';
import {onMounted} from 'vue';

const receptionStore = useReceptionStore();
onMounted(() => {
  receptionStore.setHelpUrl('https://www.ferropoly.ch/hilfe/ferropoly-spiel/3-0/reception/statistic/')
});
</script>

<style scoped lang="scss">

</style>
